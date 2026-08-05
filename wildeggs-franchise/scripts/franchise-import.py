"""Import the cleaned Chain Store Guide A1 franchise prospect list into Apollo.

Source: Wild_Eggs_A1_Prospects_Current_List_Updated_LinkedIn.xlsx - 184 scored, deduped,
decision-maker rows produced by an earlier cleaning pass (Campaign Code CSG-A1-2026). That
cleaning never reached Apollo: a full read on 2026-08-05 found 0 of the 184 emails among 1,102
contacts, 0 of the 184 companies among 1,403 accounts, and no CSG/franchise label at all.

What this does, per prospect: create (or reuse) the company as an account, create the contact,
stamp the franchise attributes as typed custom fields, and label it. It does NOT enrol anyone
into a sequence - enrolment is a separate, deliberate step.

Two holds are deliberate:
  * Canada (ON/SK/BC/AB/QC, 15 rows) is imported but labelled hold:casl. CASL requires express
    consent rather than CAN-SPAM's opt-out, and Wild Eggs is a US brand. Sending needs a human
    decision, so these must never be swept into a sequence by default.
  * Chain Store Guide 2020 is six-year-old data. Our live catering list hard-bounces at ~8% on
    emails Apollo itself calls "verified", so these should be externally verified before any
    send, not after.

Run:  APOLLO_API_KEY=... python3 scripts/franchise-import.py <xlsx> [--limit N] [--dry-run]
"""
import json
import os
import sys
import time

import pandas as pd
import requests

BASE = "https://api.apollo.io/api/v1"
H = {"x-api-key": os.environ["APOLLO_API_KEY"], "Content-Type": "application/json"}

# Created 2026-08-05 with type "string" ("text" is silently accepted and yields a type-less
# field that rejects every write).
FIELDS = {
    "fr_tier": "6a7344a6ff97ce0010d93efd",
    "fr_score": "6a7344a85ba735001c20adea",
    "fr_role_segment": "6a7344aa1c27730018b2bda4",
    "fr_concept_segment": "6a7344ab9df203001498e72e",
    "fr_total_units": "6a7344ad4adf78001c6259fc",
    "fr_territory": "6a7344aff6b007000c033871",
    "fr_approach": "6a7344b1a71d960010509aee",
    "fr_campaign_code": "6a7344b30adee3000c6fe5ed",
}

US_STATES = {"AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN",
             "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV",
             "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN",
             "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"}
# Elle's excluded franchise markets. The cleaned list already honours these (0 rows removed),
# but the filter stays so a future, dirtier export cannot slip one through.
EXCLUDED_STATES = {"CA", "WA", "HI", "IL", "MD", "NY", "VA"}

PROGRESS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                             "franchise-import-progress.json")


def req(path, body=None, method=None):
    """POST/PUT with retries on 429 and transient 5xx. Apollo returns 502 'policy unavailable'
    under load; treating that as fatal once killed a run mid-contact and orphaned a record."""
    for attempt in range(6):
        try:
            r = requests.request(method or ("POST" if body is not None else "GET"),
                                 f"{BASE}/{path}", headers=H, json=body, timeout=45)
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
        return None, (r.status_code, r.text[:160])
    return None, ("retries", "exhausted")


def s(v):
    """Excel gives NaN and floats; custom fields are strings."""
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return ""
    t = str(v).strip()
    return "" if t.lower() in ("nan", "none") else (t[:-2] if t.endswith(".0") else t)


def load_rows(path):
    d = pd.read_excel(path)
    d = d[d["Email"].notna()].copy()
    d["State"] = d["State"].astype(str).str.strip().str.upper()
    before = len(d)
    d = d[~d["State"].isin(EXCLUDED_STATES)]
    if before != len(d):
        print(f"excluded-state filter removed {before - len(d)} rows")
    return d


def existing_maps():
    """email -> contact id, and lowercased account name -> account id, read in full."""
    contacts, accounts = {}, {}
    for path, sink, key in (("contacts/search", contacts, "contacts"),
                            ("accounts/search", accounts, "accounts")):
        page = 1
        while page <= 60:
            body, err = req(path, {"per_page": 100, "page": page})
            if err or not body:
                break
            got = body.get(key) or []
            if not got:
                break
            for x in got:
                if key == "contacts":
                    e = (x.get("email") or "").strip().lower()
                    if e:
                        sink[e] = x["id"]
                else:
                    n = (x.get("name") or "").strip().lower()
                    if n:
                        sink[n] = x["id"]
            pag = body.get("pagination") or {}
            if page >= (pag.get("total_pages") or 1):
                break
            page += 1
    return contacts, accounts


def main():
    path = sys.argv[1]
    dry = "--dry-run" in sys.argv
    limit = None
    if "--limit" in sys.argv:
        limit = int(sys.argv[sys.argv.index("--limit") + 1])

    rows = load_rows(path)
    if limit:
        rows = rows.head(limit)
    print(f"{len(rows)} prospects to import (dry-run={dry})")

    done = {}
    if os.path.exists(PROGRESS_PATH):
        done = json.load(open(PROGRESS_PATH))
        print(f"resuming: {len(done)} already imported")

    by_email, by_account = ({}, {}) if dry else existing_maps()
    print(f"apollo already holds {len(by_email)} contacts / {len(by_account)} accounts")

    created = reused = skipped = failed = 0
    for _, r in rows.iterrows():
        email = s(r["Email"]).lower()
        if not email or email in done:
            skipped += 1
            continue
        company = s(r.get("Company"))
        state = s(r.get("State"))
        canada = state not in US_STATES

        labels = ["brand:wildeggs-franchise", "source:chain-store-guide",
                  f"tier:{s(r.get('Battle Plan Tier')).lower() or 'a1'}",
                  "campaign:csg-a1-2026"]
        if canada:
            labels.append("hold:casl")

        fields = {
            FIELDS["fr_tier"]: s(r.get("Battle Plan Tier")) or "A1",
            FIELDS["fr_score"]: s(r.get("Prospect Score")),
            FIELDS["fr_role_segment"]: s(r.get("Role Segment")),
            FIELDS["fr_concept_segment"]: s(r.get("Concept Segment")),
            FIELDS["fr_total_units"]: s(r.get("Total Units")),
            FIELDS["fr_territory"]: s(r.get("Market / Territory")) or f"{s(r.get('City'))}, {state}",
            FIELDS["fr_approach"]: s(r.get("Suggested Approach"))[:200],
            FIELDS["fr_campaign_code"]: s(r.get("Campaign Code")) or "CSG-A1-2026",
        }
        fields = {k: v for k, v in fields.items() if v}

        if dry:
            print(f"  [dry] {email:44} {company[:28]:30} {state} "
                  f"{'CASL-HOLD' if canada else ''}")
            created += 1
            continue

        if email in by_email:
            cid = by_email[email]
            reused += 1
        else:
            acct_id = by_account.get(company.lower())
            if not acct_id and company:
                a, err = req("accounts", {"name": company, "website_url": s(r.get("Website"))})
                if a:
                    acct_id = ((a.get("account") or {}).get("id"))
                    by_account[company.lower()] = acct_id
                time.sleep(1.2)
            name = s(r.get("Full Name")).split()
            body = {"first_name": name[0] if name else "",
                    "last_name": " ".join(name[1:]) if len(name) > 1 else "",
                    "title": s(r.get("Title")), "email": email,
                    "organization_name": company,
                    "typed_custom_fields": fields}
            if acct_id:
                body["account_id"] = acct_id
            c, err = req("contacts", body)
            if err or not c:
                failed += 1
                print(f"  ERR create {email}: {err}")
                continue
            cid = ((c.get("contact") or {}).get("id"))
            created += 1
            time.sleep(1.2)

        # confirm the fields landed - an unstamped contact is unsendable
        got, _ = req(f"contacts/{cid}", {"typed_custom_fields": fields}, "PUT")
        landed = bool(((got or {}).get("contact") or {}).get("typed_custom_fields", {}))
        req("labels/add_entity_ids_to_label_names",
            {"entity_ids": [cid], "modality": "contacts", "label_names": labels})
        done[email] = {"id": cid, "canada": canada, "fields_ok": landed}
        json.dump(done, open(PROGRESS_PATH, "w"), indent=1)
        print(f"  ok {email:44} {company[:26]:28} {state}"
              f"{'  CASL-HOLD' if canada else ''}{'' if landed else '  !! fields missing'}")
        time.sleep(1.6)

    print(f"\ncreated {created}, reused {reused}, skipped {skipped}, failed {failed}")
    ca = sum(1 for v in done.values() if isinstance(v, dict) and v.get("canada"))
    print(f"imported total {len(done)} | {ca} on CASL hold | "
          f"{len(done) - ca} US-eligible for a sequence")
    print(f"progress: {PROGRESS_PATH}")
    print("\nNothing was enrolled in a sequence. Verify emails externally before any send.")


if __name__ == "__main__":
    main()
