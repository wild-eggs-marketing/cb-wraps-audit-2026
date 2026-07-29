"""
Batch-generate per-prospect static HTML landing page context data.

Runs on-trigger (weekly refresh or when new orders arrive).

Step 1 (this script): reads the enriched contact list, outputs one JSON context
file per company describing what should go on that company's landing page.

Step 2 (in Claude Code): read the JSON files and a landing page template,
generate one static HTML file per company. Deploy the folder to Cloudflare Pages.

Result: no runtime API cost on visit. Refresh weekly or on cadence trigger.
"""

import pandas as pd
from pathlib import Path
import json

DATA_PATH = Path('data/ez-cater-orders.csv')
OUTPUT_DIR = Path('output/landing-page-contexts')

def slugify(name):
    return (str(name).lower()
            .replace(' ', '-').replace(',', '')
            .replace('.', '').replace('&', 'and')
            .replace("'", '').replace('/', '-'))

def main():
    df = pd.read_csv(DATA_PATH)
    df['Event Date'] = pd.to_datetime(df['Event Date'])
    df = df[df['Status'].isin(['Completed', 'Food Delivered'])]
    df = df[df['Caterer Name'].str.contains('Wild Eggs', na=False)]
    df = df[~df['Location'].astype(str).str.startswith('Takeout from')]

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for company in df['Location'].unique():
        orders = df[df['Location'] == company].sort_values('Event Date')
        last_order = orders['Event Date'].max()
        order_count = len(orders)
        avg_food_total = orders['Food Total'].mean()
        closest_store = str(orders['Store Name'].mode().iloc[0]) if len(orders['Store Name'].mode()) > 0 else 'CBW'

        context = {
            'company': company,
            'slug': slugify(company),
            'order_count': int(order_count),
            'last_order_date': last_order.strftime('%B %Y'),
            'avg_order_total': f"${avg_food_total:,.0f}",
            'closest_store': closest_store,
        }

        with (OUTPUT_DIR / f"{context['slug']}.json").open('w') as f:
            json.dump(context, f, indent=2)

    print(f"Wrote {len(df['Location'].unique())} context files to {OUTPUT_DIR}")
    print("Next: point Claude Code at these JSONs with a landing page template prompt.")

if __name__ == '__main__':
    main()
