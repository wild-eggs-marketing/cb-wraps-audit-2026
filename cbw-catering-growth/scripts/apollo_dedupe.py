"""Shared duplicate guard for the prospecting engines.

Apollo's POST /contacts creates a NEW record every call - it does not upsert on email. The
per-store engines are run once per store, and neighbouring stores share cities, so the same
company (and the same person at it) surfaces in several runs. On 2026-07-29 that produced up
to ten identical records for one person, every one of them enrolled in CBW Cold Reintro:
activating that sequence would have sent one person ten copies of the same cold email.

Apollo is the only store that survives a container recycle, so it - not a local state file -
is the authority on who already exists. Call existing_emails() once at startup and check
before every create.
"""
import json
import os

import requests

BASE = "https://api.apollo.io/api/v1"


def _headers():
    return {"x-api-key": os.environ["APOLLO_API_KEY"], "Content-Type": "application/json"}


def existing_emails(max_pages=200):
    """Lower-cased set of every email already attached to a contact in this Apollo account."""
    out = set()
    for page in range(1, max_pages + 1):
        r = requests.post(f"{BASE}/contacts/search", headers=_headers(),
                          json={"per_page": 100, "page": page}, timeout=60)
        if r.status_code != 200:
            break
        got = r.json().get("contacts") or []
        if not got:
            break
        for c in got:
            e = (c.get("email") or "").strip().lower()
            if e:
                out.add(e)
        if len(got) < 100:
            break
    return out


def existing_org_tokensets(tokens_fn, max_pages=200):
    """Token sets for every organization we already hold a contact at.

    Feed these into an engine's "already covered" check so a company that a previous run
    already prospected is skipped before it costs a search and a reveal.
    """
    out = []
    for page in range(1, max_pages + 1):
        r = requests.post(f"{BASE}/contacts/search", headers=_headers(),
                          json={"per_page": 100, "page": page}, timeout=60)
        if r.status_code != 200:
            break
        got = r.json().get("contacts") or []
        if not got:
            break
        for c in got:
            name = ((c.get("organization") or {}).get("name")
                    or c.get("organization_name") or "")
            t = tokens_fn(name)
            if t:
                out.append(t)
        if len(got) < 100:
            break
    return out
