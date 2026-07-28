# CBW Catering Growth — Claude Code Project

Digital-only AI-powered catering reactivation system for Crazy Bowls & Wraps.
Runs inside Claude Code. Pulls contact data from Apollo via MCP. Drafts personalized outreach against EZ Cater order history. Deploys to Apollo sequences or Toast Email.

## What this project does

1. Personalizes outreach to 753 lapsed CBW catering accounts
2. Monitors reorder cadence and flags Champion drift daily
3. Triages replies with Claude Haiku classifier
4. Drafts proposals on demand for inbound catering inquiries
5. Generates dynamic per-prospect landing pages

## How to use it

Each `prompts/*.md` file is a complete drafting brief for one segment. Point Claude Code at a prompt and a list of accounts, and it drafts personalized messages against Apollo enrichment plus local EZ Cater order data.

## Standard invocation

```
Read prompts/[segment].md
Draft outreach for [account list]
Pull contact data from Apollo MCP
Pull order history from data/ez-cater-orders.csv
Write drafts to output/drafts/[segment]/
```

## Data files needed

- `data/ez-cater-orders.csv` — weekly export from EZ Cater catering portal
- `data/multi-store-consolidation.csv` — the 10 multi-store accounts, one master row per account

## Voice enforcement

Every prompt file references `voice-guide-reference.md`. That file is the compressed Voice Guide, extracted from real crazybowlsandwraps.com copy.

## Setup checklist

- [ ] Apollo MCP connected in Claude
- [ ] Sending domain authenticated (SPF, DKIM, DMARC)
- [ ] EZ Cater orders exported to data/ez-cater-orders.csv
- [ ] Test batch of 3 Champions reviewed and approved
- [ ] Cadence monitor scheduled to run daily
- [ ] Reply triage webhook deployed

Go for the good.
