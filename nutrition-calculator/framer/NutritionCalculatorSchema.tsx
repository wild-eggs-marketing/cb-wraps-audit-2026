import { addPropertyControls, ControlType } from "framer"

/**
 * NutritionCalculatorSchema
 * JSON-LD for the /nutrition-calculator page — a Menu graph (hasMenuItem[] with
 * NutritionInformation + suitableForDiet) plus an FAQPage answering the diet
 * queries this page needs to rank for (gluten-free, dairy-free, vegan) and the
 * expansion queries (high-protein / GLP-1-friendly). Renders synchronously from
 * baked props (no fetch/useEffect) so crawlers and AI answer engines see this in
 * the initial HTML — the interactive NutritionCalculator component fetches its
 * live data client-side and is invisible to non-JS crawlers, so this component
 * is what actually carries the AEO/SEO signal for the page.
 *
 * IMPORTANT — data-safety note: `suitableForDiet` claims below are LIMITED to
 * items where the CMS "Allergens" field is non-blank (either an explicit "None"
 * or a real allergen list) and rules out the disqualifying allergen. Items whose
 * Allergens field is blank in the CMS are deliberately left OUT of gluten-free/
 * vegan/dairy-free claims here, even if the ingredient text alone looks safe —
 * an unconfirmed allergen field is not the same as a confirmed-safe item, and a
 * wrong "gluten-free" schema.org claim is a real health/liability risk, not just
 * an SEO one. This is stricter than the on-page interactive filter (which is
 * paired with a visible "estimates, ask staff to confirm" disclaimer) because a
 * bare structured-data claim travels further (rich snippets, AI citations) with
 * no surrounding caveat.
 *
 * Snapshot taken 2026-07-23 from the live "Menu" CMS collection (fEfKTjIH1).
 * The CMS's own "Dietary Tags" field (lentTZd7e) is 0% populated as of this
 * snapshot — once that field is filled in per item, swap this component to read
 * it directly instead of the baked `diners` prop below, and refresh this list
 * whenever menu items or their Allergens field change.
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

// Curated, high-confidence subset — every entry here has a non-blank Allergens
// field backing its diet claim (see file header). Not the full 98-item menu;
// expand via the `diners` property control as more items get Allergens filled in.
const DINERS_DEFAULT: DietItem[] = [
    { name: "Stir Fry Bowl", category: "Bowls", calories: 530, protein: 40, carbs: 83, diets: "vegan, vegetarian, gluten-free, low-lactose", glp1: true },
    { name: "Sweet & Sour Bowl", category: "Bowls", calories: 560, protein: 35, carbs: 85, diets: "vegan, vegetarian, gluten-free, low-lactose", glp1: true },
    { name: "Teriyaki Bowl", category: "Bowls", calories: 650, protein: 41, carbs: 110, diets: "vegan, vegetarian, low-lactose", glp1: true },
    { name: "Thai Bowl", category: "Bowls", calories: 710, protein: 45, carbs: 97, diets: "vegan, vegetarian, gluten-free, low-lactose" },
    { name: "High-Protein Bowl", category: "Bowls", calories: 380, protein: 62, carbs: 23, diets: "vegetarian, gluten-free, low-lactose", glp1: true },
    { name: "Jerk Bowl", category: "Bowls", calories: 770, protein: 47, carbs: 96, diets: "gluten-free" },
    { name: "Fajita Bowl", category: "Bowls", calories: 710, protein: 43, carbs: 98, diets: "vegetarian, gluten-free" },
    { name: "Poke Bowl", category: "Bowls", calories: 410, protein: 34, carbs: 38, diets: "gluten-free, low-lactose", glp1: true },
    { name: "Power Bowl", category: "Bowls", calories: 680, protein: 42, carbs: 92, diets: "vegetarian, gluten-free" },
    { name: "Mediterranean Bowl", category: "Bowls", calories: 900, protein: 44, carbs: 81, diets: "vegetarian, gluten-free" },
    { name: "BBQ Bowl", category: "Bowls", calories: 410, protein: 33, carbs: 50, diets: "vegetarian", glp1: true },
    { name: "Buffalo Bowl", category: "Bowls", calories: 320, protein: 34, carbs: 24, diets: "vegetarian", glp1: true },
    { name: "Caesar Bowl", category: "Bowls", calories: 480, protein: 34, carbs: 26, diets: "vegetarian", glp1: true },
    { name: "Pesto Bowl", category: "Bowls", calories: 670, protein: 46, carbs: 71, diets: "vegetarian, gluten-free" },
    { name: "Jerk Wrap", category: "Wraps", calories: 560, protein: 42, carbs: 50, diets: "", glp1: true },
    { name: "BBQ Wrap", category: "Wraps", calories: 410, protein: 33, carbs: 50, diets: "", glp1: true },
    { name: "Buffalo Wrap", category: "Wraps", calories: 320, protein: 34, carbs: 24, diets: "vegetarian", glp1: true },
    { name: "Mediterranean Wrap", category: "Wraps", calories: 530, protein: 38, carbs: 38, diets: "vegetarian", glp1: true },
    { name: "Power Wrap", category: "Wraps", calories: 430, protein: 36, carbs: 39, diets: "vegetarian", glp1: true },
    { name: "Crispy Chicken Bites", category: "Starters", calories: 440, protein: 44, carbs: 11, diets: "", glp1: true },
    { name: "Garlic Ginger Edamame", category: "Starters", calories: 340, protein: 25, carbs: 24, diets: "vegan, vegetarian, gluten-free, low-lactose", glp1: true },
    { name: "GF Quinoa Falafel", category: "Starters", calories: 390, protein: 12, carbs: 37, diets: "vegetarian, gluten-free" },
    { name: "Carrots", category: "Sides", calories: 80, protein: 1, carbs: 9, diets: "vegan, vegetarian, gluten-free, low-lactose" },
    { name: "Broccoli with Olive Oil & Herb", category: "Sides", calories: 210, protein: 2, carbs: 5, diets: "vegan, vegetarian, gluten-free, low-lactose" },
    { name: "Mixed Veggies", category: "Sides", calories: 50, protein: 3, carbs: 12, diets: "vegan, vegetarian, gluten-free, low-lactose" },
    { name: "Banana", category: "Breakfast", calories: 105, protein: 1, carbs: 27, diets: "vegan, vegetarian, gluten-free, low-lactose" },
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
        answer: "Yes. Several of our bowls — including the Stir Fry Bowl, Sweet & Sour Bowl, Poke Bowl, Fajita Bowl, Power Bowl, Mediterranean Bowl, Pesto Bowl, and High-Protein Bowl — are confirmed gluten-free, along with gluten-free starters like the GF Quinoa Falafel and Garlic Ginger Edamame. Any flavor can also be ordered as a Lettuce Wrap instead of a flour tortilla for a gluten-free wrap option. Use the Gluten-Free filter in our Nutrition Calculator to see the full, current list.",
    },
    {
        question: "What dairy-free options does Crazy Bowls & Wraps have?",
        answer: "We have several confirmed dairy-free bowls, including the Stir Fry Bowl, Sweet & Sour Bowl, Teriyaki Bowl, Poke Bowl, and Thai Bowl, plus dairy-free starters like Garlic Ginger, Salt & Lime, Teriyaki, and Spicy Edamame, and sides like Carrots, Broccoli, and Mixed Veggies. Use the Nutrition Calculator's dietary filters to check any specific item before ordering if you have a dairy allergy.",
    },
    {
        question: "Is there a vegan menu at Crazy Bowls & Wraps?",
        answer: "Yes. Vegan bowls include the Stir Fry Bowl, Sweet & Sour Bowl, Teriyaki Bowl, and Thai Bowl, plus vegan starters like Garlic Ginger Edamame and vegan sides including Carrots, Broccoli with Olive Oil & Herb, and Mixed Veggies. Filter by Vegan in our Nutrition Calculator to see current options and full nutrition info.",
    },
    {
        question: "What are the best high-protein, lower-calorie options at Crazy Bowls & Wraps — good for GLP-1 or weight-management diets?",
        answer: "Our High-Protein Bowl has 62g of protein at 380 calories, the highest protein-to-calorie ratio on the menu. Other protein-forward, portion-conscious picks under 650 calories include the Buffalo Bowl, Caesar Bowl, Poke Bowl, and BBQ Bowl (all 33g+ protein), plus most of our Wraps and the Crispy Chicken Bites starter. These are macro-based picks, not medical advice — if you're managing your diet around a GLP-1 medication or another weight-management plan, check with your doctor or dietitian about what fits your needs.",
    },
    {
        question: "Are the nutrition values in the Crazy Bowls & Wraps Nutrition Calculator accurate?",
        answer: "Values are estimated based on our standard serving portions and may vary by about 10% depending on how an item is prepared that day. Dietary tags (vegan, vegetarian, gluten-free, etc.) are based on ingredient and allergen data on file; because we use shared kitchen equipment, we can't guarantee any item is completely free of a given allergen. Please tell our staff about any allergy before ordering.",
    },
]

export default function NutritionCalculatorSchema(props: any) {
    const {
        diners = DINERS_DEFAULT,
        faqs = FAQ_DEFAULTS,
        baseUrl = "https://www.crazybowlsandwraps.com",
    } = props as { diners: DietItem[]; faqs: FaqItem[]; baseUrl: string }

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
    diners: {
        type: ControlType.Array,
        title: "Diet-Tagged Items",
        control: {
            type: ControlType.Object,
            controls: {
                name: { type: ControlType.String, title: "Name" },
                category: { type: ControlType.String, title: "Category" },
                calories: { type: ControlType.Number, title: "Calories", defaultValue: 0 },
                protein: { type: ControlType.Number, title: "Protein (g)", defaultValue: 0 },
                carbs: { type: ControlType.Number, title: "Carbs (g)", defaultValue: 0 },
                diets: { type: ControlType.String, title: "Diets", description: "Comma list: vegan, vegetarian, gluten-free, low-lactose" },
                glp1: { type: ControlType.Boolean, title: "GLP-1 Friendly", defaultValue: false },
            },
        },
        defaultValue: DINERS_DEFAULT,
    },
    faqs: {
        type: ControlType.Array,
        title: "FAQs",
        control: {
            type: ControlType.Object,
            controls: {
                question: { type: ControlType.String, title: "Question" },
                answer: { type: ControlType.String, title: "Answer" },
            },
        },
        defaultValue: FAQ_DEFAULTS,
    },
    baseUrl: { type: ControlType.String, title: "Base URL", defaultValue: "https://www.crazybowlsandwraps.com" },
})
