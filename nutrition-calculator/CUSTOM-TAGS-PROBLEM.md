# The `Custom Tags` field can't do this job — and it's currently mislabelling every item

**Status: live in the CMS as of 28 Jul 2026. Do not build menu pages on this field yet.**

---

## What's wrong right now

`Custom Tags` (`VBDxvNg1H`) is an **enum**, and Framer enums take a default value —
the first case. The first case is **Gluten Free**. So every item in the Menu
collection currently reads `Custom Tags = "Gluten Free"`, whether or not it is.

Verified examples:

| Item | Allergens | Custom Tags reads |
|---|---|---|
| **Thai Wrap** | Peanuts, **Wheat**, Soy, Sesame | Gluten Free |
| **Banana Chocolate Chip Bowl** | *(no analysis at all)* | Gluten Free |

Every flour-tortilla wrap is in this state. If a menu page filters on `Custom Tags`,
it will list wheat-containing wraps as gluten-free — the same class of error this
project spent its first phase fixing in the calculator, and the one with actual
consequences for a customer with celiac disease.

I attempted to clear the value on Thai Wrap; the MCP call timed out and its state
is unconfirmed. Assume all 103 items still read "Gluten Free" until checked.

## Why the field type can't work, regardless of the default

An enum holds **one** value. Dietary attributes are **multi-valued**. The Stir Fry
Bowl is simultaneously:

```
gluten-free · dairy-free · vegan-without-chicken · vegetarian-without-chicken
high-protein · glp-1-friendly
```

Six true claims, one slot. Whatever single case gets picked, the other five become
invisible to a filter — so a "Gluten-Free menu" page and a "GLP-1 menu" page can
never both be right off the same field. This isn't a data-entry problem that
populating carefully would solve.

## Two ways to fix it

### Option A — seven boolean fields (simple)

Add to the Menu collection:

```
Gluten Free · Dairy Free · Vegan · Vegetarian · High Protein · Low Carb · GLP-1 Friendly
```

Booleans, not enums. Framer's filter UI handles these natively as checkboxes, and I
can populate all 58 qualifying items from the same reconciled source the calculator
and the string tags already use. Fastest route to working menu pages.

Then delete `Custom Tags`, or the wrong values stay in the collection waiting to be
filtered on by accident.

### Option B — a Dietary Tag collection + multi-reference (recommended)

1. New collection **Dietary Tag**, one item per tag, each with a `Title` and a
   slug: `gluten-free`, `dairy-free`, `vegan`, `vegetarian`, `high-protein`,
   `low-carb`, `glp-1-friendly`.
2. On **Menu**, add a `multiCollectionReference` field pointing at it.

More setup, and it buys two things Option A doesn't:

- **Real routes.** Each tag becomes a CMS item with a slug, so Framer can generate
  `/menu/gluten-free`, `/menu/vegan`, `/menu/glp-1-friendly` as actual indexable
  pages with their own titles, H1s and schema. That is exactly the fix in item 3 of
  `REMAINING.md` — the thing that recovers what `/bowl_categories/gluten-free/`
  used to rank for. Query-param filtering never earns those rankings; real routes do.
- **Editable tag copy.** The intro paragraph and FAQ for each diet page lives on the
  tag item rather than being hard-coded, so the client can edit it.

My recommendation is B, because the menu pages are the reason this came up and B is
the version that ranks. A is a reasonable stopgap if you want filtering working
today.

## What already works in the meantime

`Dietary Tags` (`lentTZd7e`, string) is correct and complete on 58 items and needs
no further work. Framer can filter it with **contains**:

```
Dietary Tags contains "glp-1-friendly"
Dietary Tags contains "gluten-free"
```

Vocabulary:

```
gluten-free · dairy-free · vegan · vegetarian
vegan-without-chicken · vegetarian-without-chicken
high-protein · low-carb · glp-1-friendly
```

One gotcha: `contains "vegan"` also matches `vegan-without-chicken`, and
`contains "vegetarian"` matches `vegetarian-without-chicken`. Usually what you want
for a menu page — but the page has to carry the "order without chicken" caveat, or
it makes the unqualified claim we removed from the calculator.

These tags were verified to reproduce the calculator's filter counts exactly across
all eight filters, and zero wheat-containing items carry `gluten-free`.

## Immediate action

1. **Don't filter any page on `Custom Tags`.** Use `Dietary Tags` contains.
2. Pick Option A or B and add the fields — I can't add fields to a user-managed
   collection, so this needs doing in the Framer UI.
3. Tell me which, and I'll populate every item from the same source and verify
   against the same two assertions: filter counts must match the feed, and no
   wheat item may carry a gluten-free claim.
4. Once populated, delete `Custom Tags` so its wrong values can't be used.
