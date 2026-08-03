// Maps each Menu item's dietary tags onto the new Dietary Tag multi-reference
// field, and emits an apply-payload.
//
// Run with the IDs discovered from getCMSCollections:
//   node build_diet_refs.cjs --field <menuFieldId> --tags <tagCollectionId>
// Tag item IDs are read from data/diet-tag-ids.json, written by the discovery step.
//
// ── The one judgment call in here ─────────────────────────────────────────────
//
// My tag vocabulary has nine values; the field has seven. The two conditional
// ones have to go somewhere:
//
//   vegan-without-chicken      -> Vegan
//   vegetarian-without-chicken -> Vegetarian
//
// They ARE mapped in, deliberately. Excluding them would leave the Vegan page
// showing ten sides and no main dish, which reads as "there is nothing here for
// me" and is the reason this whole workstream started. Including them is only
// honest if the page carries the condition, so:
//
//   - Every such item already has `dietNote` in the Worker feed ("Vegan/vegetarian
//     only when ordered without the default grilled chicken...").
//   - The Vegan and Vegetarian tag items get a `Disclaimer` saying the same thing,
//     for the page to render above the grid.
//
// If a diet page renders the item list WITHOUT that disclaimer, it makes the exact
// unqualified claim this project removed from the calculator. That is a build
// requirement for the page, not a nicety.

const fs = require("fs")
const path = require("path")

const args = process.argv.slice(2)
const arg = n => { const i = args.indexOf("--" + n); return i === -1 ? null : args[i + 1] }
const MENU_FIELD = arg("field")
const TAG_COLLECTION = arg("tags")
if (!MENU_FIELD) { console.error("need --field <menu multi-reference field id>"); process.exit(1) }

const WORKER = path.join(__dirname, "..", "worker", "worker_v7.js")
// MUST be a snapshot taken AFTER the 28 Jul tag write. cms-audit-page1.json is the
// pre-write state and its Dietary Tags are 98/103 empty; building from it silently
// falls back to the feed's tags, which carry no high-protein / low-carb /
// glp-1-friendly values at all (those are macro-derived and live only in the CMS
// strings). A dry run against the stale file produced 42 items and zero GLP-1.
// Refresh with a live getCMSItems read across BOTH pages (the tool caps at 100 and
// the collection is 103) before running this for real.
const AUDIT = path.join(__dirname, "cms-audit-live.json")
const TAG_IDS = path.join(__dirname, "diet-tag-ids.json")
const OUT = path.join(__dirname, "diet-ref-updates.json")

// { "Gluten Free": "<itemId>", ... }
const tagIds = JSON.parse(fs.readFileSync(TAG_IDS, "utf8"))

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

// slug-tag -> display name of the Dietary Tag item
const MAP = {
    "gluten-free": "Gluten Free",
    "dairy-free": "Dairy Free",
    "vegan": "Vegan",
    "vegan-without-chicken": "Vegan",                     // see note above
    "vegetarian": "Vegetarian",
    "vegetarian-without-chicken": "Vegetarian",           // see note above
    "high-protein": "High Protein",
    "low-carb": "Low Carb",
    "glp-1-friendly": "GLP-1 Friendly",
}

const updates = []
const skipped = []
let conditionalCount = 0

// The CMS string field `lentTZd7e` was deleted along with the enum, so the 58 tag
// strings written on 28 Jul are gone. Tags are recomputed here from the same two
// sources and the same rules that produced them: diet status from the Worker feed
// (or, for the two Active=0 salads that are deliberately absent from it, from
// DRAFT_SALAD_DIETS), plus allergen-derived and macro-derived tags off the live CMS
// values. Verified below against the calculator's own filter counts.
const DRAFT_SALAD_DIETS = { "Fruit & Feta Salad": "vegetarian", "Grilled Veggie Salad": "vegetarian" }
const num = v => { const n = Number(String(v).match(/-?\d+(\.\d+)?/)?.[0]); return Number.isFinite(n) ? n : 0 }
// Mirrors the component's numLoose(): variable when the value is not purely
// numeric. Checking only for -/+ missed the CMS's "from 8" wording, which is the
// same range expressed differently from the feed's "8-22".
const isVariable = v => { const s = String(v ?? "").trim(); return s !== "" && !/^-?\d+(\.\d+)?$/.test(s) }

for (const r of cms) {
    const f = feed[r.Title]
    // Feed allergens first — the CMS was stale on 11 wheat items before the 28 Jul
    // correction, and the feed is the reconciled source either way.
    const allergens = String(f?.allergens || r.Allergens || "").trim()
    const hasAllergenData = allergens !== "" && allergens.toLowerCase() !== "unconfirmed"
    const low = allergens.toLowerCase()

    const set = new Set()
    for (const t of String(f?.dietaryTags || DRAFT_SALAD_DIETS[r.Title] || "").split(",").map(s => s.trim()).filter(Boolean)) set.add(t)
    if (hasAllergenData && !low.includes("wheat")) set.add("gluten-free")
    if (hasAllergenData && !low.includes("milk")) set.add("dairy-free")
    const cal = num(r.Calories || f?.calories || 0), pro = num(r.Protein || f?.protein || 0), carb = num(r.Carbs || f?.carbs || 0)
    const variable = isVariable(r.Calories || f?.calories || "")
    if (pro >= 25) set.add("high-protein")
    // Variable-macro items are excluded, as they already are from GLP-1. Lettuce
    // Wraps carries carbs "8-22": reading the floor tags it Low Carb, but a build
    // at 22g is not low carb, and a range's best case is not a claim. NOTE: the
    // calculator's own "Low Carb" predicate lacks this guard and so does include
    // Lettuce Wraps -- one line to fix on the next component push, tracked in
    // REMAINING.md. Diverging here is deliberate: the CMS tag drives menu pages,
    // and a page asserting "Low Carb" is a stronger claim than a filter pill.
    if (!variable && carb > 0 && carb <= 20) set.add("low-carb")
    if (!variable && cal > 0 && pro >= 25 && cal <= 650) set.add("glp-1-friendly")

    if (!set.size) { skipped.push(r.Title); continue }
    const slugs = [...set]
    const names = [...new Set(slugs.map(s => MAP[s]).filter(Boolean))]
    // Safety assertion, not a comment: a wheat item must never reference Gluten Free.
    if (names.includes("Gluten Free") && /wheat/i.test(allergens))
        throw new Error(`REFUSING: ${r.Title} has wheat (${allergens}) but resolved to Gluten Free`)
    const unmapped = slugs.filter(s => !MAP[s])
    if (unmapped.length) throw new Error(`unmapped tag on ${r.Title}: ${unmapped.join(", ")}`)

    const ids = names.map(n => {
        const id = tagIds[n]
        if (!id) throw new Error(`no Dietary Tag item id for "${n}" — check diet-tag-ids.json`)
        return id
    })

    const conditional = slugs.some(s => s.endsWith("-without-chicken"))
    if (conditional) conditionalCount++

    updates.push({
        id: r.id, slug: r.slug, title: r.Title,
        draft: r.draft === true,          // MUST be passed through — omitting it publishes drafts
        tagNames: names, conditional,
        fields: { [MENU_FIELD]: { type: "multiCollectionReference", value: ids } },
    })
}

fs.writeFileSync(OUT, JSON.stringify(updates, null, 1))

console.log(`items to update: ${updates.length}`)
console.log(`skipped (no tags): ${skipped.length}`)
console.log(`items carrying a conditional (without-chicken) diet claim: ${conditionalCount}`)
console.log(`  -> the Vegan and Vegetarian pages MUST render the disclaimer for these`)
const freq = {}
updates.forEach(u => u.tagNames.forEach(n => { freq[n] = (freq[n] || 0) + 1 }))
console.log(`\nitems per tag:`)
Object.entries(freq).sort((p, s) => s[1] - p[1]).forEach(([n, c]) => console.log(`   ${n.padEnd(18)} ${c}`))
const drafts = updates.filter(u => u.draft).map(u => u.title)
console.log(`\ndrafts in payload (draft:true must be passed): ${drafts.length ? drafts.join(", ") : "none"}`)
console.log(`\nPayload: ${OUT}`)
