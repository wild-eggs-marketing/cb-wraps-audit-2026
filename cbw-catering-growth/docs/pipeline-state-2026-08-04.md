# Pipeline state — verified 2026-08-04

Everything below was read from the live Apollo API or resolved over DNS, not inferred.

## Deliverability

| | Crazy Bowls | Wild Eggs |
|---|---|---|
| SPF | single record, `-all`, Outlook | single record, `-all`, Outlook |
| DKIM selector1 | publishes a key | publishes a key |
| DKIM selector2 | publishes a key | **target resolves NXDOMAIN — no key** |
| DMARC | `p=none` | `p=quarantine`, `aspf=s`, `adkim=s` |
| Tracking host | `mail.crazybowlsandwraps.com` | `mail.wildeggs.com` → `proud-deer.aploconnect.com` |
| Open rate | ~21% of delivered | ~3.5% of delivered |

**The Wild Eggs open-rate gap is a DKIM problem, not a content problem.** Microsoft 365
rotates signing between selector1 and selector2. `selector2._domainkey.wildeggs.com` CNAMEs to
`selector2-wildeggs-com._domainkey.wildeggs.onmicrosoft.com`, which publishes no TXT record, so
every message M365 signs with selector2 fails DKIM. Combined with `p=quarantine` and strict
alignment, those messages are accepted by the receiving server and then filed as spam — which
is why Wild Eggs shows delivery without engagement. Crazy Bowls sits at `p=none`, so its
selector failures do not quarantine.

Fix: re-publish DKIM for wildeggs.com in the Microsoft 365 admin centre (Defender → Email
authentication → DKIM), which regenerates both selector CNAMEs, then confirm both resolve.
Do not raise Wild Eggs volume until selector2 answers.

Apollo injects a one-click unsubscribe into `appendment_html` on every sent message
(`https://mail.wildeggs.com/u?mid=…`, verified HTTP 200). The templates also carry their own
plain-language opt-out and the CAN-SPAM physical address. No unsubscribe work is needed.

## Send performance

157 transmitted, 147 delivered, 14 hard bounces, 2 spam blocks, 2 replies, 2 unsubscribes.

- **Hard bounce 8.6% account-wide, 12.9% on CBW Winback** — 4–6× the 2% ceiling.
- Not front-loaded: 6 bounces on 7/30, 7 on 7/31, 7 on 8/3. Steady, not a one-time purge.
- All 14 bounces are step-1 first contacts across 14 distinct domains — list decay, not a
  gateway or DNS fault.
- **Every enrolled contact is `email_status: verified`**, including all 20 failures. Apollo's
  verified flag is not predictive for this list, so "verified only" is not a safeguard.
  Reducing this requires an external SMTP-level verification pass before send.

Follow-ups to contacts whose step 1 already delivered carry no bounce risk. The 138 queued
messages are mostly those, and are throttled by `max_outbound_emails_per_hour`
(CBW 12, WE 8) rather than by anything wrong.

## Blocked on the Apollo UI (no API path exists)

1. `auto_pause_bounce_rate` is null on all 9 sequences. Auto-pause is enabled but has no
   trigger value, so it can never fire. The API accepts the field and silently discards it.
2. CBW Cold, CBW Warm and WE Cold report `active: true` and should not. No mail is queued or
   sent from any of them — every touch sits at `to_be_reviewed`, and that gate is what is
   actually holding. There is no pause endpoint; `PUT` ignores `active`.
3. Neither mailbox has ever been warmed (`mailwarming_status: never_started` on both).

## Scheduling

Nothing schedules either engine. There is no crontab, the container is ephemeral, and the
Routines API requires the owner's approval. Consequence: expansion produced no leads between
7/31 and 8/04, and the weekly lifecycle run had not fired in six days. Both are now correct
and run on demand; they need an external scheduler to be genuinely daily/weekly.

## Recommendation

Do not activate either Cold sequence. Together they hold ~576 mailable contacts, all step-1,
at ~9% expected bounce — roughly 50 bounces, which is where domain-level blocking starts. Let
the queued follow-ups drain, fix wildeggs.com DKIM, and put the cold lists through external
verification first.
