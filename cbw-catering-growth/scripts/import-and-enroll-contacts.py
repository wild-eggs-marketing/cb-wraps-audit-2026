"""Import matched contacts into Apollo and enroll them in their segment sequence.

- Dedupes against contacts already saved in Apollo (by email).
- Skips segment 'active' (currently-ordering accounts get no outreach).
- Cold enrollment: verified emails only (extrapolated excluded, per review).
- Sequences are INACTIVE, so enrollment queues contacts without sending.
"""
import csv
import json
import os
import time

import requests

API_KEY = os.environ["APOLLO_API_KEY"]
H = {"x-api-key": API_KEY, "Content-Type": "application/json"}
BASE = "https://api.apollo.io/api/v1"
SENDER_ACCOUNT_ID = "6a67c6456fab0c0020dec04d"  # elle@crazybowlsandwraps.com

SEQ = {
    "champion": "6a69d431d23c72000cf96aa1",
    "winback": "6a69d52294372e000cdf82e0",
    "warm": "6a69d52af1d199000c924f60",
    "cold": "6a69d5305214390010407a8d",
}

DATA = "/home/user/cb-wraps-audit-2026/cbw-catering-growth/data"


def post(path, body):
    for attempt in range(4):
        r = requests.post(f"{BASE}/{path}", headers=H, json=body, timeout=30)
        if r.status_code == 429:
            time.sleep(2 * (attempt + 1))
            continue
        break
    if r.status_code != 200:
        raise RuntimeError(f"POST {path} -> {r.status_code}: {r.text[:300]}")
    return r.json()


# 1. Load matched rows
rows = []
for f in ["enriched-champions-winback.csv", "enriched-warm-active-cold.csv"]:
    with open(os.path.join(DATA, f), newline="", encoding="utf-8") as fh:
        for r in csv.DictReader(fh):
            if r["Apollo Matched"].strip().lower() == "true" and r["Contact Email"]:
                rows.append(r)
# dedupe rows by email (duplicate account rows exist)
seen = set()
uniq = []
for r in rows:
    e = r["Contact Email"].lower()
    if e not in seen:
        seen.add(e)
        uniq.append(r)
print(f"{len(uniq)} unique matched contacts across segments")

# 2. Existing contacts by email
existing = {}
page = 1
while True:
    d = post("contacts/search", {"per_page": 100, "page": page})
    for c in d.get("contacts", []):
        if c.get("email"):
            existing[c["email"].lower()] = c["id"]
    if page >= (d.get("pagination", {}) or {}).get("total_pages", 1):
        break
    page += 1
print(f"{len(existing)} contacts already in Apollo")

# 3. Create missing contacts (label by brand/segment)
created, failed = 0, 0
contact_ids = {}  # email -> id
for r in uniq:
    email = r["Contact Email"].lower()
    seg = r["Segment"].strip().lower()
    if email in existing:
        contact_ids[email] = existing[email]
        continue
    try:
        d = post("contacts", {
            "first_name": r["Contact First Name"],
            "last_name": r["Contact Last Name"],
            "title": r["Contact Title"],
            "email": r["Contact Email"],
            "organization_name": r["Apollo Org Name Matched"] or r["Location"],
            "label_names": ["brand:cbw", f"segment:{seg}"],
        })
        contact_ids[email] = d["contact"]["id"]
        created += 1
    except Exception as e:
        failed += 1
        print(f"  create failed for {email}: {e}")
    time.sleep(0.2)
print(f"created {created} new contacts, {failed} failures, {len(contact_ids)} total resolvable")

# 4. Enroll per segment (skip active; cold = verified only)
summary = {}
for seg, camp_id in SEQ.items():
    ids = []
    for r in uniq:
        if r["Segment"].strip().lower() != seg:
            continue
        if seg == "cold" and r["Email Status"] != "verified":
            continue
        cid = contact_ids.get(r["Contact Email"].lower())
        if cid:
            ids.append(cid)
    ids = list(dict.fromkeys(ids))
    enrolled = 0
    for i in range(0, len(ids), 25):
        batch = ids[i:i + 25]
        try:
            d = post(f"emailer_campaigns/{camp_id}/add_contact_ids", {
                "contact_ids": batch,
                "emailer_campaign_id": camp_id,
                "send_email_from_email_account_id": SENDER_ACCOUNT_ID,
                "sequence_active_in_other_campaigns": True,
            })
            enrolled += len(d.get("contacts", batch))
        except Exception as e:
            print(f"  enroll batch failed ({seg}): {e}")
        time.sleep(0.4)
    summary[seg] = {"eligible": len(ids), "enrolled": enrolled}
    print(f"{seg}: enrolled {enrolled}/{len(ids)}")

skipped_active = sum(1 for r in uniq if r["Segment"].strip().lower() == "active")
print(json.dumps({"summary": summary, "skipped_active_contacts": skipped_active}, indent=1))
