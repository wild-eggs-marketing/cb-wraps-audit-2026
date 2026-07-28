import { addPropertyControls, ControlType } from "framer"
import { useState, useMemo, useEffect, useRef, useDeferredValue, useReducer, useCallback, memo } from "react"

// ── 1. Constants ──────────────────────────────────────────────────────────────

// Build marker, rendered in the disclaimer block at the bottom of the page.
// BUMP THIS ON EVERY PUSH. It exists so "did the change go live?" is answered by
// reading one string off the page, instead of counting filter results and inferring
// which code path produced them — two pushes were published stale before this existed.
const BUILD = "2026-07-27-07"

const MOBILE_BP   = 680
const MAX_TRAY    = 3
const LS_KEYS     = { goal: "cbw_goal", sort: "cbw_sort", item: "cbw_last_item" } as const
const SS_KEY_TRAY = "cbw_tray"
const SS_KEY_SEEN = "cbw_compare_seen"

const FIELD = {
    title:       "fIwxSF70L",
    calories:    "Du4yxFxRV",
    protein:     "mD5e0_FmL",
    carbs:       "RxAestyVQ",
    category:    "pSTF6eHFu",
    price:       "cXFi6mhII",
    ingredients: "i9pbPSUve",
    shortIngr:   "IFoMCHzs_",
    description: "GZnmQpwkD",
    thumbnail:   "o5P7Ztu2L",
    allergens:   "ivojcMHVr",
    dietaryTags: "lentTZd7e",
} as const

// ── 2. Design tokens ──────────────────────────────────────────────────────────

const C = {
    orange:      "rgb(252, 97, 45)",
    orangeDark:  "rgb(200, 66, 18)",   // AA-compliant orange for text on white / white text on it
    orangeLight: "rgba(252, 97, 45, 0.10)",
    yellow:      "rgb(246, 192, 52)",
    amber:       "rgb(158, 121, 0)",   // AA-compliant stand-in for yellow when used as text on white
    green:       "rgb(123, 144, 21)",
    greenDark:   "rgb(90, 106, 15)",   // AA-compliant green for text on white / white text on it
    greenLight:  "rgba(123, 144, 21, 0.12)",
    teal:        "rgb(13, 79, 79)",
    tealLight:   "rgba(13, 79, 79, 0.08)",
    tint:        "rgb(234, 244, 244)",   // site-wide light-teal surface (LocationsGrid, LocationLauncher)
    lime:        "rgb(163, 191, 30)",    // brand lime accent (open-dots, focus rings)
    shadow:      "0 2px 12px -8px rgba(13, 79, 79, 0.22)",  // site-wide teal-tinted soft shadow
    line:        "rgba(13, 79, 79, 0.30)",  // visible input/control border on white (tint is too faint for affordance)
    cream:       "rgb(245, 238, 227)",
    white:       "rgb(255, 255, 255)",
    ink:         "rgb(28, 43, 28)",
    inkSoft:     "rgba(28, 43, 28, 0.65)",  // AA-compliant secondary text on white
    inkGhost:    "rgba(28, 43, 28, 0.07)",
    border:      "rgba(28, 43, 28, 0.09)",
    // Bowl-Off re-skin tokens (brand palette) — distinct from the tokens above,
    // which remain in place for the rest of the component.
    creamBg:     "rgb(255, 242, 230)",   // tray background
    brandGreen:  "rgb(18, 58, 20)",      // tray border / headline ink
    dragonfruit: "rgb(218, 45, 101)",    // "Most protein" badge
    apricot:     "rgb(242, 119, 78)",
}

// ── 3. Styles — injected once per page load ───────────────────────────────────

let _stylesInjected = false
function injectStyles() {
    if (_stylesInjected || typeof document === "undefined") return
    _stylesInjected = true
    const s = document.createElement("style")
    s.dataset.cbw = "1"
    s.textContent = `@keyframes cbwPulse{0%,100%{opacity:1}50%{opacity:0.45}}@keyframes cbwFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes cbwSheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}[data-cbw-root] input::placeholder{color:rgba(13,79,79,0.70)}[data-cbw-root] button:focus-visible,[data-cbw-root] a:focus-visible,[data-cbw-root] [role="button"]:focus-visible{outline:3px solid rgb(163,191,30);outline-offset:2px}[data-cbw-root] .cbw-nc-card:hover{box-shadow:0 10px 28px -14px rgba(13,79,79,0.35)!important}@media (prefers-reduced-motion: reduce){[data-cbw-root] *{animation:none!important;transition:none!important}}`
    document.head.appendChild(s)
}

// ── 4. Types ──────────────────────────────────────────────────────────────────

interface MenuItem {
    id:          string
    title:       string
    calories:    number
    protein:     number
    carbs:       number
    fat:         number
    category:    string
    price:       number
    ingredients: string
    shortIngr:   string
    description: string
    thumbnail:   string
    allergens:   string
    // Comma list authored in the CMS (e.g. "vegan, gluten-free"). When non-empty
    // for a given item, this is treated as authoritative and overrides the
    // ingredient/allergen heuristic below for that item's Vegetarian/Vegan/
    // Gluten-Free/Dairy-Free tags — a human-entered fact beats a keyword guess.
    dietaryTags: string
    // Provenance of this item's nutrition/allergen data, from the feed:
    // "verified" | "verified-alias" | "unverified-legacy" | "no-data" | "phantom-unconfirmed".
    // Anything other than the two verified values means the numbers have NOT been
    // reconciled against the official nutrition analysis, and the UI says so rather
    // than presenting them with the same authority as verified items.
    dataConfidence?: string
    // Set by the feed when Wheat was added because the item is served in a wheat
    // tortilla that the source nutrition row omits (its rows are filling-only).
    wheatFromTortilla?: boolean
    // Caveat attached to a conditional diet tag — e.g. an item that is only vegan
    // when ordered without its default grilled chicken. Shown wherever the diet
    // claim is shown, never separated from it.
    dietNote?: string
    // Caveat about the allergen list itself, for items where one CMS record covers
    // several builds and the list is a union across them.
    allergenNote?: string
    // True when the CMS stores floor values ("from 150", "150+") for a variant
    // family — macros display as minimums ("150+ cal") and the item is excluded
    // from calorie-ceiling filters, combined totals, and budget math.
    variable?:   boolean
}

// The FDA "Big 9" in the order the feed emits them, for stable display.
const BIG9 = ["Milk", "Eggs", "Fish", "Shellfish", "Tree Nuts", "Peanuts", "Wheat", "Soy", "Sesame"] as const

// Splits the feed's allergen string into display tokens. Returns:
//   { state: "none" }        -> item is confirmed to contain no Big-9 allergen
//   { state: "list", list }  -> item contains these allergens
//   { state: "unknown" }     -> no allergen declaration on file for this item
// "unknown" is rendered as an explicit "ask our staff" prompt, never as "none" —
// absence of data is not evidence of absence of the allergen.
function readAllergens(i: MenuItem): { state: "none" | "list" | "unknown"; list: string[] } {
    const raw = (i.allergens || "").trim()
    if (!raw || raw.toLowerCase() === "unconfirmed") return { state: "unknown", list: [] }
    if (raw.toLowerCase() === "none") return { state: "none", list: [] }
    const found = raw.split(",").map(s => s.trim()).filter(Boolean)
    // Preserve Big-9 order, then append anything unrecognised so nothing is dropped.
    const ordered = [
        ...BIG9.filter(a => found.some(f => f.toLowerCase() === a.toLowerCase())),
        ...found.filter(f => !BIG9.some(a => a.toLowerCase() === f.toLowerCase())),
    ]
    return { state: ordered.length ? "list" : "unknown", list: ordered }
}

interface GoalDef {
    id:           string
    label:        string
    sub:          string
    accent:       string
    accentText?:  string   // text color on the accent fill; defaults to white
    minProtein?:  number
    maxCalories?: number
    minCarbs?:    number
}

interface FilterState {
    goal:     string
    category: string
    dietary:  string[]
    search:   string
    sortBy:   string
}

interface TrayState { items: string[]; open: boolean }
type TrayAction = { type: "TOGGLE"; id: string } | { type: "TOGGLE_OPEN" } | { type: "CLEAR" }
type FetchState  = "idle" | "loading" | "success" | "error"

interface ScaledMacros {
    protein:        number
    carbs:          number
    fat:            number
    calories:       number
    proteinDensity: number
}

// ── 5. Domain constants ───────────────────────────────────────────────────────

// Real per-item Small-bowl macros from the official Nutrition Facts PDF (12 pages,
// last updated 06/17/2024) — replaces an earlier 0.67 ratio approximation that
// applied uniformly to every bowl regardless of its real Small-size values.
// Only bowls with a confirmed "- Small" line in that source are listed here.
// Two bowls (Poke Bowl, High-Protein Bowl) have no Small line at all in the PDF —
// single size only — so they're deliberately absent, not missing data.
// BBQ Bowl, Buffalo Bowl, and Caesar Bowl are also absent: the PDF's "Bowls"
// section doesn't include them at all, and their current CMS macros are
// identical to the Wrap version of the same flavor (e.g. CMS "BBQ Bowl" matches
// PDF "BBQ Wrap" exactly), which looks like a placeholder rather than a real
// Bowl-size measurement — needs confirmation before a Small size is invented.
const SMALL_BOWL_MACROS: Record<string, { calories: number; protein: number; carbs: number }> = {
    "Fajita Bowl":       { calories: 480, protein: 37, carbs: 59 },
    "Jerk Bowl":         { calories: 600, protein: 42, carbs: 61 },
    "Mediterranean Bowl":{ calories: 570, protein: 37, carbs: 50 },
    "Pesto Bowl":        { calories: 470, protein: 39, carbs: 46 },
    "Power Bowl":        { calories: 470, protein: 37, carbs: 56 },
    "Stir Fry Bowl":     { calories: 380, protein: 35, carbs: 51 },
    "Sweet & Sour Bowl": { calories: 410, protein: 33, carbs: 55 },
    "Teriyaki Bowl":     { calories: 460, protein: 36, carbs: 69 },
    "Thai Bowl":         { calories: 500, protein: 38, carbs: 61 },
}
const BOWL_PORTIONS: { val: number; label: string }[] = [
    { val: 0.67, label: "Small" }, { val: 1, label: "Regular" },
]
// Only offers a size choice when real Small-size macros exist for this exact item —
// no size selector at all beats showing a fabricated number (see comment above).
const portionOptionsFor = (item: MenuItem): { val: number; label: string }[] | null =>
    item.category === "Bowls" && SMALL_BOWL_MACROS[item.title] ? BOWL_PORTIONS : null

const GOALS: GoalDef[] = [
    // "all" uses teal — the goal bar is white, so the brand teal fill reads as the primary state
    { id: "all",   label: "Browse All",    sub: "Full menu",     accent: C.teal, accentText: C.white },
    // accentText is dark ink on every colored fill — white fails WCAG AA on orange (3.0:1),
    // green (3.6:1), and yellow (1.6:1); ink passes 4.5:1+ on all three.
    { id: "power", label: "Power Up",      sub: "30g+ protein",  accent: C.orange, accentText: C.ink, minProtein: 30 },
    { id: "light", label: "Keep It Light", sub: "Under 500 cal", accent: C.green,  accentText: C.ink, maxCalories: 500 },
    { id: "fuel",  label: "Fuel the Day",  sub: "Carb-forward",  accent: C.yellow, accentText: C.ink, minCarbs: 50 },
]

// Allergen predicates read the feed's per-item allergen data ONLY. The previous
// implementation also scanned marketing prose (title + ingredients + shortIngr) for
// keywords like "flour" or "tortilla"; that scan has been removed, because it was
// wrong in both directions once real Big-9 allergen data arrived:
//   - FALSE POSITIVES: a wrap's prose never names its tortilla (it lives in the
//     description field, which was never scanned), so wheat-tortilla wraps passed
//     the Gluten-Free filter.
//   - FALSE NEGATIVES: the Lettuce Wraps' own copy reads "instead of a tortilla,
//     served with chips", so the scan matched "tortilla" and "chips" and excluded
//     the one wrap format that IS made without gluten-containing ingredients.
// Prose is marketing copy, not an allergen declaration. The feed now carries
// verified Big-9 flags per item, so that is the only thing consulted here.
const hasAllergen = (i: MenuItem, words: string[]): boolean => {
    const hay = (i.allergens || "").toLowerCase()
    if (!hay) return false
    return words.some(w => hay.includes(w))
}

// True only when this item actually has an allergen declaration to reason about.
// An item with no allergen data must never pass an allergen-based filter: absence of
// data is not evidence of absence of the allergen. This is what keeps the ~22 items
// still awaiting lab analysis out of the Gluten-Free and Dairy-Free results instead
// of silently defaulting to "safe".
const hasAllergenData = (i: MenuItem): boolean => {
    const a = (i.allergens || "").trim().toLowerCase()
    return a !== "" && a !== "unconfirmed"
}

// Parses the CMS "Dietary Tags" field into a lowercase token set. Accepts both
// hyphenated and spaced forms ("gluten-free" / "gluten free") so authors don't
// need to remember an exact spelling convention.
const cmsDietTags = (i: MenuItem): Set<string> =>
    new Set((i.dietaryTags || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean))

// A CMS-authored tag, once present for an item, is authoritative for that diet —
// it overrides the ingredient/allergen heuristic entirely rather than blending
// with it, since a human confirming "yes/no" beats a keyword guess either way.
const dietFromCms = (i: MenuItem, ...aliases: string[]): boolean | null => {
    if (!i.dietaryTags) return null
    const tags = cmsDietTags(i)
    return aliases.some(a => tags.has(a))
}

// True when the item's vegan/vegetarian claim is conditional on leaving out the
// default protein. Used to decide whether the caveat must be shown alongside the
// claim — a conditional claim shown without its condition is just a wrong claim.
const isConditionalDiet = (i: MenuItem): boolean => {
    const tags = cmsDietTags(i)
    return tags.has("vegan-without-chicken") || tags.has("vegetarian-without-chicken")
}

// The caveat text to show next to a conditional claim. Prefers the feed's own
// wording so it can be corrected without a code deploy.
const dietCaveat = (i: MenuItem): string | null =>
    isConditionalDiet(i)
        ? (i.dietNote || "Vegan/vegetarian only when ordered without the default grilled chicken. The nutrition shown is measured with chicken.")
        : null

const DIETARY_TAGS: Record<string, (i: MenuItem) => boolean> = {
    // Vegan/Vegetarian NEVER fall back to the keyword heuristic — they require an
    // explicit CMS/feed tag, and an untagged item is treated as NOT vegan.
    // Reason: the official FDA/INM export shows every composed bowl and wrap is
    // built with Grilled Chicken by default, but the ingredient text we scan never
    // names that default protein — so the keyword fallback returned TRUE for
    // chicken dishes and showed "Stir Fry Bowl" under the Vegan filter. Meat is
    // also not an allergen, so hasAllergen() cannot rescue the check either. There
    // is no signal in this data that can prove an item is meat-free; absent a
    // human-verified tag the only safe answer is "no". Sparse-but-true beats
    // full-but-wrong when a vegetarian guest is deciding what to eat.
    // The "-without-chicken" variants are real matches, not weaker ones: the item
    // qualifies when ordered without its default grilled chicken, which is a
    // normal counter order. Suppressing them would have left the Vegan filter at
    // 10 sides and no main dish. They always carry dietNote, and every surface
    // that shows the diet claim shows that caveat with it — see dietCaveat().
    "Vegetarian":   i => dietFromCms(i, "vegetarian", "vegan", "vegetarian-without-chicken", "vegan-without-chicken") ?? false,
    "Vegan":        i => dietFromCms(i, "vegan", "vegan-without-chicken") ?? false,
    // Gluten is proxied from the Wheat flag: the source export's "Contains Gluten"
    // column is empty. That proxy was tested, not assumed — all 89 ingredient
    // statements were scanned for barley/rye/malt/oats/spelt/farro/semolina/durum,
    // and the only 4 items that mention any (malt) are already flagged Wheat, so the
    // proxy yields no false gluten-free positives. Cross-contact in a shared kitchen
    // remains outside what any of this data can see — hence the on-page wording
    // "made without gluten-containing ingredients" rather than "gluten-free".
    "Gluten-Free":  i => dietFromCms(i, "gluten-free", "gluten free") ?? (hasAllergenData(i) && !hasAllergen(i, ["wheat"])),
    "Dairy-Free":   i => dietFromCms(i, "dairy-free", "dairy free", "low-lactose", "low lactose", "vegan") ?? (hasAllergenData(i) && !hasAllergen(i, ["milk"])),
    "High Protein": i => i.protein >= 25,
    "Low Carb":     i => i.carbs > 0 && i.carbs <= 20,
    // Macro-based label only (protein-forward, portion-conscious) — never a medical
    // claim. Thresholds picked to surface meals that pair well with a reduced-appetite,
    // high-protein-priority eating pattern; see the on-page disclaimer for the caveat.
    "GLP-1 Friendly": i => !i.variable && i.calories > 0 && i.protein >= 25 && i.calories <= 650,
}

const DIETARY: string[] = Object.keys(DIETARY_TAGS)

// Deliberate menu order for "Browse All" (no goal to rank by) so the default view
// reads as curated rather than raw data order. Unknown categories sort last.
const CATEGORY_ORDER = ["Bowls", "Wraps", "Salads", "Breakfast", "Starters", "Sides", "Kids", "Desserts"]
const catRank = (c: string): number => { const i = CATEGORY_ORDER.indexOf(c); return i === -1 ? 99 : i }

// ── 6. Storage factory ────────────────────────────────────────────────────────

function createStorage(type: "local" | "session") {
    const store = () => type === "local" ? localStorage : sessionStorage
    const ok    = () => typeof window !== "undefined"
    return {
        get: (key: string): string | null   => { try { return ok() ? store().getItem(key) : null } catch { return null } },
        set: (key: string, val: string): void => { try { if (ok()) store().setItem(key, val) }  catch { /* noop */ } },
        del: (key: string): void              => { try { if (ok()) store().removeItem(key) }    catch { /* noop */ } },
    }
}

const ls = createStorage("local")
const ss = createStorage("session")

// ── 7. Utilities ──────────────────────────────────────────────────────────────

// Matches "Thai Wrap" / "Thai Bowl" style titles for wrap-or-bowl pairing.
const FORMAT_RE = /^(.*)\s+(Wrap|Bowl)$/

function fitScore(item: MenuItem, goalId: string): number {
    if (goalId === "power") return item.protein
    if (goalId === "light") return item.calories > 0 ? 1000 / item.calories : 0
    if (goalId === "fuel")  return item.carbs
    return 0
}

// Unwraps Framer CMS { type, value } envelope; returns value unchanged otherwise.
function unwrapFramer(v: unknown): unknown {
    if (v && typeof v === "object" && !Array.isArray(v) && "value" in (v as Record<string, unknown>))
        return (v as Record<string, unknown>).value
    return v
}

// Maps any CMS response shape to a MenuItem.
// Priority 1: Framer CMS field IDs (with optional { type, value } wrappers).
// Priority 2: Human-readable keys from flat JSON APIs.
function mapCmsItem(raw: Record<string, unknown>, index: number): MenuItem {
    const fd  = (raw.fieldData ?? raw) as Record<string, unknown>
    const pick = (...keys: string[]): unknown => {
        for (const k of keys) {
            const v = unwrapFramer(fd[k])
            if (v !== undefined && v !== null && v !== "") return v
        }
        return undefined
    }
    const str = (...keys: string[]): string => String(pick(...keys) ?? "")
    const num = (...keys: string[]): number => Number(pick(...keys)) || 0
    // Loose macro parse: extracts the first number from strings like "from 150"
    // or "150+" (floor values for a variant family). `variable` is true when the
    // raw value is a non-empty string that is not purely numeric.
    const numLoose = (...keys: string[]): { n: number; variable: boolean } => {
        const v = pick(...keys)
        if (v === undefined || v === null) return { n: 0, variable: false }
        if (typeof v === "number") return { n: v, variable: false }
        const s = String(v).trim()
        if (s === "") return { n: 0, variable: false }
        const m = s.match(/-?\d+(\.\d+)?/)
        return { n: m ? Number(m[0]) : 0, variable: !/^-?\d+(\.\d+)?$/.test(s) }
    }
    const cal = numLoose(FIELD.calories, "calories", "Calories", "cal")
    const pro = numLoose(FIELD.protein,  "protein",  "Protein")
    const car = numLoose(FIELD.carbs,    "carbs",    "Carbs", "carbohydrates")

    return {
        id:          String(raw.id ?? raw.slug ?? index),
        title:       str(FIELD.title, "title", "name", "Title", "Name"),
        calories:    cal.n,
        protein:     pro.n,
        carbs:       car.n,
        fat:         num("fat", "Fat"),
        variable:    cal.variable || pro.variable || car.variable,
        category:    str(FIELD.category, "category", "Category", "type", "Type"),
        price:       num(FIELD.price, "price", "Price"),
        ingredients: str(FIELD.ingredients, "ingredients", "Ingredients"),
        shortIngr:   str(FIELD.shortIngr, "shortIngr", "shortIngredients", "short_ingredients"),
        description: str(FIELD.description, "description", "Description"),
        thumbnail:   str(FIELD.thumbnail, "thumbnail", "Thumbnail", "image", "Image", "photo"),
        allergens:   str(FIELD.allergens, "allergens", "Allergens"),
        dietaryTags: str(FIELD.dietaryTags, "dietaryTags", "Dietary Tags"),
        dataConfidence: str("dataConfidence", "data_confidence") || undefined,
        dietNote:       str("dietNote", "diet_note") || undefined,
        allergenNote:   str("allergenNote", "allergen_note") || undefined,
        wheatFromTortilla: Boolean(pick("wheatFromTortilla", "wheat_from_tortilla")),
    }
}

// ── 8. Reducer ────────────────────────────────────────────────────────────────

function trayReducer(state: TrayState, action: TrayAction): TrayState {
    switch (action.type) {
        case "TOGGLE": {
            if (state.items.includes(action.id)) {
                const next = state.items.filter(t => t !== action.id)
                return { items: next, open: next.length > 0 ? state.open : false }
            }
            if (state.items.length >= MAX_TRAY) return state
            return { ...state, items: [...state.items, action.id] }
        }
        case "TOGGLE_OPEN": return { ...state, open: !state.open }
        case "CLEAR":       return { items: [], open: false }
        default: return state
    }
}

// ── 9. Pure filter logic ──────────────────────────────────────────────────────

// Single source of truth for goal-matching — used by both applyFilters and buildGoalCounts.
function filterByGoal(items: MenuItem[], g: GoalDef): MenuItem[] {
    let list = items
    if (g.minProtein  !== undefined) list = list.filter(i => i.protein  >= g.minProtein!)
    // calories > 0 guard: items with missing nutrition data (0 cal) must not pass a calorie cap
    // Variable items ("from 150") are excluded: their floor passing the cap does
    // not guarantee every flavor does, so a ceiling claim would be inaccurate.
    if (g.maxCalories !== undefined) list = list.filter(i => !i.variable && i.calories > 0 && i.calories <= g.maxCalories!)
    if (g.minCarbs    !== undefined) list = list.filter(i => i.carbs    >= g.minCarbs!)
    return list
}

function applyFilters(items: MenuItem[], f: FilterState): MenuItem[] {
    const g    = GOALS.find(g => g.id === f.goal)
    let   list = g ? filterByGoal(items, g) : items
    if (f.category !== "All") list = list.filter(i => i.category === f.category)
    const q = f.search.trim().toLowerCase()
    if (q) list = list.filter(i => i.title.toLowerCase().includes(q) || i.ingredients.toLowerCase().includes(q))
    if (f.dietary.length > 0) list = list.filter(i => f.dietary.every(d => DIETARY_TAGS[d]?.(i) ?? true))
    if (f.sortBy === "calories-asc")  return [...list].sort((a, b) => a.calories - b.calories)
    if (f.sortBy === "calories-desc") return [...list].sort((a, b) => b.calories - a.calories)
    if (f.sortBy === "protein-desc")  return [...list].sort((a, b) => b.protein  - a.protein)
    if (f.sortBy === "goal-fit") {
        // On Browse All there's no goal to rank by — fall back to curated category order
        // (stable sort preserves within-category menu order) instead of raw data order.
        if (f.goal === "all") return [...list].sort((a, b) => catRank(a.category) - catRank(b.category))
        return [...list].sort((a, b) => fitScore(b, f.goal) - fitScore(a, f.goal))
    }
    return list
}

// ── 10. Custom hooks ──────────────────────────────────────────────────────────

// Stores a boolean (not raw pixel width) so React's bail-out suppresses renders
// when the breakpoint hasn't changed. Debounced at 100ms to cap resize frequency.
function useViewport(): boolean {
    const [isMobile, setIsMobile] = useState<boolean>(() => {
        try { return typeof window !== "undefined" ? window.innerWidth < MOBILE_BP : false } catch { return false }
    })
    useEffect(() => {
        if (typeof window === "undefined") return
        let timer: ReturnType<typeof setTimeout>
        function onResize() {
            clearTimeout(timer)
            timer = setTimeout(() => { try { setIsMobile(window.innerWidth < MOBILE_BP) } catch { /* noop */ } }, 100)
        }
        window.addEventListener("resize", onResize)
        return () => { clearTimeout(timer); window.removeEventListener("resize", onResize) }
    }, [])
    return isMobile
}

// Dietary filters travel in the URL as slugs — ?diet=gluten-free,glp-1-friendly —
// rather than as the display labels, so the query string stays readable instead of
// percent-encoding spaces and plus signs. Round-trips through DIETARY_TAGS' keys.
const dietSlug = (label: string): string =>
    label.toLowerCase().replace(/\+/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
const dietFromSlug = (slug: string): string | undefined =>
    DIETARY.find(d => dietSlug(d) === slug.trim().toLowerCase())

// Reads URL params once on mount; writes back on state changes.
function useUrlSync(
    state: { goal: string; category: string; sortBy: string; selected: string | null; dietary: string[] },
    onMountCb: (p: { goal?: string; category?: string; sortBy?: string; item?: string; dietary?: string[] }) => void
): void {
    const mounted      = useRef(false)
    const onMountRef   = useRef(onMountCb)
    onMountRef.current = onMountCb

    useEffect(() => {
        if (mounted.current) return
        mounted.current = true
        try {
            if (typeof window === "undefined") return
            const p = new URLSearchParams(window.location.search)
            // Unknown slugs are dropped rather than passed through, so a stale or
            // hand-edited link can't put the UI in a state no pill can clear.
            const diets = (p.get("diet") ?? "").split(",").map(dietFromSlug).filter((d): d is string => Boolean(d))
            onMountRef.current({ goal: p.get("goal") ?? undefined, category: p.get("category") ?? undefined, sortBy: p.get("sort") ?? undefined, item: p.get("item") ?? undefined, dietary: diets.length ? diets : undefined })
        } catch { /* noop */ }
    }, [])

    useEffect(() => {
        try {
            if (typeof window === "undefined") return
            const p = new URLSearchParams(window.location.search)
            if (state.goal && state.goal !== "all") { p.set("goal", state.goal) } else { p.delete("goal") }
            if (state.category && state.category !== "All") { p.set("category", state.category) } else { p.delete("category") }
            if (state.sortBy && state.sortBy !== "goal-fit") { p.set("sort", state.sortBy) } else { p.delete("sort") }
            if (state.selected) { p.set("item", state.selected) } else { p.delete("item") }
            // Sorted so the same set of pills always yields the same URL — otherwise
            // click order alone produces distinct URLs for identical views, which
            // fragments GA4 reporting and gives crawlers duplicate paths to the
            // same content.
            if (state.dietary.length) { p.set("diet", [...state.dietary].sort().map(dietSlug).join(",")) } else { p.delete("diet") }
            const qs = p.toString()
            history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname)
        } catch { /* noop */ }
    }, [state.goal, state.category, state.sortBy, state.selected, state.dietary])
}

function useKeyboard(key: string, handler: () => void): void {
    const handlerRef   = useRef(handler)
    handlerRef.current = handler
    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key.toLowerCase() === key.toLowerCase()) handlerRef.current() }
        if (typeof window === "undefined") return
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [key])
}

// ── 11. Primitive components ──────────────────────────────────────────────────

const MacroBar = memo(function MacroBar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
    return (
        <div style={{ height: 5, background: C.tint, borderRadius: 999, overflow: "hidden", flex: 1 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 0.3s ease" }} />
        </div>
    )
})

interface MacroRingProps { protein: number; carbs: number; fat: number; calories: number; size?: number; variable?: boolean }
const MacroRing = memo(function MacroRing({ protein, carbs, fat, calories, size = 140, variable = false }: MacroRingProps) {
    const total  = protein * 4 + carbs * 4 + fat * 9
    const r = 40, sw = 9, circ = 2 * Math.PI * r
    const proLen = total > 0 ? (protein * 4 / total) * circ : 0
    const carLen = total > 0 ? (carbs   * 4 / total) * circ : 0
    const fatLen = total > 0 ? (fat     * 9 / total) * circ : 0
    const arc    = { transition: "stroke-dasharray 0.45s ease, stroke-dashoffset 0.45s ease" }
    return (
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", display: "block" }}>
                <circle cx="50" cy="50" r={r} fill="none" stroke={C.inkGhost} strokeWidth={sw} />
                <circle cx="50" cy="50" r={r} fill="none" stroke={C.orange} strokeWidth={sw} strokeDasharray={`${proLen} ${circ}`} strokeDashoffset={0} strokeLinecap="round" style={arc} />
                <circle cx="50" cy="50" r={r} fill="none" stroke={C.yellow} strokeWidth={sw} strokeDasharray={`${carLen} ${circ}`} strokeDashoffset={-proLen} strokeLinecap="round" style={arc} />
                <circle cx="50" cy="50" r={r} fill="none" stroke={C.green}  strokeWidth={sw} strokeDasharray={`${fatLen} ${circ}`} strokeDashoffset={-(proLen + carLen)} strokeLinecap="round" style={arc} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: C.ink, lineHeight: 1 }}>{calories}{variable ? "+" : ""}</span>
                <span style={{ fontSize: 10, color: C.inkSoft, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>cal</span>
            </div>
        </div>
    )
})

const MacroStat = memo(function MacroStat({ label, value, unit, color, plus = false }: { label: string; value: number; unit: string; color: string; plus?: boolean }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, lineHeight: 1 }}>{value}<span style={{ fontSize: 12, fontWeight: 600 }}>{unit}{plus ? "+" : ""}</span></div>
                <div style={{ fontSize: 10, color: C.inkSoft, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
            </div>
        </div>
    )
})

const GoalButton = memo(function GoalButton({ g, active, count, total, onClick }: { g: GoalDef; active: boolean; count: number; total: number; onClick: () => void }) {
    const isEmpty = total > 0 && count === 0
    return (
        <button onClick={onClick} aria-pressed={active} style={{
            padding: "12px 18px", borderRadius: 16,
            border: `2px solid ${active ? g.accent : C.tint}`,
            background: active ? g.accent : C.white,
            color: active ? (g.accentText ?? C.white) : isEmpty ? "rgba(13,79,79,0.35)" : C.teal,
            boxShadow: active ? C.shadow : "none", opacity: isEmpty ? 0.6 : 1,
            cursor: isEmpty ? "default" : "pointer", textAlign: "left", transition: "all 0.15s", minWidth: 110, fontFamily: "inherit"
        }}>
            <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{g.label}</div>
            <div style={{ fontSize: 10, opacity: 0.85, marginTop: 3 }}>{active ? `${count} items` : isEmpty ? "none available" : g.sub}</div>
        </button>
    )
})

const SkeletonCard = memo(function SkeletonCard() {
    return (
        <div style={{ background: C.white, borderRadius: 20, overflow: "hidden", border: `2px solid ${C.tint}` }}>
            <div style={{ height: 140, background: C.inkGhost, animation: "cbwPulse 1.6s ease-in-out infinite" }} />
            <div style={{ padding: "11px 13px 13px", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ height: 13, borderRadius: 4, background: C.inkGhost, width: "72%", animation: "cbwPulse 1.6s ease-in-out infinite 0.1s" }} />
                <div style={{ height: 10, borderRadius: 4, background: C.inkGhost, width: "90%", animation: "cbwPulse 1.6s ease-in-out infinite 0.2s" }} />
                <div style={{ height: 10, borderRadius: 4, background: C.inkGhost, width: "55%", animation: "cbwPulse 1.6s ease-in-out infinite 0.3s" }} />
            </div>
        </div>
    )
})

function Highlight({ text, query }: { text: string; query: string }) {
    const q = query.trim().toLowerCase()
    if (!q) return <>{text}</>
    const idx = text.toLowerCase().indexOf(q)
    if (idx === -1) return <>{text}</>
    return <>{text.slice(0, idx)}<mark style={{ background: C.yellow, color: C.ink, borderRadius: 2, padding: "0 1px", fontWeight: 800 }}>{text.slice(idx, idx + q.length)}</mark>{text.slice(idx + q.length)}</>
}

// ── 12. Main component ────────────────────────────────────────────────────────

interface NutritionCalculatorProps {
    items?:       MenuItem[]
    cmsEndpoint?: string
    apiKey?:      string
    orderUrl?:    string
    fontFamily?:  string
    stickyOffset?: number
}

function NutritionCalculator({
    items = [],
    cmsEndpoint = "",
    apiKey      = "",
    orderUrl    = "https://crazybowlswraps.order.online/business/-193068?delivery=true",
    fontFamily  = "Bricolage Grotesque, sans-serif",
    stickyOffset = 96,
}: NutritionCalculatorProps) {

    // — State ——————————————————————————————————————————————————————————————————
    const [goal,       setGoal]       = useState<string>(() => ls.get(LS_KEYS.goal) ?? "all")
    // Sort is intentionally NOT persisted across sessions — every visit starts on
    // "Best Goal Fit" so a previously-chosen sort can't silently reorder the menu.
    const [sortBy,     setSortBy]     = useState<string>("goal-fit")
    const [category,   setCategory]   = useState<string>("All")
    const [dietary,    setDietary]    = useState<string[]>([])
    const [search,     setSearch]     = useState<string>("")
    const [selected,   setSelected]   = useState<string | null>(() => ls.get(LS_KEYS.item))
    const [portion,    setPortion]    = useState<number>(1)
    // Persisted so a returning guest keeps their daily calorie budget (sane-range guard).
    const [budget,     setBudget]     = useState<number>(() => { const v = Number(ls.get("cbw-budget") ?? 0); return v >= 500 && v <= 6000 ? v : 0 })
    const [showMacros, setShowMacros] = useState<boolean>(true)
    const [cmsItems,   setCmsItems]   = useState<MenuItem[]>([])
    const [fetchState, setFetchState] = useState<FetchState>("idle")
    const [retryKey,   setRetryKey]   = useState<number>(0)
    const [copied,     setCopied]     = useState<boolean>(false)
    // Per-flavor format choice for merged wrap/bowl cards (flavor key -> chosen item id)
    const [fmtSel,     setFmtSel]     = useState<Record<string, string>>({})

    const [trayState, trayDispatch] = useReducer(trayReducer, undefined, () => {
        try { const s = ss.get(SS_KEY_TRAY); if (s) return { items: JSON.parse(s) as string[], open: false } } catch { /* noop */ }
        return { items: [] as string[], open: false }
    })
    // Compare-tray UX: first-add coach mark + SR announcements on add/remove
    const [showCoachMark, setShowCoachMark] = useState<boolean>(false)
    const [announcement,  setAnnouncement]  = useState<string>("")
    const trayRef              = useRef<HTMLDivElement>(null)
    const compareHydratedRef   = useRef(false)

    const deferredSearch  = useDeferredValue(search)
    const isSearchPending = search !== deferredSearch
    const isMobile        = useViewport()

    const hasRealPropItems = items.some(i => i.title.trim() !== "")
    const effectiveItems   = hasRealPropItems ? items : cmsItems

    // — Stable callbacks ———————————————————————————————————————————————————————
    // On close, return focus to the originating card (WCAG 2.4.3 focus order).
    const handleClose      = useCallback(() => {
        setSelected(prev => {
            if (prev && typeof document !== "undefined") {
                const el = document.querySelector<HTMLElement>(`[data-cbw-open="${CSS.escape(prev)}"]`)
                if (el) setTimeout(() => el.focus(), 0)
            }
            return null
        })
    }, [])
    const handleDeepLink   = useCallback((id: string) => setSelected(id), [])
    const handleGoalClick  = useCallback((id: string) => setGoal(id), [])

    // Guarded analytics — never allowed to throw or block interaction.
    const dataLayerPush = useCallback((action: string, ids: string[]) => {
        try { (window as any).dataLayer?.push({ event: "cbw_compare", action, items: ids }) } catch { /* noop */ }
    }, [])

    const handleToggleTray = useCallback((id: string) => {
        const item  = effectiveItems.find(i => i.id === id || i.title === id)
        const wasIn = trayState.items.includes(id)
        trayDispatch({ type: "TOGGLE", id })
        if (!item) return
        if (!wasIn) {
            const nextCount = Math.min(trayState.items.length + 1, MAX_TRAY)
            setAnnouncement(`${item.title} added to compare. Comparing ${nextCount} of ${MAX_TRAY}.`)
            dataLayerPush("add", [...trayState.items, id])
            if (ss.get(SS_KEY_SEEN) !== "1") { setShowCoachMark(true); ss.set(SS_KEY_SEEN, "1") } else { setShowCoachMark(false) }
        } else {
            const nextCount = trayState.items.length - 1
            setAnnouncement(`${item.title} removed. Comparing ${nextCount}.`)
            dataLayerPush("remove", trayState.items.filter(x => x !== id))
        }
    }, [effectiveItems, trayState.items, dataLayerPush])

    const handleToggleOpen = useCallback((moveFocus?: boolean) => {
        const willOpen = !trayState.open
        trayDispatch({ type: "TOGGLE_OPEN" })
        dataLayerPush("open", trayState.items)
        if (moveFocus && willOpen) {
            setTimeout(() => { trayRef.current?.querySelector<HTMLElement>("button, a[href]")?.focus() }, 0)
        }
    }, [trayState.open, trayState.items, dataLayerPush])

    const urlMountCb = useCallback(({ goal: g, category: cat, sortBy: s, item, dietary: d }: { goal?: string; category?: string; sortBy?: string; item?: string; dietary?: string[] }) => {
        const validGoal = GOALS.find(x => x.id === g)
        if (validGoal) setGoal(validGoal.id)
        if (cat)  setCategory(cat)
        if (s && s !== "default") setSortBy(s)
        if (d && d.length) setDietary(d)
        if (item) handleDeepLink(item)
    }, [handleDeepLink])

    useUrlSync({ goal, category, sortBy, selected, dietary }, urlMountCb)

    // — Effects ————————————————————————————————————————————————————————————————
    useEffect(() => { injectStyles() }, [])
    useEffect(() => { ls.set(LS_KEYS.goal, goal) },    [goal])
    useEffect(() => { selected ? ls.set(LS_KEYS.item, selected) : ls.del(LS_KEYS.item) }, [selected])
    useEffect(() => { setPortion(1); setCopied(false) }, [selected])
    useEffect(() => { budget > 0 ? ls.set("cbw-budget", String(budget)) : ls.del("cbw-budget") }, [budget])

    // Auto-reset the "Copied!" confirmation after 2s
    useEffect(() => {
        if (!copied) return
        const t = setTimeout(() => setCopied(false), 2000)
        return () => clearTimeout(t)
    }, [copied])
    useEffect(() => { ss.set(SS_KEY_TRAY, JSON.stringify(trayState.items)) }, [trayState.items])

    // First-add coach mark: auto-dismiss after 6s (also cleared on next add — see handleToggleTray)
    useEffect(() => {
        if (!showCoachMark) return
        const t = setTimeout(() => setShowCoachMark(false), 6000)
        return () => clearTimeout(t)
    }, [showCoachMark])

    // Shareable compare state: mirror the tray into ?compare=id1,id2 (preserves ?item= etc,
    // which useUrlSync manages independently by reading/writing the same query string).
    useEffect(() => {
        try {
            if (typeof window === "undefined") return
            const p = new URLSearchParams(window.location.search)
            if (trayState.items.length > 0) p.set("compare", trayState.items.join(",")); else p.delete("compare")
            const qs = p.toString()
            history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname)
        } catch { /* noop */ }
    }, [trayState.items])

    // Hydrate the tray from ?compare= once items are available (validates ids exist).
    // Only runs once, and only if the tray isn't already populated from sessionStorage.
    useEffect(() => {
        if (compareHydratedRef.current || effectiveItems.length === 0) return
        compareHydratedRef.current = true
        try {
            if (typeof window === "undefined" || trayState.items.length > 0) return
            const raw = new URLSearchParams(window.location.search).get("compare")
            if (!raw) return
            const ids   = raw.split(",").map(s => s.trim()).filter(Boolean)
            const valid = ids.filter(id => effectiveItems.some(i => i.id === id || i.title === id)).slice(0, MAX_TRAY)
            valid.forEach(id => trayDispatch({ type: "TOGGLE", id }))
        } catch { /* noop */ }
    }, [effectiveItems]) // intentionally omits trayState.items — hydration should run only once

    // Lock page scroll behind the mobile bottom sheet
    useEffect(() => {
        if (typeof document === "undefined" || !isMobile || !selected) return
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => { document.body.style.overflow = prev }
    }, [isMobile, selected])

    // Clears a stale `selected` (from localStorage) when items load and the ID no longer exists.
    useEffect(() => {
        if (effectiveItems.length > 0 && selected && !effectiveItems.find(i => i.id === selected || i.title === selected)) {
            setSelected(null)
        }
    }, [effectiveItems]) // intentionally omits `selected` — only runs when items change

    // CMS fetch — supports pagination via nextCursor; retryKey triggers re-fetch on Retry click.
    useEffect(() => {
        if (!cmsEndpoint || hasRealPropItems) return
        let cancelled = false
        setFetchState("loading")

        async function fetchAll(): Promise<Record<string, unknown>[]> {
            const headers: Record<string, string> = { Accept: "application/json" }
            if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`
            const all: Record<string, unknown>[] = []
            let url: string | null = cmsEndpoint
            while (url) {
                const r = await fetch(url, { headers })
                if (!r.ok) throw new Error(String(r.status))
                const data = await r.json() as Record<string, unknown>
                const page: Record<string, unknown>[] =
                    Array.isArray(data)       ? data as Record<string, unknown>[] :
                    Array.isArray(data.items) ? data.items as Record<string, unknown>[] :
                    Array.isArray(data.data)  ? data.data  as Record<string, unknown>[] : []
                all.push(...page)
                url = typeof data.nextCursor === "string"
                    ? `${cmsEndpoint}${cmsEndpoint.includes("?") ? "&" : "?"}cursor=${data.nextCursor}`
                    : null
            }
            return all
        }

        fetchAll()
            .then(raw => {
                if (cancelled) return
                setCmsItems(raw.map((r, i) => mapCmsItem(r, i)).filter(i => i.title.trim() !== ""))
                setFetchState("success")
            })
            .catch(() => { if (!cancelled) setFetchState("error") })
        return () => { cancelled = true }
    }, [cmsEndpoint, hasRealPropItems, apiKey, retryKey])

    // useKeyboard stabilises the handler internally via a ref — no useCallback needed here.
    useKeyboard("Escape", handleClose)
    useKeyboard("c", () => {
        const tag = typeof document !== "undefined" ? (document.activeElement?.tagName ?? "") : ""
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
        if (trayState.items.length > 0) trayDispatch({ type: "TOGGLE_OPEN" })
    })

    // — Derived data ———————————————————————————————————————————————————————————
    // Wrap-or-bowl pairing: flavors sold as both (e.g. "Thai Wrap"/"Thai Bowl") merge
    // into one card with a format toggle. Items stay separate in the data so each
    // format keeps its own verified nutrition and goal filters stay per-format.
    const pairMap = useMemo(() => {
        const m = new Map<string, { wrap?: MenuItem; bowl?: MenuItem }>()
        effectiveItems.forEach(i => {
            const match = FORMAT_RE.exec(i.title)
            if (!match) return
            const key = match[1].toLowerCase()
            const e = m.get(key) ?? {}
            if (match[2] === "Wrap") e.wrap = i; else e.bowl = i
            m.set(key, e)
        })
        for (const [k, v] of Array.from(m)) if (!v.wrap || !v.bowl) m.delete(k)
        return m as Map<string, { wrap: MenuItem; bowl: MenuItem }>
    }, [effectiveItems])

    // Count merged cards, not raw items, so pill/goal counts match what the grid shows
    const countCards = useCallback((list: MenuItem[]): number => {
        let n = list.length
        const ids = new Set(list.map(i => i.id))
        pairMap.forEach(p => { if (ids.has(p.wrap.id) && ids.has(p.bowl.id)) n-- })
        return n
    }, [pairMap])

    const goalCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        GOALS.forEach(g => { counts[g.id] = countCards(filterByGoal(effectiveItems, g)) })
        return counts
    }, [effectiveItems, countCards])

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { All: countCards(effectiveItems) }
        const byCat = new Map<string, MenuItem[]>()
        effectiveItems.forEach(i => { if (i.category) byCat.set(i.category, [...(byCat.get(i.category) ?? []), i]) })
        byCat.forEach((list, cat) => { counts[cat] = countCards(list) })
        return counts
    }, [effectiveItems, countCards])
    const categories     = useMemo(() => ["All", ...Array.from(new Set(effectiveItems.map(i => i.category).filter(Boolean)))], [effectiveItems])

    const { maxProtein, maxCarbs } = useMemo(() => ({
        maxProtein: effectiveItems.reduce((m, i) => Math.max(m, i.protein),  1),
        maxCarbs:   effectiveItems.reduce((m, i) => Math.max(m, i.carbs),    1),
    }), [effectiveItems])

    const { filtered, maxScore } = useMemo(() => {
        const f  = applyFilters(effectiveItems, { goal, category, dietary, search: deferredSearch, sortBy })
        const ms = goal !== "all" && f.length > 0 ? f.reduce((m, i) => Math.max(m, fitScore(i, goal)), 1) : 1
        return { filtered: f, maxScore: ms }
    }, [effectiveItems, goal, category, dietary, deferredSearch, sortBy])

    const { trayItems, trayTotals } = useMemo(() => {
        const ti = trayState.items.map(id => effectiveItems.find(i => i.id === id || i.title === id)).filter((x): x is MenuItem => !!x)
        // Variable items (floor values) are excluded from combined macro totals —
        // a "from 150" floor would understate the real sum. Price stays included.
        const fixed = ti.filter(i => !i.variable)
        return {
            trayItems: ti,
            trayTotals: {
                calories: fixed.reduce((s, i) => s + i.calories, 0),
                protein:  fixed.reduce((s, i) => s + i.protein,  0),
                carbs:    fixed.reduce((s, i) => s + i.carbs,    0),
                price:    ti.reduce((s, i) => s + i.price,    0),
            },
        }
    }, [trayState.items, effectiveItems])

    const sel = useMemo(() => selected ? effectiveItems.find(i => i.id === selected || i.title === selected) : undefined, [selected, effectiveItems])

    interface CardEntry { item: MenuItem; partner?: MenuItem; key: string }
    const cards = useMemo((): CardEntry[] => {
        const seen = new Set<string>()
        const out: CardEntry[] = []
        const inFiltered = new Set(filtered.map(i => i.id))
        for (const item of filtered) {
            const match = FORMAT_RE.exec(item.title)
            const key = match ? match[1].toLowerCase() : ""
            const pair = key ? pairMap.get(key) : undefined
            if (pair) {
                if (seen.has(key)) continue
                seen.add(key)
                const partner = item.id === pair.wrap.id ? pair.bowl : pair.wrap
                // Merge only when the partner also passes the active filters
                out.push({ item, partner: inFiltered.has(partner.id) ? partner : undefined, key })
            } else {
                out.push({ item, key: item.id })
            }
        }
        return out
    }, [filtered, pairMap])

    // The paired counterpart of the currently selected item, for the detail-panel toggle
    const selAlt = useMemo((): MenuItem | undefined => {
        if (!sel) return undefined
        const match = FORMAT_RE.exec(sel.title)
        if (!match) return undefined
        const pair = pairMap.get(match[1].toLowerCase())
        if (!pair) return undefined
        return sel.id === pair.wrap.id ? pair.bowl : pair.wrap
    }, [sel, pairMap])

    const scaled = useMemo((): ScaledMacros => {
        if (!sel) return { protein: 0, carbs: 0, fat: 0, calories: 0, proteinDensity: 0 }
        // Small size uses real official values when available (see SMALL_BOWL_MACROS)
        // instead of a uniform ratio — fat isn't published per-size, so it still scales
        // by the portion multiplier as a reasonable estimate.
        const small    = portion !== 1 ? SMALL_BOWL_MACROS[sel.title] : undefined
        const protein  = small ? small.protein  : Math.round(sel.protein  * portion)
        const carbs    = small ? small.carbs    : Math.round(sel.carbs    * portion)
        const fat      = Math.round(sel.fat * portion)
        const calories = small ? small.calories : Math.round(sel.calories * portion)
        return { protein, carbs, fat, calories, proteinDensity: calories > 0 ? Math.round((protein / calories) * 100) : 0 }
    }, [sel, portion])

    const swapTip = useMemo((): string | null => {
        if (!sel) return null
        if (goal === "power" && scaled.protein  < 30)  return "Add grilled chicken or tofu to push protein past 30g."
        if (goal === "light" && scaled.calories > 500) return sel.category === "Bowls" ? "Go with a small bowl or skip the sauce to stay under 500 cal." : "Skip the sauce or a heavy topping to stay under 500 cal."
        if (goal === "fuel"  && scaled.carbs    < 50)  return "Swap in brown rice or quinoa to hit your carb target."
        return null
    }, [sel, goal, scaled])

    // Same-goal "you might also like" — up to 3 items that match the active goal
    // (or share the category on Browse All), ranked by goal fit, wrap/bowl deduped.
    const suggestions = useMemo((): MenuItem[] => {
        if (!sel) return []
        const g = GOALS.find(x => x.id === goal)
        const base = g && goal !== "all" ? filterByGoal(effectiveItems, g) : effectiveItems.filter(i => i.category === sel.category)
        const excl = new Set([sel.id, selAlt?.id].filter(Boolean) as string[])
        const pool = base.filter(i => !excl.has(i.id) && i.calories > 0)
        const ranked = goal !== "all" ? [...pool].sort((a, b) => fitScore(b, goal) - fitScore(a, goal)) : pool
        const seen = new Set<string>(); const out: MenuItem[] = []
        for (const i of ranked) {
            const m = FORMAT_RE.exec(i.title); const key = m ? m[1].toLowerCase() : i.id
            if (seen.has(key)) continue
            seen.add(key); out.push(i)
            if (out.length === 3) break
        }
        return out
    }, [sel, selAlt, effectiveItems, goal])

    // — Convenience ————————————————————————————————————————————————————————————
    const budgetRemaining = budget > 0 ? budget - trayTotals.calories : null
    // Order hand-off — append UTM params without disturbing an existing query string.
    const orderHref = useMemo(() => {
        if (!orderUrl || orderUrl === "#") return orderUrl
        const utm = "utm_source=site&utm_medium=nutrition_calculator&utm_campaign=bowl-off"
        return `${orderUrl}${orderUrl.includes("?") ? "&" : "?"}${utm}`
    }, [orderUrl])
    const activeFilters   = dietary.length + (category !== "All" ? 1 : 0) + (search ? 1 : 0)
    const noItems         = effectiveItems.length === 0
    const isLoading       = fetchState === "loading"
    const isError         = fetchState === "error"
    const padX            = isMobile ? 16 : 32   // responsive gutters — 32px was cramped on phones

    // Scented dietary filters: what each pill would yield if toggled ON given every
    // other active filter — surfaces impossible combos (e.g. Low Carb × Fuel the Day)
    // as (0) BEFORE the tap instead of a dead-end empty state.
    const dietaryCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        DIETARY.forEach(d => {
            const withPill = Array.from(new Set([...dietary, d]))
            counts[d] = countCards(applyFilters(effectiveItems, { goal, category, dietary: withPill, search: deferredSearch, sortBy: "" }))
        })
        return counts
    }, [effectiveItems, goal, category, dietary, deferredSearch, countCards])
    // Desktop: detail is an in-flow sticky column beside the grid (stays inside the
    // component, never covers the site header, keeps the catalog visible — the
    // research-backed split-view pattern). Mobile: a bottom sheet.
    const detailColStyle = {
        width: 380, flexShrink: 0, alignSelf: "stretch" as const,
        // Offset below the site's floating nav so it never overlaps the panel's
        // close button (nav height + breathing room, tunable per-site in Framer).
        position: "sticky" as const, top: stickyOffset, maxHeight: `calc(100vh - ${stickyOffset}px)`,
        overflowY: "auto" as const, background: C.white,
        borderLeft: `1px solid ${C.border}`, boxShadow: "-4px 0 24px rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column" as const,
        animation: "cbwFadeUp 0.2s ease",
    }
    const sheetStyle = {
        position: "fixed" as const, left: 0, right: 0, bottom: 0, zIndex: 200,
        maxHeight: "86vh", background: C.white,
        borderRadius: "24px 24px 0 0", overflowY: "auto" as const,
        display: "flex", flexDirection: "column" as const,
        boxShadow: "0 -8px 32px rgba(0,0,0,0.18)", animation: "cbwSheetUp 0.28s ease",
    }

    // Shared detail content — rendered in the desktop column and the mobile sheet.
    const detailInner = sel ? (
        <>
            <div style={{ height: isMobile ? 170 : 200, background: C.inkGhost, position: "relative", flexShrink: 0 }}>
                {isMobile && <div aria-hidden="true" style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.7)", zIndex: 2 }} />}
                {(sel.thumbnail || selAlt?.thumbnail)
                    ? <img src={sel.thumbnail || selAlt!.thumbnail} alt={sel.title} onError={e => { const el = e.currentTarget; const fb = selAlt?.thumbnail; if (fb && el.src !== fb) { el.src = fb } else { el.style.display = "none" } }} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${C.teal}, ${C.green})` }} />}
                <button onClick={handleClose} aria-label="Close detail panel" style={{ position: "absolute", top: 12, right: 12, width: 36, height: 36, borderRadius: 12, background: "rgba(255,255,255,0.92)", border: `2px solid ${C.teal}`, cursor: "pointer", fontSize: 18, color: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>×</button>
                {/* Protein density. Reads "Ng protein per 100 cal" — NOT "N g protein, 100 cal".
                    The previous wording was "{n}g protein / 100 cal", and a real reader took the
                    slash to mean "and", concluding a 410-cal Poke Bowl was a 100-calorie item.
                    Keep the word "per" here; a slash between two units is genuinely ambiguous
                    on a page people use to decide what to eat. */}
                {scaled.proteinDensity > 0 && <div style={{ position: "absolute", bottom: 12, left: 12, background: scaled.proteinDensity >= 8 ? C.greenDark : C.teal, color: C.white, fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 999, letterSpacing: "0.06em" }}>{scaled.proteinDensity}g protein per 100 cal</div>}
            </div>
            <div style={{ padding: "18px 20px 36px", display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
                <div>
                    <h3 style={{ fontFamily: "Passion One, sans-serif", fontSize: 27, fontWeight: 400, color: C.teal, margin: "0 0 3px", lineHeight: 1.05 }}>{sel.title}</h3>
                    {sel.category && <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.12em" }}>{sel.category}</div>}
                </div>
                {trayState.items.length > 0 && (
                    <button onClick={() => handleToggleOpen()} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderRadius: 12, background: C.tealLight, border: `2px solid ${C.teal}`, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.06em" }}>Comparing {trayState.items.length}</span>
                        <span style={{ fontSize: 11, color: C.ink, fontWeight: 600 }}>{trayTotals.calories} cal · {trayTotals.protein}g pro</span>
                    </button>
                )}
                {selAlt && (
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 6 }}>Format</div>
                        <div style={{ display: "flex", gap: 6 }} role="group" aria-label="Wrap or bowl">
                            {[sel, selAlt].sort((a, b) => (a.title.endsWith("Wrap") ? 0 : 1) - (b.title.endsWith("Wrap") ? 0 : 1)).map(v => {
                                const active = v.id === sel.id
                                return (
                                    <button key={v.id} onClick={() => setSelected(v.id)} aria-pressed={active}
                                        style={{ flex: 1, padding: "8px 0", borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s", border: `2px solid ${active ? C.teal : C.tint}`, background: active ? C.tealLight : C.white, color: C.teal }}>
                                        {v.title.endsWith("Wrap") ? "Wrap" : "Bowl"}{v.price > 0 ? ` · $${v.price.toFixed(2)}` : ""}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
                {sel.calories > 0 ? (
                    <>
                        {portionOptionsFor(sel) && (
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 6 }}>Bowl size</div>
                            <div style={{ display: "flex", gap: 6 }} role="group" aria-label="Bowl size">
                                {portionOptionsFor(sel)!.map(p => <button key={p.val} onClick={() => setPortion(p.val)} aria-pressed={portion === p.val} style={{ flex: 1, padding: "8px 0", borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s", border: `2px solid ${portion === p.val ? C.orangeDark : C.tint}`, background: portion === p.val ? C.orangeLight : C.white, color: portion === p.val ? C.orangeDark : C.teal }}>{p.label}</button>)}
                            </div>
                            {portion !== 1 && (
                                <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 6, lineHeight: 1.5 }}>
                                    Small size calories, protein, and carbs are our official measured values; fat is estimated from the regular size.
                                </div>
                            )}
                        </div>
                        )}
                        <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "16px", background: C.tint, borderRadius: 16 }}>
                            <MacroRing protein={scaled.protein} carbs={scaled.carbs} fat={scaled.fat} calories={scaled.calories} variable={!!sel.variable} />
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <MacroStat label="Protein" value={scaled.protein} unit="g" color={C.orange} plus={!!sel.variable} />
                                <MacroStat label="Carbs"   value={scaled.carbs}   unit="g" color={C.yellow} plus={!!sel.variable} />
                                {scaled.fat > 0 && <MacroStat label="Fat" value={scaled.fat} unit="g" color={C.green} />}
                            </div>
                        </div>
                        {sel.variable && <div style={{ fontSize: 11, color: C.inkSoft, textAlign: "center", marginTop: 4 }}>Values start from the lightest flavor — shown as minimums.</div>}
                        <a href="#nutrition-disclaimer" style={{ display: "block", fontSize: 11, color: C.inkSoft, textDecoration: "underline", textAlign: "center", marginTop: 8, fontFamily: "inherit" }}>
                            Values are estimates (±10%) — see nutrition disclaimer
                        </a>
                    </>
                ) : (
                    // Zero-data guard: never show an empty 0-cal macro ring — mirror the
                    // card-level "nutrition coming soon" state instead.
                    <div style={{ padding: "16px 14px", background: C.tint, borderRadius: 16, textAlign: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Nutrition analysis coming soon</div>
                        <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.6 }}>This item is pending lab analysis. Ask our staff about ingredients and allergens{selAlt && selAlt.calories > 0 ? `, or check the ${selAlt.title.endsWith("Wrap") ? "Wrap" : "Bowl"} version above for a close estimate` : ""}.</div>
                    </div>
                )}
                {budget > 0 && scaled.calories > 0 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 12, background: C.tealLight, border: `2px solid ${C.teal}` }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>This bowl</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{scaled.calories}{sel.variable ? "+" : ""} cal</span>
                        <span style={{ fontSize: 11, color: C.teal, fontWeight: 600 }}>{sel.variable ? "at least " : ""}{Math.round((scaled.calories / budget) * 100)}% of daily goal</span>
                    </div>
                )}
                {goal !== "all" && sel.calories > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: swapTip ? C.orangeLight : C.greenLight, borderLeft: `3px solid ${swapTip ? C.orange : C.green}` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: swapTip ? C.orangeDark : C.greenDark, textTransform: "uppercase", letterSpacing: "0.08em", minWidth: 58 }}>{swapTip ? "Tweak it" : "Great fit"}</div>
                        <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.5 }}>{swapTip ?? "This item aligns well with your " + (GOALS.find(g => g.id === goal)?.label ?? "") + " goal."}</div>
                    </div>
                )}
                {/* Allergens — always rendered, including when nothing is on file, because
                    silence would read as "no allergens" to someone who needs to know. */}
                {(() => {
                    const al = readAllergens(sel)
                    return (
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 6 }}>Allergens</div>
                            {al.state === "list" && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                    {al.list.map(a => (
                                        <span key={a} style={{ fontSize: 11, fontWeight: 700, color: C.orangeDark, background: C.orangeLight, border: `1.5px solid ${C.orangeDark}`, borderRadius: 999, padding: "3px 10px" }}>{a}</span>
                                    ))}
                                </div>
                            )}
                            {al.state === "none" && (
                                <div style={{ fontSize: 12, fontWeight: 700, color: C.greenDark, background: C.greenLight, borderRadius: 12, padding: "8px 12px" }}>
                                    None of the 9 major allergens
                                </div>
                            )}
                            {al.state === "unknown" && (
                                <div style={{ fontSize: 12, color: C.ink, background: C.tint, borderRadius: 12, padding: "8px 12px", lineHeight: 1.5 }}>
                                    Allergen information isn&apos;t confirmed for this item yet — please ask our staff before ordering.
                                </div>
                            )}
                            {sel.wheatFromTortilla && (
                                <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 6, lineHeight: 1.5 }}>
                                    Wheat comes from the tortilla. Order it as a Lettuce Wrap to leave the tortilla out.
                                </div>
                            )}
                            {sel.allergenNote && (
                                <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 6, lineHeight: 1.5 }}>
                                    {sel.allergenNote}
                                </div>
                            )}
                            {al.state !== "unknown" && (
                                <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 6, lineHeight: 1.5 }}>
                                    Prepared in a shared kitchen, so we can&apos;t guarantee any item is free from cross-contact.
                                </div>
                            )}
                        </div>
                    )
                })()}
                {/* Conditional diet caveat. Deliberately styled as prominently as the
                    claim it qualifies, and placed before the description so it can't
                    be missed by someone who stops reading at the macros. */}
                {dietCaveat(sel) && (
                    <div style={{ fontSize: 12, color: C.ink, background: C.tint, borderLeft: `3px solid ${C.teal}`, borderRadius: 8, padding: "9px 12px", lineHeight: 1.55 }}>
                        {dietCaveat(sel)}
                    </div>
                )}
                {/* Data provenance — an unreconciled item must not look as authoritative
                    as a verified one just because both render the same way. */}
                {sel.dataConfidence && sel.dataConfidence !== "verified" && sel.dataConfidence !== "verified-alias" && (
                    <div style={{ fontSize: 11, color: C.inkSoft, background: C.tint, borderRadius: 12, padding: "8px 12px", lineHeight: 1.5 }}>
                        {sel.dataConfidence === "no-data"
                            ? "This item is still pending nutrition analysis."
                            : "These values haven’t been reconciled against our latest nutrition analysis yet — treat them as approximate and ask our staff if it matters."}
                    </div>
                )}
                {sel.description && <p style={{ fontSize: 13, color: C.inkSoft, margin: 0, lineHeight: 1.7 }}>{sel.description}</p>}
                {sel.ingredients && (
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 5 }}>Ingredients</div>
                        <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.75, opacity: 0.75 }}>{sel.ingredients}</div>
                    </div>
                )}
                {suggestions.length > 0 && (
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 8 }}>{goal !== "all" ? `More ${GOALS.find(g => g.id === goal)?.label ?? ""} picks` : "You might also like"}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {suggestions.map(s => (
                                <button key={s.id} onClick={() => setSelected(s.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: 6, borderRadius: 12, border: `2px solid ${C.tint}`, background: C.white, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: C.inkGhost }}>
                                        {s.thumbnail && <img src={s.thumbnail} alt="" role="presentation" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title.replace(/ (Wrap|Bowl)$/, "")}</div>
                                        <div style={{ fontSize: 11, color: C.inkSoft, fontStyle: s.calories > 0 ? "normal" : "italic" }}>{s.calories > 0 ? `${s.calories}${s.variable ? "+" : ""} cal · ${s.protein}${s.variable ? "+" : ""}g pro` : "nutrition coming soon"}</div>
                                    </div>
                                    <span aria-hidden="true" style={{ fontSize: 14, color: C.inkSoft, flexShrink: 0 }}>›</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
                    <a href={orderUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", padding: 5, borderRadius: 16, border: `2px solid ${C.orangeDark}`, textDecoration: "none", boxSizing: "border-box" }}>
                        <span style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", background: C.orangeDark, color: C.white, borderRadius: 12, padding: "13px 20px", fontWeight: 700, fontSize: 15, lineHeight: 1, fontFamily: "inherit", letterSpacing: "0.01em" }}>{sel.price > 0 ? `Order Now — $${sel.price.toFixed(2)}` : "Order Now"}</span>
                    </a>
                    <button onClick={() => { try { if (typeof window !== "undefined") { const url = new URL(window.location.href); url.searchParams.set("item", sel.id); navigator.clipboard?.writeText(url.toString()); setCopied(true) } } catch { /* noop */ } }} aria-live="polite" style={{ padding: "12px", borderRadius: 16, border: `2px solid ${copied ? C.greenDark : C.tint}`, background: copied ? C.greenLight : C.white, color: copied ? C.greenDark : C.teal, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>{copied ? "✓ Link copied!" : "Copy shareable link"}</button>
                </div>
            </div>
        </>
    ) : null

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div data-cbw-root="" style={{ fontFamily, background: C.cream, minHeight: "100vh", width: "100%" }}>

            {/* SR-only live region — announces compare add/remove */}
            <div role="status" aria-live="polite" style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>{announcement}</div>

            {/* Goal header */}
            <div style={{ background: C.white, borderBottom: `1px solid ${C.tint}`, padding: `28px ${padX}px 20px` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <div style={{ fontFamily: "Passion One, sans-serif", fontSize: 28, fontWeight: 400, color: C.teal, lineHeight: 1, marginBottom: 12 }}>What&apos;s your goal?</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {GOALS.map(g => <GoalButton key={g.id} g={g} active={goal === g.id} count={goalCounts[g.id] ?? 0} total={effectiveItems.length} onClick={() => handleGoalClick(g.id)} />)}
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 160 }}>
                        <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.teal }}>Daily cal budget</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input type="number" data-cbw-budget="" value={budget || ""} onChange={e => setBudget(Math.max(0, Number(e.target.value)))} placeholder="e.g. 1800" aria-label="Daily calorie budget" style={{ width: 110, padding: "10px 14px", borderRadius: 12, border: `2px solid ${budget > 0 ? C.orange : C.line}`, background: C.white, color: C.teal, fontSize: 15, fontWeight: 700, fontFamily: "inherit", outline: "none" }} />
                            {budgetRemaining !== null && (
                                <div style={{ fontSize: 12, color: budgetRemaining >= 0 ? C.teal : C.orangeDark, fontWeight: 700, lineHeight: 1.3 }} aria-live="polite" title="Your daily budget minus everything in your Compare tray">
                                    {trayState.items.length > 0
                                        ? (budgetRemaining >= 0 ? `${budgetRemaining} left` : `${Math.abs(budgetRemaining)} over`)
                                        : <span style={{ fontWeight: 500, color: C.inkSoft }}>add items to Compare to track</span>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div style={{ background: C.white, borderBottom: `1px solid ${C.tint}`, padding: `12px ${padX}px`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or ingredient" aria-label="Search menu items" style={{ flex: 1, minWidth: 160, padding: "11px 16px", borderRadius: 16, border: `2px solid ${search ? C.orange : C.line}`, fontSize: 14, color: C.teal, background: C.white, outline: "none", fontFamily: "inherit", boxSizing: "border-box", opacity: isSearchPending ? 0.65 : 1, transition: "border-color 0.15s, opacity 0.1s" }} />
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort order" style={{ padding: "10px 14px", borderRadius: 12, border: `2px solid ${C.line}`, fontSize: 13, fontWeight: 700, color: C.teal, background: C.white, cursor: "pointer", fontFamily: "inherit", outline: "none" }}>
                    <option value="goal-fit">Best Goal Fit</option>
                    <option value="protein-desc">Most Protein</option>
                    <option value="calories-asc">Fewest Calories</option>
                    <option value="calories-desc">Most Calories</option>
                </select>
                <button onClick={() => setShowMacros(p => !p)} aria-pressed={showMacros} style={{ padding: "10px 14px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", border: `2px solid ${showMacros ? C.teal : C.line}`, background: showMacros ? C.tealLight : C.white, color: C.teal, fontFamily: "inherit" }}>{showMacros ? "Hide macros" : "Show macros"}</button>
                <button
                    onClick={() => { if (trayState.items.length > 0) handleToggleOpen(true) }}
                    disabled={trayState.items.length === 0}
                    aria-expanded={trayState.open}
                    title={trayState.items.length === 0 ? "Pick bowls to compare" : "Open the compare tray (shortcut: C)"}
                    style={{ padding: "10px 14px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: trayState.items.length === 0 ? "not-allowed" : "pointer", border: `2px solid ${trayState.items.length > 0 ? C.teal : C.line}`, background: trayState.open ? C.tealLight : C.white, color: trayState.items.length > 0 ? C.teal : C.inkSoft, opacity: trayState.items.length === 0 ? 0.55 : 1, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}
                >
                    <span>Compare ({trayState.items.length})</span>
                    {trayState.items.length > 0 && <kbd style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, color: C.teal, border: `1px solid ${C.teal}`, borderRadius: 2, padding: "1px 5px", lineHeight: 1.4 }}>C</kbd>}
                </button>
                {activeFilters > 0 && <button onClick={() => { setSearch(""); setCategory("All"); setDietary([]) }} style={{ padding: "10px 14px", borderRadius: 12, border: `2px solid ${C.orangeDark}`, background: C.orangeLight, color: C.orangeDark, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Clear {activeFilters} filter{activeFilters > 1 ? "s" : ""}</button>}
            </div>

            {/* Dietary + category pills */}
            <div style={{ background: C.white, borderBottom: `1px solid ${C.tint}`, padding: `10px ${padX}px`, display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
                {DIETARY.map(d => { const active = dietary.includes(d); const n = dietaryCounts[d] ?? 0; const dead = !active && n === 0; return <button key={d} onClick={() => setDietary(active ? dietary.filter(x => x !== d) : [...dietary, d])} aria-pressed={active} disabled={dead} title={dead ? "No items match with your current filters" : undefined} style={{ padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: dead ? "not-allowed" : "pointer", fontFamily: "inherit", border: `2px solid ${active ? C.greenDark : C.tint}`, background: active ? C.greenDark : C.white, color: active ? C.white : C.teal, opacity: dead ? 0.4 : 1, transition: "all 0.12s" }}>{d} ({n})</button> })}
                <div style={{ width: 1, height: 18, background: C.tint, margin: "0 3px" }} aria-hidden="true" />
                {categories.map(cat => <button key={cat} onClick={() => setCategory(cat)} aria-pressed={category === cat} style={{ padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: `2px solid ${category === cat ? C.teal : C.tint}`, background: category === cat ? C.teal : C.white, color: category === cat ? C.white : C.teal, transition: "all 0.12s" }}>{cat} ({categoryCounts[cat] ?? 0})</button>)}
            </div>

            {/* Fetch error banner */}
            {isError && (
                <div role="alert" style={{ padding: `10px ${padX}px`, background: C.orangeLight, borderBottom: `1px solid ${C.orange}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: 12, color: C.orangeDark, fontWeight: 600 }}>Could not load menu data from endpoint.</span>
                    <button onClick={() => { setFetchState("idle"); setRetryKey(k => k + 1) }} style={{ padding: "5px 14px", borderRadius: 12, border: `2px solid ${C.orangeDark}`, background: "none", color: C.orangeDark, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
                </div>
            )}

            {/* Results count */}
            {!noItems && !isLoading && <div style={{ padding: `8px ${padX}px` }}><span style={{ fontSize: 13, color: C.teal, fontWeight: 600 }}>{cards.length} result{cards.length === 1 ? "" : "s"}{sortBy === "goal-fit" && goal !== "all" ? " — sorted by goal fit" : ""}</span></div>}

            {/* Main layout — grid + optional in-flow detail column (desktop split view) */}
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0, paddingBottom: trayState.items.length > 0 ? 88 : 0 }}>
                <div style={{ padding: `4px ${padX}px 60px`, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14, alignContent: "start" }}>

                    {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

                    {!isLoading && filtered.length === 0 && (
                        <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 0" }}>
                            <div style={{ fontSize: 32, fontWeight: 800, color: C.ink, opacity: 0.08, marginBottom: 14 }}>—</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 6 }}>{noItems ? "No items yet" : "Nothing matches"}</div>
                            <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 16 }}>
                                {noItems && !cmsEndpoint ? "Add items via the Items panel, or paste a CMS Endpoint URL." : noItems && cmsEndpoint ? "Waiting for data from endpoint…" : "Try relaxing one of these filters:"}
                            </div>
                            {!noItems && (
                                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                                    {goal !== "all"    && <button onClick={() => setGoal("all")} style={{ padding: "8px 16px", borderRadius: 12, border: `2px solid ${C.teal}`,   background: C.tealLight,   color: C.teal,   fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Browse all goals</button>}
                                    {category !== "All"  && <button onClick={() => setCategory("All")}  style={{ padding: "8px 16px", borderRadius: 12, border: `2px solid ${C.teal}`,   background: C.tealLight,   color: C.teal,   fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>All categories</button>}
                                    {dietary.length > 0  && <button onClick={() => setDietary([])}      style={{ padding: "8px 16px", borderRadius: 12, border: `2px solid ${C.greenDark}`,  background: C.greenLight,  color: C.greenDark,  fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Clear dietary</button>}
                                    {search              && <button onClick={() => setSearch("")}        style={{ padding: "8px 16px", borderRadius: 12, border: `2px solid ${C.orangeDark}`, background: C.orangeLight, color: C.orangeDark, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Clear search</button>}
                                </div>
                            )}
                        </div>
                    )}

                    {!isLoading && cards.map((card, idx) => {
                        const item = card.partner && fmtSel[card.key]
                            ? ([card.item, card.partner].find(x => x.id === fmtSel[card.key]) ?? card.item)
                            : card.item
                        const alt        = card.partner
                        const isSelected = sel?.id === item.id
                        const inTray     = trayState.items.includes(item.id) || trayState.items.includes(item.title)
                        const score      = goal !== "all" ? fitScore(item, goal) : 0
                        const isTopMatch = goal !== "all" && score === maxScore && cards.length > 1
                        const trayFull   = !inTray && trayState.items.length >= MAX_TRAY
                        const cardKey    = alt ? card.key : (item.id !== String(idx) ? item.id : `${item.title}-${idx}`)
                        return (
                            <div key={cardKey} className="cbw-nc-card" style={{ background: C.white, borderRadius: 20, overflow: "hidden", border: `2px solid ${isSelected ? C.orange : inTray ? C.teal : isTopMatch ? "rgba(123,144,21,0.35)" : C.tint}`, boxShadow: isSelected ? `0 0 0 3px ${C.orangeLight}, 0 4px 20px rgba(13,79,79,0.12)` : C.shadow, transition: "box-shadow 0.18s, border-color 0.18s", position: "relative", animation: "cbwFadeUp 0.25s ease both", animationDelay: `${Math.min(idx * 0.03, 0.3)}s` }}>
                                {isTopMatch && !isSelected && <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 2, background: C.greenDark, color: C.white, fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "center", padding: "3px 0" }}>Best match</div>}
                                <button
                                    onClick={e => { e.stopPropagation(); if (!trayFull) handleToggleTray(item.id) }}
                                    aria-label={inTray ? `Remove ${item.title} from compare` : trayFull ? "Compare tray full" : `Add ${item.title} to compare`}
                                    aria-pressed={inTray}
                                    style={{ position: "absolute", top: isTopMatch && !isSelected ? 28 : 10, right: 10, zIndex: 3, minWidth: 88, minHeight: 36, padding: "0 12px", borderRadius: 999, background: inTray ? C.teal : trayFull ? C.inkGhost : "rgba(255,255,255,0.92)", border: `2px solid ${inTray ? C.teal : trayFull ? "transparent" : C.tint}`, color: inTray ? C.white : C.teal, fontSize: 11, fontWeight: 800, letterSpacing: "0.02em", cursor: trayFull ? "not-allowed" : "pointer", opacity: trayFull ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontFamily: "inherit" }}
                                >{inTray ? "✓ Comparing" : "⇄ Compare"}</button>
                                <div role="button" tabIndex={0} data-cbw-open={item.id} aria-expanded={isSelected} aria-label={`${item.title} — view details`}
                                    onClick={() => setSelected(isSelected ? null : item.id)}
                                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(isSelected ? null : item.id) } }}
                                    style={{ cursor: "pointer", outlineOffset: -2 }}>
                                    <div style={{ height: 140, background: C.inkGhost, overflow: "hidden", marginTop: isTopMatch && !isSelected ? 20 : 0 }}>
                                        {(item.thumbnail || alt?.thumbnail)
                                            ? <img src={item.thumbnail || alt!.thumbnail} loading="lazy" alt="" role="presentation" onError={e => { const el = e.currentTarget; const fb = item.id === card.item.id ? card.partner?.thumbnail : card.item.thumbnail; if (fb && el.src !== fb) { el.src = fb } else { el.style.display = "none" } }} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                            : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${C.tealLight}, ${C.inkGhost})` }} />}
                                    </div>
                                    <div style={{ padding: "11px 13px 13px" }}>
                                        {alt && (() => {
                                            const wrapV = item.title.endsWith("Wrap") ? item : alt
                                            const bowlV = wrapV.id === item.id ? alt : item
                                            return (
                                                <div style={{ display: "flex", gap: 4, marginBottom: 7 }} role="group" aria-label="Format">
                                                    {[wrapV, bowlV].map(v => {
                                                        const active = v.id === item.id
                                                        const label  = v.title.endsWith("Wrap") ? "Wrap" : "Bowl"
                                                        return (
                                                            <button key={v.id} onClick={e => { e.stopPropagation(); setFmtSel(p => ({ ...p, [card.key]: v.id })) }} aria-pressed={active}
                                                                style={{ padding: "3px 11px", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: `1.5px solid ${active ? C.teal : C.tint}`, background: active ? C.teal : C.white, color: active ? C.white : C.teal, transition: "all 0.12s" }}>
                                                                {label}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            )
                                        })()}
                                        <div style={{ fontSize: 15, fontWeight: 800, color: C.teal, marginBottom: 2, lineHeight: 1.3 }}><Highlight text={item.title} query={deferredSearch} /></div>
                                        {item.shortIngr && <div style={{ fontSize: 11, color: C.inkSoft, marginBottom: showMacros ? 8 : 0, lineHeight: 1.4 }}><Highlight text={item.shortIngr} query={deferredSearch} /></div>}
                                        {showMacros && (item.protein > 0 || item.carbs > 0) && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ fontSize: 10, color: C.orangeDark, fontWeight: 700, minWidth: 30, flexShrink: 0 }}>{item.protein}g{item.variable ? "+" : ""}</span><MacroBar value={item.protein} max={maxProtein} color={C.orange} /><span style={{ fontSize: 9, color: C.inkSoft, minWidth: 18, flexShrink: 0 }}>pro</span></div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ fontSize: 10, color: C.amber, fontWeight: 700, minWidth: 30, flexShrink: 0 }}>{item.carbs}g{item.variable ? "+" : ""}</span><MacroBar value={item.carbs} max={maxCarbs} color={C.yellow} /><span style={{ fontSize: 9, color: C.inkSoft, minWidth: 18, flexShrink: 0 }}>carb</span></div>
                                            </div>
                                        )}
                                        {/* Compact allergen line — visible without opening the item, so
                                            someone scanning the grid for a safe option can rule items
                                            out at a glance. Mirrors the detail panel's three states. */}
                                        {(() => {
                                            const al = readAllergens(item)
                                            if (al.state === "list") return (
                                                <div style={{ fontSize: 10, color: C.orangeDark, fontWeight: 700, marginBottom: 6, lineHeight: 1.4 }}>
                                                    Contains {al.list.join(", ")}
                                                </div>
                                            )
                                            if (al.state === "none") return (
                                                <div style={{ fontSize: 10, color: C.greenDark, fontWeight: 700, marginBottom: 6, lineHeight: 1.4 }}>
                                                    No major allergens
                                                </div>
                                            )
                                            return (
                                                <div style={{ fontSize: 10, color: C.inkSoft, fontWeight: 600, marginBottom: 6, lineHeight: 1.4, fontStyle: "italic" }}>
                                                    Allergens not confirmed
                                                </div>
                                            )
                                        })()}
                                        {/* The conditional-diet caveat rides on the card whenever the
                                            grid is filtered to Vegan or Vegetarian. Without it the card
                                            reads as an unqualified vegan claim for a dish the kitchen
                                            builds with chicken by default. */}
                                        {dietCaveat(item) && (dietary.includes("Vegan") || dietary.includes("Vegetarian")) && (
                                            <div style={{ fontSize: 10, color: C.teal, fontWeight: 700, marginBottom: 6, lineHeight: 1.4 }}>
                                                Order without chicken
                                            </div>
                                        )}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            {item.calories > 0
                                                ? <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{item.calories}{item.variable ? "+" : ""}<span style={{ fontSize: 10, fontWeight: 600, color: C.inkSoft }}> cal</span></span>
                                                : <span style={{ fontSize: 11, fontWeight: 600, color: C.inkSoft, fontStyle: "italic" }}>nutrition coming soon</span>}
                                            {item.price > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: C.teal }}>${item.price.toFixed(2)}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
              </div>
              {sel && !isMobile && (
                <aside style={detailColStyle} role="region" aria-label={`${sel.title} details`}>{detailInner}</aside>
              )}
            </div>

            {/* Mobile bottom sheet — thumb-reachable, dims page, tap-scrim to close */}
            {sel && isMobile && (
                <>
                    <div onClick={handleClose} aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 199, background: "rgba(28,43,28,0.45)", animation: "cbwFadeUp 0.2s ease" }} />
                    <div style={sheetStyle} role="dialog" aria-modal="true" aria-label={`${sel.title} details`}>{detailInner}</div>
                </>
            )}

            {/* Nutrition disclaimer — same wording as crazybowlsandwraps.com/nutrition-information */}
            <div id="nutrition-disclaimer" style={{ padding: `0 ${padX}px 24px`, paddingBottom: trayState.items.length > 0 ? 104 : 24, scrollMarginTop: 80 }}>
                <p style={{ fontSize: 11, color: C.inkSoft, lineHeight: 1.6, maxWidth: 720, margin: 0 }}>
                    Please note that these nutrition values are estimated based on our standard serving portions.
                    As food servings may have a slight variance each time you visit, please expect these values to be
                    within 10% +/- of your actual meal. If you have any questions about our nutrition calculator,
                    please contact{" "}
                    <a href="https://www.nutritionix.com" target="_blank" rel="noopener noreferrer" style={{ color: C.teal, fontWeight: 600 }}>Nutritionix</a>.
                </p>
                <p style={{ fontSize: 11, color: C.inkSoft, lineHeight: 1.6, maxWidth: 720, margin: "6px 0 0" }}>
                    Items without values shown are pending nutrition analysis — please ask our staff about ingredients
                    and allergens.
                </p>
                <p style={{ fontSize: 11, color: C.inkSoft, lineHeight: 1.6, maxWidth: 720, margin: "6px 0 0" }}>
                    Consuming raw or undercooked meats, poultry, seafood, shellfish, or eggs may increase your risk of
                    foodborne illness. Menu items may contain or come into contact with common allergens such as
                    peanuts and gluten.
                </p>
                <p style={{ fontSize: 11, color: C.inkSoft, lineHeight: 1.6, maxWidth: 720, margin: "6px 0 0" }}>
                    Dietary tags (Vegetarian, Vegan, Gluten-Free, High Protein, Low Carb, GLP-1 Friendly) are computed
                    from ingredient and allergen data and are provided for general guidance only — not medical advice.
                    "GLP-1 Friendly" describes protein-forward, portion-conscious meals and is not a claim about any
                    medication; talk to your doctor or dietitian about what fits your plan. Shared kitchen equipment
                    means we can't guarantee any item is fully free of a given allergen — please tell our staff about
                    any allergy before ordering.
                </p>
                {/* Build + data stamp. Deliberately visible (small, muted) so "did my change
                    actually go live?" is answered by reading one string instead of counting
                    items in a filter and inferring. BUMP `BUILD` on every push. `items` is
                    read from the live feed, so a stale Worker shows up here too. */}
                <p style={{ fontSize: 10, color: C.inkSoft, opacity: 0.7, margin: "10px 0 0", fontFamily: "monospace" }}>
                    build {BUILD} · {effectiveItems.length} items loaded
                </p>
            </div>

            {/* Comparison tray — THE BOWL-OFF */}
            {trayState.items.length > 0 && (
                <div ref={trayRef} role="region" aria-label="Compare tray — The Bowl-Off" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: C.creamBg, border: `3px solid ${C.brandGreen}`, borderBottom: "none", borderRadius: "24px 24px 0 0", boxShadow: `0 -6px 0 ${C.lime}` }}>
                    {showCoachMark && (
                        <div role="status" style={{ position: "absolute", bottom: "100%", left: padX, right: padX, marginBottom: 10, background: C.brandGreen, color: C.creamBg, padding: "10px 14px", borderRadius: 12, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}>
                            <span>Pick another bowl to go head-to-head.</span>
                            <button onClick={() => setShowCoachMark(false)} aria-label="Dismiss tip" style={{ background: "none", border: "none", color: C.creamBg, fontSize: 16, cursor: "pointer", lineHeight: 1, fontFamily: "inherit" }}>×</button>
                        </div>
                    )}
                    <button onClick={() => handleToggleOpen()} aria-expanded={trayState.open} style={{ width: "100%", padding: `10px ${padX}px`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                        <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                            <span style={{ fontFamily: "Passion One, sans-serif", fontSize: 20, fontWeight: 400, color: C.brandGreen, letterSpacing: "0.02em", textTransform: "uppercase" }}>The Bowl-Off</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{trayState.items.length}/{MAX_TRAY}</span>
                        </span>
                        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                            {budget > 0 && budgetRemaining !== null
                                ? <span style={{ fontSize: 11, fontWeight: 700, color: budgetRemaining >= 0 ? C.brandGreen : C.orangeDark }}>{budgetRemaining >= 0 ? `${budgetRemaining} cal under budget` : `${Math.abs(budgetRemaining)} cal over budget`}</span>
                                : <span style={{ fontSize: 11, color: C.ink, fontWeight: 600 }}>{trayTotals.calories} cal · {trayTotals.protein}g pro{isMobile ? "" : ` · ${trayTotals.carbs}g carbs combined`}</span>}
                            <span style={{ fontSize: 14, color: C.ink, opacity: 0.5 }} aria-hidden="true">{trayState.open ? "▼" : "▲"}</span>
                        </div>
                    </button>
                    {trayState.open && (
                        <div style={{ padding: `0 ${padX}px 20px`, display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ fontSize: 12, color: C.ink, opacity: 1, marginTop: -4 }}>Two bowls enter. Your macros decide.</div>

                            {/* Side-by-side compare columns */}
                            <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
                                {trayItems.map(item => {
                                    // Winner badges compare only fixed-value items — a floor value
                                    // ("from 150") can't honestly win "most protein" or "lightest".
                                    const fixedTray      = trayItems.filter(i => !i.variable)
                                    const proteinValues = fixedTray.map(i => i.protein)
                                    const calorieValues = fixedTray.filter(i => i.calories > 0).map(i => i.calories)
                                    const isMostProtein = !item.variable && fixedTray.length > 1 && new Set(proteinValues).size > 1 && item.protein === Math.max(...proteinValues)
                                    const isLightest     = !item.variable && fixedTray.length > 1 && item.calories > 0 && new Set(calorieValues).size > 1 && item.calories === Math.min(...calorieValues)
                                    return (
                                        <div key={item.id} style={{ flexShrink: 0, width: 200, background: C.white, borderRadius: 16, overflow: "hidden", border: `2px solid ${C.brandGreen}` }}>
                                            {item.thumbnail && <img src={item.thumbnail} alt="" role="presentation" style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} />}
                                            <div style={{ padding: "10px 12px" }}>
                                                {(isMostProtein || isLightest) && (
                                                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 }}>
                                                        {isMostProtein && <span style={{ fontSize: 9, fontWeight: 800, color: C.white, background: C.dragonfruit, borderRadius: 999, padding: "3px 8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Most protein</span>}
                                                        {isLightest && <span style={{ fontSize: 9, fontWeight: 800, color: C.white, background: C.brandGreen, borderRadius: 999, padding: "3px 8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Lightest</span>}
                                                    </div>
                                                )}
                                                <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 6 }}>{item.title}</div>
                                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                                    <span style={{ fontSize: 11, color: C.ink, fontWeight: 700 }}>{item.variable ? `${item.calories}+ cal †` : item.calories > 0 ? `${item.calories} cal` : "cal †"}</span>
                                                    <span style={{ fontSize: 11, color: C.ink, fontWeight: 600 }}>{item.protein}g{item.variable ? "+" : ""} pro</span>
                                                    <span style={{ fontSize: 11, color: C.ink, fontWeight: 600 }}>{item.carbs}g{item.variable ? "+" : ""} carb</span>
                                                </div>
                                                {item.price > 0 && <div style={{ fontSize: 11, color: C.inkSoft, fontWeight: 600, marginTop: 4 }}>${item.price.toFixed(2)}</div>}
                                                <button onClick={() => handleToggleTray(item.id)} aria-label={`Remove ${item.title} from compare`} style={{ marginTop: 8, padding: "5px 12px", borderRadius: 12, border: `1.5px solid ${C.brandGreen}`, background: "none", color: C.brandGreen, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div style={{ flexShrink: 0, width: 200, background: C.white, borderRadius: 16, padding: "14px 16px", border: `2px solid ${C.brandGreen}`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                    <div style={{ fontFamily: "Passion One, sans-serif", fontSize: 17, fontWeight: 400, color: C.brandGreen, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>The Damage</div>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, marginBottom: 2 }}>{trayTotals.calories}<span style={{ fontSize: 12, color: C.inkSoft }}> cal</span></div>
                                    <div style={{ fontSize: 13, color: C.ink, fontWeight: 700 }}>{trayTotals.protein}g protein</div>
                                    <div style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600 }}>{trayTotals.carbs}g carbs</div>
                                    {trayTotals.price > 0 && <div style={{ fontSize: 13, color: C.ink, fontWeight: 700, marginTop: 6 }}>${trayTotals.price.toFixed(2)} total</div>}
                                    {trayItems.some(i => i.variable || i.calories <= 0) && <div style={{ fontSize: 10, color: C.inkSoft, marginTop: 8, lineHeight: 1.4 }}>† starts from the lightest flavor — not included in totals</div>}
                                    {budget > 0 && <div style={{ marginTop: 10, fontSize: 11, color: trayTotals.calories <= budget ? C.brandGreen : C.orangeDark, fontWeight: 700 }}>{trayTotals.calories <= budget ? `${budget - trayTotals.calories} cal under budget` : `${trayTotals.calories - budget} cal over budget`}</div>}
                                    <button onClick={() => trayDispatch({ type: "CLEAR" })} style={{ marginTop: 12, padding: "6px 14px", borderRadius: 12, border: `1.5px solid ${C.brandGreen}`, background: "none", color: C.brandGreen, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-start" }}>Clear all</button>
                                </div>
                            </div>

                            <a href={orderHref} target="_blank" rel="noreferrer" onClick={() => dataLayerPush("order", trayState.items)} style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 24px", borderRadius: 999, background: C.brandGreen, color: C.white, fontWeight: 800, fontSize: 14, textDecoration: "none", boxShadow: `4px 4px 0 ${C.lime}`, fontFamily: "inherit" }}>
                                Order these →
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ── 13. Export + property controls ───────────────────────────────────────────

export default NutritionCalculator

addPropertyControls(NutritionCalculator, {
    cmsEndpoint: {
        type: ControlType.String,
        title: "CMS Endpoint",
        placeholder: "https://api.framer.com/store/api/v1/collections/fEfKTjIH1/items",
        description: "Framer CMS API URL or any JSON endpoint returning menu items. Supports Framer's { type, value } field format, flat arrays, and { items: [] } wrappers.",
    },
    apiKey: {
        type: ControlType.String,
        title: "API Key",
        placeholder: "Bearer token for authenticated endpoints",
        description: "Optional. Sent as Authorization: Bearer {key}. Required for the Framer CMS API — get one from Framer → Settings → Developers.",
    },
    items: {
        type: ControlType.Array,
        title: "Items (manual)",
        control: {
            type: ControlType.Object,
            controls: {
                title:       { type: ControlType.String, title: "Title" },
                calories:    { type: ControlType.Number, title: "Calories",          defaultValue: 0 },
                protein:     { type: ControlType.Number, title: "Protein (g)",       defaultValue: 0 },
                carbs:       { type: ControlType.Number, title: "Carbs (g)",         defaultValue: 0 },
                fat:         { type: ControlType.Number, title: "Fat (g)",           defaultValue: 0 },
                category:    { type: ControlType.String, title: "Category" },
                price:       { type: ControlType.Number, title: "Price",             defaultValue: 0 },
                ingredients: { type: ControlType.String, title: "Ingredients" },
                shortIngr:   { type: ControlType.String, title: "Short Ingredients" },
                description: { type: ControlType.String, title: "Description" },
                thumbnail:   { type: ControlType.Image,  title: "Thumbnail" },
                allergens:   { type: ControlType.String, title: "Allergens", description: "e.g. 'Milk, Wheat, Soy' — cross-checked against the dietary-tag filters" },
                dietaryTags: { type: ControlType.String, title: "Dietary Tags", description: "e.g. 'vegan, gluten-free' — overrides the ingredient/allergen guess when set" },
            },
        },
    },
    orderUrl:   { type: ControlType.String, title: "Order URL",   defaultValue: "https://crazybowlswraps.order.online/business/-193068?delivery=true" },
    fontFamily: { type: ControlType.String, title: "Font Family", defaultValue: "Bricolage Grotesque, sans-serif" },
    stickyOffset: { type: ControlType.Number, title: "Sticky Offset", defaultValue: 96, min: 0, max: 240, unit: "px", description: "Height of the site's floating nav — keeps the detail panel (and its close button) below it." },
})
