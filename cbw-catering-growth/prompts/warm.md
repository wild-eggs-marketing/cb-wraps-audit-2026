# Warm — 31 to 90 Days Since Last Order

## Job

Draft a next-order nudge for a CBW catering account that ordered 31-90 days ago. Not lapsed, not overdue, just quiet. The message is a light touch. Assume they will order again, help them decide when.

## Voice

Follow `voice-guide-reference.md`.

## Data required

Pull via Apollo MCP:
- Contact name, title, email

From CSV:
- Last order date
- Assigned store

## Structure

**Subject**: 4-6 words. Playful within voice rules.

**Body**: 50-90 words. Shorter than Winback. Structure:
1. Reference their last order month naturally ("Since April...")
2. Menu hook: a new LTO, a returning seasonal item, or the anchor of "the whole mixed-diet room in one order"
3. Clear ordering next step
4. Sign-off

## Rules

- Warmer than Cold, less aggressive than Winback
- Do not treat them as churned, they are on-track buyers who need a nudge
- Never say "haven't heard from you in a while"

## Output

Write to `output/drafts/warm/[company-slug].md`.
