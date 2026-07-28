# Exact steps — build `2026-07-27-07`

Five steps. Do them in this order. Step 3 is the only place you can tell whether
it worked, so don't skip it.

---

## Step 1 — Deploy the Cloudflare Worker

1. Cloudflare dashboard → Workers & Pages → your nutrition worker → **Edit code**
2. Select all, delete, paste the contents of **`worker/worker_v5.js`**
3. **Save and deploy**
4. Open the worker URL in a browser. You should get JSON starting `[{"id":`.
   If you get a `ReferenceError` page, you have the first build of v5 — get the
   current file and repaste.

What changed: 76 items → **67**. Ten records that were not in your Framer Menu CMS
are gone (nine `<Flavour> Lettuce Wrap` entries and `Bag of Chips`), replaced by
the single **Lettuce Wraps** item your CMS actually has. Thirty-seven items now
carry vegan/vegetarian tags, nineteen of them with a chicken caveat.

> **Repaste note.** If you already deployed a v5 earlier today, deploy this one
> again — the file changed after you confirmed that anything can be ordered
> without chicken, which added BBQ Quesadilla as vegetarian.

## Step 2 — Publish Framer

The calculator component is already updated (build `2026-07-27-07`). Just hit
**Publish**.

## Step 3 — Verify, before you touch anything else

Open `https://www.crazybowlsandwraps.com/nutrition-calculator`.

**3a.** Bottom of the page, under the disclaimer, must read:

```
build 2026-07-27-07 · 67 items loaded
```

If it says `06` or earlier, or `76 items`, one of the first two steps didn't land. Stop and
redo it. Everything below is meaningless until this line is right.

**3b.** Filter pill counts:

| Filter | Cards |
|---|---|
| No filter | **57** |
| Vegan | **14** |
| Vegetarian | **30** |
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

**3f.** Dietary filters now appear in the URL. Click **GLP-1 Friendly**, then
**Gluten-Free**. The address bar should read:

```
?diet=glp-1-friendly,gluten-free
```

Slugs are sorted alphabetically, so clicking the two pills in the other order
gives the same URL — identical views must not produce different URLs. Copy that
URL into a new tab: both pills should come back up selected. Clear the pills and
`?diet=` should disappear entirely rather than linger as an empty parameter.

## Step 4 — Replace the page's JSON-LD

Framer → the nutrition-calculator page → Page Settings → **SEO** → Custom Code →
**End of `<head>`**. Delete the existing snippet, paste
**`framer/head-jsonld-snippet.txt`**, publish again.

That file is one long line — 20 KB minified. Crawlers don't care about whitespace,
and it's ~25% smaller than the indented form, which matters if Framer's custom-code
box has a size ceiling. `head-jsonld-snippet-readable.txt` is the same payload
indented, for reading and diffing only. Don't paste that one.

It now has 44 menu items (up from 28) and the vegan, dairy-free and
"can I make it vegan" answers are regenerated from the same data the filters use,
so the two can't drift.

**Confirm it actually replaced the old one.** View source on the published page
(Ctrl/Cmd-U) and search for:

```
Any item on our menu can also be ordered without the grilled chicken
```

That sentence exists only in the new payload. If it isn't there, you're still
serving the old snippet — the paste didn't save, or the publish didn't include it.
A second check: search `"MenuItem"` and count. New is **44**, old was 28.

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
3. Still outstanding, and worth more than anything above: the **URL question** —
   `/nutrition-information/` carried 3,490 GA4 sessions before the migration and
   the calculator now lives at a different path. See item 3 of `REMAINING.md`.

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

See `REMAINING.md` for the full list in priority order. The one that still needs a
person rather than a deploy: the vegan/vegetarian tagging on 37 items is derived
from ingredient statements by rule, not confirmed by your kitchen. The reasoning
for every item is in `data/v5-tagging-report.tsv` — have someone sign it off.
