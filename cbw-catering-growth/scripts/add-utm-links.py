"""Rewrite the four sequences' templates with UTM-tagged catering links.

Signature gains an Order Catering link tagged per sequence (utm_content=signature);
the Warm Nudge body CTAs get utm_content=step-N. Copy is otherwise unchanged.
"""
import os
import time

import requests

API_KEY = os.environ["APOLLO_API_KEY"]
H = {"x-api-key": API_KEY, "Content-Type": "application/json"}
BASE = "https://api.apollo.io/api/v1"

CAMPAIGNS = {
    "6a69d431d23c72000cf96aa1": "cbw-champion-reactivation",
    "6a69d52294372e000cdf82e0": "cbw-winback",
    "6a69d52af1d199000c924f60": "cbw-warm-nudge",
    "6a69d5305214390010407a8d": "cbw-cold-reintro",
}


def utm(campaign, content):
    return ("https://www.crazybowlsandwraps.com/catering"
            f"?utm_source=apollo&utm_medium=email&utm_campaign={campaign}&utm_content={content}")


def sig(campaign):
    return (
        "<p>Go for the good.</p>"
        "<p>{{sender_first_name}}<br>"
        "CBW Catering | 314-785-9727 | catering@crazybowlsandwraps.com<br>"
        f"<a href=\"{utm(campaign, 'signature')}\">Order Catering</a></p>"
    )


OPTOUT = "<p><i>Not the right person for lunch decisions? Say so and we stop.</i></p>"
COLD_FOOTER = (
    "<p><i>Not the right person for lunch decisions? Say so and we stop.</i><br>"
    "<i>Crazy Bowls &amp; Wraps, 1211 Herr Lane Ste 290, Louisville, KY 40222</i></p>"
)


def bodies(campaign):
    S = sig(campaign)
    if campaign == "cbw-champion-reactivation":
        return [
            ("Your next team lunch, {{company}}?",
             "<p>Hi {{first_name}},</p>"
             "<p>Your team's catering orders have a rhythm, and by our math the next one "
             "is about due. We keep the whole mixed-diet room covered in one order: the "
             "plain-grilled-chicken person, the load-it-up person, and the vegan who is "
             "tired of being an afterthought.</p>"
             "<p>Tell us the headcount and we handle the rest. The Fajita Bar runs $14 a "
             "person with a 15-person minimum, and next-day is easy if you order by 8 PM.</p>"
             "<p>Reply here and we'll hold your usual slot.</p>" + S + OPTOUT),
            ("Headcount and a date",
             "<p>{{first_name}}, quick nudge on that lunch slot. One reply sets it: "
             "headcount, date, and whether the room leans fajita or teriyaki. We do the "
             "rest, forks and napkins included.</p>" + S),
        ]
    if campaign == "cbw-winback":
        return [
            ("Lunch for {{company}} again?",
             "<p>Hi {{first_name}},</p>"
             "<p>Last time we fed your team, it went well enough that you came back. Then "
             "calendars did what calendars do.</p>"
             "<p>Getting back in is easy. Box lunches are $13.20 each, individually packed "
             "and easy to hand out. Or go build-your-own with the Fajita Bar at $14 a "
             "person, so the whole mixed-diet room is covered in one order. We deliver "
             "within 20 miles with a $75 minimum, and next-day works if you order by 8 PM.</p>"
             "<p>Reply with a headcount and a date and we'll take it from there.</p>" + S + OPTOUT),
            ("Kale, quinoa, Lobster Rangoon",
             "<p>{{first_name}}, the short version of our whole pitch: kale, quinoa, and "
             "Lobster Rangoon ($18 a dozen, yes really) on the same menu, and nobody has "
             "to compromise. One reply gets your team lunch back on the calendar.</p>" + S),
            ("We'll leave it here",
             "<p>When the next meeting needs feeding, {{first_name}}, we're a reply away. "
             "If lunch decisions moved to someone else, point us their way and we'll stop "
             "filling your inbox.</p>" + S),
        ]
    if campaign == "cbw-warm-nudge":
        return [
            ("Next lunch, sorted",
             "<p>Hi {{first_name}},</p>"
             "<p>If another meeting is creeping onto the calendar, lunch is the easy part. "
             "Every format is build-your-own, so the plain-grilled-chicken person and the "
             "load-it-up person both leave full.</p>"
             "<p>Order by 8 PM tonight and it's there for lunch tomorrow.</p>"
             f"<p><a href=\"{utm(campaign, 'step-1')}\">Order Catering</a></p>" + S),
            ("Limeade math for Tuesday",
             "<p>{{first_name}}, one more useful fact: the half-gallon limeade is $6.79 "
             "and does more for a Tuesday meeting than the agenda does. Order by 8 tonight "
             "for tomorrow.</p>"
             f"<p><a href=\"{utm(campaign, 'step-2')}\">Order Catering</a></p>" + S),
        ]
    if campaign == "cbw-cold-reintro":
        return [
            ("Feeding {{company}} meetings",
             "<p>Hi {{first_name}},</p>"
             "<p>Thirty people, twelve opinions, one catering order. That's what we do: "
             "build-your-own bars from $7.50 to $14 a person, box lunches at $13.20, all "
             "of it covering the vegan, the gluten-free, and the grass-fed-steak person "
             "in one order.</p>"
             "<p>We're in delivery range of {{company}}, and it arrives drop-off ready "
             "with forks and napkins for the group.</p>"
             "<p>Worth a lunch quote for the next team meeting?</p>" + S + COLD_FOOTER),
            ("Group therapy, but lunch",
             "<p>Group therapy, but it's just lunch. If there's a recurring meeting that "
             "needs feeding, {{first_name}}, we'll price it in one reply: headcount and "
             "date is all we need.</p>" + S + COLD_FOOTER),
            ("The easy answer to lunch",
             "<p>Last one from us, {{first_name}}. When a lunch order lands on your desk "
             "with fourteen dietary footnotes, we're the easy answer: every format is "
             "build-your-own. catering@crazybowlsandwraps.com whenever that day comes.</p>"
             + S + COLD_FOOTER),
        ]
    raise ValueError(campaign)


for camp_id, slug in CAMPAIGNS.items():
    r = requests.get(f"{BASE}/emailer_campaigns/{camp_id}", headers=H, timeout=30)
    r.raise_for_status()
    d = r.json()
    # order templates by their step position
    step_pos = {s["id"]: s["position"] for s in d["emailer_steps"]}
    touch_by_tpl = {t["emailer_template_id"]: t["emailer_step_id"] for t in d["emailer_touches"]}
    tpls = sorted(d["emailer_templates"], key=lambda t: step_pos.get(touch_by_tpl.get(t["id"]), 99))
    new = bodies(slug)
    assert len(tpls) == len(new), f"{slug}: {len(tpls)} templates vs {len(new)} bodies"
    for i, (tpl, (subject, body)) in enumerate(zip(tpls, new), start=1):
        rr = requests.put(f"{BASE}/emailer_templates/{tpl['id']}", headers=H, timeout=30,
                          json={"name": f"{d['emailer_campaign']['name']} - Step {i}",
                                "subject": subject, "body_html": body})
        rr.raise_for_status()
        time.sleep(0.3)
    print(f"OK {slug}: {len(new)} templates updated with UTM links")
