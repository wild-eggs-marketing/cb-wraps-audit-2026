# Nutrition Calculator — Change Record

**Date:** 27 July 2026
**Build stamp:** `2026-07-27-05` (rendered on-page under the disclaimer)
**Scope:** crazybowlsandwraps.com/nutrition-calculator (Framer code component `NutritionCalculator.tsx`), the Cloudflare nutrition Worker, and the page's JSON-LD.
**Source of truth for nutrition/allergens:** the client's official FDA Rounded Export for INM (`FDA_Rounded_Export_for_INM_Crazy_Bowls__Wraps_07272026130429.xlsx`) and modifier export (`modifiers_crazy_bowls__wraps_07272026130418.xlsx`), both dated 27 July 2026.

This document exists because three of the changes below correct **inaccurate dietary claims that were live on the public site**. It is written so a non-technical reader can follow what was wrong, what it now says, and why.

---

## Part 1 — Corrections to live inaccuracies

All three were pre-existing. None were introduced by this project.

### 1.1 Chicken dishes were labelled "Vegan" and "Vegetarian"

**What was wrong.** The filter decided whether an item was vegan by scanning its
ingredient text for meat words. The official export shows every composed bowl and
wrap is **measured as served with Grilled Chicken by default**, but the ingredient
text on the site never names that default protein — it says "your choice of grain
and protein." So the scan found no meat words and returned *true*. Selecting
**Vegan** returned Stir Fry Bowl, Sweet & Sour Bowl, Teriyaki Bowl and others: all
chicken dishes.

**Why the scan could not be repaired.** Meat is not one of the FDA Big-9
allergens, so there is no allergen column that would catch it. The export's
`Contains Meat` and `Contains Animal Products` columns are 100% empty. There is
**no signal in this data that can prove an item is meat-free.**

**What it does now.** Vegan and Vegetarian require an explicit, human-verified tag
in the CMS / Worker feed. An untagged item is treated as **not** vegan. Seven items
are tagged vegan and eight vegetarian — all ingredient-screened, single-component
sides (the three edamame, Carrots, Broccoli with Olive Oil & Herb, Mixed Veggies,
Banana; plus GF Quinoa Falafel as vegetarian-only).

**Trade-off, stated plainly.** The Vegan filter now returns 7 results instead of a
larger, wrong number. Sparse-but-true beats full-but-wrong when a vegetarian guest
is deciding what to eat. Widening it correctly requires the client to sign off
per-item (see Open Questions, item 2).

### 1.2 Ten wheat-tortilla items passed the Gluten-Free filter

**What was wrong.** In the FDA export, the row for a wrap covers the **filling
only** — the tortilla is a separate line item — so `Contains Wheat` reads N. The
tortilla is named only in the item's marketing `description`, which the gluten
check did not read. Result: 8 of 10 flour-tortilla wraps, plus the Breakfast Wrap
and the Healthy Burrito, appeared under **Gluten-Free**.

**What it does now.** Those 10 items carry an explicit Wheat allergen flag plus a
`wheatFromTortilla: true` provenance marker in the Worker data, so they are
excluded. The Gluten-Free filter now returns the 8 **Lettuce** Wraps and no
flour-tortilla item. Teriyaki Lettuce Wrap is correctly still excluded (its
teriyaki sauce contains wheat).

### 1.3 Items with no allergen data defaulted to "safe"

**What was wrong.** An item with a blank allergen field passed every
allergen-based filter, because "no allergens listed" was read as "contains no
allergens." Twenty-one items have no verified lab data; three (BBQ Bowl, Buffalo
Bowl, Caesar Bowl) may not exist on the current menu at all.

**What it does now.** The logic **fails closed**. A `hasAllergenData()` guard means
an item with a blank or `unconfirmed` allergen field is excluded from Gluten-Free
and Dairy-Free rather than included, and its detail panel says *"Allergen
information isn't confirmed for this item yet — please ask our staff before
ordering."*

---

## Part 2 — Accuracy and clarity fixes

### 2.1 Protein-density badge read as a calorie count

The badge rendered `8g protein / 100 cal`. A reader took the slash to mean "and",
i.e. that a Poke Bowl was 100 calories. It is 410. The badge now reads
**`8g protein per 100 cal`**.

### 2.2 Small bowls used a guessed 0.67 ratio

Small-bowl macros were previously estimated as two-thirds of the regular bowl. Nine
bowls now carry their **measured** small-size values from the export (Fajita, Jerk,
Mediterranean, Pesto, Power, Stir Fry, Sweet & Sour, Teriyaki, Thai). Bowls without
a measured small size no longer offer a portion toggle rather than showing a
fabricated number.

### 2.3 Allergen information is now displayed

Previously the allergen data was used for filtering but never shown. Each item
detail now shows the FDA Big-9 as colour-coded chips, a `Contains …` line, the
"not confirmed" state where applicable, and a note on where the data came from.

### 2.4 Data provenance is modelled, not flattened

Every item in the Worker feed carries `dataConfidence`:

| Value | Count | Meaning |
|---|---|---|
| `verified` | 46 | Exact title match to the official export |
| `verified-alias` | 8 | Matched via a name alias — needs client sign-off |
| `unverified-legacy` | 8 | Pre-existing site figure, no matching export row |
| `no-data` | 11 | No nutrition or allergen data available |
| `phantom-unconfirmed` | 3 | Item may no longer be on the menu |

---

## Part 3 — AEO / SEO changes

### 3.1 Root cause of the lost "gluten free / dairy free / vegan" traffic

The WordPress → Framer migration removed five indexed diet-category pages with no
redirects, and the replacement calculator renders entirely in JavaScript with no
schema — so there was nothing on the page for a crawler or an AI answer engine to
read. A redirect map for the five dead URLs has been supplied separately.

### 3.2 What was added

- **JSON-LD** (`Menu` / `hasMenuItem` / `MenuItem` / `NutritionInformation` /
  `suitableForDiet`, plus a 7-question `FAQPage`) installed via Page Settings →
  SEO → Custom Code → end of `<head>`. It must live there, not in a code
  component: Framer's publish pipeline strips `<script>` tags from components.
  Validate at **validator.schema.org**, not Google's Rich Results Test — `Menu`
  is not a Google rich-result type and `FAQPage` rich results were restricted in
  August 2023 to authoritative government and health sites, so "no items
  detected" there is the expected result, not a failure.
- **`NutritionQuickAnswers`** — a server-rendered, crawlable text block answering
  the four highest-value queries (gluten-free, dairy-free, vegan, high-protein /
  GLP-1) in prose a crawler and an answer engine can both read.
- **A `GLP-1 Friendly` filter** — a macro-based label (protein ≥ 25 g,
  calories ≤ 650, no variable-macro items), never a medical claim, carrying an
  on-page disclaimer.

### 3.3 Wording discipline

The site says **"made without gluten-containing ingredients"**, not
"gluten-free." "Gluten-free" is an FDA-regulated term (21 CFR 101.91, < 20 ppm)
that cannot be substantiated from ingredient data alone in a shared kitchen. The
regulated phrase should not be used until the client confirms a cross-contact
protocol (see Open Questions, item 1).

---

## Part 4 — Expected filter counts

Reproducible: `node data/verify-filter-counts.cjs` against `worker/worker_v4_final.js`.
76 raw items merge to 66 cards (a Wrap and Bowl of the same name share one card).

| Filter | Items | Cards shown |
|---|---|---|
| All | 76 | 66 |
| Gluten-Free | 30 | 30 |
| Dairy-Free | 27 | 25 |
| Vegetarian | 8 | 8 |
| Vegan | 7 | 7 |
| High Protein | 32 | 23 |
| Low Carb | 21 | 20 |
| GLP-1 Friendly | 24 | 20 |

Before this change, Gluten-Free and Dairy-Free both returned 32 — the fingerprint
of the old, unguarded logic.

---

## Part 5 — Known limitations

1. **Cross-contact is invisible to this data.** Nothing here speaks to shared
   fryers, boards, or surfaces. The on-page wording reflects that.
2. **Vegan/vegetarian coverage is deliberately narrow** pending client sign-off.
3. **`Contains Gluten` is proxied from `Contains Wheat`** because the export's
   gluten column is empty. Tested, not assumed: all 89 ingredient statements were
   scanned for barley / rye / malt / oats / spelt / farro / semolina / durum, and
   the only 4 items mentioning any (malt) are already flagged Wheat — so the proxy
   produces no false gluten-free positives on this dataset. It would need
   revisiting if a barley- or rye-containing item is ever added.
4. **Three items may not exist** (BBQ, Buffalo, Caesar Bowl). They still appear,
   flagged `phantom-unconfirmed`, and they do currently surface under the GLP-1
   filter on unverified macros.
5. **224 modifier records are not yet wired in**, so allergens introduced by a
   customer's protein or dressing choice are not yet reflected. That is Phase 3.
6. **`NutritionQuickAnswers` currently sits at the bottom of the page**, below the
   CTA section. It should move above the calculator; the reorder could not be done
   through the API and needs a manual drag in Framer's layer panel.

---

## Part 6 — Deployment notes

The Framer component and the Cloudflare Worker must both be current, in either
order — the calculator reads the Worker feed at runtime, and the two are
version-independent. But **both** must ship: the component's fail-closed allergen
logic depends on the Worker supplying `allergens` and `dietaryTags`, and the
Worker's tags do nothing without the component that reads them.

The on-page `build` stamp under the disclaimer is the ground truth for "is the new
code actually live." If it does not read the expected build string, the publish did
not land — regardless of what any tool reported. Twice during this work a publish
went out against stale code because a push was treated as landed when it had only
been *launched*. Distinguish **launched / landed / verified** and confirm the third
before publishing.
