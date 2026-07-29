// Builds the CMS payloads to restore the Salads category, from the same FDA/INM
// export the rest of the calculator uses.
//
// Three salads are Active=1 in the export, and the June 15 crawl independently
// found live pages for exactly those three (/salads/santa-fe-salad/,
// /salads/multigrain-quinoa-salad/, /salads/kale-quinoa-salad/). Two others are
// Active=0 and are emitted separately as drafts rather than silently dropped.
//
// Dietary tags are derived by the SAME rules as build_v5.cjs — not hand-written —
// so a salad and a bowl can't end up judged differently. In particular the tag set
// is written complete: the component's dietFromCms() falls back to the allergen
// heuristic only when dietaryTags is empty, so a partial set would silently drop
// the item from Gluten-Free / Dairy-Free.

const fs = require("fs")
const path = require("path")

const SALADS = JSON.parse(fs.readFileSync(
    path.join(__dirname, "salads-fda-source.json"), "utf8"))

// Menu collection field IDs (collectionId fEfKTjIH1).
const F = {
    title: "fIwxSF70L", calories: "Du4yxFxRV", protein: "mD5e0_FmL", carbs: "RxAestyVQ",
    category: "pSTF6eHFu", price: "cXFi6mhII", ingredients: "i9pbPSUve",
    shortIngr: "IFoMCHzs_", allergens: "ivojcMHVr", dietaryTags: "lentTZd7e",
    description: "GZnmQpwkD", thumbnail: "o5P7Ztu2L",
    faqQ1: "zG08650jR", faqA1: "loB8_cYxl", faqQ2: "im_35WFB0", faqA2: "lrC33foKY",
}

// Every other Menu item carries two FAQ pairs, and they render on the item's detail
// page — so they're crawlable text, not decoration. Answers are drawn from the
// allergen data rather than invented.
const FAQS = {
    "Santa Fe Salad": [
        ["Is the Santa Fe Salad gluten-free?",
         "Not as it comes — the tortilla strips contain wheat. Ask for it without the strips and everything else in it is made without gluten-containing ingredients. We cook in a shared kitchen, so we can't guarantee any item is free from gluten cross-contact."],
        ["Is the Santa Fe Salad vegetarian?",
         "Yes. It contains cheddar and a yogurt-based ranch, so it's vegetarian but not vegan or dairy-free."],
    ],
    "Multigrain Quinoa Salad": [
        ["Is the Multigrain Quinoa Salad vegetarian?",
         "Yes. The feta and the yogurt in the tahini vinaigrette make it vegetarian rather than vegan. It's also made without gluten-containing ingredients."],
        ["Why is this salad higher in calories than the others?",
         "It's built on brown rice and quinoa with avocado and a tahini vinaigrette, which is where most of the 870 calories come from. The Santa Fe Salad is 260 if you're after something lighter."],
    ],
    "Tossed Kale & Quinoa Salad": [
        ["Is the Tossed Kale & Quinoa Salad gluten-free?",
         "It's made without gluten-containing ingredients — there's no wheat in it. We cook in a shared kitchen, so we can't guarantee any item is free from gluten cross-contact."],
        ["Is it vegan?",
         "No. The feta and the yogurt in the tahini vinaigrette make it vegetarian rather than vegan."],
    ],
    "Fruit & Feta Salad": [
        ["Does the Fruit & Feta Salad contain nuts?",
         "Yes — it contains tree nuts and peanuts as well as milk. Please ask our staff before ordering if you have a nut allergy."],
        ["Is it vegetarian?",
         "Yes, though the feta means it isn't vegan or dairy-free."],
    ],
    "Grilled Veggie Salad": [
        ["Is the Grilled Veggie Salad vegan?",
         "No. The asiago makes it vegetarian rather than vegan. It also contains sesame from the gomashio."],
        ["What vegetables are in it?",
         "Grilled zucchini, roma tomato, carrot, red bell pepper and red onion, over romaine and spring mix."],
    ],
}

// ── identical rules to build_v5.cjs ───────────────────────────────────────────
const ANIMAL_ANY = /\b(honey|gelatin|milk|cream|cheese|whey|casein|yogurt|eggs?|anchovy|fish|tuna|salmon|shrimp|crab|lobster|beef|pork|chicken|turkey|bacon|ham|lard|carmine|shellac)\b/gi
const VEGETARIAN_OK = /^(honey|milk|cream|cheese|whey|casein|yogurt|eggs?)$/
const SWAPPABLE_CHICKEN = /Grilled Chicken/i
const PROTEIN_IN_NAME = /chicken|steak|tuna|poke|salmon|shrimp|crab|lobster|falafel|tofu|egg|beef|pork/i

const classify = (name, ingr) => {
    const hits = [...new Set([...String(ingr).matchAll(ANIMAL_ANY)].map(m => m[1].toLowerCase()))]
    const nonChicken = hits.filter(h => h !== "chicken")
    const hasChicken = hits.includes("chicken")
    const removable = !hasChicken || (SWAPPABLE_CHICKEN.test(ingr) && !PROTEIN_IN_NAME.test(name))
    if (hasChicken && !removable) return { diet: null, why: "chicken is the product" }
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

const CAVEAT = "Vegan/vegetarian only when ordered without the default grilled chicken. The nutrition shown is measured with chicken."

// Customer-facing copy. Written from the ingredient statements, and kept to what
// the statement actually supports — no adjectives the data can't back.
const COPY = {
    "Santa Fe Salad": {
        description: "Romaine and spring mix with corn salsa, pico de gallo, cheddar, tortilla strips and a sundried tomato ranch.",
        shortIngr: "Romaine, spring mix, corn salsa, pico, cheddar, tortilla strips",
    },
    "Multigrain Quinoa Salad": {
        description: "Romaine and spring mix over brown rice and quinoa with garbanzo beans, avocado, tomato, feta and a tahini vinaigrette.",
        shortIngr: "Romaine, spring mix, brown rice, quinoa, garbanzo, avocado, feta",
    },
    "Tossed Kale & Quinoa Salad": {
        description: "Kale and quinoa tossed with garbanzo beans, pepperoncini, kalamata olives, sundried tomato, feta and a tahini vinaigrette.",
        shortIngr: "Kale, quinoa, garbanzo, pepperoncini, olives, feta",
    },
    "Fruit & Feta Salad": {
        description: "Romaine and spring mix with strawberries, blueberries, spinach, feta and sunflower seeds.",
        shortIngr: "Romaine, spring mix, strawberries, blueberries, feta, sunflower seeds",
    },
    "Grilled Veggie Salad": {
        description: "Grilled zucchini, tomato, carrot, red pepper and onion over romaine and spring mix with asiago and sesame gomashio.",
        shortIngr: "Grilled veggies, romaine, spring mix, asiago, sesame",
    },
}

const slugify = s => s.toLowerCase()
    .replace(/&/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").replace(/--+/g, "-")

// The June crawl's URLs, so the restored slugs match what was indexed before.
const CRAWLED_SLUG = {
    "Santa Fe Salad": "santa-fe-salad",
    "Multigrain Quinoa Salad": "multigrain-quinoa-salad",
    "Tossed Kale & Quinoa Salad": "kale-quinoa-salad",
}

const out = []
for (const s of SALADS) {
    const allergens = s.allergens.join(", ")
    const { diet, why } = classify(s.name, s.ingr)

    const tags = []
    if (diet === "vegan") tags.push("vegan", "vegetarian")
    else if (diet === "vegan-without-chicken") tags.push("vegan-without-chicken", "vegetarian-without-chicken")
    else if (diet === "vegetarian") tags.push("vegetarian")
    else if (diet === "vegetarian-without-chicken") tags.push("vegetarian-without-chicken")

    const hasData = allergens.trim() !== ""
    const low = allergens.toLowerCase()
    if (diet && hasData && !low.includes("wheat")) tags.push("gluten-free")
    if (diet && hasData && !low.includes("milk")) tags.push("dairy-free")

    const copy = COPY[s.name] ?? { description: "", shortIngr: "" }

    out.push({
        name: s.name,
        slug: CRAWLED_SLUG[s.name] ?? slugify(s.name),
        draft: !s.active,
        active: s.active,
        why,
        dietNote: /-without-chicken/.test(tags.join(",")) ? CAVEAT : null,
        fieldData: {
            [F.title]:       { type: "string", value: s.name },
            [F.calories]:    { type: "string", value: String(s.calories) },
            [F.protein]:     { type: "string", value: String(s.protein) },
            [F.carbs]:       { type: "string", value: String(s.carbs) },
            [F.category]:    { type: "string", value: "Salads" },
            [F.ingredients]: { type: "string", value: copy.shortIngr ? s.ingr : s.ingr },
            [F.shortIngr]:   { type: "string", value: copy.shortIngr },
            [F.allergens]:   { type: "string", value: allergens },
            [F.dietaryTags]: { type: "string", value: tags.join(", ") },
            [F.description]: { type: "string", value: copy.description },
            [F.faqQ1]:       { type: "string", value: (FAQS[s.name] ?? [])[0]?.[0] ?? "" },
            [F.faqA1]:       { type: "string", value: (FAQS[s.name] ?? [])[0]?.[1] ?? "" },
            [F.faqQ2]:       { type: "string", value: (FAQS[s.name] ?? [])[1]?.[0] ?? "" },
            [F.faqA2]:       { type: "string", value: (FAQS[s.name] ?? [])[1]?.[1] ?? "" },
            // Price and Thumbnail deliberately omitted. Price isn't in the FDA
            // export, and there is no salad photo anywhere in the data I have —
            // borrowing another item's image is exactly what produced nine
            // identical Lettuce Wrap cards. Both need a human.
        },
    })
}

const OUT = path.join(__dirname, "salads-cms-payload.json")
fs.writeFileSync(OUT, JSON.stringify(out, null, 2))

console.log(`${out.length} salads (${out.filter(s => s.active).length} active, ${out.filter(s => !s.active).length} draft)\n`)
for (const s of out) {
    console.log(`${s.active ? "LIVE " : "DRAFT"}  ${s.name}`)
    console.log(`       slug: ${s.slug}`)
    console.log(`       ${s.fieldData[F.calories].value} cal · ${s.fieldData[F.protein].value}g pro · ${s.fieldData[F.carbs].value}g carb`)
    console.log(`       allergens: ${s.fieldData[F.allergens].value}`)
    console.log(`       tags: ${s.fieldData[F.dietaryTags].value || "(none)"}   ↳ ${s.why}`)
    console.log(`       missing: price, thumbnail`)
}
console.log(`\nPayload: ${OUT}`)
