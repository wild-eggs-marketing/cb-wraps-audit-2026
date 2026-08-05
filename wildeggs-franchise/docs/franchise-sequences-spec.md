# Wild Eggs Franchise-Development Email Sequence — Final Specification

**Prepared for:** Elle (elle@wildeggs.com) | **Audience:** 46 verified owners/founders and CEOs/presidents of 4–40-unit restaurant groups | **Channel:** Apollo sequences, M365 mailbox, 8–10 sends/day | **Date:** 2026-08-05

---

## 1. COMPLIANCE RAILS (hard rules — every email, every step)

| # | Rule | What the emails may NOT say | Source (claim #) | Confidence |
|---|------|------------------------------|------------------|------------|
| R1 | **Zero financial performance representations.** No AUV, revenue, sales ranges, profit, margins, ROI, payback, "units doing $X," daypart sales figures, or *implied* earnings ("better margins than dinner concepts," "strong unit economics"). Qualitative structure claims only: single daypart, no dinner service, scratch kitchen, 19 units, founding year. | ❌ "Our units average…" ❌ "pays back in…" ❌ "higher-margin daypart" ❌ any chart/table/calculation | [1], [21] — 16 CFR 436.1(e), 436.9(c) | 0.93–0.96 |
| R2 | **Numbers only via Item 19 — and not in cold steps.** A figure may appear only if it is verbatim in a current Item 19 with the required admonition + dates + %-attaining data. Practical rule for this sequence: no numbers at all; at most a *pointer* to Item 19 ("our FDD's Item 19 covers unit-level performance"), and only after confirming Wild Eggs' FDD actually has an Item 19. | ❌ quoting any Item 19 figure in email | [2], [21] — 16 CFR 436.9(c), 436.5(s)(3) | 0.96–0.97 |
| R3 | **Never anchor a cost to revenue.** Fee/investment facts (franchise fee, investment range, footprint) are permissible; "food cost runs X% of sales" is an FPR. This spec omits fee figures anyway pending FDD cross-check (see R5). | ❌ "labor is only Y% of revenue" | [3] — NASAA FPR Commentary Q19.1 | 0.97 |
| R4 | **Earnings-free validation only.** "Talk to our operators" is fine; any testimonial stating/implying a franchisee's sales or earnings is an FPR. Never present a paid insider as an independent reference. | ❌ "our Lexington operator cleared $X" | [7] — 16 CFR 436.9(b), 436.1(e) | 0.95 |
| R5 | **Every factual claim must match the current FDD exactly** (unit count, markets, support, fees). Elle is a "franchise seller" and each prospect a "prospective franchisee" from email 1. Version-control final copy; merge fields make each send a discoverable individualized representation. Counsel reviews final copy before Apollo load. | ❌ anything contradicting the FDD (436.9(a)) | [5] — 16 CFR 436.1(j), 436.1(r), 436.9(a) | 0.93 |
| R6 | **State screening BEFORE send — the highest-stakes step.** 14 registration states; the current exclusion list covers only 7. Suppress or clear prospects located in (or being pitched to develop in) **IN, MI, MN, ND, RI, SD, WI** unless registration/exemption is confirmed. Indiana is a core Wild Eggs market and is NOT currently excluded. | ❌ any send into an uncleared registration state | [6] | 0.90 |
| R7 | **FDD never sent cold; must be ready day 1.** Cold email starts no 14-day clock (that triggers on signing/payment), but a prospect's reasonable request for the FDD must be honored promptly (436.9(e)). CTA is a call, never "request our FDD." | ❌ "reply for our FDD" as a step-1 CTA | [4], [22] | 0.96–0.97 |
| R8 | **No sophistication shortcut.** Draft to full-compliance standard even though many prospects might qualify for the large-franchisee exemption; it's transaction-specific and cannot be presumed at outreach. | ❌ loosened copy "because they're operators" | [8] | 0.93 |
| R9 | **Operational preconditions, not wording:** confirm business-opportunity exemption filings current for filing states in the list (KY, FL, TX, UT, NE especially) and federal trademark registration. The word "opportunity" is a spam-filter issue, not a legal one — but this copy avoids it anyway per [24]. | — | [9] | 0.85 |
| R10 | **No refuted assumptions:** do not treat NY as "prior-approval," do not rely on the 8-state ad-filing list (correct pre-use ad-filing states: CA, MD, MN, NY, ND, WA — all suppressed or screened under R6 anyway), and do not cite the "single image cuts opens 25%" stat. Plain-text format is kept as a directional/deliverability choice only. | — | Refuted items 1–2 | n/a |

---

## 2. SEQUENCE SET

**Global format rules:** plain text, no images/links-heavy footers, one link max (none preferred until reply). 50–100 words per body ([24], 0.85). Subject = specific + prospect-personalized, lowercase, no salesy words ([14] 0.85; internal-mail style, unverified ×0.6 ≈ 0.36 → 0.22, used as tiebreaker only). Merge fields: `{{first_name}}`, `{{fr_total_units}}`, `{{fr_concept_segment}}`, `{{fr_territory}}`, `{{fr_approach}}`. The `{{fr_approach}}` field is each prospect's pre-written one-sentence hook and MUST read like a human wrote it (generic mail-merge personalization backfires — unverified, 0.27×0.6≈0.16, but consistent with [14]/[24]).

*Signature on every step (compact, 3 lines max):* `Elle [Last Name] — Franchise Development, Wild Eggs — Louisville, KY`

---

### VARIANT A — Owner/Founder (majority of list)

#### A1 — Day 0
**Subject:** `a 6am–2pm concept next to your {{fr_total_units}} units`

> {{first_name}} — {{fr_approach}}
>
> I'm with Wild Eggs, a scratch-kitchen breakfast-and-brunch brand founded in Louisville in 2007 — 19 restaurants across Kentucky, Indiana, and Ohio, relaunched and growing since 2025.
>
> The whole model runs one daypart, roughly 6am to 2pm. One shift. No dinner service. That's the reason operators already running {{fr_concept_segment}} restaurants look at it.
>
> Worth a look for {{fr_territory}}? Just reply "worth a look" and I'll send the two-paragraph version of how we think about development territory.

*(~85 words)*

| Copy decision | Claim(s) | Confidence |
|---|---|---|
| Per-prospect hook + unit count in subject/line 1 | [14] | 0.85 |
| Diversification-into-daypart opener, operator vocabulary, zero lifestyle content | [12], [13] | 0.80 |
| Structure facts only (19 units, 2007, one daypart, no dinner) — no numbers | [1], [21] | 0.93–0.96 |
| Interest CTA ("worth a look?"), not a calendar ask | [24]; interest-CTA study (unverified ×0.6 ≈ 0.23) | 0.85 / 0.23 |
| 50–100 word discipline | [24] | 0.85 |
| Founder-story frame ("founded 2007, Louisville"), not PE frame | [17] | 0.85 |

#### A2 — Day 4
**Subject:** `first watch isn't franchising — we are`

> {{first_name}} — quick add to my last note.
>
> The two biggest names in daytime dining aren't available to operators: First Watch has been buying its franchisees *out*, and Snooze says plainly it won't franchise. The demand side of the daypart is proven; the franchisable supply is thin.
>
> Wild Eggs is one of the few scratch-kitchen brunch brands where an operator can still get real development territory — and {{fr_territory}} is open.
>
> Open to taking a look?

*(~75 words)*

| Copy decision | Claim(s) | Confidence |
|---|---|---|
| Scarcity frame naming First Watch buybacks | [10] | 0.90 |
| Snooze "won't franchise" — factual, verifiable tone | [11] | 0.92 |
| "Development territory," never "become a franchisee" | [13] | 0.80 |
| Category proof without any sales/AUV figure | [1], [20] (used qualitatively only) | 0.93 |

#### A3 — Day 9
**Subject:** `talk to someone running one`

> {{first_name}} — rather than send you a packet, the most useful thing I can offer is people: 20 minutes with our leadership, or directly with an operator running Wild Eggs units today, on what a single-daypart scratch kitchen actually takes to run alongside a {{fr_concept_segment}} group.
>
> No pitch deck, no forms. If a breakfast daypart could fit your next 12–24 months, I'll set the call up. If not, tell me and I'll leave you alone.

*(~80 words)*

| Copy decision | Claim(s) | Confidence |
|---|---|---|
| Peer-access CTA (operator call) instead of "franchise information" | [16], [19] | 0.85 |
| Referral-feel positioning, anti-portal | [15], [16] | 0.85 |
| Earnings-free validation offer | [7] | 0.95 |
| Call CTA creates no disclosure trigger | [4] | 0.97 |

#### A4 — Day 16
**Subject:** `closing the file on {{fr_territory}}`

> {{first_name}} — last note from me. I'll take silence as "not now" and close the file.
>
> If adding a 6am–2pm concept ever makes sense for your group, {{fr_territory}} is where I'd start. One word back — "later" or "no" — and I'll act accordingly.
>
> Either way, good luck with the {{fr_total_units}} units.

*(~55 words)*

| Copy decision | Claim(s) | Confidence |
|---|---|---|
| Permission-to-close format, <60 words, yes/no exit | Breakup-email data (unverified ×0.6 ≈ 0.18); [23] zero-burned-bridges architecture | 0.18 / 0.95 |
| Graceful close, door left open for 60–90-day re-touch | [23] | 0.95 |
| 4 steps total, 3–7 day spacing, stop before spam-risk zone | Sequence-length benchmarks (unverified ×0.6 ≈ 0.22) | 0.22 |

---

### VARIANT B — CEO/President

#### B1 — Day 0
**Subject:** `daypart diversification — {{fr_territory}}`

> {{first_name}} — {{fr_approach}}
>
> One industry datapoint: per Restaurant Business's Top 500 work, essentially all the growth in family dining right now is coming from daytime-only concepts — and the biggest names there (First Watch, Snooze) don't franchise.
>
> Wild Eggs is a 19-unit scratch-kitchen breakfast brand — Louisville, founded 2007, KY/IN/OH — now opening development territory to established operators. Single daypart, ~6am–2pm, no dinner service.
>
> Happy to share how we'd suggest a multi-unit {{fr_concept_segment}} group evaluate adding a breakfast daypart — useful whether or not we're the fit.

*(~95 words)*

| Copy decision | Claim(s) | Confidence |
|---|---|---|
| Lead with portfolio priority + third-party segment proof (qualitative — the 11.6%/$2.09M figures deliberately stripped per R1) | [20], [24], [1] | 0.93 / 0.85 |
| Scarcity in one clause | [10], [11] | 0.90 |
| "Offer of value" CTA (evaluation framework), not a meeting ask — execs reply less, so the CTA must give before it asks | [24] | 0.85 |
| ≤100 words, no buzzwords, no "opportunity" | [24] | 0.85 |

#### B2 — Day 4
**Subject:** `development rights, {{fr_territory}}`

> {{first_name}} — a group running {{fr_total_units}} units already has what makes a second concept work: sites, supervision, HR, vendor relationships. We're not looking to teach anyone the restaurant business.
>
> What Wild Eggs adds is a daypart your current portfolio doesn't touch — doors open ~6am, closed by ~2pm, scratch kitchen, one shift a day.
>
> We're structuring multi-unit development agreements, not single-unit sales, and {{fr_territory}} is open.
>
> Is daypart diversification on your roadmap for the next 12–24 months?

*(~85 words)*

| Copy decision | Claim(s) | Confidence |
|---|---|---|
| "You already have the infrastructure" respect frame; development agreements, territory named explicitly | [13] | 0.80 |
| One-shift/no-nights as operational fact, not profit claim | [1], [3], [12] | 0.93–0.97 / 0.80 |
| Roadmap question = interest CTA | [24] | 0.85 |

#### B3 — Day 10
**Subject:** `diligence, not a pitch`

> {{first_name}} — you'll evaluate this like any acquisition, so I'll skip the marketing.
>
> What I can put in front of you: our leadership, and operators running Wild Eggs units today in our KY/OH markets — the people who can answer the questions that matter. **[INCLUDE ONLY IF COUNSEL CONFIRMS A CURRENT ITEM 19: Our FDD's Item 19 covers unit-level performance — that's a walk-through conversation once we're both serious, not an email.]**
>
> Twenty minutes to decide whether {{fr_territory}} is worth real diligence?

*(~75–90 words depending on conditional)*

| Copy decision | Claim(s) | Confidence |
|---|---|---|
| Item 19 *pointer* with no figures — the standard compliant hook; bracketed pending FDD confirmation | [2] | 0.97 |
| Peer/leadership access as the CTA; only real operators, never a paid insider framed as independent | [7], [16], [19] | 0.95 / 0.85 |
| First direct time-ask deferred to step 3, after two value/interest touches | [24]; interest-CTA data (unverified ×0.6 ≈ 0.23) | 0.85 |

#### B4 — Day 17
**Subject:** `last one from me`

> {{first_name}} — closing the loop. If a breakfast daypart isn't on your growth agenda, no reply needed and I'll close the file.
>
> If it's "not now," send one word — "Q1," "next year" — and I'll come back exactly then, with {{fr_territory}} status in hand. Thanks either way.

*(~48 words)*

| Copy decision | Claim(s) | Confidence |
|---|---|---|
| <50-word yes/no/later exit; scheduled re-engagement hook | Breakup benchmarks (×0.6 ≈ 0.18); [23] | 0.18 / 0.95 |
| 24-week cycle expectation → "come back exactly then" is the real strategy, not a gimmick | [23] | 0.95 |

**Optional LinkedIn layer (both variants):** connection request (no note, or 1 neutral line) between Day 0 and Day 4; no InMail pitch. Rationale is name-recognition before email 2 lands — unverified (×0.6 ≈ 0.16–0.20), so treat as optional, not load-bearing.

---

## 3. CTA LADDER + REPLY PROTOCOL

**Ladder:** Step 1 — interest reply ("worth a look") → Step 2 — interest/roadmap question → Step 3 — 20-min call with leadership or a current operator → Step 4 — permission to close / calendar a named re-touch. The FDD is **never** a sequence CTA ([4], [22]).

**On any reply:**
1. **Apollo automation stops immediately for that contact** — every reply gets manual, personal handling by Elle ([15], 0.85). Target response same business day; within 1–4 hours if practical (speed-to-lead data is unverified, ×0.6 ≈ 0.22, but the direction is safe and cheap).
2. **Positive reply →** Elle books the 20-min call (leadership or operator). No numbers on the call beyond what counsel has cleared; operators briefed that anecdotes implying sales/earnings levels are off-limits ([7]).
3. **Prospect asks for the FDD →** furnish it promptly with receipt tracking — refusing or stalling a reasonable request violates 436.9(e) ([4], [22]). **Precondition: the FDD must be current, registered/exempt where needed, and packaged for delivery before the first send goes out.**
4. **The 14-day rule:** the clock is triggered by signing or payment, not by contact or even FDD delivery — but no agreement is signed or money taken until 14 calendar days after documented FDD receipt ([4]). Track receipt dates per prospect.
5. **"Not now" replies →** logged with a dated re-touch (60–90 days post-sequence), matching the ~24-week average cycle ([23], 0.95). At ~2% industry lead-to-sale, every non-hostile reply is pipeline, not a loss.

---

## 4. MEASUREMENT — what 46 sends should produce (ranges, not points)

First: the sendable list is likely **<46** after R6 screening (Indiana-based prospects especially). Denominate all metrics on the post-screen count, N.

| Metric | Expected range | Basis |
|---|---|---|
| Any reply (positive + negative), full sequence | **8–20% of N → roughly 3–8 replies** | 8.5% baseline for generic outreach [14]; personalization lifts ~30% [14]; 3–5-step sequences and follow-up contribution push the top end (unverified, ×0.6); C-level variant runs ~30% lower [24] |
| Positive/interested replies | **2–8% of N → roughly 1–3 conversations** | Derived from above; interest-CTA design (unverified ×0.6) |
| Calls booked | **1–3** | [19], [24]; small-N reality |
| Signed development agreements from this batch | **0–1, on a ~24-week horizon** | 1.5% baseline lead-to-deal, 0.44% for full-service [15]; 2% leads-to-sale, 12% qualified-leads-to-sale [23]. At these rates a 46-name list worked as a funnel yields ~0 — which is why the design optimizes for zero burned bridges and a re-touch cycle, not conversion this quarter [23] |
| Per-variant read | Owner/Founder should out-reply CEO/President | [24] exec penalty; founder-responsiveness data (unverified ×0.6 ≈ 0.16) |

**Operational cadence:** at 8–10/day, each step takes ~5–6 business days to traverse the list — stagger cohorts so Day-4 follow-ups don't collide with the daily cap. Judge the campaign on **conversations started and relationships dated for re-touch**, not on close rate.

---

## 5. CONFIDENCE SUMMARY

| Design choice | Overall confidence | Anchor claims |
|---|---|---|
| Zero-numbers compliance posture (structure-only selling) | **Very high (0.93–0.97)** | [1][2][3][7][21] |
| Call-first CTA ladder, FDD post-reply only | **Very high (0.96)** | [4][22] |
| Diversification + one-daypart + scarcity messaging frame | **High (0.80–0.92)** | [10][11][12][13][20] |
| 50–100 words, personalized subject/first line, offer-CTA for execs | **High (0.85)** | [14][24] |
| Relationship-not-funnel architecture, 4 steps, breakup close, 60–90-day re-touch | **High for the architecture (0.85–0.95)** [15][16][19][23]; **low for specific step-count/spacing/breakup stats (0.18–0.23, unverified ×0.6)** — spacing choices are judgment calls the verified data doesn't contradict |
| Plain-text format, send-time targeting, LinkedIn layer | **Low (0.16–0.24)** — directional only; one supporting claim was refuted on specifics. Treat as free choices, not evidence-backed. |

### Top 3 things a human MUST sanity-check before approval

1. **State screening of all 46 prospects against all 14 registration states — including Indiana** (a core Wild Eggs market that is *not* on the exclusion list), and against the prospect's likely *development* territory, not just HQ. Suppress IN/MI/MN/ND/RI/SD/WI prospects unless counsel confirms effective registration or exemption. This is the single highest-stakes item ([6], 0.90).
2. **FDD cross-check + counsel sign-off on final copy:** confirm the FDD is current and ready to furnish on request; confirm whether it contains an Item 19 (gates the bracketed line in B3); verify every factual claim in the copy — "19 units," "founded 2007," "KY/IN/OH," "2025 relaunch," "6am–2pm," territory-availability statements — matches the FDD and public record exactly; version-control the loaded Apollo copy ([2][5][17][22]).
3. **Pre-launch operational filings + comp-fact freshness:** business-opportunity exemption filings current for KY/FL/TX/UT/NE (and any other filing state on the list), federal trademark registration confirmed ([9]); and re-verify at send date that First Watch and Snooze still aren't franchising ([10][11]) — operators will check, and B1/A2 lean on it. Also confirm the "how we'd suggest a group evaluate a breakfast daypart" offer in B1 has a real one-pager behind it before promising it.