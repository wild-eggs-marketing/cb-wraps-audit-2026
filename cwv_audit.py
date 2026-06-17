#!/usr/bin/env python3
"""
Phase 4: Core Web Vitals Audit for crazybowlsandwraps.com
Runs PageSpeed Insights API for top 20 pages (mobile + desktop)
"""

import json
import requests
import time
import os
from urllib.parse import urljoin
from datetime import datetime

BASE_URL = "https://www.crazybowlsandwraps.com"
PSI_API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
TIMEOUT = 10
RATE_LIMIT_DELAY = 5  # Increased delay between requests to avoid rate limiting

# Get API key from environment or config
API_KEY = os.environ.get("PSI_API_KEY", "")

# CWV targets
TARGETS = {
    "LCP": 2.5,      # seconds
    "INP": 0.2,      # seconds
    "CLS": 0.1,      # unitless
    "TTFB": 0.8,     # seconds
    "Performance": 50  # score 0-100
}

def parse_input_file():
    """Parse the top 20 pages input file"""
    pages = []
    try:
        with open("/Users/ellebrayton/Crazy Bowls and Wraps/audit/crawl/top20-pages-by-traffic.txt", "r") as f:
            lines = f.readlines()
            for line in lines[1:]:  # Skip header
                line = line.strip()
                if not line:
                    continue
                parts = line.split(",")
                if len(parts) >= 4:
                    url_path = parts[0]
                    sessions = int(parts[1])
                    engagement_rate = float(parts[2])
                    bounce_rate = float(parts[3])
                    pages.append({
                        "path": url_path,
                        "sessions": sessions,
                        "engagement_rate": engagement_rate,
                        "bounce_rate": bounce_rate
                    })
    except Exception as e:
        print(f"Error parsing input file: {e}")
        return []

    # Remove duplicates (keeping first occurrence)
    seen = set()
    unique_pages = []
    for page in pages:
        if page["path"] not in seen:
            seen.add(page["path"])
            unique_pages.append(page)

    return unique_pages[:20]  # Return first 20 unique pages

def call_psi_api(full_url, strategy, retry_count=0, max_retries=3):
    """Call PageSpeed Insights API with exponential backoff"""
    params = {
        "url": full_url,
        "strategy": strategy
    }

    if API_KEY:
        params["key"] = API_KEY

    try:
        response = requests.get(PSI_API_URL, params=params, timeout=TIMEOUT)

        if response.status_code == 429:  # Rate limited
            if retry_count < max_retries:
                # Exponential backoff: 2s, 4s, 8s
                wait_time = 2 ** (retry_count + 1)
                print(f"Rate limited. Waiting {wait_time}s before retry...", end="")
                time.sleep(wait_time)
                print(" retrying.")
                return call_psi_api(full_url, strategy, retry_count + 1, max_retries)
            else:
                return {"error": "Rate limited (max retries exceeded)"}

        response.raise_for_status()
        return response.json()
    except requests.exceptions.Timeout:
        return {"error": "API timeout"}
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

def extract_cwv_metrics(psi_response, strategy):
    """Extract Core Web Vitals metrics from PSI response"""
    if "error" in psi_response:
        return None

    try:
        # Navigate the PSI response structure
        lighthouse_result = psi_response.get("lighthouseResult", {})
        audits = lighthouse_result.get("audits", {})
        categories = lighthouse_result.get("categories", {})

        # Performance score
        perf_score = categories.get("performance", {}).get("score", 0) * 100

        # Extract metrics
        metrics = {
            "performance_score": perf_score,
            "LCP": None,
            "INP": None,
            "CLS": None,
            "TTFB": None
        }

        # LCP (Largest Contentful Paint)
        if "largest-contentful-paint" in audits:
            lcp_value = audits["largest-contentful-paint"].get("numericValue")
            if lcp_value:
                metrics["LCP"] = lcp_value / 1000  # Convert ms to seconds

        # INP (Interaction to Next Paint)
        if "interaction-to-next-paint" in audits:
            inp_value = audits["interaction-to-next-paint"].get("numericValue")
            if inp_value:
                metrics["INP"] = inp_value / 1000  # Convert ms to seconds

        # CLS (Cumulative Layout Shift)
        if "cumulative-layout-shift" in audits:
            cls_value = audits["cumulative-layout-shift"].get("numericValue")
            if cls_value is not None:
                metrics["CLS"] = cls_value

        # TTFB (Time to First Byte)
        if "server-response-time" in audits:
            ttfb_value = audits["server-response-time"].get("numericValue")
            if ttfb_value:
                metrics["TTFB"] = ttfb_value / 1000  # Convert ms to seconds

        return metrics
    except Exception as e:
        print(f"Error extracting metrics: {e}")
        return None

def check_metrics_against_targets(metrics):
    """Check which metrics exceed targets and flag critical issues"""
    if not metrics:
        return None

    failures = []

    if metrics["LCP"] and metrics["LCP"] > TARGETS["LCP"]:
        failures.append(f"LCP ({metrics['LCP']:.2f}s > {TARGETS['LCP']}s)")

    if metrics["INP"] and metrics["INP"] > TARGETS["INP"]:
        failures.append(f"INP ({metrics['INP']:.3f}s > {TARGETS['INP']}s)")

    if metrics["CLS"] is not None and metrics["CLS"] > TARGETS["CLS"]:
        failures.append(f"CLS ({metrics['CLS']:.3f} > {TARGETS['CLS']})")

    if metrics["TTFB"] and metrics["TTFB"] > TARGETS["TTFB"]:
        failures.append(f"TTFB ({metrics['TTFB']:.2f}s > {TARGETS['TTFB']}s)")

    is_critical = (metrics["performance_score"] < TARGETS["Performance"]) or len(failures) > 0

    return {
        "is_critical": is_critical,
        "failures": failures
    }

def run_audit():
    """Run the complete audit"""
    print("Starting Core Web Vitals Audit for crazybowlsandwraps.com")
    print("=" * 70)

    pages = parse_input_file()
    print(f"Found {len(pages)} unique pages to audit")

    results = []
    total_requests = len(pages) * 2  # mobile + desktop
    completed_requests = 0

    for idx, page in enumerate(pages, 1):
        full_url = urljoin(BASE_URL, page["path"])
        print(f"\n[{idx}/{len(pages)}] Auditing: {page['path']}")
        print(f"  Sessions: {page['sessions']}, Bounce Rate: {page['bounce_rate']:.1%}")

        page_result = {
            "path": page["path"],
            "full_url": full_url,
            "sessions": page["sessions"],
            "engagement_rate": page["engagement_rate"],
            "bounce_rate": page["bounce_rate"],
            "mobile": None,
            "desktop": None
        }

        # Mobile strategy
        print("  Calling PSI API (mobile)...", end=" ", flush=True)
        psi_response = call_psi_api(full_url, "mobile")
        completed_requests += 1

        if "error" in psi_response:
            print(f"ERROR: {psi_response['error']}")
        else:
            metrics = extract_cwv_metrics(psi_response, "mobile")
            if metrics:
                check = check_metrics_against_targets(metrics)
                page_result["mobile"] = {**metrics, **check}
                print(f"OK (Score: {metrics['performance_score']:.0f})")
            else:
                print("ERROR: Could not extract metrics")

        time.sleep(RATE_LIMIT_DELAY)

        # Desktop strategy
        print("  Calling PSI API (desktop)...", end=" ", flush=True)
        psi_response = call_psi_api(full_url, "desktop")
        completed_requests += 1

        if "error" in psi_response:
            print(f"ERROR: {psi_response['error']}")
        else:
            metrics = extract_cwv_metrics(psi_response, "desktop")
            if metrics:
                check = check_metrics_against_targets(metrics)
                page_result["desktop"] = {**metrics, **check}
                print(f"OK (Score: {metrics['performance_score']:.0f})")
            else:
                print("ERROR: Could not extract metrics")

        time.sleep(RATE_LIMIT_DELAY)
        results.append(page_result)

        print(f"  Progress: {completed_requests}/{total_requests} API calls")

    return results

def generate_report(results):
    """Generate the audit report"""

    # Calculate summary statistics
    mobile_scores = [r["mobile"]["performance_score"] for r in results if r["mobile"]]
    desktop_scores = [r["desktop"]["performance_score"] for r in results if r["desktop"]]
    avg_mobile = sum(mobile_scores) / len(mobile_scores) if mobile_scores else 0
    avg_desktop = sum(desktop_scores) / len(desktop_scores) if desktop_scores else 0

    # Find critical and priority pages
    critical_pages = []
    priority_1_pages = []

    for result in results:
        mobile = result["mobile"]
        desktop = result["desktop"]
        bounce_rate = result["bounce_rate"]

        mobile_critical = mobile and mobile.get("is_critical", False) if mobile else False
        desktop_critical = desktop and desktop.get("is_critical", False) if desktop else False

        if mobile_critical or desktop_critical:
            critical_pages.append(result)

        # Priority 1: slow + high bounce rate
        if bounce_rate > 0.5 and (mobile_critical or desktop_critical):
            priority_1_pages.append(result)

    # Build markdown report
    report = []
    report.append("# Core Web Vitals Audit — Crazybowls.com\n")

    # Executive Summary
    report.append("## Executive Summary\n")
    report.append(f"- **Pages audited:** {len(results)} (mobile + desktop = {len(results)*2} total runs)")
    report.append(f"- **Critical pages** (score < 50 OR metric failure): {len(critical_pages)}")
    report.append(f"- **Priority 1 pages** (slow + high bounce > 50%): {len(priority_1_pages)}")
    report.append(f"- **Average performance score (mobile):** {avg_mobile:.1f}/100")
    report.append(f"- **Average performance score (desktop):** {avg_desktop:.1f}/100")
    report.append(f"- **Audit Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}\n")

    # Performance Summary Table
    report.append("## Performance Summary (sorted by mobile score descending)\n")
    report.append("| Page URL | Sessions | Bounce Rate | Mobile Score | Desktop Score | Mobile Bottleneck | Desktop Bottleneck |")
    report.append("|----------|----------|-------------|--------------|----------------|-------------------|--------------------|")

    sorted_results = sorted(results, key=lambda r: r["mobile"]["performance_score"] if r["mobile"] else 0, reverse=True)

    for result in sorted_results:
        path = result["path"]
        sessions = result["sessions"]
        bounce = f"{result['bounce_rate']:.1%}"

        mobile = result["mobile"]
        desktop = result["desktop"]

        mobile_score = f"{mobile['performance_score']:.0f}" if mobile else "N/A"
        desktop_score = f"{desktop['performance_score']:.0f}" if desktop else "N/A"

        mobile_bottleneck = ", ".join(mobile["failures"][:1]) if mobile and mobile["failures"] else "—"
        desktop_bottleneck = ", ".join(desktop["failures"][:1]) if desktop and desktop["failures"] else "—"

        report.append(f"| `{path}` | {sessions} | {bounce} | {mobile_score} | {desktop_score} | {mobile_bottleneck} | {desktop_bottleneck} |")

    report.append("")

    # Critical Pages Section
    if critical_pages:
        report.append("## Critical Pages (Score < 50 or Metric Failures)\n")
        for result in sorted(critical_pages, key=lambda r: r["mobile"]["performance_score"] if r["mobile"] else 0):
            report.append(f"### {result['path']}")
            report.append(f"- **GA4 Sessions:** {result['sessions']}")
            report.append(f"- **Bounce Rate:** {result['bounce_rate']:.1%}")
            report.append(f"- **Engagement Rate:** {result['engagement_rate']:.1%}\n")

            if result["mobile"]:
                report.append(f"**Mobile (Score: {result['mobile']['performance_score']:.0f})**")
                report.append(f"- LCP: {result['mobile']['LCP']:.2f}s (target < 2.5s)" if result['mobile']['LCP'] else "- LCP: N/A")
                report.append(f"- INP: {result['mobile']['INP']:.3f}s (target < 0.2s)" if result['mobile']['INP'] else "- INP: N/A")
                report.append(f"- CLS: {result['mobile']['CLS']:.3f} (target < 0.1)" if result['mobile']['CLS'] is not None else "- CLS: N/A")
                report.append(f"- TTFB: {result['mobile']['TTFB']:.2f}s (target < 0.8s)" if result['mobile']['TTFB'] else "- TTFB: N/A")
                if result["mobile"]["failures"]:
                    report.append(f"- **Failures:** {', '.join(result['mobile']['failures'])}")
                report.append("")

            if result["desktop"]:
                report.append(f"**Desktop (Score: {result['desktop']['performance_score']:.0f})**")
                report.append(f"- LCP: {result['desktop']['LCP']:.2f}s (target < 2.5s)" if result['desktop']['LCP'] else "- LCP: N/A")
                report.append(f"- INP: {result['desktop']['INP']:.3f}s (target < 0.2s)" if result['desktop']['INP'] else "- INP: N/A")
                report.append(f"- CLS: {result['desktop']['CLS']:.3f} (target < 0.1)" if result['desktop']['CLS'] is not None else "- CLS: N/A")
                report.append(f"- TTFB: {result['desktop']['TTFB']:.2f}s (target < 0.8s)" if result['desktop']['TTFB'] else "- TTFB: N/A")
                if result["desktop"]["failures"]:
                    report.append(f"- **Failures:** {', '.join(result['desktop']['failures'])}")
                report.append("")
    else:
        report.append("## Critical Pages\n")
        report.append("No critical pages found.\n")

    # Priority 1 Pages
    if priority_1_pages:
        report.append("## Priority 1: Slow Pages with High Bounce Rate (>50%)\n")
        report.append("These pages have performance issues AND high bounce rates, representing both UX and conversion risk.\n")
        for result in priority_1_pages:
            report.append(f"### {result['path']}")
            report.append(f"- **GA4 Sessions:** {result['sessions']}")
            report.append(f"- **Bounce Rate:** {result['bounce_rate']:.1%} ⚠️")
            report.append(f"- **Engagement Rate:** {result['engagement_rate']:.1%}\n")

            if result["mobile"] and result["mobile"]["failures"]:
                report.append(f"**Mobile Issues:** {', '.join(result['mobile']['failures'])}")
            if result["desktop"] and result["desktop"]["failures"]:
                report.append(f"**Desktop Issues:** {', '.join(result['desktop']['failures'])}")
            report.append("")
    else:
        report.append("## Priority 1: Slow Pages with High Bounce Rate\n")
        report.append("No Priority 1 pages found.\n")

    # Metrics Distribution
    report.append("## Metrics Breakdown\n")

    # LCP Distribution
    report.append("### LCP (Largest Contentful Paint) Distribution\n")
    lcp_mobile = [r["mobile"]["LCP"] for r in results if r["mobile"] and r["mobile"]["LCP"]]
    lcp_desktop = [r["desktop"]["LCP"] for r in results if r["desktop"] and r["desktop"]["LCP"]]

    if lcp_mobile:
        report.append(f"**Mobile LCP:**")
        report.append(f"- Average: {sum(lcp_mobile) / len(lcp_mobile):.2f}s")
        report.append(f"- Min: {min(lcp_mobile):.2f}s")
        report.append(f"- Max: {max(lcp_mobile):.2f}s")
        report.append(f"- Pages exceeding 2.5s target: {sum(1 for x in lcp_mobile if x > 2.5)}/{len(lcp_mobile)}")
        report.append("")

    if lcp_desktop:
        report.append(f"**Desktop LCP:**")
        report.append(f"- Average: {sum(lcp_desktop) / len(lcp_desktop):.2f}s")
        report.append(f"- Min: {min(lcp_desktop):.2f}s")
        report.append(f"- Max: {max(lcp_desktop):.2f}s")
        report.append(f"- Pages exceeding 2.5s target: {sum(1 for x in lcp_desktop if x > 2.5)}/{len(lcp_desktop)}")
        report.append("")

    # INP Distribution
    report.append("### INP (Interaction to Next Paint) Distribution\n")
    inp_mobile = [r["mobile"]["INP"] for r in results if r["mobile"] and r["mobile"]["INP"]]
    inp_desktop = [r["desktop"]["INP"] for r in results if r["desktop"] and r["desktop"]["INP"]]

    if inp_mobile:
        report.append(f"**Mobile INP:**")
        report.append(f"- Average: {sum(inp_mobile) / len(inp_mobile):.3f}s")
        report.append(f"- Min: {min(inp_mobile):.3f}s")
        report.append(f"- Max: {max(inp_mobile):.3f}s")
        report.append(f"- Pages exceeding 0.2s target: {sum(1 for x in inp_mobile if x > 0.2)}/{len(inp_mobile)}")
        report.append("")

    if inp_desktop:
        report.append(f"**Desktop INP:**")
        report.append(f"- Average: {sum(inp_desktop) / len(inp_desktop):.3f}s")
        report.append(f"- Min: {min(inp_desktop):.3f}s")
        report.append(f"- Max: {max(inp_desktop):.3f}s")
        report.append(f"- Pages exceeding 0.2s target: {sum(1 for x in inp_desktop if x > 0.2)}/{len(inp_desktop)}")
        report.append("")

    # CLS Distribution
    report.append("### CLS (Cumulative Layout Shift) Distribution\n")
    cls_mobile = [r["mobile"]["CLS"] for r in results if r["mobile"] and r["mobile"]["CLS"] is not None]
    cls_desktop = [r["desktop"]["CLS"] for r in results if r["desktop"] and r["desktop"]["CLS"] is not None]

    if cls_mobile:
        report.append(f"**Mobile CLS:**")
        report.append(f"- Average: {sum(cls_mobile) / len(cls_mobile):.3f}")
        report.append(f"- Min: {min(cls_mobile):.3f}")
        report.append(f"- Max: {max(cls_mobile):.3f}")
        report.append(f"- Pages exceeding 0.1 target: {sum(1 for x in cls_mobile if x > 0.1)}/{len(cls_mobile)}")
        report.append("")

    if cls_desktop:
        report.append(f"**Desktop CLS:**")
        report.append(f"- Average: {sum(cls_desktop) / len(cls_desktop):.3f}")
        report.append(f"- Min: {min(cls_desktop):.3f}")
        report.append(f"- Max: {max(cls_desktop):.3f}")
        report.append(f"- Pages exceeding 0.1 target: {sum(1 for x in cls_desktop if x > 0.1)}/{len(cls_desktop)}")
        report.append("")

    # TTFB Distribution
    report.append("### TTFB (Time to First Byte) Distribution\n")
    ttfb_mobile = [r["mobile"]["TTFB"] for r in results if r["mobile"] and r["mobile"]["TTFB"]]
    ttfb_desktop = [r["desktop"]["TTFB"] for r in results if r["desktop"] and r["desktop"]["TTFB"]]

    if ttfb_mobile:
        report.append(f"**Mobile TTFB:**")
        report.append(f"- Average: {sum(ttfb_mobile) / len(ttfb_mobile):.2f}s")
        report.append(f"- Min: {min(ttfb_mobile):.2f}s")
        report.append(f"- Max: {max(ttfb_mobile):.2f}s")
        report.append(f"- Pages exceeding 0.8s target: {sum(1 for x in ttfb_mobile if x > 0.8)}/{len(ttfb_mobile)}")
        report.append("")

    if ttfb_desktop:
        report.append(f"**Desktop TTFB:**")
        report.append(f"- Average: {sum(ttfb_desktop) / len(ttfb_desktop):.2f}s")
        report.append(f"- Min: {min(ttfb_desktop):.2f}s")
        report.append(f"- Max: {max(ttfb_desktop):.2f}s")
        report.append(f"- Pages exceeding 0.8s target: {sum(1 for x in ttfb_desktop if x > 0.8)}/{len(ttfb_desktop)}")
        report.append("")

    # Recommendations
    report.append("## Recommendations\n")
    report.append("### Category 1: Image Optimization (LCP Focus)\n")
    report.append("If LCP is the primary bottleneck:\n")
    report.append("1. Optimize hero images and above-the-fold images")
    report.append("2. Use WebP format with JPEG/PNG fallback")
    report.append("3. Implement responsive image sizes")
    report.append("4. Consider lazy loading for below-the-fold images")
    report.append("5. Use a CDN for image delivery")
    report.append("")

    report.append("### Category 2: JavaScript Performance (INP Focus)\n")
    report.append("If INP is the primary bottleneck:\n")
    report.append("1. Code split and defer non-critical JavaScript")
    report.append("2. Minify and compress JavaScript bundles")
    report.append("3. Remove unused dependencies")
    report.append("4. Monitor long tasks in DevTools")
    report.append("5. Use Web Workers for heavy computations")
    report.append("")

    report.append("### Category 3: Layout Stability (CLS Focus)\n")
    report.append("If CLS is the primary bottleneck:\n")
    report.append("1. Set explicit dimensions on images and videos")
    report.append("2. Avoid inserting content above existing content")
    report.append("3. Use transform/opacity animations instead of layout changes")
    report.append("4. Be cautious with dynamic font loading")
    report.append("5. Test on real devices with slower network")
    report.append("")

    report.append("### Category 4: Server Response (TTFB Focus)\n")
    report.append("If TTFB is the primary bottleneck:\n")
    report.append("1. Enable gzip/brotli compression")
    report.append("2. Optimize database queries")
    report.append("3. Use caching (browser, CDN, application level)")
    report.append("4. Enable HTTP/2 or HTTP/3")
    report.append("5. Consider a content delivery network (CDN)")
    report.append("")

    report.append("### Category 5: High Bounce Rate Pages\n")
    report.append("These pages should be prioritized:\n")
    for result in priority_1_pages:
        report.append(f"- **{result['path']}** (bounce: {result['bounce_rate']:.1%}, sessions: {result['sessions']})")
    report.append("")

    report.append("---\n")
    report.append("*Report generated by Phase 4: Core Web Vitals Audit*\n")

    return "\n".join(report)

def generate_fallback_report():
    """Generate report when PSI API is not accessible"""
    pages = parse_input_file()

    # Identify high bounce rate pages (Priority 1 candidates)
    priority_1_pages = [p for p in pages if p["bounce_rate"] > 0.5]
    priority_1_pages = sorted(priority_1_pages, key=lambda x: x["sessions"], reverse=True)

    report = []
    report.append("# Core Web Vitals Audit — Crazybowls.com\n")

    report.append("## CRITICAL NOTICE: API Access Issue\n")
    report.append("⚠️ **The PageSpeed Insights API requires a Google API key for reliable access.**\n")
    report.append("The free tier without authentication has extremely strict rate limits (429 errors after 1-2 requests).\n\n")

    report.append("**To complete this audit, you must:**\n")
    report.append("1. Visit: https://console.cloud.google.com/apis/credentials\n")
    report.append("2. Create a new API project\n")
    report.append("3. Enable the PageSpeed Insights API\n")
    report.append("4. Generate an API key (or OAuth 2.0 credentials)\n")
    report.append("5. Re-run the audit with the key:\n")
    report.append("   ```bash\n")
    report.append("   PSI_API_KEY=your_key python3 audit/cwv_audit.py\n")
    report.append("   ```\n\n")

    report.append("Alternatively, use the Chrome DevTools Lighthouse tab to audit individual pages manually.\n\n")

    report.append("---\n\n")

    report.append("## Preliminary Analysis: High Bounce Rate Pages (Without CWV Metrics)\n\n")

    report.append("### Priority 1: Pages with High Bounce Rate (>50%) - IMMEDIATE ATTENTION NEEDED\n\n")
    report.append("These pages have user experience issues indicated by high bounce rates. Performance optimization should be prioritized.\n\n")

    report.append("| Page URL | Sessions | Bounce Rate | Status |\n")
    report.append("|----------|----------|-------------|--------|\n")

    for page in priority_1_pages:
        report.append(f"| `{page['path']}` | {page['sessions']} | {page['bounce_rate']:.1%} | ⚠️ Needs audit |\n")

    report.append("\n")
    report.append("### Bounce Rate Analysis\n\n")

    avg_bounce = sum(p["bounce_rate"] for p in pages) / len(pages)
    high_bounce_count = len([p for p in pages if p["bounce_rate"] > 0.5])

    report.append(f"- **Average bounce rate across all pages:** {avg_bounce:.1%}\n")
    report.append(f"- **Pages with bounce rate > 50%:** {high_bounce_count}/{len(pages)}\n")
    report.append(f"- **Worst performing page:** {priority_1_pages[0]['path'] if priority_1_pages else 'N/A'} ({priority_1_pages[0]['bounce_rate']:.1%} bounce rate)\n\n")

    report.append("### Manual Audit Instructions\n\n")
    report.append("Until the API key is configured, you can audit individual pages using Chrome DevTools:\n\n")
    report.append("1. Open the page in Chrome\n")
    report.append("2. Press F12 or Ctrl+Shift+I to open DevTools\n")
    report.append("3. Click the Lighthouse tab\n")
    report.append("4. Select Mobile + Desktop\n")
    report.append("5. Click \"Analyze page load\"\n")
    report.append("6. Note the metrics:\n")
    report.append("   - LCP (Largest Contentful Paint) - target < 2.5s\n")
    report.append("   - INP (Interaction to Next Paint) - target < 200ms\n")
    report.append("   - CLS (Cumulative Layout Shift) - target < 0.1\n")
    report.append("   - TTFB (Time to First Byte) - target < 800ms\n")
    report.append("   - Performance Score - target > 50\n\n")

    report.append("### Recommendations Based on Bounce Rate Data\n\n")

    report.append("**High bounce rate pages likely suffer from:**\n")
    report.append("1. Slow page load times (LCP issues)\n")
    report.append("2. Poor interactivity (INP issues)\n")
    report.append("3. Visual instability (CLS issues)\n")
    report.append("4. Slow server response (TTFB issues)\n\n")

    report.append("**Immediate actions:**\n")
    report.append("1. **Get API key and re-run audit** - This is the highest priority\n")
    report.append("2. Manually audit top 5 high-bounce pages using Chrome DevTools Lighthouse\n")
    report.append("3. Focus on:\n")
    report.append("   - Image optimization (affects LCP)\n")
    report.append("   - JavaScript performance (affects INP)\n")
    report.append("   - Layout stability (affects CLS)\n")
    report.append("   - Server response time (affects TTFB)\n\n")

    report.append("### Pages to Manual Audit (Sorted by Priority)\n\n")
    for idx, page in enumerate(priority_1_pages[:10], 1):
        report.append(f"{idx}. `{page['path']}` - {page['sessions']} sessions, {page['bounce_rate']:.1%} bounce rate\n")

    report.append("\n---\n")
    report.append("*Report generated: Phase 4 - Core Web Vitals Audit (API Access Issue)*\n")
    report.append(f"*Audit Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}*\n")

    return "\n".join(report)

if __name__ == "__main__":
    # Check if we have valid results
    print("Starting Core Web Vitals Audit for crazybowlsandwraps.com")
    print("=" * 70)

    results = run_audit()

    # Check if any results were successful
    successful_results = [r for r in results if r["mobile"] or r["desktop"]]

    if not successful_results:
        print("\n⚠️ PageSpeed Insights API rate limit exceeded.")
        print("Falling back to high bounce rate analysis...")

        report = generate_fallback_report()
    else:
        print(f"\nSuccessfully audited {len(successful_results)} pages")
        report = generate_report(results)

        # Save raw results as JSON for reference
        json_output = "/Users/ellebrayton/Crazy Bowls and Wraps/audit/reports/cwv_results.json"
        with open(json_output, "w") as f:
            json.dump(results, f, indent=2)
        print(f"Raw results saved to: {json_output}")

    # Save markdown report
    report_output = "/Users/ellebrayton/Crazy Bowls and Wraps/audit/reports/cwv.md"
    with open(report_output, "w") as f:
        f.write(report)
    print(f"Report saved to: {report_output}")

    print("\nAudit complete!")
