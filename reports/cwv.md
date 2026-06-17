# Core Web Vitals Audit — Crazybowls.com

## CRITICAL NOTICE: API Access Issue

⚠️ **The PageSpeed Insights API requires a Google API key for reliable access.**

The free tier without authentication has extremely strict rate limits (429 errors after 1-2 requests).


**To complete this audit, you must:**

1. Visit: https://console.cloud.google.com/apis/credentials

2. Create a new API project

3. Enable the PageSpeed Insights API

4. Generate an API key (or OAuth 2.0 credentials)

5. Re-run the audit with the key:

   ```bash

   PSI_API_KEY=your_key python3 audit/cwv_audit.py

   ```


Alternatively, use the Chrome DevTools Lighthouse tab to audit individual pages manually.


---


## Preliminary Analysis: High Bounce Rate Pages (Without CWV Metrics)


### Priority 1: Pages with High Bounce Rate (>50%) - IMMEDIATE ATTENTION NEEDED


These pages have user experience issues indicated by high bounce rates. Performance optimization should be prioritized.


| Page URL | Sessions | Bounce Rate | Status |

|----------|----------|-------------|--------|

| `/locations` | 19663 | 53.5% | ⚠️ Needs audit |

| `/nutrition-information` | 3490 | 62.1% | ⚠️ Needs audit |

| `/delivery` | 209 | 68.9% | ⚠️ Needs audit |

| `/bowls/mediterranean-bowl` | 179 | 69.3% | ⚠️ Needs audit |

| `/wraps/caesar-wrap` | 173 | 59.5% | ⚠️ Needs audit |

| `/wraps/buffalo-wrap` | 164 | 63.4% | ⚠️ Needs audit |

| `/bowls/pesto-bowl-7-50-8-50` | 136 | 58.1% | ⚠️ Needs audit |

| `/bowls/fajita-bowl-8-55-9-55` | 111 | 65.8% | ⚠️ Needs audit |

| `/bowls/teriyaki-bowl-7-35-8-55` | 108 | 62.0% | ⚠️ Needs audit |



### Bounce Rate Analysis


- **Average bounce rate across all pages:** 45.1%

- **Pages with bounce rate > 50%:** 9/18

- **Worst performing page:** /locations (53.5% bounce rate)


### Manual Audit Instructions


Until the API key is configured, you can audit individual pages using Chrome DevTools:


1. Open the page in Chrome

2. Press F12 or Ctrl+Shift+I to open DevTools

3. Click the Lighthouse tab

4. Select Mobile + Desktop

5. Click "Analyze page load"

6. Note the metrics:

   - LCP (Largest Contentful Paint) - target < 2.5s

   - INP (Interaction to Next Paint) - target < 200ms

   - CLS (Cumulative Layout Shift) - target < 0.1

   - TTFB (Time to First Byte) - target < 800ms

   - Performance Score - target > 50


### Recommendations Based on Bounce Rate Data


**High bounce rate pages likely suffer from:**

1. Slow page load times (LCP issues)

2. Poor interactivity (INP issues)

3. Visual instability (CLS issues)

4. Slow server response (TTFB issues)


**Immediate actions:**

1. **Get API key and re-run audit** - This is the highest priority

2. Manually audit top 5 high-bounce pages using Chrome DevTools Lighthouse

3. Focus on:

   - Image optimization (affects LCP)

   - JavaScript performance (affects INP)

   - Layout stability (affects CLS)

   - Server response time (affects TTFB)


### Pages to Manual Audit (Sorted by Priority)


1. `/locations` - 19663 sessions, 53.5% bounce rate

2. `/nutrition-information` - 3490 sessions, 62.1% bounce rate

3. `/delivery` - 209 sessions, 68.9% bounce rate

4. `/bowls/mediterranean-bowl` - 179 sessions, 69.3% bounce rate

5. `/wraps/caesar-wrap` - 173 sessions, 59.5% bounce rate

6. `/wraps/buffalo-wrap` - 164 sessions, 63.4% bounce rate

7. `/bowls/pesto-bowl-7-50-8-50` - 136 sessions, 58.1% bounce rate

8. `/bowls/fajita-bowl-8-55-9-55` - 111 sessions, 65.8% bounce rate

9. `/bowls/teriyaki-bowl-7-35-8-55` - 108 sessions, 62.0% bounce rate


---

*Report generated: Phase 4 - Core Web Vitals Audit (API Access Issue)*

*Audit Date: 2026-06-15 17:13:30 UTC*
