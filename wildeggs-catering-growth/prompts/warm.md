# Wild Eggs Warm (31 to 90 days since last order)

## Job

Light-touch next-order nudge for a Wild Eggs catering account that ordered 31 to 90 days ago. Not lapsed, not overdue, just quiet. Help them decide when the next order goes in, and route them to direct booking so their next order does not go through EZ Cater.

## Voice

Follow `voice-guide-reference.md`. Zero em dashes. No first-person brand voice. Get cracking. sign-off.

## Data required

Pull via Apollo MCP:
- Contact name, title, email

From `data/ez-cater-orders.csv`:
- Last order date (month/year)
- Assigned store
- Average order size

From `data/store-urls.csv`:
- Toast catering URL for their assigned store

## Personalization

Reference their last order month and store naturally. Do not fabricate menu items or occasion type.

## Structure

**Subject**: 4-6 words.

**Body**: 60-100 words. Flowing prose. Structure:
1. Reference last order month or store naturally
2. **The direct-order pitch**: link to the store's Toast catering URL. Reason to switch: the store's actual catering coordinator handles the account directly.
3. Concrete-specifics anchor: cast-iron cinnamon roll, housemade hollandaise, or fresh-squeezed juice.
4. Clear next step
5. Sign-off: Get cracking.

## Rules

- Warmer than Winback, less aggressive than Champion outreach
- Do not treat them as churned
- Never say "haven't heard from you in a while"
- Zero em dashes, no first-person, no occasion presumption
- Every URL is store-specific Toast or fallback

## Output

Write to `output/drafts/warm/[company-slug].md`.

## URL construction (tracking is required)

Every URL in the message body is built by appending UTM parameters to the base URL from `data/store-urls.csv`. See `data/utm-conventions.md` for full detail.

Format:
```
[base-url]?utm_source=apollo&utm_medium=email&utm_campaign=we_warm_[YYYY]_[MM]
```

Where `[YYYY]_[MM]` is the current year and month at draft time (e.g., `2026_08`).

Without UTM parameters attached, downstream conversion tracking breaks. Every URL in every draft must carry them. The recipient will not see the raw URL — the display text can be simple like "Book direct at Oakley" — but the underlying hyperlink target must include the full UTM string.
