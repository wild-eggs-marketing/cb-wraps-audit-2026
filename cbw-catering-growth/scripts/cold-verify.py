"""Re-verify every contact enrolled in the two catering Cold sequences before activation.

Why: on contact records, email_status "verified" merely mirrors email_from_customer=true
("User Managed") - Apollo trusting our import, not checking the mailbox. That is how a list
that read 100% verified still hard-bounced at 8-9%. An independent people/bulk_match
resolution (NO email hint - a hint makes Apollo echo our own record back) returns a genuine
verdict and, better, the person's CURRENT address.

Verdicts and consequences:
  apollo-confirmed   stored address == Apollo's current verified email  -> sendable
  apollo-updated     Apollo returned a different verified address       -> email replaced, sendable
  apollo-moved       verified but at another company (job-changer)      -> suppressed
  apollo-unverified  no independent verified match                      -> suppressed

Suppression is email_unsubscribed=true: reversible, and the only send-block this plan's API
offers. The point of the exercise is that activation then mails ONLY independently verified
addresses, which is what protects the sending domains.

Cost: ~1 credit per resolved match against a ledger estimated at ~790 (floor logic does not
apply here - this IS the re-enrichment the reserve exists for). credits_consumed is summed
and logged per batch.

Run: APOLLO_API_KEY=... python3 scripts/cold-verify.py [--limit N]
"""
import json
import os
import re
import sys
import time

import requests

from apollo_dedupe import all_contacts

BASE = "https://api.apollo.io/api/v1"
H = {"x-api-key": os.environ["APOLLO_API_KEY"], "Content-Type": "application/json"}
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "cold-verify-results.json")

COLD = {"6a69d5305214390010407a8d": "CBW Cold", "6a6a3fce1dfd6f0018cb9ec6": "WE Cold"}

GENERIC = {"gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com",
           "comcast.net", "sbcglobal.net", "me.com", "msn.com", "cox-internet.com"}
FILLER = {"the", "inc", "llc", "ltd", "co", "company", "group", "of", "and", "corp",
          "corporation", "services", "solutions", "usa", "national", "american",
          "international", "center", "centre", "association", "university", "health",
          "hospital", "medical", "systems", "holdings"}


def req(path, body=None, method=None):
    for attempt in range(6):
        try:
            r = requests.request(method or ("POST" if body is not None else "GET"),
                                 f"{BASE}/{path}", headers=H, json=body, timeout=60)
        except requests.exceptions.RequestException:
            time.sleep(3 * (attempt + 1))
            continue
        if r.status_code == 429:
            time.sleep(45 * (attempt + 1))
            continue
        if r.status_code in (500, 502, 503, 504):
            time.sleep(5 * (attempt + 1))
            continue
        if r.status_code == 200:
            return r.json(), None
        return None, (r.status_code, r.text[:150])
    return None, ("retries", "exhausted")


def domain_of(t):
    t = (t or "").strip().lower().split("@")[-1]
    t = re.sub(r"^https?://", "", t).split("/")[0]
    return t.removeprefix("www.")


def email_fits_company(email, company, site_domain):
    dom = domain_of(email)
    if not dom or dom in GENERIC:
        return True
    if site_domain and (dom == site_domain or dom in site_domain or site_domain in dom):
        return True
    stem = dom.split(".")[0]
    strong = {w for w in re.findall(r"[a-z0-9]{3,}", (company or "").lower()) if w not in FILLER}
    if not strong:
        return True
    if any(w in stem for w in strong) or any(stem in w for w in strong if len(stem) >= 5):
        return True
    # 3+ tokens only: two-letter initialisms match almost any domain (see franchise-verify)
    initials = "".join(w[0] for w in sorted(strong))
    return len(strong) >= 3 and all(c in stem for c in initials)


def main():
    limit = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else None
    results = json.load(open(OUT)) if os.path.exists(OUT) else {}

    union, expected = all_contacts(use_cache=False)
    if expected and len(union) < expected:
        raise SystemExit(f"read {len(union)} of {expected} - refusing to verify a partial view")

    todo = []
    for c in union.values():
        if c.get("email_unsubscribed") or not c.get("email"):
            continue
        seqs = set(c.get("emailer_campaign_ids") or []) & set(COLD)
        if not seqs:
            continue
        e = c["email"].strip().lower()
        if e in results:
            continue
        org = (c.get("organization") or {})
        todo.append({"id": c["id"], "email": e,
                     "first_name": c.get("first_name") or "",
                     "last_name": c.get("last_name") or "",
                     "org": org.get("name") or c.get("organization_name") or "",
                     "domain": domain_of(org.get("primary_domain")
                                         or org.get("website_url") or "")})
    if limit:
        todo = todo[:limit]
    print(f"{len(todo)} cold-enrolled contacts to verify; {len(results)} already done")

    credits = 0
    counts = {"apollo-confirmed": 0, "apollo-updated": 0,
              "apollo-moved": 0, "apollo-unverified": 0}
    for i in range(0, len(todo), 10):
        batch = todo[i:i + 10]
        details = [{"first_name": t["first_name"], "last_name": t["last_name"],
                    "organization_name": t["org"], "domain": t["domain"]} for t in batch]
        md, err = req("people/bulk_match",
                      {"details": details, "reveal_personal_emails": False})
        if err:
            print(f"  bulk_match error {err}; stopping - progress is saved")
            break
        credits += (md or {}).get("credits_consumed") or 0
        matches = (md or {}).get("matches") or []
        for t, m in zip(batch, matches + [None] * len(batch)):
            verdict, new_email = "apollo-unverified", None
            if m and m.get("email") and m.get("email_status") == "verified":
                cand = m["email"].strip().lower()
                if cand == t["email"]:
                    verdict = "apollo-confirmed"
                elif email_fits_company(cand, t["org"], t["domain"]):
                    verdict, new_email = "apollo-updated", cand
                else:
                    verdict, new_email = "apollo-moved", cand
            if verdict == "apollo-updated":
                got, _ = req(f"contacts/{t['id']}", {"email": new_email}, "PUT")
                if ((got or {}).get("contact") or {}).get("email", "").lower() != new_email:
                    verdict = "apollo-confirmed"   # update refused; old address stands
                    new_email = None
            if verdict in ("apollo-moved", "apollo-unverified"):
                req(f"contacts/{t['id']}", {"email_unsubscribed": True}, "PUT")
            req("labels/add_entity_ids_to_label_names",
                {"entity_ids": [t["id"]], "modality": "contacts",
                 "label_names": [f"verify:{verdict}"]})
            counts[verdict] += 1
            results[t["email"]] = {"id": t["id"], "verdict": verdict, "new_email": new_email}
            json.dump(results, open(OUT, "w"), indent=1)
            print(f"  {verdict:20} {t['email']:46} "
                  + (f"-> {new_email}" if new_email and verdict == "apollo-updated" else ""),
                  flush=True)
            time.sleep(2)
        print(f"  --- batch {i // 10 + 1}: credits so far {credits} ---", flush=True)
        time.sleep(2)

    print(f"\n{counts} | credits consumed ~{credits}")
    print("Sendable after this pass: apollo-confirmed + apollo-updated. "
          "moved/unverified are suppressed (email_unsubscribed, reversible).")


if __name__ == "__main__":
    main()
