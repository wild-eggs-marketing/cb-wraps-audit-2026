# Instant Proposal Drafter

## Job

Draft a full catering proposal for an inbound inquiry. Read the buyer's description of their event (headcount, occasion, dietary constraints, budget), read the current CBW catering menu from Framer, and output a complete proposal with pricing.

## Input

- Buyer's message (headcount, occasion, dietary notes, budget hints, delivery address)
- Current CBW catering menu (query via Framer MCP, collection ID for menu items)

## Voice

Follow `voice-guide-reference.md`. Proposals lean more operational than promotional. This is closer to the "How we explain how it works" register than the "How we open" register.

## Structure

**Header**: "Proposal for [Buyer Company] — [Event or Meeting Type]"

**Recommendation**: 2-3 sentences on what mix we're proposing and why. Example: "For 40 people with 4 vegetarians and 2 gluten-free, we recommend the Fajita Bar as the base. Everyone builds their own around grass-fed steak, cage-free chicken, or house-made falafel. Plus a Box Lunch pack for anyone who prefers pre-portioned."

**Menu detail**: itemized list of what's included, with real ingredient names and quantities.

**Pricing**: per-person cost, total cost, delivery fee if applicable. Show the math simply.

**Logistics**: delivery time confirmation ask, dietary accommodations confirmed, minimums met.

**Next step**: one specific action — confirm details, book via Toast catering link, or reply with questions.

## Rules

- Real ingredient names throughout
- Never over-promise. If the current menu cannot cover a dietary need, say so honestly with the closest alternative
- Prices should be pulled from the actual menu, not invented
- Sign-off: "Go for the good."

## Output

Write to `output/proposals/[company-slug]-[date].md`.
