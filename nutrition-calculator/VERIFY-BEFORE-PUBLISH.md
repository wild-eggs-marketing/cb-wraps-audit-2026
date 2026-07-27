# Pre-publish verification checklist — build `2026-07-27-05`

Check on **staging first**: https://just-teammates-970081.framer.app/nutrition-calculator

Every check below is a number or an exact string, so no judgement is needed.

## 0. Is the new code actually live?

Scroll to the disclaimer at the bottom. It must read:

```
build 2026-07-27-05 · 76 items loaded
```

**If the build string is anything else, stop.** The publish did not land and no
other check below is meaningful.

## 1. Filter counts

| Filter | Expected cards |
|---|---|
| (no filter) | 66 |
| Gluten-Free | **30** |
| Dairy-Free | **25** |
| Vegetarian | 8 |
| Vegan | 7 |
| High Protein | 23 |
| Low Carb | 20 |
| GLP-1 Friendly | 20 |

If Gluten-Free and Dairy-Free both read **32**, that is the exact fingerprint of
the old logic — the code is stale.

## 2. Gluten-Free membership spot-check

Select **Gluten-Free** only. The list must:

- ✅ include all 8 of: BBQ, Buffalo, Caesar, Jerk, Mediterranean, Pesto, Power,
  Thai **Lettuce Wrap**
- ❌ **not** include Teriyaki Lettuce Wrap (its sauce contains wheat)
- ❌ **not** include any item whose name ends in plain "Wrap" (BBQ Wrap, Thai
  Wrap, Healthy Burrito, Breakfast Wrap, …) — these use a flour tortilla

## 3. Vegan membership

Select **Vegan** only. Exactly these 7, and nothing else:

Banana · Broccoli with Olive Oil & Herb · Carrots · Garlic Ginger Edamame ·
Mixed Veggies · Salt & Lime Edamame · Spicy Edamame

**No bowl or wrap should appear.** If Stir Fry Bowl or Teriyaki Bowl shows up,
the code is stale.

## 4. Allergen display

Open any item detail. You should see colour-coded Big-9 allergen chips and a
`Contains …` line. Then open **BBQ Bowl** (or Buffalo / Caesar Bowl) — it must
read:

> Allergen information isn't confirmed for this item yet — please ask our staff
> before ordering.

## 5. The badge that caused the "100 calories" report

Open **Poke Bowl**. The protein badge must read:

```
8g protein per 100 cal
```

Not `8g protein / 100 cal`. And the calorie figure for the item itself is **410**.

---

Only after all six pass on staging should production be published. Then re-run
checks 0, 1 and 5 on the live URL.
