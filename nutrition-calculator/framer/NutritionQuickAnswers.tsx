import { addPropertyControls, ControlType } from "framer"

/**
 * NutritionQuickAnswers
 * Plain-text, server-rendered answer blocks for gluten-free / dairy-free / vegan /
 * high-protein queries, placed above the interactive NutritionCalculator on
 * /nutrition-calculator. The calculator itself fetches its data client-side
 * (useEffect + fetch), so its item list, dietary tags, and macros never appear
 * in the page's initial HTML — this component exists specifically so Google and
 * AI answer engines have real, crawlable text to index on first paint.
 *
 * ANSWERS_DEFAULT IS GENERATED. Run `node data/build_quickanswers.cjs` to rebuild
 * it from the Worker feed; do not hand-edit it. It was hand-maintained until
 * 28 Jul 2026 and had drifted into claiming the Thai Bowl was vegan (it contains
 * honey) and that any flavor works as a gluten-free Lettuce Wrap (Teriyaki's sauce
 * contains wheat) — both already fixed in the calculator's filters at the time.
 * Text that restates data has to be generated from that data or it goes stale
 * silently, and this block is the only version of it a crawler ever sees.
 *
 * 2026-08-04: the `answers` prop is now DELIBERATELY IGNORED. The canvas
 * instance on /nutrition-calculator was found carrying the original
 * hand-written answers as a prop override — including both falsehoods above —
 * which silently beat every code update since July. The page XML API cannot
 * read or clear that override, so the generated defaults always render.
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
        body: "21 items on our menu are made without gluten-containing ingredients, according to our official allergen analysis: Banana, Beans & Rice, Breakfast Bowl, Broccoli with Olive Oil & Herb, Carrots, Fajita Bowl, GF Quinoa Falafel, Garlic Ginger Edamame, Jerk Bowl, Kale & Quinoa Salad, Mediterranean Bowl, Mixed Veggies, Multigrain Quinoa Salad, Pesto Bowl, Power Bowl, Roasted Cauliflower, Salt & Lime Edamame, Spicy Edamame, Spicy Slaw, Sweet & Sour Bowl and Thai Bowl. Eight of our nine wrap flavors — BBQ, Buffalo, Caesar, Jerk, Mediterranean, Pesto, Power and Thai — can be ordered as a Lettuce Wrap on romaine instead of a flour tortilla. Teriyaki is the one exception, because its teriyaki sauce contains wheat even without the tortilla. Our salads — and the Fajita Bowl — are served with a warm tortilla or tortilla chips, which contain wheat, so ask for yours without; the Breakfast Bowl's side tortilla is the same story. Bowls come on your choice of base, and every base is made without gluten-containing ingredients except the whole wheat linguine (wheat, eggs). If you're avoiding gluten, also skip crispy chicken and breaded plant based chicken — both are breaded with wheat; every other protein is wheat-free. We cook in a shared kitchen, so we can't guarantee any item is free from gluten cross-contact and we don't label anything certified gluten-free. If you have celiac disease, please talk to our staff before ordering.",
        examples: "Fajita Bowl, Jerk Bowl, Mediterranean Bowl, Pesto Bowl, Power Bowl",
    },
    {
        heading: "Dairy-Free",
        body: "17 items contain no milk according to our official allergen analysis: Banana, Broccoli with Olive Oil & Herb, Carrots, Chips, Garlic Ginger Edamame, Healthy Burrito, Mixed Veggies, Salt & Lime Edamame, Spicy Edamame, Spicy Slaw, Sweet & Sour Bowl, Teriyaki Bowl, Teriyaki Edamame, Teriyaki Wrap, Thai Bowl, Thai Wrap and Vegetable Wontons. We cook in a shared kitchen, so we can't guarantee any item is free from dairy cross-contact — ask our staff if it matters for you.",
        examples: "Sweet & Sour Bowl, Teriyaki Bowl, Thai Bowl, Teriyaki Wrap, Thai Wrap",
    },
    {
        heading: "Vegan & Vegetarian",
        body: "Vegan as it comes: Banana, Broccoli with Olive Oil & Herb, Carrots, Chips, Garlic Ginger Edamame, Mixed Veggies, Salt & Lime Edamame, Spicy Edamame, Teriyaki Edamame and Vegetable Wontons. Every item on our menu can also be ordered without the grilled chicken it's built with by default — or with a plant protein instead: Tofu (200 cal, 17g protein) or Plant Based Chicken (130 cal, 20g protein). Ordered that way High-Protein Bowl, Stir Fry Bowl, Sweet & Sour Bowl, Teriyaki Bowl and Teriyaki Wrap contain no animal ingredients — on the Stir Fry and High-Protein Bowls, also pick a plant-based sauce, since the Thai peanut sauce contains honey and the pesto contains milk and eggs. The calories and protein shown are measured with the grilled chicken in, so they'll be lower without it. 12 further items are vegetarian as served rather than vegan, including all three of our salads and the Power Bowl — it's built with beans and cheddar, no meat at all. Bowls with cheese, dairy sauces or honey — the Fajita Bowl, the Mediterranean, Pesto and Jerk Bowls, and the Thai Bowl — are vegetarian without the chicken rather than vegan.",
        examples: "High-Protein Bowl (without chicken), Stir Fry Bowl (without chicken), Sweet & Sour Bowl (without chicken), Banana, Garlic Ginger Edamame",
    },
    {
        heading: "High-Protein & GLP-1-Friendly",
        body: "The High-Protein Bowl leads the menu at 62g of protein for 380 calories. 24 items pair at least 25g of protein with 650 calories or fewer, which suits a protein-forward, portion-conscious way of eating: High-Protein Bowl (62g protein, 380 cal), Crispy Chicken Bites (44g protein, 440 cal), Jerk Wrap (42g protein, 560 cal), Teriyaki Bowl (41g protein, 650 cal) and Stir Fry Bowl (40g protein, 530 cal) among them. Where an item is built with grilled chicken by default, that protein figure includes it. These are macro-based picks, not medical advice — check with your doctor or dietitian about what fits a GLP-1 or weight-management plan.",
        examples: "High-Protein Bowl, Crispy Chicken Bites, Jerk Wrap, Teriyaki Bowl, Stir Fry Bowl",
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
        accent = "rgb(13, 79, 79)",
        ink = "rgb(28, 43, 28)",
        inkSoft = "rgba(28, 43, 28, 0.72)",
        tint = "rgb(234, 244, 244)",
    } = props

    const answers = ANSWERS_DEFAULT // see header: instance prop overrides are ignored
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
    accent: { type: ControlType.Color, title: "Accent", defaultValue: "rgb(13, 79, 79)" },
    ink: { type: ControlType.Color, title: "Ink", defaultValue: "rgb(28, 43, 28)" },
    inkSoft: { type: ControlType.Color, title: "Ink Soft", defaultValue: "rgba(28, 43, 28, 0.72)" },
    tint: { type: ControlType.Color, title: "Tint", defaultValue: "rgb(234, 244, 244)" },
})
