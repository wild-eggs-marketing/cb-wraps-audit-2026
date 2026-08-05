# Wild Eggs Franchise Development — FINAL Sequence Set (Nathan Haffke)

**Sender:** Nathan Haffke, Franchise Development Manager (FDD Item 2 title; named franchise seller on the Receipts page with CEO Clifford Harris)
**Audience:** 39 verified prospects — 24 Owner/Founder, 15 CEO/President — of 4–40-unit US restaurant groups, all already screened out of the 14 pending registration states
**Factual authority:** `wildeggs-franchise/docs/fdd-facts.md` (every claim below traces to it)
**Rails:** R1–R10 and the CTA ladder from `franchise-sequences-spec.md` survive; all copy is new

---

## 1. NATHAN'S VOICE + ANTI-AI STYLE STANDARD

Every email must pass every check below before Apollo load. These are grep-able, not vibes. Rationale: heavy LLM users detect AI text near-perfectly and humanizing tricks fail [7]; the tells are a studied, closed list [5][6]; the industry's own benchmark report says personal-touch outreach is the converting playbook and AI-patterned email gets discounted [1]; and at 39 recipients one spam click is a 2.6% complaint rate on a shared domain [8].

**S1 — Lexical ban list (zero occurrences per email; grep before load).** `delve, intricate, meticulous(ly), pivotal, realm, showcase/showcasing, underscore(s/ing), tapestry, testament, vibrant, robust, crucial, boasts, garner, foster(ing), interplay, enduring, bolster(ed), enhance, landscape` (as abstract noun), `align with`, `highlight` (as verb), `emphasizing`, sentence-initial `Additionally`. One stray hit means rewrite the sentence, not swap the word. [5]

**S2 — Zero negative parallelism.** No `not just X, but Y`, `isn't just… it's…`, `it's not X, it's Y`, `more than just`. At most one plain `X, not Y` contrast per email. [6]

**S3 — Rule-of-three audit.** No rhetorical triads (three adjectives, three parallel clauses, three punchy fragments). Factual enumerations are exempt (`breakfast, brunch and lunch`; `Kentucky, Indiana and Ohio` are the FDD's own lists). [6]

**S4 — Em dashes: max one per email, none space-surrounded.** Prefer commas and periods. (Unverified tell at 0.51 confidence, but the cost of compliance is zero.)

**S5 — Human markers required.** At least two contractions per email; first person throughout; plain `is/has` (never `serves as`, `stands as`, `features`); `use` not `utilize`; hedges and definites allowed (`probably`, `the only`). (Unverified composite ~0.5, consistent with [5][7].)

**S6 — Specificity anchor.** Every email contains at least one fact an LLM couldn't invent: an FDD number, a named person, a real date, or Nathan's own history. Specificity is the one property paraphrase can't fake. [7]

**S7 — One idea, one ask.** Body 60–120 words, reading level roughly grade 4–6, sentence lengths varied (at least one sentence under six words). (Lavender data, unverified 0.42 — cheap and directionally safe.)

**S8 — No urgency, ever.** No deadlines, no "limited territories," no "this week." The real cycle is ~24 weeks; posture is "I'm the person on the receipts page when you're ready." [3]

**S9 — Plain text, one link max** and it is always `WildEggsFranchising.com` (the diligence hub closes what email can't [3]). No images, no attachments, real reply-to, Nathan's direct number in every signature — 82% of brands can't produce a person who answers a phone; we can [2].

**S10 — `{{fr_approach}}` is hand-written per prospect**, one sentence, referencing something checkable about their group. If it could be pasted onto another prospect, it fails.

**Signature block (every step, verbatim):**

```
Nathan Haffke
Franchise Development Manager, Wild Eggs
502-807-9403 direct. I answer it.
Franchising@WildEggs.com | WildEggsFranchising.com
```

**Optional footer (belt-and-suspenders for forwards, never a substitute for the recipient-state filter):**
`This note is not directed to residents of any state where Wild Eggs is not yet registered to offer franchises.` [12]

---

## 2. SEQUENCE SET

Merge fields: `{{first_name}}` `{{fr_total_units}}` `{{fr_concept_segment}}` `{{fr_territory}}` `{{fr_approach}}`. Stamp and read back all fields before enrolling (empty merge fields make Apollo refuse the send — `snippets_missing`).

### VARIANT A — Owner/Founder (24 prospects)

#### A1 — Day 0
**Subject:** `breakfast next to your {{fr_total_units}} units`

> {{first_name}},
>
> {{fr_approach}}
>
> I run franchise development at Wild Eggs. We're 19 restaurants across Kentucky, Indiana and Ohio. Upscale breakfast, brunch and lunch. One daypart; the doors close by mid-afternoon. The owners who look hardest at us already run {{fr_concept_segment}} restaurants and want a shift pattern their current concept can't give them.
>
> We added two restaurants in 2024, two more in 2025, and have seven projected for next year, including a signed deal in Texas.
>
> If {{fr_territory}} is worth a look, reply and I'll send the short version of how we set up development territory. If not, no hard feelings.
>
> Nathan

*(~105 words)*

| Decision | Claims | Confidence |
|---|---|---|
| Named-human direct outreach as the opening frame | [1][4] | 0.93 / 0.75 |
| 19 units = live count (wildeggs.com/locations 2026-08-05: 20 listed, only Columbus OH "Coming soon"; Elle confirmed); FDD Item 20's 18 is the 12/30/2025 snapshot | fdd-facts corrections | 0.95 |
| No founding year, "closed by mid-afternoon" | fdd-facts corrections | fact sheet |
| +2/+2/7 momentum with Texas as *signed deal*, not open store | fdd-facts; [15] | 0.93 |
| Interest-reply CTA, no calendar ask (ladder step 1) | prior spec ladder; [3] | 0.95 |
| "one daypart; the doors close by mid-afternoon" phrasing, no triad | [6] | 0.96 |

#### A2 — Day 4
**Subject:** `first watch is buying, not selling`

> {{first_name}},
>
> Quick follow-up. First Watch stopped selling franchises and has been buying its franchisees back. Snooze says plainly it doesn't franchise. So if you want a daytime brand with a franchise structure behind it, the list is short.
>
> Wild Eggs is on it. And here's the part that matters for someone who already owns sites: the low end of our investment range assumes you're converting an existing restaurant with a working hood and walk-in. That's the cheapest way into this daypart.
>
> Is breakfast anywhere on your list for the next year or two?
>
> Nathan

*(~95 words)*

| Decision | Claims | Confidence |
|---|---|---|
| First Watch phrased as buyback in progress, never "has no franchisees" (79 remain) | [9] | 0.98 |
| Snooze "doesn't franchise" present tense, no "never will" | [10] | 0.97 |
| Conversion low-end pitch — Item 7 fact, qualitative, no dollar figure paired with anything revenue-shaped | fdd-facts; [14] | 0.97 |
| Roadmap question CTA (ladder step 2) | prior spec ladder | — |

#### A3 — Day 9
**Subject:** `talk to an operator, not me`

> {{first_name}},
>
> I've done franchise development since 2013, first through my own consultancy, Franchising by Grace, then running development at Silbar Franchise Group before Wild Eggs. One thing that hasn't changed: owners don't want a brochure. They want an hour with someone who runs the thing.
>
> So that's the offer. Twenty minutes with a franchisee operating Wild Eggs in Lexington today, or with our CEO, Clifford Harris, on what a single-daypart scratch kitchen takes to run next to a {{fr_concept_segment}} group. No deck. No forms.
>
> If that's useful, reply with a day that works. If not, tell me to stop and I will.
>
> Nathan

*(~110 words)*

| Decision | Claims | Confidence |
|---|---|---|
| Nathan's real history (2013, Franchising by Grace, Silbar) as the specificity anchor an LLM can't fake | [7]; fdd-facts Item 2 | 0.90 |
| Peer-access call CTA (ladder step 3); creates no disclosure trigger | prior spec R7/ladder; Sturgis "people buy from people" (unverified 0.51) | 0.95 |
| Operators offered, earnings anecdotes off-limits on the call | prior spec R4 | 0.95 |

#### A4 — Day 16
**Subject:** `closing your file`

> {{first_name}},
>
> Last note from me. These deals take months when they happen at all, so I'll read silence as "not now" and close the file.
>
> Two things before I go. Our FDD's Item 19 has full 2025 unit-level tables covering 16 restaurants; when you're ready to dig in, that's where the real conversation starts. And everything else sits at WildEggsFranchising.com whenever you'd rather look than talk.
>
> If it's a timing problem, reply with a rough month and I'll come back then. Not before.
>
> Good luck with the {{fr_total_units}} units either way.
>
> Nathan

*(~100 words)*

| Decision | Claims | Confidence |
|---|---|---|
| Item 19 pointer with **scope only** ("full 2025 tables, 16 restaurants"), zero quality adjectives, zero figures | [13]; fdd-facts | 0.90 |
| "Months when they happen at all" — honest 24-week posture, no urgency | [3] | 0.95 |
| Website as the parting link (second-best converting channel) | [3] | 0.95 |
| Dated re-touch on "later" replies | prior spec §3.5 | 0.95 |

---

### VARIANT B — CEO/President (15 prospects)

#### B1 — Day 0
**Subject:** `a daypart your portfolio doesn't run`

> {{first_name}},
>
> {{fr_approach}}
>
> I run franchise development at Wild Eggs: upscale breakfast, brunch and lunch, 19 restaurants across Kentucky, Indiana and Ohio. One daypart; the doors close by mid-afternoon. We grew by two restaurants in 2024, two in 2025, and have seven more projected, including a signed agreement in Houston.
>
> We sign multi-unit development agreements with established groups, and the unit count and schedule are negotiated, not pulled off a rate card.
>
> Is daypart diversification anywhere on your roadmap for {{fr_territory}}? If you'd rather look before you answer, it's all at WildEggsFranchising.com.
>
> Nathan

*(~100 words)*

| Decision | Claims | Confidence |
|---|---|---|
| MUA with negotiated schedule as the exec-level hook | fdd-facts Exhibit C | fact sheet |
| Houston as *signed agreement* per Item 20/Exhibit D | [15] | 0.93 |
| Single link to the frandev domain, category-standard presentation | [3][4] | 0.95 / 0.75 |
| Roadmap-question CTA on step 1 (execs get the direct question sooner) | prior spec B-variant logic | — |

#### B2 — Day 5
**Subject:** `the cost side, in plain numbers`

> {{first_name}},
>
> A group running {{fr_total_units}} units already has the sites and the supervision. We're not here to teach anyone the restaurant business.
>
> So here's the cost side, straight from our FDD. Franchise fee is $45,000 on the first restaurant, $40,000 on the second, $30,000 after that. The multi-unit development fee is $15,000 for each unit past the first, and it's credited back against those franchise fees as you open. Royalty is 5.5%.
>
> I can't put revenue next to those numbers in an email, and I won't. Item 19 of our FDD has the 2025 unit-level tables when you're ready for them.
>
> Worth a look for {{fr_territory}}?
>
> Nathan

*(~115 words)*

| Decision | Claims | Confidence |
|---|---|---|
| Fee figures in cold email — affirmatively cleared, cost data alone is not an FPR | [14] | 0.97 |
| No revenue/sales/AUV figure anywhere in the same email (would convert it into an FPR); the refusal stated out loud reads as competence to a sophisticated buyer | [14] | 0.97 |
| Cost figures + bare Item 19 pointer in one email — explicitly fine (pointer has no figure to combine) | [13][14] | 0.90 |
| Numbers match FDD Items 5/6 verbatim | fdd-facts; 436.9(a) via [14] | fact sheet |

#### B3 — Day 11
**Subject:** `first watch, snooze, and who's left`

> {{first_name}},
>
> The two biggest daytime brands aren't available to operators. First Watch stopped selling franchises and has been buying its franchisees back. Snooze doesn't franchise. That leaves very few ways to add this daypart with a brand and a system behind it.
>
> I'll skip the pitch. What I can put in front of you is twenty minutes with our CEO, Clifford Harris, or with a franchisee running Wild Eggs in Lexington today. Ask them what a single-daypart scratch kitchen takes to operate.
>
> Would that be worth your time in the next few weeks?
>
> Nathan

*(~100 words)*

| Decision | Claims | Confidence |
|---|---|---|
| Scarcity frame with precisely verifiable phrasing on both comps | [9][10] | 0.97–0.98 |
| Call CTA at step 3 (ladder), leadership + operator access, no earnings anecdotes | prior spec R4/ladder | 0.95 |
| "Next few weeks," not a hard slot — no manufactured urgency | [3] | 0.95 |

#### B4 — Day 18
**Subject:** `last one from me`

> {{first_name}},
>
> Closing the loop. I've done this work since 2013 and I know these decisions run on your calendar, not mine. No reply needed; I'll close the file.
>
> If it's timing, send a rough date and I'll come back then with the current status of {{fr_territory}}. Everything else stays up at WildEggsFranchising.com, and my direct line below doesn't change.
>
> Thanks for reading this far.
>
> Nathan

*(~75 words)*

| Decision | Claims | Confidence |
|---|---|---|
| Sub-80-word breakup, dated re-touch, zero pressure | [3]; prior spec §3.5 | 0.95 |
| Direct line as the standing differentiator (only 18% of brands have a person who answers) | [2] | 0.97 |
| 2013 consultancy anchor repeated as the human signature | [7]; fdd-facts | 0.90 |

**CTA ladder (unchanged from prior spec):** interest reply → roadmap question → 20-min call with leadership/operator → permission-to-close with dated re-touch. The FDD is never a sequence CTA; a reasonable request for it is honored promptly. On any reply: Apollo automation stops for that contact, Nathan replies personally same business day, no autoresponders — at $351/lead and $17,550/sale economics every one of 39 replies gets manual handling [2].

---

## 3. COMPLIANCE DELTAS vs the prior spec

1. **Item 19 pointer now UNCONDITIONAL.** The prior B3 bracketed line ("include only if counsel confirms a current Item 19") is resolved: the FDD has a substantial Item 19 (full 2025 tables, 14 affiliate + 2 franchised restaurants). The pointer appears in A4 and B2, describing **scope only** — never "strong/healthy/impressive," which edges toward an implied FPR [13]. No figure from it appears anywhere.
2. **Fee facts now INCLUDED (they were omitted "pending FDD cross-check").** Included in B2: $45k/$40k/$30k fee ladder, $15,000 × (units−1) MUA development fee with credit-back, 5.5% royalty — cost data alone is not an FPR [14]. **Excluded by choice:** the $686,350–$2,252,550 Item 7 range as digits (the conversion low-end is used qualitatively in A2 instead — the full range is a mouthful that invites transcription drift against 436.9(a)); the 0.5% ad fund (not yet activated — explaining that costs more words than it earns); the $63k–$65k MUA-only figure and Exhibit F financials (fdd-facts bans the latter outright). Hard rule kept: no email that carries a cost figure may ever carry any revenue/sales figure, including third-party segment stats [14].
3. **Factual corrections applied everywhere:** unit count is **19** — the live count (wildeggs.com/locations, verified 2026-08-05: 20 locations listed, exactly one marked "Coming soon!" — Columbus OH; confirmed by Elle), while the FDD's Item 20 says 18 as a 12/30/2025 fiscal-year-end snapshot. Claims about the FDD's own tables (Item 19 covering 16 restaurants' 2025 data) keep the FDD numbers. Re-verify the live count the week of launch. Also: no founding year (2007 removed); "closed by mid-afternoon" not "6am–2pm"; "relaunched since 2025" replaced with the FDD-supported +2 (2024) / +2 (2025) / 7 projected incl. Texas; Texas phrased as signed agreement/projection, never an open store [15].
4. **Registration-state posture: same holds, stronger grounding, tighter mechanics.** The prior R6 worry ("exclusion list covers only 7 of 14") is superseded — the 39-name set already excludes all 14 pending states per fdd-facts. The holds are now known to be legally *required*, not conservative: an email received in MI/CA/NY is an offer made there regardless of build location [11], and NY's internet-offer exemption can never cover a one-to-one email to a NY resident [12]. New controls: verify **person-level residence state** for each of the 39 at send and at every list refresh; before emailing any Texas *resident*, confirm the Form 2703 exemption notice is on file with the Texas SOS [15]; when a state goes effective, check its ad-filing rules before lifting the hold — NY requires filing the copy first [16]. Optional footer line added (§1).
5. **Sender swap Elle → Nathan** with the FDD Item 2 title exactly ("Franchise Development Manager," not "head of franchise sales") and the FDD channels of record. Nathan's receipts-page status means prospects later see his exact name in the legal document — a verification loop the copy is built to survive [4, unverified composite 0.51].
6. **First Watch / Snooze claims re-verified as of 2026-08-05** and re-phrased to the precisely true versions [9][10]; A2/B3 carry them.

---

## 4. LAUNCH PRECONDITIONS (ordered — none skippable)

1. **Nathan's M365 mailbox — nathan@wildeggs.com (per Elle, 2026-08-05) — connected in Apollo** as the sending account, send-as verified with a live test message to an internal address. Replies must land in Nathan's inbox, and Nathan commits to same-business-day manual replies — no autoresponder, no router [2].
2. **Sender swap executed in the sequences:** From-name "Nathan Haffke," signature block from §1 on every touch, reply-to Nathan. Per project rules: never trust a 200 — read every template back after writing it, and no Apollo UI edits after API load.
3. **Residence-state verification of all 39** against the 14 pending states, at person level (not company HQ — the geofencing lesson). Any Texas resident held until the Form 2703 filing is confirmed with the Texas SOS [11][12][15].
4. **Nathan confirms his own facts** match FDD Item 2 verbatim (Silbar title, Franchising by Grace since 2013) and confirms whether Clifford Harris goes by "Cliff" (copy currently says Clifford). Elle re-confirms the 19-unit live count at send date (recount wildeggs.com/locations, excluding "Coming soon" cards) and that the Houston/Lexington signed agreements are still current; re-check First Watch/Snooze status the week of launch [9][10].
5. **Style gate:** run the S1 grep and the S2–S8 checklist on the final loaded copy; counsel signs off on the exact text (including B2's fee figures against Items 5/6); version-control the loaded copy in the repo.
6. **Merge fields stamped and read back** for all 39 (`fr_approach` hand-written per S10) *before* enrollment — empty snippets make Apollo silently refuse the send. Custom fields must be `type: string`, `modality: contact`, verified by write-then-read.
7. **Activation gates:** approve the campaign AND every touch (`to_be_reviewed` touches silently block all sends); confirm the FDD (June 25, 2026) is packaged for prompt delivery on request; brief Clifford and the Lexington operator that sales/earnings anecdotes are off-limits on calls.

---

## 5. CONFIDENCE SUMMARY

| Design choice | Confidence | Anchors |
|---|---|---|
| Structure-facts-only + Item 19 scope-pointer compliance posture | **0.90–0.97** | [13][14], fdd-facts |
| Fee figures in B2 (cost data is not an FPR; never paired with revenue) | **0.97** | [14] |
| Registration-state holds are legally mandatory; person-level residence is the gate | **0.93** | [11][12][16] |
| First Watch/Snooze scarcity frame as phrased | **0.97–0.98** | [9][10] |
| Named-human sender, direct-answered phone, single frandev link, no-urgency 24-week posture | **0.93–0.97** | [1][2][3]; [4] at 0.75 |
| Anti-AI standard S1–S3 (ban list, no negative parallelism, triad audit) | **0.92–0.96** | [5][6][7] |
| S4–S7 details (em-dash cap, contractions, word counts, reading level) | **0.4–0.5, directional** | unverified composites — cheap, no downside |
| Day offsets (0/4/9/16 and 0/5/11/18) | **judgment call** | carried from prior spec; no verified data contradicts |

**Top 3 things a human must check before approval:**

1. **Residence-state screen, re-run at send:** all 39 verified at person level against the 14 pending states; Texas residents gated on the Form 2703 filing. One email to one Michigan or New York resident is an unregistered offer no wording can cure [11][12].
2. **Number-for-number FDD match on B2 and the Item 19 lines:** $45,000 / $40,000 / $30,000, $15,000 × (units−1) with credit-back, 5.5%, "16 restaurants / full 2025 tables," Houston + Lexington signed agreements — verbatim against the June 25, 2026 FDD, plus Nathan's Item 2 bio facts; the 19-unit line checked against the live locations page (it is deliberately NOT the FDD's 18-unit snapshot). Any drift violates 436.9(a) [13][14].
3. **Comp-claim and channel freshness the week of launch:** First Watch still not selling franchises, Snooze still not franchising [9][10]; 502-807-9403 actually rings Nathan and he answers; Franchising@WildEggs.com and WildEggsFranchising.com live and current — the copy stakes Nathan's credibility on all three.

---

## 6. SOURCE KEY

Numbered claims cited throughout ([n] in the WHY tables and rationale). All 16 were adversarially verified against the primary source on 2026-08-05 (0 refuted).

**[1]** (0.9) Franchise Update Media's 2026 Annual Franchise Development Report found 'good old-fashioned franchise development' resurgent: the number of franchisors using personalized traditional outreach roughly doubled year-over-year, with 50% citing targeted custom direct marketing to candidates as a successful program; referrals (6% of budget) deliver a 30% lead-to-close ratio, outperforming every other channel; and while 59% of brands now use AI for email personalization, 68% say it's 'too soon to tell' if AI drives deals — the presenters' explicit theme was 'people like that personal touch.'
  *Source:* https://www.franchising.com/articles/20251229_data_deals_and_the_human_touch_inside_the_2026_annual_franchise_develop.html (full text read)

**[2]** (0.9) Franchise Update's 2025 Mystery Shop (102 brands, published Jan 2026): only 44% of brands ever CALLED a qualified inbound lead (down from 55% in 2024); of those that called, 56% did so within 8 hours; 60% sent a text follow-up. On direct phone: only 55% of frandev sites even listed a number, only 18% had a person who answered and could handle an inquiry. Meanwhile average cost per lead hit $351 and cost per sale $17,550.
  *Source:* https://www.franchising.com/articles/20260104_mystery_shop_2025report_dives_into_franchise_development_dos_and_donts.html (full text read)

**[3]** (0.9) AFDR 2026 also reports: franchise development websites take just 10% of recruitment spend but close 22% of their leads — the second-best converting channel — because they serve as the candidate's due-diligence hub; and the average journey from first lead to signed agreement has stretched to 24 weeks, with only a 2% overall lead-to-sale rate (12% for qualified leads).
  *Source:* https://www.franchising.com/articles/20251229_data_deals_and_the_human_touch_inside_the_2026_annual_franchise_develop.html (full text read)

**[4]** (0.85) The closest concept comparable, Another Broken Egg Cafe (100+ cafes, PE-backed, daytime-only), runs its recruiting through a dedicated franchise domain (anotherbrokeneggfranchise.com) that publicly names its development people with full credibility bios — Jeff Sturgis, Chief Development Officer (ex-CDO Fazoli's, McAlister's Deli, IFA board) and Chris Eby, Director of Franchise Sales. Eggs Up Grill (eggsupgrillfranchise.com) and Scooter's Coffee (ownascooters.com, named VP of Franchise Sales Matt Sawicki) follow the same pattern: dedicated frandev domain + named development executive + team phone number.
  *Source:* https://www.anotherbrokeneggfranchise.com/get-to-know-us/ (full page read); https://eggsupgrillfranchise.com/; https://www.franchising.com/scooterscoffee/ (via search)

**[5]** (0.9) "AI vocabulary" is empirically measured, not folklore, and it is a specific closed list. Kobak et al. (Science Advances, July 2025) analyzed 15M+ PubMed abstracts and found abrupt post-2022 excess frequency of style words — delve, intricate, meticulously, pivotal, realm, showcasing, underscore — implying at least 13.5% of 2024 abstracts were LLM-processed. Wikipedia's Signs of AI writing (WP:AIVOCAB) maintains the corroborated watch-list, each word backed by at least one study: additionally (sentence-initial), align with, boasts, bolstered, crucial, delve, emphasizing, enduring, enhance, fostering, garner, highlight (verb), interplay, intricate, landscape (abstract noun), meticulous, pivotal, robust, showcase, tapestry, testament, underscore, vibrant. The guide notes these words co-occur ('where there is one, there are likely others') and that the list shifts by model era (delve peaked 2023-24 then dropped; showcasing/highlighting/emphasizing dominate 2025+).
  *Source:* Kobak, González-Márquez, Horvát & Lause, 'Delving into LLM-assisted writing in biomedical publications through excess vocabulary', Science Advances 11(27) 2025, https://www.science.org/doi/10.1126/sciadv.adt3813 (arXiv:2406.07016); word list read directly from Wikipedia:Signs_of_AI_writing wikitext (WP:AIVOCAB section)

**[6]** (0.9) Negative parallelism and the rule of three are named, documented AI tells. Wikipedia's guide (WP:AIPARALLEL, WP:RO3 — read in full) flags 'Not just X, but also Y' / 'It's not just X, it's Y' / 'not X, but Y' constructions and adjective-adjective-adjective or phrase-phrase-phrase triads, citing Russell et al. (ACL 2025) and the NYT's Sam Kriss ('Why Does A.I. Write Like ... That?', Dec 2025). The guide says LLMs use the rule of three 'to make superficial analyses appear more comprehensive' and that negative parallelism reads as pre-empting a misconception the reader never had.
  *Source:* Wikipedia:Signs_of_AI_writing sections 'Negative parallelisms' and 'Rule of three' (raw wikitext fetched and read 2026-08-05), citing Russell/Karpinska/Iyyer ACL 2025 and Kriss, NYT Magazine Dec 3 2025, https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing

**[7]** (0.9) Heavy LLM users detect AI text almost perfectly, and 'humanizer' tricks don't fool them. Russell, Karpinska & Iyyer (ACL 2025, abstract read directly): annotators who frequently use ChatGPT for writing labeled 300 articles; the majority vote of five misclassified only 1 of 300, outperforming most commercial and open-source detectors 'even in the presence of evasion tactics like paraphrasing and humanization.' Their reported cues were exactly the lexical and formulaic-structure tells above.
  *Source:* Russell, Karpinska & Iyyer, 'People who frequently use ChatGPT for writing tasks are accurate and robust detectors of AI-generated text', ACL 2025 Long Papers pp.5342-5373, arXiv:2501.15654 (abstract fetched and read)

**[8]** (0.9) Gmail's enforced deliverability metric is user behavior, not AI-detection: the sender guidelines (primary page fetched) require keeping user-reported spam below 0.10% in Postmaster Tools and never reaching 0.30%, with reputation tracked per sending domain; since June 2024 senders above 0.3% are ineligible for mitigation. Google publishes no rule penalizing 'AI-written' text as such — AI-sounding copy hurts deliverability only via recipients marking spam or not engaging. At this campaign's scale the math is brutal: 39 recipients means a single spam complaint is a 2.6% complaint rate on that traffic, and the franchise emails share the wildeggs.com domain reputation with the existing catering outbound (which already has an 8.6% hard-bounce problem per project records).
  *Source:* Google, 'Email sender guidelines', https://support.google.com/mail/answer/81126 (fetched directly: 'Keep spam rates reported in Postmaster Tools below 0.10% and avoid ever reaching a spam rate of 0.30% or higher'); scale math from client context (39 prospects) and CLAUDE.md project records

**[9]** (0.95) First Watch is still not selling franchises as of today: its own investor FAQ (fetched live 2026-08-05) states 'We are growing through a company-owned model at this time. Franchise opportunities are not available.' Its 10-Q filed 2026-08-04 confirms the buyback pattern — in Q2 2025 it acquired 19 franchise-operated restaurants in two transactions ($6.99M + $49.25M cash) — and shows 586 company-owned vs 79 franchise-owned as of June 28, 2026.
  *Source:* investors.firstwatch.com/shareholder-services/investor-faqs (fetched 2026-08-05) + First Watch 10-Q, SEC EDGAR accession 0001789940-26-000090, filed 2026-08-04 (Business Acquisitions note; restaurant counts)

**[10]** (0.9) Snooze still does not franchise. Its official help-center article 'CAN I OPEN A SNOOZE RESTAURANT OF MY OWN?' (updated September 17, 2025; fetched live 2026-08-05) says: 'Right now, we're keeping our eggs in one basket and aren't franchising our concept.'
  *Source:* snoozeeateryhelp.zendesk.com/hc/en-us/articles/34423477391643 (official Snooze help center, updated 2025-09-17, fetched 2026-08-05)

**[11]** (0.95) Emailing a prospect who resides in a registration state IS an offer 'made in' that state, regardless of where the restaurant would be built. Statute text: Michigan MCL 445.1504(3) — 'An offer to sell is made in this state when the offer either originates from this state or is directed by the offeror to this state and received at the place to which it is directed' — and MCL 445.1503(3) defines 'offer' to include 'solicitation of an offer to buy,' which a franchise-development cold email is. California Corp. Code 31013(b) is verbatim identical on the directed-to test. The trigger is where the email is received, not where the franchise would operate.
  *Source:* Michigan Franchise Investment Law, MCL 445.1503(3) and 445.1504(2)-(3), official PDF from legislature.mi.gov (rendered July 22, 2026); Cal. Corp. Code 31013(b) from leginfo.legislature.ca.gov — both read verbatim

**[12]** (0.92) New York's regulation is explicit for electronic offers: 13 NYCRR 200.13 exempts an unregistered 'Internet Offer' ONLY if it (1) indicates the franchise is not being offered to residents of New York AND (2) 'is not otherwise directed to any person in this State by or on behalf of the franchisor.' A one-to-one cold email addressed to a New York resident is by definition 'directed to' a person in NY and can never satisfy the exemption.
  *Source:* NY Dept. of Law franchise regulations, 13 NYCRR Part 200, sections 200.12-200.13, official PDF ag.ny.gov/sites/default/files/2022-08/part200.pdf (read verbatim)

**[13]** (0.92) A pointer to Item 19 with no figures is not a financial performance representation and carries no mandated hedging language. 16 CFR 436.1(e) defines an FPR as a representation that 'states, expressly or by implication, a specific level or range of actual or potential sales, income, gross profits, or net profits.' The 436.9(c) admonition ('a new franchisee's individual financial results may differ') is required only 'in conjunction with any such financial performance representation' — i.e., only when an actual FPR is made. FTC Compliance Guide examples of implied FPRs: 'earn enough money to buy a new Porsche,' '100% return on investment within the first year.'
  *Source:* 16 CFR 436.1(e) and 436.9(c), read verbatim from eCFR (title 16 as of 2026-08-01); FTC Franchise Rule Compliance Guide (May 2008), pp. 130-131

**[14]** (0.9) Fee and investment figures are affirmatively cleared federally: the FTC Compliance Guide states 'The presentation of cost or expense data alone is not a financial performance representation. Accordingly, the disclosure of fees, required purchases, and expenses reported in Items 5 through 7 ordinarily will not constitute a financial performance claim.' The one trap: 'a presentation of cost data, coupled with additional sales or earnings figures, from which prospective franchisees could readily calculate average net profits, IS a financial performance representation.' Separately, 436.9(a) prohibits any claim contradicting the FDD.
  *Source:* FTC Franchise Rule Compliance Guide (May 2008), p. 131 'Does Cost Information Constitute a Financial Performance Representation?' (ftc.gov PDF, read verbatim); 16 CFR 436.9(a) from eCFR

**[15]** (0.88) Naming the projected Texas opening crosses no federal line — it is an Item 20 unit-count fact (signed agreement, Eggs Gone Wild LLC, Houston), not an FPR, and unit/geography projections are not 'sales, income, gross profits, or net profits' under 436.1(e). Texas has no franchise registration, but the Texas SOS's own FAQ confirms that 'prior to offering for sale or selling, the seller must file an exemption notice (Form 2703) with the Secretary of State' ($25, one-time) to claim the Business Opportunity Act franchise exemption.
  *Source:* 16 CFR 436.1(e) (eCFR, verbatim); Texas SOS 'FAQs for Form Series 2700 — Business Opportunities' Q5-Q6, sos.state.tx.us/statdoc/faqs2700.shtml (fetched 2026-08-05); FDD Item 20/Exhibit D per docs/fdd-facts.md

**[16]** (0.75) Franchise-bar consensus matches the statutory reading: state franchise laws can apply based on any of franchisee domicile, business location, or where the offer is communicated/received, and multiple states' laws can apply to one deal — practitioners specifically flag cold email and digital outreach as activity that triggers registration-state jurisdiction before any 'sales conversation' happens.
  *Source:* Manning Fulton, 'Pro Tips for Franchise Sales Staff and Franchise Brokers: When do state franchise laws apply to an offer or sale?' (manningfulton.com, March 2025; WAF-blocked for full fetch — corroborated via search excerpt and consistent with the MI/CA/NY primary texts above); 13 NYCRR 200.12

**Carried unverified (used at 0.6× stated confidence):**

- (0.51) Jeff Sturgis — who now runs development at Another Broken Egg — wrote in Franchise Update's mystery-shop analysis, after posing as a qualified lead at 81 brands, that franchisors over-rely on automated emails stuffed with links, videos, and virtual brochures instead of personal contact: 'People still buy from people... franchisors are really missing an opportunity to engage people on a personal level earlier in the process.' His recommendation: rapport, questions, and conversation over 'automated processes or administrative steps, especially early in the process.'
  *Source:* https://www.franchising.com/articles/mystery_shoppers_speak_analysis_and_recommendations_from_our_research_team.html (full text read; published Jan 2013)

- (0.48) Harvard Business Review's 'The Short Life of Online Sales Leads' (Oldroyd, McElheran, Elkington, March 2011; audit of 2,241 US firms + 1.25M leads): firms contacting a lead within one hour were nearly 7x more likely to qualify it than those responding even an hour later; 23% of firms never responded at all.
  *Source:* https://hbr.org/2011/03/the-short-life-of-online-sales-leads (verified via HBS faculty page abstract, hbs.edu/faculty/Pages/item.aspx?num=39955; full PDF not read)

- (0.33) HubSpot's email tests found a named individual sender outperforms a generic company-name sender in both opens and clicks (one cited test: +0.53pp open rate, +0.23pp CTR for the personal name), with the hybrid 'FirstName at Company' format recommended when brand recognition matters; multiple practitioner sources repeat this but effects are small and vary by audience — no franchise-specific A/B data exists.
  *Source:* https://blog.hubspot.com/marketing/make-emails-more-clickable-list and HubSpot community threads (via search summaries; original A/B post not read directly)

- (0.51) Composite of the above sources yields the category-credible FDM signature block: named person + exact FDD Item 2 title, direct phone presented as personally answered, the dedicated franchising domain as sole link, and the brand alias as secondary channel of record — e.g. 'Nathan Haffke / Franchise Development Manager, Wild Eggs / 502-807-9403 (direct) / Franchising@WildEggs.com / WildEggsFranchising.com'. Nathan's status as a named franchise seller on the FDD receipts page (with CEO Clifford Harris) means the prospect will later see his exact name and title in the legal document — a verification loop none of the mystery-shopped generic-alias brands offer.
  *Source:* /home/user/cb-wraps-audit-2026/wildeggs-franchise/docs/fdd-facts.md (Item 2, receipts) + anotherbrokeneggfranchise.com leadership pattern + Mystery Shop 2025 phone findings

- (0.51) Em-dash overuse is a real but conditional tell. The guide (WP:AIDASH) says LLM output uses em dashes more than nonprofessional human text of the same genre, in places humans would use commas/parentheses/colons, 'in a formulaic, pat way, often mimicking punched-up sales-like writing by over-emphasizing clauses or parallelisms' — and that AI em dashes are usually space-surrounded. It cites the Washington Post's quantitative style analysis (Nov 13 2025) and notes the tell is 'most useful when taken in combination with other indicators, not by itself.' The tell is now so culturally established that OpenAI shipped em-dash suppression in GPT-5.1 and Altman publicly celebrated it (Ars Technica, Nov 14 2025).
  *Source:* Wikipedia:Signs_of_AI_writing 'Overuse of em dashes' (read directly), citing Merrill/Chen/Kumer, Washington Post Nov 13 2025 and Edwards, Ars Technica Nov 14 2025

- (0.51) LLMs measurably lack human stylistic variation, and the 'signs of human writing' are concrete. Reinhart et al. (PNAS 2025, abstract read directly) applied Biber's lexical/grammatical/rhetorical feature set to parallel human/LLM corpora and found systematic differences that grow with instruction tuning: 'LLMs struggle to match human stylistic variation.' Wikipedia's guide operationalizes the inverse — empirically observed markers of human writing: simple is/has phrases (LLMs replace 'is' with 'serves as/stands as/boasts/features', a documented >10% drop in is/are usage in post-2023 academic text per Geng & Trotta); plain verbs (used not utilized, tried not attempted); superlative or definitive statements ('the only', 'the first'); hedging qualifiers and intensifiers ('very', 'perhaps', 'tends to'); and wordy constructions ('in order to', 'the fact that').
  *Source:* Reinhart, Markey, Laudenbach & Brown, 'Do LLMs write like humans? Variation in grammatical and rhetorical styles', PNAS 122 (2025) e2422455122, arXiv:2410.16107 (abstract read); Wikipedia:Signs_of_AI_writing 'Syntax'/'Avoidance of basic copulatives'/'Ineffective indicators' sections (read directly), citing Geng & Trotta arXiv:2404.08627

- (0.48) The penalty for AI-sounding text is a trust penalty triggered by PERCEPTION, and perception runs on controllable cues. Jakesch, Hancock & Naaman (PNAS 2023, N=4,600): people could not reliably distinguish AI from human self-presentations but applied consistent, flawed heuristics — first-person voice, contractions, spontaneous/personal topics read as human. Jakesch et al. (CHI 2019, the 'Replicant Effect'): in a MIXED set of human- and AI-written Airbnb profiles, profiles perceived as AI-written were rated significantly less trustworthy; the penalty vanished only when everything was uniformly AI. A 2026 cold inbox is the mixed condition exactly.
  *Source:* Jakesch, Hancock & Naaman, 'Human heuristics for AI-generated language are flawed', PNAS 120(11) 2023, https://www.pnas.org/doi/10.1073/pnas.2208839120; Jakesch et al., 'AI-Mediated Communication: How the Perception that Profile Text was Written by AI Affects Trustworthiness', CHI 2019, https://dl.acm.org/doi/10.1145/3290605.3300469 (findings verified via publisher/Stanford SML summaries, papers paywalled)

- (0.42) Large-sample outbound data supports short, low-reading-level, best-practice-scored emails — but the viral 'AI emails get N% fewer replies' statistics are not trustworthy. Lavender's Cold Email Benchmark Report (page fetched and read, updated Mar 2026): sample of 231,818 recent cold emails across ~50k inboxes, drawn from billions analyzed; emails scoring 90+ on their best-practice coach (short, grade-3-5 reading level, single ask) show measurable reply-rate lift over segment averages (secondary summaries report roughly 3.4%->4.3%, a ~27% lift). By contrast, every 'AI vs human reply rate' number I could find (1-2pp gaps, '2x spam flagging') traces only to SEO content farms with no methodology — I could not locate a single controlled study directly measuring reply-rate harm from AI-sounding B2B email.
  *Source:* Lavender, 'Updated: The Cold Email Benchmark Report' (Will Allred, Mar 30 2026), https://lavender.ai/blog/the-cold-email-benchmark-report (methodology read directly via fetch; per-segment table is JS-loaded); AI-vs-human figures from firstsales.io/phrasly.ai/reachoutly assessed and rejected as unsourced
