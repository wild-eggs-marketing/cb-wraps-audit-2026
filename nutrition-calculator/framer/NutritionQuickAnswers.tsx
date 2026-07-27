import { addPropertyControls, ControlType } from "framer"

/**
 * NutritionQuickAnswers
 * Plain-text, server-rendered answer blocks for gluten-free / dairy-free / vegan /
 * high-protein queries, placed above the interactive NutritionCalculator on
 * /nutrition-calculator. The calculator itself fetches its data client-side
 * (useEffect + fetch), so its item list, dietary tags, and macros never appear
 * in the page's initial HTML — this component exists specifically so Google and
 * AI answer engines have real, crawlable text to index on first paint, matching
 * the item data curated in NutritionCalculatorSchema.tsx (keep the two in sync).
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */

interface Answer {
    heading: string
    body: string
    examples: string // comma list
}

const ANSWERS_DEFAULT: Answer[] = [
    {
        heading: "Gluten-Free",
        body: "Several bowls are confirmed gluten-free, including the Stir Fry Bowl, Sweet & Sour Bowl, Poke Bowl, Fajita Bowl, Power Bowl, Mediterranean Bowl, Pesto Bowl, and High-Protein Bowl, plus the GF Quinoa Falafel and Garlic Ginger Edamame starters. Any flavor can be ordered as a Lettuce Wrap instead of a flour tortilla for a gluten-free wrap.",
        examples: "Stir Fry Bowl, Sweet & Sour Bowl, Poke Bowl, High-Protein Bowl, GF Quinoa Falafel",
    },
    {
        heading: "Dairy-Free",
        body: "Confirmed dairy-free bowls include the Stir Fry Bowl, Sweet & Sour Bowl, Teriyaki Bowl, Poke Bowl, and Thai Bowl, along with dairy-free edamame starters and vegetable sides.",
        examples: "Stir Fry Bowl, Teriyaki Bowl, Poke Bowl, Thai Bowl, Garlic Ginger Edamame",
    },
    {
        heading: "Vegan",
        body: "Vegan bowls include the Stir Fry Bowl, Sweet & Sour Bowl, Teriyaki Bowl, and Thai Bowl, plus vegan sides like Carrots, Broccoli with Olive Oil & Herb, and Mixed Veggies.",
        examples: "Stir Fry Bowl, Sweet & Sour Bowl, Teriyaki Bowl, Thai Bowl, Mixed Veggies",
    },
    {
        heading: "High-Protein & GLP-1-Friendly",
        body: "The High-Protein Bowl leads the menu at 62g of protein for 380 calories. Other protein-forward, portion-conscious picks under 650 calories include the Buffalo Bowl, Caesar Bowl, BBQ Bowl, and most Wraps. These are macro-based picks, not medical advice — check with your doctor or dietitian about what fits a GLP-1 or weight-management plan.",
        examples: "High-Protein Bowl, Buffalo Bowl, Caesar Bowl, BBQ Bowl, Crispy Chicken Bites",
    },
]

export default function NutritionQuickAnswers(props: {
    answers?: Answer[]
    accent?: string
    ink?: string
    inkSoft?: string
    tint?: string
}) {
    const {
        answers = ANSWERS_DEFAULT,
        accent = "rgb(13, 79, 79)",
        ink = "rgb(28, 43, 28)",
        inkSoft = "rgba(28, 43, 28, 0.72)",
        tint = "rgb(234, 244, 244)",
    } = props

    const list = (Array.isArray(answers) ? answers : []).filter((a) => a && a.heading && a.body)
    if (!list.length) return null

    return (
        <section
            aria-label="Dietary quick answers"
            style={{
                fontFamily: "Bricolage Grotesque, sans-serif",
                background: "rgb(255, 255, 255)",
                padding: "32px 32px 8px",
                maxWidth: 1360,
                margin: "0 auto",
                width: "100%",
                boxSizing: "border-box",
            }}
        >
            <h2
                style={{
                    fontFamily: "Passion One, sans-serif",
                    fontWeight: 400,
                    fontSize: 26,
                    color: accent,
                    margin: "0 0 14px",
                }}
            >
                Gluten-Free, Dairy-Free & Vegan Menu — Quick Answers
            </h2>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 16,
                }}
            >
                {list.map((a) => {
                    const examples = (a.examples || "")
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    return (
                        <div
                            key={a.heading}
                            style={{
                                background: tint,
                                borderRadius: 16,
                                padding: "16px 18px",
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: 15,
                                    fontWeight: 800,
                                    color: accent,
                                    margin: "0 0 6px",
                                }}
                            >
                                {a.heading}
                            </h3>
                            <p
                                style={{
                                    fontSize: 13,
                                    color: ink,
                                    lineHeight: 1.6,
                                    margin: "0 0 10px",
                                }}
                            >
                                {a.body}
                            </p>
                            {examples.length > 0 && (
                                <ul
                                    style={{
                                        margin: 0,
                                        padding: 0,
                                        listStyle: "none",
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 6,
                                    }}
                                >
                                    {examples.map((ex) => (
                                        <li
                                            key={ex}
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                color: accent,
                                                background: "rgb(255, 255, 255)",
                                                borderRadius: 999,
                                                padding: "4px 10px",
                                            }}
                                        >
                                            {ex}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )
                })}
            </div>
            <p style={{ fontSize: 11, color: inkSoft, lineHeight: 1.6, margin: "14px 0 0", maxWidth: 720 }}>
                Filter the full menu by diet, allergen, and goal below. Values are estimates — see the nutrition
                disclaimer for details, and please tell our staff about any allergy before ordering.
            </p>
        </section>
    )
}

addPropertyControls(NutritionQuickAnswers, {
    answers: {
        type: ControlType.Array,
        title: "Answers",
        control: {
            type: ControlType.Object,
            controls: {
                heading: { type: ControlType.String, title: "Heading" },
                body: { type: ControlType.String, title: "Body" },
                examples: { type: ControlType.String, title: "Examples", description: "Comma list of item names" },
            },
        },
        defaultValue: ANSWERS_DEFAULT,
    },
    accent: { type: ControlType.Color, title: "Accent", defaultValue: "rgb(13, 79, 79)" },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "rgb(28, 43, 28)" },
    inkSoft: { type: ControlType.Color, title: "Ink Soft", defaultValue: "rgba(28, 43, 28, 0.72)" },
    tint: { type: ControlType.Color, title: "Tint", defaultValue: "rgb(234, 244, 244)" },
})
