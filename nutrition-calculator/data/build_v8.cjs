// Builds worker_v8.js from worker_v7.js. Three corrections, all found by the
// data-integrity advisor on 28 Jul 2026 and verified against the raw export.
//
// ── 1. THE SAUCE OMISSION (live safety defect) ───────────────────────────────
// Stir Fry Bowl and High-Protein Bowl published allergens "None" — which renders
// an affirmative green "No major allergens" badge — plus gluten-free and
// dairy-free tags. Their lab rows contain NO SAUCE:
//   Stir-Fry Bowl - Regular: "Veggie Mix… Brown Rice, Grilled Chicken"
//   High Protein Bowl:       "Veggie Mix… Grilled Chicken"
// But their own on-page copy sells the sauce as the defining choice — "stir-fried
// in your choice of regular teriyaki, spicy teriyaki, house made gluten-free Thai
// peanut sauce, or olive oil and herb". Those sauces carry:
//   Teriyaki        Wheat, Soy          Spicy Teriyaki  Wheat, Soy, Sesame
//   Gluten Free Thai  PEANUTS, Soy, Sesame   Pesto Sauce  Milk, Eggs
// So a peanut-allergic customer saw "no major allergens" on a bowl whose
// description offers peanut sauce. This is the tortilla defect (v4) in a new
// place: the lab row covers a component set, not the dish as sold.
//
// Fixed by failing closed — allergens become "unconfirmed", which triggers the
// existing "ask our staff" state and drops both items from Gluten-Free and
// Dairy-Free. An allergenNote then names which sauces are safe, so the item stays
// usable rather than merely blank. Only 2 of 70 items have this shape; a scan for
// "copy offers a sauce choice AND lab statement contains no sauce" found no others.
//
// ── 2. THREE ITEMS SAID "UNCONFIRMED" WITH DATA SITTING IN THE EXPORT ────────
// The original reconciliation matched only Type=Item rows. These three exist as
// Type=Modifier rows and carry allergens. All are kids'/dessert items, where
// "unknown" reads to a parent as "probably fine".
//
// ── 3. MY MALT AUDIT WAS WRONG ───────────────────────────────────────────────
// CHANGELOG Part 5.3 and the comment in NutritionCalculator.tsx claim "the only 4
// items that mention malt are already flagged Wheat". True of Item rows; false of
// the dataset. Original Crispy Treat and Chocolate Crispy Treat both contain
// "Malt Extract" and are NOT Wheat-flagged. Barley malt is already here, unflagged.
// No live false positive today — neither is gluten-free tagged — but the proxy's
// evidence base is falsified, not merely fragile. Recorded here and in the
// changelog; the real fix is a statement-level gluten scan, not a Wheat proxy.

const fs = require("fs")
const path = require("path")

const SRC = path.join(__dirname, "..", "worker", "worker_v7.js")
const OUT = path.join(__dirname, "..", "worker", "worker_v8.js")

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
const head = src.slice(0, start)   // to `start`, never `anchor`
const tail = src.slice(end + 1)

const changes = []

// ── 1 ────────────────────────────────────────────────────────────────────────
const SAUCE_DEPENDENT = {
    "Stir Fry Bowl": "Sweet & Sour, or olive oil, herb and lime",
    "High-Protein Bowl": "Sweet & Sour, or olive oil, herb and lime",
}
for (const it of items) {
    const safe = SAUCE_DEPENDENT[it.title]
    if (!safe) continue
    it.allergens = "unconfirmed"
    // Drop the two allergen-derived claims. Keep the conditional vegan/vegetarian
    // tags — but the dietNote below now names the sauce condition too, because
    // chicken-free is not sufficient: the pesto contains milk and eggs and the
    // Thai sauce contains honey.
    it.dietaryTags = (it.dietaryTags || "").split(",").map(s => s.trim())
        .filter(t => t && t !== "gluten-free" && t !== "dairy-free").join(", ") || null
    it.allergenNote = `The allergens in this bowl depend entirely on the sauce you choose, and the lab analysis covers the bowl without sauce. Teriyaki and spicy teriyaki contain wheat and soy; our Thai sauce contains peanuts, soy and sesame; the basil pesto contains milk and eggs. ${safe} carry none of the major allergens. Please tell our staff which sauce you want and about any allergy.`
    it.dietNote = "Vegan or vegetarian only when ordered without the default grilled chicken AND with a sauce that suits — the basil pesto contains milk and eggs, and our Thai sauce contains honey. The nutrition shown is measured with chicken and without sauce."
    changes.push([it.title, 'allergens "None" -> "unconfirmed"; dropped gluten-free + dairy-free; added sauce allergenNote'])
}

// ── 2 ────────────────────────────────────────────────────────────────────────
// Values taken from the export's Modifier rows, which the original title-matched
// reconciliation never looked at.
const FROM_MODIFIER = {
    "Carrots & Ranch":        { allergens: "Milk, Eggs", src: "Modifier 'Carrots and Ranch' (Kids Sides)" },
    "Original Crispy Treat":  { allergens: "Milk",       src: "Modifier 'Original Crispy Treat' (Desserts)" },
    "Chocolate Crispy Treat": { allergens: "Milk, Soy",  src: "Modifier 'Chocolate Crispy Treat' (Desserts)" },
}
for (const it of items) {
    const m = FROM_MODIFIER[it.title]
    if (!m) continue
    const before = it.allergens
    it.allergens = m.allergens
    // All three carried "unverified-legacy", and their legacy macros turn out to
    // MATCH the modifier rows exactly (100/370/380 cal) — so the figures are now
    // confirmed, not merely inherited. Upgrade the confidence and drop the stale
    // "figures pre-date our analysis" note, which contradicted the fresh data.
    if (it.dataConfidence === "no-data" || it.dataConfidence === "unverified-legacy")
        it.dataConfidence = "verified-alias"
    delete it.nutritionNote
    changes.push([it.title, `allergens ${JSON.stringify(before)} -> "${m.allergens}" from ${m.src}; confidence -> verified-alias`])
}

// Banana had allergens null while claiming gluten-free, dairy-free, vegan and
// vegetarian — via a whole-food override added in v5. The claims are true; the
// mechanism was not, because a tag always beats the fail-closed allergen fallback,
// so the item asserted four diets on no data. Giving it an explicit "None" makes
// the data support the claim instead of the claim bypassing the data. Safe because
// a banana's ingredient list is the word banana.
for (const it of items) {
    if (it.title === "Banana" && !String(it.allergens || "").trim()) {
        it.allergens = "None"
        changes.push([it.title, 'allergens null -> "None" (single whole food; makes the existing diet claims data-supported rather than override-driven)'])
    }
}

// ── 3 ────────────────────────────────────────────────────────────────────────
// The two malt rows must be EXCLUDED from Gluten-Free, not merely annotated.
// Filling in their allergens above ("Milk" / "Milk, Soy") handed them to the
// wheat-based proxy, which sees no wheat and returns gluten-free = true. So fix #2
// created two brand-new false gluten-free claims on items containing barley malt.
// Annotating them was not enough: no filter reads a note.
//
// The exclusion uses an explicit "contains-gluten" marker rather than a fake Wheat
// flag, because the gluten here is barley and writing Wheat would be false. A
// non-empty dietaryTags makes the component's dietFromCms() return false for every
// diet not named — exactly right for these two: gluten from malt, milk present, and
// vegetarian status unknown (marshmallow may contain gelatin).
//
// A full re-audit across all 311 rows for barley/rye/malt/spelt/kamut/farro/
// semolina/durum/triticale/bulgur/couscous/seitan/oats found exactly these two,
// both Modifier rows, both unflagged. Everything else is clean, so the Wheat proxy
// holds for the other 89 items and 190 modifiers. The original audit was right
// about the Item rows and blind to the Modifier rows, which did not exist in the
// export at the time it was run.
const GLUTEN_FROM_MALT = ["Original Crispy Treat", "Chocolate Crispy Treat"]
for (const it of items) {
    if (!GLUTEN_FROM_MALT.includes(it.title)) continue
    it.containsMalt = true
    it.dietaryTags = "contains-gluten"
    it.allergenNote = "Contains malt extract, made from barley, so this is not gluten-free even though it contains no wheat. Please tell our staff if you are avoiding gluten."
    changes.push([it.title, 'tagged "contains-gluten" to exclude it from Gluten-Free — filling its allergens had made the wheat-based proxy pass it'])
}

// ── 4. phantom bowls: macros are provably wrong, not merely unverified ───────
// BBQ/Buffalo/Caesar Bowl figures are byte-identical to their WRAP rows — they
// include a flour tortilla (~260 cal) a bowl does not have — and all three claim
// fat: 0, which is arithmetically impossible. macrosSuspect lets the component
// exclude them from macro-based filters (High Protein / Low Carb / GLP-1), where
// a wrong number is a wrong claim; the figures stay visible under the existing
// phantom banner so the page does not silently lose three items.
for (const t of ["BBQ Bowl", "Buffalo Bowl", "Caesar Bowl"]) {
    const it = items.find(i => i.title === t)
    if (!it) continue
    it.macrosSuspect = true
    it.nutritionNote = "These figures could not be confirmed and appear to describe the wrap version of this dish — they include a tortilla a bowl doesn't have. Treat them as unreliable; this item is pending re-analysis."
    changes.push([t, "macrosSuspect: true (figures identical to the wrap row incl. tortilla; fat: 0 impossible)"])
}

const newHead = head.replace(/v7\b/g, "v8").replace(/generated [\d-]+/, "generated 2026-07-28")
fs.writeFileSync(OUT, newHead + JSON.stringify(items, null, 0) + tail)

console.log(`items: ${items.length}\n`)
for (const [t, c] of changes) console.log(`  ${t}\n      ${c}`)

// Assertions — the point of the exercise, not decoration.
const bad = items.filter(i => {
    const a = (i.allergens || "").trim().toLowerCase()
    const hasData = a !== "" && a !== "unconfirmed" && a !== "null"
    const t = i.dietaryTags || ""
    return (/gluten-free/.test(t) && (!hasData || a.includes("wheat")))
        || (/dairy-free/.test(t) && (!hasData || a.includes("milk")))
})
console.log(`\nASSERT no item claims gluten-free/dairy-free without supporting allergen data: ${bad.length === 0 ? "PASS" : "FAIL — " + bad.map(i => i.title).join(", ")}`)

const noneBadge = items.filter(i => (i.allergens || "").toLowerCase() === "none")
console.log(`items still showing the "no major allergens" badge: ${noneBadge.length}`)
noneBadge.forEach(i => {
    const stmt = i.ingredientStatement || ""
    const ok = stmt && !/choice of|your choice/i.test((i.ingredients || "") + (i.description || ""))
    console.log(`   ${ok ? "ok  " : "CHECK"} ${i.title}`)
})
