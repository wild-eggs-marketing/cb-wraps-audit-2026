"""Import all CBW catering accounts into Apollo as the system of record.

Creates one Apollo account per unique (Location, Zip) with address, then applies
labels via the labels endpoint (modality=accounts): brand:cbw, store:{slug},
segment:{segment}. Writes an id map CSV for the lifecycle engine.
"""
import csv
import json
import os
import re
import time
from collections import defaultdict

import requests

API_KEY = os.environ["APOLLO_API_KEY"]
H = {"x-api-key": API_KEY, "Content-Type": "application/json"}
BASE = "https://api.apollo.io/api/v1"
DATA = "/home/user/cb-wraps-audit-2026/cbw-catering-growth/data"
OUT = os.path.join(DATA, "apollo-account-ids.csv")


def post(path, body):
    for attempt in range(5):
        r = requests.post(f"{BASE}/{path}", headers=H, json=body, timeout=30)
        if r.status_code == 429:
            time.sleep(2 * (attempt + 1))
            continue
        break
    if r.status_code != 200:
        raise RuntimeError(f"POST {path} -> {r.status_code}: {r.text[:200]}")
    return r.json()


def store_slug(store):
    s = re.sub(r"[^a-z0-9]+", "-", (store or "unknown").lower()).strip("-")
    return s or "unknown"


rows = []
seen = set()
for f in ["enriched-champions-winback.csv", "enriched-warm-active-cold.csv"]:
    with open(os.path.join(DATA, f), newline="", encoding="utf-8") as fh:
        for r in csv.DictReader(fh):
            key = (r["Location"].strip().lower(), str(r["Zip Code"]).strip())
            if key in seen:
                continue
            seen.add(key)
            rows.append(r)
print(f"{len(rows)} unique accounts to import")

created = []  # (account_id, row)
failures = 0
for i, r in enumerate(rows):
    zipc = str(r["Zip Code"]).split(".")[0]
    addr = ", ".join(x for x in [r["Street Address"], r["City"], r["State"], zipc] if x)
    try:
        d = post("accounts", {"name": r["Location"], "raw_address": addr})
        created.append((d["account"]["id"], r))
    except Exception as e:
        failures += 1
        print(f"  create failed [{r['Location']!r}]: {e}")
    if (i + 1) % 50 == 0:
        print(f"  {i+1}/{len(rows)} created")
    time.sleep(0.15)
print(f"created {len(created)} accounts, {failures} failures")

# label application: group ids per label
by_label = defaultdict(list)
for acc_id, r in created:
    by_label["brand:cbw"].append(acc_id)
    by_label[f"store:{store_slug(r['Assigned Store'])}"].append(acc_id)
    by_label[f"segment:{r['Segment'].strip().lower()}"].append(acc_id)

for label, ids in by_label.items():
    ok = 0
    for i in range(0, len(ids), 100):
        try:
            post("labels/add_entity_ids_to_label_names",
                 {"entity_ids": ids[i:i+100], "modality": "accounts", "label_names": [label]})
            ok += len(ids[i:i+100])
        except Exception as e:
            print(f"  label {label} failed on batch {i}: {e}")
        time.sleep(0.3)
    print(f"label {label}: {ok}/{len(ids)}")

with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["apollo_account_id", "location", "slug", "zip", "store", "segment"])
    for acc_id, r in created:
        w.writerow([acc_id, r["Location"], r["Slug"], str(r["Zip Code"]).split(".")[0],
                    r["Assigned Store"], r["Segment"]])
print(f"id map written to {OUT}")
