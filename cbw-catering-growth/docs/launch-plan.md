# CBW Launch Plan — Subset Test First Thing Tomorrow

Spacing bug is fixed across all 22 templates (root cause: bare `<p>` blocks that
Apollo collapses; rebuilt with explicit div+break spacing and verified in the stored
plain-text). CATERCRAZY10 ($10 off $150+) is live in Winback steps 1+3 and Cold
step 1 only - deliberately not Champion/Warm (margin discipline), not Wild Eggs
(CBW-branded code).

## Tonight (5 minutes, Elle)

1. **Re-send the test email** for any one step (Sequences → step → Send test email).
   The spacing should now hold in Outlook and Gmail. If anything still looks off,
   screenshot it - do not launch.
2. Confirm the four launch-blockers from the earlier checklist are done:
   - [ ] Custom Reply-To / catering@ decision (or accept replies to elle@)
   - [ ] Remove Debra Tallis from CBW Cold Reintro (one click)
   - [ ] Follow-up steps set to "reply to previous thread" (one click per step)
   - [ ] Tracking subdomain verified OR click tracking turned off

## Tomorrow ~8:30 AM CT: activate Champion Reactivation ONLY

The subset test is built into the sequence settings - no list surgery needed:

- **Champion Reactivation is capped at 10 sends/day** (already set via API). With 23
  enrolled, activation sends to the 10 highest-priority champions tomorrow, ~10 more
  Thursday, the rest Friday. One click: Sequences → CBW Champion Reactivation → Activate.
- Send window is the Normal Business Hours schedule in each contact's timezone, so
  sends start when their morning starts.

## Tomorrow 4-5 PM CT: read the day-one gates

| Gate | Green | Red = pause and diagnose |
|---|---|---|
| Delivered | 10/10 | any hard bounce > 1 |
| Spam blocks | 0 | any |
| Opens | 4+ of 10 | 0-1 (deliverability problem, not copy) |
| Replies | any | - (none on day one is normal) |
| Reply routing | replies arrive where expected | replies lost |
| UTM clicks | visible in GA4 as cbw-champion-reactivation | - |

## Ramp (only if day-one gates are green)

| Day | Action | Daily cap (already set) |
|---|---|---|
| Day 2 | Activate Winback (75 enrolled, CATERCRAZY10 live) | 25/day |
| Day 3 | Activate Warm Nudge (23 enrolled) | 25/day |
| Day 5 | Activate Cold Reintro (~300: customers + lookalikes + signals) | 40/day |
| Ongoing | Weekly lifecycle run feeds transitions automatically | - |

Total mailbox load peaks around 90/day for ~1 week, inside the safe envelope for a
warmed Exchange mailbox, then drops to lifecycle-trigger volume.

## Watch items during week one

- **Bounce rate above ~2% on Cold** → pause Cold, re-verify the batch.
- **A "who is this / remove me" reply** → honor same day; the opt-out line promises it.
- **CATERCRAZY10 redemptions** → confirm the code actually validates on the ordering
  platform for a $150+ order BEFORE day 2 (Winback launch depends on it).
- Replies pile into the inbox faster than expected → good problem; wire the
  reply-triage prompt (speed-to-lead desk) that week.
