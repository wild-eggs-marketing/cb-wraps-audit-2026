# Email Template Review — Conversion Pass

Reviewed against the live catering page (crazybowlsandwraps.com/catering, pulled 2026-07-29)
and current B2B outreach conversion research. Each template gets its own findings; the
cross-cutting section applies to all four.

Key page facts every draft can now cite (these are live, public, and verifiable):

| Fact | Value |
|---|---|
| Build-your-own bars | Breakfast $7.50, Teriyaki $13, Fajita $14 per person, 15-person minimum |
| Box lunches | $13.20 each (wrap or salad, side + treat included) |
| Wrap Platter | $54 per tray (5 wraps) |
| Lobster Rangoon | $18/dozen |
| Delivery | Within 20 miles, fee by distance, $75 order minimum (pickup: no minimum) |
| Ordering cutoff | 24 hours appreciated, 8:00 PM cutoff for next-day |
| Cancellation | Full refund outside 24 hours |
| Order channels | Online link, catering@crazybowlsandwraps.com, 314-785-9727 |
| Dietary | Vegan, gluten-free, tofu, quinoa falafel, beans — "Yes, and that's the point" |

## Cross-cutting (applies to all four templates)

1. **No follow-up sequence exists in any template.** Research is unambiguous: a single
   follow-up raises reply rates ~50%, and follow-up strategy drives about half of cold
   email results. Every template needs a touch plan: Champions 2 touches, Winback and
   Cold 3 touches max, Warm 1 light bump. Always stop on reply.
2. **No sender identity or signature block is specified.** Every template ends at
   "Go for the good." with no human name, no phone, no email. Office managers reply to
   people. Required signature spec: sender name, CBW Catering, assigned store,
   314-785-9727, catering@crazybowlsandwraps.com.
3. **Reply-to is undefined.** All sends must set Reply-To: catering@crazybowlsandwraps.com
   (setup steps at the bottom), and the signature should repeat the address so even
   forwarded copies route to the monitored inbox.
4. **Data-source sections are stale.** All four say "Pull via Apollo MCP." Contacts now
   live in `data/enriched-champions-winback.csv` and `data/enriched-warm-active-cold.csv`
   (297 accounts with contact + email + match confidence in Match Notes).
5. **No compliance footer.** These are commercial emails at scale: add the store's
   physical address and a one-line opt-out ("Not the right person? Say so and we stop.")
   to every template. Legally required for the Cold list, cheap insurance elsewhere.
6. **Templates allow multiple CTAs; force exactly one per draft.** Research: a single
   CTA, phrased as an interest question, gets the most replies. Which one varies by
   segment (see below).
7. **The drafter is never given the real numbers.** The voice guide demands prices in
   copy, but no template supplies them. Bake the fact table above into each prompt so
   drafts stop depending on the drafter's memory.
8. **Pre-send hygiene filter.** Suppress contacts whose Match Notes/title are clearly
   wrong-persona (e.g. the EY cybersecurity manager), and decide on the 6
   `extrapolated`-status emails: verify first or accept bounce risk. Keep bounce rate
   under ~2% to protect the domain.

## champion-overdue.md — 7 improvements

1. **Two-touch plan**: day 0 personal note, day 4-5 short bump (~40 words, new angle,
   no guilt). Currently one-and-done, which forfeits roughly half the potential replies.
2. **VIP = plain text from a human.** Research: top accounts should get a plain-text,
   no-HTML note from a named person, ideally the store GM for the top spenders. Add
   "no images, no HTML template, one human signer" as a rule.
3. **Standing Order has no public landing page.** The live site never mentions it. Either
   route Standing Order interest to a reply/call CTA only, or build the landing pages
   (`scripts/generate-landing-pages.py` is already scaffolded). Never send a "set up your
   Standing Order" click to the generic catering page — the mismatch kills trust.
4. **One CTA, chosen by overdue depth**: slightly overdue → direct reorder link; badly
   overdue → reply question ("Want us to hold your usual Thursday slot?").
5. **Soften the overdue math.** "That window closed 19 days ago" reads as surveillance.
   Round to weeks: "about three weeks past your usual."
6. **Subject spec → 3-6 words, personalized, question-form allowed.** Personalized
   subjects lift opens ~26%+ and questions outperform statements. E.g.
   "Fajita Bar round 12?" beats a 5-8 word statement.
7. **Treat the opening line as preview text.** The first ~40-90 characters show next to
   the subject in the inbox. The "one specific detail" opener should be written to work
   standing alone there.

## winback.md — 7 improvements

1. **Three-touch sequence** (day 0, day 4, day 10, different angle each), hard stop after
   three. This is the highest-ROI segment; it deserves the full research-backed cadence.
2. **Dollar incentive beats percentage — and beats none.** Research: dollar-amount offers
   convert about 2x percentage discounts. Add a concrete hook ("$25 off an order over
   $150" or free delivery on the first order back), flagged CONFIRM WITH OWNER like the
   champion template already does for discounts.
3. **Add a data-gap fallback.** "Reference the specific last order" fails when ez-cater
   order-type data is missing. Rule: if order type is unknown, lead with the menu
   recommendation instead of guessing history.
4. **Reply-based CTA**: "Reply with a headcount and a date and we'll take it from there."
   Lowest-friction re-entry, and it feeds the catering@ inbox + reply-triage flow.
5. **Personalized subject required** (company name or their item): "Another Fajita Bar
   for JEMA?" Personalization roughly doubles reply rates vs generic.
6. **Price the anti-tradeoff line.** The Lobster Rangoon joke lands harder with the real
   number from the page: "Lobster Rangoon, $18 a dozen, yes really."
7. **Preempt logistics objections in one line**: 24-hour notice, 8 PM next-day cutoff,
   $75 delivery minimum inside 20 miles. Removes the "is this even easy?" hesitation
   without a back-and-forth.

## warm.md — 6 improvements

1. **The LTO/seasonal hook has no data source.** The template tells the drafter to cite
   "a new LTO" but not where to find it; a stale item torches credibility. Add a
   maintained current-hooks block to the prompt (or instruct: check the site/socials;
   if unsure, use the evergreen mixed-diet anchor).
2. **Send on their clock, not ours.** Trigger each warm email just before the account's
   own Median Reorder Gap window closes (`cadence-monitor.py` already computes this).
   Triggered sends massively outperform batch blasts (automated emails drove 37% of
   email-attributed sales from 2% of volume in industry data).
3. **Real urgency, from the page**: "Order by 8 tonight, it's there for lunch tomorrow."
   True, verifiable, and better than any manufactured scarcity.
4. **Single CTA = the online ordering link.** Warm buyers don't need a conversation;
   reduce clicks to reorder. Skip the reply-CTA here.
5. **One light bump max**, about a week later. If they don't act, they age into the
   normal cadence; never escalate pressure on an on-track buyer.
6. **Subject: 4-6 words, one personal token, no promo words.** "Since April" energy in
   the subject itself ("April was a while ago, JEMA") — spam-trigger words (free,
   urgent, reminder) stay out.

## cold.md — 8 improvements

1. **Compliance is mandatory here.** 384 effectively-churned accounts = cold commercial
   email. Every send needs the physical store address + working opt-out line. Add to
   the template as a non-negotiable footer block.
2. **Throttle and warm up.** Cap ~40-50 sends/day per mailbox. On the single linked
   mailbox that's a ~2-week drip for the cold list — either accept that pacing or link
   more mailboxes. Never blast 384 in a day from one address.
3. **"Free tasting drop" is unbacked and risky.** Nothing on the site offers it, and
   "free" in a subject line is a classic spam trigger. Confirm the program exists before
   promising it, keep "free" out of subjects, and phrase it "a tasting on us."
4. **Use their history silently.** Keep the "treat as first outreach" framing, but pick
   the menu hook from their past order type when known (they ordered the Fajita Bar
   before → lead Fajita Bar $14/person). Company-specific relevance ~doubles replies
   without saying "we noticed you stopped ordering."
5. **Segment the hook by vertical.** The data has industry context (clinics, schools,
   plants, offices). Working-lunch angle for medical offices, game-day platters for
   plants/warehouses, meeting breakfasts ($7.50 Breakfast Bar) for offices.
6. **Reply-question CTA, not a link**: "Worth a lunch quote for [Company]?" Cold
   recipients reply to questions; links read as marketing. One CTA only.
7. **Lead with price, not poetry.** Cold readers need a reason to act: bars $7.50-$14
   per person with a 15-person minimum is a stronger third line than a second voice
   riff. The voice hook opens; the numbers close.
8. **Three-touch cap, then stop forever.** Day 0, day 4, day 11. Research: past 3-4
   attempts you're burning sender reputation on a dead list. Suppress non-responders
   from future cold sends.

## Reply-to setup: catering@crazybowlsandwraps.com

Current state (verified via Apollo API): one linked mailbox,
`elle@crazybowlsandwraps.com` (Microsoft Exchange, active, default). `catering@` is NOT
linked. Apollo's API does not expose reply-to configuration, so this is a one-time UI
setting:

**Option A — recommended now**: In Apollo: Settings → Mailboxes →
elle@crazybowlsandwraps.com → set "Custom Reply-To" to catering@crazybowlsandwraps.com.
Sends keep coming from the warmed, authenticated elle@ mailbox; replies land in
catering@. Same domain, so no deliverability penalty.

**Option B — for scale later**: Make catering@ a real licensed mailbox (not just an
alias/shared address) in Microsoft 365, link it in Apollo as a second sending account,
and split volume across both mailboxes (doubles the safe daily cold send rate).

Either way:
- Confirm catering@ actually receives mail today (alias vs mailbox) and someone
  monitors it — `prompts/reply-triage.md` is built for exactly that queue.
- Put "or email catering@crazybowlsandwraps.com" in every signature so forwards and
  out-of-thread replies still route correctly.
- Verify SPF/DKIM/DMARC pass for crazybowlsandwraps.com before the cold batch goes out.
