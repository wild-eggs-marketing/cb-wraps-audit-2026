# SMS + GM Call Scripts (Approach #7)

Phone numbers come from direct orders (capture at checkout) or Apollo phone reveal
(direct-dial credits are exhausted this cycle; revisit after 2026-08-28). Get SMS
opt-in at first direct order; never cold-SMS a contact who has not opted in (TCPA).

## CBW GM call script - overdue Champions (replaces email touch 2)

Two minutes, one goal: hold the slot. CBW voice: We, confident, no apology.

> "Hi [name], this is [GM] from Crazy Bowls & Wraps on [street]. We cater
> [company]'s team lunches, and by our math the next one is about due.
> I'm holding a delivery slot for [usual weekday]. Want me to pencil in your
> usual order, or change it up? ... All I need is the headcount."

Objection handles:
- "Budget's tight" -> "Box lunches run $13.20 a head, and pickup has no minimum.
  Want me to price both ways?"
- "Someone else handles it now" -> "Who should I ask for? I'll make sure their
  first order goes smoothly." (capture the new contact - update Apollo)
- "We switched caterers" -> "Fair. If a mixed-diet room ever becomes the problem,
  that's our whole thing. I'll check back next quarter." (label: competitor-loss)

## CBW SMS - warm reorder nudge (opted-in contacts only)

Timed by median reorder gap (cadence-monitor). One per cycle, max.

> CBW Catering: your team's usual lunch window is coming up. Order by 8 tonight
> and it's there tomorrow. [short UTM link] Reply STOP to opt out.

## Wild Eggs GM call script - recoverable Champions

WE voice: no "we/our", named coordinator, hospitality pitch, occasion open.

> "Hi [name], this is [coordinator] from Wild Eggs [store]. [Company] has ordered
> from this kitchen [n] times, and the account's been quiet a bit longer than
> usual. Whatever's next on the calendar, the kitchen can have it delivered
> ready to set out. A date and a headcount is all it takes to hold it."

Objection handles:
- "Nothing coming up" -> "No problem. Direct ordering skips the marketplace when
  something lands: [store toast link]. Ask for me by name."
- "Who is this again?" -> "The catering coordinator at the [store] Wild Eggs, the
  scratch kitchen that handled your last order. Housemade hollandaise, cast-iron
  cinnamon rolls. It comes back to people fast."

## Wild Eggs SMS - post-order capture (opted-in only)

Sent day after a completed catering order:

> Wild Eggs [store]: thanks for yesterday's order. Next one is one text away, a
> date and a headcount does it. Direct menu: [store toast link]. Reply STOP to opt out.

## Rollout order

1. Champions first (both brands): GM calls replace email touch 2 for the top 10
   accounts per store by spend. The lifecycle engine can emit a weekly call list.
2. SMS starts only with opted-in numbers from direct orders; no purchased numbers.
3. Log outcomes in Apollo (labels: called-connected, called-voicemail,
   competitor-loss, new-contact) so the lifecycle engine can suppress or reroute.
