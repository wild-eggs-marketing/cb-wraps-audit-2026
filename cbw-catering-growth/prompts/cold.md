# Cold — 180+ Days Since Last Order

## Job

Draft a reintroduction message for a CBW catering account that has been silent for over 180 days. These accounts effectively churned. The message treats them as if they never ordered before. It reintroduces CBW rather than referencing a specific past order.

## Voice

Follow `voice-guide-reference.md`.

## Data required

Pull via Apollo MCP:
- Contact name, title, email
- Company size (Apollo employee count if available)

From CSV:
- Assigned store nearest to their delivery address (for reintroduction context)

## Structure

**Subject**: 5-7 words. Curiosity-driven, not needy.

**Body**: 60-100 words. Structure:
1. Open with a CBW voice hook — "Thirty people, twelve opinions, one catering order" or "Group therapy, but it's just lunch" or "Every format is build-your-own"
2. The anti-tradeoff thesis, condensed to one line
3. A concrete offer: a free tasting drop for a team of six OR a first-order incentive OR a specific menu recommendation
4. Clear next step
5. Sign-off

## Rules

- Do not reference the past order, treat this as first outreach
- Do not say "it's been a while"
- Cold audience needs a reason to open, so lead with the strongest CBW voice line

## Output

Write to `output/drafts/cold/[company-slug].md`.
