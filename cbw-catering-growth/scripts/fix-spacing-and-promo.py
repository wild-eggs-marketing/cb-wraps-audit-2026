"""Rebuild every sequence template with email-safe spacing + CATERCRAZY10 placement.

Root cause of the spacing bug: bodies used bare <p> blocks; Apollo's renderer
collapses them (derived body_text runs paragraphs together). Fix: the pattern
real email clients emit - <div> paragraphs separated by explicit <div><br></div>.

Promo: CATERCRAZY10 ($10 off $150+) goes in CBW Winback S1+S3 and CBW Cold S1.
Not in Champion/Warm (margin discipline), not in Wild Eggs (CBW-branded code).
"""
import os
import time

import requests

API_KEY = os.environ["APOLLO_API_KEY"]
H = {"x-api-key": API_KEY, "Content-Type": "application/json"}
BASE = "https://api.apollo.io/api/v1"


def para(*blocks):
    """Join text blocks with explicit blank-line divs."""
    out = []
    for b in blocks:
        out.append(f"<div>{b}</div>")
        out.append("<div><br></div>")
    return "".join(out[:-1])  # no trailing blank


def utm(campaign, content):
    return ("https://www.crazybowlsandwraps.com/catering"
            f"?utm_source=apollo&utm_medium=email&utm_campaign={campaign}&utm_content={content}")


OPTOUT = "<i>Not the right person for lunch decisions? Say so and we stop.</i>"
COLD_ADDR = ("<i>Not the right person for lunch decisions? Say so and we stop.</i><br>"
             "<i>Crazy Bowls &amp; Wraps, 1211 Herr Lane Ste 290, Louisville, KY 40222</i>")
PROMO = "Code <b>CATERCRAZY10</b> takes $10 off any order over $150."

CBW = {
    "6a69d431d23c72000cf96aa1": [  # Champion Reactivation
        ("Your next team lunch, {{company}}?", para(
            "Hi {{first_name}},",
            "Your team's catering orders have a rhythm, and by our math the next one is about "
            "due. We keep the whole mixed-diet room covered in one order: the plain-grilled-"
            "chicken person, the load-it-up person, and the vegan who is tired of being an "
            "afterthought.",
            "Tell us the headcount and we handle the rest. The Fajita Bar runs $14 a person "
            "with a 15-person minimum, and next-day is easy if you order by 8 PM.",
            "Reply here and we'll hold your usual slot.",
            "Go for the good.",
            OPTOUT)),
        ("Headcount and a date", para(
            "{{first_name}}, quick nudge on that lunch slot. One reply sets it: headcount, "
            "date, and whether the room leans fajita or teriyaki. We do the rest, forks and "
            "napkins included.",
            "Go for the good.")),
    ],
    "6a69d52294372e000cdf82e0": [  # Winback (+promo S1, S3)
        ("Lunch for {{company}} again?", para(
            "Hi {{first_name}},",
            "Last time we fed your team, it went well enough that you came back. Then "
            "calendars did what calendars do.",
            "Getting back in is easy. Box lunches are $13.20 each, individually packed and "
            "easy to hand out. Or go build-your-own with the Fajita Bar at $14 a person, so "
            "the whole mixed-diet room is covered in one order. We deliver within 20 miles "
            "with a $75 minimum, and next-day works if you order by 8 PM. " + PROMO,
            "Reply with a headcount and a date and we'll take it from there.",
            "Go for the good.",
            OPTOUT)),
        ("Kale, quinoa, Lobster Rangoon", para(
            "{{first_name}}, the short version of our whole pitch: kale, quinoa, and Lobster "
            "Rangoon ($18 a dozen, yes really) on the same menu, and nobody has to compromise. "
            "One reply gets your team lunch back on the calendar.",
            "Go for the good.")),
        ("We'll leave it here", para(
            "When the next meeting needs feeding, {{first_name}}, we're a reply away, and "
            "CATERCRAZY10 still takes $10 off any order over $150. If lunch decisions moved "
            "to someone else, point us their way and we'll stop filling your inbox.",
            "Go for the good.")),
    ],
    "6a69d52af1d199000c924f60": [  # Warm Nudge
        ("Next lunch, sorted", para(
            "Hi {{first_name}},",
            "If another meeting is creeping onto the calendar, lunch is the easy part. Every "
            "format is build-your-own, so the plain-grilled-chicken person and the load-it-up "
            "person both leave full.",
            "Order by 8 PM tonight and it's there for lunch tomorrow.",
            f"<a href=\"{utm('cbw-warm-nudge','step-1')}\">Order Catering</a>",
            "Go for the good.")),
        ("Limeade math for Tuesday", para(
            "{{first_name}}, one more useful fact: the half-gallon limeade is $6.79 and does "
            "more for a Tuesday meeting than the agenda does. Order by 8 tonight for tomorrow.",
            f"<a href=\"{utm('cbw-warm-nudge','step-2')}\">Order Catering</a>",
            "Go for the good.")),
    ],
    "6a6a3fce1dfd6f0018cb9ec6": None,  # placeholder guard (WE id, not CBW) - never hit
    "6a69d5305214390010407a8d": [  # Cold Reintro (+promo S1)
        ("Feeding {{company}} meetings", para(
            "Hi {{first_name}},",
            "Thirty people, twelve opinions, one catering order. That's what we do: build-"
            "your-own bars from $7.50 to $14 a person, box lunches at $13.20, all of it "
            "covering the vegan, the gluten-free, and the grass-fed-steak person in one order. "
            + PROMO,
            "We're in delivery range of {{company}}, and it arrives drop-off ready with forks "
            "and napkins for the group.",
            "Worth a lunch quote for the next team meeting?",
            "Go for the good.",
            COLD_ADDR)),
        ("Group therapy, but lunch", para(
            "Group therapy, but it's just lunch. If there's a recurring meeting that needs "
            "feeding, {{first_name}}, we'll price it in one reply: headcount and date is all "
            "we need.",
            "Go for the good.",
            COLD_ADDR)),
        ("The easy answer to lunch", para(
            "Last one from us, {{first_name}}. When a lunch order lands on your desk with "
            "fourteen dietary footnotes, we're the easy answer: every format is build-your-"
            "own. catering@crazybowlsandwraps.com whenever that day comes.",
            "Go for the good.",
            COLD_ADDR)),
    ],
}
del CBW["6a6a3fce1dfd6f0018cb9ec6"]

WE_OPTOUT = "<i>Not the right person for food orders? Say so and the emails stop.</i>"
WE_ADDR = ("<i>Not the right person for food orders? Say so and the emails stop.</i><br>"
           "<i>Wild Eggs, 1211 Herr Lane Ste 290, Louisville, KY 40222</i>")


def we_link(campaign, step):
    u = f"&utm_source=apollo&utm_medium=email&utm_campaign={campaign}&utm_content=step-{step}"
    return f"<a href=\"{{{{we_store_url}}}}{u}\">Order direct from {{{{we_store_name}}}}</a>"


WE = {
    "6a6a3fb62cfca9001424cf07": ("we_champion_recoverable_2026_07", [
        ("Your next order from {{we_store_name}}", [
            "Hi {{first_name}},",
            "{{company}} has ordered from the {{we_store_name}} kitchen enough times that the "
            "crew there knows the account, and by the usual spacing of those orders the next "
            "one is about due.",
            "Ordering direct is the easy version: the {{we_store_name}} catering coordinator "
            "handles the details personally instead of a marketplace queue, and everything "
            "comes out of a scratch kitchen, housemade hollandaise and cast-iron cinnamon "
            "rolls included. Same-day catering is possible when the timing gets tight.",
            "Reply with a date and a headcount, or use the direct link below. Questions go to "
            "{{we_store_reply_email}} and reach the store, not a call center.",
            "LINK", "Get cracking.", WE_OPTOUT]),
        ("A date and a headcount", [
            "{{first_name}}, one reply gets this moving: a date and a headcount. The "
            "{{we_store_name}} coordinator takes it from there, scratch kitchen and all.",
            "LINK", "Get cracking."]),
        ("Leaving this with you", [
            "Leaving this with you, {{first_name}}. When the next order comes up, "
            "{{we_store_reply_email}} reaches the {{we_store_name}} team directly, and the "
            "link below skips the marketplace entirely.",
            "LINK", "Get cracking."]),
    ]),
    "6a6a3fbe856b9400107fba19": ("we_champion_lost_cause_2026_07", [
        ("A reintroduction from Wild Eggs", [
            "Hi {{first_name}},",
            "It has been a while since the last {{company}} order, long enough that this is a "
            "reintroduction rather than a nudge. Wild Eggs is still the same scratch kitchen: "
            "housemade hollandaise, fresh-squeezed orange juice, cast-iron cinnamon rolls, "
            "made to order and delivered ready to go.",
            "If feeding a group is ever on the calendar again, the {{we_store_name}} kitchen "
            "would like the chance to earn the account back. Reply with a date and a "
            "headcount, write {{we_store_reply_email}}, or order direct below.",
            "LINK", "Get cracking.", WE_ADDR]),
    ]),
    "6a6a3fc02cfca9000ce6c783": ("we_winback_2026_07", [
        ("Breakfast for {{company}}, again", [
            "Hi {{first_name}},",
            "{{company}} ordered Wild Eggs catering before, then the calendar moved on, which "
            "happens. Getting back in takes one reply: a date and a headcount.",
            "The {{we_store_name}} kitchen makes everything from scratch and delivers it ready "
            "to set out, and ordering direct means the store's own catering coordinator "
            "handles the details rather than a marketplace queue. Questions reach the store "
            "at {{we_store_reply_email}}.",
            "LINK", "Get cracking.", WE_OPTOUT]),
        ("The short pitch", [
            "The short pitch, {{first_name}}: scratch kitchen, housemade hollandaise, fresh-"
            "squeezed juice, delivered ready to go. One reply with a date and a headcount puts "
            "{{company}} back on the {{we_store_name}} calendar.",
            "LINK", "Get cracking."]),
        ("Last note on this", [
            "Last note on this, {{first_name}}. When the next group order comes up, "
            "{{we_store_reply_email}} goes straight to the {{we_store_name}} team, and the "
            "direct link is below whenever it helps. If someone else handles food orders now, "
            "a quick pointer their way would be appreciated.",
            "LINK", "Get cracking."]),
    ]),
    "6a6a3fc94f036a0010d9666d": ("we_warm_2026_07", [
        ("Since the last order", [
            "Hi {{first_name}},",
            "The last {{company}} order came through {{we_store_name}} not long ago, and "
            "reordering is the easy part: the direct link below goes straight to the store's "
            "catering menu, no marketplace in between. Cast-iron cinnamon rolls travel better "
            "than anyone expects.",
            "LINK", "Get cracking."]),
        ("Same-day is a real option", [
            "{{first_name}}, worth knowing: same-day catering is a real option at "
            "{{we_store_name}} when timing gets tight. The direct link is below, and "
            "{{we_store_reply_email}} reaches the store with any question.",
            "LINK", "Get cracking."]),
    ]),
    "6a6a3fce1dfd6f0018cb9ec6": ("we_cold_2026_07", [
        ("Breakfast, handled, for {{company}}", [
            "Hi {{first_name}},",
            "Wild Eggs caters breakfast and brunch from a scratch kitchen: housemade "
            "hollandaise, fresh-squeezed orange juice, cast-iron cinnamon rolls, made to order "
            "and delivered ready to set out for groups of ten or more.",
            "{{company}} is in range of the {{we_store_name}} kitchen, where the catering "
            "coordinator handles group orders personally. Worth a quote the next time a group "
            "needs feeding? Reply with a date and a headcount, or browse the direct menu below.",
            "LINK", "Get cracking.", WE_ADDR]),
        ("The store, not a ticket queue", [
            "One thing worth knowing, {{first_name}}: ordering direct from {{we_store_name}} "
            "means the store's own coordinator on the details, not a marketplace ticket. A "
            "date and a headcount is all a quote takes.",
            "LINK", "Get cracking.", WE_ADDR]),
        ("Last one from Wild Eggs", [
            "Last one from Wild Eggs, {{first_name}}. When feeding a group lands on your "
            "plate, the {{we_store_name}} kitchen is a reply away, or direct at the link "
            "below. {{we_store_reply_email}} reaches the store any time.",
            "LINK", "Get cracking.", WE_ADDR]),
    ]),
}


def put_tpl(tpl_id, name, subject, body):
    r = requests.put(f"{BASE}/emailer_templates/{tpl_id}", headers=H, timeout=30,
                     json={"name": name, "subject": subject, "body_html": body})
    r.raise_for_status()


def templates_in_order(camp_id):
    r = requests.get(f"{BASE}/emailer_campaigns/{camp_id}", headers=H, timeout=30)
    r.raise_for_status()
    d = r.json()
    pos = {s["id"]: s["position"] for s in d["emailer_steps"]}
    touch = {t["emailer_template_id"]: t["emailer_step_id"] for t in d["emailer_touches"]}
    tpls = sorted(d["emailer_templates"], key=lambda t: pos.get(touch.get(t["id"]), 99))
    return d["emailer_campaign"]["name"], tpls


for camp_id, steps in CBW.items():
    cname, tpls = templates_in_order(camp_id)
    assert len(tpls) == len(steps), f"{cname}: {len(tpls)} vs {len(steps)}"
    for i, (tpl, (subject, body)) in enumerate(zip(tpls, steps), 1):
        put_tpl(tpl["id"], f"{cname} - Step {i}", subject, body)
        time.sleep(0.3)
    print(f"fixed {cname} ({len(steps)} steps)")

for camp_id, (utm_c, steps) in WE.items():
    cname, tpls = templates_in_order(camp_id)
    assert len(tpls) == len(steps), f"{cname}: {len(tpls)} vs {len(steps)}"
    for i, (tpl, (subject, blocks)) in enumerate(zip(tpls, steps), 1):
        blocks = [we_link(utm_c, i) if b == "LINK" else b for b in blocks]
        put_tpl(tpl["id"], f"{cname} - Step {i}", subject, para(*blocks))
        time.sleep(0.3)
    print(f"fixed {cname} ({len(steps)} steps)")

print("ALL TEMPLATES REBUILT")
