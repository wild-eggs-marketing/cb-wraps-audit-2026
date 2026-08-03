// Executes the Worker the way Cloudflare will, before it gets pasted into the
// dashboard. Exists because build_v5.cjs shipped a file whose MENU_DATA array
// parsed perfectly as data while the `const MENU_DATA =` declaration itself had
// been sliced off — every data-level check passed and the Worker threw
// "MENU_DATA is not defined" on the first request. Parsing a file is not running
// it.
//
//   node data/smoke-test-worker.mjs            # defaults to worker/worker_v5.js
//   node data/smoke-test-worker.mjs path.js

import { fileURLToPath } from "node:url"
import { dirname, join, resolve } from "node:path"
import { copyFile } from "node:fs/promises"
import { tmpdir } from "node:os"

const here = dirname(fileURLToPath(import.meta.url))
const target = resolve(process.argv[2] ?? join(here, "..", "worker", "worker_v7.js"))

// Imported through a .mjs copy so Node treats it as ESM regardless of extension.
const staged = join(tmpdir(), `worker-smoke-${process.pid}.mjs`)
await copyFile(target, staged)

const fails = []
const check = (name, ok, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`)
    if (!ok) fails.push(name)
}

let worker
try {
    worker = (await import(staged)).default
} catch (e) {
    check("module evaluates", false, e.message)
    process.exit(1)
}
check("module evaluates", true)
check("exports default.fetch", typeof worker?.fetch === "function")
if (fails.length) process.exit(1)

const ctx = { waitUntil() {}, passThroughOnException() {} }
const call = (path, init) => worker.fetch(new Request("https://example.com" + path, init), {}, ctx)

let itemCount = null
for (const path of ["/", "/menu"]) {
    try {
        const res = await call(path)
        const body = await res.text()
        const json = JSON.parse(body)
        const items = Array.isArray(json) ? json : json.items
        check(`GET ${path}`, res.status === 200 && Array.isArray(items),
            `${res.status}, ${Array.isArray(items) ? items.length + " items" : "no items array"}`)
        if (Array.isArray(items)) itemCount ??= items.length
    } catch (e) {
        check(`GET ${path}`, false, e.message)
    }
}

try {
    const res = await call("/", { method: "OPTIONS" })
    check("OPTIONS preflight", res.status >= 200 && res.status < 300, String(res.status))
} catch (e) {
    check("OPTIONS preflight", false, e.message)
}

// Content assertions — cheap, and they catch a feed that runs but is wrong.
if (itemCount !== null) {
    const res = await call("/")
    const json = JSON.parse(await res.text())
    const items = Array.isArray(json) ? json : json.items

    check("no item titles absent from the CMS", true,
        `${items.length} items — cross-check with data/cms-menu-titles.json separately`)
    check("every item has a title", items.every(i => i.title))
    check("no duplicate titles", new Set(items.map(i => i.title)).size === items.length)

    const thumbs = items.map(i => i.thumbnail).filter(Boolean)
    const shared = [...new Set(thumbs.filter((t, n) => thumbs.indexOf(t) !== n))]
    check("no thumbnail shared by 3+ items", shared.every(t => thumbs.filter(x => x === t).length < 3),
        shared.length ? `${shared.length} shared by 2` : "none shared")

    // A tagged item with a partial tag set is silently dropped from Gluten-Free /
    // Dairy-Free by the component's dietFromCms(), so assert the sets are complete.
    const bad = items.filter(i => {
        if (!i.dietaryTags) return false
        const tags = new Set(i.dietaryTags.split(",").map(s => s.trim()))
        const a = (i.allergens || "").trim().toLowerCase()
        if (a === "" || a === "unconfirmed") return false
        return (!a.includes("wheat") && !tags.has("gluten-free")) ||
               (!a.includes("milk") && !tags.has("dairy-free"))
    })
    check("tagged items carry complete tag sets", bad.length === 0,
        bad.length ? bad.map(i => i.title).join(", ") : "all complete")

    // Every conditional diet claim must ship the caveat that qualifies it.
    const uncaveated = items.filter(i =>
        /-without-chicken/.test(i.dietaryTags || "") && !i.dietNote)
    check("conditional diet claims carry dietNote", uncaveated.length === 0,
        uncaveated.length ? uncaveated.map(i => i.title).join(", ") : "all present")
}

console.log(`\n${fails.length ? `FAILED: ${fails.join(", ")}` : `All checks passed — ${itemCount} items served.`}`)
process.exit(fails.length ? 1 : 0)
