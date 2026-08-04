"""Signal-based prospecting: companies actively hiring inside a store's geofence.

A company posting jobs near a store is entering its catering moment (onboarding
lunches, interview panels, all-hands). This sweep finds them before any list would:

    APOLLO_API_KEY=... python3 scripts/signal-sweep.py "<Store Name>" [max_orgs] [--enroll]

Uses the same geofence derivation and persona/reveal pipeline as the lookalike
engine, but filters to orgs with 5+ active job postings in the last 30 days.
Excludes existing customers AND previously-swept lookalike prospects.
--enroll adds verified matches to the brand's Cold sequence tagged source:signal.
"""
import csv
import glob
import os
import re
import sys
import time
from collections import Counter
from datetime import date, timedelta

import requests

from apollo_dedupe import existing_emails

# --- person-location guard -------------------------------------------------
# Apollo's organization_ids filter matches the EMPLOYER's location, which can be a
# global HQ or a different office than the person. That let a Portland church and a
# Johannesburg office into a Kentucky/Indiana sequence. Two layers now:
#   1. person_locations is passed to the people search (ANDed with organization_ids)
#   2. the revealed person's own state is validated before a contact is created
STATE_NAMES = {"alabama":"AL","alaska":"AK","arizona":"AZ","arkansas":"AR","california":"CA",
 "colorado":"CO","connecticut":"CT","delaware":"DE","florida":"FL","georgia":"GA","hawaii":"HI",
 "idaho":"ID","illinois":"IL","indiana":"IN","iowa":"IA","kansas":"KS","kentucky":"KY",
 "louisiana":"LA","maine":"ME","maryland":"MD","massachusetts":"MA","michigan":"MI",
 "minnesota":"MN","mississippi":"MS","missouri":"MO","montana":"MT","nebraska":"NE",
 "nevada":"NV","new hampshire":"NH","new jersey":"NJ","new mexico":"NM","new york":"NY",
 "north carolina":"NC","north dakota":"ND","ohio":"OH","oklahoma":"OK","oregon":"OR",
 "pennsylvania":"PA","rhode island":"RI","south carolina":"SC","south dakota":"SD",
 "tennessee":"TN","texas":"TX","utah":"UT","vermont":"VT","virginia":"VA","washington":"WA",
 "west virginia":"WV","wisconsin":"WI","wyoming":"WY","district of columbia":"DC"}


def norm_state(s):
    s = (s or "").strip()
    if not s:
        return ""
    return STATE_NAMES.get(s.lower(), s.upper()[:2])


def allowed_states_for(data_dir, extra=()):
    """States this brand actually serves, derived from its own order history.

    Skips ezCater's own marketplace record, which appears in the export as
    Location='[REMOVED]' / City='Ezcater' / State='MA' and would otherwise admit
    Massachusetts as a served state for both brands.
    """
    import csv as _csv, os as _os
    states = set(norm_state(x) for x in extra)
    p = _os.path.join(data_dir, "accounts-master.csv")
    if _os.path.exists(p):
        for r in _csv.DictReader(open(p, encoding="utf-8")):
            loc = (r.get("Location") or "").strip().lower()
            city = (r.get("City") or "").strip().lower()
            if loc in ("[removed]", "") or "ezcater" in city or "ezcater" in loc:
                continue
            st = norm_state(r.get("State"))
            if st:
                states.add(st)
    return states


def person_in_market(match, allowed):
    """False only when we positively know the person is outside the served states."""
    st = norm_state(match.get("state"))
    if not st or not allowed:
        return True          # unknown location: let the geofenced search stand
    return st in allowed
# --------------------------------------------------------------------------


API_KEY = os.environ["APOLLO_API_KEY"]
H = {"x-api-key": API_KEY, "Content-Type": "application/json"}
BASE = "https://api.apollo.io/api/v1"
SENDER_ACCOUNT_ID = "6a67c6456fab0c0020dec04d"
COLD_SEQ = "6a69d5305214390010407a8d"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")

STOPWORDS = {"the", "inc", "llc", "corp", "corporation", "company", "co", "group", "of", "and",
             "university", "in", "st.", "saint", "ltd", "services"}
TIERS = [
    (5, ["human resources", "hr manager", "hr business partner", "hr specialist", "hr generalist",
         "hr director", "hr coordinator", "people operations", "talent acquisition", "facilities"]),
    (4, ["office manager", "office coordinator", "practice manager", "executive assistant",
         "administrative assistant", "workplace", "receptionist", "office admin", "recruiter",
         "recruiting"]),
    (3, ["event", "catering", "food service", "kitchen", "dining", "hospitality",
         "community manager", "employee experience", "culture", "engagement"]),
    (2, ["operations manager", "ops manager", "operations coordinator", "procurement",
         "purchasing", "benefits", "marketing", "admin"]),
]
SENIOR_EXCLUDE = ["vice president", " vp ", "vp,", "chief ", " svp", " evp", "president",
                  " ceo", " cfo", " coo", "founder", "executive director"]


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


def tokens(name):
    return {w for w in re.findall(r"[a-z0-9]+", name.lower())
            if w not in STOPWORDS and len(w) >= 3}


def title_score(title):
    if not title:
        return 0
    t = f" {title.lower()} "
    if any(k in t for k in SENIOR_EXCLUDE):
        return 0
    return max([s for s, kws in TIERS if any(k in t for k in kws)] or [0])


def main():
    store = sys.argv[1]
    max_orgs = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2].isdigit() else 10
    do_enroll = "--enroll" in sys.argv

    cities = Counter()
    known = []
    with open(os.path.join(DATA, "accounts-master.csv"), newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            t = tokens(r["Location"])
            if t:
                known.append(t)
            if r["Assigned Store"] == store and r["City"]:
                cities[f"{r['City']}, {r['State']}"] += 1
    for path in glob.glob(os.path.join(DATA, "lookalikes-*.csv")) + glob.glob(os.path.join(DATA, "signals-*.csv")):
        with open(path, newline="", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                t = tokens(r.get("org_name") or "")
                if t:
                    known.append(t)
    geofence = [c for c, _ in cities.most_common(8)]
    allowed = allowed_states_for(DATA)
    print(f"{store!r} geofence: {geofence} | allowed states: {sorted(allowed)}")

    since = (date.today() - timedelta(days=30)).isoformat()
    d = post("mixed_companies/search", {
        "organization_locations": geofence,
        "organization_num_employees_ranges": ["20,49", "50,99", "100,199", "200,499"],
        "organization_job_posted_at_range": {"min": since},
        "not_organization_naics_codes": ["5613"],  # staffing/recruiting agencies post jobs as their product
        "organization_num_jobs_range": {"min": 5},
        "per_page": 25,
    })
    prospects = {}
    for o in d.get("organizations") or []:
        name_l = (o.get("name") or "").lower()
        if any(k in name_l for k in ("staffing", "recruit", "talent solutions", "employment")):
            continue  # agency slipped past NAICS
        t = tokens(o.get("name") or "")
        if t and any(ks <= t or len(t & ks) / len(ks) >= 0.6 for ks in known):
            continue
        if len(prospects) < max_orgs:
            prospects[o["id"]] = {"name": o.get("name"), "emp": o.get("estimated_num_employees"),
                                  "city": o.get("city"), "jobs_signal": "hiring-5plus-30d"}
    print(f"{len(prospects)} hiring-signal orgs (net new)")

    candidates = []
    for org_id, meta in prospects.items():
        d = post("mixed_people/api_search", {"organization_ids": [org_id],
                 "person_locations": geofence, "per_page": 10})
        best, score = None, 0
        for p in d.get("people", []) or []:
            s = title_score(p.get("title"))
            if s > score:
                best, score = p, s
        if best:
            candidates.append({"org_id": org_id, "person_id": best["id"],
                               "org_name": meta["name"], "title": best.get("title"), "meta": meta})
        time.sleep(0.3)

    enriched = []
    for i in range(0, len(candidates), 10):
        batch = candidates[i:i+10]
        d = post("people/bulk_match",
                 {"details": [{"id": c["person_id"], "organization_name": c["org_name"]} for c in batch],
                  "reveal_personal_emails": False})
        by_id = {m["id"]: m for m in d.get("matches", [])}
        for c in batch:
            m = by_id.get(c["person_id"])
            if (m and m.get("email") and m.get("email_status") == "verified"
                    and person_in_market(m, allowed)):
                enriched.append({**c, "first_name": m.get("first_name"),
                                 "last_name": m.get("last_name"), "email": m["email"]})
        time.sleep(0.5)
    print(f"{len(enriched)} verified signal contacts")

    slug = re.sub(r"[^a-z0-9]+", "-", store.lower()).strip("-")
    out = os.path.join(DATA, f"signals-{slug}.csv")
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["org_name", "signal", "employees", "city", "contact", "title", "email"])
        for e in enriched:
            w.writerow([e["org_name"], e["meta"]["jobs_signal"], e["meta"]["emp"], e["meta"]["city"],
                        f"{e['first_name']} {e['last_name']}", e["title"], e["email"]])
    print(f"wrote {out}")

    if do_enroll and enriched:
        ids = []
        # Apollo's POST /contacts does not upsert on email, and neighbouring stores
        # share cities, so without this the same person is re-created (and re-charged
        # for) on every run that reaches them. See apollo_dedupe for the incident.
        already = existing_emails()
        skipped = [e for e in enriched if e["email"].strip().lower() in already]
        enriched = [e for e in enriched if e["email"].strip().lower() not in already]
        if skipped:
            print(f"skipping {len(skipped)} contacts that already exist in Apollo")
        for e in enriched:
            d = post("contacts", {"first_name": e["first_name"], "last_name": e["last_name"],
                                  "title": e["title"], "email": e["email"],
                                  "organization_name": e["org_name"]})
            ids.append(d["contact"]["id"])
            time.sleep(0.2)
        post("labels/add_entity_ids_to_label_names",
             {"entity_ids": ids, "modality": "contacts",
              "label_names": ["brand:cbw", "source:signal", f"store:{slug}"]})
        for i in range(0, len(ids), 25):
            post(f"emailer_campaigns/{COLD_SEQ}/add_contact_ids", {
                "contact_ids": ids[i:i+25], "emailer_campaign_id": COLD_SEQ,
                "send_email_from_email_account_id": SENDER_ACCOUNT_ID,
                "sequence_active_in_other_campaigns": True,
            })
            time.sleep(0.4)
        print(f"enrolled {len(ids)} signal contacts into Cold Reintro (paused)")


if __name__ == "__main__":
    main()
