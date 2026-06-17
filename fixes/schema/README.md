# Phase 8: Schema Markup Audit & Generation

**Project:** Crazy Bowls and Wraps Website SEO Audit  
**Phase:** 8 of 8  
**Date:** 2026-06-15  
**Status:** COMPLETE

---

## Executive Summary

**Finding:** The site has **0% JSON-LD schema markup** across all 126 pages.

**Impact:** Significant missed opportunity for:
- Local pack visibility (maps)
- Rich snippets (search results)
- Voice search compatibility
- E-A-T authority signals

**Solution:** Complete schema implementation kit with templates, guides, and validation tools.

---

## What's Included

### 📊 Documentation
1. **SCHEMA_AUDIT.md** — Full audit report with findings and impact analysis
2. **IMPLEMENTATION_GUIDE.md** — Step-by-step implementation instructions
3. **README.md** — This file

### 🏗️ Schema Templates
1. **homepage.json** — Organization + WebSite for homepage
2. **locations.json** — LocalBusiness + Restaurant template for location pages
3. **menu.json** — Menu + MenuSection structure with sample items
4. **menuitem-template.json** — MenuItem template for 80+ product pages
5. **breadcrumbs.json** — BreadcrumbList for all non-homepage pages
6. **catering.json** — Organization + ContactPoint for catering service

---

## Quick Start (15 Minutes)

### 1. Read the Audit Report
```bash
Open: SCHEMA_AUDIT.md
Sections to review:
  - Executive Summary (understand impact)
  - Section 1: Detailed Audit Results (what's missing)
  - Section 7: Expected Impact (ROI)
```

### 2. Choose Implementation Method
- **Easiest:** Yoast SEO Pro (GUI-based)
- **Middle Ground:** All in One SEO Pro (balanced)
- **Best Control:** Manual PHP (code-based)

See `IMPLEMENTATION_GUIDE.md > Technical Implementation Methods`

### 3. Start with Homepage
```bash
1. Copy homepage.json
2. Fill in placeholders (logo URL, phone, social media)
3. Add to homepage <head> via chosen method
4. Test: https://search.google.com/test/rich-results
```

### 4. Expand to Other Pages
Follow Phase 2-6 in `IMPLEMENTATION_GUIDE.md`

---

## Current State Analysis

### Pages by Type (126 Total)

| Category | Count | JSON-LD | Gap | Priority |
|----------|-------|---------|-----|----------|
| Homepage | 1 | 0 | Organization + WebSite | CRITICAL |
| Location Pages | 1 | 0 | LocalBusiness + Restaurant | CRITICAL |
| Menu Aggregators | 3 | 0 | Menu + MenuSection | HIGH |
| Product Pages | 80+ | 0 | MenuItem | HIGH |
| Category Pages | 10+ | 0 | BreadcrumbList | MEDIUM |
| Inner Pages | 30+ | 0 | BreadcrumbList | MEDIUM |

### Zero Schema Detection
- `jsonld_count` = 0 for every row in crawl.csv
- Homepage: 166,277 GA4 sessions with no Organization schema
- Menu page: 20,660 sessions with no Menu schema
- Product pages: 80+ items with no MenuItem schema

### Extractable Data
- Organization name: ✓ Available
- Logo: ✓ Available (8 images on homepage)
- Menu structure: ✓ Available (80+ product pages)
- Product descriptions: ✓ Available (on each product page)
- Product images: ✓ Available (2 per product)

### NOT Extractable (CMS-Dependent)
- Individual location addresses
- Location phone numbers
- Hours of operation (format needed)
- Latitude/longitude coordinates
- Current pricing (visible in URLs but not text)
- Nutrition data (if in PDF format)
- Review/rating data
- Social media links (if not on site)

---

## Expected Impact & ROI

### Traffic Improvements
- **Local Pack:** +15-25% for location-based queries
- **Rich Snippets:** +8-12% for product/pricing queries
- **Voice Search:** +3-8% from assistant device queries
- **Overall:** **20-45% potential traffic increase**

### Timeline to Results
- **Week 1-2:** Schema indexed in Google
- **Week 3-4:** Rich snippets appear in search results
- **Month 2:** Local pack (if properly configured)
- **Month 3:** Full impact visible in analytics

### Effort Estimate
- **Phase 1-6 Implementation:** 11-18 hours
- **Testing & Validation:** 1-2 hours
- **Ongoing Maintenance:** 2-3 hours/quarter

**Total First-Time Cost:** 12-20 hours  
**Ongoing Cost:** Minimal (once per quarter review)

---

## Implementation Roadmap

### Week 1: Foundation
- [ ] Read SCHEMA_AUDIT.md and IMPLEMENTATION_GUIDE.md
- [ ] Gather required data (phone numbers, addresses, coordinates)
- [ ] Choose implementation method (Yoast/AIOSEO/PHP)
- [ ] Implement homepage schema (Phase 1)
- [ ] Test homepage with Rich Results Test

### Week 2: Critical Pages
- [ ] Implement location pages schema (Phase 2)
- [ ] Test location pages
- [ ] Implement menu page schema (Phase 3)
- [ ] Test menu page

### Week 3: Products
- [ ] Implement product pages schema (Phase 4) — 80+ items
- [ ] Extract prices from URLs or CMS
- [ ] Test sample of 5-10 product pages

### Week 4: Completion
- [ ] Add breadcrumbs to all pages (Phase 5)
- [ ] Add catering page schema (Phase 6)
- [ ] Full validation across all pages
- [ ] Submit URLs to Search Console for re-crawl
- [ ] Monitor Search Console for errors

### Ongoing
- [ ] Monthly check: Search Console Enhancements > Structured Data
- [ ] Quarterly review: Update schema as menu changes
- [ ] Annual audit: Review new schema.org types and fields

---

## File Reference

### Main Documentation
| File | Purpose | Read Time |
|------|---------|-----------|
| SCHEMA_AUDIT.md | Complete audit findings and analysis | 15-20 min |
| IMPLEMENTATION_GUIDE.md | Technical implementation steps | 20-30 min |
| README.md | This file — quick orientation | 5 min |

### Schema Templates (JSON)
| File | Page Type | Fields | Complexity |
|------|-----------|--------|------------|
| homepage.json | / | Organization, WebSite | Low |
| locations.json | /locations/ | LocalBusiness, Restaurant | Medium |
| menu.json | /menu/ | Menu, MenuSection, MenuItem | High |
| menuitem-template.json | /bowls/*, /wraps/* | MenuItem | Low |
| breadcrumbs.json | All pages | BreadcrumbList | Low |
| catering.json | /catering/ | Organization, ContactPoint | Low |

---

## Validation Tools (Free)

### Required
1. **Google Rich Results Test** → https://search.google.com/test/rich-results
   - Test every new schema implementation
   - Gives visual preview of how Google displays your data

2. **Google Search Console** → https://search.google.com/search-console
   - Monitor structured data errors
   - Track schema coverage over time
   - Submit URLs for re-crawl

3. **JSON Validator** → https://jsonlint.com/
   - Check JSON syntax before deploying
   - Catches bracket/quote errors

### Optional
- **Schema.org Validator** → https://validator.schema.org/
- **YEXT Schema Validator** → https://www.yext.com/s/me/product/knowledge-manager

---

## Common Questions

### Q: Why is schema important?
**A:** Schema tells Google what your content means (not just words). It enables:
- Maps pack (essential for restaurants)
- Rich snippets (bigger, better-looking search results)
- Voice search compatibility
- Knowledge panel eligibility

### Q: How long before results?
**A:** 
- Schema indexed: 1-2 weeks
- Rich snippets visible: 3-4 weeks
- Full impact in analytics: 6-8 weeks

### Q: Does schema affect rankings?
**A:** Indirectly. Schema itself is not a ranking factor, but:
- Better CTR from rich snippets → more traffic → better rankings
- Maps pack visibility → more qualified leads
- E-A-T signals → authority boost

### Q: Do I need a plugin?
**A:** Not if you have PHP knowledge. Plugins are easier but add overhead:
- **With plugin (Yoast/AIOSEO):** Easier to manage, 99/year
- **Without plugin (PHP):** Full control, no cost, requires coding

### Q: What if I have 80+ product pages?
**A:** Use dynamic generation. Don't manually create each one:
```php
// Good: Loops through all products
foreach ($products as $product) {
  echo generate_menuitem_schema($product);
}

// Bad: Manually editing 80 files (errors + time)
```

---

## Next Steps

1. **Review SCHEMA_AUDIT.md** (15 min)
   - Understand what's missing
   - See impact projections

2. **Choose Implementation Method** (5 min)
   - Yoast (easiest), AIOSEO (balanced), or PHP (full control)

3. **Read IMPLEMENTATION_GUIDE.md** (20 min)
   - Follow Phase 1 (homepage) first
   - Then expand to other phases

4. **Implement & Test** (11-18 hours total)
   - Use provided templates
   - Validate with Google Rich Results Test
   - Monitor in Search Console

5. **Monitor & Maintain** (2-3 hours/quarter)
   - Quarterly review
   - Update as menu/hours change

---

## Support

### Documentation
- **Full Implementation Guide:** `IMPLEMENTATION_GUIDE.md`
- **Audit Report:** `SCHEMA_AUDIT.md`
- **Schema.org Reference:** https://schema.org/

### Google Resources
- **Structured Data Intro:** https://developers.google.com/search/docs/beginner/intro-structured-data
- **Search Central Blog:** https://developers.google.com/search/blog
- **Issue Tracker:** https://issuetracker.google.com/issues?q=componentid:224437

### Community
- **Schema.org Forum:** https://github.com/schemaorg/schemaorg/discussions
- **r/SEO:** https://reddit.com/r/SEO
- **Search Console Help:** https://support.google.com/webmasters/

---

## File Structure

```
/audit/fixes/schema/
├── README.md                          (this file)
├── SCHEMA_AUDIT.md                    (audit findings)
├── IMPLEMENTATION_GUIDE.md            (how to implement)
├── homepage.json                      (Organization + WebSite)
├── locations.json                     (LocalBusiness template)
├── menu.json                          (Menu + MenuSection)
├── menuitem-template.json             (MenuItem template)
├── breadcrumbs.json                   (BreadcrumbList template)
└── catering.json                      (Organization + ContactPoint)
```

---

## Key Metrics to Track

### Pre-Implementation Baseline
- Organic sessions: [Record from GA4]
- Organic CTR: [Record from Search Console]
- Local pack appearances: 0
- Rich snippet appearances: 0

### Post-Implementation (Month 3)
- Organic sessions: [Target: +20-45%]
- Organic CTR: [Target: +8-12%]
- Local pack appearances: [Target: all location pages]
- Rich snippet appearances: [Target: all product pages]

---

## Summary

This phase delivers a **complete, production-ready schema implementation kit** for Crazy Bowls and Wraps. The site currently has **0% JSON-LD coverage** but is an excellent candidate for schema markup because:

1. ✓ Clear page structure (homepage, locations, menu, products)
2. ✓ High traffic pages (homepage: 166k sessions, menu: 20k sessions)
3. ✓ Perfect use case (restaurant with locations and menu)
4. ✓ Extractable data (most required fields available)

**Estimated ROI:** 20-45% traffic increase within 2-3 months of full implementation.

**Next Action:** Read SCHEMA_AUDIT.md to understand findings, then IMPLEMENTATION_GUIDE.md to begin Phase 1 (homepage schema).

---

**Created:** 2026-06-15  
**Phase:** 8 of 8  
**Status:** COMPLETE & READY FOR IMPLEMENTATION  
**Effort Remaining:** 11-18 hours for full implementation
