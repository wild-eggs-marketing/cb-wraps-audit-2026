# Order-Link Audit — Accidental Catering & Wrong-Location Orders

**Site:** crazybowlsandwraps.com (Framer) + crazybowlsandwraps.orderexperience.net (Paytronix Order & Delivery)
**Date:** 2026-09-01
**Scope:** Live scan of all 126 known site URLs + the 15 `/locations/<slug>` detail pages, every order-related anchor extracted; Framer CMS collections (Menu, Locations) inspected directly via the Framer MCP; Paytronix store IDs cross-referenced across all surfaces.
**Requested by:** elle@wildeggs.com

---

## Executive summary

The site never mixes up its *own* per-location IDs — the Locations CMS, the `/locations` grid, `/choose-your-location`, and each location detail page all agree on which Paytronix store ID belongs to which restaurant. The confusion comes from **five UX/content patterns** that put catering menus and other stores' menus one ambiguous tap away from ordering customers, plus **one CMS data error** (all 31 catering menu items have their Button Link hardcoded to the Edwardsville catering store).

| # | Finding | Drives | Confidence |
|---|---------|--------|-----------|
| 1 | "Catering" button on every location card opens a catering menu directly | Accidental catering | **90%** |
| 2 | Bare "Order →" buttons on nearby-location cards open a *different* store's menu | Wrong location | **85%** |
| 3 | CMS: all 31 catering items' Button Link hardcoded to Edwardsville catering store | Wrong location + catering (latent) | **95% (data), 40% (live impact)** |
| 4 | 4 catering platters listed in the retail `/menu` "Sides" section; their pages push retail "Order Pickup/Delivery" CTAs | Accidental catering (and its inverse) | **80%** |
| 5 | 24 item pages' "Order Pickup" uses the unfiltered Paytronix picker (`/locations`, no `catering_only=false`) | Accidental catering | **60% (needs picker verification)** |
| 6 | Deep links preselect a store with no confirmation step; hero "Catering →" sits beside "Directions →" | Both (amplifier) | **70%** |

---

## Findings

### 1. Location cards pair "Order Now" with a direct-to-catering "Catering" button — HIGH

**What:** On `/locations`, `/choose-your-location`, and the homepage locations grid, every one of the 15 store cards has two side-by-side buttons: **"Order Now"** → that store's retail menu, and **"Catering"** → that store's *catering* menu on Paytronix, entered directly with no interstitial.

**Why it causes accidental catering:** The label is just "Catering" — it reads like an informational link (like "Details →" on the same card), but it drops the customer straight into a live catering ordering menu for that store. Once inside Paytronix the UI looks like normal ordering; a customer who tapped the wrong button of the pair builds a catering order without realizing it. The buttons' own UTM tags (`utm_campaign=order_card` vs `catering_card`) confirm both are order entry points of equal prominence.

**Source:** Live HTML of `https://crazybowlsandwraps.com/locations`, `/choose-your-location`, and homepage — e.g. Manchester card: `Order Now → …orderexperience.net/653be7e3178033bc4700427a/menu?…utm_campaign=order_card` and `Catering → …orderexperience.net/67db194183ce5a77740b2ce3/menu?…utm_campaign=catering_card`. Same pattern on all 15 cards, replicated on 10+ pages sitewide.

**Confidence: 90%.** The link topology is verified fact; that it produces mis-orders is strongly implied by the equal-prominence pairing and the absence of any "you are ordering catering" gate.

**Fix:** Relabel to "Order Catering", visually de-emphasize it (text link, not twin button), or route it to `/catering` (info page) instead of the live catering menu.

---

### 2. "Nearby locations" cards use a bare "Order →" that opens a different store — HIGH

**What:** Each `/locations/<slug>` detail page ends with 3 nearby-location cards whose CTA is just **"Order →"**, deep-linking into the *nearby* store's retail menu with no UTM and no store-name in the label.

**Why it causes wrong-location orders:** A customer on the South City page scrolls past the hero and sees "Order →". The page they're on is South City; the button orders from Lindell/Forsyth/Rock Hill. On mobile, the nearby cards can be the first order button visible after the fold. Once clicked, Paytronix preselects that store and nothing on the checkout path re-confirms "you are ordering from Lindell".

**Source:** Live HTML of all 15 location detail pages. Example — `https://crazybowlsandwraps.com/locations/south-city` (H1 "Crazy Bowls & Wraps South City") contains, besides its own correct `Order Now → …653be7c7…/menu`, three bare links: `Order → …653be7de…/menu` (Lindell), `Order → …653be7dc…/menu` (Forsyth), `Order → …653be7c3…/menu` (Rock Hill).

**Confidence: 85%.** Link targets verified on every location page; the labels are unambiguous in HTML and unambiguous *ly wrong* for a skimming user.

**Fix:** Label nearby CTAs with the store name ("Order from Lindell →") or link the card to the location page rather than straight into ordering.

---

### 3. CMS defect: every catering item's Button Link points at Edwardsville's catering store — DATA CONFIRMED, LIVE IMPACT LATENT

**What:** In the Framer CMS "Menu" collection (id `fEfKTjIH1`), all 31 items in `Catering - *` categories have field **Button Link (`ZSKCb56q4`)** set to `https://crazybowlsandwraps.orderexperience.net/67db1999dfdbeb3f0308f211/menu` — which is **Edwardsville, IL's catering store ID** (per the Locations collection, `edwardsville.cater`). No non-catering item has a Button Link set.

**Why it matters:** Any current or future template that renders a catering item's Button Link (e.g. an "Order this platter" button) sends *every* customer — St. Louis, Wentzville, Chesterfield — into the Edwardsville, Illinois catering menu. This is a copy-paste error waiting to fire; if any component already renders it (embedded buttons, popups, or a variant not in my static sample), it is actively producing wrong-location *and* catering orders in one shot.

**Source:** Framer MCP `getCMSItems` on collection `fEfKTjIH1` (all 31 `catering-*` slugs, `draft: false`) cross-checked against collection `QDa42Ljkg` (Locations) where `67db1999dfdbeb3f0308f211` is Edwardsville's Catering URL. The sampled static item-page template does not currently render this field (0 occurrences in `/menu/catering-chips-salsa-platter` HTML).

**Confidence: 95%** that the CMS data is wrong; **40%** that it's currently reachable by customers (not seen in sampled server-rendered HTML, but Framer components can render CMS links client-side or in variants I can't execute — the Paytronix app blocks headless verification via PerimeterX).

**Fix:** Replace with each item's correct behavior (link to `/catering#order-catering` or the catering picker `…/locations?catering_only=true`). This is a 31-row CMS edit.

> **✅ FIXED 2026-09-01:** All 27 affected items' Button Links updated via the Framer MCP to the catering location picker (`https://crazybowlsandwraps.orderexperience.net/locations?catering_only=true`). Verified: no Menu item references `67db1999dfdbeb3f0308f211` anymore. Two items (`catering-chicken-tex-mex-egg-roll-dozen`, `catering-black-bean-egg-roll-dozen`) also had a broken Dietary Tags reference (`high-protein` stored as a slug instead of an item ID) that blocked saving; repaired to the correct item reference in the same update. **The Framer site must be published for these CMS changes to go live.**

---

### 4. Catering platters are listed inside the retail `/menu`, and their pages push retail ordering CTAs — HIGH

**What:** The retail menu page's **"Sides"** section includes 4 catering items (Tortilla Chips & Salsa Platter, Edamame Sampler, Tostada Starter Sampler, Chicken Tex Mex Egg Roll Dozen), whose CMS category is `Catering - Platters - Sides`. These cards also appear on 32 pages sitewide (popular/related-items modules). Their detail pages are styled exactly like retail items ("Price Starting at: $12.00", FAQ) and their CTAs are **"Order Pickup" / "Order Delivery" → the retail ordering flow** (`/locations` and `/locations?catering_only=false`).

**Why it causes accidental catering (both directions):** A customer browsing the menu adds a "$12 side" that is actually a 5–10-person catering platter — or, entering from the `/catering` page (whose item cards link to these same `/menu/catering-*` pages), a catering customer is bounced into the *retail* pickup/delivery flow where the platter may not exist, so they order from the wrong menu type entirely.

**Source:** Live `https://www.crazybowlsandwraps.com/menu` (4 `./menu/catering-*` links under the `Sides` H2); live `https://www.crazybowlsandwraps.com/menu/catering-chips-salsa-platter` CTAs (`Order Pickup → …/locations`, `Order Delivery → …/locations?catering_only=false&_gl=…`); Framer CMS categories. Related-item modules verified on 32 crawled pages.

**Confidence: 80%.** Rendering and link targets fully verified; likelihood of confusion inferred from identical retail styling.

**Fix:** Remove catering items from retail menu sections and related-item pools; give catering item pages a "Order Catering" CTA (→ `…?catering_only=true` or the correct per-store catering link).

---

### 5. "Order Pickup" on all item pages uses the *unfiltered* Paytronix location picker — MEDIUM

**What:** Every menu-item detail page (24 crawled, presumably all ~100) has "Order Pickup" → `https://crazybowlsandwraps.orderexperience.net/locations` with **no `catering_only=false` filter**, while "Order Delivery" on the same page *does* pass `catering_only=false`. The homepage also has 2 bare `/locations` "Order Now" links alongside 2 filtered ones. Paytronix models catering as separate stores (each location has distinct retail and catering store IDs), and the site itself uses `catering_only=true|false` to split the picker — implying the unfiltered picker lists **both** the retail and catering "store" for each location.

**Why it causes accidental catering:** A customer choosing pickup from an item page lands on a picker that (if unfiltered = both) shows ~30 entries — "CBW Manchester" and "CBW Manchester Catering" style duplicates — and picking the wrong twin starts a catering order.

**Source:** Sitewide link extraction: `('Order Pickup', bare /locations)` on 24 pages; `('Order Now', bare)` on 6; filtered variants elsewhere (103 `Order Now` + 24 `Order Delivery` with `catering_only=false`; 19 `Order Catering` with `=true`). The picker's actual unfiltered listing **could not be verified** from this environment — the Paytronix app blocks non-browser traffic (PerimeterX; JS assets return 403).

**Confidence: 60%.** The inconsistent parameter usage is verified fact; the picker's unfiltered behavior needs a 30-second manual check (open `…orderexperience.net/locations` in a browser and see whether catering stores appear).

**Fix:** Regardless of picker behavior, normalize every retail entry link to `…/locations?catering_only=false` — it's already the site's dominant pattern.

> **✅ FIXED 2026-09-01:** Per the owner, Paytronix now serves pickup and delivery from a single link and checkout re-confirms the store, so the "Order Pickup" / "Order Delivery" double button on the `/menu/:slug` template was replaced with a single CTA. A new Framer code component `OrderCTA.tsx` was created and swapped in for the "Order + Pickup Pair" instance (old node `N0kELHs5j` deleted; Tablet/Phone breakpoints inherit as replicas). The component is **catering-aware** — the same template serves catering items, so on paths starting `/menu/catering-` it renders "Order Catering" → `…/locations?catering_only=true`, and everywhere else "Order Now" → `…/locations?catering_only=false` with subtext "Pickup · Curbside · Delivery — choose at checkout". This also removes the hardcoded stale `_gl` parameter (part of finding 6) and closes the retail-CTA half of finding 4. UTM tags (`utm_medium=item_page`) and `order_click` gtag events follow the StickyOrderBar convention. **Requires a Framer publish to go live; spot-check one retail and one catering item page in preview first.** *Rev 2:* catering detection no longer relies on the URL alone (Framer preview iframes don't always carry the real route) — it now also checks an optional CMS-bindable `slug` prop and the page's own MenuItemSchema JSON-LD for a `/menu/catering-` reference.

---

### 6. Amplifiers: no store confirmation on deep links; hero "Catering →" beside "Directions →" — MEDIUM

- Every deep link (`<id>/menu`) preselects a store; there's no evidence of a "confirm your location" step, so every mis-tap in findings 1–5 converts silently into a wrong order. (Confidence 70% — inferred from URL structure; verify in the Paytronix flow.)
- On location detail pages the hero quick-links read "Order Now … Directions → Catering →" — "Catering →" (straight into the live catering menu) sits in the same visual group as the informational "Directions →". Source: rendered text of `/locations/manchester`, `/locations/valley`, etc. (Confidence 70%.)
- **Stale `_gl` parameter:** the "Order Delivery" link on all item pages carries a hardcoded `_gl=1*18iaced*_ga*…1788274508…` — a cross-domain Google Analytics token copied from one editor's session (epoch ≈ 2026-08-28) and published in the CMS. It won't misroute orders but corrupts GA4 cross-domain attribution for every customer. Remove it. (Confidence 90%.)

---

## Things checked and found NOT to be the problem

- **ID mapping consistency (checked everywhere):** For all 15 locations, the retail and catering store IDs are identical across the Locations CMS (`Pickup/To-Go Link` = `Order Online Url`, distinct `Catering URL`), the `/locations` grid, `/choose-your-location`, and each location detail page's own hero button. No swapped pairs found. (Confidence 90%; the final ID↔physical-store mapping inside Paytronix could not be externally verified — PerimeterX blocks rendering — spot-check 2–3 IDs in a browser.)
- **Two generations of catering IDs** (`66e8…` ≈ Sep 2024 for Lindell, West Oak, O'Fallon, Lindenwood; `67db…` ≈ Mar 2025 for the other 11) are used *consistently* sitewide — but worth confirming in Paytronix that the four older catering stores are still the intended live ones.
- **Orphaned/miscategorized CMS items:** `protein-scrambler`, `veggie-scrambler` (category `Catering - Breakfast Trays`) and `mixed-berry-bowl`, `banana-chocolate-chip-bowl` (`Catering - Quinoa Bowls`) are not listed on `/menu` or `/catering`, but their pages are live and labeled with catering categories — landing there from search is confusing. Low impact.
- **Legacy WordPress URLs:** ~28 old item URLs (e.g. `/starters/tostada/`, `/kids_menu/...`, the 2023 catering PDF) return 404 on the apex domain; other legacy paths 301 to `/menu`. Lost traffic/bounces, but not a mis-order vector.
- **Louisville, KY address** (1211 Herr Ln) appears on `/contact-us` and `/form-confirmation` with a Google Maps link — that's Wild Eggs corporate, on a CB&W site with no Louisville location. Confusing for contact/catering inquiries, not an order link.

---

## Recommended fix order

1. **CMS edit (31 rows):** fix catering items' Button Link away from Edwardsville (finding 3) — cheap insurance even if latent.
2. **Relabel** location-card "Catering" → "Order Catering" and nearby-card "Order →" → "Order from <Store> →" (findings 1–2).
3. **Remove** catering platters from retail menu sections; give catering item pages catering CTAs (finding 4).
4. **Normalize** all retail entry links to `?catering_only=false`; drop the hardcoded `_gl` (findings 5–6).
5. **Manual verification (10 min, real browser):** unfiltered picker contents; spot-check 3 store IDs against physical stores; check for a store-confirmation step in Paytronix checkout.

## Methodology & reproducibility

- Fetched all 126 URLs from `crawl/crawl.csv` (96 OK / 30 gone) plus the 15 new `/locations/<slug>` pages; extracted every anchor matching order/catering/location/delivery patterns. Raw results: scan performed 2026-09-01; per-page link dump reproducible with `crawler.py`-style fetch (see this report's git history for the extraction regexes).
- Read Framer CMS collections `Menu` (108 items) and `Locations` (15 items) via the Framer MCP.
- Attempted to resolve Paytronix store IDs to store names by fetching/rendering `orderexperience.net/<id>/menu`: blocked (SPA + PerimeterX 403 on assets, connection resets in headless Chromium). Flagged as manual checks above.

*Confidence scores combine (a) certainty the described links/data exist as stated — mostly verified directly — and (b) likelihood the pattern actually produces mis-orders.*
