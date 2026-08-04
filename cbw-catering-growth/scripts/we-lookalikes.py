"""Wild Eggs lookalike engine: per-store prospecting with WE champion profile.

Like the CBW lookalike engine but: WE data dir, WE vertical fingerprint
(churches NAICS 8131, healthcare 62, finance 52, general offices), brand:wildeggs
labels, and NO sequence enrollment (WE mailbox not linked yet) - contacts are
created, labeled source:lookalike, and stamped with the store custom fields so
a later one-command enrollment picks them up.

Run: APOLLO_API_KEY=... python3 we_lookalikes.py "<EZ Cater Store Name>" [max_orgs]
"""
import csv
import glob
import os
import re
import sys
import time
from collections import Counter

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
DATA = "/home/user/cb-wraps-audit-2026/wildeggs-catering-growth/data"
F_NAME, F_EMAIL, F_URL = "6a6a30e70618ba0018f4cce7", "6a6a30e7a24677000c36ff4e", "6a6a30e8a24677000c36ff51"

NAICS_TARGETS = [["8131"], ["62"], ["52"], None]  # churches, healthcare, finance, general
EMPLOYEE_RANGES = ["20,49", "50,99", "100,199", "200,499"]
STOPWORDS = {"the", "inc", "llc", "corp", "corporation", "company", "co", "group", "of", "and",
             "university", "in", "st.", "saint", "ltd", "services"}
TIERS_COMMON = [
    (5, ["human resources", "hr manager", "hr business partner", "hr specialist", "hr generalist",
         "hr director", "hr coordinator", "people operations", "talent acquisition", "facilities"]),
    (4, ["office manager", "office coordinator", "practice manager", "executive assistant",
         "administrative assistant", "workplace", "receptionist", "office admin"]),
    (3, ["event", "catering", "hospitality", "community", "engagement", "connections",
         "congregational", "parish", "ministry coordinator", "ministries"]),
    (2, ["operations manager", "ops manager", "operations coordinator", "benefits", "marketing",
         "admin"]),
]
TIERS_SMALL_ONLY = [
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
        if r.status_code == 429: time.sleep(20 * (a + 1)); continue
        break
    if r.status_code != 200:
        raise RuntimeError(f"POST {path} -> {r.status_code}: {r.text[:200]}")
    return r.json()


def put(path, body):
    for a in range(5):
        try:
            r = requests.put(f"{BASE}/{path}", headers=H, json=body, timeout=30)
        except requests.exceptions.RequestException:
            time.sleep(3 * (a + 1)); continue
        if r.status_code == 429: time.sleep(20 * (a + 1)); continue
        break
    return r


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
    max_orgs = int(sys.argv[2]) if len(sys.argv) > 2 else 20

    emails_map = {r["ez_cater_store_name"]: r["reply_email"]
                  for r in csv.DictReader(open(f"{DATA}/store-emails.csv"))}
    urls_map = {r["ez_cater_store_name"]: r["toast_catering_url"]
                for r in csv.DictReader(open(f"{DATA}/store-urls.csv"))}

    cities = Counter()
    known = []
    with open(f"{DATA}/accounts-master.csv", newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            t = tokens(r["Location"])
            if t:
                known.append(t)
            if r["Assigned Store"] == store and r["City"]:
                cities[f"{r['City']}, {r['State']}"] += 1
    for path in glob.glob(f"{DATA}/lookalikes-*.csv"):
        for r in csv.DictReader(open(path, encoding="utf-8")):
            t = tokens(r.get("org_name") or "")
            if t:
                known.append(t)
    geofence = [c for c, _ in cities.most_common(8)]
    print(f"{store!r} geofence: {geofence}")

    prospects = {}
    for naics in NAICS_TARGETS:
        if len(prospects) >= max_orgs:
            break
        body = {"organization_locations": geofence,
                "organization_num_employees_ranges": EMPLOYEE_RANGES, "per_page": 25}
        if naics:
            body["organization_naics_codes"] = naics
        d = post("mixed_companies/search", body)
        for o in d.get("organizations") or []:
            t = tokens(o.get("name") or "")
            if t and any(ks <= t or len(t & ks) / len(ks) >= 0.6 for ks in known):
                continue
            if o["id"] not in prospects and len(prospects) < max_orgs:
                prospects[o["id"]] = {"name": o.get("name"), "emp": o.get("estimated_num_employees"),
                                      "city": o.get("city"), "naics": naics[0] if naics else "general"}
        time.sleep(0.4)
    print(f"{len(prospects)} net-new prospect orgs")

    candidates = []
    for org_id, meta in prospects.items():
        small = (meta["emp"] or 999) <= 100
        d = post("mixed_people/api_search", {"organization_ids": [org_id],
                 "person_locations": geofence, "per_page": 10})
        best, score = None, 0
        for p in d.get("people", []) or []:
            s = title_score(p.get("title"), small)
            if s > score:
                best, score = p, s
        if best:
            candidates.append({"person_id": best["id"], "org_name": meta["name"],
                               "title": best.get("title"), "meta": meta})
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
    print(f"{len(enriched)} verified contacts")

    slug = re.sub(r"[^a-z0-9]+", "-", store.lower()).strip("-")
    out = f"{DATA}/lookalikes-{slug}.csv"
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["org_name", "vertical", "employees", "city", "contact", "title", "email"])
        for e in enriched:
            w.writerow([e["org_name"], e["meta"]["naics"], e["meta"]["emp"], e["meta"]["city"],
                        f"{e['first_name']} {e['last_name']}", e["title"], e["email"]])
    print(f"wrote {out}")

    if enriched:
        ids = []
        for e in enriched:
            d = post("contacts", {"first_name": e["first_name"], "last_name": e["last_name"],
                                  "title": e["title"], "email": e["email"],
                                  "organization_name": e["org_name"]})
            cid = d["contact"]["id"]
            ids.append(cid)
            put(f"contacts/{cid}", {"typed_custom_fields": {
                F_NAME: store, F_EMAIL: emails_map.get(store, ""),
                F_URL: urls_map.get(store, "https://wildeggs.com/catering")}})
            time.sleep(0.25)
        post("labels/add_entity_ids_to_label_names",
             {"entity_ids": ids, "modality": "contacts",
              "label_names": ["brand:wildeggs", "source:lookalike", f"store:{slug}"]})
        print(f"created + stamped {len(ids)} WE lookalike contacts (enrollment deferred to mailbox)")


if __name__ == "__main__":
    main()
