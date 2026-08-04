# Final Report — Nutrition Calculator AEO/SEO Rebuild

**Crazy Bowls & Wraps · crazybowlsandwraps.com · 27–28 July 2026**
Prepared by Claude for Wild Eggs Marketing.

Every claim below carries its source and a confidence score. Confidence reflects
how the claim was verified: **1.0** = read back from the live system byte-for-byte;
**0.9** = verified against primary data with an independent check; **0.7–0.8** =
verified against one source; **≤0.6** = judgment or inference, labelled as such.

---

## 1. What you need to do now (2 actions)

| # | Action | Why | Confidence it's needed |
|---|---|---|---|
| 1 | **Publish Framer once more** | Your 28 Jul publish shipped build **07**. Build **09** landed in the project after it — verified by md5 read-back (`9f983a65…`, 119,715 bytes). The live site is missing the "What this covers" nutrition-caveat box, the screen-reader allergen fix, and order-click tracking. | 1.0 |
| 2 | **Repaste the head JSON-LD** (`head-jsonld-snippet.txt` in the package) and publish | The `Menu` node declared `www.` but all 126 crawled URLs and 98 canonicals are non-www with no host redirect observed. One-string fix; the other 25KB is identical to what you pasted. | 0.95 (crawl predates migration; confirm live canonical host if unsure) |

Then verify: page footer reads **`build 2026-07-28-09 · 70 items loaded`**, Salads
shows 3 cards, and any salad's detail shows the "What this covers" box. Full
checklist in `DEPLOY-STEPS.md`.

---

## 2. What was accomplished, with sources

### Safety corrections (all were live customer-facing errors)

| Fix | Source | Confidence |
|---|---|---|
| Chicken dishes no longer listed as Vegan. Vegan/vegetarian now requires explicit data; conditional items carry "order without chicken" on every surface. | FDA/INM export: every composed bowl measured with Grilled Chicken; `Contains Meat` column 100% empty. Per-item reasoning in `data/v5-tagging-report.tsv`. | 0.9 — rule-derived; awaiting kitchen sign-off |
| 10 flour-tortilla items removed from Gluten-Free (wheat added from tortilla). | Export rows are filling-only; tortilla is a separate `Tortillas` modifier group, all wheat-flagged. | 0.95 |
| Items with no allergen data now **fail closed** — excluded from allergen filters, labelled "not confirmed, ask staff". | 21 items have no lab row (export, `dataConfidence` field). | 1.0 (verified in worker v7) |
| CMS allergen fields were missing Wheat on 11 items (the v4 fix never reached the CMS). Corrected and verified: zero wheat items carry a gluten-free tag or reference, checked twice by read-back. | Live CMS read vs `worker_v7.js`; hard assertion in `data/build_cms_tags.cjs` and `build_diet_refs.cjs`. | 1.0 |
| "Gluten-free" wording is "made without gluten-containing ingredients" everywhere; no certified claim. **No gluten-free tortilla is claimed anywhere** — confirmed by you, consistent in FAQ, QuickAnswers, tag copy, and the worker (the `Active=0` GF-tortilla row is withheld from the feed). | 21 CFR 101.91; your confirmation 28 Jul; grep across all surfaces. | 1.0 |
| Gluten proxied from Wheat flag — tested, not assumed: all 89 ingredient statements scanned for barley/rye/malt/oats/spelt/farro/semolina/durum; only 4 mention malt, all already Wheat=Y. | `data/fda-full-2026-07-28.json`. | 0.9 (holds for current menu; breaks if a barley/rye item is added) |

### Data & infrastructure

| Item | State | Confidence |
|---|---|---|
| **Worker v7 deployed**: 70 items (3 salads restored) + 192 modifier rows with per-portion nutrition and allergens. | Deployed by you; smoke-tested by executing `fetch()` locally (200s, 70 items, complete tag sets). I cannot reach the live URL — network policy. | 0.9 |
| **Salads restored** from the FDA export, reconciled against your in-store menu board photo (names, prices, avocado, "served with warm tortilla or chips"). Three sources agreed on which three are live. | Export `Active` flags + June crawl URLs + board photo. | 0.95 |
| **CMS Dietary Tags**: 7-item collection with slugs (`gluten-free` … `glp-1-friendly`), each with page copy including the vegan caveat; 58 Menu items linked via Multi-Reference. All seven counts match the calculator's filters exactly; verified by my own read-back, not the apply-agent's report. | Live CMS read 28 Jul. | 1.0 |
| **JSON-LD**: Menu with 47 verified MenuItems + suitableForDiet + 7-question FAQPage. Conditional vegan items deliberately excluded from `suitableForDiet` (schema can't carry a condition); covered in FAQ prose instead. Validate at **validator.schema.org** — Google's Rich Results Test will say "no items detected" because `Menu` isn't a rich-result type; that is expected, not a failure. | `framer/head-jsonld-snippet.txt`, rebuilt from worker v7. | 1.0 for content; 0.85 that the exclusion is the right call |
| **Calculator build 09**: nutrition caveats ("What this covers"), URL-synced diet filters, allergen chips + fail-closed display, order-CTA tracking fix, screen-reader allergen fix. | Framer read-back md5 match. | 1.0 (in project; live pending your publish) |

### Known divergence (deliberate, one line to close)

The calculator's **Low Carb** filter lists Lettuce Wraps on its carb *floor*
(range 8–22g); the CMS tag excludes it. The CMS is right — a range's best case
isn't a claim. Fix is `!i.variable` in one predicate, batched for the next
component push. Confidence this is the right ordering: 0.8.

---

## 3. Advisory panel findings (3 of 5 reports in)

Data-integrity and unused-assets advisors were still running at time of writing;
their findings will follow separately. From the three complete reports:

**Acted on already** (confidence 1.0 — fixes verified):
- JSON-LD host www→non-www (technical SEO advisor; verified against 126 crawled URLs)
- Order Now CTA was untracked and un-UTM'd — main conversion path invisible in GA4 (UX advisor; fixed in build 09)
- Card `aria-label` suppressed the allergen line for screen readers — safety info unreachable non-visually (UX advisor; fixed in build 09)

**Accepted, reversing my earlier advice** (confidence 0.85 — advisor reasoning verified against crawl data):
- **Serve the calculator at `/nutrition-information/`** (3,490 sessions of history) instead of 301-ing it away; redirect `/nutrition-calculator` → it.
- **Keep `/allergen-menu/` as its own route** — 94% engagement, 0.06% bounce, the strongest behavioural signal in the dataset. Rebuild as a server-rendered Big-9 table.
- **Diet pages at `/menu/{diet}`**, not under the calculator — the lost queries were menu queries and `/menu` is the strongest hub (20,660 sessions, 73 outbound links).

**Top gaps, in priority order** (confidence 0.7–0.85, source: crawl data + schema inspection):
1. **Redirect map is ~1/8 built** — ~103 legacy URLs, not 13; ten have prices in slugs (459 sessions on four of them) and need explicit entries.
2. **No entity in the schema** — `Menu` has no `Organization`/`Restaurant`, no address, no `sameAs`. Answer engines have facts they can't attach to a business. The June audit's `fixes/schema/locations.json` still has 19 unfilled placeholders while the Locations CMS holds every value.
3. **Tofu and Plant Based Chicken appear in zero crawlable surfaces** despite being active menu proteins — the FAQ still says only "order without chicken." Understates the vegan menu; also part-answers your own Open Question 2.
4. **Schema-without-content risk**: 47 MenuItems in the head, zero matching text in served HTML (data is client-fetched; QuickAnswers may still sit below the CTA). Proof: GSC Live Test → crawled HTML → search "Jerk Bowl".
5. **48 orphaned pages** — the Multi-Reference now makes a tag↔item link mesh nearly free.

**Downgraded by the panel** (agreed): `?diet=` URL params as SEO (no crawlable href exists — analytics/sharing only), Request Indexing as a lever, GLP-1 as a standalone page bet before the four proven diets.

---

## 4. Open questions still requiring CBW

1. **Santa Fe avocado** — on the board, not in the lab analysis; 260 cal published as a floor. *(affects a published number)*
2. **Do the tortilla chips really contain wheat?** Export says yes; unusual for corn chips. Gluten-free coverage on several items hinges on it. *(affects published claims)*
3. Caesar Salad — in catering copy, absent from board and export.
4. Fruit & Feta — discontinued per export, still a Box Lunch option.
5. Kitchen sign-off on the 37-item vegan/vegetarian derivation (`data/v5-tagging-report.tsv`).
6. Gluten cross-contact protocol (blocks ever using the regulated term).

---

## 5. The package

| File | What it is |
|---|---|
| `head-jsonld-snippet.txt` | **Paste this** — Page Settings → SEO → Custom Code → end of `<head>` |
| `DEPLOY-STEPS.md` | The two actions + full verification checklist |
| `worker_v7.js` | Already deployed — kept as your record of what's live |
| `FINAL-REPORT.md` | This document |
| `REMAINING.md` | Prioritised backlog incl. panel findings |
| `OPEN-QUESTIONS-FOR-CBW.md` | The six client questions |
| `CHANGELOG-2026-07-27.md` | Client-facing record of the safety corrections |
| `v5-tagging-report.tsv` | Per-item vegan/vegetarian reasoning for kitchen sign-off |
| `cbw-reconciliation-ledger.xlsx` | Title-by-title reconciliation vs the FDA export |
| `data/` scripts | Every number above is reproducible: `smoke-test-worker.mjs`, `verify-filter-counts.cjs`, and the builders |

*Limitations: I cannot reach crazybowlsandwraps.com from this environment, so all
"live" claims rest on Framer/Worker read-backs and your observations, not on
fetching the page. The June crawl predates the migration; traffic figures are
GA4 sessions from that snapshot.*
