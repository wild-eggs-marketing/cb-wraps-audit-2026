# Catering + franchise outbound pipeline (Crazy Bowls & Wraps, Wild Eggs)

Apollo.io is the system of record. The container is ephemeral and has already been recycled
once, losing a day of work — **commit and push early**, and prefer Apollo over local disk for
anything that must survive.

## Read this before claiming anything about live state

Every rule below was learned by getting it wrong in production.

**Read the field before you describe it.** The worst error in this project's history was
asserting `failure_reason` was null without ever reading it; it held 14 `Bounce`, 2
`Spam Blocked`, 2 `snippets_missing`, 2 invalid-MX. A field name that returns `None` usually
means the name is wrong, not that the value is zero — `num_delivered` does not exist,
`unique_delivered` does. If a counter reads 0 across every record, suspect the key first.

**Establish the anomaly is real before explaining it.** A phantom "Wild Eggs engagement gap"
was invented by dividing filtered opens by total delivered, then explained with three
successive wrong deliverability theories (broken tracking CNAME, missing unsubscribe, DKIM
selector rotation). The correct denominator — `unique_delivered_open_tracked` — was in the same
object as the numerator and showed the brands were equivalent (60% vs 59%). Compute the metric
correctly, confirm the gap exists, and only then look for a cause.

**Verify against Apollo, not against a prior summary.** Counts drift, snapshots go stale, and
step-1 counters are not sequence totals. Re-pull before reporting.

**Beware your own pagination — this has caused both a false alarm and real damage.**
`contacts/search` returns **short pages in the middle of a run** and shuffles records between
pages across calls. Never `break` on `len(got) < per_page`; break only on an empty page or
`page >= pagination.total_pages`, then **repeat full passes and union the ids until the count
reaches `pagination.total_entries`** (see `apollo_dedupe.all_contacts`). One pass returned 755
emails where the truth was 853, and that 98-email blind spot let a contact created on 07-31 be
created again on 08-04. A separate incomplete pull invented a "6 contacts are missing
addresses" alarm; all six were fine. Any conclusion of the form "X is absent" or "X is a
duplicate" must come from a union pull that reconciles against `total_entries`.

**When the user pushes back, re-derive from the API.** Every pushback in this project has been
correct. Argue the mechanism through, don't defend the conclusion.

## Apollo API facts (hard-won, mostly undocumented)

- Auth is `x-api-key`. MCP connector tools are approval-gated (`-32003`); use REST.
- Template content writes **only** via flat `PUT /emailer_templates/{id}`.
  `PUT /emailer_touches/{id}` always 422s (`undefined method '[]' for nil`).
- **Activation needs two gates**: `POST /emailer_campaigns/{id}/approve` *and*
  `POST /emailer_touches/{id}/approve`. Touches left at `to_be_reviewed` silently block all
  scheduling — this is the real send gate, more so than the campaign's `active` flag.
- `PUT /emailer_campaigns/{id}` returns **200 while silently discarding** `active`,
  `auto_pause_bounce_rate`, and most other fields. There is no pause endpoint
  (`/pause`, `/deactivate`, `/unapprove` all 404). Pausing is UI-only. **Never infer a write
  succeeded from a 200 — read the value back.**
- `remove_or_stop_contact_ids` 404s on this plan. To stop mail to a contact, set
  `email_unsubscribed: true` via `PUT /contacts/{id}`. Verified **per-record**, so suppressing a
  duplicate record does not suppress the real person.
- `POST /contacts` **never upserts on email** — it creates a new record every call. Always check
  existence first (`scripts/apollo_dedupe.py`). This produced 177 duplicate records; one person
  held 10, all enrolled in a cold sequence.
- `people/bulk_match` **must include `first_name`**. Person search returns
  `last_name_obfuscated`, not `last_name`, so id + organization_name alone fuzzy-matches to an
  unrelated person at another company.
- `typed_custom_fields` must be created with `"type": "string"`. `"text"` is silently accepted
  and yields a type-less field that rejects both CSV import and API writes.
- Empty merge fields make Apollo **refuse the send** (`not_sent_reason: snippets_missing`) — the
  message is never transmitted. Stamp custom fields and confirm they landed *before* enrolling.
- `contacts/search` does **not** return `label_names`; store attribution can only be read from
  local CSVs. `contact_campaign_statuses` only ever holds
  `active` / `paused` / `failed` / `finished` — **`finished_replied` does not exist**. For real
  replies use the message-level `replied` flag and exclude `reply_class == "out_of_office"`.
- Search results return `estimated_num_employees: null` on every org. Do not branch on company
  size; it is not knowable at scoring time.
- No credit-balance endpoint (`usage_stats/credit_usage_stats` 404s). Local ledgers are
  estimates and must reset on the billing cycle or expansion stops for good.
- Rate limits: **400/hour** on `contacts/update` and on account creates. Space writes ~3s
  apart; bursts at 0.5s trip 429 even well under the hourly count.
- `dig` does not resolve in this sandbox. Use DNS-over-HTTPS
  (`https://cloudflare-dns.com/dns-query?name=…&type=…`). Empty `dig` output is a tool failure,
  not a missing record.

## Deliverability facts

- Apollo auto-injects a one-click unsubscribe into **`appendment_html`** on every sent message.
  It is not in the template body — checking templates alone will wrongly report it missing.
- Tracking hosts are `mail.<domain>` → `*.aploconnect.com`. `link.<domain>` is not used.
- DMARC passes on **either** aligned SPF **or** aligned DKIM. Both domains publish
  `include:spf.protection.outlook.com -all` and send through the M365 mailbox, so SPF aligns
  strictly and DMARC passes regardless of DKIM state. A missing M365 `selector2` key is a
  standby slot, not a live failure — M365 signs with one active selector.
- Open-tracking coverage is uneven per sequence. Always divide by
  `unique_delivered_open_tracked`, never by `unique_delivered`. Apollo's `unique_opened` is
  bot-filtered; `unique_opened_unfiltered` is not — say which you mean.
- **Apollo's `email_status: verified` is not predictive here.** 100% of enrolled contacts are
  "verified" and the hard-bounce rate is still 8.6% (12.9% on CBW Winback). Reducing it needs
  external SMTP-level verification before send; no in-Apollo signal will catch it.

## Engines (`cbw-catering-growth/scripts/`)

- `daily-expansion.py` — net-new leads, both brands, geofenced per store, LRU store rotation,
  credit ledger, dedupes against Apollo. Enrolls into each brand's **Cold** sequence.
- `lifecycle-engine.py` — re-segments from a fresh ezCater export and enrolls genuine segment
  transitions. `--config config/wildeggs.json` for Wild Eggs. `--dry-run` first, always.
- `lookalike-engine.py` / `we-lookalikes.py` / `signal-sweep.py` — per-store prospecting.
- `apollo_dedupe.py` — shared existence guard. Use it in anything that creates contacts.

**Nothing schedules these.** No crontab, ephemeral container, and the Routines API needs the
owner's approval. Expansion silently produced nothing for 4 days and lifecycle for 6 because of
this. If a "daily" engine matters, verify it actually ran by checking contact `created_at`.

Geofencing: filter on **person** location as well as employer — `organization_ids` matches the
employer's HQ, which let a Portland church and a Johannesburg office into a KY/IN sequence.
Served states derive from each brand's own order history; exclude ezCater's own marketplace row
(`Location='[REMOVED]'`, `City='Ezcater'`, `State='MA'`) or it admits Massachusetts.

## Operational rules

- **No Apollo UI template edits without coordination** — UI saves silently overwrite
  API-managed content. This already destroyed a rebuilt CBW Cold sequence once.
- Promo `CATERCRAZY10` ($10 off $150+) is **Crazy Bowls only**, and only in Winback and Cold —
  never Champion or Warm (margin), never Wild Eggs (wrong brand).
- CAN-SPAM address on CBW is per-store via `{{cbw_store_address}}`; the authoritative
  email→store join is `Contact Email` + `Assigned Store` in `data/accounts-enriched.csv`.
- Wild Eggs replies route to per-store inboxes via `we_store_reply_email`, and CTAs go to the
  store's Toast URL — never ezCater (commission).
- Contact CSVs are gitignored deliberately: the owner asked that contacts not live in the repo.
