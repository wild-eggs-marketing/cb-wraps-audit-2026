// Corrections to the five salad CMS records, reconciled against the in-store menu
// board photographed 28 Jul 2026.
//
// The board is authoritative for anything customer-facing — names, prices, what
// arrives on the plate. The FDA/INM export stays authoritative for nutrition and
// allergens. Where they disagree on composition, the disagreement is recorded
// rather than silently resolved, because a composition change the lab row doesn't
// know about means the nutrition figure is stale.
//
// The board lists exactly three salads, matching the three the export marks
// Active=1 and the three the June crawl found live pages for. Three independent
// sources agreeing is why Fruit & Feta and Grilled Veggie stay drafts.

const CORRECTIONS = [
    {
        itemId: "oVcyBIXaR", slug: "kale-quinoa-salad",
        // Board and the June crawl page title both say "Kale & Quinoa Salad".
        // "Tossed Kale & Quinoa Salad" is the export's internal name.
        rename: { from: "Tossed Kale & Quinoa Salad", to: "Kale & Quinoa Salad" },
        price: 9.95,
        fields: {
            fIwxSF70L: "Kale & Quinoa Salad",
            i9pbPSUve: "Chopped kale, quinoa, feta cheese, sundried tomato, garbanzo beans, pepperoncini, red onion, kalamata olives, gluten-free tahini vinaigrette. Served with a warm tortilla or tortilla chips.",
            IFoMCHzs_: "Kale, quinoa, feta, garbanzo, pepperoncini, kalamata olives",
            GZnmQpwkD: "Chopped kale and quinoa with feta, sundried tomato, garbanzo beans, pepperoncini, red onion and kalamata olives, in a gluten-free tahini vinaigrette. Served with a warm tortilla or tortilla chips.",
            zG08650jR: "Is the Kale & Quinoa Salad gluten-free?",
            loB8_cYxl: "The salad itself is made without gluten-containing ingredients, and so is the tahini vinaigrette. It comes with a warm tortilla or tortilla chips, and both of those contain wheat — ask for it without them. We cook in a shared kitchen, so we can't guarantee any item is free from gluten cross-contact.",
            im_35WFB0: "Is it vegan?",
            lrC33foKY: "No. The feta and the yogurt in the tahini vinaigrette make it vegetarian rather than vegan.",
        },
    },
    {
        itemId: "L_iEdcq3C", slug: "multigrain-quinoa-salad",
        price: 9.50,
        fields: {
            // Board spells it "goma shio" (two words) and says "mixed greens"
            // where the export says "Romaine Lettuce, Spring Mix".
            i9pbPSUve: "Quinoa, brown rice, mixed greens, tomato, garbanzo beans, avocado, red onion, feta cheese, goma shio, gluten-free tahini vinaigrette. Served with a warm tortilla or tortilla chips.",
            IFoMCHzs_: "Quinoa, brown rice, mixed greens, garbanzo, avocado, feta",
            GZnmQpwkD: "Quinoa and brown rice over mixed greens with tomato, garbanzo beans, avocado, red onion, feta and goma shio, in a gluten-free tahini vinaigrette. Served with a warm tortilla or tortilla chips.",
            zG08650jR: "Is the Multigrain Quinoa Salad gluten-free?",
            loB8_cYxl: "The salad itself is made without gluten-containing ingredients, and so is the tahini vinaigrette. It comes with a warm tortilla or tortilla chips, and both of those contain wheat — ask for it without them. We cook in a shared kitchen, so we can't guarantee any item is free from gluten cross-contact.",
            im_35WFB0: "Is it vegan?",
            lrC33foKY: "No. The feta and the yogurt in the tahini vinaigrette make it vegetarian rather than vegan.",
        },
    },
    {
        itemId: "gT5FlsTET", slug: "santa-fe-salad",
        price: 9.50,
        fields: {
            // Avocado is on the board but absent from the export's ingredient
            // statement — see DISCREPANCIES below. Board wins for what we tell a
            // customer is in the bowl.
            i9pbPSUve: "Mixed greens, corn salsa, pico de gallo, tortilla strips, cheddar cheese, avocado, tomato ranch dressing. Served with a warm tortilla or tortilla chips.",
            IFoMCHzs_: "Mixed greens, corn salsa, pico, tortilla strips, cheddar, avocado",
            GZnmQpwkD: "Mixed greens with corn salsa, pico de gallo, tortilla strips, cheddar and avocado, in a tomato ranch dressing. Served with a warm tortilla or tortilla chips.",
            zG08650jR: "Is the Santa Fe Salad gluten-free?",
            loB8_cYxl: "No. The tortilla strips in the salad contain wheat, and it's served with a warm tortilla or tortilla chips, which also contain wheat. Ask for it without the strips and without the tortilla or chips and the rest is made without gluten-containing ingredients. We cook in a shared kitchen, so we can't guarantee any item is free from gluten cross-contact.",
            im_35WFB0: "Is the Santa Fe Salad vegetarian?",
            lrC33foKY: "Yes. It contains cheddar and a yogurt-based ranch dressing, so it's vegetarian but not vegan or dairy-free.",
        },
    },
]

// Unresolved conflicts between the board and the lab data. These need a human at
// CBW; none of them is safe for me to decide.
const DISCREPANCIES = [
    {
        item: "Santa Fe Salad",
        issue: "Avocado is on the menu board but is NOT in the export's ingredient statement.",
        why_it_matters: "If avocado was added after the lab analysis, the published 260 cal / 15 g fat understates the salad as served — avocado is calorie-dense. Either the export row predates a recipe change, or the board lists an optional add-on as standard.",
        action: "Confirm whether avocado is standard, and if so re-analyse. Do not treat 260 cal as final until then.",
    },
    {
        item: "Kale & Quinoa Salad, Multigrain Quinoa Salad",
        issue: "Both are tagged gluten-free, and both are 'served with warm tortilla or tortilla chips' — the export says CBW's tortilla chips contain wheat.",
        why_it_matters: "Same shape as the wrap-tortilla problem: the lab row covers the salad, not the accompaniment. Kept the gluten-free tag because the side is declinable, unlike a wrap's tortilla which is structural — but every surface now says to ask for it without.",
        action: "Confirm the accompaniment can be declined, and confirm whether the tortilla chips genuinely contain wheat (the export says Wheat=Y, which is unusual for corn chips and may itself be a data error worth correcting at source).",
    },
    {
        item: "Caesar Salad",
        issue: "Listed on both catering items in the CMS as a current choice, absent from the menu board and from the export entirely.",
        why_it_matters: "Either it is a catering-only salad with no lab data, or the catering copy is stale.",
        action: "Confirm whether Caesar Salad still exists.",
    },
    {
        item: "Fruit & Feta Salad",
        issue: "Active=0 in the export and absent from the board, but still listed as a Salad Box Lunch option in the CMS catering copy.",
        why_it_matters: "Customers can order something the menu says is discontinued.",
        action: "Either reactivate it or remove it from the catering copy. Left as a CMS draft meanwhile.",
    },
]

module.exports = { CORRECTIONS, DISCREPANCIES }

if (require.main === module) {
    console.log("CORRECTIONS TO APPLY\n" + "=".repeat(70))
    for (const c of CORRECTIONS) {
        console.log(`\n${c.slug}  (${c.itemId})`)
        if (c.rename) console.log(`  RENAME  "${c.rename.from}" -> "${c.rename.to}"`)
        console.log(`  PRICE   0 -> $${c.price.toFixed(2)}`)
        for (const [k, v] of Object.entries(c.fields)) {
            console.log(`  ${k}  ${String(v).slice(0, 100)}${String(v).length > 100 ? "…" : ""}`)
        }
    }
    console.log("\n\nUNRESOLVED DISCREPANCIES\n" + "=".repeat(70))
    for (const d of DISCREPANCIES) {
        console.log(`\n${d.item}`)
        console.log(`  issue:  ${d.issue}`)
        console.log(`  why:    ${d.why_it_matters}`)
        console.log(`  action: ${d.action}`)
    }
}
