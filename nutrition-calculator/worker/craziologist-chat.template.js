// CBW Craziologist chat backend — Cloudflare Worker (C3, patched 2026-08-04)
// Deploy: paste into the craziologist-chat Worker. Secrets/vars unchanged:
//   ANTHROPIC_API_KEY (secret), CHAT_MODEL (plain var, default claude-sonnet-5)
// Endpoint: POST /chat { messages: [{role, content}...] } -> { reply, toolCalls }
// Stateless: the widget sends the visible conversation each turn (capped below).
//
// ── 2026-08-04 PATCH ──────────────────────────────────────────────────────────
// The previous deploy inlined a MENU_DATA snapshot from the pre-audit
// "nutrition worker v2" (Nutritionix, verified 2026-07-12). It lacked the
// dietaryTags and dietNote fields entirely, so the model inferred vegan/
// vegetarian from allergen absence — and meat, honey and gelatin are not
// allergens. Live failures: called the Thai Bowl "plant based as served"
// (built with chicken; peanut sauce contains honey) and the Power Bowl
// "vegetarian as built" (its measured recipe includes grilled chicken).
// This version:
//   1. MENU_DATA is GENERATED from the nutrition worker file by
//      data/build_chat_menu.cjs in the audit repo. Regenerate on every feed
//      change: node data/build_chat_menu.cjs && paste the output worker here.
//   2. dietaryTags + dietNote flow through searchMenu/excludeAllergens
//      (compact) and getItem (full record).
//   3. The system prompt answers diet questions ONLY from those fields.
// MENU_DATA source: __MENU_SOURCE__

// ============ TOOL LAYER (eval-certified) ============
const ORDER_DELIVERY = "https://crazybowlswraps.order.online/business/-193068?delivery=true"
const ORDER_PICKUP = "https://crazybowlsandwraps.orderexperience.net/locations"
const TZ = "America/Chicago"
const ALLERGENS = ["Eggs", "Fish", "Milk", "Peanuts", "Sesame", "Shellfish", "Soy", "Wheat", "Tree Nuts"]

// GENERATED — do not hand-edit. node data/build_chat_menu.cjs regenerates this
// block from the current nutrition worker. allergens === null means the item's
// panel is unverified (the builder maps "unconfirmed" to null so the existing
// fail-closed checks keep working).
const MENU_DATA = /*__MENU_DATA__*/[]
const MENU_DISCLAIMER = "Please note that these nutrition values are estimated based on our standard serving portions. As food servings may have a slight variance each time you visit, please expect these values to be within 10% +/- of your actual meal. If you have any questions about our nutrition calculator, please contact Nutritionix."
async function loadMenu() { return { items: MENU_DATA, disclaimer: MENU_DISCLAIMER } }

const hasData = (i) => Number(i.calories) > 0
const hasAllergens = (i) => typeof i.allergens === "string" && i.allergens.length > 0

// ---- searchMenu ----
async function searchMenu({ query, category, maxCalories, minProtein, limit = 8 } = {}) {
    const { items } = await loadMenu()
    let list = items
    if (category) list = list.filter((i) => i.category.toLowerCase() === String(category).toLowerCase())
    if (query) {
        const norm = (x) => String(x).toLowerCase().replace(/&/g, " ").replace(/\band\b/g, " ").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim()
        const q = norm(query)
        list = list.filter((i) => norm(i.title + " " + i.ingredients + " " + i.description + " " + (i.dietaryTags || "")).includes(q))
    }
    if (maxCalories != null) list = list.filter((i) => hasData(i) && i.calories <= maxCalories)
    if (minProtein != null) list = list.filter((i) => hasData(i) && i.protein >= minProtein)
    const unverified = list.filter((i) => !hasData(i)).map((i) => i.title)
    return {
        results: list.slice(0, limit).map(compact),
        note: unverified.length
            ? `MUST TELL USER when comparing numbers: ${unverified.length} item(s) here have no verified nutrition yet and are excluded from any numeric comparison (${unverified.slice(0, 4).join(", ")}${unverified.length > 4 ? ", ..." : ""}).`
            : (maxCalories != null || minProtein != null) ? "Items without verified nutrition data were excluded from numeric filters." : undefined,
    }
}

// ---- getItem ----
async function getItem({ slug }) {
    const { items, disclaimer } = await loadMenu()
    const norm = (x) => String(x).toLowerCase().replace(/&/g, " ").replace(/\band\b/g, " ").replace(/-/g, " ").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim()
    let i = items.find((x) => x.slug === slug || norm(x.title) === norm(slug) || norm(x.slug) === norm(slug))
    if (!i) {
        // fuzzy: title tokens ⊆ query tokens, or query tokens ⊆ title tokens
        const qTok = new Set(norm(slug).split(" ").filter(Boolean))
        const scored = items.map((x) => {
            const tTok = norm(x.title).split(" ").filter(Boolean)
            const hit = tTok.filter((w) => qTok.has(w)).length
            return { x, hit, exact: hit === tTok.length && hit > 0 }
        }).filter((s) => s.hit > 0)
        const exacts = scored.filter((s) => s.exact)
        if (exacts.length === 1) i = exacts[0].x
        else if (exacts.length > 1) {
            // shortest title wins the tie (e.g. "tortilla chips" -> "Chips" over "Chips & Queso")
            exacts.sort((a, b) => a.x.title.length - b.x.title.length)
            if (norm(exacts[0].x.title).split(" ").every((w) => qTok.has(w))) i = exacts[0].x
            else return { error: "ambiguous", candidates: exacts.slice(0, 4).map((s) => s.x.slug), hint: "call getItem again with one of these slugs" }
        }
    }
    if (!i) return { error: "not_found", slug, hint: "try searchMenu with a shorter query" }
    return { ...i, dataStatus: hasData(i) ? "verified" : "pending", allergenStatus: hasAllergens(i) ? "verified" : "unverified", disclaimer }
}

// ---- excludeAllergens ----
async function excludeAllergens({ avoid = [], category } = {}) {
    const bad = avoid.map((a) => String(a).toLowerCase().replace(/s$/, ""))
    const known = ALLERGENS.map((a) => a.toLowerCase().replace(/s$/, ""))
    const unknown = bad.filter((b) => !known.includes(b))
    if (unknown.length) return { error: "unknown_allergen", unknown, supported: ALLERGENS }
    const { items } = await loadMenu()
    let list = items
    if (category) list = list.filter((i) => i.category.toLowerCase() === String(category).toLowerCase())
    const safe = [], excluded_unverified = []
    for (const i of list) {
        if (!hasAllergens(i)) { excluded_unverified.push(i.title); continue }
        if (i.allergens === "None") { safe.push(compact(i)); continue }
        const flags = i.allergens.toLowerCase()
        if (!bad.some((b) => flags.includes(b))) safe.push(compact(i))
    }
    return {
        safe,
        excluded_unverified,
        mandatory_note: "Panels reflect standard recipes. Cross-contact is possible in shared kitchens — always confirm serious allergies with staff in-store.",
    }
}

// ---- macroMath ----
async function macroMath({ slugs = [], op = "sum", field = "calories", quantities } = {}) {
    const FIELDS = ["calories", "protein", "carbs", "fat", "sodium", "fiber", "sugars"]
    if (!FIELDS.includes(field)) return { error: "bad_field", supported: FIELDS }
    const { items } = await loadMenu()
    const picked = slugs.map((s, idx) => {
        const i = items.find((x) => x.slug === s)
        return i && { slug: s, title: i.title, value: i[field] ?? 0, qty: quantities?.[idx] ?? 1, verified: hasData(i) }
    })
    if (picked.some((p) => !p)) return { error: "not_found", slugs: slugs.filter((s) => !items.find((x) => x.slug === s)) }
    if (picked.some((p) => !p.verified)) return { error: "unverified_item", items: picked.filter((p) => !p.verified).map((p) => p.slug), note: "Cannot do math on unverified values." }
    if (op === "sum") return { op, field, total: picked.reduce((a, p) => a + p.value * p.qty, 0), parts: picked }
    if (op === "compare") return { op, field, ranked: [...picked].sort((a, b) => b.value - a.value) }
    if (op === "min" || op === "max") {
        const sorted = [...picked].sort((a, b) => a.value - b.value)
        return { op, field, result: op === "min" ? sorted[0] : sorted[sorted.length - 1] }
    }
    return { error: "bad_op", supported: ["sum", "compare", "min", "max"] }
}

// ---- nearestOpenStore ----
const LOCATIONS = /*__LOCATIONS__*/[]
const toRad = (d) => (d * Math.PI) / 180
function miles(a, b) {
    const R = 3958.8
    const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng)
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.asin(Math.sqrt(h))
}
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
function parseSpan(spec) {
    // "Mon–Fri 7:00am–9:00pm" | "Sat–Sun 8:00am–9:00pm" | "Sun Closed" | "Mon–Sat 8:00am–9:00pm"
    const m = spec.match(/^(\w{3})(?:[–-](\w{3}))?\s+(.+)$/)
    if (!m) return null
    const d1 = DAYS.indexOf(m[1]), d2 = m[2] ? DAYS.indexOf(m[2]) : d1
    if (/closed/i.test(m[3])) return { d1, d2, closed: true }
    const t = m[3].match(/(\d{1,2}):(\d{2})(am|pm)[–-](\d{1,2}):(\d{2})(am|pm)/i)
    if (!t) return null
    const mins = (h, mm, ap) => ((h % 12) + (ap.toLowerCase() === "pm" ? 12 : 0)) * 60 + Number(mm)
    return { d1, d2, open: mins(+t[1], t[2], t[3]), close: mins(+t[4], t[5], t[6]) }
}
function coversDay(span, day) {
    if (span.d1 <= span.d2) return day >= span.d1 && day <= span.d2
    return day >= span.d1 || day <= span.d2
}
function storeStatus(loc, now = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(now)
    const get = (t) => parts.find((p) => p.type === t)?.value
    const day = DAYS.indexOf(get("weekday"))
    const nowMin = Number(get("hour")) * 60 + Number(get("minute"))
    for (const spec of [loc.hoursWeekday, loc.hoursWeekend].filter(Boolean)) {
        const span = parseSpan(spec)
        if (!span || !coversDay(span, day)) continue
        if (span.closed) return { open: false, reason: "closed_today" }
        if (nowMin >= span.open && nowMin < span.close) {
            const h24 = Math.floor(span.close / 60), m = span.close % 60
            const closesAt = `${((h24 + 11) % 12) + 1}:${String(m).padStart(2, "0")}${h24 >= 12 ? "pm" : "am"}`
            return { open: true, closesAt, note: "state closesAt verbatim; do not convert minutes to clock time yourself" }
        }
        return { open: false, reason: nowMin < span.open ? "before_open" : "after_close" }
    }
    return { open: false, reason: "no_hours_data" }
}
async function nearestOpenStore({ lat, lng, zip, limit = 3, now } = {}) {
    let here = lat != null && lng != null ? { lat, lng } : null
    let zipNote
    if (!here && zip) {
        const z = String(zip).replace(/\D/g, "").slice(0, 5)
        const exact = LOCATIONS.find((l) => String(l.zip || "").startsWith(z))
        const prefix = exact ? null : LOCATIONS.find((l) => String(l.zip || "").slice(0, 3) === z.slice(0, 3))
        const anchor = exact || prefix
        if (anchor && anchor.lat && anchor.lng) {
            here = { lat: anchor.lat, lng: anchor.lng }
            zipNote = exact ? `Zip ${z} matches our ${anchor.short || anchor.name} store's area.` : `Zip ${z} is near our ${anchor.short || anchor.name} store (matched by zip prefix).`
        } else {
            zipNote = `Zip ${z} is not near any store zip on file. Ask for their city or a cross street instead.`
        }
    }
    const ranked = LOCATIONS.filter((l) => !l.comingSoon && l.lat && l.lng)
        .map((l) => ({
            slug: l.slug, name: l.short || l.name, street: l.street, city: l.city, phone: l.phone,
            distanceMiles: here ? Math.round(miles(here, l) * 10) / 10 : null,
            status: storeStatus(l, now ? new Date(now) : new Date()),
            hours: { weekday: l.hoursWeekday, weekend: l.hoursWeekend, note: l.hoursNote || undefined },
            orderUrl: l.orderUrl, mapsUrl: l.mapsUrl,
        }))
        .sort((a, b) => (a.distanceMiles ?? 9e9) - (b.distanceMiles ?? 9e9))
    const total = ranked.length
    const shown = here ? ranked.slice(0, limit) : ranked
    return {
        stores: shown, totalStores: total, timezone: TZ, locationProvided: !!here, zipNote,
        note: here
            ? (shown.length < total ? `Showing the ${shown.length} nearest of ${total} locations.` : undefined)
            : `All ${total} locations returned. NEVER call a partial list "all locations". Do not read this whole list to the user: summarize (e.g. "${total} locations around the St. Louis metro, all open until 9pm") and ask where they are, or name 2-3 relevant ones.`,
    }
}

// ---- orderLink ----
function orderLink({ slug = "", mode = "delivery", campaign } = {}) {
    const base = mode === "pickup" ? ORDER_PICKUP : ORDER_DELIVERY
    const u = new URL(base)
    u.searchParams.set("utm_source", "site")
    u.searchParams.set("utm_medium", "chatbot")
    u.searchParams.set("utm_campaign", campaign || slug || "craziologist")
    return { url: u.toString(), mode }
}

// ---- escalate ----
function escalate({ reason, transcriptSummary = "" }) {
    const VALID = ["allergen_dispute", "illness_claim", "legal", "frustration", "policy_unknown", "other"]
    return {
        action: "handoff",
        reason: VALID.includes(reason) ? reason : "other",
        route: "https://crazybowlsandwraps.com/contact-us",
        message: "Connecting you with a human. This deserves a real person, not a carrot.",
        reply_instructions: "REQUIRED: open your reply with one genuine, human sentence acknowledging what this person experienced (e.g. being sick, being frustrated). Then give the contact route. No fault admission, no policy invention.",
        log: { at: new Date().toISOString(), transcriptSummary },
    }
}

const compact = (i) => ({
    slug: i.slug, title: i.title, category: i.category, price: i.price,
    shortIngr: i.shortIngr || i.ingredients || null,
    calories: hasData(i) ? i.calories : null, protein: hasData(i) ? i.protein : null,
    carbs: hasData(i) ? i.carbs : null, allergens: i.allergens ?? null,
    verified: i.verified ?? null,
    dietaryTags: i.dietaryTags ?? null, dietNote: i.dietNote ?? null,
})

// ---- Tool schemas (Anthropic tool-use format) for the chat backend ----
const TOOL_SCHEMAS = [
    { name: "searchMenu", description: "Search menu items by text, category, or macro filters. Numeric filters silently exclude unverified items (the result notes this). Results include dietaryTags/dietNote — the ONLY source for diet claims.", input_schema: { type: "object", properties: { query: { type: "string" }, category: { type: "string", enum: ["Bowls", "Wraps", "Breakfast", "Sides", "Starters", "Kids", "Desserts", "Salads"] }, maxCalories: { type: "number" }, minProtein: { type: "number" }, limit: { type: "number" } } } },
    { name: "getItem", description: "Full verified record for one item: macros, allergens, price, ingredients, dietaryTags, dietNote, data status, disclaimer. dietaryTags/dietNote are the ONLY source for vegan/vegetarian/gluten-free/dairy-free claims.", input_schema: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] } },
    { name: "excludeAllergens", description: "Items whose VERIFIED allergen panel excludes the given allergens. Unverified items are listed separately, never assumed safe. Result includes a mandatory staff-confirmation note that MUST be relayed. Allergen absence does NOT establish vegan/vegetarian — use dietaryTags for that.", input_schema: { type: "object", properties: { avoid: { type: "array", items: { type: "string" } }, category: { type: "string" } }, required: ["avoid"] } },
    { name: "macroMath", description: "All nutrition arithmetic: totals, comparisons, min/max. Refuses unverified items. Never compute nutrition numbers yourself.", input_schema: { type: "object", properties: { slugs: { type: "array", items: { type: "string" } }, op: { type: "string", enum: ["sum", "compare", "min", "max"] }, field: { type: "string", enum: ["calories", "protein", "carbs", "fat", "sodium", "fiber", "sugars"] }, quantities: { type: "array", items: { type: "number" } } }, required: ["slugs", "op"] } },
    { name: "nearestOpenStore", description: "Stores with live open/closed status from real hours (America/Chicago). Accepts lat/lng OR a 5-digit zip (matched against store zips). Without a location, returns all stores with a summarize instruction.", input_schema: { type: "object", properties: { lat: { type: "number" }, lng: { type: "number" }, zip: { type: "string" }, limit: { type: "number" } } } },
    { name: "orderLink", description: "UTM-tagged ordering hand-off link. The bot never takes orders itself.", input_schema: { type: "object", properties: { slug: { type: "string" }, mode: { type: "string", enum: ["delivery", "pickup"] }, campaign: { type: "string" } } } },
    { name: "escalate", description: "Hand off to a human. MANDATORY for: allergen disputes, illness/injury claims, legal language, repeated frustration, or any policy question not in the knowledge base.", input_schema: { type: "object", properties: { reason: { type: "string", enum: ["allergen_dispute", "illness_claim", "legal", "frustration", "policy_unknown", "other"] }, transcriptSummary: { type: "string" } }, required: ["reason"] } },
]


// ============ GUARDRAILS (eval-certified) ============
const RX = {
    allergen: /\b(allerg|celiac|gluten|dairy[- ]free|lactose|peanut|tree ?nut|nut[- ]free|nuts?|shellfish|sesame|soy|anaphyla|epipen)\b/i,
    medical: /\b(diabet|pregnan|blood (sugar|pressure)|keto(genic)? diet for|doctor said|medication|dietitian|weight loss plan)\b/i,
    incident: /\b(got (sick|ill)|food poisoning|threw up|vomit|hospital|reaction|hives|swelling)\b/i,
    legal: /\b(lawyer|attorney|sue|lawsuit|liab|legal action|health department)\b/i,
    injection: /\b(ignore (all|previous|your) (instructions|rules)|system prompt|you are now|pretend (to be|you're)|jailbreak|developer mode|repeat your instructions)\b/i,
    disparage: /\b(write|say|admit).{0,40}(worst|terrible|awful|hate|sucks).{0,40}(crazy bowls|cbw|this (place|company|restaurant))\b/i,
    policy: /\b(refund|coupon|discount code|promo code|free (bowl|meal|food)|guarantee|compensat)\b/i,
    quantity: /\b(\d{3,}|(?:one|two|three|five|ten) (?:thousand|hundred))\s*(?:x\s*)?(waters?|bowls?|wraps?|cups?|items?|orders?)\b/i,
}

function checkInput(text) {
    const t = String(text || "")
    const flags = Object.entries(RX).filter(([, rx]) => rx.test(t)).map(([k]) => k)
    return {
        flags,
        // routing directives the chat loop must honor
        requireTools: flags.includes("allergen") ? ["excludeAllergens|getItem"] : [],
        forceEscalate: flags.some((f) => ["incident", "legal"].includes(f)),
        escalateReason: flags.includes("legal") ? "legal" : flags.includes("incident") ? "illness_claim" : null,
        seriousTone: flags.some((f) => ["allergen", "medical", "incident", "legal"].includes(f)),
        policyGuard: flags.includes("policy"), // model may only cite Privacy Policy or escalate(policy_unknown)
        injectionSuspected: flags.includes("injection") || flags.includes("disparage"),
        quantityAbsurd: flags.includes("quantity"),
    }
}

// AI-isms and brand-voice violations. Output is rejected (regenerate) on any hard hit.
const HARD_BANS = [
    /—/, // em-dash
    /\p{Extended_Pictographic}/u, // emoji
    /\b(as an ai|language model|i'?m an assistant|as a chatbot)\b/i,
    /\b(delve|unleash|game-?changer|seamless(ly)?|elevate your|vibrant)\b/i,
    /\bin today'?s fast-paced world\b/i,
    /\b(look no further|buckle up|let'?s dive in|great question)\b/i,
    /\bit'?s not just (a|an|about)\b/i,
    /\bwhether you'?re .{3,40} or .{3,40},\b/i,
]
const SOFT_WARNS = [/\bit'?s worth noting\b/i, /\bultimately\b/i, /\bthat said\b/i, /!{2,}/]

function checkOutput(text, { toolNumbers = [], nutritionContext = false, inputCheck = {}, itemAllergens = null } = {}) {
    const t = String(text || "")
    const hard = HARD_BANS.filter((rx) => rx.test(t)).map((rx) => rx.source)
    const soft = SOFT_WARNS.filter((rx) => rx.test(t)).map((rx) => rx.source)
    const problems = []
    if (hard.length) problems.push({ type: "ai_ism_or_brand", detail: hard, action: "regenerate" })

    // Ungrounded-number guard: in nutrition contexts, every standalone number that looks like
    // a nutrition value must appear in this turn's tool results.
    if (nutritionContext) {
        const scan = t.replace(/(\d),(?=\d{3}\b)/g, "$1")
        const nums = [...scan.matchAll(/\b(\d{2,5})\s?(?:cal|calories|g\b|grams|mg)\b/gi)].map((m) => Number(m[1]))
        const allowed = new Set(toolNumbers.map(Number))
        allowed.add(10) // the ±10% disclaimer
        const rogue = nums.filter((n) => !allowed.has(n))
        if (rogue.length) problems.push({ type: "ungrounded_number", detail: rogue, action: "regenerate" })
    }
    // Serious-tone contexts must carry the staff line for allergens
    if (inputCheck.seriousTone && inputCheck.flags?.includes("allergen") && !/\b(staff|team|in-store|at the restaurant)\b/i.test(t)) {
        problems.push({ type: "missing_staff_confirmation", action: "regenerate" })
    }
    // Full-panel: if exactly one item's verified panel was fetched and the reply names any allergen, it must name them all
    if (itemAllergens && itemAllergens !== "None" && inputCheck.flags?.includes("allergen")) {
        const all = itemAllergens.split(",").map((a) => a.trim().toLowerCase())
        const named = all.filter((a) => t.toLowerCase().includes(a))
        if (named.length > 0 && named.length < all.length) {
            problems.push({ type: "incomplete_allergen_panel", detail: all.filter((a) => !t.toLowerCase().includes(a)), action: "regenerate" })
        }
    }
    // Policy contexts may not promise anything
    if (inputCheck.policyGuard && /\b(i('| a)ll (refund|credit|comp)|you('| wi)ll get a (refund|credit|free))\b/i.test(t)) {
        problems.push({ type: "invented_commitment", action: "block_and_escalate" })
    }
    return { ok: problems.length === 0, problems, warnings: soft }
}

// Extract every number from tool results this turn (feed to checkOutput)
function collectToolNumbers(toolResults) {
    const out = []
    const walk = (v) => {
        if (typeof v === "number") out.push(Math.round(v))
        else if (Array.isArray(v)) v.forEach(walk)
        else if (v && typeof v === "object") Object.values(v).forEach(walk)
    }
    walk(toolResults)
    return out
}


// ============ BRAIN ============
const SYSTEM_PROMPT = /*__SYSTEM_PROMPT__*/""
const KNOWLEDGE_PACK = /*__KNOWLEDGE_PACK__*/{}
const SYSTEM = SYSTEM_PROMPT + "\n\n## Knowledge pack\n" + JSON.stringify(KNOWLEDGE_PACK)

const IMPL = {
    searchMenu, getItem, excludeAllergens, macroMath, nearestOpenStore,
    orderLink: async (a) => orderLink(a), escalate: async (a) => escalate(a),
}

// ---- Scope fence (the Pepper lesson): off-topic free-compute requests get a canned decline ----
const OFFTOPIC = /\b(leetcode|write (me |some |my )?(code|python|javascript|sql|an essay|a cover letter|my resume)|debug (my|this)|homework|school assignment|solve for x|linked list|binary tree|regex for|translate this (into|to)|(python|javascript|java|c\+\+) (function|script|program))\b/i
const FENCE_REPLY = "I respect the hustle, but I'm a carrot, not a compiler. My entire brain is bowls, wraps, hours, and macros. Now, can I interest you in 62 grams of protein instead?"
const MAX_TURNS = 9, MAX_HISTORY = 24, MAX_MSG_CHARS = 2000

async function claude(env, body) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify(body),
    })
    if (!r.ok) throw new Error(`anthropic ${r.status}: ${await r.text()}`)
    return r.json()
}

async function runChat(env, history, emit = () => {}) {
    const userMsg = String(history[history.length - 1]?.content || "").slice(0, MAX_MSG_CHARS)
    if (OFFTOPIC.test(userMsg)) return { reply: FENCE_REPLY, toolCalls: [], escalated: false, fenced: true }
    const gate = checkInput(userMsg)
    const messages = history.slice(-MAX_HISTORY).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, MAX_MSG_CHARS) }))
    const toolResults = []
    let spokenText = [], rejections = 0, escalated = false
    for (let turn = 0; turn < MAX_TURNS; turn++) {
        const resp = await claude(env, {
            model: env.CHAT_MODEL || "claude-sonnet-5", max_tokens: 700,
            system: [
                { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
                { type: "text", text: (gate.seriousTone ? "[RUNTIME: serious tone required, no humor this reply]\n" : "") + (gate.forceEscalate ? `[RUNTIME: you MUST call escalate(${gate.escalateReason}) this turn]\n` : "") || "[RUNTIME: none]" },
            ],
            tools: TOOL_SCHEMAS, messages,
        })
        const toolUses = resp.content.filter((c) => c.type === "tool_use")
        const turnText = resp.content.filter((c) => c.type === "text").map((c) => c.text).join("\n")
        if (!toolUses.length) {
            const text = [...spokenText, turnText].filter(Boolean).join("\n")
            const panels = []
            for (const t of toolResults) {
                if (t.name === "getItem" && typeof t.result?.allergens === "string") panels.push(t.result.allergens)
                if (t.name === "searchMenu" && t.result?.results) {
                    const wp = t.result.results.filter((x) => typeof x.allergens === "string" && x.allergens)
                    if (wp.length === 1) panels.push(wp[0].allergens)
                }
            }
            const out = checkOutput(text, {
                toolNumbers: collectToolNumbers(toolResults),
                nutritionContext: /cal|protein|carb|gram|nutrition/i.test(userMsg + text),
                inputCheck: gate,
                itemAllergens: panels.length === 1 ? panels[0] : null,
            })
            const needsHours = /\b(open (now|right now)|hours|close|closing|closes|nearest)\b/i.test(userMsg)
            const missedHoursTool = needsHours && !toolResults.some((t) => t.name === "nearestOpenStore")
            const dietQ = /\b(vegan|vegetarian|gluten|dairy[- ]free|plant[- ]based)\b/i.test(userMsg)
            const missedDietTool = dietQ && !toolResults.some((t) => t.name === "getItem" || t.name === "searchMenu" || t.name === "excludeAllergens")
            if ((!out.ok || missedHoursTool || missedDietTool) && rejections < 2) {
                rejections++
                spokenText = []
                messages.push({ role: "assistant", content: text })
                emit({ type: "status", tool: "rewrite" })
                messages.push({ role: "user", content: "[AUTOMATED STYLE CHECK - not the customer] Your reply was rejected: " + (!out.ok ? JSON.stringify(out.problems) : missedHoursTool ? "hours question answered without nearestOpenStore - call it now" : "diet question answered without fetching the item's dietaryTags/dietNote - call getItem now and answer ONLY from those fields") + ". Rewrite it. Keep every correct fact and number. Never use the em dash character. Any number must come from a tool call in this conversation. Reply with the corrected message only." })
                continue
            }
            if (!out.ok) {
                // final backstop: never ship a rule-breaking reply
                return { reply: "I want to get this one exactly right and my double-checker flagged my draft. Ask me again in a slightly different way, or reach our team at https://crazybowlsandwraps.com/contact-us.", toolCalls: toolResults.map((t) => t.name), escalated, flagged: out.problems }
            }
            return { reply: text, toolCalls: toolResults.map((t) => t.name), escalated }
        }
        if (turnText) spokenText.push(turnText)
        messages.push({ role: "assistant", content: resp.content })
        const results = []
        for (const tu of toolUses) {
            if (tu.name === "escalate") escalated = true
            emit({ type: "status", tool: tu.name })
            let result
            try { result = await IMPL[tu.name](tu.input) } catch (e) { result = { error: String(e) } }
            toolResults.push({ name: tu.name, input: tu.input, result })
            results.push({ type: "tool_result", tool_use_id: tu.id, content: JSON.stringify(result) })
        }
        messages.push({ role: "user", content: results })
    }
    return { reply: "That one sent me in circles. Try asking a simpler version, or our team can help: https://crazybowlsandwraps.com/contact-us", toolCalls: toolResults.map((t) => t.name), escalated }
}


// ---- Blunt per-IP rate limit (per-isolate memory; pairs with Anthropic spend limits) ----
const ipHits = new Map()
function rateLimited(ip) {
    const now = Date.now()
    const rec = ipHits.get(ip) || { n: 0, t: now }
    if (now - rec.t > 60000) { rec.n = 0; rec.t = now }
    rec.n++
    ipHits.set(ip, rec)
    if (ipHits.size > 5000) ipHits.clear()
    return rec.n > 10
}

// Test hook: lets build_chat_menu.cjs smoke-test the tools after generation.
// Harmless in the Worker runtime (unused extra export).
export const __TOOLS__ = { searchMenu, getItem, excludeAllergens, macroMath, nearestOpenStore }

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
}

export default {
    async fetch(request, env) {
        if (request.method === "OPTIONS") return new Response(null, { headers: CORS })
        const url = new URL(request.url)
        if (request.method === "POST" && (url.pathname === "/chat" || url.pathname === "/chat-stream")) {
            const ip = request.headers.get("cf-connecting-ip") || "unknown"
            if (rateLimited(ip)) return Response.json({ reply: "Easy there. Even I need a breather between questions. Try again in a minute." }, { status: 429, headers: CORS })
        }
        if (request.method === "POST" && url.pathname === "/chat-stream") {
            let body
            try { body = await request.json() } catch { return Response.json({ error: "bad json" }, { status: 400, headers: CORS }) }
            if (!Array.isArray(body.messages) || !body.messages.length) return Response.json({ error: "messages required" }, { status: 400, headers: CORS })
            const { readable, writable } = new TransformStream()
            const writer = writable.getWriter()
            const enc = new TextEncoder()
            const sse = (obj) => writer.write(enc.encode("data: " + JSON.stringify(obj) + "\n\n")).catch(() => {})
            const work = (async () => {
                try {
                    const out = await runChat(env, body.messages, sse)
                    console.log(JSON.stringify({ q: String(body.messages[body.messages.length - 1]?.content || "").slice(0, 200), tools: out.toolCalls, escalated: out.escalated, fenced: out.fenced || false, flagged: out.flagged || null }))
                    await sse({ type: "reply", reply: out.reply, escalated: out.escalated })
                } catch (e) {
                    console.log("stream error: " + e.message)
                    await sse({ type: "reply", reply: "The carrot is briefly offline. Try again in a moment, or order directly at crazybowlswraps.order.online." })
                } finally { await writer.close().catch(() => {}) }
            })()
            if (typeof globalThis.waitUntil === "function") globalThis.waitUntil(work)
            return new Response(readable, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", ...CORS } })
        }
        if (request.method === "POST" && url.pathname === "/chat") {
            let body
            try { body = await request.json() } catch { return Response.json({ error: "bad json" }, { status: 400, headers: CORS }) }
            if (!Array.isArray(body.messages) || !body.messages.length) return Response.json({ error: "messages required" }, { status: 400, headers: CORS })
            try {
                const out = await runChat(env, body.messages)
                console.log(JSON.stringify({ q: String(body.messages[body.messages.length - 1]?.content || "").slice(0, 200), tools: out.toolCalls, escalated: out.escalated, flagged: out.flagged || null }))
                return Response.json(out, { headers: CORS })
            } catch (e) {
                console.log("chat error: " + e.message)
                return Response.json({ reply: "The carrot is briefly offline. Try again in a moment, or order directly at crazybowlswraps.order.online.", error: true }, { status: 200, headers: CORS })
            }
        }
        return Response.json({ ok: true, service: "craziologist" }, { headers: CORS })
    },
}
