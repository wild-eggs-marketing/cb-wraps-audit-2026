# Advisory Panel — Addendum to FINAL-REPORT

**4 August 2026.** The data-integrity and unused-assets reports were lost to a
container restart before delivery; both were recovered from the agent transcripts
(preserved verbatim in `data/panel-data-integrity.md` and
`data/panel-unused-assets.md`). This addendum covers what they found and what has
now been done about it. All five panel lenses are now accounted for.

---

## Data integrity — findings and actions

Every claim below was re-verified against the raw 311-row export before acting;
none was taken on the advisor's word.

### Fixed in Worker v8 + calculator build `2026-08-04-10` (delivered today)

| # | Finding | Fix | Confidence |
|---|---|---|---|
| 1 | **Sauce omission — live safety defect.** Stir Fry Bowl and High-Protein Bowl published allergens "None" (green badge) while their own copy offers sauces containing **peanuts** (Thai), wheat/soy (teriyaki), milk/eggs (pesto). The lab rows contain no sauce at all. | Both fail closed to "unconfirmed", lose gluten-free/dairy-free, and carry an allergenNote naming which sauces are safe. Card no longer shows a green all-clear next to an allergenNote. dietNote now covers the sauce condition, not just chicken. | 1.0 (verified in v8 output) |
| 2 | **Three items said "allergens not confirmed" while the export held the data** as Modifier rows: Carrots & Ranch (Milk, Eggs), Original Crispy Treat (Milk), Chocolate Crispy Treat (Milk, Soy). Kids/dessert items, where "unknown" reads as "probably fine" to a parent. | Filled from the modifier rows. Legacy macros turned out to match the modifier rows exactly, so confidence upgraded to verified-alias and the stale "figures pre-date our analysis" note removed. | 1.0 |
| 3 | **The malt audit was wrong.** Both Crispy Treats contain **barley malt** with Wheat=blank — and filling in their allergens (#2) would have handed them to the wheat proxy and created two brand-new false gluten-free claims. They also contain **gelatin** (not vegetarian). | Explicit `contains-gluten` marker blocks every diet derivation; allergenNote explains barley malt. A re-audit across all 311 rows found exactly these two — the proxy holds everywhere else. Smoke test updated to recognise the marker. | 1.0 |
| 4 | **Phantom bowls are provably wrong, not merely unverified.** BBQ/Buffalo/Caesar Bowl figures are byte-identical to their WRAP rows — they include a tortilla a bowl doesn't have — and all three claim fat: 0, arithmetically impossible. All three sat in the GLP-1 and High Protein filters. | `macrosSuspect: true` in the feed; build 10 excludes such items from High Protein, Low Carb and GLP-1. nutritionNote says plainly the figures appear to describe the wrap. CMS macro-tag references queued for removal (blocked on plugin at time of writing). | 1.0 in feed/component; CMS pending |
| 5 | Low Carb filter listed Lettuce Wraps on its 8–22g carb *floor*. | `!i.variable` added in build 10 — the calculator now agrees with the CMS tag. | 1.0 |

### Accepted without code change

- **JSON-LD asserts `GlutenFreeDiet` while prose deliberately avoids the regulated term.** True tension; schema.org offers nothing softer. Mitigation: the two sauce-dependent bowls no longer carry the claim at all, and every claim traces to the allergen analysis. Escalate only if CBW's counsel objects. *(0.6 — judgment call)*
- **Conditional vegan status is not persisted in the CMS multi-reference.** Correct; I can't add fields to a user-managed collection. Standing requirement: any diet page must render the tag's `Content` (which carries the condition) above the grid. If CBW adds a `Conditional` boolean to Menu, I'll populate it. *(documented, not fixed)*
- **Flavor-bar and modifier self-serve items** (Add Tahini Vinaigrette = Milk/Soy/Sesame) can break any dairy-free claim invisibly. This is Phase-3 territory (allergen-aware swap UI); the modifier data now ships with the feed so the fix has its data ready.

### Verified sound by the adversarial pass
Sesame handling (FASTER Act) consistent everywhere; soy sauce is genuinely the
gluten-free kind in every row; Sweet & Sour Bowl's "None" is real (its lab row
includes the sauce); Santa Fe avocado handling honest; no vegan/vegetarian-tagged
item hides an animal ingredient; withholding the location-gated GF tortilla and
egg-white plant chicken was right.

---

## Unused assets — the commercial findings (verbatim report in repo)

1. **Location pages: highest value-to-effort in the entire review.** All 15
   `Locations` records are fully populated (meta title, description, 3 FAQs,
   hours, geo) — and the template uses none of it: every page serves the generic
   site title, the meta description ships a literal unresolved `{Location Name}`
   token, and no location page has any schema. Est. 2,000–6,000 net-new
   sessions/mo for ~a day of template binding. *(advisor estimate)*
2. **Catering: 27 CMS SKUs rendering as empty pages** (no `<h1>`) on a line worth
   ~$250–400/order; advisor sizes the fix at ≈ +$60k/yr at a 2.5% conversion.
3. **Tacos are a missing category** — 9 flavours in the export matching the
   existing bowl/wrap lineup, sold today via the Mini Taco Platter.
4. **The nutrition→local bridge:** the GF tortilla and premium plant chicken are
   *Forsyth & O'Fallon only* — two location pages can honestly claim "gluten-free
   wraps available here." Strongest local differentiator in the dataset. *(Note:
   publish only after CBW re-confirms — their 28 Jul statement was "no gluten-free
   tortillas exist," which matches the row's Active=0. If those stores do serve
   it, the FAQ needs a location-qualified exception first.)*
5. **The blog is built and orphaned** — 14 long posts, one documenting a real
   local-influencer collaboration; the only genuine link-earning asset here.
6. Two orphaned pages printing money: `/choose-your-location` (1,060 sessions,
   92% engagement, zero inbound links) and `/fall-menu` (595).

One disagreement between advisors, flagged rather than resolved: unused-assets
says fold `/allergen-menu` into the calculator (99 sessions = rounding error);
technical SEO says keep it as its own route (94% engagement, distinct query).
My read: keep the URL, rebuild it as the server-rendered Big-9 table — the
volume argument understates a page that converts this well. *(0.6)*

---

## Also delivered today

- **`data/redirect-map-full.csv` — 107 redirects**, replacing the 13-URL map
  (the technical advisor's top gap). Every legacy WordPress URL from the June
  crawl, traffic-ordered: 72 menu items mapped slug-to-slug against the live CMS
  (including the ten price-in-slug URLs wildcards can't catch — 459 sessions on
  four of them), taxonomies, Hours, author archives. Four diet taxonomies point
  at the calculator with a RE-POINT note for when `/menu/{diet}` pages ship.
  **Caveat:** targets assume menu items resolve at `/menu/{slug}` — spot-check
  one before bulk import.
- **Plant proteins now in the crawlable surfaces** (AEO advisor's gap): the FAQ
  and QuickAnswers name Tofu (200 cal/17g) and Plant Based Chicken (130/20) as
  swaps, and the vegan answers carry the sauce condition.
- **JSON-LD rebuilt from v8:** 50 MenuItems (up from 47 — the newly verified
  treats and Carrots & Ranch enter); Stir Fry and High-Protein Bowls correctly
  lose their unconditional GlutenFreeDiet/LowLactoseDiet claims.
- `build_quickanswers.cjs` found pinned to worker **v6** — the same stale-path
  bug class the prior session found in the verifier. Both now read v8, with a
  grep-me comment.

## Deploy state at time of writing

| Artifact | State |
|---|---|
| Worker v8 | **Built, smoke-tested, NOT deployed** — paste `worker/worker_v8.js` over v7 |
| Calculator build 10 | Transport to Framer in flight; verify before publishing |
| QuickAnswers (plant proteins) | Transport **blocked** on plugin timeout — needs the MCP plugin reopened, then re-push |
| JSON-LD (50 items) | Regenerated — repaste after the code pushes land |
| CMS: 3 allergen fills + 3 phantom ref removals | **Blocked** on the same plugin timeout |
| Redirect map | Ready for Framer redirect import |
