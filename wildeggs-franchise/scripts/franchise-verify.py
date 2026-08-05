"""Verify the imported CSG A1 franchise contacts through Apollo's own enrichment.

The 184 emails came from Chain Store Guide 2020. Rather than sending to six-year-old
addresses, run each person back through people/bulk_match - Apollo re-resolves the person
against its live index and returns their CURRENT verified work email. Three outcomes:

  verify:apollo-confirmed   Apollo's current verified email == the 2020 email. Safe to send.
  verify:apollo-updated     Apollo returned a DIFFERENT verified email - the 2020 one is
                            stale. The contact's email is updated to the current address.
  verify:apollo-moved       Apollo returned a verified email at a DIFFERENT company - the
                            person changed jobs since 2020. Held for human review: they may
                            still be a prospect, but the pitch data (units, concept) is
                            about a company they no longer run.
  verify:apollo-unverified  No verified email returned (small shop on a free-mail address
                            which reveal_personal_emails=False will not return, or no
                            match). Hold these - do not enrol.

Payload rules that are load-bearing (see CLAUDE.md): first_name MUST be included or
bulk_match fuzzy-joins to the wrong person; the company domain is passed as a hint but the
stored email is NOT (an email hint makes Apollo echo the team's own record back with
email_status=None instead of resolving the person); a returned email whose domain
contradicts the company is rejected rather than trusted.

Cost: ~1 credit per revealed match, ~184 total against a ~970 ledger with a 400 floor.

Run: APOLLO_API_KEY=... python3 scripts/franchise-verify.py [--limit N] [--dry-run]
"""
import json
import os
import re
import sys
import time

import pandas as pd
import requests

BASE = "https://api.apollo.io/api/v1"
H = {"x-api-key": os.environ["APOLLO_API_KEY"], "Content-Type": "application/json"}

HERE = os.path.dirname(os.path.abspath(__file__))
PROGRESS = os.path.join(HERE, "franchise-import-progress.json")
OUT = os.path.join(HERE, "franchise-verify-results.json")
XLSX = ("/root/.claude/uploads/0b3443e9-c6d8-5465-acb5-cebdbc8611bc/"
        "3f74243c-Wild_Eggs_A1_Prospects_Current_List_Updated_LinkedIn.csv.xlsx")

GENERIC = {"gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com",
           "cox-internet.com", "comcast.net", "sbcglobal.net", "me.com", "msn.com"}
FILLER = {"the", "inc", "llc", "ltd", "co", "company", "group", "restaurants", "restaurant",
          "holdings", "brands", "concepts", "of", "and", "food", "foods", "hospitality"}


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


def domain_of(url_or_email):
    t = (url_or_email or "").strip().lower()
    t = t.split("@")[-1]
    t = re.sub(r"^https?://", "", t).split("/")[0]
    return t.removeprefix("www.")


def email_fits_company(email, company, site_domain):
    """Reject a returned address whose domain contradicts the company - a mis-join, not a
    verification. Generic/free domains pass (owner-operators legitimately use them)."""
    dom = domain_of(email)
    if not dom or dom in GENERIC:
        return True
    if site_domain and (dom == site_domain or dom in site_domain or site_domain in dom):
        return True
    stem = dom.split(".")[0]
    strong = {w for w in re.findall(r"[a-z0-9]{3,}", (company or "").lower())
              if w not in FILLER}
    if not strong:
        return True
    if any(w in stem for w in strong) or any(stem in w for w in strong if len(stem) >= 5):
        return True
    # Initialism check only for 3+ token names. With two tokens the "initials" are two
    # single letters that will each appear somewhere in almost any domain: "Harry's of
    # America" -> "ah" -> matched saltlifefoodshack.com, waving a job-changer through as a
    # verified update.
    initials = "".join(w[0] for w in sorted(strong))
    return len(strong) >= 3 and all(c in stem for c in initials)


def main():
    dry = "--dry-run" in sys.argv
    limit = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else None

    prog = json.load(open(PROGRESS))
    src = pd.read_excel(XLSX)
    src = src[src["Email"].notna()]
    by_email = {str(r["Email"]).strip().lower(): r for _, r in src.iterrows()}

    results = json.load(open(OUT)) if os.path.exists(OUT) else {}
    todo = [(e, rec) for e, rec in prog.items()
            if isinstance(rec, dict) and e not in results]
    if limit:
        todo = todo[:limit]
    print(f"{len(todo)} contacts to verify (dry-run={dry}); {len(results)} already done")

    confirmed = updated = unverified = 0
    for i in range(0, len(todo), 10):
        batch = todo[i:i + 10]
        details = []
        for e, rec in batch:
            row = by_email.get(e)
            name = str(row["Full Name"]).strip().split() if row is not None else []
            # Deliberately NO "email" hint. Passing our stored email makes Apollo echo the
            # team's own imported record back (revealed_for_current_team=true,
            # email_status=None) instead of independently resolving the person - the first
            # test run returned 10/10 "unverified" for exactly this reason. Name + company +
            # domain forces a real resolution, whose email_status is a genuine verdict.
            details.append({
                "first_name": name[0] if name else "",
                "last_name": " ".join(name[1:]) if len(name) > 1 else "",
                "organization_name": str(row["Company"]).strip() if row is not None else "",
                "domain": domain_of(str(row.get("Website", "")) if row is not None else ""),
            })
        if dry:
            for (e, _), d in zip(batch, details):
                print(f"  [dry] {e:44} {d['organization_name'][:30]}")
            continue
        md, err = req("people/bulk_match",
                      {"details": details, "reveal_personal_emails": False})
        matches = (md or {}).get("matches") or []
        for (e, rec), d, m in zip(batch, details, matches + [None] * len(batch)):
            cid = rec["id"]
            verdict, new_email = "apollo-unverified", None
            if m and m.get("email") and m.get("email_status") == "verified":
                cand = m["email"].strip().lower()
                if cand == e:
                    verdict = "apollo-confirmed"
                elif email_fits_company(cand, d["organization_name"], d["domain"]):
                    verdict, new_email = "apollo-updated", cand
                else:
                    # verified, but at another company: a job-changer, not an update
                    verdict, new_email = "apollo-moved", cand
            if verdict == "apollo-updated":
                body = {"email": new_email}
                got, uerr = req(f"contacts/{cid}", body, "PUT")
                landed = ((got or {}).get("contact") or {}).get("email", "").lower() == new_email
                if not landed:
                    verdict = "apollo-confirmed-old-kept"   # update refused; old address stands
            req("labels/add_entity_ids_to_label_names",
                {"entity_ids": [cid], "modality": "contacts",
                 "label_names": [f"verify:{verdict.replace('-old-kept', '')}"]})
            results[e] = {"id": cid, "verdict": verdict,
                          "new_email": new_email if verdict.startswith("apollo-updated") else None,
                          "moved_to": new_email if verdict == "apollo-moved" else None}
            json.dump(results, open(OUT, "w"), indent=1)
            if verdict == "apollo-confirmed":
                confirmed += 1
            elif verdict.startswith("apollo-updated"):
                updated += 1
            else:
                unverified += 1
            print(f"  {verdict:22} {e:44}" + (f" -> {new_email}" if new_email else ""))
            time.sleep(2)
        time.sleep(2)

    print(f"\nconfirmed {confirmed} | updated {updated} | unverified {unverified}")
    print(f"results: {OUT}")
    print("Enrol ONLY verify:apollo-confirmed and verify:apollo-updated. "
          "verify:apollo-unverified stays out.")


if __name__ == "__main__":
    main()
