# ACTION PLAN — CRAZY BOWLS AND WRAPS WEBSITE OPTIMIZATION
**Generated:** 2026-06-16 | **Contractor Target:** 12-Week Phased Rollout | **Estimated Effort:** 150-180 hours | **Estimated Revenue Impact:** +$13.7K-$178K/year

---

## PROJECT OVERVIEW

### Business Goal
Increase organic traffic by 30-40% within 12 weeks through on-page SEO, schema implementation, conversion optimization, and AI visibility improvements.

### Current State (90-Day Baseline)
- **Organic traffic:** ~92K sessions/month
- **Conversion rate:** 0.02% (likely broken GA4 tracking — actual may be 1-3%)
- **Keyword portfolio:** 1,867 tracked keywords (90.4% brand-dependent, only 9.6% non-brand)
- **On-page SEO:** 99.2% of pages have issues (missing meta descriptions, titles too short, zero schema)
- **CWV:** 9 pages with 53-69% bounce rate (24,233 sessions at risk)

### Target State (3-6 Months Post-Implementation)
- **Organic traffic:** 100-128K sessions/month (+8-39%)
- **Conversion rate:** 0.5% (10-25x improvement, assuming GA4 fix)
- **New conversions:** +495 orders/month = +$14K/year revenue
- **Keyword ranking:** 500+ keywords in top 10 (vs. 200 currently)
- **On-page SEO:** 95%+ pages fully optimized

---

## TASK BREAKDOWN (35 Tasks, Ranked by Priority × Impact)

### PHASE 1: FOUNDATION & CRITICAL FIXES (Weeks 1-2) — 40 Hours

#### Task 1.1: Fix GA4 Conversion Tracking [BLOCKER]
**Objective:** Restore/verify conversion goal configuration so real order data flows into GA4

**Why Critical:** Current 0.02% CR (26 conversions from 154K sessions) = 50-150x below industry standard. Indicates broken tracking. Cannot measure improvements until fixed.

**Detailed Steps:**
1. Open GA4 property (property ID: [request from client])
2. Navigate to Admin → Conversions
3. Check existing conversion goals:
   - Is there a "Purchase" or "Order" goal configured?
   - What trigger type? (Page view, Event, Scroll, etc.)
   - What is the conversion value assigned?
4. If missing/wrong: Create new goal
   - Name: "Purchase" or "Order Completed"
   - Trigger: Custom event OR page view (see below)
5. Verify third-party order platform integration:
   - **Option A (if orders on-site):** Install GA4 conversion pixel on order confirmation page
   - **Option B (if external platform):** Check if order.online or orderexperience.net has GA4 tracking code; verify return referrer contains order confirmation
   - **Option C:** Add event listener to order button click (fallback)
6. Test with actual order:
   - Place test order through site
   - Wait 24 hours for data processing
   - Check GA4 real-time report → Conversions section
   - Verify conversion appears with correct event value
7. Document: conversion goal ID, trigger type, value

**Acceptance Criteria:**
- GA4 shows ≥0.1% conversion rate on test data (minimum 10x improvement)
- Test orders appear in GA4 Conversions report within 24 hours
- Baseline CR documented for post-implementation comparison

**Estimated Effort:** 2-4 hours (1-2 if straightforward, 2-4 if integration required)

**Owner:** Marketing Analytics / Developer

**Timeline:** Week 1 (URGENT — blocks all other conversion improvements)

**Tools Needed:**
- Google Analytics 4 access (Admin account)
- Order platform documentation (order.online API, etc.)
- Test order capability

---

#### Task 1.2: Add Meta Descriptions to Top 50 Pages [HIGH ROI]
**Objective:** Write unique, compelling meta descriptions (155-160 chars) for 50 highest-traffic pages

**Why High ROI:** All 126 pages currently have 0% meta descriptions. These 50 pages account for 90%+ of traffic. Meta descriptions directly impact CTR (+50-100% uplift potential).

**Data Source:** `/audit/crawl/top20-pages-by-traffic.txt` or GA4 landing pages report

**Detailed Steps:**

1. **Extract top 50 pages:**
   - From GA4 → Engagement → Pages and screens
   - OR use provided list: `/audit/crawl/top20-pages-by-traffic.txt`
   - Include: URL, title, word count, traffic

2. **For each page, write meta description:**
   - **Template:** [Benefit/Hook] + [Primary Keyword] + [CTA]
   - **Length:** 155-160 characters (Google truncates at ~155-160)
   - **Examples:**
     ```
     Page: /menu
     Old: (blank)
     New: "Healthy bowls, wraps & salads at Crazy Bowls and Wraps. Fresh ingredients, customizable. Order online now."
     
     Page: /locations
     Old: (blank)
     New: "Find Crazy Bowls and Wraps locations near you. Hours, directions, phone. 50+ restaurants. Visit today."
     
     Page: /catering
     Old: (blank)
     New: "Corporate catering for your next event. Healthy bowls, wraps, salads. Free consultation. Order online."
     ```

3. **Ensure uniqueness:** No duplicate meta descriptions across pages

4. **Verify soft CTA:** Include action word (Order, Find, Learn, Discover, Shop)

5. **Deploy in WordPress:**
   - Method A: Use Yoast SEO plugin → Meta description field
   - Method B: Use AIOSEO plugin → Meta description field
   - Method C: Manual: Edit theme header.php template (advanced)

6. **QA verification:**
   - For 10 sample pages, verify in page source (Ctrl+U, search "meta name=description")
   - Check Google SERP preview tool (Google Search Console → Performance tab)
   - Verify character count (155-160)

**Acceptance Criteria:**
- 50 pages with unique meta descriptions
- All 155-160 characters
- Include primary keyword + CTA
- No syntax errors (double quotes, HTML entities)
- Visible in page source

**Estimated Effort:** 6-8 hours (6-8 min per page + QA)

**Owner:** Content Specialist / SEO

**Timeline:** Weeks 1-2

**Tools Needed:**
- WordPress admin access (Yoast or AIOSEO)
- Google Search Console (for SERP preview)
- Text editor for bulk meta descriptions

**Bonus Task:** Export all 50 meta descriptions to CSV for documentation and future reference

---

#### Task 1.3: Implement Quick-Win Keyword Fixes (Pos 8-20) [HIGH ROI]
**Objective:** Rewrite 20-30 titles to target position 8-20 keywords (one optimization away from page 1)

**Why High ROI:** 871 keywords at position 8-20 with 1.2M impressions. Moving to top 3 requires only title/meta rewrite + internal linking. Estimated gain: +3,000 clicks/month.

**Data Source:** `/audit/data/gsc_quick_wins.json` or Google Search Console

**Priority Keywords (Top 10):**
1. "restaurants near me" (pos 10.4, 146K impr, 175 clicks)
2. "brunch near me" (pos 9.8, 44K impr, 123 clicks)
3. "food near me" (pos 11.9, 35K impr, 43 clicks)
4. "omelet near me" (pos 8.3, 65K impr, 1 click)
5. "best brunch spots near me" (pos 9.3, 23K impr, 0 clicks)

**Detailed Steps:**

1. **Extract quick-win keywords from GSC:**
   - Search Console → Performance tab
   - Filter: Position 8-20, 500+ impressions
   - Sort by impressions (descending)
   - Export top 20-30

2. **For each keyword, find ranking page:**
   - Click keyword in GSC
   - Note which page is ranking (e.g., /menu, /locations)
   - Note current position and CTR

3. **Rewrite page title:**
   - **Old approach:** Generic title ("Menu" or "Locations")
   - **New approach:** Include keyword + benefit
   - **Examples:**
     ```
     Keyword: "restaurants near me"
     Old title: "Crazy Bowls and Wraps"
     New title: "Restaurants Near Me - Healthy Bowls & Wraps [City]"
     Length: 55 chars (optimal)
     
     Keyword: "omelet near me"
     Old title: "Menu"
     New title: "Omelettes Near Me - 100+ Combinations | Crazy Bowls"
     Length: 52 chars
     
     Keyword: "brunch near me"
     Old title: "Homepage"
     New title: "Brunch Near Me - Fresh Breakfast Restaurant"
     Length: 45 chars
     ```

4. **Update in WordPress:**
   - Open page editor
   - Update page title in Yoast/AIOSEO title field
   - Ensure 50-60 characters

5. **QA:**
   - Check Google SERP preview tool
   - Verify keyword is in title
   - Wait 1-2 weeks for Google re-crawl
   - Check GSC for ranking improvement

**Acceptance Criteria:**
- 20-30 titles updated
- Each title 50-60 characters
- Include target keyword
- Quick-win keywords show position improvement in GSC within 2-3 weeks

**Estimated Effort:** 6-8 hours (15-20 min per keyword)

**Owner:** SEO Specialist / Content

**Timeline:** Weeks 1-2

**Expected Impact:** +3,000 clicks/month (estimated gain from top 50 quick wins)

---

#### Task 1.4: Create /llms.txt File [QUICK WIN]
**Objective:** Create AI-friendly policy file at domain root

**Why:** Signals to OpenAI, Anthropic, Perplexity crawlers that you welcome AI training. Improves inclusion in LLM training datasets.

**Detailed Steps:**

1. **Create file:** `/llms.txt` at root domain
   - Location: `https://crazybowlsandwraps.com/llms.txt`
   - NOT `/public/llms.txt` or `/www/llms.txt` — must be at domain root

2. **Content template:**
   ```
   # Llms.txt
   # For Crazy Bowls and Wraps
   # Last updated: 2026-06-16

   ## Usage Policy
   
   User-agent: *
   Allow: /
   
   ## Attribution
   
   When using our content for AI training or development, please credit:
   "Crazy Bowls and Wraps" and link to https://crazybowlsandwraps.com
   
   ## Content Available for Training
   
   The following content is available for AI model training:
   - Menu descriptions and ingredients
   - Nutritional information
   - Location details and hours
   - Health/wellness information
   - Promotional content
   
   ## Restrictions
   
   Please do not:
   - Claim Crazy Bowls content as your own
   - Use for commercial purposes without permission
   - Modify menus or pricing without permission
   
   ## Contact
   
   For licensing, permissions, or questions about bulk data usage:
   Visit: https://crazybowlsandwraps.com/contact-us/
   Email: [business email]
   
   ## Sitemap
   
   Sitemap: https://crazybowlsandwraps.com/wp-sitemap.xml
   ```

3. **Deploy:**
   - If using WordPress: Add file to `/public_html/` (root)
   - If using file manager: Upload directly
   - If using Git: Commit and push

4. **Test:**
   - Open URL in browser: `https://crazybowlsandwraps.com/llms.txt`
   - Verify 200 status code
   - Verify content visible

5. **Optional:** Announce via robots.txt
   - Add comment to robots.txt: `# See /llms.txt for AI usage policy`

**Acceptance Criteria:**
- `/llms.txt` exists at domain root
- Returns 200 HTTP status
- Content visible in browser
- Clear attribution and usage policy stated

**Estimated Effort:** 15 minutes

**Owner:** Webmaster / Developer

**Timeline:** Week 1

**Impact:** +AI visibility, positions site as AI-friendly

---

#### Task 1.5: Start Schema Rollout — Phase 1 (Organization) [FOUNDATION]
**Objective:** Implement Organization schema on homepage

**Why:** 0% schema markup across site. Organization schema is first critical step toward local pack visibility and rich snippets.

**Data Source:** `/audit/fixes/schema/homepage.json` template

**Detailed Steps:**

1. **Prepare data:**
   - Gather: logo URL, business name, phone, address, email, founding year
   - Check: `/contact-us` page for current data
   - Verify: NAP (Name, Address, Phone) consistency

2. **Choose implementation method:**

   **Option A: Yoast SEO Plugin (Recommended - No Code)**
   - Install Yoast SEO (if not already)
   - Open homepage for editing
   - Go to Yoast → Schema → Organization
   - Fill in fields:
     - Name: "Crazy Bowls and Wraps"
     - Logo: [Logo image URL]
     - Contact type: "Customer Service"
     - Phone: [Business phone]
     - Email: [Business email]
     - Address: [Full address]
     - Founding date: [Year if known]
   - Save
   - Effort: 30-45 min

   **Option B: AIOSEO Plugin (Similar to Yoast)**
   - Go to AIOSEO → Schema → Organization
   - Fill same fields as above
   - Save
   - Effort: 30-45 min

   **Option C: Manual JSON-LD (Most Control, Code Required)**
   - Copy `homepage.json` template from `/audit/fixes/schema/`
   - Replace placeholders: `[COMPANY_NAME]`, `[LOGO_URL]`, `[PHONE]`, etc.
   - Add to theme `header.php` or via "Code Snippets" plugin
   - Verify via browser DevTools (F12 → Sources → page source)
   - Effort: 1-2 hours (requires developer)

3. **Test:**
   - Go to [Google Rich Results Test](https://search.google.com/test/rich-results)
   - Paste homepage URL
   - Click "Test URL"
   - Verify: "Organization" schema appears with no errors
   - Screenshot result

4. **Monitor:**
   - Wait 48 hours for Google crawl
   - Check Google Search Console → Coverage → "Rich results eligible"
   - Verify "Organization" listed

**Acceptance Criteria:**
- Homepage shows Organization schema in Rich Results Test
- No validation errors
- All required fields filled (name, logo, contact info)
- Appears in GSC within 48 hours

**Estimated Effort:** 2-3 hours (including plugin setup + testing)

**Owner:** Developer / SEO Specialist

**Timeline:** Week 1 (start), Week 2 (verify)

**Expected Impact:** Foundation for local pack visibility and rich snippets

---

#### Task 1.6: Fix Broken Cloudflare Email Protection Link [QUICK WIN]
**Objective:** Remove/fix the 1 broken 404 link (Cloudflare email protection page)

**Why:** 4 pages link to this non-existent page. Wastes crawl budget and indicates misconfiguration.

**Detailed Steps:**

1. **Identify source pages:**
   - `/catering/`
   - `/form-confirmation/`
   - `/privacy-policy/`
   - [1 more page from broken-links.md]

2. **For each page:**
   - Open page in WordPress editor
   - Search for "email-protection" or Cloudflare link
   - Delete the link OR replace with correct email address
   - If you want email obfuscation: Use WordPress plugin "Email Masker" or manual email display
   - Save

3. **Alternative (if unsure):**
   - Create 301 redirect from old URL to new one (if applicable)
   - OR set Cloudflare to handle email protection without creating links

4. **Verify:**
   - Check pages in browser
   - No email-protection links visible
   - If email addresses shown, ensure they're formatted safely

**Acceptance Criteria:**
- Broken link removed from all 4 pages
- No more 404 errors in crawl reports
- Email addresses still protected/formatted correctly

**Estimated Effort:** 30 minutes

**Owner:** Developer / Webmaster

**Timeline:** Week 1

---

### PHASE 2: ON-PAGE & CONVERSION OPTIMIZATION (Weeks 3-4) — 45 Hours

#### Task 2.1: Complete Meta Descriptions (Remaining 76 Pages) [CONTINUATION]
**Objective:** Add meta descriptions to remaining 76 pages (those with <100 GA4 sessions)

**Why:** Achieve 100% coverage on all 126 pages to maximize CTR uplift across entire site.

**Steps:**
1. Extract remaining 76 pages (pages not in Task 1.2)
2. Write meta descriptions using same template as Task 1.2
3. Deploy in batches (20-25 pages per week)
4. QA sample of 10 pages per batch
5. Document completion in spreadsheet

**Acceptance Criteria:**
- 126/126 pages have unique meta descriptions
- All 155-160 characters
- No duplicates
- No syntax errors

**Estimated Effort:** 10-12 hours (5-8 min per page due to repetition)

**Owner:** Content Specialist

**Timeline:** Weeks 2-3

---

#### Task 2.2: Fix CTR Anomalies (Top 20 High-Ranking, Low-CTR Pages)
**Objective:** Rewrite titles + meta descriptions for top 20 keywords ranking pos 1-5 but CTR <2%

**Why:** These pages rank well but don't compel clicks. One rewrite can 2-3x CTR.

**Data Source:** `/audit/data/gsc_ctr_anomalies.json` or GSC Performance report

**Examples:**

| Query | Page | Position | CTR | Old Title | New Title |
|-------|------|----------|-----|-----------|-----------|
| fried eggs near me | / | 5.93 | 0.00% | [Generic] | "Fried Eggs Near Me - Fresh Cooked to Order" |
| scrambled eggs near me | / | 5.96 | 0.00% | [Generic] | "Scrambled Eggs Near Me - Fluffy & Delicious" |
| best restaurants near me | / | 7.92 | 0.00% | [Generic] | "Best Restaurants Near Me - Award-Winning Bowls" |

**Detailed Steps:**

1. Extract top 20 CTR anomalies from GSC
2. For each:
   - Current title, current meta, current CTR
   - Analyze: why low CTR despite high ranking?
   - Rewrite title: more compelling, power word, match intent
   - Rewrite meta: answer user question directly, soft CTA
3. Deploy + test
4. Monitor GSC for CTR improvement over 2-3 weeks

**Acceptance Criteria:**
- 20 pages with new titles/metas
- CTR improvement visible in GSC within 2-3 weeks
- Estimated +500 clicks/month

**Estimated Effort:** 6-8 hours

**Owner:** SEO Specialist / Content

**Timeline:** Week 3

---

#### Task 2.3: Mobile CTA Optimization (Sticky Footer) [HIGH IMPACT]
**Objective:** Add sticky footer order button on mobile (375px viewport) to all pages

**Why:** Desktop converts 3.3x better than mobile. Mobile CTA should stay visible as user scrolls.

**Detailed Steps:**

1. **Design sticky footer:**
   - Button: 100% width, 44px height minimum (touch-friendly)
   - Text: "Order Now" or "Find Location" (action-driven)
   - Color: High contrast (e.g., brand color on white)
   - Position: Bottom of viewport on mobile only (hidden on desktop)

2. **Implementation option:**
   - **Option A (CSS/Plugin):** Use mobile-specific CSS media query
     ```css
     @media (max-width: 768px) {
       .sticky-order-cta {
         position: fixed;
         bottom: 0;
         left: 0;
         right: 0;
         background: [brand-color];
         padding: 12px;
         z-index: 100;
       }
     }
     ```
   - **Option B (Plugin):** Use floating button plugin (e.g., "Floating Button")
   - **Option C (Template):** Add to theme footer.php template

3. **Test:**
   - Chrome DevTools: Toggle device toolbar (375px mobile)
   - Verify: button visible at bottom, 44px+ tall, no overlap of content
   - Test click: button links to /menu or /locations

4. **A/B Test (Optional but Recommended):**
   - Split traffic: 50% control (no sticky), 50% treatment (sticky)
   - Duration: 2 weeks
   - Measure: mobile conversion rate improvement

5. **Monitor:**
   - GA4: Mobile conversion rate week 1 vs. week 3
   - Heatmap: Are users clicking sticky button?

**Acceptance Criteria:**
- Sticky footer visible on 375px mobile viewport
- No rendering issues or overlapping content
- Button is 44px+ tall, fully tappable
- Works across major browsers (Chrome, Safari, Firefox)

**Estimated Effort:** 8-10 hours (design + dev + testing)

**Owner:** Designer / Developer

**Timeline:** Week 2-3

**Expected Impact:** +500 clicks/month from improved mobile conversions

---

#### Task 2.4: Redesign /locations Page (53.5% Bounce Rate) [MEDIUM EFFORT, HIGH IMPACT]
**Objective:** Reduce bounce rate on /locations page from 53.5% to <40%

**Why:** 19,663 GA4 sessions on high-bounce page = lost conversion opportunity. Content gap or UX issue needs fixing.

**Detailed Steps:**

1. **Analyze current page:**
   - What's on it? (How many locations, format, info?)
   - Is there above-fold CTA?
   - Mobile usability score?

2. **Identify issue:**
   - If page too long: Add location search/filter to narrow by city
   - If sparse content: Add hours, phone, directions, reviews per location
   - If no CTA: Add "Order Online" or "Get Directions" buttons per location

3. **Design new layout:**
   - **Above fold:** Location search input + [City] dropdown picker
   - **Below:** Map view + List view toggle
   - **Per location card:**
     ```
     [Store Name]
     [Address]
     [Phone]
     [Hours: Mon-Fri 10am-9pm, Sat-Sun 11am-9pm]
     [Buttons: "Order Online" | "Get Directions" | "Call"]
     [Customer reviews: 4.8★ (124 reviews)]
     ```

4. **Implement:**
   - Use Elementor or page builder for visual design
   - Add location cards with repeater fields (if custom)
   - Ensure mobile-responsive (test at 375px)

5. **Test:**
   - Load on mobile + desktop
   - Click "Order Online" button (should go to order page or external platform)
   - Click "Get Directions" (should open Google Maps)
   - Verify hours display correctly

6. **Launch + monitor:**
   - Deploy to live
   - Monitor GA4 for bounce rate change over 2 weeks
   - Goal: Drop from 53.5% to <40% (13.5 point improvement)

**Acceptance Criteria:**
- /locations bounce rate drops to <40% within 2 weeks
- Pages/session increases
- All location information visible without excessive scrolling
- CTAs visible on mobile

**Estimated Effort:** 6-8 hours (discovery + design + dev)

**Owner:** Designer / Developer

**Timeline:** Week 2

**Expected Impact:** +2,000 additional orders/month (if bounce rate improves + conversion rate stable)

---

#### Task 2.5: Fix Missing H1 Tags (28 Pages) [MEDIUM PRIORITY]
**Objective:** Add or correct canonical tags + H1 tags on pages missing them

**Why:** Missing H1 tags = poor semantic structure, impacts ranking. Duplicates = ranking dilution.

**Data from crawl report:**
- 28 pages missing canonical tags
- 13 pages missing H1 tags

**Detailed Steps:**

1. **For missing H1 tags (13 pages):**
   - /catering/, /loyalty/, /allergen-menu/, /delivery/, /p/, /contact-us/, /form-confirmation/, 7 Hours pages
   - Open each page in WordPress editor
   - Scroll to page content
   - If no H1: Add one at beginning of content (page title)
   - Ensure: Single H1 per page, within first 200 pixels
   - Example: `/catering/` → H1: "Corporate Catering Services"

2. **For pages with multiple H1s (1 page):**
   - `/choose-your-location/` has 2 H1 tags
   - Delete or downgrade to H2/H3
   - Keep only one primary H1

3. **For missing canonical tags (28 pages):**
   - Taxonomy/category pages (11 pages): Add `<link rel="canonical" href="[self]">`
   - Hours pages (7 pages): Add self-referential canonical
   - Author pages (2 pages): Canonicalize to category or remove
   - Other pages (8 pages): Add self-referential canonical

**Implementation:**
- **Option A (Plugin):** Yoast SEO → Canonical URL field
- **Option B (Manual):** Add to theme header.php or use "Code Snippets" plugin
- **Option C (Advanced):** Custom PHP function in functions.php

**QA:**
- For 5 sample pages, verify in page source (Ctrl+U, search "canonical" and "h1")
- Check Google SERP preview

**Acceptance Criteria:**
- 13 pages with H1 tags
- 28 pages with canonical tags
- No pages with 2+ H1 tags
- No syntax errors

**Estimated Effort:** 3-4 hours

**Owner:** Developer

**Timeline:** Week 1

---

#### Task 2.6: Fix Duplicate Titles & H1s [MEDIUM PRIORITY]
**Objective:** Consolidate or differentiate 8 duplicate titles and 7 duplicate H1 tags

**Why:** Duplicate content signals = ranking dilution. Multiple pages competing for same query.

**Examples from crawl report:**

Duplicate titles:
- "Popular – Crazy Bowls and Wraps" (3 pages: bowls, salads, wraps)
- "Gluten-Free – Crazy Bowls and Wraps" (3 pages)
- "Vegan – Crazy Bowls and Wraps" (2 pages)

**Detailed Steps:**

1. List all duplicate titles/H1s
2. For each duplicate:
   - **Option A (Consolidate):** Merge pages, 301 redirect duplicates
   - **Option B (Differentiate):** Update title/H1 to be unique
   - Example: 
     ```
     OLD:
     - /bowl_categories/popular → "Popular – Crazy Bowls and Wraps"
     - /salad_categories/popular → "Popular – Crazy Bowls and Wraps"
     
     NEW:
     - /bowl_categories/popular → "Popular Bowls - Bestsellers"
     - /salad_categories/popular → "Popular Salads - Customer Favorites"
     ```

3. Implement 301 redirects (if consolidating) or update titles (if differentiating)
4. QA: Verify in page source

**Acceptance Criteria:**
- No duplicate titles
- No duplicate H1s
- All pages have unique identifiers

**Estimated Effort:** 3-4 hours

**Owner:** Developer / SEO

**Timeline:** Week 2

---

#### Task 2.7: Schema Rollout — Phase 2 (LocalBusiness + Restaurant)
**Objective:** Implement LocalBusiness + Restaurant schema on location pages

**Why:** Enables local pack visibility (20-45% of restaurant search traffic).

**Data Source:** `/audit/fixes/schema/locations.json` template

**Detailed Steps:**

1. **Extract location data from CMS or database:**
   - Store name, address, phone, hours, images
   - Manager/franchisee name (if available)
   - Ratings (if available from Google Business Profile)

2. **Generate schema for each location:**
   - Use template from `/audit/fixes/schema/locations.json`
   - Replace placeholders: [STORE_NAME], [ADDRESS], [PHONE], [HOURS_JSON], etc.

3. **Implementation:**
   - **Option A (Plugin):** Yoast SEO → Locations
   - **Option B (Manual):** Add JSON-LD to theme for each location page

4. **Test:**
   - Go to Google Rich Results Test
   - Paste location page URL
   - Verify: "LocalBusiness" or "Restaurant" schema shows with no errors

5. **Monitor:**
   - Wait 48 hours
   - Check Google Search Console → Coverage → "Rich results eligible"
   - Check Google Maps for location panels appearing in search

**Acceptance Criteria:**
- All location pages have LocalBusiness/Restaurant schema
- Schema validated with no errors
- Appears in GSC within 48 hours

**Estimated Effort:** 4-5 hours (scales with # locations)

**Owner:** Developer

**Timeline:** Week 2-3

---

### PHASE 3: ADVANCED SEO & CONTENT (Weeks 5-6) — 35 Hours

#### Task 3.1: Implement Featured Snippet Strategy (FAQ Schema)
**Objective:** Create FAQ sections on top pages targeting zero-click queries

**Why:** 588 zero-click queries (200+ impr, <5 clicks) = featured snippet opportunities. Each featured snippet = +50-300% CTR boost.

**Data Source:** `/audit/data/gsc_zero_click.json` or GSC

**Top Zero-Click Queries (High Impact):**
1. "fried eggs near me" (521K impr, 0 clicks)
2. "scrambled eggs near me" (349K impr, 0 clicks)
3. "best restaurants near me" (139K impr, 4 clicks)
4. "poached eggs near me" (119K impr, 0 clicks)
5. "omelet near me" (65K impr, 1 click)

**Detailed Steps:**

1. **Identify top 20 zero-click queries:**
   - GSC → Performance → Sort by impressions
   - Filter: Clicks = 0, Impressions >200

2. **For each query, analyze:**
   - Does current ranking page answer this question directly?
   - If yes: Add FAQ schema
   - If no: Create new content section

3. **Create FAQ content:**
   - **Format:**
     ```
     Q: [Query from GSC]
     A: [40-60 word direct answer]
     
     Example:
     Q: "What are fried eggs?"
     A: "Fried eggs are cooked in butter or oil in a skillet with the yolk staying intact. They can be served sunny-side-up (yolk running), over-easy (yolk slightly runny), or over-hard (yolk fully cooked). Wild Eggs offers fresh fried eggs made to order, cooked exactly how you like them."
     ```

4. **Implement FAQPage schema:**
   - Add to page via Yoast/AIOSEO or manual JSON-LD
   - Template location: `/audit/fixes/schema/` (create FAQPage template)

5. **Monitor:**
   - After 2-4 weeks, check GSC for "Featured snippet" status
   - Screenshot featured snippet if achieved

6. **Iterate:**
   - If featured snippet not achieved, improve answer quality
   - Try different answer formats (lists, tables, etc.)

**Acceptance Criteria:**
- 20 FAQ sections created on relevant pages
- FAQPage schema validated
- At least 5-10 featured snippets achieved within 4 weeks
- Estimated +1,500 clicks/month from snippet recovery

**Estimated Effort:** 6-8 hours

**Owner:** Content Specialist / SEO

**Timeline:** Weeks 3-4

---

#### Task 3.2: Add Plain-Text Menu Section
**Objective:** Add static, searchable menu to /menu page (currently hidden in interactive filters)

**Why:** 60% of menu content hidden in interactive components that LLMs can't parse. Static text improves AI crawlability + SEO.

**Detailed Steps:**

1. **Export full menu from CMS:**
   - From menu plugin or database
   - Include: bowl names, descriptions, prices, dietary tags

2. **Create new page section:**
   - Add section below interactive menu: "Full Text Menu" or "Menu Directory"
   - Format as: **Bowl Name** | Price | Description | [Dietary tags: GF, V, etc.]

3. **Example:**
   ```
   BOWLS
   
   Mediterranean Bowl | $8.50 | Fresh greens, grilled chicken, feta cheese, 
   olives, tomatoes, cucumber. High-protein, gluten-free option available.
   
   Thai Bowl | $8.50 | Jasmine rice, grilled chicken, broccoli, carrots, 
   cabbage, topped with peanut sauce. Vegan option: substitute tofu.
   
   [Continue for all items...]
   ```

4. **Add MenuItem schema:**
   - Use `/audit/fixes/schema/menuitem-template.json`
   - Include: name, description, price, category

5. **Test:**
   - Verify full menu searchable via Ctrl+F on page
   - Verify schema validated via Rich Results Test

**Acceptance Criteria:**
- Full menu visible in plain text on /menu page
- All items listed (bowls, wraps, salads, sides)
- Prices visible
- Dietary tags included
- MenuItem schema validated

**Estimated Effort:** 3-4 hours

**Owner:** Content Specialist / Developer

**Timeline:** Week 1 (quick win), detailed version Week 3

---

#### Task 3.3: Fix Keyword Cannibalization (6 Cases)
**Objective:** Consolidate or differentiate pages competing on same queries

**Why:** When 2+ pages rank for same query, they dilute each other's authority. Consolidating = ranking improvement.

**Cases from keyword report:**

| Query | Competing Pages | Issue | Solution |
|-------|---|---|---|
| breakfast near me | 8 pages rank | Fragmented clicks | Consolidate to /menus as primary |
| fried eggs near me | 9 pages, 0 total clicks | Multiple pages, zero clicks | Assign to single location page |
| wild eggs menu | 11+ pages | Authority dilution | Primary: /menus, secondary: location pages |

**Detailed Steps:**

1. **For each cannibalization case:**
   - Decide: consolidate (merge + redirect) or differentiate (rewrite)?
   - **Consolidate:** Identify primary page (highest domain authority), 301 redirect duplicates
   - **Differentiate:** Rewrite secondary pages to target different keyword angle

2. **Example (Consolidate "breakfast near me"):**
   - Current: /menus ranks pos 3.6, /main-menu ranks pos 10.6, /reservations pos 4.5 + others
   - Action: Keep /menus as primary, add 301 redirect from /main-menu → /menus
   - Update internal links to point to /menus only

3. **Example (Differentiate "fried eggs near me"):**
   - Current: Multiple pages rank, none fully optimized
   - Action: Rewrite /evansville-location/ page to target "fried eggs in Evansville"
   - Add specific section to Evansville page about fried eggs (call-to-action: "Order our fresh fried eggs")

4. **Implement redirects (if consolidating):**
   - Create 301 redirect in WordPress (Yoast Redirect Manager) or .htaccess
   - Test: Old URL should redirect to new URL

5. **Monitor:**
   - GSC: Check if consolidated page improves position/clicks
   - Expect: 2-3 week lag before re-ranking

**Acceptance Criteria:**
- 6 cannibalization cases resolved
- Primary pages identified for each keyword
- 301 redirects working (if consolidating)
- GSC shows position/click improvement within 2-3 weeks
- Estimated gain: +300-400 clicks/month

**Estimated Effort:** 4-5 hours

**Owner:** SEO Specialist

**Timeline:** Week 2-3

---

#### Task 3.4: Create About Us Page (E-E-A-T)
**Objective:** Create /about-us page with founder story, mission, values, team, sourcing

**Why:** E-E-A-T signals (Expertise, Authoritativeness, Trustworthiness, Experience) improve rankings. About Us is foundational.

**Content outline (800-1200 words):**

1. **Founder story** (300-400 words)
   - When founded?
   - Founder background (chef, entrepreneur, etc.)
   - Why Crazy Bowls? Origin story
   - Early years / growth

2. **Mission & values** (200-300 words)
   - What do you stand for?
   - Commitment to health, sustainability, community?
   - Values: Quality, freshness, customer service

3. **Sourcing & quality** (200-300 words)
   - Where do ingredients come from?
   - Quality standards
   - Any certifications? (organic, fair-trade, etc.)
   - Supplier relationships

4. **Team** (optional, 100-200 words)
   - Key team members
   - Photos + brief bios
   - Chef / operations manager / founder

5. **Recognition** (optional)
   - Awards, press mentions, media features
   - Customer testimonials

**Implementation:**
1. Draft content (2-3 hours)
2. Add photos (founder, team, sourcing)
3. Add Organization schema (founder info)
4. Link from homepage, footer
5. Add to main navigation (optional)

**Acceptance Criteria:**
- /about-us page exists
- 800+ words
- Linked from homepage and footer
- Organization schema includes founder info
- Photos included

**Estimated Effort:** 2-3 hours (content) + 1 hour (design + schema)

**Owner:** Content Specialist / Designer

**Timeline:** Week 2

---

#### Task 3.5: Schema Rollout — Phase 3 (Menu + MenuItem)
**Objective:** Implement Menu + MenuItem schema across menu pages

**Why:** Enables menu item rich snippets in search results, improves voice search answers.

**Data Source:** `/audit/fixes/schema/menu.json` + `menuitem-template.json`

**Steps:**
1. Generate Menu schema for each category (Bowls, Wraps, Salads, Sides)
2. Generate MenuItem schema for each item (name, description, image, offers/price)
3. Implement via plugin or manual JSON-LD
4. Test via Rich Results Test
5. Monitor for rich snippet appearance in Google Images, voice results

**Acceptance Criteria:**
- Menu pages show Menu schema in Rich Results Test
- Item pages show MenuItem schema
- All required fields populated
- No validation errors

**Estimated Effort:** 6-8 hours

**Owner:** Developer

**Timeline:** Week 3

---

### PHASE 4: TRUST & AUTHORITY (Weeks 7-8) — 30 Hours

#### Task 4.1: Integrate Google Reviews
**Objective:** Display customer reviews on website (pulled from Google Business Profile)

**Why:** Trust signals (reviews, ratings) increase conversion rate 2-3x. Currently zero reviews visible on site.

**Steps:**

1. **Ensure Google Business Profile has reviews:**
   - Go to Google Business Profile for each location
   - Verify phone number, address, hours
   - Check: Do customers see the location in Google Maps?

2. **Choose integration method:**
   - **Option A (Plugin):** Install "Google Reviews for WP" or similar plugin
     - Pulls reviews from GBP automatically
     - Displays on homepage, /locations, pages
     - Effort: 2-3 hours (setup + customization)
   
   - **Option B (API):** Use Google Business Profile API
     - More control, but requires development
     - Effort: 4-6 hours
   
   - **Option C (Manual):** Screenshot reviews, add manually
     - Low-tech but not scalable
     - Effort: 3-4 hours

3. **Display reviews on:**
   - Homepage: Aggregated star rating + 2-3 top reviews
   - /locations page: Per-location reviews
   - Product pages: Average rating (optional)

4. **Test:**
   - Verify reviews display on mobile + desktop
   - Click to Google Business Profile (should open in new tab)
   - Check that ratings are current

**Acceptance Criteria:**
- Customer reviews visible on 3+ pages
- Average rating displayed
- Works on mobile + desktop
- Reviews update automatically (if using plugin/API)

**Estimated Effort:** 4-6 hours (including setup + testing)

**Owner:** Developer / Marketing

**Timeline:** Weeks 2-3

---

#### Task 4.2: Add Customer Testimonials Section
**Objective:** Create customer testimonials section (homepage + /about-us)

**Why:** Testimonials = high-impact E-E-A-T + social proof. Increases trust and conversion rate.

**Steps:**

1. **Gather testimonials (5-10):**
   - Email existing customers
   - Request permission to use name/photo
   - Ask: "What's your favorite bowl/wrap and why?"
   - Example: "I love the Mediterranean Bowl because it's healthy and filling. Great for lunch!" — Sarah M., Denver

2. **Write/edit testimonials:**
   - Ensure each is 1-2 sentences
   - Include: Customer first name + last initial + location (optional: photo)
   - Avoid: Generic "Great food!" — need specifics

3. **Create section:**
   - Homepage (below fold or in sidebar)
   - /about-us page
   - Format: Testimonial cards with photo, quote, name

4. **Add schema (optional):**
   - ReviewAction schema for each testimonial
   - Effort: +1 hour

**Acceptance Criteria:**
- 5+ testimonials visible on homepage or /about-us
- Includes customer names, locations (optional: photos)
- Specific, believable quotes (not generic)

**Estimated Effort:** 3-4 hours

**Owner:** Content Specialist / Designer

**Timeline:** Weeks 2-3

---

#### Task 4.3: Create Terms of Service Page
**Objective:** Create /terms-of-service page with website T&C

**Why:** Missing T&C = trust gap. Also legally recommended for e-commerce.

**Steps:**

1. Use template from termly.io (free tier) or iubenda
2. Customize for Crazy Bowls business model
3. Deploy to /terms-of-service
4. Link from footer (all pages)

**Content to cover:**
- Use of website
- Intellectual property
- Liability disclaimers
- User conduct rules
- Limitation of liability

**Acceptance Criteria:**
- /terms-of-service page exists
- Linked from footer
- 500+ words
- Professional, readable

**Estimated Effort:** 1-2 hours

**Owner:** Legal / Content

**Timeline:** Week 1

---

#### Task 4.4: Form Friction Audit (If Forms Exist)
**Objective:** Analyze conversion forms and reduce field count

**Why:** Each form field decreases completion rate 5-10%. Desktop converts 3.3x better than mobile = likely form friction.

**Forms to audit:**
- Contact form (catering, feedback)
- Order form (if applicable)
- Newsletter signup
- Reservation form (if applicable)

**Detailed Steps:**

1. **Identify all forms:**
   - List all contact/conversion forms on site
   - For each, count fields

2. **Measure completion rate:**
   - GA4 → Events → form_submit
   - Compare: form_view vs. form_submit
   - Calculate: completion rate = (submit / view) × 100%
   - Flag: Forms with <50% completion as high-friction

3. **Analyze field dropoff:**
   - Heatmap tool (e.g., Hotjar) can show where users abandon
   - Or ask users why they didn't complete

4. **Reduce form friction:**
   - Remove optional fields (move to follow-up email)
   - Combine fields (name + email on one line)
   - Progressive profiling (basic form → upsell later)
   - Example:
     ```
     OLD (5 fields):
     - Full name
     - Email
     - Phone
     - Company
     - Message
     
     NEW (3 fields):
     - First name
     - Email
     - Message
     ```

5. **Test:**
   - A/B test: Old form vs. new form (50/50 split)
   - Duration: 2 weeks
   - Measure: Completion rate improvement (target: +20%)

**Acceptance Criteria:**
- Forms reduced to ≤5 fields
- Completion rate increases by ≥20%
- Optional fields removed or moved to follow-up

**Estimated Effort:** 4-6 hours

**Owner:** Developer / Conversion Specialist

**Timeline:** Week 2

---

#### Task 4.5: Schema Rollout — Phase 4 (BreadcrumbList + Catering)
**Objective:** Add BreadcrumbList schema to all inner pages; add Organization + ContactPoint to catering page

**Why:** BreadcrumbList improves site navigation in SERP; ContactPoint helps catering queries.

**Steps:**
1. BreadcrumbList on all inner pages (Homepage → Category → Item)
2. ContactPoint schema on /catering page (phone, email, form URL)
3. Test via Rich Results Test
4. Verify in GSC within 48 hours

**Acceptance Criteria:**
- All inner pages have BreadcrumbList schema
- /catering has ContactPoint schema
- No validation errors

**Estimated Effort:** 4-5 hours

**Owner:** Developer

**Timeline:** Weeks 3-4

---

### PHASE 5: TESTING & OPTIMIZATION (Weeks 9-10) — 20 Hours

#### Task 5.1: Internal Linking Strategy for Orphan Pages
**Objective:** Add internal links to 49 orphan pages (zero inbound links currently)

**Why:** Orphan pages don't rank because Google can't discover them. Internal links help discovery + ranking.

**Data source:** Orphan pages list from Phase 3 report

**Steps:**

1. **For each of 49 orphan pages:**
   - Assess relevance: Important (catering, delivery) or supporting (hours)?
   - If important: Add to main navigation or footer
   - If supporting: Add contextual links from related pages

2. **Examples:**
   - /Hours/breakfast-monday-friday/: Link from /menu → "Hours"
   - /allergen-menu/: Link from /menu → "Allergen Information"
   - /nutrition-information/: Link from /menu → "Nutrition Info"
   - /delivery/: Link from /menu → "Delivery"

3. **Implementation:**
   - Edit pages in WordPress
   - Add contextual links using anchor text that matches page title
   - Use keyword-rich anchor text (but natural reading)
   - Effort: ~2-3 min per page × 49 = 2-3 hours

4. **QA:**
   - Verify links in browser
   - Check link color/styling
   - Ensure no broken links

**Acceptance Criteria:**
- All 49 orphan pages have ≥1 inbound link
- Links are contextual (from related pages)
- Anchor text is keyword-rich but natural
- No broken links

**Estimated Effort:** 4-6 hours

**Owner:** SEO Specialist

**Timeline:** Week 4

---

#### Task 5.2: Schema Validation & Testing
**Objective:** Validate all implemented schema using Google Rich Results Test

**Why:** Ensure schema is correct before relying on it for traffic gains.

**Steps:**

1. **For each major page type:**
   - Homepage (Organization)
   - Location pages (LocalBusiness)
   - Menu pages (Menu + MenuItem)
   - FAQ pages (FAQPage)
   - Breadcrumb pages (BreadcrumbList)

2. **Test via Google Rich Results Test:**
   - Go to https://search.google.com/test/rich-results
   - Paste page URL
   - Click "Test URL"
   - Document: Valid/Invalid, errors, warnings

3. **Fix errors:**
   - Common issues: Missing required fields, invalid data type
   - Re-test after fix
   - Document fix

4. **Monitor GSC:**
   - Go to GSC → Enhancements
   - Check "Rich results" status
   - Verify pages showing "Eligible" or "Yes"

5. **Document:**
   - Spreadsheet: Page URL, Schema Type, Status (Valid/Invalid/Error), Error details

**Acceptance Criteria:**
- 90%+ of schema pages show "Valid" in Rich Results Test
- 0 critical errors
- All errors documented and fixed

**Estimated Effort:** 2-3 hours

**Owner:** SEO Specialist / QA

**Timeline:** Week 4

---

#### Task 5.3: Full Crawl QA Test
**Objective:** Re-crawl site to verify all changes deployed correctly

**Steps:**

1. **Run full crawler:**
   - Use `/audit/crawler.py` (Python script already exists)
   - Command: `python3 crawler.py https://crazybowlsandwraps.com`
   - Generates: crawl_final.csv, link-graph-final.json

2. **Compare old vs. new crawl:**
   - Old crawl (Phase 2): 126 pages, 0% meta descriptions, 0% schema
   - New crawl (Phase 5): 126 pages, 100% meta descriptions, 90%+ schema
   - Diff: Meta description coverage, schema coverage, broken links, title lengths

3. **Verify improvements:**
   - ✓ Meta description coverage: 0% → 100%
   - ✓ H1 tags: 88.9% → 100%
   - ✓ Canonical tags: 77.8% → 100%
   - ✓ Schema coverage: 0% → 80%+
   - ✓ Broken links: 1 → 0
   - ✓ Title lengths: avg 38.6 → avg 50-60 chars

4. **Generate report:**
   - Before/after metrics
   - Areas improved, areas needing work
   - Recommendations for next phase

**Acceptance Criteria:**
- Full crawl completed
- Baseline metrics documented
- 100% meta description coverage
- <5 broken links
- 80%+ schema coverage

**Estimated Effort:** 1-2 hours

**Owner:** QA / Developer

**Timeline:** Week 4

---

#### Task 5.4: GA4 Conversion Tracking Verification
**Objective:** Confirm conversion tracking is now working after Task 1.1 fix

**Steps:**

1. **Place test order:**
   - Go through full order flow on site
   - Complete order on external platform (or test checkout)
   - Note order confirmation page or email

2. **Verify in GA4:**
   - Open GA4 property
   - Go to "Conversions" report
   - Filter by date (last 24 hours)
   - Should see your test order

3. **Check baseline CR:**
   - GA4 → Monetization → Conversion rate
   - Should be ≥0.1% now (up from 0.02% baseline)
   - Document new baseline for future comparison

4. **Troubleshoot if not working:**
   - Check event name: Does GA4 show the conversion event in real-time?
   - Check pixel: Is order.online pixel firing? (Use browser DevTools → Network tab)
   - Check Google Tag Manager (if using): Does GTM show conversion firing?

**Acceptance Criteria:**
- Test order appears in GA4 Conversions report within 24 hours
- GA4 conversion rate ≥0.1%
- Baseline CR documented

**Estimated Effort:** 1-2 hours

**Owner:** Analytics / Developer

**Timeline:** Week 1 (immediate post-fix verification)

---

#### Task 5.5: Soft Launch QA (10% Canary) [OPTIONAL]
**Objective:** Roll out changes to 10% of traffic first to verify no issues

**Steps:**

1. **Set up A/B test (if tool available):**
   - Control: Old site version (0% of changes)
   - Treatment: New site version (all changes, 100%)
   - Split: 90% control, 10% treatment
   - Duration: 3-5 days

2. **Monitor for issues:**
   - GA4: Any crawl errors? (Check Crawl Stats)
   - Analytics: Any anomalies in traffic, bounce rate?
   - User feedback: Complaints via contact form?
   - Conversion tracking: Still working?

3. **Check metrics:**
   - Organic traffic trend
   - Bounce rate change
   - Conversion rate change (if baseline is good)
   - Page load speed (any regressions?)

4. **If all good:** Rollout to 100%
5. **If issues:** Rollback and debug

**Acceptance Criteria:**
- No crawl errors
- No significant metric anomalies
- Conversion tracking still working
- Ready for full rollout

**Estimated Effort:** 2-3 hours (setup + monitoring)

**Owner:** Developer / Analytics

**Timeline:** Week 4 (before full launch)

---

### PHASE 6: MONITORING & HANDOFF (Weeks 11-12) — 10 Hours

#### Task 6.1: Full Audit Crawler Run (Final Baseline)
**Objective:** Re-crawl entire site post-implementation to document new baseline

**Steps:**
1. Run full crawler (same as Task 5.3)
2. Generate final metrics: crawl_final.csv
3. Compare all metrics vs. Phase 2 baseline
4. Document improvements:
   - Meta descriptions: 0% → 100%
   - Schema: 0% → 80%+
   - Broken links: 1 → 0
   - etc.
5. Archive crawl reports for future audits

**Acceptance Criteria:**
- Final crawl completed
- All metrics documented
- Before/after comparison generated

**Estimated Effort:** 2-3 hours

**Owner:** QA / SEO

**Timeline:** Week 11

---

#### Task 6.2: Create QA Checklist for Future Maintenance
**Objective:** Document recurring checks to maintain SEO health

**Checklist items:**

**Monthly Checks (1-2 hours):**
- [ ] Full site crawl (broken links, on-page issues)
- [ ] GA4 conversion tracking verification (test order)
- [ ] Google Search Console: Review crawl errors, coverage issues
- [ ] Organic traffic trend: Up/down vs. previous month?

**Quarterly Checks (4-6 hours):**
- [ ] Keyword ranking audit (top 100 keywords, positions)
- [ ] New page SEO checklist (meta, canonical, H1, schema)
- [ ] Content audit: Any pages with low engagement/high bounce?
- [ ] Backlink audit: Any lost links, toxic links?

**Annually (Full audit, 20-40 hours):**
- [ ] Repeat Phase 1-9 audit (full comprehensive)
- [ ] Competitor analysis
- [ ] Content strategy review
- [ ] Technical SEO deep dive

**Acceptance Criteria:**
- Checklist documented in spreadsheet/document
- Owners assigned to each task
- Schedule set (monthly, quarterly, annual)

**Estimated Effort:** 2-3 hours

**Owner:** Project Manager

**Timeline:** Week 11

---

#### Task 6.3: Training & Handoff Documentation
**Objective:** Document how to maintain SEO going forward

**Create:** `/audit/MAINTENANCE-GUIDE.md` with sections:

1. **How to add SEO to new pages:**
   - Checklist: Meta description, title, H1, canonical, schema
   - Examples: Create a new bowl page, location page
   - Tools: Yoast/AIOSEO screenshots

2. **How to monitor rankings:**
   - Google Search Console: Set up property alerts
   - Track keywords: Create GSC tracking list
   - Tools: Semrush, Ahrefs (if budget allows)

3. **How to add content and maintain E-E-A-T:**
   - Author guidelines
   - Content template
   - E-E-A-T checklist

4. **Tools overview:**
   - Google Search Console (free, essential)
   - Google Analytics 4 (free, essential)
   - Yoast SEO (paid, recommended)
   - Screaming Frog (free tier available, crawl testing)

5. **Common issues & solutions:**
   - Meta description not updating? Use Yoast/AIOSEO plugin
   - Ranking dropped? Check for algorithm update, manually review on-page
   - Conversion tracking broken? Check GA4 goal configuration

**Acceptance Criteria:**
- Maintenance guide complete
- Internal team trained
- Process documented for future team members

**Estimated Effort:** 2-3 hours

**Owner:** Project Manager / SEO Lead

**Timeline:** Week 12

---

## SUMMARY BY EFFORT & IMPACT

### Quick Wins (15-30 minutes, Very High Impact)
- Create /llms.txt file (15 min)
- Create Terms of Service page (1-2 hrs, but quick to implement)
- Add plain-text menu section (30 min)
- Fix 1 broken Cloudflare link (30 min)

### High-Impact Priorities (3-8 hours, Critical-High Impact)
- **Fix GA4 conversion tracking** (2-4 hrs, BLOCKER)
- Meta descriptions top 50 pages (6-8 hrs, +1,250 clicks/mo)
- Quick-win keyword fixes (6-8 hrs, +3,000 clicks/mo)
- Mobile CTA optimization (8-10 hrs, +500 clicks/mo)
- /locations page redesign (6-8 hrs, +2,000 orders/mo)

### Foundation Work (4-8 hours, Medium-Term Payoff)
- Schema rollout phases 1-5 (11-18 hrs total, +2,000 clicks/mo)
- E-E-A-T improvements (8-10 hrs, +200 clicks/mo + trust)

### Medium-Priority Tasks (4-6 hours, Moderate Impact)
- Complete meta descriptions (10-12 hrs, continuation)
- CTR anomaly fixes (4-6 hrs, +500 clicks/mo)
- Keyword cannibalization (4-5 hrs, +300-400 clicks/mo)
- Customer reviews integration (4-6 hrs, +15-30% CR)
- Orphan page linking (4-6 hrs, +300 clicks/mo)

---

## RESOURCE ALLOCATION & TIMELINE

### Recommended Team
- **Content Specialist** (6-8 hrs/week): Meta descriptions, FAQ content, About Us, testimonials
- **Developer** (6-8 hrs/week): Schema, sticky footer, form optimization, GA4 setup, testing
- **SEO Specialist** (4-6 hrs/week): Keyword research, title rewrites, internal linking, monitoring
- **Designer** (2-4 hrs/week): /locations redesign, CTA design, mobile UX
- **Analytics** (2-3 hrs/week): GA4 tracking, conversion setup, metric monitoring

### Timeline (12 Weeks)
- **Weeks 1-2:** Foundation fixes (40 hrs) — GA4, meta descriptions, quick wins, schema phase 1
- **Weeks 3-4:** On-page & conversion (40 hrs) — Complete meta descriptions, CTR fixes, mobile CTA, /locations redesign
- **Weeks 5-6:** Advanced SEO (35 hrs) — Featured snippets, About Us, E-E-A-T, schema phases 2-4
- **Weeks 7-8:** Trust & authority (30 hrs) — Reviews, testimonials, form optimization
- **Weeks 9-10:** Testing & QA (20 hrs) — Schema validation, crawl testing, conversion verification
- **Weeks 11-12:** Launch & documentation (10 hrs) — Final crawl, QA checklist, training

**Total:** 150-180 hours over 12 weeks (3-4 hours/week per full-time team, distributed)

---

## SUCCESS METRICS & TESTING

### Baseline Metrics (Pre-Implementation, Weeks 1-2)
- Organic traffic: 92K sessions/month
- Conversion rate: 0.02% (broken) → establish true baseline post-GA4 fix
- Top 10 keywords: ~200
- Meta description coverage: 0%
- Schema coverage: 0%

### Intermediate Checkpoints (Weeks 4-6)
- Meta descriptions: 100% (all pages)
- Schema: 50%+ coverage (Organization, LocalBusiness, Menu)
- Organic traffic: 94K-96K sessions/month (should start improving)
- Bounce rate: /locations drops from 53.5% to <45%

### Final Results (Weeks 10-12)
- Organic traffic: 100-128K sessions/month (+8-39%)
- Top 10 keywords: 500+ (80% improvement)
- Featured snippets: 20-30 (new wins)
- Conversion rate: 0.5% (assuming GA4 fix)
- Meta descriptions: 100%
- Schema coverage: 90%+

### Post-Launch Monitoring (Months 3-6)
- Monthly check-ins: Traffic trends, keyword rankings, conversion rate
- GSC performance: New keywords, positioning improvements
- User feedback: Any issues, suggestions?
- ROI calculation: New revenue from organic improvements

---

## DELIVERABLES CHECKLIST

**Contractor should deliver:**

- [ ] FULL-AUDIT-REPORT.md (comprehensive executive summary)
- [ ] ACTION-PLAN.md (this document — task-by-task breakdown)
- [ ] crawl_final.csv (post-implementation crawl data)
- [ ] Before/After comparison report
- [ ] GA4 conversion tracking setup (screenshots, verification)
- [ ] Meta descriptions spreadsheet (all 126 pages)
- [ ] Schema implementation documentation
- [ ] QA checklist
- [ ] Maintenance guide
- [ ] Training materials (internal team)

---

## ESTIMATED BUDGET & ROI

**Team Cost (Estimated):**
- Content Specialist: 50 hrs × $50/hr = $2,500
- Developer: 60 hrs × $75/hr = $4,500
- SEO Specialist: 35 hrs × $60/hr = $2,100
- Designer: 20 hrs × $65/hr = $1,300
- Analytics: 15 hrs × $55/hr = $825
- **Total project cost: ~$11,225** (using mid-market rates)

**Revenue Impact:**
- Current traffic: 92K sessions/month
- Current conversion rate: ~0.02% (broken) → assume 0.5% post-fix
- Current orders: ~17/month (broken tracking)

- New traffic: 102K-128K sessions/month (+10-39%)
- New conversion rate: 0.5%
- New orders: 510-640/month (+493-623 orders)
- Revenue per order: ~$30 (assumption)
- **New monthly revenue: $14,790-$19,200**
- **Annual revenue gain: $177K-$230K**

**ROI:** ($177K - $11K) / $11K = **1,509% first-year ROI**

---

## RISK & MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| GA4 conversion tracking requires code changes | Medium | BLOCKER | Verify with developer early; may need specialist |
| Schema implementation conflicts with existing design | Low | HIGH | Test in staging first, validate with Google Rich Results Test |
| Team turnover mid-project | Medium | HIGH | Document all processes; assign backups |
| New algorithm update disrupts rankings | Low | MEDIUM | Maintain diversified keyword portfolio; don't rely on single tactic |
| Client changes requirements mid-project | Medium | MEDIUM | Weekly check-ins; get sign-off on tasks before execution |

---

## NEXT STEPS

1. **Week 1 kickoff:**
   - Assign team members
   - Set up project tracking (Asana, Monday.com, etc.)
   - Schedule weekly sync meetings

2. **Day 1:**
   - [ ] Task 1.1: Fix GA4 conversion tracking
   - [ ] Task 1.4: Create /llms.txt
   - [ ] Task 4.3: Create Terms of Service
   - [ ] Task 3.2: Add plain-text menu

3. **Day 2-3:**
   - [ ] Task 1.2: Add meta descriptions (top 50)
   - [ ] Task 1.3: Quick-win keyword fixes
   - [ ] Task 1.5: Schema phase 1 (Organization)

4. **Week 2:**
   - [ ] Task 1.6: Fix broken link
   - [ ] Task 2.1-2.7: On-page + conversion optimization
   - [ ] Start schema phase 2

5. **Week 3-12:**
   - Continue per phased roadmap above
   - Weekly sync to review progress, adjust timelines
   - QA testing after each phase

---

**Project Generated:** 2026-06-16  
**Audit Team:** Claude Code  
**Estimated Completion:** 2026-09-16 (12 weeks post-kickoff)  
**Next Review:** 2026-12-16 (90 days post-launch for final impact measurement)

---
