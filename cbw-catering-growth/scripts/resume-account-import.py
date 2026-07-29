"""Resume the Apollo account import after the hourly rate-limit window resets.

Reads the id-map from the first pass, imports only accounts not yet created,
labels them, and appends to the id-map.
"""
import csv
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


def post(path, body, patience=8):
    for attempt in range(patience):
        r = requests.post(f"{BASE}/{path}", headers=H, json=body, timeout=30)
        if r.status_code == 429:
            time.sleep(min(300, 30 * (attempt + 1)))
            continue
        break
    if r.status_code != 200:
        raise RuntimeError(f"POST {path} -> {r.status_code}: {r.text[:150]}")
    return r.json()


def store_slug(store):
    s = re.sub(r"[^a-z0-9]+", "-", (store or "unknown").lower()).strip("-")
    return s or "unknown"


done = set()
if os.path.exists(OUT):
    with open(OUT, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            done.add((r["location"].strip().lower(), r["zip"]))
print(f"{len(done)} accounts already imported")

rows, seen = [], set()
for f in ["enriched-champions-winback.csv", "enriched-warm-active-cold.csv"]:
    with open(os.path.join(DATA, f), newline="", encoding="utf-8") as fh:
        for r in csv.DictReader(fh):
            zipc = str(r["Zip Code"]).split(".")[0]
            key = (r["Location"].strip().lower(), zipc)
            if key in seen or key in done:
                continue
            seen.add(key)
            rows.append(r)
print(f"{len(rows)} remaining to import")

created = []
for i, r in enumerate(rows):
    zipc = str(r["Zip Code"]).split(".")[0]
    addr = ", ".join(x for x in [r["Street Address"], r["City"], r["State"], zipc] if x)
    try:
        d = post("accounts", {"name": r["Location"], "raw_address": addr})
        created.append((d["account"]["id"], r))
    except Exception as e:
        print(f"  create failed [{r['Location']!r}]: {e}")
    if (i + 1) % 50 == 0:
        print(f"  {i+1}/{len(rows)}")
    time.sleep(1.0)  # stay well under 400/hr alongside other calls
print(f"resume pass created {len(created)}")

by_label = defaultdict(list)
for acc_id, r in created:
    by_label["brand:cbw"].append(acc_id)
    by_label[f"store:{store_slug(r['Assigned Store'])}"].append(acc_id)
    by_label[f"segment:{r['Segment'].strip().lower()}"].append(acc_id)
for label, ids in by_label.items():
    for i in range(0, len(ids), 100):
        try:
            post("labels/add_entity_ids_to_label_names",
                 {"entity_ids": ids[i:i+100], "modality": "accounts", "label_names": [label]})
        except Exception as e:
            print(f"  label {label} failed: {e}")
        time.sleep(0.3)

with open(OUT, "a", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    for acc_id, r in created:
        w.writerow([acc_id, r["Location"], r["Slug"], str(r["Zip Code"]).split(".")[0],
                    r["Assigned Store"], r["Segment"]])
print("id map appended; resume pass complete")
