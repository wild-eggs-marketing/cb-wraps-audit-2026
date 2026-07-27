// Rebuilds the page-head JSON-LD from worker_v5.js so the structured data and the
// runtime filters can never drift apart.
//
// One deliberate asymmetry: suitableForDiet carries ONLY unconditional claims.
// An item tagged "vegan-without-chicken" is genuinely vegan when ordered without
// its default grilled chicken, and the page says so with the caveat attached —
// but schema.org has no way to attach a condition to suitableForDiet, and an AI
// answer engine reading "suitableForDiet: VeganDiet" will state flatly that the
// Teriyaki Bowl is vegan. That is the exact failure this project set out to fix,
// so conditional items are covered in the FAQ prose instead, where the condition
// travels with the claim.

const fs = require("fs")
const path = require("path")

const WORKER = path.join(__dirname, "..", "worker", "worker_v5.js")
const OUT = path.join(__dirname, "..", "framer", "head-jsonld-snippet.txt")
const FAQ_IN = "/tmp/faq_v4.json"

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

const tagsOf = it => new Set((it.dietaryTags || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean))

// Only items whose numbers are reconciled against the official analysis get a
// structured nutrition claim. Unverified and phantom items are excluded outright
// rather than published with a hedge no crawler will read.
const VERIFIED = new Set(["verified", "verified-alias"])
const eligible = items.filter(it =>
    VERIFIED.has(it.dataConfidence) &&
    Number(it.calories) > 0 &&
    !String(it.calories).includes("-")   // variable-macro items have no single figure to publish
)

const menuItems = eligible.map(it => {
    const t = tagsOf(it)
    const diets = []
    if (t.has("vegan")) diets.push("https://schema.org/VeganDiet")
    if (t.has("vegetarian")) diets.push("https://schema.org/VegetarianDiet")
    if (t.has("gluten-free")) diets.push("https://schema.org/GlutenFreeDiet")
    if (t.has("dairy-free")) diets.push("https://schema.org/LowLactoseDiet")

    const entry = {
        "@type": "MenuItem",
        name: it.title,
        nutrition: {
            "@type": "NutritionInformation",
            calories: `${it.calories} calories`,
            proteinContent: `${it.protein} g`,
            carbohydrateContent: `${it.carbs} g`,
        },
    }
    if (it.description) entry.description = it.description
    if (diets.length) entry.suitableForDiet = diets
    return entry
})

// ── FAQ: keep the existing questions, refresh the two diet answers ────────────
const faq = JSON.parse(fs.readFileSync(FAQ_IN, "utf8"))

const named = pred => items.filter(pred).map(i => i.title).sort()
const list = a => a.length <= 1 ? (a[0] || "") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]

const veganAsServed = named(i => tagsOf(i).has("vegan"))
const veganWithout = named(i => tagsOf(i).has("vegan-without-chicken"))
const vegetarianAsServed = named(i => tagsOf(i).has("vegetarian"))
// Vegan-able items carry BOTH conditional tags, so subtract them here — otherwise
// the FAQ answer lists the same bowl as "no animal ingredients at all" and
// "vegetarian rather than vegan" in consecutive sentences.
const vegetarianWithout = named(i => tagsOf(i).has("vegetarian-without-chicken") && !tagsOf(i).has("vegan-without-chicken"))
const dairyFree = named(i => tagsOf(i).has("dairy-free"))

const setAnswer = (question, text) => {
    const q = faq.mainEntity.find(x => x.name === question)
    if (!q) throw new Error("FAQ question not found: " + question)
    q.acceptedAnswer.text = text
}

setAnswer("Is there a vegan menu at Crazy Bowls & Wraps?",
    `We don't have a separate vegan menu, but there is plenty that is vegan as it comes: ${list(veganAsServed)}. ` +
    `Several main dishes are vegan when you order them without the grilled chicken they are built with by default — ${list(veganWithout)}. ` +
    `The calorie and protein figures shown for those dishes are measured with the chicken in, so they will be lower without it. ` +
    `Because we cook in a shared kitchen we can't guarantee any item is free from cross-contact with animal products.`)

setAnswer("Can I make a Crazy Bowls & Wraps bowl vegan?",
    `Yes. Every composed bowl is built with grilled chicken by default, and you can ask for it without. ` +
    `Ordered that way, ${list(veganWithout.filter(t => /Bowl$/.test(t)))} contain no animal ingredients at all. ` +
    `${list(vegetarianWithout.filter(t => /Bowl$/.test(t)))} become vegetarian rather than vegan without the chicken, ` +
    `because they still contain dairy or honey — the Fajita and Power Bowls have cheese, the Thai Bowl has honey, ` +
    `and the Mediterranean, Pesto and Jerk Bowls have dairy in their sauces. ` +
    `Nutrition shown for all of these is measured with the chicken included.`)

setAnswer("What dairy-free options does Crazy Bowls & Wraps have?",
    `${dairyFree.length} items on our menu contain no milk according to our official allergen analysis: ${list(dairyFree)}. ` +
    `We cook in a shared kitchen, so we can't guarantee any item is free from dairy cross-contact — ask our staff if it matters for you.`)

// ── emit ─────────────────────────────────────────────────────────────────────
const payload = [
    {
        "@context": "https://schema.org",
        "@type": "Menu",
        name: "Crazy Bowls & Wraps Nutrition Calculator",
        url: "https://www.crazybowlsandwraps.com/nutrition-calculator",
        hasMenuItem: menuItems,
    },
    faq,
]

fs.writeFileSync(OUT,
    '<script type="application/ld+json">\n' +
    JSON.stringify(payload, null, 2) +
    "\n</script>\n")

console.log(`MenuItems published: ${menuItems.length} of ${items.length} feed items`)
console.log(`  excluded: ${items.length - eligible.length} (unverified, phantom, no macros, or variable)`)
console.log(`\nsuitableForDiet counts (unconditional claims only):`)
const count = d => menuItems.filter(m => (m.suitableForDiet || []).some(u => u.endsWith(d))).length
for (const d of ["VeganDiet", "VegetarianDiet", "GlutenFreeDiet", "LowLactoseDiet"]) console.log(`  ${d.padEnd(16)} ${count(d)}`)
console.log(`\nconditional (FAQ prose only, no suitableForDiet):`)
console.log(`  vegan without chicken:      ${veganWithout.length}  ${list(veganWithout)}`)
console.log(`  vegetarian without chicken: ${vegetarianWithout.length}`)
console.log(`\nFAQ questions: ${faq.mainEntity.length}`)
console.log(`Output: ${OUT} (${fs.statSync(OUT).size} bytes)`)
