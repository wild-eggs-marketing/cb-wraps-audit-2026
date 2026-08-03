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

for (const r of cms) {
    // Prefer the CMS string field: it is the reconciled, verified state written on
    // 28 Jul and already checked against the feed's filter counts.
    const tagString = String(r.DietaryTags || feed[r.Title]?.dietaryTags || "").trim()
    if (!tagString) { skipped.push(r.Title); continue }

    const slugs = tagString.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
    const names = [...new Set(slugs.map(s => MAP[s]).filter(Boolean))]
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
