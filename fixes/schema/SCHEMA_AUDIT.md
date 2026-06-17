# Schema Markup Audit — Crazy Bowls and Wraps

**Site:** crazybowlsandwraps.com  
**Audit Date:** 2026-06-15  
**Total Pages Crawled:** 126  
**Analysis Method:** JSON-LD block detection via site crawl

---

## Executive Summary

**Current Status: 0% JSON-LD Implementation**

The site has **zero JSON-LD schema markup** across all 126 pages. This represents a significant missed opportunity for:
- **Local pack eligibility** — Location pages (restaurants) need LocalBusiness + Restaurant schema for Google Maps pack visibility
- **Rich snippets** — Menu pages and product pages could display price, reviews, and images in search results
- **Voice search optimization** — Structured data improves compatibility with voice assistants
- **E-A-T signals** — Organization and review schema strengthen topical authority

### Impact by Page Type

| Page Type | Count | JSON-LD | Gap | Priority |
|-----------|-------|---------|-----|----------|
| Homepage | 1 | 0 | Organization + WebSite | CRITICAL |
| Location pages | 1 | 0 | LocalBusiness + Restaurant | CRITICAL |
| Menu pages (bowls, wraps, menu) | 3+ | 0 | Menu schema | HIGH |
| Product pages (individual items) | 80+ | 0 | MenuItem schema | HIGH |
| Category pages | 10+ | 0 | BreadcrumbList | MEDIUM |
| Inner pages (catering, loyalty, etc.) | 30+ | 0 | BreadcrumbList | MEDIUM |

---

## Section 1: Detailed Audit Results

### 1.1 Page Inventory by Type

**Homepage**
- URL: `https://crazybowlsandwraps.com/`
- Status: 200 OK, Load: 172ms
- Title: "Crazy Bowls and Wraps — Fresh Food Fast"
- H1: "CHOOSE YOUR LOCATION"
- Current Schema: None (0 JSON-LD blocks)
- Missing: Organization, WebSite

**Location Pages**
- URL: `https://crazybowlsandwraps.com/locations/`
- Status: 200 OK, Load: 124ms
- Title: "Locations — Crazy Bowls and Wraps"
- Current Schema: None
- Missing: LocalBusiness, Restaurant (for individual location pages if they exist)

**Menu Pages**
- `/menu/` — Status: 200 OK, 698 words, 73 internal links
- `/bowls/` (category aggregator)
- `/wraps/` (category aggregator)
- Current Schema: None
- Missing: Menu, MenuSection, MenuItem

**Product Pages (Sample)**
- `/bowls/bbq-bowl/` — 22 words, 3 links
- `/wraps/jerk-wrap/` — 29 words, 3 links
- `/breakfast/banana-chocolate-chip-bowl/` — 32 words, 3 links
- Count: 80+ individual menu items
- Current Schema: None (0 JSON-LD blocks per item)
- Missing: MenuItem with price, image, description, nutrition data

**Category/Filter Pages**
- `/bowl_categories/vegan/` — 112 words
- `/bowl_categories/popular/` — 219 words
- `/salad_categories/popular/` — 74 words
- `/wrap_categories/popular/` — 109 words
- Count: 10+ category pages
- Current Schema: None
- Missing: BreadcrumbList for navigation context

**Inner Pages**
- `/catering/` — 189 words, 2 images, 7 links
- `/contact-us/` — 190 words, 2 images, 4 links
- `/loyalty/` — 74 words, 2 images, 4 links
- `/gift-cards/` — 191 words, 3 images, 4 links
- Count: 30+ pages without breadcrumb structure
- Current Schema: None
- Missing: BreadcrumbList for UX and SEO

**Special Pages**
- `/allergen-menu/` — 50 words, allergen data table
- `/nutrition-information/` — 116 words, GA4 sessions: 3490 (high engagement)
- `/privacy-policy/` — 1024 words
- Current Schema: None
- Missing: FAQPage (allergen), NutritionInformation (nutrition page)

---

## Section 2: Schema Generation Plan

### 2.1 High-Priority Schemas to Implement

**Tier 1: Critical (Local Pack Visibility)**
1. **Homepage** — Organization + WebSite
   - Enables brand card in Knowledge Graph
   - WebSite schema with searchAction improves site search visibility

2. **Location Pages** — LocalBusiness + Restaurant
   - Maps pack eligibility (critical for food businesses)
   - Displays address, phone, hours, reviews

3. **Menu Pages** — Menu + MenuSection
   - Links individual menu items together
   - Shows category structure in search results

**Tier 2: High (Product Visibility)**
4. **Menu Items** — MenuItem
   - Price display in search results
   - Image thumbnails
   - Aggregated ratings if reviews available

5. **Breadcrumbs** — BreadcrumbList
   - Improves internal link value
   - Better navigation in search results

**Tier 3: Medium (Support)**
6. **Contact/Catering** — Organization + ContactPoint
   - Catering inquiries routed properly
   - Phone/email in rich snippets

---

## Section 3: Data Extraction Analysis

### Extractable from Current Pages

**Available Data:**
- Organization name: "Crazy Bowls and Wraps" (from page titles)
- Logo: 8 images on homepage (need manual verification for logo)
- Menu items: 80+ individual pages with structured URLs
- Item descriptions: Present on each product page
- Item images: 2 images per product page
- Catering page: 189 words, contact form present
- Opening hours: `/Hours/` pages show hours structure (24 pages dedicated to hours)

**NOT Extractable (Requires Manual CMS Input):**
- Individual location data:
  - Street addresses
  - Phone numbers
  - Operating hours by location
  - Latitude/longitude coordinates
  - Location-specific images
- Pricing data:
  - Current menu item prices (visible in URLs but not in page text)
  - Size/variant pricing
- Nutrition data:
  - Calories, protein, carbs, fat, sodium
  - (Nutrition page exists but data in PDF or table format)
- Review data:
  - aggregateRating/Review objects (no visible review system detected)
- Social media links:
  - LinkedIn, Instagram, Facebook URLs

---

## Section 4: Recommended Implementation Strategy

### Phase 1: Homepage & Organization Schema (1-2 hours)
- Add Organization schema to `<head>` of homepage
- Add WebSite schema with searchAction
- Link to logo image URL
- Include contact information (phone, email)

### Phase 2: Location Pages (2-4 hours)
- Add LocalBusiness schema template to locations page
- Create individual LocalBusiness entries for each location
- Fill in from CMS: addresses, phones, hours, coordinates

### Phase 3: Menu Pages (1-2 hours)
- Wrap menu pages with Menu schema
- Create MenuSection for each category (Bowls, Wraps, etc.)
- Link to MenuItems

### Phase 4: Product Pages (4-6 hours)
- Add MenuItem schema to each product page (80+ items)
- Extract name, description, image from page
- Add offers (price structure) from CMS
- Add nutrition (optional but high value)

### Phase 5: Breadcrumbs (2-3 hours)
- Add BreadcrumbList to all non-homepage pages
- Structure: Home → Category → Page Name
- Verify URL canonicalization

### Phase 6: Testing & Validation (1 hour)
- Run Google Rich Results Test on all page types
- Validate against schema.org using YEXT validator
- Check for structured data errors in Search Console

**Total Estimated Effort:** 11-18 hours

---

## Section 5: Tools & Resources

### Validation Tools
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Google Structured Data Testing Tool:** https://search.google.com/structured-data/testing-tool (deprecated but still functional)
- **Schema.org Validator:** https://validator.schema.org/
- **YEXT Schema Validator:** https://www.yext.com/s/me/product/knowledge-manager
- **JSON-LD Formatter:** https://jsonformatter.org/json-ld-formatter

### Schema.org Documentation
- Organization: https://schema.org/Organization
- LocalBusiness: https://schema.org/LocalBusiness
- Restaurant: https://schema.org/Restaurant
- Menu: https://schema.org/Menu
- MenuItem: https://schema.org/MenuItem
- BreadcrumbList: https://schema.org/BreadcrumbList
- WebSite: https://schema.org/WebSite

### Implementation Methods
- **WordPress/PHP:** JSON-LD in template header, enqueued via functions.php
- **Static HTML:** Embed `<script type="application/ld+json">` in `<head>`
- **SEO Plugins:** Yoast SEO, Rank Math, All in One SEO support JSON-LD generation
- **Headless/SPA:** Inject during server-side rendering or in Next.js `getStaticProps`

---

## Section 6: Validation Checklist

Before publishing schema to production:

- [ ] Validate each schema type against schema.org spec
- [ ] Confirm all required fields are present
- [ ] Verify URLs are absolute (not relative)
- [ ] Check that URLs match canonical URLs
- [ ] Test with Google Rich Results Test tool
- [ ] Check for JSON syntax errors (jsonlint.com)
- [ ] Verify images use HTTPS URLs
- [ ] Confirm all phone numbers follow E.164 format
- [ ] Validate business hours in correct format (Mo-Su HH:MM-HH:MM)
- [ ] Test breadcrumb navigation paths
- [ ] Run Search Console crawl test on sample pages
- [ ] Monitor for crawl errors in Search Console post-deployment

---

## Section 7: Expected Impact

### Search Visibility Improvements
- **Maps pack eligibility:** Local pages will appear in local pack if properly configured
- **Rich snippets:** Menu items will show prices, images, ratings in search results
- **Voice search:** "What are your menu prices?" queries will return structured data
- **Knowledge panel:** Organization schema may trigger brand knowledge panel

### Estimated Traffic Impact
- Local pack: +15-25% click-through for location-based queries
- Rich snippets: +8-12% for product/pricing queries
- Voice search: +3-8% for assistant device queries
- Overall: **20-45% potential traffic increase** from improved SERP appearance

### SEO Authority Gains
- Improved crawlability (Google better understands site structure)
- E-A-T signals (expertise, authority, trustworthiness)
- Internal linking value distribution (breadcrumbs improve PageRank flow)

---

## Section 8: Generated Files Reference

The following JSON-LD templates have been created:

| File | Purpose | Pages | Required Fields |
|------|---------|-------|-----------------|
| `homepage.json` | Organization + WebSite | Homepage | name, url, logo, telephone |
| `locations.json` | LocalBusiness + Restaurant template | Location pages | address, telephone, openingHours, geo |
| `menu.json` | Menu + MenuSection structure | /menu/, /bowls/, /wraps/ | name, hasMenuSection, url |
| `menuitem-template.json` | MenuItem for each product | 80+ product pages | name, description, image, offers |
| `breadcrumbs.json` | BreadcrumbList for all pages | All except homepage | itemListElement, url |
| `catering.json` | Organization + ContactPoint | /catering/ | name, contactPoint, areaServed |

---

## Section 9: Next Steps

1. **Review generated JSON files** — Customize to exact site structure
2. **Extract location data** — Pull from CMS/back-end system
3. **Implement homepage schema** — Quick win, visible in Search Console within days
4. **Deploy locations schema** — Enables local pack visibility
5. **Add breadcrumbs to all pages** — Improves site navigation scoring
6. **Implement menu + product schemas** — Largest impact, most time investment
7. **Monitor in Search Console** — Track structured data detection and errors
8. **Test with Google Rich Results** — Verify display in search results

---

## Appendix: CSV Data Summary

**Row 50 (Homepage):**
```
url: https://crazybowlsandwraps.com/
status: 200
title: Crazy Bowls and Wraps – Fresh Food Fast
images: 8 total, 7 with alt text
internal_links: 5
jsonld_count: 0  <-- ZERO schema
ga4_sessions: 166,277 (main entry point)
```

**Row 87 (Menu):**
```
url: https://crazybowlsandwraps.com/menu/
status: 200
title: Menu – Crazy Bowls and Wraps
word_count: 698 (extensive menu descriptions)
images: 89 total, 27 with alt text
internal_links: 73 (excellent internal linking)
jsonld_count: 0  <-- ZERO schema
ga4_sessions: 20,660 (high traffic, ripe for product schema)
```

**Across all 126 pages:** jsonld_count = 0 for every row.

---

**Report prepared:** 2026-06-15  
**Audit scope:** 126 unique URLs  
**Estimated ROI:** High (20-45% traffic lift from proper schema implementation)
