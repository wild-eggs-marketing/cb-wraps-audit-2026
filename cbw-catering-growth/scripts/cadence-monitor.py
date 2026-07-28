"""
CBW Champion cadence monitor.
Runs daily. Reads EZ Cater order history, computes each Champion's median reorder gap,
and flags any account crossing its expected reorder date without a new order.

Outputs to output/overdue-today.md for Claude Code to auto-draft outreach from.
"""

import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path

# --- Config ---
DATA_PATH = Path('data/ez-cater-orders.csv')  # weekly EZ Cater export
OUTPUT_PATH = Path('output/overdue-today.md')
CHAMPION_MIN_ORDERS = 5  # minimum orders to qualify as Champion
LOOKBACK_MONTHS = 18  # only consider orders from last 18 months for cadence

def main():
    df = pd.read_csv(DATA_PATH)
    df['Event Date'] = pd.to_datetime(df['Event Date'])

    # Filter to completed CBW orders only
    df = df[df['Status'].isin(['Completed', 'Food Delivered'])]
    df = df[df['Caterer Name'].str.contains('CBW', na=False)]
    df = df[~df['Location'].astype(str).str.startswith('Takeout from')]

    now = pd.Timestamp.now()
    lookback = now - pd.DateOffset(months=LOOKBACK_MONTHS)
    df = df[df['Event Date'] >= lookback]

    # Aggregate by company
    grouped = df.groupby('Location').agg(
        orders=('Order Number', 'count'),
        total=('Food Total', 'sum'),
        last_order=('Event Date', 'max'),
        stores=('Store Name', lambda x: ', '.join(sorted(set(str(v) for v in x if pd.notna(v))))),
    ).reset_index()

    # Filter to Champions
    champions = grouped[grouped['orders'] >= CHAMPION_MIN_ORDERS].copy()

    # Compute cadence per Champion
    overdue = []
    for company in champions['Location']:
        orders = df[df['Location'] == company].sort_values('Event Date')
        gaps = orders['Event Date'].diff().dt.days.dropna()
        if len(gaps) == 0:
            continue
        median_gap = int(gaps.median())
        last = orders['Event Date'].max()
        expected_next = last + timedelta(days=median_gap)
        days_overdue = (now - expected_next).days
        if days_overdue > 0:
            overdue.append({
                'company': company,
                'orders': len(orders),
                'total': orders['Food Total'].sum(),
                'median_gap': median_gap,
                'last_order': last.strftime('%Y-%m-%d'),
                'days_overdue': days_overdue,
                'store': str(orders['Store Name'].mode().iloc[0]) if len(orders['Store Name'].mode()) > 0 else '',
            })

    # Sort by days overdue descending
    overdue.sort(key=lambda x: -x['days_overdue'])

    # Write markdown output
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open('w') as f:
        f.write(f"# Overdue Champions - {now.strftime('%Y-%m-%d')}\n\n")
        f.write(f"Total Champions overdue: {len(overdue)}\n\n")
        f.write("| Company | Orders | Total | Cadence | Last Order | Days Overdue | Store |\n")
        f.write("|---|---|---|---|---|---|---|\n")
        for r in overdue:
            f.write(f"| {r['company']} | {r['orders']} | ${r['total']:,.0f} | {r['median_gap']}d | {r['last_order']} | {r['days_overdue']} | {r['store']} |\n")

    print(f"Wrote {len(overdue)} overdue Champions to {OUTPUT_PATH}")
    print(f"Top 5 most overdue:")
    for r in overdue[:5]:
        print(f"  {r['company']:40} - {r['days_overdue']}d overdue")

if __name__ == '__main__':
    main()
