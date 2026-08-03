// Computes the complete Dietary Tags string for every Framer CMS Menu item and
// emits an apply-payload.
//
// Why: Dietary Tags is empty on 98 of 103 CMS items. Every diet filter in the
// calculator has been running off the Worker feed, so the CMS itself carries
// almost no diet data — which means a CMS-driven menu page has nothing to filter
// on. These tags are what make "Gluten-Free menu" and "GLP-1 menu" pages possible.
//
// Two rules that are not optional:
//
//   1. TAG SETS MUST BE COMPLETE. The calculator's dietFromCms() falls back to the
//      allergen heuristic only while dietaryTags is EMPTY. The moment a string is
//      non-empty it returns false for every diet not named in it. So writing
//      "high-protein" alone onto the Poke Bowl would silently drop it out of
//      Gluten-Free and Dairy-Free, which it currently passes on allergens. Every
//      item that gets any tag gets all of its true tags.
//
//   2. DRAFT STATUS IS NOT OURS TO CHANGE. upsertCMSItem defaults `draft` to false,
//      so an update that omits it PUBLISHES a draft. That silently published two
//      discontinued salads on the first run of this payload. Any applier of this
//      payload must pass the item's existing draft value explicitly.
//
//   3. NO TAGS WITHOUT DATA. An item with no allergen analysis gets no
//      gluten-free/dairy-free tag — absence of data is not evidence of absence.
//      Macro tags (high-protein, low-carb, glp-1-friendly) are still safe there
//      only if macros exist, so they are gated on calories > 0.

const fs = require("fs")
const path = require("path")

const WORKER = path.join(__dirname, "..", "worker", "worker_v7.js")
const AUDIT = path.join(__dirname, "cms-audit-page1.json")
const OUT = path.join(__dirname, "cms-tag-updates.json")

const src = fs.readFileSync(WORKER, "utf8")
const a = src.indexOf("const MENU_DATA = ")
const st = src.indexOf("[", a)
let d = 0, e = -1, q = false, x = false
for (let k = st; k < src.length; k++) {
    const c = src[k]
    if (q) { if (x) x = false; else if (c === "\\") x = true; else if (c === '"') q = false; continue }
    if (c === '"') q = true
    else if (c === "[") d++
    else if (c === "]") { d--; if (!d) { e = k; break } }
}
const feed = {}
for (const i of JSON.parse(src.slice(st, e + 1))) feed[i.title] = i

const cms = JSON.parse(fs.readFileSync(AUDIT, "utf8"))

// The three salads were tagged when they were created and are already correct;
// they're included so the payload is a complete statement of intended state.
const num = v => { const n = Number(String(v).match(/-?\d+(\.\d+)?/)?.[0]); return Number.isFinite(n) ? n : 0 }
const isVariable = v => /[-+]/.test(String(v).replace(/^-/, ""))

const updates = []
const skipped = []

for (const r of cms) {
    const f = feed[r.Title]
    // FEED FIRST, not CMS. This looks like the wrong way round and isn't: the
    // Worker feed is the reconciled source, and the CMS allergen field is stale on
    // 11 items — every flour-tortilla wrap plus the Healthy Burrito and Lettuce
    // Wraps are MISSING WHEAT there, because the wheat-from-tortilla correction was
    // applied to the feed and never written back to the CMS. Trusting the CMS value
    // here re-derived `gluten-free` for ten wheat items on the first run of this
    // script — the exact safety bug this project opened by fixing. The corrected
    // value is also written back below so the CMS stops being wrong.
    const allergens = String(f?.allergens || r.Allergens || "").trim()
    const hasAllergenData = allergens !== "" && allergens.toLowerCase() !== "unconfirmed"
    const low = allergens.toLowerCase()

    const cal = num(r.Calories || f?.calories || 0)
    const pro = num(r.Protein || f?.protein || 0)
    const carb = num(r.Carbs || f?.carbs || 0)
    const variable = isVariable(r.Calories || f?.calories || "")

    const tags = new Set()

    // Diet tags come from the feed, which is the reconciled source. They are never
    // re-derived here — one derivation, in build_v5/build_salads, not two.
    //
    // Fall back to the CMS's own diet tags when an item ISN'T in the feed. Two items
    // are deliberately absent from it — Fruit & Feta and Grilled Veggie Salad are
    // Active=0 and excluded so drafts don't ship — and the first run of this script
    // therefore wiped their existing "vegetarian" tag, because feed[title] was
    // undefined and only the allergen and macro rules ran. Never let "no feed row"
    // read as "no diet claim".
    const DIETS = new Set(["vegan", "vegetarian", "vegan-without-chicken", "vegetarian-without-chicken"])
    const dietSource = f?.dietaryTags || r.DietaryTags || ""
    for (const t of String(dietSource).split(",").map(s => s.trim()).filter(Boolean))
        if (DIETS.has(t)) tags.add(t)

    // Complete the allergen-derived pair for any item that has allergen data, even
    // if it has no vegan/vegetarian status. This is rule 1 above.
    if (hasAllergenData && !low.includes("wheat")) tags.add("gluten-free")
    if (hasAllergenData && !low.includes("milk")) tags.add("dairy-free")

    // Macro tags, matching the calculator's own predicates exactly.
    if (pro >= 25) tags.add("high-protein")
    if (carb > 0 && carb <= 20) tags.add("low-carb")
    if (!variable && cal > 0 && pro >= 25 && cal <= 650) tags.add("glp-1-friendly")

    const ORDER = ["vegan", "vegan-without-chicken", "vegetarian", "vegetarian-without-chicken",
                   "gluten-free", "dairy-free", "high-protein", "low-carb", "glp-1-friendly"]
    const value = [...tags].sort((p, s) => ORDER.indexOf(p) - ORDER.indexOf(s)).join(", ")

    const fields = {}
    let allergenFix = null

    // Write the reconciled allergen list back whenever the CMS disagrees. Most
    // disagreements are only ordering (CMS alphabetical vs FDA Big-9 order), which
    // is worth normalising anyway; the ones that matter are the 11 missing Wheat.
    if (f?.allergens && String(r.Allergens || "").trim() !== f.allergens) {
        fields.ivojcMHVr = { type: "string", value: f.allergens }
        const cmsHasWheat = /wheat/i.test(String(r.Allergens || ""))
        const feedHasWheat = /wheat/i.test(f.allergens)
        allergenFix = !cmsHasWheat && feedHasWheat ? "ADDS WHEAT" : "reorder"
    }

    if (value !== String(r.DietaryTags || "").trim() && value !== "")
        fields.lentTZd7e = { type: "string", value }

    if (!Object.keys(fields).length) {
        skipped.push([r.Title, value === "" ? "no data to tag from" : "already correct"])
        continue
    }

    updates.push({ id: r.id, slug: r.slug, title: r.Title, tags: value, allergenFix, fields })
}

fs.writeFileSync(OUT, JSON.stringify(updates, null, 1))

console.log(`CMS items examined: ${cms.length}`)
console.log(`updates to apply:   ${updates.length}`)
console.log(`skipped:            ${skipped.length}`)
console.log(`\n--- skipped for lack of data (${skipped.filter(s => s[1] === "no data to tag from").length}) ---`)
console.log(skipped.filter(s => s[1] === "no data to tag from").map(s => s[0]).join(", "))
console.log(`\n--- tag frequency across the ${updates.length} updates ---`)
const freq = {}
updates.forEach(u => u.tags.split(", ").forEach(t => { freq[t] = (freq[t] || 0) + 1 }))
Object.entries(freq).sort((p, s) => s[1] - p[1]).forEach(([t, n]) => console.log(`   ${t.padEnd(30)} ${n}`))
console.log(`\nPayload: ${OUT}`)
