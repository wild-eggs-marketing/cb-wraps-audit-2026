// Builds worker_v7.js from worker_v6.js.
//
// Adds a MODIFIERS block from the 28 Jul export and replaces the vague
// nutritionNote wording with real numbers, because we now have them.
//
// No swap UI yet — this is the data layer only. But the notes that said "we don't
// have a measured figure for that build" were only true until this export landed,
// and leaving them in place would be stating a limitation that no longer exists.

const fs = require("fs")
const path = require("path")

const SRC = path.join(__dirname, "..", "worker", "worker_v6.js")
const OUT = path.join(__dirname, "..", "worker", "worker_v7.js")
const FDA = JSON.parse(fs.readFileSync(path.join(__dirname, "fda-full-2026-07-28.json"), "utf8"))

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
// head runs to `start` (the "["), never to `anchor` — slicing at anchor drops the
// `const MENU_DATA =` declaration and the Worker throws on the first request.
const head = src.slice(0, start)
const tail = src.slice(end + 1)

// ── modifiers ─────────────────────────────────────────────────────────────────
// Only Active rows ship. Two Active=0 rows are deliberately withheld pending CBW
// confirmation: the Gluten Free Tortilla and the second Plant Based Chicken entry,
// both named "Only at the Forsyth and O'Fallon Locations". Publishing a
// gluten-free tortilla that turns out not to be available is the worst kind of
// error this project can make.
const WITHHELD = FDA.filter(r => r.type === "Modifier" && !r.active).map(r => r.name)

// An explicit allow-list, not a keyword scan. A scan gets this wrong in both
// directions on this exact data: "Pan Seared Steak"'s statement reads "Cooked
// Steak" and slipped a beef/pork/chicken word filter, while "Plant Based Chicken"
// was excluded because its NAME contains "chicken". Telling a vegan that steak is
// plant-based is the worst failure available here, so the set is enumerated and
// each entry was checked against its full ingredient statement:
//   Tofu                 — Water, Organic Soybeans, Organic Canola Oil, calcium salts
//   Plant Based Chicken  — Water, SOY Protein-Concentrate, Sunflower Oil, Salt, spices
//   Falafel              — Chickpeas, Quinoa, Soybean Oil, onion, lime, spices, sesame
// Deliberately excluded: "Plant Based Chicken (Only at the Forsyth and O'Fallon
// Locations)" contains EGG WHITES — vegetarian, not vegan — and is Active=0 anyway.
const PLANT_PROTEINS = new Set(["Tofu", "Plant Based Chicken", "Falafel"])

const modifiers = FDA
    .filter(r => r.type === "Modifier" && r.active && r.group)
    .map(r => ({
        name: r.name, group: r.group, unit: r.unit,
        calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat,
        allergens: r.allergens.join(", "),
        plantBased: PLANT_PROTEINS.has(r.name),
    }))

// ── replace the "we don't know" notes with the numbers we now have ────────────
const proteinsFor = group => modifiers.filter(m => m.group === group)
const REG = "Proteins - Regular Bowls & Salads"
const gc = proteinsFor(REG).find(m => m.name === "Grilled Chicken")
const plantProteins = proteinsFor(REG).filter(m => m.plantBased)
const fmt = (m, base) => {
    const dc = m.calories - base.calories, dp = m.protein - base.protein
    const sign = n => (n > 0 ? `+${n}` : String(n))
    return `${m.name} (${sign(dc)} cal, ${sign(dp)}g protein)`
}

let rewritten = 0
for (const it of items) {
    if (!/-without-chicken/.test(it.dietaryTags || "")) continue
    it.nutritionNote =
        `Measured with the grilled chicken this is built with by default (${gc.calories} cal, ${gc.protein}g protein for a regular bowl). ` +
        `Swap it and the numbers move: ${plantProteins.map(m => fmt(m, gc)).join(", ")}. ` +
        `Leaving the protein out entirely takes off about ${gc.calories} calories and ${gc.protein}g of protein.`
    it.plantProteinSwap = plantProteins.map(m => m.name).join(", ")
    rewritten++
}

// ── emit ──────────────────────────────────────────────────────────────────────
const modBlock = `\nconst MODIFIERS = ${JSON.stringify(modifiers, null, 0)}\n\nconst MENU_DATA = `
const newHead = head
    .replace(/v6\b/g, "v7")
    .replace(/generated [\d-]+/, "generated 2026-07-28")
    .replace(/const MENU_DATA = $/, modBlock)
fs.writeFileSync(OUT, newHead + JSON.stringify(items, null, 0) + tail)

console.log(`items: ${items.length}   modifiers shipped: ${modifiers.length}`)
console.log(`nutritionNote rewritten with real deltas on ${rewritten} items`)
console.log(`\nplant-based proteins (Regular Bowls & Salads): ${plantProteins.map(m => `${m.name} ${m.calories}cal/${m.protein}g`).join(", ")}`)
console.log(`\nWITHHELD (Active=0, need CBW confirmation): ${[...new Set(WITHHELD)].join(", ")}`)
console.log(`\nmodifier groups shipped:`)
const g = {}
modifiers.forEach(m => { g[m.group] = (g[m.group] || 0) + 1 })
Object.entries(g).sort().forEach(([k, v]) => console.log(`   ${k.padEnd(38)} ${v}`))
