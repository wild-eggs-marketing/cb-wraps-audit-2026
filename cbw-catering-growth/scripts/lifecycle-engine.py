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
    skip contacts who ever replied (read from the message records, not the contact status);
    skip contacts with no matched email.
 5. Writes updated state + prints a run report.

Sequences are the permanent send layer; this script is the only thing that
feeds them. Contacts must already exist in Apollo (import-and-enroll-contacts.py).
"""
import csv
import glob
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

ROOT_ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_cfg_path = os.path.join(ROOT_, "config", "cbw.json")
if "--config" in sys.argv:
    _cfg_path = sys.argv[sys.argv.index("--config") + 1]
with open(_cfg_path) as _f:
    CONFIG = json.load(_f)
SENDER_ACCOUNT_ID = CONFIG["sender_email_account_id"]
SEQ = CONFIG["sequences"]
CATERER_FILTER = CONFIG.get("caterer_filter", "CBW")
COOLDOWN_DAYS = 90
CHAMPION_MIN_ORDERS = 5
GRACE_DAYS = 7

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, CONFIG.get("data_dir", "data"))
STATE_PATH = os.path.join(DATA, "lifecycle-state.json")  # per-brand: lives in the brand data_dir


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
            if CATERER_FILTER not in (r.get("Caterer Name") or ""):
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
    # Glob rather than a hardcoded pair of filenames: the whole point of this engine is that
    # it re-reads a FRESH export each week, and a new export named anything else was being
    # silently ignored - the engine would run, report zero transitions, and look healthy.
    paths = sorted(glob.glob(os.path.join(DATA, "enriched-*.csv"))
                   + glob.glob(os.path.join(DATA, "accounts-enriched*.csv")))
    if not paths:
        print(f"WARNING: no enriched-*.csv found in {DATA}; no contacts loaded")
    for path in paths:
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


def replied_contact_ids():
    """Contact ids that have genuinely replied, read from the message records.

    The contact-level status 'finished_replied' does NOT exist in this Apollo account - the
    only observed values are active / paused / failed / finished, and a contact who replied
    looks identical to one who merely reached the end of the sequence. Checking for it meant
    reply-suppression never fired even once, so anyone who answered could be re-enrolled and
    mailed again. The message-level 'replied' flag is the real signal.

    An out-of-office auto-reply is not a reply: suppressing on it would permanently retire a
    live prospect who never actually answered.
    """
    ids, page = set(), 1
    while page <= 20:
        d = post("emailer_messages/search", {"per_page": 100, "page": page})
        got = d.get("emailer_messages") or []
        if not got:
            break
        for m in got:
            if m.get("replied") and m.get("reply_class") != "out_of_office" and m.get("contact_id"):
                ids.add(m["contact_id"])
        if len(got) < 100:
            break
        page += 1
    return ids


def apollo_contact_index():
    """email -> {id, replied} for every contact in Apollo."""
    replied = replied_contact_ids()
    idx = {}
    page = 1
    while True:
        d = post("contacts/search", {"per_page": 100, "page": page})
        for c in d.get("contacts", []):
            if not c.get("email"):
                continue
            # A suppressed duplicate must never be picked as the enrollable record.
            if c.get("email_unsubscribed"):
                continue
            idx[c["email"].lower()] = {"id": c["id"],
                                       "replied": c["id"] in replied}
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
        if not gap:
            return None
        overdue = acc["days_since"] - gap
        if CONFIG.get("champion_mode") == "occasion":
            # occasion buyers (Wild Eggs): recoverable window, then one lost-cause touch
            if 30 <= overdue <= 180:
                return "champion-recoverable"
            if overdue > 180:
                return "champion-lost-cause"  # single-touch; cooldown state prevents repeats
            return None
        if overdue > GRACE_DAYS:
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
        if last and (target == "champion-lost-cause"  # lost-cause fires once, ever
                     or (today - date.fromisoformat(last)).days < COOLDOWN_DAYS):
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
