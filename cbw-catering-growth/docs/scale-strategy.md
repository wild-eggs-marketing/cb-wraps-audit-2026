# Catering Growth at Scale — Beyond the One-Time List

The CSV-pass model we just ran (export → enrich → draft → send) worked once, but it is
manual at every joint, decays immediately (contacts change jobs, accounts lapse daily),
and none of it compounds. Before the Wild Eggs list runs, here is the rethink: eight
approaches that turn a one-time cleanup into a machine. Goal: reignite EZ Cater
catering accounts + acquire lookalike businesses within 10 miles of each store,
repeatable for any brand.

## 1. Lifecycle engine instead of list passes

The single highest-leverage change. Segments are a function of time: every day, warm
accounts go cold and champions go overdue. Replace the quarterly CSV pass with a
standing pipeline: weekly EZ Cater/Toast export drop → segment recompute
(`build-account-list.py` already does this) → diffs auto-enroll into the four Apollo
sequences via the API (`emailer_campaigns/{id}/add_contact_ids`). Nobody drafts
anything; the sequences we pushed today ARE the send layer. A scheduled agent run
(cron) does the refresh, enrollment, and a Monday summary of replies/bounces/booked
orders. Human work drops to: read the summary, answer hot replies.
**Today**: schedule the weekly run; the sequences and enrichment scripts already exist.

## 2. Store-radius lookalike engine

Champions have a shape: dermatology clinics, hospital admin offices, engineering firms,
20-500 employee professional offices. Encode it once — NAICS codes from the champion
list + employee range + 10-mile zip geofence per store (static zip-radius lookup, free)
— and run it as a monthly Apollo org search per store. New matches get the office-
manager-persona search from pass 2 (the script is built) and drop into the Cold Reintro
sequence tagged by store. This is net-new demand, not reactivation: every store gets a
self-refilling prospect list, and the same config runs for Wild Eggs by swapping the
brand profile (breakfast meetings vs lunch).
**Today**: extract champion NAICS profile from the enriched CSVs; run the first
geofenced search for the top store.

## 3. Escape the EZ Cater tax: direct + Standing Order conversion

EZ Cater owns the customer relationship and takes 15-25% of every order — it's why we
had to reverse-engineer contacts through Apollo at all. Make "move to direct" its own
motion targeting the 116 matched Champions/Winback accounts: a Standing Order (recurring
team lunch, one setup decision) priced with a direct-order incentive funded entirely by
the saved commission. Every converted account = owned email, owned reorder cadence,
+15-25 points of margin, and immunity to marketplace ranking. Requires the Standing
Order landing page (`generate-landing-pages.py` is scaffolded and the review flagged
the missing page as a conversion killer).
**Today**: finish one landing page + add the CONFIRMED incentive to the Champion
sequence; measure direct-vs-EZ-Cater share monthly.

## 4. Trigger-based prospecting (signals, not lists)

Static lists go stale; buying signals don't. Companies that just posted 10 job openings,
grew headcount 20%, or opened a new office inside a store's geofence are entering their
catering moment (onboarding lunches, all-hands, interview panels). Apollo exposes all
three as API filters (job postings, headcount growth, new locations). A weekly signal
sweep per geofence auto-adds triggered companies to Cold Reintro with the hook matched
to the signal ("growing team" → onboarding lunch angle). Signal-triggered cold email
consistently outperforms list-based cold by multiples, and the volume is self-limiting
so it protects deliverability.
**Today**: one API call per store zip-set; the enrichment and sequence rails are built.

## 5. Every delivery is a lead-gen event

The physical order is the one channel no competitor sees. Two inserts in every catering
drop-off: (a) a QR card — "Book the next one in 60 seconds" — linking to the store's
ordering page with the company pre-tagged, and (b) a referral card crediting the office
admin who books the next order (their choice: treat platter for the team or personal
credit). The person unpacking the food is usually the real catering decision-maker and
often NOT the EZ Cater account holder — this captures contacts no enrichment can find,
at zero marginal cost, compounding with order volume.
**Today**: two card designs + unique QR per store; print this week.

## 6. Speed-to-lead reply desk on catering@

Catering purchases are won by whoever quotes first — on EZ Cater, response time is a
ranking factor; off it, the first quote usually wins. All four sequences drive replies
into catering@crazybowlsandwraps.com. Put an agent on that inbox (`reply-triage.md` is
already written): classify every reply, auto-draft the quote or answer using the live
price sheet, flag for one-tap human approval, and hand hot threads to the store GM with
a same-business-hour SLA. Target: first response under 15 minutes during business
hours. This single operational change likely moves conversion more than any copy edit.
**Today**: confirm catering@ is a monitored mailbox + set the reply-to; wire triage.

## 7. SMS + call layer on the email spine

Industry data: adding SMS to an email workflow lifts conversion ~54%; sending 3-4
email touches alone leaves the phone channel — which every catering order eventually
uses anyway — idle. Capture mobile at first direct order (one field), then: champions
overdue get a 2-minute GM call ("your usual Thursday slot?") instead of email touch 2;
warm accounts get one SMS timed to their median reorder gap ("Order by 8 tonight,
lunch tomorrow"). Both scripts derive from the sequences we already wrote. Phone
numbers for matched contacts are also revealable in Apollo (credits permitting).
**Today**: add the GM call task to the Champion sequence (Apollo supports call steps);
draft the two SMS templates.

## 8. Apollo as system of record (kill the CSVs)

Everything above breaks if the data keeps living in CSV snapshots. Push all 753
accounts + 297 contacts into Apollo as accounts/contacts, labeled by brand, store, and
segment (bulk create endpoints exist and are scripted in an afternoon). Then sequences,
enrollment, suppression (opt-outs, wrong-persona), reply history, and reporting all
live where the sending happens — and the Wild Eggs list is onboarded by running the
same import with a different label, not by rebuilding a spreadsheet pipeline.
**Today**: import script off the enriched CSVs; labels `brand:cbw`, `store:{slug}`,
`segment:{name}`.

## Sequencing for this week

| Day | Move |
|---|---|
| Today | Reply-to + catering@ monitoring confirmed (#6), activate sequences for Champions/Winback, Apollo import (#8) |
| +1 | Weekly lifecycle cron live (#1), champion NAICS profile extracted (#2) |
| +2 | First geofenced lookalike search, top store (#2), signal sweep v1 (#4) |
| +3 | Standing Order landing page + confirmed incentive (#3), QR/referral cards to print (#5) |
| +4 | GM call step + SMS templates (#7), Wild Eggs config cloned from CBW (#1-#8 reusable) |

The Wild Eggs run should NOT start as a list pass. Stand up #1, #6, and #8 first, then
Wild Eggs onboards as a config (brand voice guide + store geofences + its EZ Cater
export) into a running machine.
