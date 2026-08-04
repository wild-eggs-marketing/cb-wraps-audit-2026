# Craziologist chat Worker — patch spec (2026-08-04)

**Status: PATCHED, 2026-08-04.** Elle supplied the deployed source; it revealed
the root cause was worse than the projection: the Worker inlined a pre-audit
MENU_DATA snapshot (Nutritionix, 2026-07-12) with no dietaryTags or dietNote at
all, and it never fetches the live feed (workers.dev blocks same-account
worker-to-worker fetch). The patched Worker is now GENERATED:
`node data/build_chat_menu.cjs` builds `worker/craziologist-chat_v2.js` from
`worker/craziologist-chat.template.js` (code) + the current nutrition worker
(menu incl. dietaryTags/dietNote) + `data/chat-static.json` (locations,
knowledge pack) + `data/chat-system-prompt.txt` (prompt v2). Paste the
generated file into the craziologist-chat Worker on every feed bump — same
ritual as the nutrition worker itself. The sections below stand as the record
of the defect and the patch.

## The defect, proven live on 4 Aug

Asked "Is the Thai Bowl vegan?" the bot answered "plant based as served" and
recommended tofu to make it "fully vegan." Wrong twice — the bowl is built
with grilled chicken by default, and its peanut sauce contains honey. Asked
to quote the Power Bowl's dietary-tags field, the bot answered: *"There's no
field called 'dietary tags' or 'diet note' in the Power Bowl's actual data
record. What I get back is: calories, protein, carbs, fat, category, price,
ingredients, allergens, sodium, fiber, sugars, saturated fat, serving size,
verification date, source."*

So the Worker's `getItem` / `searchMenu` tools return a projection of the
nutrition feed that **strips `dietaryTags` and `dietNote`** — the two fields
that carry every verified diet claim. Deprived of them, the model infers
vegan/vegetarian from allergen absence, and meat and honey are not allergens.

## The patch (two parts)

1. **Tool projection.** Wherever the Worker maps a feed item into the object
   returned by `getItem` / `searchMenu` / `excludeAllergens`, add:
   `dietaryTags: item.dietaryTags ?? null, dietNote: item.dietNote ?? null`.

2. **System prompt.** Add these rules verbatim:
   - "Answer vegan/vegetarian/gluten-free/dairy-free questions ONLY from the
     `dietaryTags` and `dietNote` fields. Never infer a diet claim from the
     allergen list: meat, fish, honey and gelatin are not allergens, so an
     empty allergen panel proves nothing about vegan or vegetarian status."
   - "A tag like `vegetarian-without-chicken` is conditional: the item is
     built with grilled chicken by default and only qualifies when ordered
     without it. Always state the condition. `dietNote` explains what blocks
     the stronger claim (e.g. honey, cheese) — repeat that reason."
   - "If `dietaryTags` is null or absent, say the item has no verified diet
     classification and refer the guest to staff — do not guess."

## Interim mitigation already shipped (worker v11)

The bot demonstrably passes the `ingredients` string through, so v11 appends
the chicken disclosure there for all 16 composed items whose measured recipe
contains grilled chicken while their menu copy omits it (e.g. Power Bowl:
"…Built with grilled chicken by default — without it it's vegetarian but not
vegan (cheddar cheese)."). This corrects the bot's raw material but is a
mitigation, not the fix: the model still lacks the structured tags and can
still mis-reason. Apply the patch above when the source is available.
