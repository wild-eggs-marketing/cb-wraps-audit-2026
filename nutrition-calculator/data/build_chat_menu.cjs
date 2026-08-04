// Regenerates worker/craziologist-chat_v2.js — the FULL chat Worker file to
// paste into Cloudflare — from:
//   - worker/craziologist-chat.template.js  (code, placeholders)
//   - the current nutrition worker           (menu data incl. dietaryTags/dietNote)
//   - data/chat-static.json                  (locations + knowledge pack)
//   - data/chat-system-prompt.txt            (system prompt)
// Run after every worker bump: node data/build_chat_menu.cjs
// NOTE: if you bump the worker version, grep data/*.cjs for worker_v — every
// builder must move together (this one included).

const fs = require("fs")
const path = require("path")

const WORKER = path.join(__dirname, "..", "worker", "worker_v11.js")
const TEMPLATE = path.join(__dirname, "..", "worker", "craziologist-chat.template.js")
const STATIC = path.join(__dirname, "chat-static.json")
const PROMPT = path.join(__dirname, "chat-system-prompt.txt")
const OUT = path.join(__dirname, "..", "worker", "craziologist-chat_v2.js")

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
const feed = JSON.parse(src.slice(start, end + 1))

// Chat projection: everything the bot may state, nothing bulky. The huge
// ingredientStatement and allergenFlags stay out; dietaryTags/dietNote are the
// point of this whole exercise. allergens "unconfirmed" maps to null so the
// chat code's fail-closed hasAllergens() semantics keep working.
// The chat Worker's output guard bans em-dashes; a model quoting a field
// verbatim must not inherit one. Commas read identically in these sentences.
const noDash = (s) => (typeof s === "string" ? s.replace(/\s*\u2014\s*/g, ", ") : s)
const items = feed.map((i) => ({
    id: i.id, slug: i.slug, title: i.title,
    calories: i.calories, protein: i.protein, carbs: i.carbs, fat: i.fat,
    category: i.category, price: i.price,
    ingredients: noDash(i.ingredients), shortIngr: noDash(i.shortIngr), description: noDash(i.description),
    thumbnail: i.thumbnail,
    allergens: i.allergens === "unconfirmed" ? null : (i.allergens ?? null),
    sodium: i.sodium ?? null, fiber: i.fiber ?? null, sugars: i.sugars ?? null,
    satFat: i.satFat ?? null, servingGrams: i.servingGrams ?? null,
    verified: i.verified ?? null, source: i.source ?? null,
    dietaryTags: i.dietaryTags ?? null, dietNote: noDash(i.dietNote ?? null),
    allergenNote: noDash(i.allergenNote ?? null), dataConfidence: i.dataConfidence ?? null,
}))

const stat = JSON.parse(fs.readFileSync(STATIC, "utf8"))
const prompt = fs.readFileSync(PROMPT, "utf8").trimEnd()

let out = fs.readFileSync(TEMPLATE, "utf8")
const put = (marker, value) => {
    if (!out.includes(marker)) throw new Error("marker missing: " + marker)
    out = out.replace(marker, () => value)
}
put("/*__MENU_DATA__*/[]", JSON.stringify(items))
put("/*__LOCATIONS__*/[]", JSON.stringify(stat.locations, null, 1))
put("/*__SYSTEM_PROMPT__*/\"\"", JSON.stringify(prompt))
put("/*__KNOWLEDGE_PACK__*/{}", JSON.stringify(stat.knowledgePack))
put("__MENU_SOURCE__", path.basename(WORKER) + " (generated " + "2026-08-04" + ")")

fs.writeFileSync(OUT, out)
console.log("wrote", OUT, "(" + out.length + " bytes),", items.length, "menu items,", stat.locations.length, "locations")
if (/99 (menu )?items/.test(out)) throw new Error("hardcoded item count leaked into output")
const pb = items.find((i) => i.slug === "power-bowl")
console.log("Power Bowl:", pb.dietaryTags, "|", (pb.dietNote || "").slice(0, 60))
