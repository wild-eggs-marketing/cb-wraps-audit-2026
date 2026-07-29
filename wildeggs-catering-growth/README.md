# Wild Eggs Catering Growth — Claude Code Project

Digital-only AI-powered catering reactivation for Wild Eggs.
Runs inside Claude Code. Pulls contacts from Apollo via MCP.
Drafts personalized outreach against EZ Cater order history.
Routes every recipient to their store's direct Toast catering URL.

## What this project does

1. Personalizes outreach to 846 lapsed Wild Eggs catering accounts using verified data only
2. Routes every message to the recipient's assigned store's direct Toast catering URL (never EZ Cater)
3. Monitors reorder patterns and flags Champion drift daily
4. Triages replies with Claude Haiku classifier
5. Drafts proposals on demand for inbound catering inquiries from wildeggs.com

## The Wild Eggs difference from CBW

Wild Eggs customers are occasion buyers, not routine buyers like CBW. There is no strict cadence to monitor. The prompts in this project reflect that. Reactivation copy references pattern in loose terms ("about every six weeks through Oakley") not tight cadences ("every 16 days like clockwork").

The switching pitch is also different. CBW pushes Crazy Points loyalty. Wild Eggs loyalty tiers are not live, so the WE switching pitch leans on hospitality. Ordering direct means talking to the store's actual catering coordinator, not a marketplace account manager.

## Standard invocation

```
Read prompts/[segment].md
Draft outreach for [account list]
Pull contact data from Apollo MCP
Pull order history from data/ez-cater-orders.csv
Look up Toast catering URLs in data/store-urls.csv
Write drafts to output/drafts/[segment]/
```

## Data files

- `data/ez-cater-orders.csv` — weekly export from EZ Cater
- `data/store-urls.csv` — Wild Eggs store name to Toast catering URL mapping
- `data/utm-conventions.md` — UTM tracking convention for measuring the full funnel (opens → clicks → landing → orders)
- `data/multi-store-consolidation.csv` — the 5 multi-store WE accounts (TO CREATE)

## What we CAN personalize from EZ Cater data

- Company name, delivery address, closest store
- Order count and lifetime spend
- Rough pattern (average gap between orders)
- Last order date, days since
- Average order size
- Order source (delivery vs takeout)
- Assigned driver name if consistent
- Timing patterns (day of week, booking lead time)

## What we CANNOT personalize (do not fabricate)

- Specific menu items ordered
- Headcount served
- Occasion type — this is a strict Wild Eggs voice rule
- Named contact on each order

## Voice enforcement

Every prompt file references `voice-guide-reference.md`. Wild Eggs voice rules are strict. Zero em dashes. No first-person brand voice. No AI writing patterns. No occasion presumption. See the voice guide for full detail.

## Setup checklist

- [x] Apollo MCP connected in Claude
- [ ] Sending domain authenticated (SPF, DKIM, DMARC) for wildeggs.com
- [ ] EZ Cater orders exported to data/ez-cater-orders.csv
- [x] Store URL routing built from Toast catering slugs (some slugs pending confirmation)
- [ ] Test batch of 3 Recoverable Champions reviewed and approved
- [ ] Cadence monitor scheduled to run daily
- [ ] Reply triage webhook deployed

Get cracking.
