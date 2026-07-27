# Nutrition Calculator — AEO/SEO rebuild (July 2026)

Working artifacts for the crazybowlsandwraps.com nutrition calculator rebuild.

## Read these first

| File | What it is |
|---|---|
| [`CHANGELOG-2026-07-27.md`](CHANGELOG-2026-07-27.md) | Dated record of every change, including three live inaccuracies corrected. **Client-facing.** |
| [`VERIFY-BEFORE-PUBLISH.md`](VERIFY-BEFORE-PUBLISH.md) | Six pass/fail checks to run on staging before publishing production. |
| [`OPEN-QUESTIONS-FOR-CBW.md`](OPEN-QUESTIONS-FOR-CBW.md) | Seven questions blocking further accuracy work. |

## Artifacts

```
framer/
  NutritionCalculator.tsx        Framer codeFileId l6mWaxo — the live calculator (build 2026-07-27-05)
  NutritionCalculatorSchema.tsx  codeFileId c0IsEMT — source of truth for the JSON-LD payload
  NutritionQuickAnswers.tsx      codeFileId rUEqPb4 — SSR-safe crawlable answer text
  head-jsonld-snippet.txt        Paste into Page Settings → SEO → Custom Code → end of <head>
worker/
  worker_v4_final.js             Cloudflare Worker, 76 items, v4 schema
data/
  cbw-reconciliation-ledger.xlsx Title-by-title reconciliation vs the official FDA export
  verify-filter-counts.cjs       Recomputes every expected filter count from the Worker data
```

## Reproducing the expected filter counts

```sh
cd nutrition-calculator/data
node verify-filter-counts.cjs   # expects ../worker/worker_v4_final.js
```

The script reimplements the component's `DIETARY_TAGS` predicates and its
Wrap/Bowl card-merging, so its output is directly comparable to what the page
shows. If the page and the script disagree, the page is running stale code.

## Two things that will waste your time if you don't know them

1. **JSON-LD cannot live in a code component.** Framer's publish pipeline strips
   `<script>` tags from components. It must go in Page Settings → SEO → Custom
   Code → end of `<head>`.
2. **Validate schema at validator.schema.org, not Google's Rich Results Test.**
   The RRT only checks types eligible for rich results. `Menu` is not one, and
   `FAQPage` rich results were restricted in August 2023 to authoritative
   government and health sites. "No items detected" in the RRT is the expected
   output here, not a failure.

## Still to do

- Move `NutritionQuickAnswers` above the calculator (currently below the CTA
  section; needs a manual drag in Framer's layer panel — the API reorder failed)
- Page `<title>` and meta description
- 301 redirects for the five dead WordPress diet URLs
- Phase 3: allergen-exclusion filters, wiring in the 224 unused modifier records
- Phase 4: vegan derivation once the client signs off (Open Question 2)
- Phase 5: rebuild the JSON-LD from Worker data rather than a hand-maintained list
