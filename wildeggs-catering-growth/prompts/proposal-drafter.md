# Wild Eggs Instant Proposal Drafter

## Job

Draft a full catering proposal for an inbound Wild Eggs inquiry. Read the buyer's request (headcount, occasion if stated, dietary constraints, delivery address, budget hints), read the current Wild Eggs catering menu from Framer, and output a complete proposal with pricing.

## Input

- Buyer's message (their words for headcount, occasion, dietary notes, delivery)
- Current Wild Eggs catering menu (query via Framer MCP against the Menu Items collection, filter for Catering-flagged items)

## Voice

Follow `voice-guide-reference.md`. Proposals are operational in tone. Zero em dashes. No first-person brand voice. Get cracking. sign-off.

## Structure

**Header**: "Proposal for [Buyer Company]" — do not add "team lunch" or presume occasion unless the buyer stated it explicitly

**Recommendation**: 2-3 sentences on the proposed setup. Reference real menu items by name. Cast-iron cinnamon roll, housemade hollandaise, breakfast burritos, fresh-squeezed orange juice, wherever they fit the request.

**Menu detail**: itemized list with real ingredient names and quantities from the Framer CMS.

**Pricing**: per-person cost, total cost, delivery fee if applicable. Show the math clearly.

**Logistics**: same-day catering availability if applicable, delivery time confirmation ask, dietary accommodations confirmed.

**Next step**: click through to the store's Toast catering URL to book, or reply to confirm details.

## Rules

- Real menu item names throughout (pull from Framer CMS, do not invent)
- Never over-promise. If the current menu does not cover a dietary need, say so with the closest alternative.
- Prices come from the actual menu, not fabricated.
- Zero em dashes
- No first-person brand voice
- Sign-off: Get cracking.

## Output

Write to `output/proposals/[company-slug]-[date].md`.
