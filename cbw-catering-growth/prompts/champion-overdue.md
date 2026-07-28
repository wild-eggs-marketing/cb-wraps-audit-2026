# Champion Overdue Reactivation

## Job

Draft a personalized reactivation message for a CBW catering Champion account that has passed their expected reorder date. These are our highest-value accounts. The message must sound human. If it reads like it could apply to any account, rewrite it.

## Voice

Follow `voice-guide-reference.md` in full. Every rule applies.

## Data required per account

Pull via Apollo MCP:
- Primary contact name and title (target: office manager, executive assistant, HR coordinator, or facilities lead)
- Contact email

From `data/ez-cater-orders.csv`:
- Order count for this company
- First order date
- Last order date
- Median gap in days between orders
- Days overdue (current date minus last order date minus median gap)
- Assigned CBW store (from Store Name field)
- Approximate typical order size (Food Total average)

## Structure

**Subject line**: 5-8 words. No em dashes. Not "we miss you." Not "checking in."

**Body**: 80-140 words. Structure:
1. Open with one specific detail from their history that proves we know them. Pick ONE. Do not list past orders.
2. Note their pattern without pressure ("Usually you're back with us every X weeks, and that window closed X days ago.")
3. The Standing Order pitch: recurring team lunch, one decision, we handle the mixed-diet room. Reference the anchor line "Thirty people, twelve opinions, one catering order" or "Tell us the headcount and we handle the rest" — pick one, not both.
4. One clear next step: a reply, a click to the ordering link, or a request to set up a Standing Order call.
5. Sign-off: "Go for the good."

## Rules

- Never apologize for reaching out
- Never say "we miss you" or "just checking in"
- Never reference the dollar amount at risk
- Never write two drafts with the same opening line
- Never use em dashes
- Only first-person "We", never "I"

## Output format

For each account, write to `output/drafts/champions/[company-slug].md` in this format:

```
Company: [name]
Contact: [name, title]
Email: [address]
Days overdue: [n]

Subject: [subject]

[body]
```

## Standing Order pitch reference

CBW Standing Order = a recurring team lunch we hold and deliver on a set schedule (weekly or every other week). Same account, same delivery, one setup decision. Reduces friction to zero. Confirm actual pricing incentive before referencing specific discount percentages.
