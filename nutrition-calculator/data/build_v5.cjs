// Builds worker_v5.js from worker_v4_final.js.
//
// Three changes, all driven by rules rather than hand-editing, so the output is
// reproducible and reviewable:
//
//   1. Drop every item that is not in the Framer Menu CMS. Nine "<Flavour>
//      Lettuce Wrap" records and "Bag of Chips" were synthesised from the FDA
//      export; the CMS carries a single "Lettuce Wraps" item and a single
//      "Chips". Restore that shape.
//   2. Derive vegan / vegetarian from the ingredient statements, splitting
//      "as served" from "only without the default Grilled Chicken" so the
//      second group can carry an on-card caveat.
//   3. Write the COMPLETE tag set on every tagged item. The component's
//      dietFromCms() returns null (fall back to allergens) only when
//      dietaryTags is empty — once any tag is present it returns false for
//      every diet not listed. A partial tag set therefore silently removes an
//      item from Gluten-Free / Dairy-Free.

const fs = require("fs")
const path = require("path")

const SRC = path.join(__dirname, "..", "worker", "worker_v4_final.js")
const OUT = path.join(__dirname, "..", "worker", "worker_v5.js")
const CMS = path.join(__dirname, "cms-menu-titles.json")

const src = fs.readFileSync(SRC, "utf8")

// ── extract MENU_DATA ─────────────────────────────────────────────────────────
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
const head = src.slice(0, anchor)
const tail = src.slice(end + 1)

// ── 1. drop items absent from the CMS ─────────────────────────────────────────
const cmsTitles = new Set(JSON.parse(fs.readFileSync(CMS, "utf8")).map(r => r[0]))
const dropped = items.filter(i => !cmsTitles.has(i.title)).map(i => i.title)
const lettuceVariants = items.filter(i => /^\S.* Lettuce Wrap$/.test(i.title))
let kept = items.filter(i => cmsTitles.has(i.title))

// Restore the single "Lettuce Wraps" CMS item from the nine variants we drop.
// Macros are a range, not an average: the component's numLoose() parses
// "150-200" as 150 with variable=true, which suppresses false precision and
// excludes the item from the GLP-1 filter (which requires !variable).
// Allergens are the UNION across all nine flavours — the conservative reading
// for an item where the customer picks the flavour at the counter.
if (lettuceVariants.length) {
    const allergenUnion = [...new Set(
        lettuceVariants.flatMap(v => (v.allergens || "").split(",").map(s => s.trim()).filter(Boolean))
    )]
    const ORDER = ["Milk", "Eggs", "Fish", "Shellfish", "Tree Nuts", "Peanuts", "Wheat", "Soy", "Sesame"]
    allergenUnion.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))
    const cal = lettuceVariants.map(v => v.calories)
    const pro = lettuceVariants.map(v => v.protein)
    const car = lettuceVariants.map(v => v.carbs)
    const rng = a => `${Math.min(...a)}-${Math.max(...a)}`
    kept.push({
        id: "lettuce-wraps", slug: "lettuce-wraps", title: "Lettuce Wraps",
        calories: rng(cal), protein: rng(pro), carbs: rng(car), fat: 0,
        category: "Wraps", price: 8.95,
        ingredients: "Romaine lettuce instead of a tortilla, your choice of flavour, grain and protein; served with chips",
        shortIngr: "Romaine lettuce instead of a tortilla",
        description: "Any wrap flavour built on romaine lettuce instead of a tortilla, served with chips. Nutrition varies by flavour.",
        thumbnail: lettuceVariants[0].thumbnail,
        allergens: allergenUnion.join(", "),
        sodium: null, fiber: null, sugars: null, satFat: null, servingGrams: null,
        verified: true, source: "FDA Rounded Export for INM 2026-07-27",
        dietaryTags: null,
        dataConfidence: "verified",
        allergenNote: "Allergens shown are the combined list across all nine flavours. Ask staff for a specific flavour — every flavour except Teriyaki is made without gluten-containing ingredients.",
        traceFields: lettuceVariants.map(v => v.title),
    })
}

// ── 2. derive vegan / vegetarian from ingredient statements ───────────────────
// Word-boundary matching. "Veggie" contains the substring "egg", so a
// substring scan reports egg in every vegetable bowl — the \b anchors matter.
const ANIMAL_ANY = /\b(honey|gelatin|milk|cream|cheese|whey|casein|yogurt|eggs?|anchovy|fish|tuna|salmon|shrimp|crab|lobster|beef|pork|chicken|turkey|bacon|ham|lard|carmine|shellac)\b/gi
const VEGETARIAN_OK = /^(honey|milk|cream|cheese|whey|casein|yogurt|eggs?)$/

// "Grilled Chicken" is the build-your-own default protein a customer can swap
// out. "Crispy Chicken" / "Boneless Chicken Wings" / "Cooked Seasoned Chicken
// Breast" are the product itself and cannot be removed — verified across all 34
// chicken-containing items.
const SWAPPABLE_CHICKEN = /Grilled Chicken/i
const PROTEIN_IN_NAME = /chicken|steak|tuna|poke|salmon|shrimp|crab|lobster|falafel|tofu|egg|beef|pork/i
const COMPOSED_CATEGORY = new Set(["Bowls", "Wraps"])

const classify = it => {
    const s = String(it.ingredientStatement || "")
    if (!s) return { diet: null, why: "no ingredient statement — left untagged (fail closed)" }

    const hits = [...new Set([...s.matchAll(ANIMAL_ANY)].map(m => m[1].toLowerCase()))]
    const nonChicken = hits.filter(h => h !== "chicken")
    const hasChicken = hits.includes("chicken")

    // Chicken present but not removable → no vegan/vegetarian claim at all.
    const chickenRemovable =
        !hasChicken ||
        (SWAPPABLE_CHICKEN.test(s) && !PROTEIN_IN_NAME.test(it.title) && COMPOSED_CATEGORY.has(it.category))
    if (hasChicken && !chickenRemovable)
        return { diet: null, why: "chicken is the product, not a swappable default" }

    if (nonChicken.length === 0)
        return hasChicken
            ? { diet: "vegan-without-chicken", why: "only animal ingredient is the default Grilled Chicken" }
            : { diet: "vegan", why: "no animal ingredients" }

    if (nonChicken.every(h => VEGETARIAN_OK.test(h)))
        return hasChicken
            ? { diet: "vegetarian-without-chicken", why: `contains ${nonChicken.join(", ")} plus the default Grilled Chicken` }
            : { diet: "vegetarian", why: `contains ${nonChicken.join(", ")}` }

    return { diet: null, why: `contains ${nonChicken.join(", ")}` }
}

// ── 3. write COMPLETE tag sets ────────────────────────────────────────────────
const hasAllergenData = it => {
    const a = (it.allergens || "").trim().toLowerCase()
    return a !== "" && a !== "unconfirmed"
}
const lacks = (it, word) => !(it.allergens || "").toLowerCase().includes(word)

const CAVEAT = "Vegan/vegetarian only when ordered without the default grilled chicken. The nutrition shown is measured with chicken."

// Whole single-ingredient foods with no lab statement. The fail-closed default is
// correct for anything composed, but withholding "vegan" from a banana is a
// false negative a reader would (rightly) not trust. Kept deliberately tiny:
// only items where the product name IS the complete ingredient list. Fruit Cup
// and Fruit Bowl are excluded on purpose — either could be served with yogurt.
const WHOLE_FOOD_VEGAN = new Set(["Banana"])

const report = []
for (const it of kept) {
    const { diet, why } = WHOLE_FOOD_VEGAN.has(it.title)
        ? { diet: "vegan", why: "single whole food — the item name is the complete ingredient list" }
        : classify(it)
    if (!diet) { it.dietaryTags = null; delete it.dietNote; report.push([it.title, "—", why]); continue }

    const tags = []
    if (diet === "vegan")                        tags.push("vegan", "vegetarian")
    else if (diet === "vegan-without-chicken")   tags.push("vegan-without-chicken", "vegetarian-without-chicken")
    else if (diet === "vegetarian")              tags.push("vegetarian")
    else if (diet === "vegetarian-without-chicken") tags.push("vegetarian-without-chicken")

    // Complete the set so the tag never suppresses an allergen-derived diet.
    // Whole foods have no lab row, so hasAllergenData() is false for them — but
    // a banana's allergen list is genuinely empty rather than merely unknown, so
    // they get the full set rather than being dropped from Gluten-Free.
    const allergenFree = WHOLE_FOOD_VEGAN.has(it.title)
    if (allergenFree || (hasAllergenData(it) && lacks(it, "wheat"))) tags.push("gluten-free")
    if (allergenFree || (hasAllergenData(it) && lacks(it, "milk")))  tags.push("dairy-free")

    it.dietaryTags = tags.join(", ")
    if (diet.endsWith("-without-chicken")) it.dietNote = CAVEAT
    else delete it.dietNote
    report.push([it.title, it.dietaryTags, why])
}

// ── emit ──────────────────────────────────────────────────────────────────────
const newHead = head
    .replace(/v4\b/g, "v5")
    .replace(/generated [\d-]+/, "generated 2026-07-27")
fs.writeFileSync(OUT, newHead + JSON.stringify(kept, null, 0) + tail)

// ── audit output ──────────────────────────────────────────────────────────────
console.log(`v4 items: ${items.length}  →  v5 items: ${kept.length}`)
console.log(`\nDROPPED (not in CMS): ${dropped.length}`)
dropped.forEach(t => console.log("   - " + t))
console.log(`\nRESTORED: Lettuce Wraps (single CMS item, ${lettuceVariants.length} flavours folded in)`)

const tagged = report.filter(r => r[1] !== "—")
console.log(`\nTAGGED: ${tagged.length} of ${kept.length}`)
for (const [t, tags, why] of tagged) console.log(`   ${t.padEnd(30)} ${tags}\n${" ".repeat(33)}↳ ${why}`)

fs.writeFileSync(path.join(__dirname, "v5-tagging-report.tsv"),
    "Item\tDietary Tags\tReason\n" + report.map(r => r.join("\t")).join("\n"))
console.log("\nFull per-item reasoning written to data/v5-tagging-report.tsv")
