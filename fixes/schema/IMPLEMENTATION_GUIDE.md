# JSON-LD Schema Implementation Guide
**Crazy Bowls and Wraps**

Version: 1.0  
Last Updated: 2026-06-15  
Target: Full JSON-LD implementation across crazybowlsandwraps.com

---

## Table of Contents
1. [Overview](#overview)
2. [Phase-by-Phase Implementation](#phase-by-phase-implementation)
3. [Technical Implementation Methods](#technical-implementation-methods)
4. [Validation & Testing](#validation--testing)
5. [Troubleshooting](#troubleshooting)
6. [Maintenance & Updates](#maintenance--updates)

---

## Overview

### What is JSON-LD?
JSON-LD (JSON for Linking Data) is a format for structured data that tells search engines, voice assistants, and other tools what your website content means. It's the recommended format by Google and is invisible to visitors.

### Why Implement Schema?
- **Google Maps Pack:** Local business listings appear in the local pack (map + reviews)
- **Rich Snippets:** Product prices, images, and ratings appear in search results
- **Voice Search:** Smart speakers can answer questions using your data
- **E-A-T Signals:** Search rankings improve with proper schema markup
- **Mobile:** Rich snippets take up more space, improving click-through rates

### Timeline
- **Phase 1 (Homepage):** 1-2 hours
- **Phase 2 (Locations):** 2-4 hours
- **Phase 3 (Menu):** 1-2 hours
- **Phase 4 (Products):** 4-6 hours (most time-intensive)
- **Phase 5 (Breadcrumbs):** 2-3 hours
- **Phase 6 (Testing):** 1 hour
- **Total:** 11-18 hours

---

## Phase-by-Phase Implementation

### Phase 1: Homepage Schema (PRIORITY: CRITICAL)

**File to Use:** `homepage.json`

**Where to Add:**
- Add to: `<head>` section of homepage template
- File: WordPress theme header.php OR All in One SEO / Yoast settings

**Steps:**

1. **Copy the homepage.json content**
   ```json
   <script type="application/ld+json">
   {
     "@context": "https://schema.org/",
     "@graph": [
       { Organization object },
       { WebSite object }
     ]
   }
   </script>
   ```

2. **Fill in placeholder values:**
   - `name`: "Crazy Bowls and Wraps" (already correct)
   - `logo`: Update URL path to actual logo image (e.g., `/wp-content/uploads/2023/09/logo.png`)
   - `sameAs`: Add actual social media URLs:
     - Facebook: `https://www.facebook.com/[PAGE_NAME]`
     - Instagram: `https://www.instagram.com/[HANDLE]`
     - LinkedIn: `https://www.linkedin.com/company/[ID]`
   - `address`: Fill in HQ address (city, state, ZIP)
   - `telephone`: Main phone number in format: `+1-502-555-0100`
   - `email`: Main contact email

3. **Add to WordPress:**
   - **Option A (Yoast SEO):**
     1. Go to `Dashboard > SEO > Search Appearance`
     2. Look for "Knowledge Graph" section
     3. Fill in Organization details
   
   - **Option B (All in One SEO):**
     1. Go to `Dashboard > All in One SEO > Settings`
     2. Search "Organization"
     3. Enable and fill Organization schema
   
   - **Option C (Manual - Recommended for full control):**
     1. Edit homepage (WordPress editor)
     2. Add Custom HTML block or go to theme `functions.php`
     3. Add hook to enqueue JSON-LD:
        ```php
        add_action('wp_head', function() {
          if (is_home() || is_front_page()) {
            echo '<script type="application/ld+json">';
            echo json_encode([
              "@context" => "https://schema.org/",
              "@graph" => [
                [ "Organization data" ],
                [ "WebSite data" ]
              ]);
            echo '</script>';
          }
        });
        ```

4. **Validate:**
   - Go to: https://search.google.com/test/rich-results
   - Enter: `https://crazybowlsandwraps.com/`
   - Check for green checkmark and no errors

**Success Indicator:**
- Google Rich Results Test shows Organization card
- Search Console detects Organization schema (may take 48-72 hours)

---

### Phase 2: Location Pages Schema (PRIORITY: CRITICAL)

**File to Use:** `locations.json`

**Where to Add:**
- Add to: Location pages (if individual location pages exist)
- OR: Locations directory page `/locations/`

**Steps:**

1. **Determine location structure:**
   - Do you have `/locations/louisville/`, `/locations/columbus/`, etc.?
   - OR just `/locations/` listing all locations?
   - Schema approach differs for each

2. **If individual location pages exist** (`/locations/[city]/`):
   - Create a template for each location with LocalBusiness schema
   - Extract from CMS: address, phone, hours, latitude/longitude
   - **Critical:** Get coordinates using Google Maps:
     1. Search your address on Google Maps
     2. Right-click > Copy coordinates
     3. Paste in `geo.latitude` and `geo.longitude`

3. **If only location listing exists** (`/locations/`):
   - Add JSON-LD with @graph of ALL locations
   - Still include all required fields per location
   - Example structure:
     ```json
     {
       "@graph": [
         { Location 1 LocalBusiness },
         { Location 2 LocalBusiness },
         { Location 3 LocalBusiness }
       ]
     }
     ```

4. **Fill in template values:**
   - `name`: "Crazy Bowls and Wraps - [City Name]"
   - `telephone`: Location-specific phone (or main if same)
   - `address`: Complete street address (streetAddress, addressLocality, addressRegion, postalCode)
   - `geo`: Coordinates (must be accurate to within 100 meters)
   - `openingHoursSpecification`: Days and hours (see format below)
   - `image`: Photo of location (if available)

5. **Opening Hours Format:**
   ```json
   "openingHoursSpecification": [
     {
       "@type": "OpeningHoursSpecification",
       "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
       "opens": "10:30",
       "closes": "21:00"
     },
     {
       "@type": "OpeningHoursSpecification",
       "dayOfWeek": ["Saturday"],
       "opens": "10:30",
       "closes": "21:00"
     },
     {
       "@type": "OpeningHoursSpecification",
       "dayOfWeek": ["Sunday"],
       "opens": "11:00",
       "closes": "20:00"
     }
   ]
   ```
   - Format: `"HH:MM"` (24-hour, no AM/PM)
   - If closed: omit dayOfWeek or use `closes: "00:00"`

6. **Add to WordPress:**
   - Add to location post type template
   - OR use ACF (Advanced Custom Fields) for meta fields + PHP render
   - Ensure phone number, address are custom fields for reusability

7. **Validate with local schema:**
   - Go to: https://search.google.com/test/rich-results
   - Test multiple location URLs
   - Check for LocalBusiness, Restaurant types
   - Look for address, phone, hours in preview

**Success Indicator:**
- Location pages show LocalBusiness card
- Address, phone, hours appear in search results
- Eventually: location appears in Google Maps local pack

---

### Phase 3: Menu Pages Schema (PRIORITY: HIGH)

**File to Use:** `menu.json`

**Where to Add:**
- `/menu/` — Main menu aggregator page
- `/bowls/` — Bowls category page
- `/wraps/` — Wraps category page
- Other category pages

**Steps:**

1. **Choose implementation approach:**
   - **Static:** Hardcode menu sections once (good if menu rarely changes)
   - **Dynamic:** Generate from database (better for frequent menu updates)

2. **Structure:**
   - Top level: Menu (entire menu)
   - Level 1: MenuSection (Breakfast, Bowls, Wraps, Salads, Starters, Dessert, Kids Menu)
   - Level 2: MenuItem (individual items like "BBQ Bowl", "Thai Wrap")

3. **For /menu/ page:**
   - Include ALL menu sections
   - Include sample items per section (5-10 per section as examples)
   - Link to full product pages via URL

4. **For category pages** (`/bowls/`, `/wraps/`):
   - Simpler: Just that MenuSection
   - Include all items in that category

5. **Fill in data:**
   - `name`: Item name from page
   - `description`: First 100-150 characters of product description
   - `url`: Absolute URL to product page
   - `image`: HTTPS URL to product image
   - `offers.price`: Extract from product page or database
     - Example: URL `/bowls/thai-bowl-7-35-8-55/` = 7.35 (small), 8.55 (large)

6. **Price extraction strategy:**
   - Option A: Parse URL slug for prices
   - Option B: Query CMS database for product meta
   - Option C: Screenshot product page and manually extract
   - Option D: Use OCR on product images

7. **Add to WordPress:**
   ```php
   // In menu page template
   $menu_items = get_posts([
     'post_type' => 'product',
     'posts_per_page' => -1
   ]);
   
   $schema = [
     '@context' => 'https://schema.org/',
     '@type' => 'Menu',
     'name' => 'Crazy Bowls and Wraps Menu',
     'hasMenuSection' => generate_menu_sections($menu_items)
   ];
   
   echo '<script type="application/ld+json">';
   echo json_encode($schema);
   echo '</script>';
   ```

8. **Validate:**
   - Test `/menu/` page
   - Should show Menu card with menu sections and items
   - Verify all image URLs are HTTPS

**Success Indicator:**
- Menu page shows Menu schema card
- Menu sections and items visible in search results
- Product images appear in rich snippets

---

### Phase 4: Product Pages Schema (PRIORITY: HIGH)

**File to Use:** `menuitem-template.json`

**Where to Add:**
- Every product page: `/bowls/[name]/`, `/wraps/[name]/`, `/starters/[name]/`, etc.
- Approximately 80+ pages

**Steps:**

1. **Determine deployment method:**
   - **Recommended:** Dynamic generation in product template
   - Less ideal: Manual entry per product (error-prone with 80+ items)

2. **Product template code** (WordPress):
   ```php
   <?php
   // In single-product.php or custom post template
   
   $product_name = get_the_title();
   $product_description = get_the_excerpt();
   $product_image = get_the_post_thumbnail_url();
   $product_url = get_permalink();
   
   // Extract prices from post meta or URL
   $prices = extract_prices_from_url(get_permalink());
   
   $schema = [
     '@context' => 'https://schema.org/',
     '@type' => 'MenuItem',
     'name' => $product_name,
     'description' => $product_description,
     'url' => $product_url,
     'image' => [
       '@type' => 'ImageObject',
       'url' => $product_image
     ],
     'offers' => [
       [
         '@type' => 'Offer',
         'priceCurrency' => 'USD',
         'price' => $prices['small'] ?? '[EXTRACT]',
         'name' => 'Regular Size'
       ],
       [
         '@type' => 'Offer',
         'priceCurrency' => 'USD',
         'price' => $prices['large'] ?? '[EXTRACT]',
         'name' => 'Large Size'
       ]
     ]
   ];
   
   echo '<script type="application/ld+json">';
   echo json_encode($schema);
   echo '</script>';
   ```

3. **Key fields for products:**
   - `name`: Product title (e.g., "BBQ Bowl")
   - `description`: Product description (50-200 characters)
   - `image`: Product photo (HTTPS URL, min 800x600)
   - `offers`: Price structure (regular + large if applicable)
   - `suitableForDiet`: Add if applicable
     - VeganDiet, VegetarianDiet, GlutenFreeDiet, etc.

4. **Dietary markers** (automatic if categories exist):
   ```php
   $suitable_diets = [];
   if (has_term('vegan', 'product_category')) {
     $suitable_diets[] = 'VeganDiet';
   }
   if (has_term('vegetarian', 'product_category')) {
     $suitable_diets[] = 'VegetarianDiet';
   }
   if (has_term('gluten-free', 'product_category')) {
     $suitable_diets[] = 'GlutenFreeDiet';
   }
   ```

5. **Price extraction** (most complex part):
   - **Method 1:** URL parsing
     ```php
     preg_match('/(\d+\.\d+)-(\d+\.\d+)/', get_permalink(), $matches);
     $small_price = $matches[1] ?? null;
     $large_price = $matches[2] ?? null;
     ```
   
   - **Method 2:** Post meta fields
     ```php
     $small_price = get_post_meta(get_the_ID(), '_price_small', true);
     $large_price = get_post_meta(get_the_ID(), '_price_large', true);
     ```
   
   - **Method 3:** WooCommerce product
     ```php
     $product = wc_get_product(get_the_ID());
     $small_price = $product->get_price();
     ```

6. **Nutrition data** (optional but high-value):
   - If nutrition PDF exists, extract calories/macros
   - OR pull from nutrition meta fields if available
   - If not available, omit `nutrition` object (still valid)

7. **Validate:**
   - Test 5-10 product pages via Google Rich Results Test
   - Verify MenuItem card shows with name, image, price
   - Check that all image URLs are HTTPS

**Success Indicator:**
- Product pages show MenuItem card
- Prices appear in search snippets
- Images display in carousel

---

### Phase 5: Breadcrumb Navigation (PRIORITY: MEDIUM)

**File to Use:** `breadcrumbs.json`

**Where to Add:**
- EVERY page except homepage
- Applies to 125 pages

**Steps:**

1. **Breadcrumb strategy:**
   - Generate dynamically based on URL structure
   - Path: Home → Category → Subcategory → Page

2. **WordPress implementation:**
   ```php
   // Add to functions.php
   function render_breadcrumb_schema() {
     if (is_front_page()) return; // Skip homepage
     
     $breadcrumbs = [];
     
     // Always start with home
     $breadcrumbs[] = [
       '@type' => 'ListItem',
       'position' => 1,
       'name' => 'Home',
       'item' => home_url()
     ];
     
     // Get current post/page data
     $post_type = get_post_type();
     $taxonomy = get_object_taxonomies($post_type);
     
     // Add category if applicable
     if (!empty($taxonomy)) {
       $terms = get_the_terms(get_the_ID(), $taxonomy[0]);
       if ($terms) {
         $term = $terms[0];
         $breadcrumbs[] = [
           '@type' => 'ListItem',
           'position' => count($breadcrumbs) + 1,
           'name' => $term->name,
           'item' => get_term_link($term)
         ];
       }
     }
     
     // Add current page
     $breadcrumbs[] = [
       '@type' => 'ListItem',
       'position' => count($breadcrumbs) + 1,
       'name' => get_the_title(),
       'item' => get_permalink()
     ];
     
     $schema = [
       '@context' => 'https://schema.org/',
       '@type' => 'BreadcrumbList',
       'itemListElement' => $breadcrumbs
     ];
     
     echo '<script type="application/ld+json">';
     echo json_encode($schema);
     echo '</script>';
   }
   
   add_action('wp_head', 'render_breadcrumb_schema');
   ```

3. **Key points:**
   - `position` must be sequential (1, 2, 3...)
   - `item` URL must match canonical URL
   - Text should match actual page title
   - Must include homepage as first item

4. **Example breadcrumbs by page:**

   **Product page** (`/bowls/bbq-bowl/`):
   ```
   Home > Menu > Bowls > BBQ Bowl
   ```

   **Category page** (`/bowl_categories/vegan/`):
   ```
   Home > Menu > Bowls > Vegan
   ```

   **Inner page** (`/catering/`):
   ```
   Home > Catering
   ```

5. **Validate:**
   - Test various page types
   - Check position numbering
   - Verify URLs are absolute

**Success Indicator:**
- All non-homepage pages show BreadcrumbList card
- Breadcrumbs appear in search results
- Improved CTR from breadcrumb visibility

---

### Phase 6: Catering Page Schema (PRIORITY: MEDIUM)

**File to Use:** `catering.json`

**Where to Add:**
- `/catering/` page

**Steps:**

1. **Implement Organization + ContactPoint:**
   - Similar to homepage but for catering service
   - Includes separate catering phone and email

2. **Fill in catering-specific data:**
   - `name`: "Crazy Bowls and Wraps - Catering"
   - `telephone`: Dedicated catering phone (if different)
   - `email`: Catering email address
   - `areaServed`: States where catering available
   - `image`: Catering event photo

3. **Add to `/catering/` template:**
   ```php
   <script type="application/ld+json">
   {
     "@context": "https://schema.org/",
     "@graph": [
       { "Organization": { catering details } }
     ]
   }
   </script>
   ```

4. **Validate:**
   - Test `/catering/` page
   - Verify phone number and email are correct
   - Check that it links to parent Organization

---

## Technical Implementation Methods

### Method 1: Yoast SEO (Easiest for Beginners)

**Pros:** GUI-based, no coding required, one-click validation

**Cons:** Less control over advanced fields, plugin dependency

**Steps:**
1. Install Yoast SEO Pro (required for full schema support)
2. Dashboard > SEO > Search Appearance
3. Fill in Organization, LocalBusiness, Product fields
4. Enable schema types via toggles
5. Yoast auto-generates and validates JSON-LD

**Cost:** $99/year for one site

---

### Method 2: All in One SEO (Good Middle Ground)

**Pros:** Easier than manual coding, good for beginners

**Cons:** Can be slower to load than method 3

**Steps:**
1. Install All in One SEO Pro
2. Dashboard > All in One SEO > Settings > Schema
3. Enable schema types
4. Fill in organization and business details
5. Set up schema for each post type

**Cost:** $99/year for one site

---

### Method 3: Manual PHP (Full Control - Recommended)

**Pros:** Maximum control, best performance, no plugin overhead

**Cons:** Requires coding knowledge, manual maintenance

**Implementation in `functions.php`:**

```php
// Add JSON-LD to head
add_action('wp_head', function() {
  if (is_front_page()) {
    echo render_homepage_schema();
  } elseif (is_page('menu')) {
    echo render_menu_schema();
  } elseif (is_singular('product')) {
    echo render_product_schema();
  } else {
    echo render_breadcrumb_schema();
  }
});

function render_homepage_schema() {
  $schema = [
    '@context' => 'https://schema.org/',
    '@graph' => [ /* organization & website */ ]
  ];
  return '<script type="application/ld+json">' . json_encode($schema) . '</script>';
}

// Repeat for other schema types...
```

---

### Method 4: JavaScript Injection (Not Recommended but Possible)

**Pros:** Non-invasive, can be added via GTM

**Cons:** May not be crawled by Google, slower than server-side

```javascript
// In Google Tag Manager Custom HTML tag
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Organization",
  // ... schema data
}
</script>
```

---

## Validation & Testing

### Step 1: Google Rich Results Test

**URL:** https://search.google.com/test/rich-results

**Process:**
1. Enter page URL (or paste HTML)
2. Click "Test URL"
3. Wait for results (30-60 seconds)
4. Look for green checkmark and schema card
5. Review any warnings or errors

**Example Success:**
```
✓ Organization
✓ WebSite
✓ SearchAction
```

---

### Step 2: Schema.org Validator

**URL:** https://validator.schema.org/

**Process:**
1. Paste entire page source HTML
2. Click "Validate"
3. Check for valid/invalid schema types
4. Review required vs recommended fields

---

### Step 3: JSON Syntax Validation

**URL:** https://jsonlint.com/

**Process:**
1. Paste JSON-LD from source
2. Click "Validate JSON"
3. Should show "Valid JSON"
4. If error: fix syntax

---

### Step 4: Google Search Console

**URL:** https://search.google.com/search-console

**Process:**
1. Go to Enhancements > Structured Data
2. Filter by type (Organization, LocalBusiness, MenuItem)
3. Should show "0 errors" for all types
4. May take 48-72 hours to appear

**Common Issues:**
- "Missing field 'telephone'" → Add phone in schema
- "Invalid URL in 'image'" → Ensure HTTPS, real URL
- "Missing field 'geo'" → Add latitude/longitude for LocalBusiness

---

## Troubleshooting

### Schema Not Appearing in Search Console

**Possible Causes:**
1. JSON-LD not in `<head>` section
2. Syntax error in JSON
3. Duplicate schema definitions (keep only one)
4. Schema robots disallowed in robots.txt

**Solution:**
```php
// Ensure in <head>, not footer
add_action('wp_head', 'render_schema'); // Correct
add_action('wp_footer', 'render_schema'); // Wrong
```

---

### "Invalid URL" Error

**Cause:** Image URL is HTTP instead of HTTPS, or URL doesn't exist

**Solution:**
```json
// Wrong:
"url": "http://example.com/image.jpg"
"url": "/path/to/image.jpg"

// Correct:
"url": "https://crazybowlsandwraps.com/wp-content/uploads/2023/09/image.jpg"
```

---

### "Missing Required Field" Error

**Cause:** Required field for schema type is missing

**Example:** MenuItem without "name"

**Solution:** Add missing field to JSON-LD

```json
// Before (error):
{
  "@type": "MenuItem",
  "description": "...",
  "price": "9.99"
}

// After (valid):
{
  "@type": "MenuItem",
  "name": "BBQ Bowl",
  "description": "...",
  "price": "9.99"
}
```

---

### Rich Snippet Not Showing in Search Results

**Possible Causes:**
1. Schema valid but content too short
2. Schema added recently (takes time to index)
3. Search term doesn't trigger rich snippet
4. Site has manual action in Search Console

**Solution:**
- Wait 2-4 weeks after adding schema
- Test with exact product/brand name
- Check Search Console for manual actions
- Submit URL for re-crawl

---

## Maintenance & Updates

### Quarterly Review

**Schedule:** Every 3 months

**Checklist:**
- [ ] Check Search Console for new structured data errors
- [ ] Review Schema.org for new fields or types
- [ ] Test sample of pages with Rich Results Test
- [ ] Update prices/hours if changed
- [ ] Verify all URLs still exist (no 404s)

### When Menu Changes

**Process:**
1. Update menu items in WordPress
2. If using dynamic generation: auto-updated (no action needed)
3. If manual JSON-LD: update `menuitem-template.json` per item
4. Test updated pages with Rich Results Test

### When Location Opens/Closes

**Process:**
1. Add/remove location from `/locations/` page
2. Update location JSON-LD with new address/phone
3. Submit URL for re-crawl in Search Console
4. Test new location page

### Monitoring Checklist

```markdown
## Schema Health Dashboard

**This Week:**
- [ ] 0 structured data errors in Search Console
- [ ] All pages validate in Rich Results Test
- [ ] No missing required fields

**This Month:**
- [ ] Homepage Organization in Knowledge Graph
- [ ] Location pages in local pack (if applicable)
- [ ] Product pages showing rich snippets

**This Quarter:**
- [ ] +15-20% increase in organic impressions
- [ ] +8-12% increase in CTR from rich snippets
- [ ] Location pages trending up in local searches
```

---

## Quick Reference: Schema Files

| File | Page Type | @type | Required Fields |
|------|-----------|-------|-----------------|
| homepage.json | / | Organization, WebSite | name, url, logo, telephone |
| locations.json | /locations/ | LocalBusiness, Restaurant | address, telephone, geo |
| menu.json | /menu/ | Menu, MenuSection | name, hasMenuSection |
| menuitem-template.json | /bowls/*, /wraps/* | MenuItem | name, url, offers |
| breadcrumbs.json | All (except /) | BreadcrumbList | itemListElement[position, name, item] |
| catering.json | /catering/ | Organization, ContactPoint | name, contactPoint |

---

## Implementation Checklist

- [ ] **Phase 1:** Homepage schema added and validated
- [ ] **Phase 2:** Location pages schema created and filled
- [ ] **Phase 3:** Menu page schema implemented
- [ ] **Phase 4:** Product pages schema deployed (all 80+ items)
- [ ] **Phase 5:** Breadcrumbs added to all pages
- [ ] **Phase 6:** Catering page schema added
- [ ] **Testing:** All pages pass Rich Results Test
- [ ] **Search Console:** No structured data errors
- [ ] **Monitoring:** Set up quarterly review process
- [ ] **Documentation:** Team trained on schema maintenance

---

## Support Resources

- **Google Developers:** https://developers.google.com/search/docs/beginner/intro-structured-data
- **Schema.org:** https://schema.org/
- **Google Search Central:** https://support.google.com/webmasters/
- **Yoast SEO Docs:** https://yoast.com/help/
- **All in One SEO Docs:** https://aioseo.com/docs/

---

**Last Updated:** 2026-06-15  
**Next Review:** 2026-09-15  
**Owner:** SEO Implementation Team
