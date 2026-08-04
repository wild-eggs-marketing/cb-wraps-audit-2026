// Regenerates the ANSWERS_DEFAULT block in framer/NutritionQuickAnswers.tsx from
// worker_v6.js.
//
// This block is the page's only crawlable diet content — the calculator fetches
// client-side, so on first paint this text is all a crawler or answer engine sees.
// It had been hand-maintained, and had drifted into stating the exact claims that
// were fixed in the filter months later:
//
//   "Vegan bowls include the Stir Fry Bowl, Sweet & Sour Bowl, Teriyaki Bowl, and
//    Thai Bowl"          -> Thai Bowl contains honey and is not vegan; the other
//                           three are only vegan ordered without chicken.
//   "Any flavor can be ordered as a Lettuce Wrap ... for a gluten-free wrap"
//                        -> Teriyaki is the exception; its sauce contains wheat.
//   "confirmed gluten-free"
//                        -> the regulated phrase, which this data cannot support.
//
// Generating it removes the drift, and any future feed change shows up here.

const fs = require("fs")
const path = require("path")

// NOTE: this path has now been left pinned to a stale worker twice (v6 while v7
// shipped, caught 4 Aug). If you bump the worker version, grep data/*.cjs for
// worker_v — every builder must move together.
const WORKER = path.join(__dirname, "..", "worker", "worker_v11.js")
const TSX = path.join(__dirname, "..", "framer", "NutritionQuickAnswers.tsx")

const src = fs.readFileSync(WORKER, "utf8")
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

const tags = i => new Set((i.dietaryTags || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean))
const has = (i, t) => tags(i).has(t)
const named = pred => items.filter(pred).map(i => i.title).sort()
const list = a => a.length <= 1 ? (a[0] || "") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]
const num = n => String(n)

// The `examples` line is the short list a reader actually scans. Alphabetical order
// put Banana and Carrots first and no main dish at all, which reads as "there's
// nothing here for me" — rank mains ahead of sides.
const MAIN_FIRST = { Bowls: 0, Salads: 1, Wraps: 2, Breakfast: 3, Starters: 4, Sides: 5, Kids: 6, Desserts: 7 }
const examplesFor = pred => items.filter(pred)
    .sort((a, b) => (MAIN_FIRST[a.category] ?? 9) - (MAIN_FIRST[b.category] ?? 9) || a.title.localeCompare(b.title))
    .slice(0, 5).map(i => i.title).join(", ")

const gf = named(i => has(i, "gluten-free"))
const df = named(i => has(i, "dairy-free"))
const veganAsServed = named(i => has(i, "vegan"))
const veganWithout = named(i => has(i, "vegan-without-chicken"))
// Vegan items carry both tags, so "N more items are vegetarian" has to exclude
// them or it double-counts the list it was just introduced by.
const vegetarianOnly = named(i => has(i, "vegetarian") && !has(i, "vegan"))

// GLP-1: the same predicate the filter uses, so the copy and the pill agree.
const glp1 = items.filter(i =>
    !String(i.calories).includes("-") && Number(i.calories) > 0 &&
    Number(i.protein) >= 25 && Number(i.calories) <= 650)
const glp1Verified = glp1.filter(i => i.dataConfidence === "verified" || i.dataConfidence === "verified-alias")
const topProtein = [...glp1Verified].sort((a, b) => Number(b.protein) - Number(a.protein)).slice(0, 5)

const ANSWERS = [
    {
        heading: "Gluten-Free",
        body:
            `${num(gf.length)} items on our menu are made without gluten-containing ingredients, according to our official allergen analysis: ${list(gf)}. ` +
            `Eight of our nine wrap flavors — BBQ, Buffalo, Caesar, Jerk, Mediterranean, Pesto, Power and Thai — can be ordered as a Lettuce Wrap on romaine instead of a flour tortilla. Teriyaki is the one exception, because its teriyaki sauce contains wheat even without the tortilla. ` +
            `Our salads — and the Fajita Bowl — are served with a warm tortilla or tortilla chips, which contain wheat, so ask for yours without; the Breakfast Bowl's side tortilla is the same story. ` +
            `Bowls come on your choice of base, and every base is made without gluten-containing ingredients except the whole wheat linguine (wheat, eggs). If you're avoiding gluten, also skip crispy chicken and breaded plant based chicken — both are breaded with wheat; every other protein is wheat-free. ` +
            `We cook in a shared kitchen, so we can't guarantee any item is free from gluten cross-contact and we don't label anything certified gluten-free. If you have celiac disease, please talk to our staff before ordering.`,
        examples: examplesFor(i => has(i, "gluten-free")),
    },
    {
        heading: "Dairy-Free",
        body:
            `${num(df.length)} items contain no milk according to our official allergen analysis: ${list(df)}. ` +
            `We cook in a shared kitchen, so we can't guarantee any item is free from dairy cross-contact — ask our staff if it matters for you.`,
        examples: examplesFor(i => has(i, "dairy-free")),
    },
    {
        heading: "Vegan & Vegetarian",
        body:
            `Vegan as it comes: ${list(veganAsServed)}. ` +
            `Every item on our menu can also be ordered without the grilled chicken it's built with by default — or with a plant protein instead: Tofu (200 cal, 17g protein) or Plant Based Chicken (130 cal, 20g protein). ` +
            `Ordered that way ${list(veganWithout)} contain no animal ingredients — on the Stir Fry and High-Protein Bowls, also pick a plant-based sauce, since the Thai peanut sauce contains honey and the pesto contains milk and eggs. ` +
            `The calories and protein shown are measured with the grilled chicken in, so they'll be lower without it. ` +
            `${num(vegetarianOnly.length)} further items are vegetarian as served rather than vegan, including all three of our salads. ` +
            `Bowls with cheese, dairy sauces or honey — the Fajita and Power Bowls (cheese), the Mediterranean, Pesto and Jerk Bowls (dairy sauces), and the Thai Bowl (honey) — are vegetarian without the chicken rather than vegan.`,
        // Mains first so the list doesn't read as sides-only, but every conditional
        // one is labelled. An unlabelled "Teriyaki Bowl" in a Vegan examples list is
        // the same false claim the filter was fixed to stop making.
        examples: [
            ...items.filter(i => has(i, "vegan-without-chicken"))
                .sort((a, b) => a.title.localeCompare(b.title)).slice(0, 3)
                .map(i => `${i.title} (without chicken)`),
            ...items.filter(i => has(i, "vegan"))
                .sort((a, b) => (MAIN_FIRST[a.category] ?? 9) - (MAIN_FIRST[b.category] ?? 9) || a.title.localeCompare(b.title))
                .slice(0, 2).map(i => i.title),
        ].join(", "),
    },
    {
        heading: "High-Protein & GLP-1-Friendly",
        body:
            `The High-Protein Bowl leads the menu at 62g of protein for 380 calories. ` +
            `${num(glp1.length)} items pair at least 25g of protein with 650 calories or fewer, which suits a protein-forward, portion-conscious way of eating: ${list(topProtein.map(i => `${i.title} (${i.protein}g protein, ${i.calories} cal)`))} among them. ` +
            `Where an item is built with grilled chicken by default, that protein figure includes it. ` +
            `These are macro-based picks, not medical advice — check with your doctor or dietitian about what fits a GLP-1 or weight-management plan.`,
        examples: topProtein.map(i => i.title).join(", "),
    },
]

// ── splice into the TSX ───────────────────────────────────────────────────────
const tsx = fs.readFileSync(TSX, "utf8")
const BEGIN = "const ANSWERS_DEFAULT: Answer[] = ["
const openIdx = tsx.indexOf(BEGIN)
if (openIdx === -1) throw new Error("ANSWERS_DEFAULT not found in " + TSX)
// Walk to the matching close bracket so the splice can't run past the array.
let d2 = 0, close = -1, q2 = false, e2 = false
for (let k = openIdx + BEGIN.length - 1; k < tsx.length; k++) {
    const ch = tsx[k]
    if (q2) { if (e2) e2 = false; else if (ch === "\\") e2 = true; else if (ch === '"') q2 = false; continue }
    if (ch === '"') q2 = true
    else if (ch === "[") d2++
    else if (ch === "]") { d2--; if (!d2) { close = k; break } }
}
if (close === -1) throw new Error("unterminated ANSWERS_DEFAULT array")

const esc2 = s => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
const block = "const ANSWERS_DEFAULT: Answer[] = [\n" +
    ANSWERS.map(a =>
        "    {\n" +
        `        heading: "${esc2(a.heading)}",\n` +
        `        body: "${esc2(a.body)}",\n` +
        `        examples: "${esc2(a.examples)}",\n` +
        "    },").join("\n") +
    "\n]"

fs.writeFileSync(TSX, tsx.slice(0, openIdx) + block + tsx.slice(close + 1))

console.log("Regenerated ANSWERS_DEFAULT from worker_v6.js\n")
for (const a of ANSWERS) {
    console.log(`### ${a.heading}`)
    console.log(a.body.replace(/(.{100}\S*)\s/g, "$1\n") + "\n")
}
console.log(`Counts used — gluten-free ${gf.length}, dairy-free ${df.length}, vegan ${veganAsServed.length} as served + ${veganWithout.length} without chicken, vegetarian ${vegetarianOnly.length}, GLP-1 ${glp1.length}`)
