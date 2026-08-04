"""CBW store-radius lookalike engine.

For a given store: search Apollo for companies that look like our champions
(healthcare + education NAICS, plus general offices, 20-499 employees) in the
cities that store already delivers to (its de-facto radius), exclude companies
we already serve, find the catering-buyer persona at each (same heuristic as
apollo-enrich-contacts-pass2.py), reveal emails, and enroll into Cold Reintro
tagged source:lookalike.

Run: APOLLO_API_KEY=... python3 scripts/lookalike-engine.py "Lindell/SLU" [max_orgs] [--enroll]
Without --enroll it just writes the prospect CSV (no sequence changes).
"""
import csv
import json
import os
import re
import sys
import time
from collections import Counter

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

NAICS_TARGETS = [["62"], ["61"], None]  # healthcare, education, general offices
EMPLOYEE_RANGES = ["20,49", "50,99", "100,199", "200,499"]

STOPWORDS = {"the", "inc", "llc", "corp", "corporation", "company", "co", "group", "of", "and",
             "university", "in", "st.", "saint", "ltd", "services"}
TIERS_COMMON = [
    (5, ["human resources", "hr manager", "hr business partner", "hr specialist", "hr generalist",
         "hr director", "hr coordinator", "people operations", "talent acquisition", "facilities"]),
    (4, ["office manager", "office coordinator", "practice manager", "executive assistant",
         "administrative assistant", "workplace", "receptionist", "office admin"]),
    (3, ["event", "catering", "food service", "kitchen", "dining", "hospitality",
         "community manager", "employee experience", "culture", "engagement"]),
    (2, ["operations manager", "ops manager", "operations coordinator", "procurement",
         "purchasing", "recruiter", "benefits", "marketing", "admin"]),
]
TIERS_SMALL_ONLY = [
    (4, ["owner", "founder", "president", "general manager", " gm", "principal",
         "managing partner", "managing director"]),
    (3, ["ceo", "chief executive"]),
    (2, ["coo", "chief operating", "cfo", "director"]),
    (1, ["manager"]),
]
SENIOR_EXCLUDE = ["vice president", " vp ", "vp,", "chief ", " svp", " evp", "president",
                  " ceo", " cfo", " coo", "founder", "executive director"]


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


def tokens(name):
    return {w for w in re.findall(r"[a-z0-9]+", name.lower())
            if w not in STOPWORDS and len(w) >= 3}


def title_score(title, small):
    if not title:
        return 0
    t = f" {title.lower()} "
    if not small and any(k in t for k in SENIOR_EXCLUDE):
        return 0
    tiers = TIERS_COMMON + (TIERS_SMALL_ONLY if small else [])
    return max([s for s, kws in tiers if any(k in t for k in kws)] or [0])


def main():
    store = sys.argv[1]
    max_orgs = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2].isdigit() else 20
    do_enroll = "--enroll" in sys.argv

    # geofence = cities this store already delivers to
    cities = Counter()
    known_tokensets = []
    with open(os.path.join(DATA, "accounts-master.csv"), newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            toks = tokens(r["Location"])
            if toks:
                known_tokensets.append(toks)
            if r["Assigned Store"] == store and r["City"]:
                cities[f"{r['City']}, {r['State']}"] += 1
    geofence = [c for c, _ in cities.most_common(8)]
    allowed = allowed_states_for(DATA)
    print(f"store {store!r} geofence: {geofence} | allowed states: {sorted(allowed)}")

    # discover orgs
    prospects = {}
    for naics in NAICS_TARGETS:
        if len(prospects) >= max_orgs:
            break
        body = {"organization_locations": geofence,
                "organization_num_employees_ranges": EMPLOYEE_RANGES, "per_page": 25}
        if naics:
            body["organization_naics_codes"] = naics
        d = post("mixed_companies/search", body)
        for o in (d.get("organizations") or []):
            name = o.get("name") or ""
            toks = tokens(name)
            if toks and any(ks <= toks or len(toks & ks) / len(ks) >= 0.6
                            for ks in known_tokensets):
                continue  # already a customer
            if o["id"] not in prospects and len(prospects) < max_orgs:
                prospects[o["id"]] = {"name": name, "emp": o.get("estimated_num_employees"),
                                      "city": o.get("city"), "naics": naics[0] if naics else "general"}
        time.sleep(0.4)
    print(f"{len(prospects)} net-new prospect orgs")

    # persona search per org
    out_rows = []
    candidates = []
    for org_id, meta in prospects.items():
        small = (meta["emp"] or 999) <= 100
        d = post("mixed_people/api_search",
                 {"organization_ids": [org_id], "person_locations": geofence, "per_page": 10})
        best, score = None, 0
        for p in d.get("people", []) or []:
            s = title_score(p.get("title"), small)
            if s > score:
                best, score = p, s
        if best:
            candidates.append({"org_id": org_id, "person_id": best["id"],
                               "org_name": meta["name"], "title": best.get("title"), "meta": meta})
        time.sleep(0.3)
    print(f"{len(candidates)} orgs with a plausible persona")

    # reveal emails
    enriched = []
    for i in range(0, len(candidates), 10):
        batch = candidates[i:i+10]
        d = post("people/bulk_match",
                 {"details": [{"id": c["person_id"], "organization_name": c["org_name"]}
                              for c in batch],
                  "reveal_personal_emails": False})
        by_id = {m["id"]: m for m in d.get("matches", [])}
        for c in batch:
            m = by_id.get(c["person_id"])
            if (m and m.get("email") and m.get("email_status") == "verified"
                    and person_in_market(m, allowed)):
                enriched.append({**c, "first_name": m.get("first_name"),
                                 "last_name": m.get("last_name"), "email": m["email"]})
        time.sleep(0.5)
    print(f"{len(enriched)} with verified emails")

    slug = re.sub(r"[^a-z0-9]+", "-", store.lower()).strip("-")
    out_path = os.path.join(DATA, f"lookalikes-{slug}.csv")
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["org_name", "vertical", "employees", "city", "contact", "title", "email"])
        for e in enriched:
            w.writerow([e["org_name"], e["meta"]["naics"], e["meta"]["emp"], e["meta"]["city"],
                        f"{e['first_name']} {e['last_name']}", e["title"], e["email"]])
    print(f"wrote {out_path}")

    if do_enroll and enriched:
        contact_ids = []
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
            contact_ids.append(d["contact"]["id"])
            time.sleep(0.2)
        post("labels/add_entity_ids_to_label_names",
             {"entity_ids": contact_ids, "modality": "contacts",
              "label_names": ["brand:cbw", "source:lookalike", f"store:{slug}"]})
        for i in range(0, len(contact_ids), 25):
            post(f"emailer_campaigns/{COLD_SEQ}/add_contact_ids", {
                "contact_ids": contact_ids[i:i+25],
                "emailer_campaign_id": COLD_SEQ,
                "send_email_from_email_account_id": SENDER_ACCOUNT_ID,
                "sequence_active_in_other_campaigns": True,
            })
            time.sleep(0.4)
        print(f"enrolled {len(contact_ids)} lookalike contacts into Cold Reintro (paused)")


if __name__ == "__main__":
    main()
