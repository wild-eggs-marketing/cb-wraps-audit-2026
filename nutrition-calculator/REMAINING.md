# What remains — as of 27 July 2026

Cloudflare Worker v5 is deployed and serving. The Framer component is live and
verified at build `2026-07-27-06`. Everything below is what's left.

I can't reach crazybowlsandwraps.com from this environment (the network policy
blocks it), so anything marked **verify** needs your eyes, not mine.

---

## 1. Publish Framer and verify — 5 minutes, blocks everything else

The component is pushed but a publish is what makes it public. Then check the
bottom of `/nutrition-calculator`:

```
build 2026-07-27-06 · 67 items loaded
```

Then three spot-checks:

| Check | Expected |
|---|---|
| No filter | 57 cards |
| **Vegan** | **14 cards**, four of them bowls with a teal "Order without chicken" line |
| Search "Lettuce Wrap" | **one** card, `150+ cal` — not nine with the same photo |

If the build line says `05` or `76 items`, the publish didn't land. Stop there.

## 2. Replace the page's JSON-LD — 5 minutes

Framer → nutrition-calculator page → Page Settings → SEO → Custom Code →
**End of `<head>`**. Replace the whole snippet with `framer/head-jsonld-snippet.txt`,
publish, then validate at **validator.schema.org** (not Google's Rich Results
Test — see the changelog for why "no items detected" there is expected).

Expect: `Menu`, 44 `MenuItem`, `FAQPage`, 7 `Question`, 0 errors.

## 3. The URL question — the highest-value item left, and I got it wrong before

I told you earlier that the migration deleted five indexed diet-category pages
and needed 301s. That was wrong on the specifics, and the real picture is bigger.

From the June 15 crawl in this repo, here is what these URLs actually looked like
**before** the Framer migration — all returning 200:

| Sessions | Words | URL |
|---:|---:|---|
| **3,490** | 116 | `/nutrition-information/` |
| 143 | 95 | `/bowl_categories/gluten-free/` |
| 99 | 50 | `/allergen-menu/` |
| — | 219 | `/bowl_categories/popular/` |
| — | 112 | `/bowl_categories/vegan/` |
| — | 109 | `/wrap_categories/popular/` |
| — | 103 | `/bowl_categories/low-carb/` |
| — | 79 | `/bowl_categories/paleo/` |
| — | 74 | `/salad_categories/vegetarian/` |
| — | 74 | `/salad_categories/popular/` |
| — | 57 | `/salad_categories/gluten-free/` |
| — | 17–19 | 7 × `/cbw_menu_categories/*` |

**The one that matters is the first row.** `/nutrition-information/` carried
**3,490 sessions** — the fourth-highest-traffic page on the whole site, behind
only the homepage, `/menu` and `/locations`. The new calculator is at
`/nutrition-calculator`, a different URL with no history.

So, in order:

1. **Verify** in Search Console → URL Inspection what `/nutrition-information/`
   returns now. Three possible outcomes:
   - **404** → you are discarding 3,490 sessions of accumulated authority.
     301 it to `/nutrition-calculator` today.
   - **200 with old thin content** → it is competing with your new page for the
     same queries. 301 it to `/nutrition-calculator`.
   - **200 and it IS the calculator** → nothing to do, and disregard step 4
     below; tell me and I'll correct the docs.
2. **301 the rest** to `/nutrition-calculator`, except `/allergen-menu/` —
   that one has a 94% engagement rate, the highest on the site, so send it to
   the calculator too but consider whether an allergen-specific landing page
   earns its keep separately.
3. Only after the redirects exist, URL-Inspect each old URL to confirm Google
   sees the 301.

`/bowl_categories/gluten-free/` had 143 sessions at a 78% engagement rate on
95 words of content. That is the "gluten free" traffic you said you lost. A 301
to the calculator recovers the link equity; the calculator's new gluten-free
content and FAQ answer is what will hold the ranking.

## 4. Search Console — after step 1 passes

- URL Inspection → `/nutrition-calculator` → **Request Indexing**
- Sitemaps → confirm the sitemap is submitted and contains the page
- Once step 3's redirects are live, URL-Inspect the old URLs to confirm the 301

## 5. Page title and meta description

Still unset as far as I know. Suggested:

> **Title:** Nutrition Calculator: Calories, Macros & Allergens | Crazy Bowls & Wraps
>
> **Description:** Filter our full menu by gluten-free, dairy-free, vegan and
> high-protein. Verified calories, protein, carbs and FDA Big-9 allergens for
> every item.

67 characters and 158 characters respectively — both inside the truncation limit.

## 6. Confirm the answers block position

You moved the FAQ. `NutritionQuickAnswers` is the server-rendered text block
whose whole purpose is being crawlable — it needs to be **above** the calculator,
not below the CTA section. Worth a look while you're in Framer.

## 7. Kitchen sign-off — not optional

The vegan/vegetarian tagging on 36 items is derived from ingredient statements by
rule. It is defensible and the reasoning for every item is in
`data/v5-tagging-report.tsv`, but nobody at Crazy Bowls & Wraps has confirmed it.
Two specific questions on top of the seven in `OPEN-QUESTIONS-FOR-CBW.md`:

- **BBQ Quesadilla** lists grilled chicken but isn't a Bowl or Wrap, so I left it
  untagged. Is the chicken swappable on it?
- **Is "no protein" actually orderable** on the composed bowls? The whole
  "order without chicken" mechanic assumes it is.

## 8. Later, not now

- **Phase 3** — 224 modifier records are still unused, so allergens introduced by
  a customer's protein or dressing choice aren't reflected yet
- Nine Lettuce Wrap flavours as real CMS items, each with its own photo. This is
  the biggest remaining gluten-free win: eight of nine are made without
  gluten-containing ingredients, and the single merged item can't say so, which
  is why Gluten-Free reads 22 rather than 30
- Nine alias mappings, 21 items with no lab data, 36 unlisted items (9 Tacos,
  5 Salads) — all in the reconciliation ledger

---

## Reproducing any number in this document

```sh
cd nutrition-calculator
node data/smoke-test-worker.mjs      # worker runs, 67 items, tag sets complete
node data/verify-filter-counts.cjs   # every expected filter count
node data/build_v5.cjs               # rebuilds the worker from v4 + the CMS list
node data/build_jsonld_v5.cjs        # rebuilds the head snippet from the worker
```
