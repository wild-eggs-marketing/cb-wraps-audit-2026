import { addPropertyControls, ControlType } from "framer"

/**
 * NutritionCalculatorSchema
 * JSON-LD for the /nutrition-calculator page — a Menu graph (hasMenuItem[] with
 * NutritionInformation + suitableForDiet) plus an FAQPage answering the diet
 * queries this page needs to rank for (gluten-free, dairy-free, vegan) and the
 * expansion queries (high-protein / GLP-1-friendly).
 *
 * ── 2026-08-04: THIS COMPONENT IS THE LIVE JSON-LD SOURCE ─────────────────────
 * An earlier note here claimed the <script> tag does not survive Framer's
 * publish pipeline. Wrong — the published /nutrition-calculator page was found
 * serving this component's output, rendered from STALE CANVAS-INSTANCE PROP
 * OVERRIDES that predated the Phase 0 correction (26 items asserting VeganDiet
 * on four chicken-containing bowls and VegetarianDiet on eleven more), next to
 * an outdated pasted head snippet. Both wrong payloads at once.
 * Consequences of that discovery:
 *   1. The canvas instance must carry NO prop overrides — defaults render.
 *   2. The Page Settings → SEO → Custom Code head snippet must be DELETED,
 *      not re-pasted, or the page emits two Menu graphs.
 *   3. These defaults are GENERATED from the Worker feed (currently v10) by
 *      data/build_jsonld.cjs — regenerate and updateCodeFile on data changes;
 *      do not hand-edit, and do not edit props on the canvas instance.
 *
 * ── PHASE 0 CORRECTION, 2026-07-27 ────────────────────────────────────────────
 * Every composed item in the official FDA/INM export is measured AS SHOWN WITH
 * GRILLED CHICKEN — no exceptions. (A 2026-08-04 claim that the Power Bowl was
 * meatless was retracted the same day: the Regular row's ingredient statement
 * DOES include grilled chicken, mid-statement. Its CMS description omits
 * chicken — discrepancy flagged to CBW in OPEN-QUESTIONS.) Vegan/vegetarian
 * claims on composed items remain removed: the export's "Contains Meat" and "Contains
 * Animal Products" columns are 100% empty, so vegan/vegetarian is only claimed
 * where the full ingredient statement was individually screened for meat,
 * dairy, egg and honey and came back clean. "Can be made vegan by swapping the
 * protein" stays FAQ prose, never a suitableForDiet claim.
 * Items whose v9 allergen row is "unconfirmed" (Stir Fry Bowl, Poke Bowl, …)
 * carry NO allergen-derived diet claims at all.
 *
 * ── Gluten claim basis ────────────────────────────────────────────────────────
 * "Contains Gluten" is 100% empty in the export, so gluten is proxied from
 * "Contains Wheat". That proxy was tested: all 89 ingredient statements were
 * scanned for barley, rye, malt, oats, spelt, farro, semolina, durum and
 * seitan; the only hits are already Wheat=Y. Copy says "made without
 * gluten-containing ingredients", never the FDA-regulated "gluten-free"
 * (21 CFR 101.91) — shared-kitchen cross-contact is disclosed on-page.
 * Serving-context caveats (salad/Fajita/Breakfast tortilla-on-the-side, whole
 * wheat linguine base, wheat-breaded proteins) live in the FAQ text.
 *
 * Source: Worker feed v10 (2026-08-04) ← FDA_Rounded_Export_for_INM
 * (89 items / 222 modifiers, dated 2026-07-27). Refresh when either changes.
 *
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 * @framerDisableUnlink
 */

interface DietItem {
    name: string
    category: string
    calories?: number
    protein?: number
    carbs?: number
    diets: string // comma list: e.g. "gluten-free, dairy-free"
    glp1?: boolean
}

// DIET_MAP mirrors MenuItemSchema.tsx so suitableForDiet URLs stay consistent
// site-wide — same schema.org vocabulary, same lowercase-hyphen keys.
const DIET_MAP: Record<string, string> = {
    vegan: "https://schema.org/VeganDiet",
    vegetarian: "https://schema.org/VegetarianDiet",
    "gluten-free": "https://schema.org/GlutenFreeDiet",
    "gluten free": "https://schema.org/GlutenFreeDiet",
    "low-lactose": "https://schema.org/LowLactoseDiet",
    "low lactose": "https://schema.org/LowLactoseDiet",
    "dairy-free": "https://schema.org/LowLactoseDiet",
    "dairy free": "https://schema.org/LowLactoseDiet",
}

// GENERATED from the Worker v10 feed by data/build_jsonld.cjs — the JSON-LD
// eligibility rules live there. Every diet claim is backed by a confirmed
// allergen row (see file header). Regenerate + updateCodeFile to change;
// never hand-edit here and never override on the canvas instance.
const DINERS_DEFAULT: DietItem[] = [
    { name: "Jerk Bowl", category: "Bowls", calories: 770, protein: 47, carbs: 96, diets: "gluten-free" },
    { name: "Fajita Bowl", category: "Bowls", calories: 710, protein: 43, carbs: 98, diets: "gluten-free" },
    { name: "High-Protein Bowl", category: "Bowls", calories: 380, protein: 62, carbs: 23, diets: "", glp1: true },
    { name: "Pesto Bowl", category: "Bowls", calories: 670, protein: 46, carbs: 71, diets: "gluten-free" },
    { name: "Poke Bowl", category: "Bowls", calories: 410, protein: 34, carbs: 38, diets: "", glp1: true },
    { name: "Power Bowl", category: "Bowls", calories: 680, protein: 42, carbs: 92, diets: "gluten-free" },
    { name: "Stir Fry Bowl", category: "Bowls", calories: 530, protein: 40, carbs: 83, diets: "", glp1: true },
    { name: "Sweet & Sour Bowl", category: "Bowls", calories: 560, protein: 35, carbs: 85, diets: "gluten-free, dairy-free", glp1: true },
    { name: "Teriyaki Bowl", category: "Bowls", calories: 650, protein: 41, carbs: 110, diets: "dairy-free", glp1: true },
    { name: "Thai Bowl", category: "Bowls", calories: 710, protein: 45, carbs: 97, diets: "gluten-free, dairy-free" },
    { name: "Mediterranean Bowl", category: "Bowls", calories: 900, protein: 44, carbs: 81, diets: "gluten-free" },
    { name: "Jerk Wrap", category: "Wraps", calories: 560, protein: 42, carbs: 50, diets: "", glp1: true },
    { name: "BBQ Wrap", category: "Wraps", calories: 410, protein: 33, carbs: 50, diets: "", glp1: true },
    { name: "Buffalo Wrap", category: "Wraps", calories: 320, protein: 34, carbs: 24, diets: "", glp1: true },
    { name: "Caesar Wrap", category: "Wraps", calories: 480, protein: 34, carbs: 26, diets: "", glp1: true },
    { name: "Mediterranean Wrap", category: "Wraps", calories: 530, protein: 38, carbs: 38, diets: "", glp1: true },
    { name: "Pesto Wrap", category: "Wraps", calories: 390, protein: 37, carbs: 27, diets: "", glp1: true },
    { name: "Teriyaki Wrap", category: "Wraps", calories: 400, protein: 34, carbs: 56, diets: "dairy-free", glp1: true },
    { name: "Thai Wrap", category: "Wraps", calories: 500, protein: 38, carbs: 43, diets: "dairy-free", glp1: true },
    { name: "Breakfast Bowl", category: "Breakfast", calories: 280, protein: 23, carbs: 1, diets: "vegetarian, gluten-free" },
    { name: "Breakfast Wrap", category: "Breakfast", calories: 280, protein: 23, carbs: 1, diets: "vegetarian" },
    { name: "Beans & Rice", category: "Sides", calories: 170, protein: 6, carbs: 29, diets: "vegetarian, gluten-free" },
    { name: "Carrots", category: "Sides", calories: 80, carbs: 9, diets: "vegan, vegetarian, gluten-free, dairy-free" },
    { name: "Chips", category: "Sides", calories: 180, protein: 2, carbs: 18, diets: "vegan, vegetarian, dairy-free" },
    { name: "Carrots & Ranch", category: "Sides", calories: 100, protein: 3, carbs: 12, diets: "" },
    { name: "Power Wrap", category: "Wraps", calories: 430, protein: 36, carbs: 39, diets: "", glp1: true },
    { name: "Chicken Tex Mex Egg Roll", category: "Starters", calories: 270, protein: 9, carbs: 21, diets: "" },
    { name: "BBQ Quesadilla", category: "Starters", calories: 690, protein: 50, carbs: 70, diets: "" },
    { name: "Roasted Cauliflower", category: "Starters", calories: 570, protein: 8, carbs: 19, diets: "vegetarian, gluten-free" },
    { name: "GF Quinoa Falafel", category: "Starters", calories: 390, protein: 12, carbs: 37, diets: "vegetarian, gluten-free" },
    { name: "Garlic Ginger Edamame", category: "Starters", calories: 340, protein: 25, carbs: 24, diets: "vegan, vegetarian, gluten-free, dairy-free", glp1: true },
    { name: "Salt & Lime Edamame", category: "Starters", calories: 240, protein: 20, carbs: 24, diets: "vegan, vegetarian, gluten-free, dairy-free" },
    { name: "Teriyaki Edamame", category: "Starters", calories: 390, protein: 22, carbs: 56, diets: "vegan, vegetarian, dairy-free" },
    { name: "Spicy Edamame", category: "Starters", calories: 250, protein: 21, carbs: 22, diets: "vegan, vegetarian, gluten-free, dairy-free" },
    { name: "Crispy Chicken Bites", category: "Starters", calories: 440, protein: 44, carbs: 11, diets: "", glp1: true },
    { name: "Original Crispy Treat", category: "Desserts", calories: 370, protein: 5, carbs: 83, diets: "" },
    { name: "Chocolate Crispy Treat", category: "Desserts", calories: 380, protein: 3, carbs: 85, diets: "" },
    { name: "Kid's Crunchy Chicken Meal", category: "Kids", calories: 310, protein: 30, carbs: 8, diets: "", glp1: true },
    { name: "Kid's Cheese Quesadilla", category: "Kids", calories: 370, protein: 15, carbs: 47, diets: "vegetarian" },
    { name: "Vegetable Wontons", category: "Starters", calories: 340, protein: 7, carbs: 41, diets: "vegan, vegetarian, dairy-free" },
    { name: "Broccoli with Olive Oil & Herb", category: "Sides", calories: 210, protein: 2, carbs: 5, diets: "vegan, vegetarian, gluten-free, dairy-free" },
    { name: "Mixed Veggies", category: "Sides", calories: 50, protein: 3, carbs: 12, diets: "vegan, vegetarian, gluten-free, dairy-free" },
    { name: "Spicy Slaw", category: "Sides", calories: 110, protein: 2, carbs: 12, diets: "vegetarian, gluten-free, dairy-free" },
    { name: "Healthy Burrito", category: "Breakfast", calories: 270, protein: 21, carbs: 11, diets: "vegetarian, dairy-free" },
    { name: "Kids Broccoli & Chicken Bowl", category: "Kids", calories: 450, protein: 34, carbs: 67, diets: "", glp1: true },
    { name: "Kids Chicken Teriyaki Wrap", category: "Kids", calories: 590, protein: 39, carbs: 89, diets: "", glp1: true },
    { name: "Lobster Rangoon", category: "Starters", calories: 500, protein: 12, carbs: 73, diets: "" },
    { name: "Multigrain Quinoa Salad", category: "Salads", calories: 870, protein: 19, carbs: 65, diets: "vegetarian, gluten-free" },
    { name: "Santa Fe Salad", category: "Salads", calories: 260, protein: 9, carbs: 27, diets: "vegetarian" },
    { name: "Kale & Quinoa Salad", category: "Salads", calories: 730, protein: 15, carbs: 50, diets: "vegetarian, gluten-free" },
]

function csvToDiets(csv: string): string[] {
    if (!csv) return []
    return Array.from(
        new Set(
            csv
                .split(",")
                .map((s) => s.trim().toLowerCase())
                .filter(Boolean)
                .map((s) => DIET_MAP[s])
                .filter(Boolean)
        )
    )
}

interface FaqItem {
    question?: string
    answer?: string
}

const FAQ_DEFAULTS: FaqItem[] = [
    {
        question: "Does Crazy Bowls & Wraps have gluten-free options?",
        answer: "Yes — 21 items on our menu are made without gluten-containing ingredients according to our official allergen analysis: Banana, Beans & Rice, Breakfast Bowl, Broccoli with Olive Oil & Herb, Carrots, Fajita Bowl, GF Quinoa Falafel, Garlic Ginger Edamame, Jerk Bowl, Kale & Quinoa Salad, Mediterranean Bowl, Mixed Veggies, Multigrain Quinoa Salad, Pesto Bowl, Power Bowl, Roasted Cauliflower, Salt & Lime Edamame, Spicy Edamame, Spicy Slaw, Sweet & Sour Bowl and Thai Bowl. The Kale & Quinoa Salad and Multigrain Quinoa Salad come with a gluten-free tahini vinaigrette, but they are served with a warm tortilla or tortilla chips, which contain wheat — ask for yours without. 8 of our 9 wrap flavors (BBQ, Buffalo, Caesar, Jerk, Mediterranean, Pesto, Power and Thai) can also be ordered as a Lettuce Wrap instead of a tortilla; Teriyaki is the one exception, because its teriyaki sauce contains wheat even without the tortilla. Bowls come on your choice of base, and every base is made without gluten-containing ingredients except the whole wheat linguine (wheat, eggs) — and if you're avoiding gluten, skip crispy chicken and breaded plant based chicken, which are breaded with wheat. The Fajita Bowl's warm tortilla or chips and the Breakfast Bowl's side tortilla contain wheat, so ask for those without. Because we cook in a shared kitchen we can't guarantee any item is free from gluten cross-contact, so we don't label items certified gluten-free — if you have celiac disease, please talk to our staff before ordering.",
    },
    {
        question: "Does Crazy Bowls & Wraps have a gluten-free tortilla or wrap?",
        answer: "No — our Flour, Tomato and Whole Wheat tortillas all contain wheat, so there is no gluten-free tortilla. For a wrap without gluten-containing ingredients, order any flavor except Teriyaki as a Lettuce Wrap, which uses romaine leaves instead of a tortilla.",
    },
    {
        question: "What dairy-free options does Crazy Bowls & Wraps have?",
        answer: "17 items on our menu contain no milk according to our official allergen analysis: Banana, Broccoli with Olive Oil & Herb, Carrots, Chips, Garlic Ginger Edamame, Healthy Burrito, Mixed Veggies, Salt & Lime Edamame, Spicy Edamame, Spicy Slaw, Sweet & Sour Bowl, Teriyaki Bowl, Teriyaki Edamame, Teriyaki Wrap, Thai Bowl, Thai Wrap and Vegetable Wontons. We cook in a shared kitchen, so we can't guarantee any item is free from dairy cross-contact — ask our staff if it matters for you.",
    },
    {
        question: "Is there a vegan menu at Crazy Bowls & Wraps?",
        answer: "We don't have a separate vegan menu, but there is plenty that is vegan as it comes: Banana, Broccoli with Olive Oil & Herb, Carrots, Chips, Garlic Ginger Edamame, Mixed Veggies, Salt & Lime Edamame, Spicy Edamame, Teriyaki Edamame and Vegetable Wontons. Any item on our menu can also be ordered without the grilled chicken it is built with by default — or with a plant protein instead: we offer Tofu (200 cal, 17g protein) and Plant Based Chicken (130 cal, 20g protein) as swaps for the grilled chicken (140 cal, 28g protein). Ordered that way these contain no animal ingredients: High-Protein Bowl, Stir Fry Bowl, Sweet & Sour Bowl, Teriyaki Bowl and Teriyaki Wrap. On the Stir Fry and High-Protein Bowls, also choose your sauce with care — the Thai peanut sauce contains honey and the pesto contains milk and eggs; teriyaki and sweet & sour are plant-based. The calorie and protein figures shown are measured with the grilled chicken in. Because we cook in a shared kitchen we can't guarantee any item is free from cross-contact with animal products.",
    },
    {
        question: "Can I make a Crazy Bowls & Wraps bowl vegan?",
        answer: "Yes. Every composed bowl is built with grilled chicken by default, and you can ask for it without. You can also swap in Tofu or Plant Based Chicken instead of leaving the protein out. Ordered that way, High-Protein Bowl, Stir Fry Bowl, Sweet & Sour Bowl and Teriyaki Bowl contain no animal ingredients — on the Stir Fry and High-Protein Bowls, pick a plant-based sauce too (teriyaki or sweet & sour; the Thai sauce contains honey and the pesto contains milk and eggs). Fajita Bowl, Jerk Bowl, Mediterranean Bowl, Pesto Bowl, Power Bowl and Thai Bowl become vegetarian rather than vegan without the chicken, because they still contain dairy or honey — the Fajita and Power Bowls have cheese, the Thai Bowl has honey, and the Mediterranean, Pesto and Jerk Bowls have dairy in their sauces. Nutrition shown for all of these is measured with the chicken included.",
    },
    {
        question: "What are the best high-protein, lower-calorie options at Crazy Bowls & Wraps — good for GLP-1 or weight-management diets?",
        answer: "Our High-Protein Bowl has 62g of protein at 380 calories, the highest protein-to-calorie ratio on the menu. Other protein-forward, portion-conscious picks under 650 calories include the Buffalo Bowl, Caesar Bowl, Poke Bowl and BBQ Bowl (all 33g+ protein), most of our Wraps, the Crispy Chicken Bites starter, and Garlic Ginger Edamame at 25g protein. These are macro-based picks, not medical advice — if you're managing your diet around a GLP-1 medication or another weight-management plan, check with your doctor or dietitian about what fits your needs.",
    },
    {
        question: "Are the nutrition values in the Crazy Bowls & Wraps Nutrition Calculator accurate?",
        answer: "Values come from our official nutrition analysis and are estimated on our standard serving portions, so expect about 10% variance depending on how an item is prepared that day. Every bowl and wrap is shown as served with brown rice and grilled chicken — changing the protein, base, sauce or tortilla changes the numbers. Allergen information reflects ingredients on file; because we prepare food in a shared kitchen we can't guarantee any item is completely free of a given allergen. Please tell our staff about any allergy before ordering.",
    },
]

export default function NutritionCalculatorSchema(props: any) {
    const { baseUrl = "https://www.crazybowlsandwraps.com" } = props as { baseUrl: string }

    // diners/faqs props are DELIBERATELY IGNORED. The canvas instance on
    // /nutrition-calculator carries stale pre-Phase-0 prop overrides (false
    // VeganDiet claims on chicken items) that the page XML API cannot read or
    // clear, so the only safe source is the generated defaults above.
    const diners = DINERS_DEFAULT
    const faqs = FAQ_DEFAULTS

    const items = (Array.isArray(diners) ? diners : []).filter((d) => d && d.name)

    const menuItems = items.map((d) => {
        const nutrition: any = { "@type": "NutritionInformation" }
        if (Number(d.calories) > 0) nutrition.calories = `${Number(d.calories)} calories`
        if (Number(d.protein) > 0) nutrition.proteinContent = `${Number(d.protein)} g`
        if (Number(d.carbs) > 0) nutrition.carbohydrateContent = `${Number(d.carbs)} g`
        const hasNutrition = Object.keys(nutrition).length > 1

        const menuItem: any = { "@type": "MenuItem", name: d.name }
        if (hasNutrition) menuItem.nutrition = nutrition
        const diets = csvToDiets(d.diets || "")
        if (diets.length) menuItem.suitableForDiet = diets
        return menuItem
    })

    const menu = {
        "@context": "https://schema.org",
        "@type": "Menu",
        name: "Crazy Bowls & Wraps Nutrition Calculator",
        url: `${String(baseUrl).replace(/\/$/, "")}/nutrition-calculator`,
        hasMenuItem: menuItems,
    }

    const pairs = (Array.isArray(faqs) ? faqs : []).filter((f) => f && f.question && f.answer)
    const graph: any[] = [menu]
    if (pairs.length) {
        graph.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: pairs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
        })
    }

    const json = JSON.stringify(graph.length === 1 ? graph[0] : graph)
    return <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: json }} />
}

addPropertyControls(NutritionCalculatorSchema, {
    baseUrl: { type: ControlType.String, title: "Base URL", defaultValue: "https://www.crazybowlsandwraps.com" },
})
