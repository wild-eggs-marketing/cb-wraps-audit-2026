# Wild Eggs Winback (91 to 180 days since last order, less than 5 orders)

## Job

Draft a personalized reactivation message for a Wild Eggs catering account that ordered 1 to 4 times and stopped 91 to 180 days ago. Highest ROI segment by volume. They ordered before, they know Wild Eggs, and the gap is fresh enough to be recoverable.

The message assumes they had a good reason to stop and offers a low-friction way to book the next order direct.

## Voice

Follow `voice-guide-reference.md` in full. Zero em dashes. No first-person brand voice. Get cracking. sign-off.

## Data required per account

Pull via Apollo MCP:
- Contact name, title, email

From `data/ez-cater-orders.csv`:
- Order count
- Last order date (month/year)
- Assigned store
- Average order size

From `data/store-urls.csv`:
- Toast catering URL for their assigned store (or fallback)

## Personalization

Reference ONE verified detail from their history:
- Last order month and store ("Last order through Dupont was in March")
- Order count with rough total ("Three orders through Bowling Green last spring at around 340 dollars each")
- Store relationship ("Dupont handled both of the orders")

Never invent menu items, headcount, or occasion type.

## Structure

**Subject line**: 4-7 words. Direct.

**Body**: 80-120 words. Flowing prose. Structure:
1. Reference the verified detail from their history
2. Note the gap without pressure or drama
3. **The switching pitch (Wild Eggs specific)**: order direct at the store's Toast catering link. Reason is direct relationship with the store's catering coordinator, not points or discount.
4. Optional concrete-specifics line: mention the scratch kitchen, cast-iron cinnamon roll, or fresh-squeezed juice as anchor language.
5. Clear next step: reply, or click through to the direct link.
6. Sign-off: Get cracking.

## Rules

- Zero em dashes
- No first-person "we" or "our"
- No apologies, no "we miss you"
- No presumption about occasion type
- No fabricated menu items
- Every URL is store-specific Toast or the fallback

## Output

Write to `output/drafts/winback/[company-slug].md`.

## URL construction (tracking is required)

Every URL in the message body is built by appending UTM parameters to the base URL from `data/store-urls.csv`. See `data/utm-conventions.md` for full detail.

Format:
```
[base-url]?utm_source=apollo&utm_medium=email&utm_campaign=we_winback_[YYYY]_[MM]
```

Where `[YYYY]_[MM]` is the current year and month at draft time (e.g., `2026_08`).

Without UTM parameters attached, downstream conversion tracking breaks. Every URL in every draft must carry them. The recipient will not see the raw URL — the display text can be simple like "Book direct at Oakley" — but the underlying hyperlink target must include the full UTM string.
