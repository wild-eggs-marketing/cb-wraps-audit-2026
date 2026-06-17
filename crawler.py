#!/usr/bin/env python3
"""
Phase 2: Website Crawler for crazybowlsandwraps.com
Crawls site structure, extracts metadata, builds link graph.
"""

import json
import csv
import sys
import time
import re
from urllib.parse import urljoin, urlparse
from datetime import datetime
import logging

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from urllib.robotparser import RobotFileParser
from bs4 import BeautifulSoup
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
DOMAIN = "crazybowlsandwraps.com"
BASE_URL = f"https://{DOMAIN}"
OUTPUT_DIR = Path("/Users/ellebrayton/Crazy Bowls and Wraps/audit/crawl")
DATA_DIR = Path("/Users/ellebrayton/Crazy Bowls and Wraps/audit/data")
GA4_FILE = DATA_DIR / "ga4_landing_pages.json"

TIMEOUT = 30
MAX_DEPTH = 5
MAX_PAGES = 5000
DELAY_BETWEEN_REQUESTS = 0.3  # seconds

# Session setup with retries
def create_session():
    session = requests.Session()
    retry = Retry(
        total=2,
        backoff_factor=0.5,
        status_forcelist=(500, 502, 504)
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    return session


class SitemapFetcher:
    """Fetch URLs from sitemap.xml"""

    def __init__(self, base_url, session):
        self.base_url = base_url
        self.session = session
        self.urls = set()

    def fetch(self):
        """Get URLs from sitemap"""
        urls = set()

        # Try WP sitemap first
        sitemap_paths = ['/wp-sitemap.xml', '/sitemap.xml', '/sitemap_index.xml']

        for sitemap_path in sitemap_paths:
            try:
                url = self.base_url + sitemap_path
                logger.info(f"Attempting to fetch {url}")
                resp = self.session.get(url, timeout=15)
                if resp.status_code == 200:
                    logger.info(f"Successfully fetched {sitemap_path}")
                    found = self._extract_urls_from_content(resp.content)
                    logger.info(f"Found {len(found)} initial URLs")
                    urls.update(found)

                    # Check if this is an index (has <sitemap> tags)
                    if '<sitemap>' in resp.text or 'wp-sitemap-' in resp.text:
                        child_urls = self._fetch_child_sitemaps(resp.content)
                        logger.info(f"Found {len(child_urls)} URLs from {len(child_urls)} child sitemaps")
                        urls.update(child_urls)

                    if urls:
                        break
            except Exception as e:
                logger.warning(f"Could not fetch {sitemap_path}: {e}")

        return urls

    def _extract_urls_from_content(self, content):
        """Extract all URLs from XML content"""
        urls = set()
        try:
            soup = BeautifulSoup(content, 'xml')

            # Find all <url> tags with <loc> children (actual URLs, not sitemap references)
            for url_tag in soup.find_all('url'):
                loc_tag = url_tag.find('loc')
                if loc_tag:
                    text = loc_tag.text.strip()
                    if text.startswith('http') and self.base_url.split('//')[1] in text:
                        urls.add(text)
        except Exception as e:
            logger.error(f"Error parsing sitemap content: {e}")

        return urls

    def _fetch_child_sitemaps(self, index_content):
        """Fetch URLs from child sitemaps referenced in sitemap index"""
        all_urls = set()
        try:
            soup = BeautifulSoup(index_content, 'xml')

            # Find all sitemap <loc> tags
            sitemap_locs = []
            for sitemap in soup.find_all('sitemap'):
                loc_tag = sitemap.find('loc')
                if loc_tag:
                    sitemap_locs.append(loc_tag.text.strip())

            logger.info(f"Found {len(sitemap_locs)} child sitemaps to fetch")

            for sitemap_url in sitemap_locs[:20]:  # Limit to avoid too many requests
                try:
                    resp = self.session.get(sitemap_url, timeout=15)
                    if resp.status_code == 200:
                        urls = self._extract_urls_from_content(resp.content)
                        all_urls.update(urls)
                        logger.info(f"Fetched {sitemap_url}: found {len(urls)} URLs")
                except Exception as e:
                    logger.warning(f"Could not fetch {sitemap_url}: {e}")
        except Exception as e:
            logger.error(f"Error processing child sitemaps: {e}")

        return all_urls


class RobotsChecker:
    """Check robots.txt"""

    def __init__(self, base_url, session):
        self.base_url = base_url
        self.parser = RobotFileParser()
        self.parser.set_url(base_url + '/robots.txt')
        self.disallowed_paths = []
        try:
            self.parser.read()
            logger.info("robots.txt loaded")
            # Extract disallowed patterns for User-agent: *
            if '*' in self.parser.entries:
                self.disallowed_paths = [rule.path for rule in self.parser.entries['*'] if not rule.allow]
        except Exception as e:
            logger.warning(f"Could not read robots.txt: {e}")

    def can_fetch(self, url):
        """Check if URL can be fetched"""
        try:
            # Parse URL to get path
            parsed = urlparse(url)
            path = parsed.path

            # Check disallowed patterns
            for disallowed in self.disallowed_paths:
                if path.startswith(disallowed):
                    return False
            return True
        except:
            return True


class PageAnalyzer:
    """Analyze page content"""

    @staticmethod
    def extract_title(soup):
        tag = soup.find('title')
        return tag.text.strip() if tag else ''

    @staticmethod
    def extract_meta_description(soup):
        tag = soup.find('meta', attrs={'name': 'description'})
        return tag.get('content', '') if tag else ''

    @staticmethod
    def extract_canonical(soup):
        tag = soup.find('link', attrs={'rel': 'canonical'})
        return tag.get('href', '') if tag else ''

    @staticmethod
    def extract_h1s(soup):
        h1s = soup.find_all('h1')
        return len(h1s), [h1.get_text(strip=True) for h1 in h1s]

    @staticmethod
    def extract_word_count(soup):
        """Extract main content word count (excluding script, style, nav, footer)"""
        for tag in soup(['script', 'style', 'nav', 'footer']):
            tag.decompose()
        text = soup.get_text(separator=' ')
        words = text.split()
        return len(words)

    @staticmethod
    def extract_images(soup):
        """Get image alt text coverage"""
        images = soup.find_all('img')
        with_alt = sum(1 for img in images if img.get('alt'))
        return len(images), with_alt

    @staticmethod
    def extract_internal_links(url, soup, base_url, domain):
        """Extract internal links"""
        internal_links = set()

        for link in soup.find_all('a', href=True):
            href = link['href'].strip()
            if not href or href.startswith('#'):
                continue

            # Resolve relative URLs
            try:
                absolute_url = urljoin(url, href)
                parsed = urlparse(absolute_url)

                if parsed.netloc.endswith(domain):
                    # Remove fragment and query params for this analysis
                    clean_url = absolute_url.split('#')[0]
                    if clean_url:
                        internal_links.add(clean_url)
            except:
                pass

        return len(internal_links), internal_links

    @staticmethod
    def extract_og_tags(soup):
        """Extract Open Graph tags"""
        og = {}
        for tag in soup.find_all('meta', attrs={'property': re.compile('^og:')}):
            prop = tag.get('property', '').replace('og:', '')
            content = tag.get('content', '')
            og[prop] = content
        return og

    @staticmethod
    def extract_json_ld(soup):
        """Extract JSON-LD blocks"""
        scripts = soup.find_all('script', attrs={'type': 'application/ld+json'})
        schemas = []
        for script in scripts:
            try:
                data = json.loads(script.string)
                schema_type = data.get('@type', 'Unknown')
                schemas.append(schema_type)
            except:
                pass
        return len(schemas), schemas

    @staticmethod
    def analyze(url, html_content, base_url, domain):
        """Full page analysis"""
        soup = BeautifulSoup(html_content, 'html.parser')

        h1_count, h1s = PageAnalyzer.extract_h1s(soup)
        word_count = PageAnalyzer.extract_word_count(soup)
        img_total, img_with_alt = PageAnalyzer.extract_images(soup)
        internal_count, internal_links = PageAnalyzer.extract_internal_links(
            url, soup, base_url, domain
        )
        jsonld_count, jsonld_types = PageAnalyzer.extract_json_ld(soup)
        og_tags = PageAnalyzer.extract_og_tags(soup)

        return {
            'title': PageAnalyzer.extract_title(soup),
            'meta_description': PageAnalyzer.extract_meta_description(soup),
            'canonical': PageAnalyzer.extract_canonical(soup),
            'h1_count': h1_count,
            'h1_text': ' | '.join(h1s[:5]),  # First 5 H1s
            'word_count': word_count,
            'images_total': img_total,
            'images_with_alt': img_with_alt,
            'internal_links_count': internal_count,
            'internal_links': internal_links,
            'jsonld_count': jsonld_count,
            'jsonld_types': jsonld_types,
            'og_title': og_tags.get('title', ''),
            'og_description': og_tags.get('description', ''),
            'og_image': og_tags.get('image', ''),
        }


class WebCrawler:
    """Main crawler"""

    def __init__(self, base_url, output_dir):
        self.base_url = base_url
        self.domain = urlparse(base_url).netloc
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.session = create_session()
        self.robots_checker = RobotsChecker(base_url, self.session)

        self.visited = set()
        self.to_visit = []
        self.pages = []
        self.link_graph = {'nodes': set(), 'edges': []}
        self.ga4_data = self._load_ga4_data()

    def _load_ga4_data(self):
        """Load GA4 data if available"""
        if GA4_FILE.exists():
            try:
                with open(GA4_FILE) as f:
                    data = json.load(f)
                    logger.info(f"Loaded GA4 data for {len(data)} pages")
                    return {item['page']: item for item in data}
            except Exception as e:
                logger.warning(f"Could not load GA4 data: {e}")
        return {}

    def start(self):
        """Start crawl from sitemap"""
        logger.info(f"Starting crawl of {self.base_url}")

        # Fetch from sitemap
        fetcher = SitemapFetcher(self.base_url, self.session)
        sitemap_urls = fetcher.fetch()

        if sitemap_urls:
            self.to_visit = list(sitemap_urls)
            logger.info(f"Starting with {len(self.to_visit)} URLs from sitemap")
        else:
            logger.warning("No sitemap found, starting from homepage")
            self.to_visit = [self.base_url]

        self._crawl()
        self._save_results()

    def _crawl(self):
        """Crawl pages"""
        start_time = time.time()

        while self.to_visit and len(self.visited) < MAX_PAGES:
            url = self.to_visit.pop(0)

            if url in self.visited or not self._is_same_domain(url):
                continue

            if not self.robots_checker.can_fetch(url):
                logger.debug(f"Blocked by robots.txt: {url}")
                continue

            self.visited.add(url)

            if len(self.visited) % 5 == 0:
                elapsed = time.time() - start_time
                rate = len(self.visited) / elapsed if elapsed > 0 else 0
                logger.info(f"Progress: {len(self.visited)} pages ({rate:.1f} p/s, queue: {len(self.to_visit)})")

            try:
                page_data = self._fetch_and_analyze(url)
                self.pages.append(page_data)

                # Add internal links to queue
                for link in page_data.get('internal_links', set()):
                    if link not in self.visited and link not in self.to_visit:
                        self.to_visit.append(link)

                # Add to link graph
                self.link_graph['nodes'].add(url)
                for link in page_data.get('internal_links', set()):
                    self.link_graph['nodes'].add(link)
                    self.link_graph['edges'].append({'from': url, 'to': link})

                time.sleep(DELAY_BETWEEN_REQUESTS)

            except Exception as e:
                logger.error(f"Error crawling {url}: {e}")

        elapsed = time.time() - start_time
        logger.info(f"Crawl complete: {len(self.visited)} pages in {elapsed:.1f}s")

    def _is_same_domain(self, url):
        """Check if URL is on same domain"""
        try:
            parsed = urlparse(url)
            return parsed.netloc.endswith(self.domain)
        except:
            return False

    def _fetch_and_analyze(self, url):
        """Fetch URL and extract data"""
        try:
            start = time.time()

            # Try regular request
            resp = self.session.get(url, timeout=TIMEOUT, allow_redirects=True)
            load_time = (time.time() - start) * 1000

            # Get final URL (after redirects)
            final_url = resp.url
            status_code = resp.status_code

            # Check content type
            content_type = resp.headers.get('content-type', '')
            if 'text/html' not in content_type:
                return self._minimal_page_data(url, status_code, load_time)

            # Analyze HTML
            analysis = PageAnalyzer.analyze(
                final_url, resp.text, self.base_url, self.domain
            )

            page_data = {
                'url': url,
                'final_url': final_url,
                'status_code': status_code,
                'load_time_ms': int(load_time),
                'title': analysis['title'],
                'meta_description': analysis['meta_description'],
                'canonical': analysis['canonical'],
                'h1_count': analysis['h1_count'],
                'h1_text': analysis['h1_text'],
                'word_count': analysis['word_count'],
                'images_total': analysis['images_total'],
                'images_with_alt': analysis['images_with_alt'],
                'internal_links_count': analysis['internal_links_count'],
                'internal_links': analysis['internal_links'],
                'jsonld_count': analysis['jsonld_count'],
                'jsonld_types': '|'.join(analysis['jsonld_types']),
                'og_title': analysis['og_title'],
                'og_description': analysis['og_description'],
                'og_image': analysis['og_image'],
                'ga4_sessions': '',
                'ga4_engagement_rate': '',
                'ga4_bounce_rate': '',
            }

            # Cross-reference with GA4
            if url in self.ga4_data:
                ga4_entry = self.ga4_data[url]
                page_data['ga4_sessions'] = ga4_entry.get('sessions', '')
                page_data['ga4_engagement_rate'] = ga4_entry.get('engagement_rate', '')
                page_data['ga4_bounce_rate'] = ga4_entry.get('bounce_rate', '')

            return page_data

        except requests.Timeout:
            logger.warning(f"Timeout: {url}")
            return self._minimal_page_data(url, 'timeout', 0)
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return self._minimal_page_data(url, 'error', 0)

    def _minimal_page_data(self, url, status, load_time):
        """Create minimal page data for errors"""
        return {
            'url': url,
            'final_url': url,
            'status_code': status,
            'load_time_ms': int(load_time),
            'title': '',
            'meta_description': '',
            'canonical': '',
            'h1_count': 0,
            'h1_text': '',
            'word_count': 0,
            'images_total': 0,
            'images_with_alt': 0,
            'internal_links_count': 0,
            'internal_links': set(),
            'jsonld_count': 0,
            'jsonld_types': '',
            'og_title': '',
            'og_description': '',
            'og_image': '',
            'ga4_sessions': '',
            'ga4_engagement_rate': '',
            'ga4_bounce_rate': '',
        }

    def _save_results(self):
        """Save crawl results"""
        # CSV output
        csv_file = self.output_dir / 'crawl.csv'
        logger.info(f"Saving CSV to {csv_file}")

        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            fieldnames = [
                'url', 'final_url', 'status_code', 'load_time_ms',
                'title', 'meta_description', 'canonical',
                'h1_count', 'h1_text', 'word_count',
                'images_total', 'images_with_alt',
                'internal_links_count',
                'jsonld_count', 'jsonld_types',
                'og_title', 'og_description', 'og_image',
                'ga4_sessions', 'ga4_engagement_rate', 'ga4_bounce_rate'
            ]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()

            for page in self.pages:
                row = {k: page.get(k, '') for k in fieldnames}
                writer.writerow(row)

        logger.info(f"Saved {len(self.pages)} pages to CSV")

        # Link graph JSON
        graph_file = self.output_dir / 'link-graph.json'
        logger.info(f"Saving link graph to {graph_file}")

        graph_data = {
            'nodes': list(self.link_graph['nodes']),
            'edges': self.link_graph['edges']
        }

        with open(graph_file, 'w', encoding='utf-8') as f:
            json.dump(graph_data, f, indent=2)

        logger.info(f"Saved {len(graph_data['nodes'])} nodes and {len(graph_data['edges'])} edges")

        # Summary stats
        self._save_summary()

    def _save_summary(self):
        """Generate and save summary statistics"""
        summary_file = self.output_dir / 'crawler-summary.txt'

        # Status code distribution
        status_dist = {}
        for page in self.pages:
            status = page['status_code']
            status_dist[status] = status_dist.get(status, 0) + 1

        # Canonical analysis
        canonical_self = 0
        canonical_external = 0
        canonical_missing = 0

        for page in self.pages:
            if not page['canonical']:
                canonical_missing += 1
            elif page['canonical'] == page['url']:
                canonical_self += 1
            else:
                canonical_external += 1

        # Image alt coverage
        total_images = sum(p['images_total'] for p in self.pages)
        images_with_alt = sum(p['images_with_alt'] for p in self.pages)
        alt_coverage = (images_with_alt / total_images * 100) if total_images > 0 else 0

        # JSON-LD coverage
        pages_with_schema = sum(1 for p in self.pages if p['jsonld_count'] > 0)
        schema_coverage = (pages_with_schema / len(self.pages) * 100) if self.pages else 0

        # Compile summary
        summary = f"""
Website Audit: Phase 2 Crawl Summary
=====================================
Date: {datetime.now().isoformat()}
Domain: {self.domain}

CRAWL STATISTICS
================
Total pages crawled: {len(self.pages)}
Total unique URLs discovered: {len(self.link_graph['nodes'])}
Total internal links found: {len(self.link_graph['edges'])}

HTTP STATUS DISTRIBUTION
=========================
"""
        for status in sorted(status_dist.keys(), key=str):
            count = status_dist[status]
            pct = (count / len(self.pages) * 100) if self.pages else 0
            summary += f"{str(status):>12} : {count:>4} pages ({pct:>5.1f}%)\n"

        summary += f"""
CANONICAL TAGS
===============
Self-referential: {canonical_self} pages
External links: {canonical_external} pages
Missing canonical: {canonical_missing} pages

IMAGE ALT TEXT COVERAGE
========================
Total images found: {total_images}
Images with alt text: {images_with_alt}
Coverage: {alt_coverage:.1f}%

STRUCTURED DATA (JSON-LD)
==========================
Pages with schema markup: {pages_with_schema} ({schema_coverage:.1f}%)
Total schema blocks found: {sum(p['jsonld_count'] for p in self.pages)}

PAGE METRICS (averages)
========================
Avg word count: {sum(p['word_count'] for p in self.pages) / len(self.pages) if self.pages else 0:.0f}
Avg H1 tags: {sum(p['h1_count'] for p in self.pages) / len(self.pages) if self.pages else 0:.1f}
Avg load time: {sum(p['load_time_ms'] for p in self.pages) / len(self.pages) if self.pages else 0:.0f}ms

LINK GRAPH STATS
=================
Nodes (unique URLs): {len(self.link_graph['nodes'])}
Edges (internal links): {len(self.link_graph['edges'])}

GA4 CROSS-REFERENCE
====================
Pages matched to GA4 data: {sum(1 for p in self.pages if p['ga4_sessions'])}
Pages with zero traffic: {sum(1 for p in self.pages if not p['ga4_sessions'] and p['status_code'] == 200)}

NOTES
======
- Crawler respects robots.txt (10 second crawl delay)
- Timeout threshold: {TIMEOUT}s
- Request delay: {DELAY_BETWEEN_REQUESTS}s
- Only HTML pages included in analysis
- Crawl started from XML sitemap data
"""

        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write(summary)

        logger.info(f"Summary saved to {summary_file}")
        print(summary)


def main():
    """Run crawler"""
    logger.info("=== Phase 2: Website Crawl ===")
    logger.info(f"Target: {BASE_URL}")
    logger.info(f"Output: {OUTPUT_DIR}")

    crawler = WebCrawler(BASE_URL, OUTPUT_DIR)
    crawler.start()

    logger.info("Phase 2 complete!")


if __name__ == '__main__':
    main()
