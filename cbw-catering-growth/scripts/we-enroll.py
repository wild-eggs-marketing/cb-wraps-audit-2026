"""Enroll Wild Eggs contacts into their sequences. Run ONCE the WE sending
mailbox is linked in Apollo:

    APOLLO_API_KEY=... python3 scripts/we-enroll.py <sender_email_account_id>

(Get the id from GET /v1/email_accounts after linking the mailbox, or ask
Claude to run this - it fills the id into config/wildeggs.json too.)

Occasion-buyer routing per the playbook:
  champion, 30-180 days past median gap  -> WE Champion Recoverable
  champion, >180 past                    -> WE Champion Lost Cause (single touch)
  champion, on schedule                  -> not enrolled
  winback                                -> WE Winback
  warm                                   -> WE Warm Nudge
  cold (verified emails only)            -> WE Cold Reintro
Sequences are INACTIVE; enrollment queues without sending.
"""
import csv
import json
import os
import sys
import time

import requests

API_KEY = os.environ["APOLLO_API_KEY"]
H = {"x-api-key": API_KEY, "Content-Type": "application/json"}
BASE = "https://api.apollo.io/api/v1"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = json.load(open(os.path.join(ROOT, "config", "wildeggs.json")))
SEQ = CFG["sequences"]
DATA = os.path.join(ROOT, CFG["data_dir"])


def post(path, body):
    for a in range(6):
        try:
            r = requests.post(f"{BASE}/{path}", headers=H, json=body, timeout=30)
        except requests.exceptions.RequestException:
            time.sleep(3 * (a + 1)); continue
        if r.status_code == 429: time.sleep(20 * (a + 1)); continue
        break
    if r.status_code != 200:
        raise RuntimeError(f"POST {path} -> {r.status_code}: {r.text[:200]}")
    return r.json()


def main():
    sender = sys.argv[1]
    rows = [r for r in csv.DictReader(open(os.path.join(DATA, "enriched-accounts.csv"), encoding="utf-8"))
            if r["Apollo Matched"] == "True" and r["Contact Email"]]

    # email -> contact id
    ids = {}
    page = 1
    while True:
        d = post("contacts/search", {"per_page": 100, "page": page})
        for c in d.get("contacts", []):
            if c.get("email"):
                ids[c["email"].lower()] = c["id"]
        if page >= d["pagination"]["total_pages"]:
            break
        page += 1

    buckets = {k: [] for k in SEQ}
    seen = set()
    for r in rows:
        e = r["Contact Email"].lower()
        if e in seen or e not in ids:
            continue
        seen.add(e)
        seg = r["Segment"].strip().lower()
        if seg == "active":
            continue
        if seg == "champion":
            gap = int(float(r["Median Reorder Gap (days)"] or 0))
            overdue = int(r["Days Since Last Order"]) - gap if gap else 0
            if 30 <= overdue <= 180:
                buckets["champion-recoverable"].append(ids[e])
            elif overdue > 180:
                buckets["champion-lost-cause"].append(ids[e])
        elif seg == "winback":
            buckets["winback"].append(ids[e])
        elif seg == "warm":
            buckets["warm-nudge"].append(ids[e])
        elif seg == "cold" and r["Email Status"] == "verified":
            buckets["cold-reintro"].append(ids[e])

    for key, contact_ids in buckets.items():
        enrolled = 0
        for i in range(0, len(contact_ids), 25):
            d = post(f"emailer_campaigns/{SEQ[key]}/add_contact_ids", {
                "contact_ids": contact_ids[i:i+25],
                "emailer_campaign_id": SEQ[key],
                "send_email_from_email_account_id": sender,
                "sequence_active_in_other_campaigns": True,
            })
            enrolled += len(d.get("contacts", []))
            time.sleep(0.4)
        print(f"{key}: {enrolled}/{len(contact_ids)} enrolled")


if __name__ == "__main__":
    main()
