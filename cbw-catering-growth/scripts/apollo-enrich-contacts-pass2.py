"""Pass-2 Apollo enrichment: org-size-aware title rules + org-id fallback search.

Key differences from v1:
- Looks up the company first (mixed_companies/search) to get employee count + org id.
- Small orgs (<=100 employees, or unknown size): owner/founder/president/CEO/GM are
  GOOD matches (they are the catering decision-maker), not excluded.
- Larger orgs keep the exec exclusion but get a broadened title list
  (marketing, events, catering, food service, GM/store/branch manager, generic manager).
- Falls back to people-search by organization_id when keyword search finds nobody.
- Caches every API response to disk keyed by account slug; safe to re-run/resume.
"""
import csv
import json
import os
import re
import sys
import time

import requests

API_KEY = os.environ["APOLLO_API_KEY"]
HEADERS = {"x-api-key": API_KEY, "Content-Type": "application/json", "Cache-Control": "no-cache"}
PEOPLE_SEARCH_URL = "https://api.apollo.io/api/v1/mixed_people/api_search"
ORG_SEARCH_URL = "https://api.apollo.io/api/v1/mixed_companies/search"
MATCH_URL = "https://api.apollo.io/api/v1/people/bulk_match"

CACHE_DIR = os.environ.get("APOLLO_CACHE_DIR", "cache_v2")

FIELDNAMES = [
    "Location", "Slug", "Street Address", "City", "State", "Zip Code", "Assigned Store",
    "Order Count", "First Order Date", "Last Order Date", "Days Since Last Order",
    "Median Reorder Gap (days)", "Avg Food Total", "Total Food Spend", "Primary Source", "Segment",
    "Apollo Matched", "Contact First Name", "Contact Last Name", "Contact Title", "Contact Email",
    "Email Status", "Apollo Org Name Matched", "Match Notes",
]

STOPWORDS = {"the", "inc", "llc", "corp", "corporation", "company", "co", "group", "of", "and",
             "university", "in", "st.", "saint", "ltd", "services"}

SMALL_ORG_MAX = 100

# (score, keywords) — checked in order, first hit wins. Higher = better.
TIERS_COMMON = [
    (5, ["human resources", "hr manager", "hr business partner", "hr specialist", "hr generalist",
         "hr director", "hr coordinator", "people operations", "people ops", "people & culture",
         "people and culture", "talent acquisition", "facilities"]),
    (4, ["office manager", "office coordinator", "practice manager", "executive assistant",
         "administrative assistant", "workplace", "receptionist", "office admin"]),
    (3, ["event", "catering", "food service", "food & beverage", "food and beverage", "kitchen",
         "dining", "hospitality", "community manager", "community relations", "employee experience",
         "culture", "engagement"]),
    (2, ["operations manager", "ops manager", "operations coordinator", "procurement", "purchasing",
         "recruiter", "recruiting", "benefits", "marketing", "admin"]),
]
TIERS_SMALL_ONLY = [
    (4, ["owner", "founder", "president", "general manager", " gm", "principal", "managing partner",
         "managing director"]),
    (3, ["ceo", "chief executive"]),
    (2, ["coo", "chief operating", "cfo", "chief financial", "director"]),
    (1, ["manager"]),
]
TIERS_LARGE_ONLY = [
    (1, ["general manager", "store manager", "branch manager", "plant manager", "site manager",
         "location manager"]),
]

SENIOR_EXCLUDE = ["vice president", " vp ", "vp,", "vp -", "chief ", " svp", " evp",
                  "president", " ceo", " cfo", " coo", " cio", " chro", "founder",
                  "executive director"]


def clean_company_name(name):
    name = re.sub(r"\s*-\s*c/o.*$", "", name, flags=re.IGNORECASE)
    name = re.sub(r"\s*\(.*?\)\s*", " ", name)
    return name.strip()


def tokens(name):
    words = re.findall(r"[a-z0-9]+", name.lower())
    return {w for w in words if w not in STOPWORDS and len(w) >= 3}


def is_too_senior(title):
    t = f" {title.lower()} "
    return any(k in t for k in SENIOR_EXCLUDE)


def title_score(title, small_org):
    if not title:
        return 0
    t = f" {title.lower()} "
    if not small_org and is_too_senior(title):
        return 0
    tiers = TIERS_COMMON + (TIERS_SMALL_ONLY if small_org else TIERS_LARGE_ONLY)
    best = 0
    for score, keywords in tiers:
        if any(k in t for k in keywords):
            best = max(best, score)
    return best


def cache_path(slug, kind):
    safe = re.sub(r"[^a-z0-9_-]+", "_", slug.lower())[:80]
    return os.path.join(CACHE_DIR, f"{safe}.{kind}.json")


def cached_post(slug, kind, url, body):
    path = cache_path(slug, kind)
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f), True
    r = None
    for attempt in range(6):
        try:
            r = requests.post(url, headers=HEADERS, json=body, timeout=30)
        except requests.exceptions.RequestException:
            time.sleep(3 * (attempt + 1))
            continue
        if r.status_code == 429:
            time.sleep(2 * (attempt + 1))
            continue
        break
    if r is None:
        return {"_error": "network failure after retries"}, False
    if r.status_code != 200:
        return {"_error": f"{r.status_code}: {r.text[:200]}"}, False
    data = r.json()
    with open(path, "w") as f:
        json.dump(data, f)
    time.sleep(0.25)
    return data, False


def find_org(slug, clean_name, city, state):
    body = {"q_organization_name": clean_name, "per_page": 5}
    data, _ = cached_post(slug, "org", ORG_SEARCH_URL, body)
    if "_error" in data:
        return None
    orgs = (data.get("organizations") or []) + (data.get("accounts") or [])
    name_toks = tokens(clean_name)
    best = None
    for o in orgs:
        if name_toks and not (tokens(o.get("name") or "") & name_toks):
            continue
        o_city = (o.get("city") or "").lower()
        o_state = (o.get("state") or "").lower()
        loc_bonus = 1 if (city and city.lower() == o_city) or (state and state.lower() in o_state) else 0
        emp = o.get("estimated_num_employees")
        rev = o.get("organization_revenue")
        owned = bool(o.get("owned_by_organization_id"))
        cand = {"id": o.get("id"), "name": o.get("name"), "employees": emp, "loc": loc_bonus,
                "revenue": rev, "owned": owned}
        if best is None or cand["loc"] > best["loc"]:
            best = cand
    return best


def pick_person(people, name_toks, small_org, require_org_overlap=True):
    best, best_score = None, 0
    for p in people:
        org_name = (p.get("organization") or {}).get("name") or ""
        if require_org_overlap and name_toks and not (tokens(org_name) & name_toks):
            continue
        score = title_score(p.get("title"), small_org)
        if score > best_score:
            best_score = score
            best = {"id": p["id"], "org_name": org_name, "title": p.get("title")}
    return best, best_score


def search_candidate(slug, clean_name, city, state):
    org = find_org(slug, clean_name, city, state)
    emp = org.get("employees") if org else None
    if emp is not None:
        small = emp <= SMALL_ORG_MAX
    elif org and (org.get("owned") or (org.get("revenue") or 0) >= 25_000_000):
        small = False
    else:
        small = True
    name_toks = tokens(clean_name)

    body = {"q_keywords": clean_name, "per_page": 25}
    if city and state:
        body["person_locations"] = [f"{city}, {state}"]
    data, _ = cached_post(slug, "kw", PEOPLE_SEARCH_URL, body)
    if "_error" in data:
        return None, f"People search API error: {data['_error']}"
    people = data.get("people", []) or []
    cand, score = pick_person(people, name_toks, small)

    if cand is None and org and org.get("id"):
        body2 = {"organization_ids": [org["id"]], "per_page": 10}
        if state:
            body2["person_locations"] = [state]
        data2, _ = cached_post(slug, "orgppl", PEOPLE_SEARCH_URL, body2)
        people2 = data2.get("people", []) or []
        cand, score = pick_person(people2, name_toks, small, require_org_overlap=False)
        if cand:
            cand["via"] = "org-id"

    if cand is None:
        return None, f"No plausible contact (pass 2, {'small' if small else 'large'} org, emp={emp})."
    cand["small"] = small
    cand["emp"] = emp
    cand["score"] = score
    return cand, None


def match_batch(candidates):
    details = [{"id": c["id"], "organization_name": c["org_name"]} for c in candidates]
    r = None
    for attempt in range(6):
        try:
            r = requests.post(MATCH_URL, headers=HEADERS,
                              json={"details": details, "reveal_personal_emails": False}, timeout=60)
        except requests.exceptions.RequestException:
            time.sleep(3 * (attempt + 1))
            continue
        if r.status_code == 429:
            time.sleep(2 * (attempt + 1))
            continue
        break
    if r is None:
        return None, "network failure after retries"
    if r.status_code != 200:
        return None, f"Match API error {r.status_code}: {r.text[:200]}"
    return r.json().get("matches", []), None


def main():
    input_path, output_path = sys.argv[1], sys.argv[2]
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else None
    os.makedirs(CACHE_DIR, exist_ok=True)

    with open(input_path, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    if limit:
        rows = rows[:limit]

    pending = []
    for i, row in enumerate(rows):
        clean_name = clean_company_name(row["Location"])
        cand, note = search_candidate(row["Slug"] or clean_name, clean_name, row["City"], row["State"])
        for k in FIELDNAMES[16:]:
            row[k] = ""
        row["Apollo Matched"] = "False"
        row["Match Notes"] = note or ""
        if cand:
            pending.append((i, cand))
        tag = f"candidate ({cand['title']!r}, score {cand['score']}, {'small' if cand['small'] else 'large'})" if cand else "no candidate"
        print(f"[{i+1}/{len(rows)}] {row['Location']!r} -> {tag}", file=sys.stderr)

    print(f"Search done. {len(pending)}/{len(rows)} candidates.", file=sys.stderr)

    for start in range(0, len(pending), 10):
        batch = pending[start:start + 10]
        matches, err = match_batch([c for _, c in batch])
        if err:
            for i, _ in batch:
                rows[i]["Match Notes"] = f"Match call failed: {err}"
            print(f"batch {start}: ERROR {err}", file=sys.stderr)
            continue
        by_id = {m["id"]: m for m in matches}
        for i, c in batch:
            m = by_id.get(c["id"])
            if not m:
                rows[i]["Match Notes"] = "Match call returned no result for candidate."
                continue
            email = m.get("email")
            rows[i]["Apollo Matched"] = "True" if email else "False"
            rows[i]["Contact First Name"] = m.get("first_name") or ""
            rows[i]["Contact Last Name"] = m.get("last_name") or ""
            rows[i]["Contact Title"] = m.get("title") or ""
            rows[i]["Contact Email"] = email or ""
            rows[i]["Email Status"] = m.get("email_status") or ""
            rows[i]["Apollo Org Name Matched"] = c["org_name"]
            note = f"pass2 {'small-org' if c['small'] else 'large-org'} rules"
            if c.get("via") == "org-id":
                note += ", via org-id search"
            rows[i]["Match Notes"] = note if email else note + "; matched contact but no email on file."
        print(f"batch {start}: {len(matches)} matches", file=sys.stderr)
        time.sleep(0.5)

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=FIELDNAMES)
        w.writeheader()
        for row in rows:
            w.writerow({k: row.get(k, "") for k in FIELDNAMES})

    matched = sum(1 for r in rows if r["Apollo Matched"] == "True")
    print(f"DONE. {matched}/{len(rows)} matched with email.", file=sys.stderr)


if __name__ == "__main__":
    main()
