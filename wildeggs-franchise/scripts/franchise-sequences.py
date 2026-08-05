"""Create, load, enroll and activate the two Wild Eggs franchise-development sequences.

Copy comes verbatim from docs/franchise-sequences-spec.md (the gauntlet's verified spec),
with the bracketed Item 19 pointer in B3 OMITTED - it is gated on counsel confirming the FDD
contains a current Item 19, which has not happened. Nothing in any step states or implies
financial performance (spec rails R1-R4).

Mechanics that are load-bearing (see CLAUDE.md):
 - bodies use the div+br spacing pattern (bare <p> collapses in Apollo's renderer);
 - templates are written via flat PUT /emailer_templates/{id};
 - activation is two gates: campaigns/approve AND every touches/approve, with retries for
   the "jobs being processed" lock that follows the first approval;
 - include_signature is NOT controllable (both step creation and PUT emailer_touches
   silently discard it), but PUT /email_accounts/{id} signature_html IS writable - so the
   mailbox signature was replaced with a brand-neutral one that serves catering and
   franchise alike, and the body carries only the role line.

Enrollment: only /tmp/fr_eligible.json (verified + US + non-registration-state + non-CASL,
39 people), split by fr_role_segment. Caps: 5/day per variant, throttled further by the
mailbox's 8/hour limit shared with catering.

Run: APOLLO_API_KEY=... python3 scripts/franchise-sequences.py
"""
import json
import os
import time

import requests

API_KEY = os.environ["APOLLO_API_KEY"]
H = {"x-api-key": API_KEY, "Content-Type": "application/json"}
BASE = "https://api.apollo.io/api/v1"
SCHEDULE_ID = "6a67a5227f926a0018c2e4bc"
WE_SENDER = "6a6a51a90618ba001ca84350"

# Identity comes from the mailbox signature (now brand-neutral, serving catering and
# franchise alike - include_signature is NOT controllable per touch, the API silently
# discards it, but PUT /email_accounts/{id} signature_html IS writable). The body carries
# only the role line so the name is not repeated.
SIGN = '<div>&mdash; Elle, Franchise Development</div><div><br></div>' 
FOOTER = ('<div><i>Not the right person for growth decisions? Say so and the emails stop.</i></div>'
          '<div><i>Wild Eggs, 1211 Herr Lane Ste 290, Louisville, KY 40222</i></div>')


def D(*paras):
    """Join paragraphs with the collapse-proof div+br pattern."""
    return "".join(f"<div>{p}</div><div><br></div>" for p in paras)


OWNER = {
    "name": "WE Franchise A1 - Owner Founder",
    "steps": [
        {"wait": 0, "subject": "a 6am-2pm concept next to your {{fr_total_units}} units",
         "body": D(
             "{{first_name}} — {{fr_approach}}",
             "I'm with Wild Eggs, a scratch-kitchen breakfast-and-brunch brand founded in "
             "Louisville in 2007 — 19 restaurants across Kentucky, Indiana, and Ohio, "
             "relaunched and growing since 2025.",
             "The whole model runs one daypart, roughly 6am to 2pm. One shift. No dinner "
             "service. That's the reason operators already running {{fr_concept_segment}} "
             "restaurants look at it.",
             "Worth a look for {{fr_territory}}? Just reply \"worth a look\" and I'll send "
             "the two-paragraph version of how we think about development territory.")},
        {"wait": 4, "subject": "first watch isn't franchising — we are",
         "body": D(
             "{{first_name}} — quick add to my last note.",
             "The two biggest names in daytime dining aren't available to operators: First "
             "Watch has been buying its franchisees <i>out</i>, and Snooze says plainly it "
             "won't franchise. The demand side of the daypart is proven; the franchisable "
             "supply is thin.",
             "Wild Eggs is one of the few scratch-kitchen brunch brands where an operator "
             "can still get real development territory — and {{fr_territory}} is open.",
             "Open to taking a look?")},
        {"wait": 5, "subject": "talk to someone running one",
         "body": D(
             "{{first_name}} — rather than send you a packet, the most useful thing I can "
             "offer is people: 20 minutes with our leadership, or directly with an operator "
             "running Wild Eggs units today, on what a single-daypart scratch kitchen "
             "actually takes to run alongside a {{fr_concept_segment}} group.",
             "No pitch deck, no forms. If a breakfast daypart could fit your next 12-24 "
             "months, I'll set the call up. If not, tell me and I'll leave you alone.")},
        {"wait": 7, "subject": "closing the file on {{fr_territory}}",
         "body": D(
             "{{first_name}} — last note from me. I'll take silence as \"not now\" and "
             "close the file.",
             "If adding a 6am-2pm concept ever makes sense for your group, "
             "{{fr_territory}} is where I'd start. One word back — \"later\" or \"no\" — "
             "and I'll act accordingly.",
             "Either way, good luck with the {{fr_total_units}} units.")},
    ],
}

CEO = {
    "name": "WE Franchise A1 - CEO President",
    "steps": [
        {"wait": 0, "subject": "daypart diversification — {{fr_territory}}",
         "body": D(
             "{{first_name}} — {{fr_approach}}",
             "One industry datapoint: per Restaurant Business's Top 500 work, essentially "
             "all the growth in family dining right now is coming from daytime-only "
             "concepts — and the biggest names there (First Watch, Snooze) don't franchise.",
             "Wild Eggs is a 19-unit scratch-kitchen breakfast brand — Louisville, founded "
             "2007, KY/IN/OH — now opening development territory to established operators. "
             "Single daypart, roughly 6am-2pm, no dinner service.",
             "Happy to share how we'd suggest a multi-unit {{fr_concept_segment}} group "
             "evaluate adding a breakfast daypart — useful whether or not we're the fit.")},
        {"wait": 4, "subject": "development rights, {{fr_territory}}",
         "body": D(
             "{{first_name}} — a group running {{fr_total_units}} units already has what "
             "makes a second concept work: sites, supervision, HR, vendor relationships. "
             "We're not looking to teach anyone the restaurant business.",
             "What Wild Eggs adds is a daypart your current portfolio doesn't touch — "
             "doors open around 6am, closed by 2pm, scratch kitchen, one shift a day.",
             "We're structuring multi-unit development agreements, not single-unit sales, "
             "and {{fr_territory}} is open.",
             "Is daypart diversification on your roadmap for the next 12-24 months?")},
        {"wait": 6, "subject": "diligence, not a pitch",
         "body": D(
             "{{first_name}} — you'll evaluate this like any acquisition, so I'll skip the "
             "marketing.",
             "What I can put in front of you: our leadership, and operators running Wild "
             "Eggs units today in our KY/OH markets — the people who can answer the "
             "questions that matter.",
             "Twenty minutes to decide whether {{fr_territory}} is worth real diligence?")},
        {"wait": 7, "subject": "last one from me",
         "body": D(
             "{{first_name}} — closing the loop. If a breakfast daypart isn't on your "
             "growth agenda, no reply needed and I'll close the file.",
             "If it's \"not now,\" send one word — \"Q1,\" \"next year\" — and I'll come "
             "back exactly then, with {{fr_territory}} status in hand. Thanks either way.")},
    ],
}


def post(path, body):
    for a in range(6):
        r = requests.post(f"{BASE}/{path}", headers=H, json=body, timeout=45)
        if r.status_code == 429:
            time.sleep(45 * (a + 1)); continue
        if r.status_code in (500, 502, 503, 504):
            time.sleep(5 * (a + 1)); continue
        break
    if r.status_code != 200:
        raise RuntimeError(f"POST {path} -> {r.status_code}: {r.text[:180]}")
    return r.json()


def put(path, body):
    for a in range(6):
        r = requests.put(f"{BASE}/{path}", headers=H, json=body, timeout=45)
        if r.status_code == 429:
            time.sleep(45 * (a + 1)); continue
        break
    if r.status_code != 200:
        raise RuntimeError(f"PUT {path} -> {r.status_code}: {r.text[:180]}")
    return r.json()


def build(seq):
    # Reuse a half-built campaign of the same name (an earlier run aborted mid-build);
    # template PUTs are idempotent so reloading content is safe.
    d = post("emailer_campaigns/search", {"per_page": 100})
    existing = next((c for c in d.get("emailer_campaigns", [])
                     if c.get("name") == seq["name"]), None)
    if existing:
        camp = existing["id"]
        print(f"reusing existing campaign {seq['name']} ({camp})")
    else:
        d = post("emailer_campaigns", {"name": seq["name"], "permissions": "team_can_use",
                                       "active": False, "emailer_schedule_id": SCHEDULE_ID,
                                       "max_emails_per_day": 5})
        camp = d["emailer_campaign"]["id"]
    got = requests.get(f"{BASE}/emailer_campaigns/{camp}", headers=H, timeout=45).json()
    have = len(got.get("emailer_steps") or [])
    for pos in range(have + 1, len(seq["steps"]) + 1):
        post("emailer_steps", {"emailer_campaign_id": camp, "type": "auto_email",
                               "position": pos, "wait_time": seq["steps"][pos - 1]["wait"],
                               "wait_mode": "day"})
        time.sleep(0.5)
    got = requests.get(f"{BASE}/emailer_campaigns/{camp}", headers=H, timeout=45).json()
    touches = sorted(got.get("emailer_touches") or [],
                     key=lambda t: t.get("emailer_step_id") or "")
    step_order = {s["id"]: s.get("position") for s in (got.get("emailer_steps") or [])}
    touches.sort(key=lambda t: step_order.get(t.get("emailer_step_id")) or 0)
    for pos, (step, t) in enumerate(zip(seq["steps"], touches), start=1):
        body = step["body"] + SIGN + FOOTER
        put(f"emailer_templates/{t['emailer_template_id']}",
            {"name": f"{seq['name']} - Step {pos}",
             "subject": step["subject"], "body_html": body})
        time.sleep(0.5)
    print(f"built {seq['name']} ({camp}), {len(seq['steps'])} steps")
    return camp, [t["id"] for t in touches]


def main():
    eligible = json.load(open("/tmp/fr_eligible.json"))
    owners = [x for x in eligible if x["role"] == "Owner/Founder"]
    ceos = [x for x in eligible if x["role"] == "CEO/President"]
    print(f"enrolling {len(owners)} owners, {len(ceos)} CEOs")

    built = {}
    for seq, people in ((OWNER, owners), (CEO, ceos)):
        camp, touch_ids = build(seq)
        ids = [p["id"] for p in people]
        for i in range(0, len(ids), 25):
            post(f"emailer_campaigns/{camp}/add_contact_ids", {
                "contact_ids": ids[i:i + 25], "emailer_campaign_id": camp,
                "send_email_from_email_account_id": WE_SENDER,
                "sequence_active_in_other_campaigns": True})
            time.sleep(1)
        print(f"  enrolled {len(ids)}")
        built[camp] = touch_ids

    # two-gate activation with the processing-lock retry
    for camp, touch_ids in built.items():
        post(f"emailer_campaigns/{camp}/approve", {})
        time.sleep(2)
        pending = list(touch_ids)
        for _ in range(15):
            left = []
            for tid in pending:
                try:
                    post(f"emailer_touches/{tid}/approve", {})
                except RuntimeError as e:
                    if "processed" in str(e) or "processing" in str(e):
                        left.append(tid)
                    elif "already" not in str(e):
                        raise
                time.sleep(1)
            pending = left
            if not pending:
                break
            time.sleep(40)
        g = requests.get(f"{BASE}/emailer_campaigns/{camp}", headers=H, timeout=45).json()
        st = [t.get("status") for t in g.get("emailer_touches", [])]
        act = (g.get("emailer_campaign") or {}).get("active")
        print(f"  {camp}: active={act} touches={st}")
        if not (act and all(s == "approved" for s in st)):
            raise SystemExit(f"ABORT: {camp} did not fully activate")

    print("\nBoth franchise sequences LIVE.")


if __name__ == "__main__":
    main()
