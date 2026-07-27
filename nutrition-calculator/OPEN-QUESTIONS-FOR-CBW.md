# Open questions for Crazy Bowls & Wraps

These seven items are blocking further accuracy work. Items 1–3 are the ones that
carry real customer-safety weight; the rest are data hygiene.

## 1. Gluten cross-contact protocol — blocking

Do you have a documented procedure for gluten cross-contact (dedicated boards,
utensils, prep surfaces; separate fryer)?

The site currently says **"made without gluten-containing ingredients"** rather
than "gluten-free," because "gluten-free" is an FDA-regulated claim (21 CFR
101.91, under 20 ppm) that ingredient data alone cannot substantiate in a shared
kitchen. If a protocol exists and is documented, we can revisit the wording — it
is worth meaningful search traffic. If not, the current wording stays.

## 2. Per-item vegan / vegetarian sign-off — partly answered 27 Jul 2026

> **Answered:** anything on the menu can be ordered without chicken. Applied — 37
> items now carry vegan/vegetarian tags (19 with an "order without chicken"
> caveat), Vegan shows 14 cards and Vegetarian 30, up from 7 and 8.
>
> **Still needed:** someone at CBW to check the per-item results in
> `data/v5-tagging-report.tsv`. The tags are derived from the ingredient
> statements by rule, and the reasoning for each item is listed there.

Your export shows every composed bowl and wrap measured **with Grilled Chicken by
default**, and there is no column that identifies meat or animal products. So we
cannot derive vegan or vegetarian from the data — it needs a human yes/no.

Right now only 7 items are tagged vegan (single-component sides), so the Vegan
filter returns 7 results. Our ingredient screen suggests these bowls are
**vegan-able** if built without the default chicken:

- Stir Fry Bowl
- Sweet & Sour Bowl
- Teriyaki Bowl
- Bean & Veggie Bowl
- High-Protein Bowl

And these are **not** vegan even without chicken:

- Fajita Bowl and Power Bowl — contain cheese
- Thai Bowl — contains honey

Please confirm or correct that list, and tell us whether a "no protein" or "tofu"
build is actually orderable. This unlocks the single largest recovery in the
vegan/vegetarian search terms.

## 3. Do these three items still exist?

**BBQ Bowl, Buffalo Bowl, Caesar Bowl** appear on the site but have no row in your
official export. They are flagged `phantom-unconfirmed` and currently show
unverified macros. Should they be removed, or do they need lab data?

## 4. Nine alias mappings need sign-off

Nine site items matched an export row only by name alias, not exactly. Full list on
the **Alias-Needs Signoff** tab of `data/cbw-reconciliation-ledger.xlsx`.

One known correction: **Vegetable Wontons** — the live figure of 340 cal
corresponds to the **5-piece** portion, not the 3-piece. Please confirm which
portion the menu sells.

## 5. Nine inactive items

Nine items in the export appear inactive or discontinued. Should they be dropped
from the feed? See the ledger.

## 6. Twenty-one items have no lab data

Twenty-one site items have no nutrition or allergen data at all. They currently
display "not confirmed — ask staff" and are excluded from allergen-based filters
(failing closed). Can these be submitted for analysis? Listed on the **No Verified
Data** tab.

## 7. Thirty-six new items are available but not on the site

Your export contains 36 items the site does not list — including **9 Tacos** and
**5 Salads**. Should these be added to the menu CMS and the calculator?
