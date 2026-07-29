# Wild Eggs Onboarding — Config Swap Into the Running Machine

Updated 2026-07-29 after receiving the Wild Eggs starter kit (now at
`wildeggs-catering-growth/`) and the Catering Growth Playbook. Wild Eggs does NOT get
a list pass; it onboards into the engines CBW already runs on, with these
brand-specific differences wired in.

## What makes Wild Eggs different (from the playbook + starter kit)

1. **Occasion buyers, not cadence buyers.** 846 accounts over 28 months; orders are
   triggered by calendar events (kickoffs, church breakfasts, send-offs), not routines.
   The lifecycle engine now supports this natively: `"champion_mode": "occasion"` in
   `config/wildeggs.json` splits champions the playbook's way:
   - 30-180 days past expected next order → **champion-recoverable** (3 touches / 10 days)
   - 180+ days past → **champion-lost-cause** (single touch, fires once ever, then archive)
   - on schedule → untouched (migrate to Toast direct, no interruption)
2. **CTA destination is the store's Toast catering URL** (`data/store-urls.csv`),
   never EZ Cater and never a generic page. 6 store slugs confirmed, 10 on the
   wildeggs.com/catering fallback until confirmed.
3. **Voice is the opposite of CBW** (`wildeggs-catering-growth/voice-guide-reference.md`):
   no first-person "we/our" (use "Wild Eggs" or "the store"), flowing connected prose,
   concrete dishes (cast-iron cinnamon roll, housemade hollandaise), never presume the
   occasion, no universal hours claims, sign-off always "Get cracking." The switching
   pitch is hospitality, not points: the store's named catering coordinator (e.g.
   Kaitlyn at Landis Lakes) vs a marketplace account manager.
4. **Do-not-fabricate list is stricter**: no menu items, no headcount, no occasion
   type, no named order contact - EZ Cater data for WE doesn't support them.
5. **UTM convention is defined and different**: `we_[segment]_[YYYY]_[MM]`
   (see `wildeggs-catering-growth/data/utm-conventions.md`); GA4 event
   `toast_catering_click` is already firing on the funnel end.

## Verified today

- **wildeggs.com DNS is send-ready**: SPF hard-fail via Microsoft, DKIM selectors live,
  DMARC `p=none` (add `rua=` reporting; upgrade to quarantine later).
- **wildeggs.com/catering is a concierge flow** (request form → catering team calls →
  pickup/delivery), groups of 10+, no published prices. Reply-based CTAs are therefore
  a perfect fit; price-forward copy is not possible and should not be invented.

## Setup checklist (in order)

1. **Data in** (the one blocking input): Wild Eggs EZ Cater export →
   `wildeggs-catering-growth/data/ez-cater-orders.csv`. Verify the export's
   "Caterer Name" values match the `caterer_filter` in `config/wildeggs.json`.
   Also create `multi-store-consolidation.csv` for the 5 multi-store WE accounts
   (flagged TO CREATE in the starter kit).
2. **Segment**: `python3 cbw-catering-growth/scripts/lifecycle-engine.py <export> --config cbw-catering-growth/config/wildeggs.json --dry-run`
   to see segment volumes before anything sends. Expect ~48 champions (23 recoverable
   / 10 lost-cause / 15 on-schedule per the playbook), winback as the biggest cohort.
3. **Enrich**: run the two enrichment passes (scripts unchanged) against the WE account
   list. Budget ≈ list size × 1.3 credits; check the balance first - 846 accounts could
   need ~1,100 credits, which may mean raising the limit or running high-value segments
   first (recoverable champions → winback → warm → cold).
4. **Mailbox**: link elle@wildeggs.com in Apollo; same plan limitation (no reply-to
   field), so use the alias play: catering@wildeggs.com as an M365 alias, send from the
   alias. Signature per WE voice (no "we"), with the UTM'd wildeggs.com/catering link.
   Paste the mailbox account id into `config/wildeggs.json`.
5. **Sequences**: five, per the starter kit prompts (champion-recoverable,
   champion-lost-cause, winback, warm, cold), written in WE voice with per-store Toast
   URLs and `we_[segment]_[YYYY]_[MM]` UTMs. Clone push-apollo-sequences.py; create
   paused; paste sequence ids into the config. Reply-triage feeds the same
   speed-to-lead desk (prompt already in the starter kit).
6. **Import + enroll**: same scripts, labels `brand:wildeggs`, `store:{slug}`,
   `segment:{name}`.
7. **Activate** on the ramp: test sends → recoverable champions (playbook: 15
   highest-value first) → winback → warm → cold/lost-cause, ~50/day cap.
8. **Lifecycle weekly**: same engine, second invocation with `--config
   config/wildeggs.json`. Per-brand state lives in the WE data dir; brands never collide.
9. **Lookalikes**: after the WE accounts-master exists - geofences derive from WE
   store cities automatically (Louisville/Lexington/Indy/Cincy metros), champion
   vertical profile recomputed from WE data (expect churches, schools, athletics,
   offices - different fingerprint than CBW's healthcare skew).

## Still needed from Elle

- Wild Eggs EZ Cater export (blocks everything)
- elle@wildeggs.com (or catering@) mailbox linked in Apollo
- Confirmation of the 10 unconfirmed Toast store slugs in store-urls.csv
- Credit budget decision if the full 846-account enrichment is a go
