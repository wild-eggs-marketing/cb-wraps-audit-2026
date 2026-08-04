# Handoff prompt

Paste everything below the line into a new thread. Have your Apollo API key ready — the key is
not stored in the repo, and a fresh container will not have it.

---

I'm Elle, marketing lead for Crazy Bowls & Wraps (CBW) and Wild Eggs (WE). We're running
AI-driven catering reactivation and net-new prospecting through Apollo.io. Pick up existing
work — do not start over.

**Repo:** `wild-eggs-marketing/cb-wraps-audit-2026`, branch `claude/apollo-mcp-csv-enrich-28fjkr`
(push works). **Read `CLAUDE.md` at the repo root before doing anything** — it documents the
Apollo API's undocumented behaviour and the verification rules behind every regression we've
already had. Most of those cost us real damage; don't relearn them.

My Apollo API key is: [PASTE KEY HERE]. Write it to `/home/user/.apollo-key` (chmod 600) — every
script reads `APOLLO_API_KEY` from the environment, and MCP connector tools are approval-gated
so everything goes through REST.

## Where things stand

Live in Apollo: 1,031 contacts, 844 mailable (one record per person), 9 sequences.
CBW Champion 23 / Winback 76 / Warm 26 / Cold 331. WE ChampRecov 2 / ChampLost 1 / Winback 41 /
Warm 38 / Cold 272. Sent to date: 147 delivered, 14 hard bounces, 2 spam blocks, 2 replies.

Both Cold sequences are deliberately **not sending** (touches at `to_be_reviewed`) and should
stay that way until the bounce problem is addressed.

## First thing you do

    cd cbw-catering-growth/scripts && APOLLO_API_KEY=... python3 invariants.py

This is the gate. It checks duplicate exposure, one-record-per-person, merge fields on every
enrolled contact, dedupe orphans, active-vs-approved touch agreement, and the bounce ceiling.
Exit 0 means safe. Two checks are expected to be red until I act on them (below) — everything
else must be green before you send anything or run any engine.

## Engines (`cbw-catering-growth/scripts/`)

- `daily-expansion.py` — daily net-new leads, both brands, geofenced per store. Should run daily.
- `lifecycle-engine.py <export.csv> [--config config/wildeggs.json] [--dry-run]` — weekly
  re-segmentation and enrollment. Always `--dry-run` first.
- `lookalike-engine.py`, `we-lookalikes.py`, `signal-sweep.py` — per-store prospecting.
- `apollo_dedupe.py` — shared existence guard; anything that creates contacts must use it.
- `invariants.py` — the gate.

**Nothing schedules these.** No cron, the container is ephemeral, and Routines need my approval.
Verify an engine actually ran by checking contact `created_at` — don't assume.

## Open items, most important first

1. **Franchise rollout — not started, and I need it.** Everything built previously was lost to a
   container recycle: the plan, the A1/A2 tier extracts, the eligibility config, and
   `franchise-refresh.py`. Nothing survives on disk, in git, or in Apollo. **I will re-upload
   Nathan Haffke's Chain Store Guide xlsx — ask me for it if I haven't.** Rebuild: his 100-point
   scoring model, A1 (90+) and A2 (80–89) tiers, exclude **California, Washington, Hawaii,
   Illinois, Maryland, New York, Virginia**, then net-new cold-outbound lookalikes using the same
   sequence architecture as catering. Commit and push as you go this time.
2. **Hard bounce is 8.3–8.6%** (12.9% on CBW Winback), 4–6× the 2% danger line, steady across
   send days, all step-1 first contacts. Every contact is Apollo-`verified`, including all 20
   failures — so Apollo's verified flag is worthless here and no in-Apollo signal will catch it.
   Fixing it needs external SMTP-level verification before send. Advise me on options.
3. **Three UI-only things only I can do** (the API accepts and silently discards these):
   set `auto_pause_bounce_rate` on all 9 sequences; pause CBW Cold, CBW Warm and WE Cold, which
   report `active: true`; start mailwarming on both mailboxes (`never_started`).
4. **A scheduler** so expansion is genuinely daily and lifecycle genuinely weekly. Expansion
   silently produced nothing for 4 days and lifecycle for 6 because nothing invoked them.
5. `wildeggs.com` DKIM `selector2` publishes no key. Low-priority hygiene — it does **not** cause
   quarantine (DMARC passes on aligned SPF) and is not blocking anything. Don't inflate it.

## How I want you to work

Verify against the live API before telling me anything is true — read the actual field, use a
complete paginated read, and confirm an anomaly is real before explaining its cause. I have
corrected you several times and been right each time; when I push back, re-derive from the API
rather than defending the conclusion. Say plainly when something is lost, broken, or unknown.
Don't activate sequences, raise sending caps, or enroll into an active sequence without telling
me the bounce consequence first.
