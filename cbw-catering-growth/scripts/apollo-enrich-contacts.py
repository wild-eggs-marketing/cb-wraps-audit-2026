import csv
import json
import os
import re
import sys
import time

import requests

API_KEY = os.environ["APOLLO_API_KEY"]
HEADERS = {"x-api-key": API_KEY, "Content-Type": "application/json", "Cache-Control": "no-cache"}
SEARCH_URL = "https://api.apollo.io/api/v1/mixed_people/api_search"
MATCH_URL = "https://api.apollo.io/api/v1/people/bulk_match"

FIELDNAMES = [
    "Location", "Slug", "Street Address", "City", "State", "Zip Code", "Assigned Store",
    "Order Count", "First Order Date", "Last Order Date", "Days Since Last Order",
    "Median Reorder Gap (days)", "Avg Food Total", "Total Food Spend", "Primary Source", "Segment",
    "Apollo Matched", "Contact First Name", "Contact Last Name", "Contact Title", "Contact Email",
    "Email Status", "Apollo Org Name Matched", "Match Notes",
]

STOPWORDS = {"the", "inc", "llc", "corp", "corporation", "company", "co", "group", "of", "and",
             "university", "in", "st.", "saint", "ltd", "services"}

TITLE_TIERS = [
    (3, ["human resources", "hr manager", "hr business partner", "hr specialist", "hr generalist",
         "hr director", "hr coordinator", "people operations", "people ops", "people & culture",
         "people and culture", "chief people officer", "talent acquisition"]),
    (3, ["facilities"]),
    (2, ["office manager", "office coordinator", "administrative assistant", "executive assistant",
         "executive administrative assistant", "recruiter", "recruiting"]),
    (2, ["practice manager", "workplace", "benefits", "receptionist"]),
    (1, ["operations manager", "operations engineering manager", "ops manager",
         "operations coordinator", "procurement", "purchasing", "event coordinator",
         "event manager", "events manager", "office admin", "admin"]),
]


def clean_company_name(name):
    name = re.sub(r"\s*-\s*c/o.*$", "", name, flags=re.IGNORECASE)
    name = re.sub(r"\s*\(.*?\)\s*", " ", name)
    return name.strip()


def tokens(name):
    words = re.findall(r"[a-z0-9]+", name.lower())
    return {w for w in words if w not in STOPWORDS and len(w) >= 3}


SENIOR_EXCLUDE = ["vice president", " vp ", "vp,", "vp -", "chief ", " svp", " evp",
                  "president", " ceo", " cfo", " coo", " cio", " chro", "founder",
                  "executive director"]


def is_too_senior(title):
    t = f" {title.lower()} "
    return any(k in t for k in SENIOR_EXCLUDE)


def title_score(title):
    if not title or is_too_senior(title):
        return 0
    t = title.lower()
    for score, keywords in TITLE_TIERS:
        if any(k in t for k in keywords):
            return score
    return 0


def request_with_retry(method, url, **kwargs):
    for attempt in range(4):
        r = requests.request(method, url, headers=HEADERS, timeout=30, **kwargs)
        if r.status_code == 429:
            time.sleep(2 * (attempt + 1))
            continue
        return r
    return r


def search_candidate(clean_name, city, state):
    loc = f"{city}, {state}" if city and state else None
    body = {"q_keywords": clean_name, "per_page": 25}
    if loc:
        body["person_locations"] = [loc]
    r = request_with_retry("POST", SEARCH_URL, json=body)
    if r.status_code != 200:
        return None, f"Search API error {r.status_code}: {r.text[:200]}"
    data = r.json()
    people = data.get("people", []) or []
    name_toks = tokens(clean_name)

    best = None
    best_score = -1
    for p in people:
        org_name = (p.get("organization") or {}).get("name") or ""
        if name_toks and not (tokens(org_name) & name_toks):
            continue
        score = title_score(p.get("title"))
        if score > best_score:
            best_score = score
            best = p
            best_org_name = org_name

    if best is None or best_score <= 0:
        return None, f"No plausible HR/ops/facilities/admin contact found near {city}, {state}."
    return {"id": best["id"], "org_name": best_org_name, "title": best.get("title"),
            "first_name": best.get("first_name")}, None


def match_batch(candidates):
    details = [{"id": c["id"], "organization_name": c["org_name"]} for c in candidates]
    r = request_with_retry("POST", MATCH_URL, json={"details": details, "reveal_personal_emails": False})
    if r.status_code != 200:
        return None, f"Match API error {r.status_code}: {r.text[:200]}"
    data = r.json()
    return data.get("matches", []), None


def main():
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else None

    with open(input_path, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    if limit:
        rows = rows[:limit]

    pending = []  # (row_index, candidate)
    for i, row in enumerate(rows):
        clean_name = clean_company_name(row["Location"])
        candidate, note = search_candidate(clean_name, row["City"], row["State"])
        row["Apollo Matched"] = "False"
        row["Contact First Name"] = ""
        row["Contact Last Name"] = ""
        row["Contact Title"] = ""
        row["Contact Email"] = ""
        row["Email Status"] = ""
        row["Apollo Org Name Matched"] = ""
        row["Match Notes"] = note or ""
        if candidate:
            pending.append((i, candidate))
        print(f"[{i+1}/{len(rows)}] search: {row['Location']!r} -> "
              f"{'candidate: ' + candidate['title'] if candidate else 'no candidate'}", file=sys.stderr)
        time.sleep(0.25)

    print(f"Search phase done. {len(pending)}/{len(rows)} accounts have a candidate for matching.",
          file=sys.stderr)

    for batch_start in range(0, len(pending), 10):
        batch = pending[batch_start:batch_start + 10]
        candidates = [c for _, c in batch]
        matches, err = match_batch(candidates)
        if err:
            for i, c in batch:
                rows[i]["Match Notes"] = f"Match call failed: {err}"
            print(f"batch {batch_start}: ERROR {err}", file=sys.stderr)
            time.sleep(1)
            continue
        matches_by_id = {m["id"]: m for m in matches}
        for i, c in batch:
            m = matches_by_id.get(c["id"])
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
            if not email:
                rows[i]["Match Notes"] = "Matched a plausible contact but no email on file."
        print(f"batch {batch_start}: matched {len(matches)} of {len(candidates)}", file=sys.stderr)
        time.sleep(0.5)

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=FIELDNAMES)
        w.writeheader()
        for row in rows:
            w.writerow({k: row.get(k, "") for k in FIELDNAMES})

    matched_count = sum(1 for r in rows if r["Apollo Matched"] == "True")
    print(f"DONE. {matched_count}/{len(rows)} accounts matched with a usable email.", file=sys.stderr)


if __name__ == "__main__":
    main()
