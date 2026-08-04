"""Shared duplicate guard for the prospecting engines.

Apollo's POST /contacts creates a NEW record every call - it does not upsert on email. The
per-store engines are run once per store, and neighbouring stores share cities, so the same
company (and the same person at it) surfaces in several runs. On 2026-07-29 that produced up
to ten identical records for one person, every one of them enrolled in CBW Cold Reintro:
activating that sequence would have sent one person ten copies of the same cold email.

Apollo is the only store that survives a container recycle, so it - not a local state file -
is the authority on who already exists. Call existing_emails() once at startup and check
before every create.

READ THE WHOLE ACCOUNT OR THE GUARD IS WORSE THAN USELESS. contacts/search paging is
unstable: it returns short pages in the middle of a run and shuffles records between pages
between calls. An earlier version stopped at the first page shorter than per_page, silently
truncated the known-email set, and let a contact created on 07-31 be created again on 08-04.
all_contacts() therefore repeats full passes and unions the results until it has as many
unique ids as pagination.total_entries claims, rather than trusting any single pass.
"""
import json
import os
import time

import requests

BASE = "https://api.apollo.io/api/v1"
PER_PAGE = 100


def _headers():
    return {"x-api-key": os.environ["APOLLO_API_KEY"], "Content-Type": "application/json"}


CACHE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".contact-cache.json")
CACHE_TTL = int(os.environ.get("CONTACT_CACHE_TTL", "900"))   # seconds


def all_contacts(max_passes=4, hard_page_cap=200, use_cache=True):
    """Every contact in the account, keyed by id. Union of repeated passes until complete.

    contacts/search is ALSO capped at 400 calls/hour, and a full read costs one call per page
    (~11 today). Several readers each doing their own full read will exhaust the window and
    then return nothing, so results are cached briefly on disk and shared. A 429 is retried
    with backoff, never treated as a completed read - returning a short set silently is what
    creates duplicates.
    """
    if use_cache and os.path.exists(CACHE_PATH):
        try:
            blob = json.load(open(CACHE_PATH))
            if time.time() - blob["at"] < CACHE_TTL:
                return {c["id"]: c for c in blob["contacts"]}, blob["expected"]
        except (ValueError, KeyError, OSError):
            pass

    union, expected = {}, None
    for _ in range(max_passes):
        page = 1
        while page <= hard_page_cap:
            try:
                r = requests.post(f"{BASE}/contacts/search", headers=_headers(),
                                  json={"per_page": PER_PAGE, "page": page}, timeout=90)
            except requests.exceptions.RequestException:
                time.sleep(3)
                continue
            if r.status_code == 429:
                time.sleep(60)
                continue                      # retry the SAME page; do not advance or bail
            if r.status_code != 200:
                break
            body = r.json()
            got = body.get("contacts") or []
            pag = body.get("pagination") or {}
            if expected is None:
                expected = pag.get("total_entries")
            for c in got:
                union[c["id"]] = c
            # Do NOT break on a short page - only on an empty one or the reported last page.
            if not got or page >= (pag.get("total_pages") or 1):
                break
            page += 1
        if expected and len(union) >= expected:
            break
        time.sleep(1)

    if expected and len(union) >= expected:
        try:
            json.dump({"at": time.time(), "expected": expected,
                       "contacts": list(union.values())}, open(CACHE_PATH, "w"))
        except OSError:
            pass
    return union, expected


class IncompleteContactRead(RuntimeError):
    """Raised when the contact base could not be read in full."""


def existing_emails():
    """Lower-cased set of every email already attached to a contact in this Apollo account.

    FAILS CLOSED. A warning is not enough: the previous version printed a warning nobody read
    and the run carried on to create duplicates. If the account cannot be read in full, the
    caller must not create contacts, because it cannot know what already exists.
    """
    union, expected = all_contacts()
    if expected and len(union) < expected:
        raise IncompleteContactRead(
            f"read {len(union)} of {expected} contacts - refusing to create contacts against an "
            f"incomplete dedupe base (this is how the 07-31/08-04 duplicate happened)")
    return {(c.get("email") or "").strip().lower()
            for c in union.values() if c.get("email")}


def existing_org_tokensets(tokens_fn):
    """Token sets for every organization we already hold a contact at.

    Feed these into an engine's "already covered" check so a company that a previous run
    already prospected is skipped before it costs a search and a reveal.
    """
    union, _ = all_contacts()
    out = []
    for c in union.values():
        name = ((c.get("organization") or {}).get("name")
                or c.get("organization_name") or "")
        t = tokens_fn(name)
        if t:
            out.append(t)
    return out
