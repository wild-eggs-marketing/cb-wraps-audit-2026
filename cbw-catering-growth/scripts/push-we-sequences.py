"""Push the five Wild Eggs sequences to Apollo (created INACTIVE).

WE voice per wildeggs-catering-growth/voice-guide-reference.md: no first-person
brand voice, flowing prose, concrete dishes, occasion left open, hospitality
switching pitch (store coordinator vs marketplace), universal "Get cracking."
Per-store routing via contact custom fields {{we_store_name}} /
{{we_store_reply_email}} / {{we_store_url}}; per-sequence UTMs appended to the
stamped Toast URL (all stamped URLs end in ?mode=fulfillment, so &utm... is safe).
"""
import json
import os
import time

import requests

API_KEY = os.environ["APOLLO_API_KEY"]
H = {"x-api-key": API_KEY, "Content-Type": "application/json"}
BASE = "https://api.apollo.io/api/v1"
SCHEDULE_ID = "6a67a5227f926a0018c2e4bc"

OPTOUT = "<p><i>Not the right person for food orders? Say so and the emails stop.</i></p>"
COLD_FOOTER = ("<p><i>Not the right person for food orders? Say so and the emails stop.</i><br>"
               "<i>Wild Eggs, 1211 Herr Lane Ste 290, Louisville, KY 40222</i></p>")
SIGN = "<p>Get cracking.</p>"


def link(campaign, step):
    utm = f"&utm_source=apollo&utm_medium=email&utm_campaign={campaign}&utm_content=step-{step}"
    return f"<p><a href=\"{{{{we_store_url}}}}{utm}\">Order direct from {{{{we_store_name}}}}</a></p>"


SEQUENCES = [
    {
        "name": "WE Champion Recoverable",
        "key": "champion-recoverable",
        "utm": "we_champion_recoverable_2026_07",
        "steps": [
            {"wait": 0, "subject": "Your next order from {{we_store_name}}",
             "body": ("<p>Hi {{first_name}},</p>"
                      "<p>{{company}} has ordered from the {{we_store_name}} kitchen enough times "
                      "that the crew there knows the account, and by the usual spacing of those "
                      "orders the next one is about due.</p>"
                      "<p>Ordering direct is the easy version: the {{we_store_name}} catering "
                      "coordinator handles the details personally instead of a marketplace queue, "
                      "and everything comes out of a scratch kitchen, housemade hollandaise and "
                      "cast-iron cinnamon rolls included. Same-day catering is possible when the "
                      "timing gets tight.</p>"
                      "<p>Reply with a date and a headcount, or use the direct link below. "
                      "Questions go to {{we_store_reply_email}} and reach the store, not a call "
                      "center.</p>{LINK1}") ,
             },
            {"wait": 4, "subject": "A date and a headcount",
             "body": ("<p>{{first_name}}, one reply gets this moving: a date and a headcount. The "
                      "{{we_store_name}} coordinator takes it from there, scratch kitchen and all.</p>"
                      "{LINK2}")},
            {"wait": 6, "subject": "Leaving this with you",
             "body": ("<p>Leaving this with you, {{first_name}}. When the next order comes up, "
                      "{{we_store_reply_email}} reaches the {{we_store_name}} team directly, and "
                      "the link below skips the marketplace entirely.</p>{LINK3}")},
        ],
    },
    {
        "name": "WE Champion Lost Cause",
        "key": "champion-lost-cause",
        "utm": "we_champion_lost_cause_2026_07",
        "steps": [
            {"wait": 0, "subject": "A reintroduction from Wild Eggs",
             "body": ("<p>Hi {{first_name}},</p>"
                      "<p>It has been a while since the last {{company}} order, long enough that "
                      "this is a reintroduction rather than a nudge. Wild Eggs is still the same "
                      "scratch kitchen: housemade hollandaise, fresh-squeezed orange juice, "
                      "cast-iron cinnamon rolls, made to order and delivered ready to go.</p>"
                      "<p>If feeding a group is ever on the calendar again, the {{we_store_name}} "
                      "kitchen would like the chance to earn the account back. Reply with a date "
                      "and a headcount, write {{we_store_reply_email}}, or order direct below.</p>"
                      "{LINK1}")},
        ],
    },
    {
        "name": "WE Winback",
        "key": "winback",
        "utm": "we_winback_2026_07",
        "steps": [
            {"wait": 0, "subject": "Breakfast for {{company}}, again",
             "body": ("<p>Hi {{first_name}},</p>"
                      "<p>{{company}} ordered Wild Eggs catering before, then the calendar moved "
                      "on, which happens. Getting back in takes one reply: a date and a headcount.</p>"
                      "<p>The {{we_store_name}} kitchen makes everything from scratch and delivers "
                      "it ready to set out, and ordering direct means the store's own catering "
                      "coordinator handles the details rather than a marketplace queue. Questions "
                      "reach the store at {{we_store_reply_email}}.</p>{LINK1}")},
            {"wait": 4, "subject": "The short pitch",
             "body": ("<p>The short pitch, {{first_name}}: scratch kitchen, housemade hollandaise, "
                      "fresh-squeezed juice, delivered ready to go. One reply with a date and a "
                      "headcount puts {{company}} back on the {{we_store_name}} calendar.</p>"
                      "{LINK2}")},
            {"wait": 6, "subject": "Last note on this",
             "body": ("<p>Last note on this, {{first_name}}. When the next group order comes up, "
                      "{{we_store_reply_email}} goes straight to the {{we_store_name}} team, and "
                      "the direct link is below whenever it helps. If someone else handles food "
                      "orders now, a quick pointer their way would be appreciated.</p>{LINK3}")},
        ],
    },
    {
        "name": "WE Warm Nudge",
        "key": "warm-nudge",
        "utm": "we_warm_2026_07",
        "steps": [
            {"wait": 0, "subject": "Since the last order",
             "body": ("<p>Hi {{first_name}},</p>"
                      "<p>The last {{company}} order came through {{we_store_name}} not long ago, "
                      "and reordering is the easy part: the direct link below goes straight to the "
                      "store's catering menu, no marketplace in between. Cast-iron cinnamon rolls "
                      "travel better than anyone expects.</p>{LINK1}")},
            {"wait": 7, "subject": "Same-day is a real option",
             "body": ("<p>{{first_name}}, worth knowing: same-day catering is a real option at "
                      "{{we_store_name}} when timing gets tight. The direct link is below, and "
                      "{{we_store_reply_email}} reaches the store with any question.</p>{LINK2}")},
        ],
    },
    {
        "name": "WE Cold Reintro",
        "key": "cold-reintro",
        "utm": "we_cold_2026_07",
        "steps": [
            {"wait": 0, "subject": "Breakfast, handled, for {{company}}",
             "body": ("<p>Hi {{first_name}},</p>"
                      "<p>Wild Eggs caters breakfast and brunch from a scratch kitchen: housemade "
                      "hollandaise, fresh-squeezed orange juice, cast-iron cinnamon rolls, made to "
                      "order and delivered ready to set out for groups of ten or more.</p>"
                      "<p>{{company}} is in range of the {{we_store_name}} kitchen, where the "
                      "catering coordinator handles group orders personally. Worth a quote the "
                      "next time a group needs feeding? Reply with a date and a headcount, or "
                      "browse the direct menu below.</p>{LINK1}")},
            {"wait": 4, "subject": "The store, not a ticket queue",
             "body": ("<p>One thing worth knowing, {{first_name}}: ordering direct from "
                      "{{we_store_name}} means the store's own coordinator on the details, not a "
                      "marketplace ticket. A date and a headcount is all a quote takes.</p>"
                      "{LINK2}")},
            {"wait": 7, "subject": "Last one from Wild Eggs",
             "body": ("<p>Last one from Wild Eggs, {{first_name}}. When feeding a group lands on "
                      "your plate, the {{we_store_name}} kitchen is a reply away, or direct at the "
                      "link below. {{we_store_reply_email}} reaches the store any time.</p>"
                      "{LINK3}")},
        ],
    },
]


def post(path, body):
    for a in range(6):
        try:
            r = requests.post(f"{BASE}/{path}", headers=H, json=body, timeout=30)
        except requests.exceptions.RequestException:
            time.sleep(3 * (a + 1)); continue
        if r.status_code == 429: time.sleep(10 * (a + 1)); continue
        break
    if r.status_code != 200:
        raise RuntimeError(f"POST {path} -> {r.status_code}: {r.text[:200]}")
    return r.json()


def put(path, body):
    r = requests.put(f"{BASE}/{path}", headers=H, json=body, timeout=30)
    if r.status_code != 200:
        raise RuntimeError(f"PUT {path} -> {r.status_code}: {r.text[:200]}")
    return r.json()


results = {}
for seq in SEQUENCES:
    d = post("emailer_campaigns", {"name": seq["name"], "permissions": "team_can_use",
                                   "active": False, "emailer_schedule_id": SCHEDULE_ID})
    camp_id = d["emailer_campaign"]["id"]
    tpl_ids = []
    for pos, step in enumerate(seq["steps"], start=1):
        sd = post("emailer_steps", {"emailer_campaign_id": camp_id, "type": "auto_email",
                                    "position": pos, "wait_time": step["wait"], "wait_mode": "day"})
        tpl_ids.append(sd["emailer_template"]["id"])
        time.sleep(0.3)
    for pos, (step, tpl_id) in enumerate(zip(seq["steps"], tpl_ids), start=1):
        body = step["body"]
        for n in (1, 2, 3):
            body = body.replace(f"{{LINK{n}}}", link(seq["utm"], pos))
        footer = COLD_FOOTER if seq["key"] in ("cold-reintro", "champion-lost-cause") else OPTOUT
        # sign-off before footer; footer on every step of cold/lost-cause, first step otherwise
        full = body + SIGN + (footer if (pos == 1 or seq["key"] in ("cold-reintro", "champion-lost-cause")) else "")
        put(f"emailer_templates/{tpl_id}", {"name": f"{seq['name']} - Step {pos}",
                                            "subject": step["subject"], "body_html": full})
        time.sleep(0.3)
    results[seq["key"]] = camp_id
    print(f"OK {seq['name']} ({camp_id}) - {len(seq['steps'])} steps")

print(json.dumps(results, indent=1))
