# Winback — 91 to 180 Days Since Last Order

## Job

Draft a personalized message for a CBW catering account that ordered 1-4 times and stopped, 91 to 180 days ago. This is our highest ROI segment. They liked us enough to reorder at least once, then something changed. The message assumes they had a good reason to stop, and offers to restart on their terms.

## Voice

Follow `voice-guide-reference.md` in full.

## Data required per account

Pull via Apollo MCP:
- Primary contact name and title
- Contact email

From `data/ez-cater-orders.csv`:
- Order count
- Last order date
- Assigned CBW store
- Any repeating order type (was it always the Fajita Bar? Box lunches?)

## Structure

**Subject line**: 4-7 words. Direct.

**Body**: 70-110 words. Structure:
1. Reference the specific last order (what they got, roughly when — "The Fajita Bar you had for the team last spring")
2. Do not ask what happened. Assume calendar changes, budget, whatever.
3. The offer: an easy re-entry. Standing Order pitch OR a specific menu recommendation for a next order.
4. Clear next step.
5. Sign-off from the rotating set.

## Rules

- No em dashes
- First-person We only
- Name specific ingredients or menu items
- No apologies, no "we miss you"
- Reject-the-tradeoff line if there's room ("Where kale, quinoa, and Lobster Rangoon somehow all end up on the same menu.")

## Output

Write to `output/drafts/winback/[company-slug].md` in the standard format.
