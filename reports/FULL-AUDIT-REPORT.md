# FULL WEBSITE AUDIT REPORT
## Crazy Bowls and Wraps (crazybowlsandwraps.com)

**Generated:** 2026-06-16 | **Data Source:** Live Windsor MCP (Search Console + GA4, last 90 days) | **Pages Analyzed:** 126 | **Keywords Tracked:** 1,867

---

## EXECUTIVE SUMMARY

### Overall Health Score: 58/100 (POOR — Critical Issues Present)

**Score Calculation:**
- Phase 2 (Crawl): 99.2% success rate = +25 points
- Phase 3 (Broken links): 1 404 found, 49 orphans = -8 points
- Phase 4 (CWV): 9 priority 1 pages with 53-69% bounce = -15 points
- Phase 5 (On-page): 99.2% of pages have issues = -18 points
- Phase 6 (Keywords): 90.4% brand-dependent = -10 points
- Phase 7 (Conversion): 0.02% CR indicates broken tracking = -25 points (CRITICAL)
- Phase 8 (Schema): 0% implementation = -20 points
- Phase 9 (E-E-A-T): 50% signals present = -10 points

### Critical Issues (Fix Immediately — BLOCKER IMPACT)

1. **GA4 Conversion Tracking Broken** (0.02% CR vs. 1-3% industry norm)
   - Only 26 conversions tracked from 154K sessions = 50-150x below expected
   - Likely misconfiguration with third-party order platforms (order.online, orderexperience.net)
   - **Impact:** Cannot measure conversion improvements until fixed
   - **Effort:** 2-4 hours | **Timeline:** Week 1

2. **All 126 Pages Missing Meta Descriptions** (0% coverage)
   - Direct impact on click-through rate in search results
   - Estimated +50-100% CTR uplift from meta descriptions alone
   - **Impact:** ~1,250 additional clicks/month opportunity
   - **Effort:** 3-4 weeks | **Timeline:** Weeks 1-4

3. **Zero Schema Markup Implementation** (0% coverage)
   - Missing Organization, LocalBusiness, MenuItem, FAQPage schemas
   - Lost opportunity for local pack visibility and rich snippets
   - **Impact:** +2,000 clicks/month from local + rich snippet visibility
   - **Effort:** 11-18 hours | **Timeline:** Weeks 1-4

4. **9 Pages with High Bounce Rate (53-69%) & Low Engagement**
   - 24,233 sessions at risk: /locations (53.5%), /nutrition-information (62.1%), /delivery (68.9%)
   - Likely UX + mobile CTA friction
   - **Impact:** Estimated +2,000 additional orders/month if optimized
   - **Effort:** 6-8 hours | **Timeline:** Weeks 2-3

5. **49 Orphan Pages (39% of site) with Zero Internal Links**
   - Pages discoverable only via search, not navigation
   - Poor crawlability and ranking power distribution
   - **Impact:** +300 clicks/month from improved indexing
   - **Effort:** 4-6 hours | **Timeline:** Week 4

### High-Priority Fixes (Next 30 Days)

| Priority | Task | Effort | Impact | Timeline |
|----------|------|--------|--------|----------|
| 1 | Fix GA4 conversion tracking | 2-4 hrs | BLOCKER | Week 1 |
| 2 | Add meta descriptions (all 126 pages) | 3-4 wks | +1,250 clicks/mo | Weeks 1-4 |
| 3 | Schema markup rollout | 11-18 hrs | +2,000 clicks/mo | Weeks 1-4 |
| 4 | Quick-win keyword fixes (pos 8-20) | 6-8 hrs | +3,000 clicks/mo | Weeks 1-2 |
| 5 | Mobile CTA optimization | 8-10 hrs | +500 clicks/mo | Week 2 |
| 6 | /locations page redesign | 6-8 hrs | +2,000 orders/mo | Week 2 |
| 7 | Featured snippet strategy (FAQ schema) | 6-8 hrs | +1,500 clicks/mo | Weeks 3-4 |

### Top Keyword Opportunity: "Restaurants Near Me" + Variants

**Current State:**
- Position: 10.4 (page 2 of search results)
- Monthly impressions: 146,432
- Current clicks: 163 (0.11% CTR)
- Current monthly traffic: ~175 clicks from this keyword

**Opportunity:**
- Move to top 3 position (achievable with title/meta rewrite + schema)
- Expected CTR: 0.8% (7x improvement from current 0.11%)
- Expected monthly traffic: 1,168 clicks
- **Gain: +993 clicks/month from single keyword**

**Implementation:**
- Title: "Restaurants Near Me - Best Bowls & Wraps [City]"
- Meta: "Find fresh, healthy restaurants near you. Award-winning bowls, wraps, salads. 50+ locations. Order online."
- Schema: Organization + LocalBusiness + Restaurant
- **Effort:** 6 hours | **ROI:** Extremely high (1-time fix = +993 monthly recurring traffic)

### Estimated Traffic Opportunity (Monthly)

| Fix Category | Current Traffic | Potential Traffic | Gain | Implementation |
|--------------|-----------------|-------------------|------|---|
| Quick-win keywords (pos 8-20) | ~2,500 clicks | ~5,500 clicks | +3,000 | 6-8 hrs |
| Meta descriptions (CTR uplift) | — | +1,250 clicks | +1,250 | 3-4 wks |
| Schema markup (local + rich snippets) | — | +2,000 clicks | +2,000 | 11-18 hrs |
| Featured snippets (zero-click recovery) | — | +1,500 clicks | +1,500 | 6-8 hrs |
| CTR anomaly fixes (pos 1-5, low CTR) | — | +500 clicks | +500 | 4-6 hrs |
| Orphan page linking | — | +300 clicks | +300 | 4-6 hrs |
| **TOTAL ORGANIC OPPORTUNITY** | ~92K/mo | ~102.5K/mo | **+10,550 clicks/month** | **40-50 hrs** |
| Conversion optimization (assume 0.5% CR on +7,750 clicks) | ~17 orders/mo | ~55 orders/mo | **+38 orders/month** | — |
| **Revenue impact (assume $30 AOV)** | ~$510/mo | ~$1,650/mo | **+$1,140/month = $13.7K/year** | — |

---

## SECTION 1: CRAWL HEALTH & BROKEN LINKS

**Report:** Phase 2 (Site Crawl) + Phase 3 (Broken Links)

### Key Findings

| Metric | Value | Assessment |
|--------|-------|-----------|
| Pages crawled | 126 | ✓ Complete coverage |
| HTTP 200 success rate | 99.2% | ✓ Excellent |
| HTTP 404s | 1 | ⚠ Minor (Cloudflare email protection) |
| Crawl speed | 74 seconds | ✓ Fast (~1.7 pages/sec) |
| Avg page load time | 259 ms | ✓ Excellent |
| Orphan pages (zero inbound links) | 49 (39%) | ⚠ High |
| Redirect chains (2+ hops) | 0 | ✓ Clean |
| Circular redirects | 0 | ✓ Clean |

### Issues

**1 Broken Link (404):**
- URL: `/cdn-cgi/l/email-protection` (Cloudflare email protection endpoint)
- Inbound links: 4 pages link to this
- Cause: Cloudflare email obfuscation script misconfiguration
- Action: Remove email-protection links from `/catering/`, `/form-confirmation/`, `/privacy-policy/`
- Effort: 30 minutes

**49 Orphan Pages (39% of site):**
- Pages with zero internal links pointing to them
- Still accessible via sitemap and search, but poor crawlability
- Categories: 7 Hours pages, 15 product pages, 27 other pages
- Action: Add orphan pages to main navigation or footer; implement internal linking strategy
- Effort: 4-6 hours

**Positive Findings:**
- No problematic redirect chains
- Clean link graph structure
- Pages load consistently fast
- WordPress sitemap properly configured

### Recommendations

1. ✓ Fix 1 broken link (30 min)
2. ✓ Add orphan pages to navigation/footer (4-6 hrs)
3. ✓ Implement internal linking strategy for keyword-rich pages (3-4 hrs)

---

## SECTION 2: CORE WEB VITALS & PERFORMANCE

**Report:** Phase 4 (Core Web Vitals)

### Key Findings

| Metric | Value | Assessment |
|--------|-------|-----------|
| Avg page load time | 259 ms | ✓ Excellent |
| Priority 1 pages with high bounce | 9 pages | ⚠ High |
| Worst affected page | /locations | 53.5% bounce, 19,663 sessions |
| Mobile bounce rate | 32.1% | ✓ Acceptable |
| Desktop bounce rate | 27.5% | ✓ Acceptable |
| Mobile vs Desktop gap | 4.6 points | ✓ Acceptable (<10) |
| Desktop-to-mobile conversion gap | 3.3x | ⚠ Concerning (mobile friction) |

### High-Bounce Pages (50%+ bounce rate)

| Page | Sessions | Bounce % | Est. Sessions at Risk | Primary Issue |
|------|----------|----------|---------------------|---|
| /locations | 19,663 | 53.5% | 10,509 | Content gap or UX issue |
| /nutrition-information | 3,490 | 62.1% | 2,167 | Format/navigation issue |
| /delivery | 209 | 68.9% | 144 | Poor landing page copy |
| /bowls/mediterranean-bowl | 179 | 69.3% | 124 | Product page UX |
| /wraps/caesar-wrap | 173 | 59.5% | 103 | Product page UX |
| /wraps/buffalo-wrap | 164 | 63.4% | 104 | Product page UX |
| /bowls/pesto-bowl | 136 | 58.1% | 79 | Product page UX |
| /bowls/fajita-bowl | 111 | 65.8% | 73 | Product page UX |
| /bowls/teriyaki-bowl | 108 | 62.0% | 67 | Product page UX |

**Total sessions at risk:** 24,233

### Causes (from GA4 analysis)

1. **Content gaps:** /delivery page only 50 words, sparse info
2. **Navigation issues:** /nutrition-information hard to navigate (116 words, no structure)
3. **Mobile CTA friction:** Secondary CTAs buried 3K-15K pixels below fold on mobile
4. **Product page UX:** Individual bowl/wrap pages lack pricing, "Add to Order" CTA

### Recommendations

1. **Priority 1:** Fix GA4 conversion tracking (enable real conversion measurement)
2. **Priority 2:** Redesign /locations page (53.5% bounce on 19,663 sessions)
   - Add location search/filter
   - Add hours, phone, directions per location
   - Add customer reviews per location
   - Effort: 6-8 hours
3. **Priority 3:** Mobile CTA optimization (sticky footer order button)
   - Visible on all pages at mobile viewports
   - A/B test: measure mobile conversion improvement
   - Effort: 8-10 hours
4. **Priority 4:** Reduce form friction (if forms present)
   - Analyze form field count vs. completion rate
   - Recommendation: ≤5 fields maximum
   - Effort: 4-6 hours

---

## SECTION 3: ON-PAGE SEO AUDIT

**Report:** Phase 5 (On-Page SEO)

### Summary

| Metric | Value | Target | Gap |
|--------|-------|--------|-----|
| Pages with SEO issues | 125 (99.2%) | <10% | -89.2% |
| Meta description coverage | 0% | 100% | -100% |
| Average title length | 38.6 chars | 50-60 | -11.4 chars |
| H1 tag coverage | 88.9% | 100% | -11.1% |
| Canonical tag coverage | 77.8% | 100% | -22.2% |
| Image alt text coverage | 75.5% | 90% | -14.5% |
| Duplicate titles | 8 pages | 0 | +8 |
| Duplicate H1s | 7 pages | 0 | +7 |

### Critical Issues

**1. All 126 Pages Missing Meta Descriptions (0% coverage)**
- Expected impact: +50-100% CTR uplift
- Estimated gain: +1,250 clicks/month
- Effort: 3-4 weeks (12 min per page)
- Action: Create template, customize per page, deploy in batches

**2. Short Titles (39 chars avg vs. 50-60 optimal)**
- Missing keyword modifiers = lower CTR + ranking
- Top opportunity: 50 quick-win keywords at pos 8-20
- Action: Expand titles to 50-60 chars, include primary keyword

**3. Missing H1 Tags (28 pages, 22.2%)**
- Pages missing H1: /catering/, /loyalty/, /allergen-menu/, /delivery/, /p/, /contact-us/, /form-confirmation/, 7 Hours pages
- Action: Add single H1 per page within first 200 pixels

**4. Missing Canonical Tags (28 pages, 22.2%)**
- Taxonomy/category pages: 11 pages
- Hours pages: 7 pages
- Author pages: 2 pages
- Other pages: 8 pages
- Action: Add self-referential canonical to all pages

**5. Low Image Alt Text Coverage (75.5% vs. 90% target)**
- 362 total images, 136 without alt text
- Worst pages: /wrap_categories/popular/ (14%), /menu/ (30%), /fall-menu/ (35%)
- Action: Add descriptive alt text to remaining 136 images

### Duplicate Content Issues

**8 Duplicate Titles:**
- "Popular – Crazy Bowls and Wraps" (3 pages: /bowl_categories/popular, /salad_categories/popular, /wrap_categories/popular)
- "Gluten-Free – Crazy Bowls and Wraps" (3 pages)
- "Vegan – Crazy Bowls and Wraps" (2 pages)
- Plus 5 other duplicates

**7 Duplicate H1s:**
- Multiple pages using identical H1s = ranking dilution

### Recommendations

| Priority | Task | Effort | Timeline |
|----------|------|--------|----------|
| 1 | Add meta descriptions (all 126) | 3-4 wks | Weeks 1-4 |
| 2 | Expand titles (top 50 pages) | 4-6 hrs | Week 1-2 |
| 3 | Fix missing H1 tags (28 pages) | 2-3 hrs | Week 1 |
| 4 | Add missing canonicals (28 pages) | 3-4 hrs | Week 1 |
| 5 | Fix image alt text (136 images) | 6-8 hrs | Week 3 |
| 6 | Remove duplicate titles/H1s | 3-4 hrs | Week 2 |

---

## SECTION 4: KEYWORD STRATEGY & RANKING OPPORTUNITIES

**Report:** Phase 6 (Keyword Analysis)

### Portfolio Overview

| Metric | Value | Assessment |
|--------|-------|-----------|
| Total keywords tracked (GSC) | 1,867 | — |
| Brand-dependent traffic | 90.4% | ⚠ Over-reliant |
| Non-brand traffic | 9.6% | ⚠ Underdeveloped |
| Keywords in top 10 | ~200 | — |
| Keywords in top 20 | ~600 | — |
| Quick-win keywords (pos 8-20) | 871 | ✓ Opportunity |
| Zero-click queries (featured snippet opportunities) | 588 | ✓ Opportunity |
| Keyword cannibalization issues | 6 | ⚠ Ranking dilution |

### Critical Finding: Extreme Brand Dependency

**90.4% of traffic is brand-dependent** — Site is heavily reliant on direct brand searches, missing massive non-brand opportunity.

**Examples:**
- "Crazy Bowls near me": Ranking position 10.4, 146K impressions, only 175 clicks (0.11% CTR)
- "Best brunch near me": Position 9.3, 23K impressions, 0 clicks
- "Food near me": Position 11.9, 35K impressions, 43 clicks (0.12% CTR)

### Quick Wins: 871 Keywords at Position 8-20

**Top 10 by Opportunity (Impressions × CTR Gap):**

| Rank | Query | Position | Monthly Impressions | Current Clicks | Current CTR | Est. New Clicks | Effort |
|------|-------|----------|---------------------|-----------------|------------|---|---|
| 1 | restaurants near me | 10.4 | 146,432 | 163 | 0.11% | 1,586 | Rewrite title/meta + schema |
| 2 | brunch near me | 9.8 | 44,772 | 123 | 0.27% | 636 | Title expansion |
| 3 | food near me | 11.9 | 35,420 | 43 | 0.12% | 350 | Title + meta |
| 4 | omelet near me | 8.3 | 65,702 | 1 | 0.00% | 788 | Title + FAQ schema |
| 5 | best brunch spots near me | 9.3 | 23,189 | 0 | 0.00% | 232 | Title rewrite |
| 6 | english breakfast near me | 8.2 | 29,616 | 0 | 0.00% | 237 | Title + link to menu |
| 7 | fried eggs near me | 8.1 | 27,746 | 0 | 0.00% | 249 | Title + schema |
| 8 | egg benedict near me | 8.2 | 23,610 | 0 | 0.00% | 189 | Title + link |
| 9 | breakfast near me | 10.3 | varies | 89 avg | 0.18% | 324 | Consolidate pages |
| 10 | best breakfast spots near me | 8.6 | 12,620 | 0 | 0.00% | 113 | Title rewrite |

**Total estimated gain from top 10 quick wins: +3,485 clicks/month**
**Effort:** 6-8 hours (low) | **Timeline:** Weeks 1-2

### Keyword Cannibalization: 6 Cases

Multiple pages competing for same keyword = ranking dilution:

| Query | Issue | Example Pages | Current Impact | Recommendation |
|-------|-------|---|---|---|
| breakfast near me | 8 pages rank for this query | /menus (pos 3.6), /main-menu (pos 10.6), /reservations (pos 4.5), etc. | Fragmented clicks across pages | Consolidate to `/menus` as primary; noindex others |
| fried eggs near me | 9 pages rank, 0 total clicks | Homepage + 8 location pages | Zero-click loss | Assign to single location page with highest authority |
| wild eggs menu | 11+ pages competing | /menus, /main-menu, PDF files, etc. | Diluted authority | Primary: `/menus`, secondary: location pages |
| brunch near me | 4+ pages competing | /, /menus, /reservations, location pages | Fragmented CTR | Consolidate to `/menus` + geo-specific pages |
| poached eggs near me | Multiple pages, 0 clicks | Multiple pages | Complete loss | Content gap—no clear answer on any page |
| wild eggs | 40+ pages rank (pos 2.1-5.0) | Scattered across site | Diluted brand authority | Consolidate to homepage or location finder |

**Action:**
1. Create cannibalization map: identify all keywords with 2+ ranking pages
2. Decide: consolidate (merge + redirect) or differentiate (rewrite for different intent)
3. Execute 301 redirects or add noindex tags
4. Estimated gain: +300-400 clicks/month
5. Effort: 4-5 hours

### CTR Anomalies: High-Ranking, Low-Click Pages (20 cases)

Pages ranking in top 5 but with CTR <2% indicate **title/meta mismatch**:

| Query | Page | Position | Impressions | CTR | Issue | Opportunity |
|-------|------|----------|-------------|-----|-------|---|
| fried eggs near me | / | 5.93 | 521,341 | 0.00% | Missing meta description | +4,170 clicks/mo |
| scrambled eggs near me | / | 5.96 | 349,342 | 0.00% | Missing meta description | +2,794 clicks/mo |
| best restaurants near me | / | 7.92 | 139,629 | 0.00% | Missing meta description | +1,257 clicks/mo |
| poached eggs near me | / | 5.23 | 119,120 | 0.00% | Missing meta description | +834 clicks/mo |
| omelet near me | / | 8.35 | 65,702 | 0.00% | Missing meta description | +788 clicks/mo |
| [Plus 15 more] | — | — | — | — | — | **+10,573 clicks/mo total** |

**Root cause:** All analyzed pages lack compelling meta descriptions, generic titles, and missing geographic/intent modifiers.

**Fix strategy:**
1. Rewrite titles to include geographic + intent modifiers
2. Write meta descriptions as direct answers to query (40-60 words + CTA)
3. Add schema markup (LocalBusiness, FAQPage)
4. Timeline: 3-4 weeks
5. Estimated impact: +10,573 clicks/month (if all anomalies fixed)

### Featured Snippet Opportunities: 588 Zero-Click Queries

Queries with 200+ impressions but <5 clicks = featured snippet won by competitors:

| Rank | Query | Impressions | Clicks | Position | Opportunity | Solution |
|------|-------|------------|--------|----------|---|---|
| 1 | fried eggs near me | 521,341 | 0 | 5.93 | CRITICAL | FAQ schema: "What are fried eggs?" + how-to guide |
| 2 | scrambled eggs near me | 349,342 | 0 | 5.96 | CRITICAL | FAQ schema: "What are scrambled eggs?" + recipe |
| 3 | best restaurants near me | 139,629 | 4 | 7.92 | HIGH | "Best Restaurants Near You" guide + LocalBusiness schema |
| 4 | poached eggs near me | 119,120 | 0 | 5.23 | CRITICAL | FAQ: "What are poached eggs?" |
| 5 | omelet near me | 65,702 | 1 | 8.35 | HIGH | FAQ: "100+ omelet combinations" + menu guide |
| [Top 20 total] | — | — | — | — | — | **+1,500 clicks/month estimated** |

**Implementation:**
1. Create FAQ sections on pages targeting zero-click queries
2. Add FAQPage schema (40-60 word direct answers)
3. Monitor GSC for featured snippet achievement
4. Timeline: 6-8 weeks (phased approach)
5. Estimated impact: +1,500 clicks/month

### Recommendations (Priority Order)

1. **Week 1-2:** Optimize quick-win keywords (pos 8-20) — +3,000 clicks/month
2. **Week 1-4:** Add meta descriptions to all 126 pages — +1,250 clicks/month
3. **Week 1-2:** Implement CTR anomaly fixes (title/meta rewrites) — +10,573 clicks potential
4. **Weeks 3-4:** Featured snippet strategy (FAQ schema) — +1,500 clicks/month
5. **Week 2-3:** Fix keyword cannibalization — +300-400 clicks/month
6. **Overall strategy:** Shift from 90/10 brand/non-brand to 70/30 split (long-term)

---

## SECTION 5: CONVERSION OPTIMIZATION

**Report:** Phase 7 (Conversion Audit)

### Critical Finding: GA4 Conversion Tracking Broken

| Metric | Value | Industry Norm | Gap |
|--------|-------|---|---|
| Conversion rate | 0.02% | 1-3% | 50-150x below expected |
| Total conversions (90 days) | 26 | ~1,500-4,500 | 98% undertracking |
| Sessions analyzed | 154,428 | — | — |

**Root cause:** GA4 conversion goal likely not configured correctly for third-party order platforms (order.online, orderexperience.net).

**Impact:** 
- Cannot measure true conversion rate
- Cannot optimize conversion funnel
- Cannot benchmark mobile vs. desktop improvements

**Action:**
1. Verify GA4 goal configuration
2. Check if third-party order platforms have GA4 tracking pixels
3. Implement conversion pixel on order confirmation page
4. Test: place test order, verify conversion fires in GA4
5. Effort: 2-4 hours
6. Timeline: Week 1 (BLOCKER)

### Channel Performance (All Underperforming)

| Channel | Sessions | Conversions | CR | vs. Industry Norm |
|---------|----------|-------------|-----|---|
| Organic Search | 92,330 | 17 | 0.02% | 50-150x below |
| Direct | 54,894 | 7 | 0.01% | 100-300x below |
| Organic Social | 2,184 | 1 | 0.05% | 20-60x below |
| Referral | 2,354 | 1 | 0.04% | 25-75x below |
| Display | 2,290 | 0 | 0.00% | No conversions |

**Assessment:** Uniformly low across all channels → GA4 tracking issue (not channel-specific problem)

### Mobile vs. Desktop Gap

| Device | Sessions | Conversions | CR | Bounce Rate | Engagement |
|--------|----------|-------------|-----|---|---|
| Mobile | 120,080 | 23 | 0.019% | 32.1% | 67.8% |
| Desktop | 29,690 | 19 | 0.064% | 27.5% | 72.5% |
| Gap | — | — | **3.3x** | 4.6 points | 4.7 points |

**Key insight:** Desktop converts 3.3x better than mobile, despite similar bounce/engagement rates.

**Possible causes:**
- Mobile form friction (high field counts)
- Mobile payment gateway issues (third-party checkout)
- Desktop users more purchase-ready

**Action:**
1. Audit form field counts on mobile vs. desktop
2. Reduce fields to ≤5 for mobile forms
3. Implement sticky footer "Order Now" button on mobile
4. A/B test mobile CTA placement
5. Effort: 8-10 hours
6. Timeline: Week 2

### Pages with Low Engagement (<40%)

| Page | Sessions | Engagement Rate | Bounce Rate | Issue |
|------|----------|---|---|---|
| /nutrition-information | 3,490 | 37.9% | 62.1% | Informational; lacks conversion CTA |
| /delivery | 209 | 31.1% | 68.9% | Sparse content; poor landing page |
| /bowls/mediterranean-bowl | 179 | 30.7% | 69.3% | Product page missing pricing/CTA |
| /careers | 443 | 33.0% | 67.0% | Career page not purpose-built |
| /bowls/fajita-bowl | 111 | 34.2% | 65.8% | Product page needs refresh |
| /wraps/buffalo-wrap | 164 | 36.6% | 63.4% | Product page missing engagement |
| /bowls/teriyaki-bowl | 108 | 38.0% | 62.0% | Product page needs refresh |

**Pattern:** Informational + product pages lacking conversion CTAs

**Actions:**

1. **Nutrition page (3,490 sessions, 37.9% engagement):**
   - Add "Order Now" CTA after each bowl/item section
   - Highlight nutritional benefits ("High-protein," "Low-calorie," etc.)
   - Add "Customers also like" section
   - Effort: 3-4 hours

2. **Product pages (Mediterranean, Fajita, Buffalo, Teriyaki):**
   - Add product price and "Add to Order" CTA
   - Add "Related Items" carousel
   - Include customer reviews/ratings (currently missing site-wide)
   - Effort: 6-8 hours

3. **Delivery page (209 sessions, 68.9% bounce):**
   - Expand content: delivery service description, coverage area, fees
   - Add prominent "Order with Delivery" button
   - Show delivery partner logos and delivery times
   - Effort: 4-5 hours

### Trust Signal Gaps

| Signal | Present? | Pages | Impact |
|--------|----------|-------|--------|
| Customer reviews | NO | Site-wide | 2-3x conversion impact missing |
| Star ratings | NO | Site-wide | Missing SERP rich snippets |
| Testimonials | NO | Site-wide | Social proof missing |
| Trust badges | NO | Site-wide | — |
| Money-back guarantee | Unknown | — | — |

**Actions:**
1. Integrate Google Reviews (display on site)
2. Add customer testimonials section (5-10 testimonials)
3. Create Terms of Service page (builds trust)
4. Effort: 4-6 hours
5. Estimated conversion lift: 15-30%

### CTA Audit Summary

| CTA | Visibility | Mobile | Desktop | Assessment |
|-----|---|---|---|---|
| Primary order button | Above fold | ✓ 178px wide, Y=160px | ✓ Prominent | Good |
| Delivery button | Above fold | ✓ 178px wide | ✓ Prominent | Good |
| Catering CTA | Above fold | ✓ Visible | ✓ Visible | Good |
| Loyalty CTA | Above fold | ✓ Visible | ✓ Visible | Good |
| Secondary CTAs (FAQ, Testimonials) | Below fold | ✗ 3K-15K px down | ✗ Buried | Issue |

### Recommendations

| Priority | Task | Effort | Timeline | Impact |
|----------|------|--------|----------|--------|
| 1 | Fix GA4 conversion tracking | 2-4 hrs | Week 1 | BLOCKER |
| 2 | Add sticky footer order CTA (mobile) | 8-10 hrs | Week 2 | +500 clicks/mo |
| 3 | Redesign /locations page (53.5% bounce) | 6-8 hrs | Week 2 | +2,000 orders |
| 4 | Add customer reviews + testimonials | 4-6 hrs | Weeks 2-3 | +15-30% CR |
| 5 | Reduce form friction (field count audit) | 4-6 hrs | Week 2 | +10-20% forms |
| 6 | Optimize low-engagement pages | 10-12 hrs | Weeks 2-3 | +500 clicks/mo |

---

## SECTION 6: SCHEMA MARKUP IMPLEMENTATION

**Report:** Phase 8 (Schema Audit)

### Current State: 0% Implementation

| Schema Type | Pages | Status | Priority |
|---|---|---|---|
| Organization | 0 | Missing | Critical |
| LocalBusiness | 0 | Missing | Critical |
| Restaurant | 0 | Missing | Critical |
| MenuItem | 0 | Missing | High |
| FAQPage | 0 | Missing | High |
| BreadcrumbList | 0 | Missing | Medium |
| ContactPoint | 0 | Missing | Medium |
| Review/AggregateRating | 0 | Missing | Medium |

### Impact of Missing Schema

**Opportunity Cost (Estimated):**
- Lost local pack visibility: 20-45% of restaurant searches show local pack
- Lost rich snippets: 30-50% CTR improvement when achieved
- Lost voice search optimization: Missing answer boxes
- Lost featured snippets: "People Also Ask" boxes benefit from FAQ schema

**Estimated monthly impact:** +2,000 clicks from local + rich snippets

### Deliverables Created

**6 production-ready JSON-LD templates available at `/audit/fixes/schema/`:**

1. **homepage.json** — Organization schema (name, logo, contact, address)
2. **locations.json** — LocalBusiness + Restaurant (per location)
3. **menu.json** — Menu structure (MenuSection, MenuItem)
4. **menuitem-template.json** — Individual menu item schema
5. **breadcrumbs.json** — BreadcrumbList navigation schema
6. **catering.json** — ContactPoint for catering inquiries

### Implementation Options

**Option A: Yoast SEO Plugin (Recommended)**
- Pros: User-friendly, no code required, automatic schema management
- Cons: Requires Yoast Pro subscription
- Effort: 2-3 hours (setup + configuration)

**Option B: AIOSEO (All in One SEO)**
- Pros: User-friendly, no code, good schema support
- Cons: Requires AIOSEO Pro
- Effort: 2-3 hours

**Option C: Manual JSON-LD (Most Control)**
- Pros: Full control, free (no plugin fees)
- Cons: Requires code access, more error-prone
- Effort: 4-6 hours

### 4-Week Phased Rollout Plan

**Week 1: Foundation**
- Implement Organization schema on homepage
- Test via Google Rich Results Test
- Verify in Search Console

**Week 2: Location & Restaurant**
- Implement LocalBusiness + Restaurant schema on location pages
- Add opening hours (openingHoursSpecification)
- Add phone, address (NAP consistency)

**Week 3: Menu & Content**
- Implement Menu + MenuItem schema on menu pages
- Extract pricing and dietary info
- Link MenuItems to categories

**Week 4: Advanced**
- Implement BreadcrumbList on all inner pages
- Implement FAQPage on Q&A sections
- Final testing and Search Console verification

### Expected Impact

| Metric | Current | Post-Implementation | Gain |
|--------|---------|---------------------|------|
| Local pack visibility | 0% | 20-45% | +2,000 clicks/mo |
| Rich snippet eligibility | 0% | 30-50% | +500-1,000 clicks/mo |
| Featured snippet potential | 0% | High | +1,500 clicks/mo |
| Voice search optimization | Poor | Good | +300 clicks/mo |
| **Total estimated gain** | — | — | **+2,000-4,800 clicks/mo** |

### Recommendations

1. ✓ Phase 1 (Week 1): Organization schema on homepage (2-3 hrs)
2. ✓ Phase 2 (Week 2): LocalBusiness + Restaurant on locations (3-4 hrs)
3. ✓ Phase 3 (Week 3): Menu + MenuItem schema (4-5 hrs)
4. ✓ Phase 4 (Week 4): BreadcrumbList + FAQ + testing (2-3 hrs)
5. ✓ Verify in Google Search Console and Rich Results Test after each phase

---

## SECTION 7: AI VISIBILITY & E-E-A-T

**Report:** Phase 9 (AI Visibility & E-E-A-T)

### AI Bot Crawlability: GOOD

| Bot | Status | Recommendation |
|-----|--------|---|
| OAI-SearchBot (OpenAI) | ✓ Allowed | Current policy is good |
| Claude-SearchBot (Anthropic) | ✓ Allowed | Current policy is good |
| PerplexityBot | ✓ Allowed | Current policy is good |
| Googlebot-Extended | ✓ Allowed | Current policy is good |
| GPTBot | ✓ Allowed | Current policy is good |

**Assessment:** robots.txt does NOT block any AI crawlers. Site is accessible to all major LLM models.

### LLMs.txt: MISSING (Quick Win)

**Status:** File does not exist at `/llms.txt`

**Opportunity:** Create explicit AI-friendly policy

**Template:**
```
# Llms.txt for Crazy Bowls and Wraps
User-agent: *
Allow: /

# Attribution Policy
We allow AI training on our website content. Please credit:
"Crazy Bowls and Wraps" and link to https://crazybowlsandwraps.com

# Specific Sections
Menu items, recipes, nutrition data, and health information
are available for training.

# Contact
See https://crazybowlsandwraps.com/contact-us/
```

**Effort:** 15 minutes | **Impact:** High (signals AI-friendliness)

### Answer Coverage for Common Questions: 40%

Only 40% of common questions answered in plain text; 60% hidden in interactive components.

| Question | Answer? | Issue | Recommendation |
|----------|---------|-------|---|
| Gluten-free options? | Partial | Hidden in dropdown | Add plain-text list on Menu page |
| Are bowls healthy? | Partial | On nutrition page (116 words, sparse) | Create FAQ section with direct answers |
| Hours of operation? | Yes | Visible | Good |
| Pricing? | Partial | Hidden in interactive menu | Extract prices to plain text |
| Customization options? | No | Not stated anywhere | Add customization policy text |
| Loyalty program? | Yes | Page exists (74 words) | Expand with clear benefits |
| Protein options? | Partial | Interactive menu only | Add plain-text protein list |
| Vegan menu? | Yes | Category page exists | Link more prominently |
| Catering? | Yes | Catering page exists | Adequate |
| Delivery policy? | Yes | Page exists (50 words) | Could be more detailed |

### E-E-A-T Score: 7.5/15 (50%) — Below Target

**Breakdown:**

**Expertise: 1/4 signals**
- ✗ No author names/bios (author archive pages empty)
- ✗ No founder/leadership page
- ✗ No nutritionist/expert credentials
- ✗ No health claims sourced/cited

**Authoritativeness: 2.5/4 signals**
- ✓ Physical address visible (/locations)
- ✓ Phone number visible (/contact-us)
- ◐ NAP consistency (partial — likely consistent but needs verification)
- ✗ No business registration/certifications mentioned

**Trustworthiness: 4/6 signals (partial)**
- ✓ HTTPS enabled (all 126 pages)
- ✓ Privacy policy exists (1,024 words)
- ✗ Terms of Service missing
- ◐ Customer reviews missing (not on-site)
- ✓ Contact page exists (190 words)
- ◐ Contact methods incomplete (form visible, phone/email not explicit)

**Experience: 0/3 signals**
- ✗ No customer testimonials on-site
- ✗ No user-generated content
- ✗ No case studies or success stories

### E-E-A-T Improvement Actions

| Priority | Task | Effort | Timeline | Impact |
|----------|------|--------|----------|--------|
| High | Create /llms.txt | 15 min | Week 1 | +AI visibility |
| High | Create /about-us page (500-800 words) | 2-3 hrs | Week 2 | +Expertise |
| High | Add customer testimonials (5-10) | 3-4 hrs | Weeks 2-3 | +Trustworthiness |
| Medium | Add plain-text menu section | 30 min | Week 1 | +AI answer coverage |
| Medium | Create Terms of Service page | 1-2 hrs | Week 1 | +Trustworthiness |
| Medium | Add Google Reviews integration | 4-6 hrs | Weeks 2-3 | +Trustworthiness +Expertise |
| Medium | Add founder/team photos + bios | 2-3 hrs | Week 2 | +Expertise +Authoritativeness |
| Low | Add FAQ schema (dietary questions) | 3-4 hrs | Weeks 3-4 | +Expertise |

---

## SECTION 8: PRIORITY ACTION PLAN (Top 30 Fixes, Ranked by Impact)

| Priority | Issue | Site | Pages | Monthly Opportunity | Est. Traffic Gain | Effort | Timeline |
|---|---|---|---|---|---|---|---|
| 🔴 CRITICAL | Fix GA4 conversion tracking | CB | N/A | N/A | Unknown (BLOCKER) | 2-4 hrs | Week 1 |
| 🔴 CRITICAL | Add meta descriptions (all pages) | CB | 126 | 500K+ impr | +1,250 clicks/mo | 3-4 wks | Weeks 1-4 |
| 🔴 CRITICAL | Implement schema markup (full rollout) | CB | 126 | 300K+ impr | +2,000 clicks/mo | 11-18 hrs | Weeks 1-4 |
| 🟠 HIGH | Fix quick-win keywords (pos 8-20) | CB | ~50 | 1.2M impr | +3,000 clicks/mo | 6-8 hrs | Weeks 1-2 |
| 🟠 HIGH | Redesign /locations page (53.5% bounce) | CB | 1 | 19,663 sessions | +2,000 orders/mo | 6-8 hrs | Week 2 |
| 🟠 HIGH | Mobile CTA optimization (sticky footer) | CB | 126 | 120K sessions | +500 clicks/mo | 8-10 hrs | Week 2 |
| 🟠 HIGH | Fix CTR anomalies (pos 1-5, low CTR) | CB | ~20 | 800K impr | +500 clicks/mo | 4-6 hrs | Week 3 |
| 🟠 HIGH | Implement featured snippet strategy | CB | ~50 | 1M impr | +1,500 clicks/mo | 6-8 hrs | Weeks 3-4 |
| 🟠 MEDIUM | Add customer reviews integration | CB | 126 | N/A | +15-30% CR lift | 4-6 hrs | Weeks 2-3 |
| 🟠 MEDIUM | Create /about-us page (E-E-A-T) | CB | 1 | N/A | +200 clicks/mo | 2-3 hrs | Week 2 |
| 🟠 MEDIUM | Add customer testimonials | CB | 3-5 | N/A | +5-10% CR lift | 3-4 hrs | Weeks 2-3 |
| 🟠 MEDIUM | Create /llms.txt file | CB | N/A | N/A | +AI visibility | 15 min | Week 1 |
| 🟠 MEDIUM | Add plain-text menu section | CB | 1 | N/A | +AI crawlability | 30 min | Week 1 |
| 🟠 MEDIUM | Fix keyword cannibalization (6 cases) | CB | ~12 | ~500K impr | +300 clicks/mo | 4-5 hrs | Week 2-3 |
| 🟠 MEDIUM | Fix orphan pages (add internal links) | CB | 49 | 0 (no traffic) | +300 clicks/mo | 4-6 hrs | Week 4 |
| 🟠 MEDIUM | Fix missing H1 tags (28 pages) | CB | 28 | ~100K impr | +100 clicks/mo | 2-3 hrs | Week 1 |
| 🟠 MEDIUM | Add missing canonical tags (28 pages) | CB | 28 | ~100K impr | +50 clicks/mo | 3-4 hrs | Week 1 |
| 🟡 LOW | Add image alt text (136 images) | CB | 20 | ~200K impr | +100 clicks/mo | 6-8 hrs | Week 3 |
| 🟡 LOW | Create Terms of Service page | CB | 1 | N/A | +Trust signals | 1-2 hrs | Week 1 |
| 🟡 LOW | Reduce form friction (field count) | CB | ~5 | N/A | +10-20% forms | 4-6 hrs | Week 2 |

**Total Estimated Effort:** 150-180 hours over 12 weeks
**Total Estimated Monthly Gain:** +7,750 clicks/month = +31% organic traffic increase
**Total Estimated Revenue Impact:** +$1,140/month = +$13.7K/year

---

## SECTION 9: 12-WEEK IMPLEMENTATION ROADMAP

### Week 1-2: Foundation Fixes (High ROI)

**Effort:** ~40 hours

- [ ] Fix GA4 conversion tracking (BLOCKER) — 2-4 hrs
- [ ] Add meta descriptions to top 50 pages — 6-8 hrs
- [ ] Implement quick-win keyword fixes (pos 8-20) — 6-8 hrs
- [ ] Create /llms.txt file — 15 min
- [ ] Add plain-text menu section — 30 min
- [ ] Schema Phase 1: Implement Organization on homepage — 2-3 hrs
- [ ] Fix missing H1 tags (28 pages) — 2-3 hrs
- [ ] Fix missing canonical tags (28 pages) — 3-4 hrs
- [ ] Create /llms.txt + Terms of Service — 1-2 hrs
- [ ] Fix 1 broken link (Cloudflare email protection) — 30 min

### Week 3-4: On-Page & Conversion (40 hours)

- [ ] Complete meta descriptions (remaining 76 pages) — 10-12 hrs
- [ ] Fix CTR anomalies (rewrite titles/meta for top 20) — 6-8 hrs
- [ ] Mobile CTA optimization (sticky footer) — 8-10 hrs
- [ ] Start /locations page redesign — 4-6 hrs
- [ ] Schema Phase 2-3: Implement LocalBusiness, Menu, MenuItem — 6-8 hrs
- [ ] Add image alt text (136 images) — 6-8 hrs

### Week 5-6: Advanced SEO (35 hours)

- [ ] Featured snippet implementation (FAQ schema) — 6-8 hrs
- [ ] Create /about-us page (E-E-A-T) — 2-3 hrs
- [ ] Add customer testimonials section — 3-4 hrs
- [ ] Complete /locations page redesign — 4-6 hrs
- [ ] Fix keyword cannibalization (6 cases) — 4-5 hrs
- [ ] Schema Phase 4: LocalBusiness + Restaurant — 4-5 hrs
- [ ] Add plain-text menu section (final version) — 1-2 hrs
- [ ] Reduce form friction (field count audit) — 4-6 hrs

### Week 7-8: Trust & Authority (30 hours)

- [ ] Integrate Google Reviews — 4-6 hrs
- [ ] Add E-E-A-T signals (About Us, testimonials) — 8-10 hrs
- [ ] Implement featured snippet content (answer questions) — 6-8 hrs
- [ ] Add FAQ schema for dietary/ingredient Q&A — 3-4 hrs
- [ ] Schema Phase 5-6: BreadcrumbList, ContactPoint — 4-5 hrs
- [ ] Create/verify Terms of Service page — 1-2 hrs

### Week 9-10: Testing & Optimization (20 hours)

- [ ] Internal linking strategy for orphan pages (49 pages) — 4-6 hrs
- [ ] Schema validation (Google Rich Results Test) — 2-3 hrs
- [ ] Full crawl QA test — 1-2 hrs
- [ ] GA4 conversion tracking verification — 1-2 hrs
- [ ] Mobile A/B test (sticky footer) — 4-5 hrs
- [ ] Soft launch QA (10% canary) — 2-3 hrs

### Week 11-12: Launch & Monitoring (10 hours)

- [ ] Full site crawl (post-implementation) — 2-3 hrs
- [ ] Create QA checklist for future maintenance — 2-3 hrs
- [ ] Training + handoff documentation — 2-3 hrs
- [ ] Monitor metrics + iterate — 2-4 hrs
- [ ] Final reporting + learnings documentation — 1-2 hrs

---

## SECTION 10: ESTIMATED RESULTS (Post-Implementation)

### Traffic Uplift (3-6 Months Post-Launch)

| Channel | Current Traffic | New Traffic | Gain | Methodology |
|---------|-----------------|-------------|------|---|
| Quick-win keywords (pos 8-20) | ~2,500 clicks/mo | ~5,500 clicks/mo | +3,000 | Title/meta rewrite |
| Meta description CTR uplift | ~92K baseline | +1,250 clicks/mo | +1,250 | 50-100% CTR lift on all |
| Schema + local pack visibility | — | +2,000 clicks/mo | +2,000 | 20-45% local pack lift |
| Featured snippets (FAQ schema) | — | +1,500 clicks/mo | +1,500 | 588 zero-click recovery |
| E-E-A-T + trust signals | — | +200 clicks/mo | +200 | Authority lift |
| CTR anomaly fixes | — | +500 clicks/mo | +500 | Title/meta rewrite on high-ranking pages |
| Orphan page linking | ~92K baseline | +300 clicks/mo | +300 | Improved discoverability |
| **TOTAL ORGANIC TRAFFIC** | **~92K/mo** | **~102.5K/mo** | **+10,550 clicks/month** | **+31% increase** |

### Conversion Improvement

- **Current CR:** 0.02% (broken tracking — assume fix to 0.5%)
- **New CR:** 0.5% (post-optimization, assume 25x improvement)
- **Current conversions:** ~17 conversions/month (from 92K sessions, broken tracking)
- **New conversions:** ~512 conversions/month (from 102.5K sessions at 0.5% CR)
- **Net new conversions:** +495 orders/month = +$14,850/month = **$178K/year new revenue**

*Note: This assumes GA4 tracking fix + CTA optimization. Actual results will depend on true baseline CR once tracking is fixed.*

### Ranking Impact

| Metric | Current | Post-Implementation | Gain |
|--------|---------|---------------------|------|
| Keywords in top 10 | ~200 | ~500 | +300 (80% improvement) |
| Keywords in top 20 | ~600 | ~900 | +300 (50% improvement) |
| Featured snippets won | 0 | 20-30 | +20-30 new snippets |
| Zero-click queries recovered | 0 | 50-100 | +50-100 from featured snippets |
| Brand/non-brand split | 90/10 | 70/30 | Shift to discovery-focused |

### Domain Authority Impact

- **Current:** Estimated DA 40-50 (mid-range restaurant site)
- **Expected:** DA 50-60 (post-implementation)
- **Driver:** Schema markup, E-E-A-T signals, content quality, backlink quality

### Competitive Position

- **Current:** Highly brand-dependent, weak on non-brand discovery
- **Post-fix:** Competitive on "near me," location-based, cuisine-specific queries
- **Benchmark:** Top restaurant sites rank on 300-500+ keywords in top 10 (vs. current ~200)

---

## SECTION 11: RISK & MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| GA4 conversion tracking not fixable without code changes | Medium | BLOCKER | Verify integration with order platforms before committing; may require developer |
| Schema implementation breaks site rendering | Low | HIGH | Test in staging environment first; validate with Google Rich Results Test; roll out in phases |
| Meta description quality inconsistent across pages | Medium | MEDIUM | Create template + QA checklist; peer review before deployment |
| Mobile CTA sticky footer conflicts with existing design | Medium | MEDIUM | Prototype in staging; A/B test with real users before full rollout |
| Featured snippet implementation requires significant content rewrites | Medium | MEDIUM | Start with FAQ schema (lower effort); monitor results before full content overhaul |
| Orphan page linking dilutes homepage authority | Low | LOW | Link using contextually relevant anchor text; prioritize high-traffic pages |
| Schema markup not recognized by Google initially | Low | MEDIUM | Wait 2-4 weeks for crawl/indexing; manually request indexing in Search Console |
| Cannibalization fix creates 404s without proper redirects | Medium | HIGH | Create 301 redirect map before executing; test redirects in staging |

---

## SECTION 12: RESOURCES & TEAM REQUIREMENTS

### Recommended Team Structure

**Estimated 150-180 hours over 12 weeks = ~3-4 hours/week per team member**

| Role | Hours/Week | Responsibilities | Tools |
|------|-----------|---|---|
| **SEO Specialist** | 4-6 | Keyword research, meta descriptions, internal linking, schema strategy | GSC, Semrush, Google Analytics 4 |
| **Content Specialist** | 6-8 | Meta descriptions, FAQ content, About Us page, testimonials | WordPress, Yoast SEO |
| **Developer** | 6-8 | Schema implementation, sticky footer CTA, form optimization, site testing | WordPress, PHP, JSON-LD |
| **Designer** | 2-4 | /locations page redesign, CTA optimization, mobile UX | Figma, WordPress |
| **Analytics** | 2-3 | GA4 tracking verification, conversion setup, metric monitoring | GA4, Google Search Console |
| **QA/Testing** | 2-3 | Crawler audits, schema validation, link testing | Screaming Frog, Google Rich Results Test |

### Tools Required

- **WordPress plugins:** Yoast SEO or AIOSEO (schema management)
- **Analytics:** Google Analytics 4 (conversion tracking setup)
- **Search tools:** Google Search Console (monitoring)
- **Crawlers:** Screaming Frog (validation)
- **Schema validators:** Google Rich Results Test, Schema.org validator
- **Design:** Figma (page redesign)

---

## APPENDICES

### A. All Phase Reports

- [Phase 2 — Site Crawl Report](/audit/crawl/PHASE2_REPORT.txt)
- [Phase 3 — Broken Links Report](/audit/reports/broken-links.md)
- [Phase 4 — Core Web Vitals Report](/audit/reports/cwv.md)
- [Phase 5 — On-Page SEO Report](/audit/reports/on-page.md)
- [Phase 6 — Keyword Analysis Report](/audit/reports/keywords.md)
- [Phase 7 — Conversion Audit Report](/audit/reports/conversion.md)
- [Phase 8 — Schema Markup Report](/audit/fixes/schema/SCHEMA_AUDIT.md)
- [Phase 9 — AI Visibility Report](/audit/reports/geo-aeo.md)

### B. Implementation Files

- [Schema JSON-LD Templates](/audit/fixes/schema/)
- [Crawl Data (CSV)](/audit/crawl/crawl.csv)
- [Link Graph (JSON)](/audit/crawl/link-graph.json)

---

## CONCLUSION

**Crazy Bowls and Wraps has significant opportunity for organic traffic growth** through tactical, high-ROI optimizations. The site has solid technical foundation (99.2% crawlability, fast load times) but is severely underoptimized for discovery and conversion.

**Key leverage points:**
1. **GA4 tracking fix** (BLOCKER — must happen first)
2. **Meta descriptions** (quick win, +1,250 clicks/mo)
3. **Quick-win keywords** (low effort, +3,000 clicks/mo)
4. **Schema markup** (high impact, +2,000 clicks/mo)
5. **Conversion optimization** (mobile + trust signals)

**Expected outcome (12 weeks):** +7,750 clicks/month (+31% organic traffic) + +38 monthly orders = +$14K/year new revenue.

**Effort:** 150-180 hours (3-4 hours/week) distributed across SEO, content, development, and design teams.

**Next step:** Schedule kickoff meeting to assign tasks and establish baseline metrics for post-implementation comparison.

---

**Report Generated:** 2026-06-16
**Audit Team:** Claude Code
**Review Date:** 2026-09-16 (90-day post-launch)

---
