// Builds worker_v6.js from worker_v5.js.
//
//   1. Adds the three live salads restored to the CMS on 28 Jul 2026. The two
//      Active=0 salads stay out of the feed — they are CMS drafts, and a draft
//      that ships in the feed is live to every customer.
//   2. Adds `nutritionNote`: a per-item statement of what the published figure
//      does and does not include, for every item where a normal customer choice
//      moves the number and we have no measured value for the alternative.
//
// On (2): the calculator has always shown a single figure per item as though it
// were the only possible answer. It isn't. Every composed bowl and wrap is
// measured with grilled chicken; the salads are measured without the tortilla or
// chips they arrive with; grain choices are measured as one option. Saying "we
// don't have a figure for that build" is more useful than implying the number
// covers every build.

const fs = require("fs")
const path = require("path")

const SRC = path.join(__dirname, "..", "worker", "worker_v5.js")
const OUT = path.join(__dirname, "..", "worker", "worker_v6.js")
const SALADS = JSON.parse(fs.readFileSync(path.join(__dirname, "salads-fda-source.json"), "utf8"))

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
// head runs to `start`, the "[", NOT to `anchor` — slicing at anchor drops the
// `const MENU_DATA =` declaration and the Worker throws on the first request.
const head = src.slice(0, start)
const tail = src.slice(end + 1)

// ── 1. the three live salads ──────────────────────────────────────────────────
// Field values mirror what is now in the Framer CMS, which was itself reconciled
// against the in-store menu board (see salads-corrections.cjs).
const SALAD_CMS = {
    "Santa Fe Salad": {
        id: "gT5FlsTET", slug: "santa-fe-salad", price: 9.50,
        thumbnail: "https://framerusercontent.com/images/0MZo922BRjjUct3VSEv6P10UHI4.jpg",
        ingredients: "Mixed greens, corn salsa, pico de gallo, tortilla strips, cheddar cheese, avocado, tomato ranch dressing. Served with a warm tortilla or tortilla chips.",
        shortIngr: "Mixed greens, corn salsa, pico, tortilla strips, cheddar, avocado",
        description: "Mixed greens with corn salsa, pico de gallo, tortilla strips, cheddar and avocado, in a tomato ranch dressing. Served with a warm tortilla or tortilla chips.",
        dietaryTags: "vegetarian",
        nutritionNote: "These figures cover the salad only — the warm tortilla or tortilla chips it comes with are counted separately and we don't yet have a figure for them. The menu also lists avocado, which isn't in the lab analysis these numbers come from, so treat 260 as a floor rather than an exact count and ask our staff if it matters.",
    },
    "Multigrain Quinoa Salad": {
        id: "L_iEdcq3C", slug: "multigrain-quinoa-salad", price: 9.50,
        thumbnail: "https://framerusercontent.com/images/ETHikHcYdnhdNvfrjzI7CBmC8.jpeg",
        ingredients: "Quinoa, brown rice, mixed greens, tomato, garbanzo beans, avocado, red onion, feta cheese, goma shio, gluten-free tahini vinaigrette. Served with a warm tortilla or tortilla chips.",
        shortIngr: "Quinoa, brown rice, mixed greens, garbanzo, avocado, feta",
        description: "Quinoa and brown rice over mixed greens with tomato, garbanzo beans, avocado, red onion, feta and goma shio, in a gluten-free tahini vinaigrette. Served with a warm tortilla or tortilla chips.",
        dietaryTags: "vegetarian, gluten-free",
        nutritionNote: "These figures cover the salad as dressed, including the tahini vinaigrette — that and the grains are where most of the calories are. The warm tortilla or tortilla chips it comes with are counted separately and we don't yet have a figure for them. Ask for the dressing on the side if you'd rather control it.",
    },
    "Kale & Quinoa Salad": {
        id: "oVcyBIXaR", slug: "kale-quinoa-salad", price: 9.95,
        thumbnail: "https://framerusercontent.com/images/jUIWPqlBZEIYySYb82D3ki77ObI.jpeg",
        ingredients: "Chopped kale, quinoa, feta cheese, sundried tomato, garbanzo beans, pepperoncini, red onion, kalamata olives, gluten-free tahini vinaigrette. Served with a warm tortilla or tortilla chips.",
        shortIngr: "Kale, quinoa, feta, garbanzo, pepperoncini, kalamata olives",
        description: "Chopped kale and quinoa with feta, sundried tomato, garbanzo beans, pepperoncini, red onion and kalamata olives, in a gluten-free tahini vinaigrette. Served with a warm tortilla or tortilla chips.",
        dietaryTags: "vegetarian, gluten-free",
        nutritionNote: "These figures cover the salad as dressed, including the tahini vinaigrette — that and the quinoa are where most of the calories are. The warm tortilla or tortilla chips it comes with are counted separately and we don't yet have a figure for them. Ask for the dressing on the side if you'd rather control it.",
    },
}

const ORDER = ["Milk", "Eggs", "Fish", "Shellfish", "Tree Nuts", "Peanuts", "Wheat", "Soy", "Sesame"]
// Export name -> board name. The export's internal name for one salad is longer.
const EXPORT_TO_MENU = { "Tossed Kale & Quinoa Salad": "Kale & Quinoa Salad" }

const added = []
for (const s of SALADS) {
    const menuName = EXPORT_TO_MENU[s.name] ?? s.name
    const cms = SALAD_CMS[menuName]
    if (!cms) continue   // Active=0 — stays a CMS draft, out of the live feed
    const allergens = [...s.allergens].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))
    items.push({
        id: cms.id, slug: cms.slug, title: menuName,
        calories: s.calories, protein: s.protein, carbs: s.carbs, fat: s.fat,
        category: "Salads", price: cms.price,
        ingredients: cms.ingredients, shortIngr: cms.shortIngr, description: cms.description,
        thumbnail: cms.thumbnail,
        allergens: allergens.join(", "),
        sodium: s.sodium, fiber: s.fiber, sugars: s.sugars, satFat: s.satFat,
        servingGrams: s.servingGrams,
        verified: true, source: "FDA Rounded Export for INM 2026-07-27",
        dietaryTags: cms.dietaryTags,
        dataConfidence: "verified",
        nutritionNote: cms.nutritionNote,
        ingredientStatement: s.ingr,
    })
    added.push(menuName)
}

// ── 2. nutritionNote for everything else a customer can change ────────────────
const SWAPPABLE = /-without-chicken/
const GRAIN_CHOICE = /choice of (a )?grain|brown rice|quinoa/i

let noted = 0
for (const it of items) {
    if (it.nutritionNote) { noted++; continue }

    const parts = []

    // Measured with the default grilled chicken. dietNote already says this in
    // service of the diet claim; this says it in service of the number, which is
    // what someone tracking calories is actually reading.
    if (SWAPPABLE.test(it.dietaryTags || ""))
        parts.push("This is measured with the grilled chicken it's built with by default. Ordered without, the calories and protein will both be lower — we don't have a separate measured figure for that build yet, so ask our staff if you need one.")

    // Grain swaps move carbs and calories and the lab row covers one option.
    else if (GRAIN_CHOICE.test((it.ingredients || "") + " " + (it.description || "")) && it.category !== "Salads")
        parts.push("Measured with one grain option. Swapping the grain, protein or sauce changes these numbers and we don't have a measured figure for every combination — ask our staff if a specific build matters to you.")

    if (it.dataConfidence === "no-data")
        parts.push("This item hasn't been through nutrition analysis yet, so we have no figures for it at all.")
    else if (it.dataConfidence === "unverified-legacy")
        parts.push("These figures pre-date our current nutrition analysis and haven't been reconciled against it — treat them as approximate.")
    else if (it.dataConfidence === "phantom-unconfirmed")
        parts.push("We can't currently confirm this item is on the menu, and its figures haven't been reconciled against our nutrition analysis.")

    if (parts.length) { it.nutritionNote = parts.join(" "); noted++ }
}

const newHead = head.replace(/v5\b/g, "v6").replace(/generated [\d-]+/, "generated 2026-07-28")
fs.writeFileSync(OUT, newHead + JSON.stringify(items, null, 0) + tail)

console.log(`v5: ${items.length - added.length} items  ->  v6: ${items.length} items`)
console.log(`\nADDED: ${added.join(", ")}`)
console.log(`SKIPPED (Active=0, CMS drafts): ${SALADS.filter(s => !SALAD_CMS[EXPORT_TO_MENU[s.name] ?? s.name]).map(s => s.name).join(", ")}`)
console.log(`\nnutritionNote present on ${noted} of ${items.length} items`)
const byCat = {}
items.filter(i => i.nutritionNote).forEach(i => { byCat[i.category] = (byCat[i.category] || 0) + 1 })
for (const [c, n] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) console.log(`   ${c.padEnd(12)} ${n}`)
