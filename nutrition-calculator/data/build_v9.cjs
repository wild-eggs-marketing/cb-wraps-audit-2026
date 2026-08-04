// Worker v9: disclaimers for every data/description mismatch found in the 4 Aug
// full-menu audit, per CBW's standing rule — "any time the data we have doesn't
// match the description, add a disclaimer."
//
// Sources verified against data/fda-full-2026-07-28.json before each change:
//   - "Bases - Regular Bowls" offers SIX options, one of which (Whole Wheat
//     Linguine) carries Wheat + Eggs — every gluten-free bowl with a base choice
//     needs that named.
//   - Fajita Bowl is "served with a warm tortilla or chips" (CMS description),
//     which its lab row does not include — the salad-tortilla pattern on a bowl.
//   - Breakfast Bowl's lab row is eggs + cheddar only; its tortilla-on-the-side
//     and breaded-protein options all carry wheat.
//   - Power Bowl - Regular's measured recipe contains NO chicken (beans and
//     cheddar are the protein), so v8's "built with default grilled chicken"
//     dietNote was wrong — the one place the blanket chicken assumption
//     over-applied. It is vegetarian as served.
//   - Crispy Chicken Bites' row covers the bites alone; buffalo and pesto dips
//     carry Milk + Eggs, tomato ranch has no lab row (ranch-based, warn).
//   - Kids' Crunchy Chicken / Cheese Quesadilla rows exclude the carrots &
//     ranch side (ranch = Milk + Eggs).
//   - Both Crispy Treats contain gelatin (marshmallow) — not vegetarian — on
//     top of the barley-malt gluten already noted.

const fs = require("fs")
const path = require("path")

// If you bump the worker version, grep data/*.cjs for worker_v — every builder
// must move together.
const SRC = path.join(__dirname, "..", "worker", "worker_v8.js")
const OUT = path.join(__dirname, "..", "worker", "worker_v9.js")

const src = fs.readFileSync(SRC, "utf8")
const anchor = src.indexOf("const MENU_DATA = ")
const start = src.indexOf("[", anchor)
let depth = 0, end = -1, inStr = false, esc = false
for (let k = start; k < src.length; k++) {
    const ch = src[k]
    if (inStr) { if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === '"') inStr = false; continue }
    if (ch === '"') inStr = true
    else if (ch === "[") depth++
    else if (ch === "]") { depth--; if (!depth) { end = k; break } }
}
const items = JSON.parse(src.slice(start, end + 1))
const by = t => {
    const it = items.find(i => i.title === t)
    if (!it) throw new Error("worker item not found: " + t)
    return it
}

const LINGUINE = "All our bowl bases are made without gluten-containing ingredients except the whole wheat linguine, which contains wheat and eggs."
const BREADED = "Crispy chicken and breaded plant based chicken are breaded with wheat; every other protein option is wheat-free."

// ── Power Bowl: the measured recipe has no chicken. Vegetarian as served. ────
{
    const p = by("Power Bowl")
    p.dietaryTags = "vegetarian, gluten-free"
    delete p.dietNote
    p.nutritionNote = "Measured with brown rice and no meat — the beans and cheddar are the protein (42g). Adding grilled chicken or another protein raises calories and protein from there."
    p.allergenNote = `Measured as served: no meat, brown rice base. ${LINGUINE} ${BREADED}`
}

// ── Salad-tortilla pattern on bowls ───────────────────────────────────────────
by("Fajita Bowl").allergenNote =
    `Served with a warm tortilla or tortilla chips, which contain wheat — the bowl itself is made without gluten-containing ingredients, so ask for yours without if you're avoiding gluten. ${LINGUINE} ${BREADED}`
by("Breakfast Bowl").allergenNote =
    `The tortilla served on the side contains wheat — the bowl itself is made without gluten-containing ingredients, so set the tortilla aside if you're avoiding gluten. ${LINGUINE} ${BREADED}`
by("Jerk Bowl").allergenNote = `${LINGUINE} ${BREADED}`

// ── Dips and sides the lab rows don't cover ──────────────────────────────────
by("Crispy Chicken Bites").allergenNote =
    "The nutrition and allergens shown cover the bites alone. The dipping sauces differ: buffalo and pesto contain milk and eggs, tomato ranch is ranch-based so expect milk there too, and teriyaki adds wheat and soy; BBQ is the dairy-free pick."
for (const t of ["Kid's Crunchy Chicken Meal", "Kid's Cheese Quesadilla"]) {
    const it = items.find(i => i.title === t)
    if (it) it.allergenNote =
        "The carrots & ranch side is not in these figures, and its yogurt ranch dressing contains milk and eggs. Steamed carrots or steamed broccoli are the allergen-free side picks."
}

// ── Treats: gelatin on top of the barley malt ─────────────────────────────────
for (const t of ["Original Crispy Treat", "Chocolate Crispy Treat"]) {
    const it = by(t)
    it.allergenNote = it.allergenNote.replace(/\s*$/,
        " The marshmallow also contains gelatin, so these are not vegetarian.")
}

const bump = s => s.replace(/worker[ _-]?v8/gi, m => m.replace(/8/, "9"))
fs.writeFileSync(OUT, bump(src.slice(0, start)) + JSON.stringify(items, null, 1) + bump(src.slice(end + 1)))
console.log(`Wrote ${OUT} (${fs.statSync(OUT).size} bytes, ${items.length} items)`)
for (const t of ["Power Bowl", "Fajita Bowl", "Breakfast Bowl", "Jerk Bowl", "Crispy Chicken Bites", "Kid's Crunchy Chicken Meal", "Kid's Cheese Quesadilla", "Original Crispy Treat"]) {
    const it = items.find(i => i.title === t)
    console.log(`- ${t}: ${it ? "patched" : "NOT IN WORKER (CMS-only item; fix queued in CMS instead)"}`)
}
