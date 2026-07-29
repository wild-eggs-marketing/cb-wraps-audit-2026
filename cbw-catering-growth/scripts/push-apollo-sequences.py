"""Push CBW sequences to Apollo v2: flat PUT /emailer_templates/{id} (the working path).

Reuses the already-created Champion campaign + its two steps; creates the other three
campaigns fresh. All campaigns INACTIVE with the default business-hours schedule.
"""
import json
import os
import time

import requests

API_KEY = os.environ["APOLLO_API_KEY"]
H = {"x-api-key": API_KEY, "Content-Type": "application/json"}
BASE = "https://api.apollo.io/api/v1"
SCHEDULE_ID = "6a67a5227f926a0018c2e4bc"

SIG = (
    "<p>Go for the good.</p>"
    "<p>{{sender_first_name}}<br>"
    "CBW Catering | 314-785-9727 | catering@crazybowlsandwraps.com</p>"
)
OPTOUT = "<p><i>Not the right person for lunch decisions? Say so and we stop.</i></p>"
COLD_FOOTER = (
    "<p><i>Not the right person for lunch decisions? Say so and we stop.</i><br>"
    "<i>Crazy Bowls &amp; Wraps, 1211 Herr Lane Ste 290, Louisville, KY 40222</i></p>"
)

CHAMPION_EXISTING = {
    "campaign_id": "6a69d431d23c72000cf96aa1",
    "templates": ["6a69d440cb572f0020fc2634", "6a69d4ebee33090018b85d97"],
}

SEQUENCES = [
    {
        "name": "CBW Champion Reactivation",
        "steps": [
            {"wait": 0, "subject": "Your next team lunch, {{company}}?",
             "body": ("<p>Hi {{first_name}},</p>"
                      "<p>Your team's catering orders have a rhythm, and by our math the next one "
                      "is about due. We keep the whole mixed-diet room covered in one order: the "
                      "plain-grilled-chicken person, the load-it-up person, and the vegan who is "
                      "tired of being an afterthought.</p>"
                      "<p>Tell us the headcount and we handle the rest. The Fajita Bar runs $14 a "
                      "person with a 15-person minimum, and next-day is easy if you order by 8 PM.</p>"
                      "<p>Reply here and we'll hold your usual slot.</p>" + SIG + OPTOUT)},
            {"wait": 4, "subject": "Headcount and a date",
             "body": ("<p>{{first_name}}, quick nudge on that lunch slot. One reply sets it: "
                      "headcount, date, and whether the room leans fajita or teriyaki. We do the "
                      "rest, forks and napkins included.</p>" + SIG)},
        ],
    },
    {
        "name": "CBW Winback",
        "steps": [
            {"wait": 0, "subject": "Lunch for {{company}} again?",
             "body": ("<p>Hi {{first_name}},</p>"
                      "<p>Last time we fed your team, it went well enough that you came back. Then "
                      "calendars did what calendars do.</p>"
                      "<p>Getting back in is easy. Box lunches are $13.20 each, individually packed "
                      "and easy to hand out. Or go build-your-own with the Fajita Bar at $14 a "
                      "person, so the whole mixed-diet room is covered in one order. We deliver "
                      "within 20 miles with a $75 minimum, and next-day works if you order by 8 PM.</p>"
                      "<p>Reply with a headcount and a date and we'll take it from there.</p>"
                      + SIG + OPTOUT)},
            {"wait": 4, "subject": "Kale, quinoa, Lobster Rangoon",
             "body": ("<p>{{first_name}}, the short version of our whole pitch: kale, quinoa, and "
                      "Lobster Rangoon ($18 a dozen, yes really) on the same menu, and nobody has "
                      "to compromise. One reply gets your team lunch back on the calendar.</p>" + SIG)},
            {"wait": 6, "subject": "We'll leave it here",
             "body": ("<p>When the next meeting needs feeding, {{first_name}}, we're a reply away. "
                      "If lunch decisions moved to someone else, point us their way and we'll stop "
                      "filling your inbox.</p>" + SIG)},
        ],
    },
    {
        "name": "CBW Warm Nudge",
        "steps": [
            {"wait": 0, "subject": "Next lunch, sorted",
             "body": ("<p>Hi {{first_name}},</p>"
                      "<p>If another meeting is creeping onto the calendar, lunch is the easy part. "
                      "Every format is build-your-own, so the plain-grilled-chicken person and the "
                      "load-it-up person both leave full.</p>"
                      "<p>Order by 8 PM tonight and it's there for lunch tomorrow.</p>"
                      "<p><a href=\"https://www.crazybowlsandwraps.com/catering\">Order Catering</a></p>"
                      + SIG)},
            {"wait": 7, "subject": "Limeade math for Tuesday",
             "body": ("<p>{{first_name}}, one more useful fact: the half-gallon limeade is $6.79 "
                      "and does more for a Tuesday meeting than the agenda does. Order by 8 tonight "
                      "for tomorrow.</p>"
                      "<p><a href=\"https://www.crazybowlsandwraps.com/catering\">Order Catering</a></p>"
                      + SIG)},
        ],
    },
    {
        "name": "CBW Cold Reintro",
        "steps": [
            {"wait": 0, "subject": "Feeding {{company}} meetings",
             "body": ("<p>Hi {{first_name}},</p>"
                      "<p>Thirty people, twelve opinions, one catering order. That's what we do: "
                      "build-your-own bars from $7.50 to $14 a person, box lunches at $13.20, all "
                      "of it covering the vegan, the gluten-free, and the grass-fed-steak person "
                      "in one order.</p>"
                      "<p>We're in delivery range of {{company}}, and it arrives drop-off ready "
                      "with forks and napkins for the group.</p>"
                      "<p>Worth a lunch quote for the next team meeting?</p>" + SIG + COLD_FOOTER)},
            {"wait": 4, "subject": "Group therapy, but lunch",
             "body": ("<p>Group therapy, but it's just lunch. If there's a recurring meeting that "
                      "needs feeding, {{first_name}}, we'll price it in one reply: headcount and "
                      "date is all we need.</p>" + SIG + COLD_FOOTER)},
            {"wait": 7, "subject": "The easy answer to lunch",
             "body": ("<p>Last one from us, {{first_name}}. When a lunch order lands on your desk "
                      "with fourteen dietary footnotes, we're the easy answer: every format is "
                      "build-your-own. catering@crazybowlsandwraps.com whenever that day comes.</p>"
                      + SIG + COLD_FOOTER)},
        ],
    },
]


def post(path, body):
    r = requests.post(f"{BASE}/{path}", headers=H, json=body, timeout=30)
    if r.status_code != 200:
        raise RuntimeError(f"POST {path} -> {r.status_code}: {r.text[:300]}")
    return r.json()


def put(path, body):
    r = requests.put(f"{BASE}/{path}", headers=H, json=body, timeout=30)
    if r.status_code != 200:
        raise RuntimeError(f"PUT {path} -> {r.status_code}: {r.text[:300]}")
    return r.json()


results = []
for seq in SEQUENCES:
    if seq["name"] == "CBW Champion Reactivation":
        camp_id = CHAMPION_EXISTING["campaign_id"]
        tpl_ids = list(CHAMPION_EXISTING["templates"])
    else:
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
        put(f"emailer_templates/{tpl_id}", {
            "name": f"{seq['name']} - Step {pos}",
            "subject": step["subject"],
            "body_html": step["body"],
        })
        time.sleep(0.3)
    results.append({"name": seq["name"], "id": camp_id, "steps": len(seq["steps"])})
    print(f"OK: {seq['name']} ({camp_id}) - {len(seq['steps'])} steps")

print(json.dumps(results, indent=1))
