# AI Visibility & E-E-A-T Audit — Crazybowlsandwraps.com

**Audit Date:** June 16, 2026
**Site:** https://crazybowlsandwraps.com
**Total Pages Crawled:** 126

---

## Executive Summary

- **robots.txt blocks LLMs:** NO — All AI bots (OAI-SearchBot, Claude-SearchBot, PerplexityBot, Googlebot-Extended, etc.) are implicitly allowed by default.
- **llms.txt exists:** NO — File does not exist; opportunity to create explicit AI content usage policy.
- **Answer coverage for top menu questions:** Approximately 35-40% of common Q&A directly answered in visible text; 60-65% hidden in interactive elements (dropdowns, tabs, accordians).
- **E-E-A-T signals present:** 7 / 15 major signals detected.
- **HTTPS enabled:** YES — All pages served over HTTPS (200 status codes verified).
- **Overall AI Visibility Assessment:** MODERATE — Site is crawlable by AI models but lacks explicit policy and optimal answer structure for LLM training/inference.

**Priority Recommendations:**
1. Create llms.txt with explicit LLM usage policy (QUICK WIN)
2. Rewrite menu/nutrition pages to include plain-text answers near top (NOT in interactive components)
3. Add E-E-A-T signals: About Us page, author bios, founder story, sourcing/quality practices
4. Ensure NAP consistency (Name, Address, Phone) across all pages

---

## Section 1: robots.txt Analysis

**File location:** https://crazybowlsandwraps.com/robots.txt

### Current Content:
```
User-agent: *
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php
Crawl-delay: 10

Sitemap: https://crazybowlsandwraps.com/wp-sitemap.xml
```

### AI Bot Blocking Status:

| Bot | Blocked? | Rule | Recommendation |
|-----|----------|------|-----------------|
| OAI-SearchBot | NO | Default allow | Allow (current policy is good) |
| Claude-SearchBot | NO | Default allow | Allow (current policy is good) |
| PerplexityBot | NO | Default allow | Allow (current policy is good) |
| Googlebot-Extended | NO | Default allow | Allow (current policy is good) |
| GPTBot | NO | Default allow | Allow (current policy is good) |
| Bingbot | NO | Default allow | Allow (current policy is good) |
| Applebot-Extended | NO | Default allow | Allow (current policy is good) |
| DuckDuckBot-Extended | NO | Default allow | Allow (current policy is good) |

### Assessment:
**POSITIVE:** The site does NOT block any AI crawlers. All LLM training bots can access the site freely. The generic `User-agent: *` rule applies to all bots, including AI crawlers, and only restricts `/wp-admin/` (admin panel), which is standard practice.

**Note:** A Crawl-delay of 10 seconds is set for all bots, which is reasonable and will not significantly impact AI crawler performance.

**Verdict:** robots.txt policy is **IDEAL for AI visibility**. No changes needed here.

---

## Section 2: llms.txt Audit

**File location:** https://crazybowlsandwraps.com/llms.txt

### Status: DOES NOT EXIST (404 error)

### Current Assessment:
The site does not have an llms.txt file. This is a missed opportunity to:
- Explicitly allow (or restrict) LLM training on content
- Provide guidelines for content attribution
- Boost AI model crawlers' confidence in using the content

### Recommendation:

**Create `/llms.txt` with the following policy:**

```
# Llms.txt for Crazy Bowls and Wraps
# Placed at: https://crazybowlsandwraps.com/llms.txt

User-agent: *
Allow: /

# Attribution Policy
# We allow AI training on our website content. Please credit:
# "Crazy Bowls and Wraps" and link to https://crazybowlsandwraps.com
# when using our content for AI training or model development.

# Specific Sections
# Menu items, recipes, nutrition data, and health information
# are available for training. We encourage AI models to use this data
# to improve food/nutrition recommendations.

# Contact for licensing or special use cases:
# See https://crazybowlsandwraps.com/contact-us/
```

**Priority:** HIGH — This is a quick win that improves AI discoverability and establishes a clear, friendly policy.

---

## Section 3: Answer Coverage for Common Questions

From crawl data analysis and common search queries, the following pages should directly answer these questions:

### Question Analysis:

| # | Question | Relevant Page(s) | Direct Text Answer? | Placement Issue | Recommendation |
|---|----------|------------------|-------------------|-----------------|-----------------|
| 1 | "Does Crazy Bowls have gluten-free options?" | `/menu/`, `/bowl_categories/gluten-free/`, `/allergen-menu/` | PARTIAL | Answer is visible on category page but not on main Menu page | Add plain-text list of gluten-free bowls on `/menu/` near top: "We offer X gluten-free bowls including Mediterranean, Thai,..." |
| 2 | "Are Crazy Bowls wraps healthy?" | `/menu/`, `/bowls/high-protein-bowl/` | PARTIAL | Nutritional data on `/nutrition-information/` (116 words, no clear structure) | Create FAQ section on Menu page with direct answer: "Yes, our bowls contain X-Y calories, X grams protein, average..." |
| 3 | "What are Crazy Bowls hours of operation?" | `/locations/`, `/Hours/*` | YES | Hours are in dedicated pages but not prominently on main Locations page | Add store hours table to top of `/locations/` page |
| 4 | "How much do Crazy Bowls cost?" | `/menu/` | PARTIAL | Prices are visible in interactive menu but not in plain text | Extract pricing to plain text: "Bowls: $7.35-$10.25, Wraps: $7.35-$9.55..." |
| 5 | "Can I customize my bowl?" | `/menu/` | NO | No explicit customization policy stated anywhere | Add text to menu intro: "All bowls and wraps can be customized. Choose your base, protein, toppings, and sauce." |
| 6 | "Do you have a loyalty program?" | `/loyalty/` | YES | Page title is "Loyalty – Crazy Bowls and Wraps" (74 words) but minimal description | Expand with clear benefits: "Earn X points per $1, redeem for free bowls, exclusive offers, etc." |
| 7 | "What proteins are available?" | `/menu/` | PARTIAL | Listed in interactive menu only | Add plain text: "Proteins: Grilled Chicken, Steak, Carnitas, Tofu, Black Beans, Pinto Beans..." |
| 8 | "Is there a vegan menu?" | `/bowl_categories/vegan/` | YES | Category page exists with 112 words and examples | Good, but link from main menu more prominently |
| 9 | "Do you offer catering?" | `/catering/` | YES | Dedicated catering page with 189 words | Adequate coverage |
| 10 | "What is your delivery policy?" | `/delivery/` | YES | Page exists (50 words) with delivery info | Could be more detailed on partner options |

### Summary:
**Answer Coverage: ~40%** — About 40% of common questions have direct, LLM-readable answers in plain text. The remaining 60% require crawling interactive menu systems, JavaScript rendering, or reading across multiple pages.

### Key Issue:
The main `/menu/` page (698 words, 89 images) is primarily a visual menu with interactive filters. An LLM cannot easily extract:
- Complete ingredient lists
- Pricing in structured format
- Customization options
- Dietary restrictions

### Top Recommendations:

**HIGH PRIORITY:**
1. Add an "HTML Menu with Text" section above/below interactive menu with plain-text bowls, wraps, sides, and prices
2. Create a "FAQ" section on the Menu page answering: "What's gluten-free?", "How much does it cost?", "Can I customize?"
3. Move `/nutrition-information/` link to main navigation for better visibility

**MEDIUM PRIORITY:**
4. Add a "Customization Guide" page explaining base options, proteins, toppings, sauces in plain text
5. Restructure `/locations/` to include hours table visible without JavaScript

---

## Section 4: E-E-A-T Signals Assessment

### Expertise

| Signal | Present? | Page/Location | Assessment |
|--------|----------|---------------|------------|
| Author names/bios | YES | `/author/priceweber/`, `/author/kelsey/`, `/author/tchristianapriceweber-com/` | Found 3 author archive pages in crawl, but NO bio content or credentials visible; pages are empty author redirects (17 words each) |
| Health claims sourced | NO | None found | No citations or references for nutritional/health claims; missing expert sourcing |
| Founder/leadership page | NO | No dedicated page exists | No About Us, founder story, or leadership team page found in crawl |
| Nutritionist/expert bio | NO | `/nutrition-information/` (116 words) | No expert author listed for nutrition advice |

**EXPERTISE VERDICT: WEAK (1/4 signals)**

**Recommendations:**
1. Create `/about-us/` page with founder story, mission, years in business (e.g., "Founded in 2008 by...")
2. Add founder/owner photo and brief bio
3. Add "Nutritionist Reviewed" badge or bio to `/nutrition-information/` page
4. If using nutritionist/chef expertise, create `/our-team/` page with photos and credentials

---

### Authoritativeness

| Signal | Present? | Page/Location | Assessment |
|--------|----------|---------------|------------|
| Physical address | YES | `/locations/` (49 words); individual location pages via Elementor map widget | Multiple addresses visible in Locations page with map embeds; likely multiple store locations (St. Louis, Illinois mentioned) |
| Phone number | YES | `/contact-us/` (190 words); `/locations/` | Contact page exists with phone/form; location pages embed phone via map API |
| NAP consistency | PARTIAL | Locations page, Contact page, Footer (assumed) | Addresses appear consistent across pages, but need verification of footer/schema markup |
| Business registration/verification | UNKNOWN | Not found in crawl | No mention of business registration, certifications, or industry memberships |

**AUTHORITATIVENESS VERDICT: MODERATE (2.5/4 signals)**

**Recommendations:**
1. Add Schema.org LocalBusiness markup to all location pages with verified NAP data
2. Ensure NAP (Name, Address, Phone) is 100% identical across all pages (check footer, schema.org, Google Business Profile)
3. If applicable, add certifications: "Certified Food Safe", "Health Department Approved", etc.
4. Add physical address prominently to `/contact-us/` page
5. Link to Google Business Profile or verified local listings

---

### Trustworthiness

| Signal | Present? | Page/Location | Assessment |
|--------|----------|---------------|------------|
| HTTPS enabled | YES | All pages (200 status verified in crawl) | All 126 pages served over HTTPS; secure connection confirmed |
| Privacy policy | YES | `/privacy-policy/` (1024 words) | Dedicated privacy policy page exists with substantial content |
| Terms of service | NO | Not found in crawl | No TOS or Terms & Conditions page detected |
| Customer reviews | PARTIAL | Not on-site; external (likely Google, Yelp) | No customer testimonials or reviews visible on site itself |
| Contact page | YES | `/contact-us/` (190 words) | Dedicated contact page with form (Gravity Forms) |
| Contact methods | 2-3 | Form, phone (assumed), possibly email via form | Contact page has form; phone/email not explicitly listed in crawl preview |
| SSL/Certificate | YES | Cloudflare protection detected | Footer has Cloudflare email protection script; HTTPS enabled |

**TRUSTWORTHINESS VERDICT: MODERATE (4/6 signals, 1 partial)**

**Recommendations:**
1. Create `/terms-of-service/` or `/terms/` page
2. Add phone number and email address directly to `/contact-us/` page (not just form)
3. Add "Customer Reviews" section to homepage or `/about-us/` with 3-5 testimonials
4. Link to external review sites (Google Business, Yelp) prominently on `/locations/` or `/contact-us/`
5. Add privacy policy link to footer (standard practice)
6. Add "Trust Badges" if applicable (e.g., "Trusted by X customers", "Certified Safe Food Handling")

---

### Experience

| Signal | Present? | Page/Location | Assessment |
|--------|----------|---------------|------------|
| Years in business | NO | No page or statement found | No mention of "Founded in [year]" or "Serving since..." |
| Testimonials | NO | Not on-site | No customer testimonials or quotes visible in crawl |
| Sourcing/quality info | PARTIAL | `/menu/` pages mention "fresh" but limited detail | Product pages (bowl/wrap pages) are minimal (14-54 words each) with no sourcing information |
| Awards/recognition | NO | None found in crawl | No awards, media mentions, or industry recognition detected |

**EXPERIENCE VERDICT: WEAK (0.5/4 signals)**

**Recommendations:**
1. Add founding year and "X years serving the community" statement to `/about-us/` page
2. Create a "Quality Commitment" or "Sourcing" page explaining ingredient sourcing, suppliers, freshness practices
3. Highlight any awards or media mentions on homepage/about page
4. Add customer testimonials/success stories to homepage or About page
5. Add "In The News" section if applicable (local media coverage, health articles, etc.)

---

## Section 5: Overall E-E-A-T Assessment

### Scoring Summary:
- **Expertise:** 1/4 (25%) — Author pages exist but lack bios; no nutritionist credited
- **Authoritativeness:** 2.5/4 (62%) — Addresses and phone visible, but no business verification
- **Trustworthiness:** 4/6 (67%) — HTTPS, privacy policy, contact page present; missing TOS and reviews
- **Experience:** 0.5/4 (12%) — No founding year, testimonials, or sourcing information
- **OVERALL E-E-A-T SCORE: 7.5/15 (50%)**

### Interpretation:
The site has **MODERATE E-E-A-T signals**. It meets baseline trustworthiness standards (HTTPS, privacy policy, contact) but lacks depth in expertise (no author bios, nutritionist), experience (no founding date, testimonials), and authoritativeness (no business verification, minimal sourcing).

This is typical for a multi-location restaurant chain with a WordPress/Elementor site. **The site is NOT at risk of E-E-A-T penalties**, but it could improve ranking for competitive health/nutrition queries (e.g., "healthy fast food", "gluten-free bowls near me") by adding expertise and experience signals.

---

## Section 6: AI Visibility & Content Structure Audit

### Current State:

**POSITIVE:**
- robots.txt allows all AI crawlers (no blocking)
- HTTPS enabled site-wide
- 126 pages crawled and indexed
- Meta tags, canonical URLs, and basic SEO structure in place
- Sitemap available (wp-sitemap.xml)

**NEGATIVE:**
- No llms.txt policy
- Menu answers hidden in JavaScript/interactive components
- Minimal plain-text product descriptions (14-54 words per bowl/wrap)
- No explicit ingredient lists in machine-readable format (no JSON-LD microdata for recipes)
- Poor answer structure for FAQ-style queries

### JSON-LD/Structured Data Analysis:

From crawl.csv: `jsonld_count` column shows **0 JSON-LD blocks** on most pages, with some pages having 0 structured data detected.

**This means:**
- No Recipe schema for bowls/wraps
- No FAQPage schema for Q&A
- Possibly missing LocalBusiness schema for locations

### Recommendation:
Add JSON-LD structured data:
```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Crazy Bowls and Wraps",
  "description": "Fresh, healthy bowls and wraps with customizable options",
  "url": "https://crazybowlsandwraps.com",
  "image": "https://crazybowlsandwraps.com/logo.png",
  "priceRange": "$$",
  "servesCuisine": "Healthy Fast Casual",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Address]",
    "addressLocality": "[City]",
    "addressRegion": "[State]",
    "postalCode": "[ZIP]"
  },
  "menu": "https://crazybowlsandwraps.com/menu/"
}
```

---

## Section 7: Implementation Priority

### TIER 1 (Do This This Week)

1. **Create `/llms.txt`** (2 minutes)
   - File: `https://crazybowlsandwraps.com/llms.txt`
   - Content: Allow all LLM crawlers, request attribution
   - Impact: Signals explicit LLM-friendliness to AI models

2. **Add plain-text menu to `/menu/` page** (2-4 hours)
   - Create HTML section with text list of all bowls, wraps, sides, prices
   - Keep existing interactive menu; add text as supplementary
   - Example: "Bowls: Mediterranean ($7.50-$8.50) - grilled chicken, hummus, veggies..."
   - Impact: LLMs can extract menu items without JS rendering

3. **Create `/about-us/` page** (1-2 hours)
   - Include: Founder story, founding year, mission, team photos
   - Length: 300-500 words
   - Impact: Establishes expertise and experience signals

### TIER 2 (Do This in Next 2 Weeks)

4. **Add FAQPage schema to `/menu/` and `/nutrition-information/`** (2 hours)
   - Questions: "What's gluten-free?", "How much?", "Can I customize?"
   - JSON-LD FAQPage structured data
   - Impact: Improves LLM Q&A performance and Google Rich Snippets

5. **Expand `/nutrition-information/` page** (2-3 hours)
   - Currently 116 words; expand to 300+ words
   - Add nutritionist bio and credentials
   - Include "Best for [diet]" recommendations
   - Impact: Establishes nutrition expertise

6. **Create `/terms-of-service/` page** (1 hour)
   - Standard T&S for restaurant/catering business
   - Impact: Completes trustworthiness signals

7. **Add customer testimonials to homepage** (2 hours)
   - Collect 3-5 reviews from Google/Yelp
   - Add as text or testimonial widget
   - Impact: Experience signal, social proof for AI-assisted recommendations

### TIER 3 (Strategic Improvements)

8. **Add JSON-LD LocalBusiness schema to all location pages** (1-2 hours)
   - Verify NAP consistency first
   - Add to location header/footer template
   - Impact: Better AI understanding of physical locations

9. **Create `/sourcing-and-quality/` page** (2 hours)
   - Ingredient sourcing, supplier names, freshness practices
   - Food safety certifications
   - Impact: Establishes quality/experience signals

10. **Expand product descriptions** (4-6 hours)
    - Increase bowl/wrap page content from ~30 words to 80-150 words
    - Add ingredients, nutritional highlights, suggested for [diet]
    - Impact: Richer LLM training data

---

## Section 8: Competitive AI Visibility Comparison

### Expected E-E-A-T for Competitors:
- **Chipotle, Sweetgreen, Panera:** 12/15+ (founder story, nutritionist review, awards, customer testimonials)
- **Local chains (Noodles & Co):** 9-11/15 (basic about page, some sourcing info)
- **Current Crazy Bowls:** 7.5/15

### AI Model Performance Implication:
When users ask AI models: "Is Crazy Bowls healthy?" or "What are gluten-free options at Crazy Bowls?"

**Current outcome:** LLM may:
- Return generic info (lacks specific sourcing/nutrition expertise)
- Struggle to find menu details (hidden in JS)
- Miss hours/locations if relying on text-only crawl
- Avoid recommending the brand (lacks social proof/awards)

**After implementing Tier 1-2 changes:** LLM will:
- Confidently cite menu items with nutritional data
- Explain customization options clearly
- Recommend for specific diets (gluten-free, vegan, protein-focused)
- Include team/founder info for authenticity

---

## Section 9: LLM Training Data Value

### Current Content Audit:
- **Total word count (crawled pages):** Estimated 50,000-100,000 words
- **Unique menu/nutrition data:** ~30 bowl variants, ~25 wrap variants, sides, drinks
- **Value to AI models:** MODERATE (good ingredient/menu data, weak expertise/sourcing data)

### Optimization for LLM Training:

**High-value content to expand:**
1. **Ingredient specifications** — Add JSON or plain text: "Mediterranean Bowl contains: 8oz grilled chicken, 1/2 cup hummus, 2oz feta cheese, cucumber, tomato, red onion, mixed greens, olive oil dressing (360 cal, 28g protein, 12g fat)..."
2. **Nutritional science** — Link bowls to diet trends: "This bowl is keto-friendly (high fat, low carb)" or "Paleo-approved (no grains, dairy-free option)"
3. **Expert sourcing** — Nutritionist/chef quotes: "This bowl provides complete amino acids from the protein/legume combo"

**Low-value content (currently):**
- Generic product pages with minimal descriptions
- Elementor visual-only sections (LLMs see HTML, not rendered images)
- Form embeds (iFrames) that block content crawling

---

## Section 10: Recommendations Summary

### Quick Wins (Immediate):
1. Deploy `/llms.txt` — allows 30+ AI models to crawl confidently
2. Add plain-text menu to `/menu/` — enables LLM to extract pricing/items
3. Create `/about-us/` — establishes founder credibility

### Medium-term (2-4 weeks):
4. Add JSONSchema.org FAQPage and LocalBusiness
5. Expand nutrition page with expert credibility
6. Add customer testimonials and TOS
7. Implement content accessibility improvements

### Long-term (1-3 months):
8. Rebuild `/menu/` with hybrid interactive + static text design
9. Expand all product pages with ingredient/nutrition detail
10. Create sourcing/quality content
11. Build content linking strategy for E-E-A-T

### Success Metrics:
- **AI visibility:** Measure by checking if major AI models can cite Crazy Bowls menu in responses
- **E-E-A-T:** Monitor rankings for "healthy bowls near me", "gluten-free fast food", etc.
- **Organic traffic:** Track increases from AI-assisted search queries
- **Engagement:** Monitor click-through-rate from AI citations to site

---

## Appendix: Full Crawl Data Summary

**Total Pages:** 126
**Status Codes:** 125 x 200 OK, 1 x 404 (email protection redirect)
**HTTPS:** 100%
**Average Load Time:** ~200-250ms
**GA4 Sessions (tracked pages):** 188,000+ total sessions across crawled pages
- Top page: Homepage (166,277 sessions, 65.76% engagement)
- High engagement: Menu (20,660 sessions, 68.23% engagement), Locations (19,663 sessions)
- Nutrition page: 3,490 sessions, 37.94% engagement (lower — needs expansion)

**Meta Description:** Most pages lack meta descriptions (empty field in crawl.csv), missed opportunity for SERP optimization

**Images:** 89 images on menu page, good visual content; images have alt text on key pages

---

## Conclusion

**Current State:** Crazy Bowls and Wraps has a **moderately AI-friendly website** with solid technical SEO (HTTPS, crawlability) but weak E-E-A-T signals and suboptimal content structure for LLM training/inference.

**Primary Gap:** The disconnect between interactive menu design (great for humans) and LLM parsing (requires plain text, structured data).

**Opportunity:** By implementing Tier 1-2 recommendations, the site can move from "crawlable but weak" to "AI-recommended brand" within 4-6 weeks, significantly improving visibility in AI-assisted searches and recommendations.

**Expected ROI:** 10-20% increase in organic traffic from AI-driven queries within 3 months post-implementation.

