"""Perpetual daily net-new lead expansion, both brands, self-budgeting.

Each run (one per calendar day):
 - rotates through all 15 CBW + 19 WE stores, all target verticals, going one
   search page DEEPER per store/vertical each day (state file), so results stay
   net-new instead of re-finding page 1;
 - persona-matches and reveals verified emails with the proven tier heuristics;
 - CBW leads -> created, labeled, enrolled in CBW Cold Reintro (paused/capped);
   WE leads -> created, labeled, store fields stamped, enrolled in WE Cold (paused);
 - stops at the DAILY_CONTACT_QUOTA or when the credit ledger hits the reserve
   floor, whichever comes first. Ledger: 1 reveal ~= 1 credit, search overhead
   estimated at 0.35/reveal; floor keeps >= RESERVE credits for the lifecycle
   engine and re-enrichment.

State: expansion-state.json (page cursors, daily ledger, lifetime totals).
Stop:  create the file STOP_EXPANSION next to this script.
"""
import csv
import glob
import json
import os
import re
import time
from collections import Counter
from datetime import date

import requests

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
HERE = os.path.dirname(os.path.abspath(__file__))
STATE_PATH = os.path.join(HERE, "expansion-state.json")

DAILY_CONTACT_QUOTA = 60
CONTACTS_PER_ORG = 2  # e.g. office manager AND HR lead at the same site
CREDITS_BUDGET_START = 1700   # trued up manually; ledger counts down from here
RESERVE_FLOOR = 400

CBW_DATA = "/home/user/cb-wraps-audit-2026/cbw-catering-growth/data"
WE_DATA = "/home/user/cb-wraps-audit-2026/wildeggs-catering-growth/data"
CBW_COLD, CBW_SENDER = "6a69d5305214390010407a8d", "6a67c6456fab0c0020dec04d"
WE_COLD, WE_SENDER = "6a6a3fce1dfd6f0018cb9ec6", "6a6a51a90618ba001ca84350"
F_NAME, F_EMAIL, F_URL = "6a6a30e70618ba0018f4cce7", "6a6a30e7a24677000c36ff4e", "6a6a30e8a24677000c36ff51"

CBW_NAICS = [["62"], ["61"], ["54"], ["52"], ["31", "32", "33"], ["8131"], ["92"], ["71"], ["23"], None]
WE_NAICS = [["8131"], ["62"], ["52"], ["61"], ["54"], ["92"], ["71"], None]
EMPLOYEE_RANGES = ["11,20", "20,49", "50,99", "100,199", "200,499", "500,1000"]
WE_STATIC_GEOFENCE = {
    "Hamburg": ["Lexington, KY", "Georgetown, KY", "Winchester, KY"],
    "Palomar": ["Lexington, KY", "Versailles, KY", "Nicholasville, KY"],
    "Tates Creek": ["Lexington, KY", "Nicholasville, KY", "Richmond, KY"],
}
STOPWORDS = {"the", "inc", "llc", "corp", "corporation", "company", "co", "group", "of", "and",
             "university", "in", "st.", "saint", "ltd", "services"}
TIERS_COMMON = [
    (5, ["human resources", "hr manager", "hr business partner", "hr specialist", "hr generalist",
         "hr director", "hr coordinator", "people operations", "talent acquisition", "facilities"]),
    (4, ["office manager", "office coordinator", "practice manager", "executive assistant",
         "administrative assistant", "workplace", "receptionist", "office admin"]),
    (3, ["event", "catering", "hospitality", "community", "engagement", "connections",
         "congregational", "parish", "ministries", "food service", "dining"]),
    (2, ["operations manager", "ops manager", "operations coordinator", "benefits", "marketing",
         "admin", "procurement", "purchasing", "recruiter"]),
]
TIERS_SMALL = [
    (4, ["owner", "founder", "president", "general manager", " gm", "principal",
         "managing partner", "executive pastor", "pastor of operations"]),
    (2, ["director", "pastor"]),
    (1, ["manager"]),
]
SENIOR_EXCLUDE = ["vice president", " vp ", "vp,", "chief ", " svp", " evp", "president",
                  " ceo", " cfo", " coo", "founder", "executive director"]


def post(path, body):
    for a in range(6):
        try:
            r = requests.post(f"{BASE}/{path}", headers=H, json=body, timeout=30)
        except requests.exceptions.RequestException:
            time.sleep(3 * (a + 1)); continue
        if r.status_code == 429:
            time.sleep(30 * (a + 1)); continue
        break
    if r.status_code != 200:
        raise RuntimeError(f"POST {path} -> {r.status_code}: {r.text[:150]}")
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
    tiers = TIERS_COMMON + (TIERS_SMALL if small else [])
    return max([s for s, kws in tiers if any(k in t for k in kws)] or [0])


def load_known(data_dir):
    known = []
    mp = os.path.join(data_dir, "accounts-master.csv")
    if os.path.exists(mp):
        for r in csv.DictReader(open(mp, encoding="utf-8")):
            t = tokens(r["Location"])
            if t:
                known.append(t)
    for path in glob.glob(os.path.join(data_dir, "lookalikes-*.csv")) + \
                glob.glob(os.path.join(data_dir, "signals-*.csv")) + \
                glob.glob(os.path.join(data_dir, "daily-*.csv")):
        for r in csv.DictReader(open(path, encoding="utf-8")):
            t = tokens(r.get("org_name") or "")
            if t:
                known.append(t)
    return known


def store_geofences(data_dir, static=None):
    fences = {}
    cities = {}
    mp = os.path.join(data_dir, "accounts-master.csv")
    for r in csv.DictReader(open(mp, encoding="utf-8")):
        s = r["Assigned Store"]
        if s and r["City"]:
            cities.setdefault(s, Counter())[f"{r['City']}, {r['State']}"] += 1
    for s, c in cities.items():
        fences[s] = [x for x, _ in c.most_common(8)]
    if static:
        fences.update(static)
    return fences


def run_brand(brand, state, ledger, quota_left):
    if brand == "cbw":
        data_dir, naics_list, cold, sender = CBW_DATA, CBW_NAICS, CBW_COLD, CBW_SENDER
        fences = store_geofences(data_dir)
        labels_base = ["brand:cbw", "source:daily-expansion"]
    else:
        data_dir, naics_list, cold, sender = WE_DATA, WE_NAICS, WE_COLD, WE_SENDER
        fences = store_geofences(data_dir, WE_STATIC_GEOFENCE)
        labels_base = ["brand:wildeggs", "source:daily-expansion"]
        emails_map = {r["ez_cater_store_name"]: r["reply_email"]
                      for r in csv.DictReader(open(f"{WE_DATA}/store-emails.csv"))}
        urls_map = {r["ez_cater_store_name"]: r["toast_catering_url"]
                    for r in csv.DictReader(open(f"{WE_DATA}/store-urls.csv"))}

    known = load_known(data_dir)
    allowed = allowed_states_for(data_dir)
    created_total = 0
    rows_out = []
    cursor = state.setdefault("cursors", {}).setdefault(brand, {})
    stores = list(fences.keys())
    start = state.setdefault("store_offset", {}).setdefault(brand, 0)

    for si in range(len(stores)):
        if created_total >= quota_left or ledger["remaining"] <= RESERVE_FLOOR:
            break
        store = stores[(start + si) % len(stores)]
        key0 = f"{store}"
        for naics in naics_list:
            if created_total >= quota_left or ledger["remaining"] <= RESERVE_FLOOR:
                break
            nkey = ",".join(naics) if naics else "general"
            page = cursor.get(f"{key0}|{nkey}", 1)
            body = {"organization_locations": fences[store],
                    "organization_num_employees_ranges": EMPLOYEE_RANGES,
                    "per_page": 25, "page": page}
            if naics:
                body["organization_naics_codes"] = naics
            try:
                d = post("mixed_companies/search", body)
            except RuntimeError:
                continue
            ledger["remaining"] -= 1
            orgs = d.get("organizations") or []
            cursor[f"{key0}|{nkey}"] = page + 1 if orgs else 1  # wrap when a vertical dries up
            fresh = []
            for o in orgs:
                name_l = (o.get("name") or "").lower()
                if any(k in name_l for k in ("staffing", "recruit", "talent solutions",
                                             "employment agency", "interim physicians")):
                    continue  # agencies: high hiring signal, low catering intent
                t = tokens(o.get("name") or "")
                if t and any(ks <= t or len(t & ks) / len(ks) >= 0.6 for ks in known):
                    continue
                fresh.append(o)
            for o in fresh[:6]:  # spread quota across stores/verticals
                if created_total >= quota_left:
                    break
                small = (o.get("estimated_num_employees") or 999) <= 100
                try:
                    pd = post("mixed_people/api_search", {"organization_ids": [o["id"]],
                              "person_locations": fences[store], "per_page": 10})
                except RuntimeError:
                    continue
                ledger["remaining"] -= 0.35
                scored = []
                for p in pd.get("people", []) or []:
                    sc = title_score(p.get("title"), small)
                    if sc > 0:
                        scored.append((sc, p))
                scored.sort(key=lambda x: -x[0])
                picks = [p for _, p in scored[:CONTACTS_PER_ORG]]
                if not picks:
                    continue
                try:
                    # one batched reveal: the org search is the shared cost, so a second
                    # persona at the same site is materially cheaper than a new company
                    md = post("people/bulk_match",
                              {"details": [{"id": p["id"], "first_name": p.get("first_name"),
                                            "organization_name": o.get("name")} for p in picks],
                               "reveal_personal_emails": False})
                except RuntimeError:
                    continue
                matches = [m for m in (md.get("matches") or [])
                           if m and m.get("email") and m.get("email_status") == "verified"
                           and person_in_market(m, allowed)]
                if not matches:
                    continue
                ledger["remaining"] -= len(matches)
                slug = re.sub(r"[^a-z0-9]+", "-", store.lower()).strip("-")
                for m in matches:
                    if created_total >= quota_left:
                        break
                    cd = post("contacts", {"first_name": m.get("first_name"), "last_name": m.get("last_name"),
                                           "title": m.get("title"), "email": m["email"],
                                           "organization_name": o.get("name")})
                    cid = cd["contact"]["id"]
                    post("labels/add_entity_ids_to_label_names",
                         {"entity_ids": [cid], "modality": "contacts",
                          "label_names": labels_base + [f"store:{slug}"]})
                    if brand == "we":
                        fields = {F_NAME: store, F_URL: urls_map.get(store, "https://wildeggs.com/catering")}
                        if emails_map.get(store):
                            fields[F_EMAIL] = emails_map[store]
                        requests.put(f"{BASE}/contacts/{cid}", headers=H, timeout=30,
                                     json={"typed_custom_fields": fields})
                    post(f"emailer_campaigns/{cold}/add_contact_ids",
                         {"contact_ids": [cid], "emailer_campaign_id": cold,
                          "send_email_from_email_account_id": sender,
                          "sequence_active_in_other_campaigns": True})
                    created_total += 1
                    rows_out.append({"org_name": o.get("name"), "vertical": nkey, "city": o.get("city"),
                                     "contact": f"{m.get('first_name')} {m.get('last_name')}",
                                     "title": m.get("title"), "email": m["email"], "store": store})
                    time.sleep(0.3)
                known.append(tokens(o.get("name") or ""))
            time.sleep(0.4)

    state["store_offset"][brand] = (start + 3) % max(len(stores), 1)
    if rows_out:
        out = os.path.join(data_dir, f"daily-{date.today().isoformat()}-{brand}.csv")
        with open(out, "a", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(rows_out[0].keys()))
            if f.tell() == 0:
                w.writeheader()
            w.writerows(rows_out)
    return created_total


def main():
    if os.path.exists(os.path.join(HERE, "STOP_EXPANSION")):
        print("STOP_EXPANSION present; skipping")
        return
    state = {}
    if os.path.exists(STATE_PATH):
        state = json.load(open(STATE_PATH))
    today = date.today().isoformat()
    if state.get("last_run") == today:
        print(f"already ran {today}; skipping")
        return
    ledger = state.setdefault("ledger", {"remaining": CREDITS_BUDGET_START})
    if ledger["remaining"] <= RESERVE_FLOOR:
        print(f"credit ledger at reserve floor ({ledger['remaining']}); not expanding")
        return

    n_cbw = run_brand("cbw", state, ledger, DAILY_CONTACT_QUOTA // 2)
    n_we = run_brand("we", state, ledger, DAILY_CONTACT_QUOTA - n_cbw)
    state["last_run"] = today
    totals = state.setdefault("totals", {"cbw": 0, "we": 0})
    totals["cbw"] += n_cbw
    totals["we"] += n_we
    json.dump(state, open(STATE_PATH, "w"), indent=1)
    print(f"=== daily expansion {today}: cbw +{n_cbw}, we +{n_we}, "
          f"ledger ~{int(ledger['remaining'])} credits, lifetime {totals}")


if __name__ == "__main__":
    main()
