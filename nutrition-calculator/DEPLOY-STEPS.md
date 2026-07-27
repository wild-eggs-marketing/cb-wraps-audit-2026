# Exact steps — build `2026-07-27-06`

Five steps. Do them in this order. Step 3 is the only place you can tell whether
it worked, so don't skip it.

---

## Step 1 — Deploy the Cloudflare Worker

1. Cloudflare dashboard → Workers & Pages → your nutrition worker → **Edit code**
2. Select all, delete, paste the contents of **`worker/worker_v5.js`**
3. **Save and deploy**

What changed: 76 items → **67**. Ten records that were not in your Framer Menu CMS
are gone (nine `<Flavour> Lettuce Wrap` entries and `Bag of Chips`), replaced by
the single **Lettuce Wraps** item your CMS actually has. Thirty-six items now
carry vegan/vegetarian tags, eighteen of them with a chicken caveat.

## Step 2 — Publish Framer

The calculator component is already updated (build `2026-07-27-06`). Just hit
**Publish**.

## Step 3 — Verify, before you touch anything else

Open `https://www.crazybowlsandwraps.com/nutrition-calculator`.

**3a.** Bottom of the page, under the disclaimer, must read:

```
build 2026-07-27-06 · 67 items loaded
```

If it says `05`, or `76 items`, one of the first two steps didn't land. Stop and
redo it. Everything below is meaningless until this line is right.

**3b.** Filter pill counts:

| Filter | Cards |
|---|---|
| No filter | **57** |
| Vegan | **14** |
| Vegetarian | **29** |
| Gluten-Free | **22** |
| Dairy-Free | **22** |
| High Protein | 23 |
| Low Carb | 11 |
| GLP-1 Friendly | 20 |

**3c.** Click **Vegan**. You should see 14 cards including **Stir Fry Bowl**,
**Sweet & Sour Bowl**, **Teriyaki Bowl** and **High-Protein Bowl** — and each of
those four must show a teal **"Order without chicken"** line on the card. If a
bowl appears with no such line, stop and tell me.

**3d.** Open **Stir Fry Bowl**. Above the description there must be a boxed note:

> Vegan/vegetarian only when ordered without the default grilled chicken. The
> nutrition shown is measured with chicken.

**3e.** Search for **Lettuce Wrap**. You should get **one** card called
**Lettuce Wraps**, reading `150+ cal`, not nine cards with the same photo.

## Step 4 — Replace the page's JSON-LD

Framer → the nutrition-calculator page → Page Settings → **SEO** → Custom Code →
**End of `<head>`**. Delete the existing snippet, paste
**`framer/head-jsonld-snippet.txt`**, publish again.

It now has 44 menu items (up from 28) and the vegan, dairy-free and
"can I make it vegan" answers are regenerated from the same data the filters use,
so the two can't drift.

Validate at **validator.schema.org** — paste the page URL. Expect `Menu`,
44 `MenuItem`, `FAQPage`, 7 `Question`, 0 errors.

Do **not** use Google's Rich Results Test. `Menu` isn't a rich-result type and
`FAQPage` rich results have been restricted to government and health sites since
August 2023, so it reports "no items detected" no matter how correct the markup
is. That is not a failure.

## Step 5 — Search Console

Once step 3 passes:

1. URL Inspection → `https://www.crazybowlsandwraps.com/nutrition-calculator` →
   **Request Indexing**
2. Sitemaps → confirm the sitemap is submitted and the page is in it
3. Still outstanding, and worth more than anything above: the **301 redirects**
   for the five dead WordPress diet URLs. Until those exist, the links and
   history that used to rank still point at 404s. Redirect map is in
   `reports/` from the original audit.

---

## The images

All nine Lettuce Wrap cards showed the same photo because I created those nine
records myself, from the FDA export, and there is only one Lettuce Wraps photo in
your CMS — so all nine pointed at it. Step 1 removes them, and the one item that
remains is the one that photo belongs to. Nothing else on the menu shares a
thumbnail except `Kid's Chicken Wrap` and `Kids Chicken Teriyaki Wrap`, which
share one in your CMS already.

## What I'd reconsider

Collapsing the nine flavours back to one item costs real search coverage. Each
flavour has its own verified FDA nutrition and its own allergen list, and eight of
the nine are made without gluten-containing ingredients while Teriyaki is not —
the single merged item can't express that, so it now carries the union of all nine
allergen lists and drops out of the Gluten-Free filter entirely. That is why
Gluten-Free fell from 30 cards to 22.

If you want that coverage back, the fix is to add the nine as real CMS items
rather than to reintroduce them in the Worker only. Twenty minutes of CMS entry,
and they'd each need their own photo to avoid the problem you just spotted. Your
call — the current state is accurate either way.

## Still open

- `NutritionQuickAnswers` position — you moved the FAQ; confirm the answers block
  sits above the calculator, not below the CTA
- Page `<title>` and meta description
- The five 301 redirects
- The seven questions in `OPEN-QUESTIONS-FOR-CBW.md`. Two are now more urgent:
  **BBQ Quesadilla** has grilled chicken as an ingredient but isn't a Bowl or
  Wrap, so I left it untagged — is chicken swappable on it? And the whole
  vegan/vegetarian tagging in step 1 is derived from ingredient statements by
  rule, not confirmed by your kitchen. The reasoning for every item is in
  `data/v5-tagging-report.tsv`. Have someone sign it off.
