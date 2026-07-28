"""
Builds the master account list from the EZ Cater order export.
One row per unique catering account (Location), aggregated across all their orders,
with a lifecycle segment assigned so downstream prompts (cold/warm/winback/champion-overdue)
and Apollo enrichment can be scoped and prioritized.

Segments (mirrors prompts/*.md thresholds):
  champion   - 5+ completed orders (regardless of recency)
  winback    - 1-4 orders, last order 91-180 days ago
  cold       - last order 180+ days ago (and not a champion)
  warm       - last order 31-90 days ago (and not a champion)
  active     - last order <31 days ago (and not a champion)

Run: python3 scripts/build-account-list.py
Output: data/accounts-master.csv
"""

import pandas as pd
from pathlib import Path

DATA_PATH = Path('data/ez-cater-orders.csv')
OUTPUT_PATH = Path('data/accounts-master.csv')
TODAY = pd.Timestamp('2026-07-28')
CHAMPION_MIN_ORDERS = 5


def slugify(name):
    return (str(name).lower()
            .replace(' ', '-').replace(',', '')
            .replace('.', '').replace('&', 'and')
            .replace("'", '').replace('/', '-'))


def segment_for(orders, days_since):
    if orders >= CHAMPION_MIN_ORDERS:
        return 'champion'
    if days_since > 180:
        return 'cold'
    if 91 <= days_since <= 180:
        return 'winback'
    if 31 <= days_since <= 90:
        return 'warm'
    return 'active'


def main():
    df = pd.read_csv(DATA_PATH)
    df['Event Date'] = pd.to_datetime(df['Event Date'])
    df['Food Total'] = df['Food Total'].replace(r'[\$,]', '', regex=True).astype(float)

    df = df[df['Status'].isin(['Completed', 'Food Delivered'])]
    df = df[df['Caterer Name'].str.contains('CBW', na=False)]
    df = df[~df['Location'].astype(str).str.startswith('Takeout from')]

    rows = []
    for company, grp in df.groupby('Location'):
        grp = grp.sort_values('Event Date')
        last_order = grp['Event Date'].max()
        first_order = grp['Event Date'].min()
        days_since = (TODAY - last_order).days
        order_count = len(grp)

        gaps = grp['Event Date'].diff().dt.days.dropna()
        median_gap = int(gaps.median()) if len(gaps) else None

        addr_row = grp.iloc[-1]
        store_mode = grp['Store Name'].mode()
        top_source = grp['Source'].mode()

        rows.append({
            'Location': company,
            'Slug': slugify(company),
            'Street Address': addr_row['Street Address'],
            'City': addr_row['City'],
            'State': addr_row['State'],
            'Zip Code': addr_row['Zip Code'],
            'Assigned Store': str(store_mode.iloc[0]) if len(store_mode) else '',
            'Order Count': order_count,
            'First Order Date': first_order.strftime('%Y-%m-%d'),
            'Last Order Date': last_order.strftime('%Y-%m-%d'),
            'Days Since Last Order': days_since,
            'Median Reorder Gap (days)': median_gap,
            'Avg Food Total': round(grp['Food Total'].mean(), 2),
            'Total Food Spend': round(grp['Food Total'].sum(), 2),
            'Primary Source': str(top_source.iloc[0]) if len(top_source) else '',
            'Segment': segment_for(order_count, days_since),
        })

    out = pd.DataFrame(rows).sort_values(['Segment', 'Order Count'], ascending=[True, False])
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    out.to_csv(OUTPUT_PATH, index=False)

    print(f"Wrote {len(out)} accounts to {OUTPUT_PATH}")
    print(out['Segment'].value_counts())


if __name__ == '__main__':
    main()
