"""CBW lifecycle engine: re-segment from the latest EZ Cater export and auto-enroll
segment transitions into the standing Apollo sequences.

Run weekly (scheduled) or ad hoc:
    APOLLO_API_KEY=... python3 scripts/lifecycle-engine.py [path-to-ez-cater-export.csv]

What it does each run:
 1. Rebuilds account aggregates from the order export (same rules as
    build-account-list.py: champion 5+ orders; cold >180d; winback 91-180d;
    warm 31-90d; active <31d).
 2. Diffs each account's segment against data/lifecycle-state.json.
 3. Enrolls the account's matched contact into the right sequence when a
    transition or trigger fires:
      champion past median reorder gap (+7d grace)  -> Champion Reactivation
      active/champion -> warm                        -> Warm Nudge
      warm -> winback                                -> Winback
      any -> cold (verified email only)              -> Cold Reintro
 4. Applies guardrails: never enroll 'active'; 90-day cooldown per sequence;
    skip contacts who ever replied (Apollo marks them finished_replied);
    skip contacts with no matched email.
 5. Writes updated state + prints a run report.

Sequences are the permanent send layer; this script is the only thing that
feeds them. Contacts must already exist in Apollo (import-and-enroll-contacts.py).
"""
import csv
import json
import os
import sys
import time
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta

import requests

API_KEY = os.environ["APOLLO_API_KEY"]
H = {"x-api-key": API_KEY, "Content-Type": "application/json"}
BASE = "https://api.apollo.io/api/v1"
SENDER_ACCOUNT_ID = "6a67c6456fab0c0020dec04d"  # elle@crazybowlsandwraps.com

SEQ = {
    "champion-reactivation": "6a69d431d23c72000cf96aa1",
    "winback": "6a69d52294372e000cdf82e0",
    "warm-nudge": "6a69d52af1d199000c924f60",
    "cold-reintro": "6a69d5305214390010407a8d",
}
COOLDOWN_DAYS = 90
CHAMPION_MIN_ORDERS = 5
GRACE_DAYS = 7

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
STATE_PATH = os.path.join(DATA, "lifecycle-state.json")


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


def slugify(name):
    return (str(name).lower().replace(" ", "-").replace(",", "").replace(".", "")
            .replace("&", "and").replace("'", "").replace("/", "-"))


def segment_for(orders, days_since):
    if orders >= CHAMPION_MIN_ORDERS:
        return "champion"
    if days_since > 180:
        return "cold"
    if 91 <= days_since <= 180:
        return "winback"
    if 31 <= days_since <= 90:
        return "warm"
    return "active"


def rebuild_accounts(orders_path, today):
    """Aggregate the raw EZ Cater export into per-account rows (stdlib only)."""
    by_loc = defaultdict(list)
    with open(orders_path, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if r.get("Status") not in ("Completed", "Food Delivered"):
                continue
            if "CBW" not in (r.get("Caterer Name") or ""):
                continue
            loc = r.get("Location") or ""
            if loc.startswith("Takeout from"):
                continue
            raw = (r.get("Event Date") or "").strip()
            d = None
            for fmt in ("%m/%d/%Y %I:%M %p", "%m/%d/%Y", "%Y-%m-%d"):
                try:
                    d = datetime.strptime(raw if fmt != "%Y-%m-%d" else raw[:10], fmt).date()
                    break
                except ValueError:
                    continue
            if d is None:
                continue
            by_loc[loc].append(d)
    accounts = {}
    for loc, dates in by_loc.items():
        dates.sort()
        days_since = (today - dates[-1]).days
        gaps = [(b - a).days for a, b in zip(dates, dates[1:])]
        median_gap = sorted(gaps)[len(gaps) // 2] if gaps else None
        accounts[slugify(loc)] = {
            "location": loc,
            "orders": len(dates),
            "days_since": days_since,
            "median_gap": median_gap,
            "segment": segment_for(len(dates), days_since),
        }
    return accounts


def load_contacts():
    """slug -> contact row (email, status) from the enriched CSVs."""
    contacts = {}
    for f in ["enriched-champions-winback.csv", "enriched-warm-active-cold.csv"]:
        path = os.path.join(DATA, f)
        if not os.path.exists(path):
            continue
        with open(path, newline="", encoding="utf-8") as fh:
            for r in csv.DictReader(fh):
                if r["Apollo Matched"].strip().lower() == "true" and r["Contact Email"]:
                    contacts.setdefault(r["Slug"], {
                        "email": r["Contact Email"].lower(),
                        "email_status": r["Email Status"],
                    })
    return contacts


def apollo_contact_index():
    """email -> {id, replied_ever} from saved contacts."""
    idx = {}
    page = 1
    while True:
        d = post("contacts/search", {"per_page": 100, "page": page})
        for c in d.get("contacts", []):
            if not c.get("email"):
                continue
            replied = any(s.get("status") == "finished_replied"
                          for s in c.get("contact_campaign_statuses", []))
            idx[c["email"].lower()] = {"id": c["id"], "replied": replied}
        if page >= (d.get("pagination", {}) or {}).get("total_pages", 1):
            break
        page += 1
    return idx


def decide_sequence(prev_seg, acc):
    seg = acc["segment"]
    if seg == "active":
        return None
    if seg == "champion":
        gap = acc["median_gap"]
        if gap and acc["days_since"] > gap + GRACE_DAYS:
            return "champion-reactivation"
        return None
    if seg == "warm":
        return "warm-nudge" if prev_seg in (None, "active", "champion") else None
    if seg == "winback":
        return "winback" if prev_seg != "winback" else None
    if seg == "cold":
        return "cold-reintro" if prev_seg != "cold" else None
    return None


def main():
    today = date.today()
    orders_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(DATA, "ez-cater-orders.csv")
    dry_run = "--dry-run" in sys.argv

    accounts = rebuild_accounts(orders_path, today)
    contacts = load_contacts()
    state = {}
    if os.path.exists(STATE_PATH):
        with open(STATE_PATH) as f:
            state = json.load(f)

    idx = apollo_contact_index()
    report = Counter()
    enrollments = defaultdict(list)

    for slug, acc in accounts.items():
        st = state.get(slug, {})
        prev_seg = st.get("segment")
        target = decide_sequence(prev_seg, acc)
        new_st = {"segment": acc["segment"], "enrolled": st.get("enrolled", {})}
        state[slug] = new_st
        if not target:
            report["no-action"] += 1
            continue
        contact = contacts.get(slug)
        if not contact:
            report["no-contact"] += 1
            continue
        if target == "cold-reintro" and contact["email_status"] != "verified":
            report["unverified-skipped"] += 1
            continue
        ap = idx.get(contact["email"])
        if not ap:
            report["contact-not-in-apollo"] += 1
            continue
        if ap["replied"]:
            report["replied-suppressed"] += 1
            continue
        last = new_st["enrolled"].get(target)
        if last and (today - date.fromisoformat(last)).days < COOLDOWN_DAYS:
            report["cooldown-skipped"] += 1
            continue
        enrollments[target].append((slug, ap["id"]))
        new_st["enrolled"][target] = today.isoformat()

    for seq_name, pairs in enrollments.items():
        ids = [cid for _, cid in pairs]
        if dry_run:
            print(f"[dry-run] would enroll {len(ids)} into {seq_name}: {[s for s,_ in pairs][:10]}")
            continue
        for i in range(0, len(ids), 25):
            post(f"emailer_campaigns/{SEQ[seq_name]}/add_contact_ids", {
                "contact_ids": ids[i:i+25],
                "emailer_campaign_id": SEQ[seq_name],
                "send_email_from_email_account_id": SENDER_ACCOUNT_ID,
                "sequence_active_in_other_campaigns": True,
            })
            time.sleep(0.4)
        report[f"enrolled:{seq_name}"] = len(ids)

    if not dry_run:
        with open(STATE_PATH, "w") as f:
            json.dump(state, f, indent=1, sort_keys=True)

    seg_counts = Counter(a["segment"] for a in accounts.values())
    print(f"=== Lifecycle run {today} ===")
    print(f"accounts: {len(accounts)} | segments: {dict(seg_counts)}")
    print(f"actions: {dict(report)}")


if __name__ == "__main__":
    main()
