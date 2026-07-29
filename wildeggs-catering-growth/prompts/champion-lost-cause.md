# Wild Eggs Champion Lost Cause Reintroduction (180+ days silent)

## Job

Draft one final reintroduction message for a Wild Eggs Champion that has been silent for more than 180 days. These accounts stopped ordering long enough that treating them as recoverable would distort the reactivation numbers. This is a single-touch outreach. Any account that does not respond within 30 days moves out of the active reactivation list.

The tone is different from other segments. Not "come back." Not "we miss you." More like a genuine one-time reintroduction from a scratch kitchen that used to serve them, treating this as if they might reconsider Wild Eggs today for whatever reason works for them.

## Voice

Follow `voice-guide-reference.md` in full. Zero em dashes. No first-person brand voice. Get cracking. sign-off.

## Data required per account

Pull via Apollo MCP:
- Contact name, title, email

From `data/ez-cater-orders.csv`:
- Order count total
- Last order date and how many months back
- Assigned store

From `data/store-urls.csv`:
- Toast catering URL for their assigned store (or fallback)

## Personalization

Reference the account's history acknowledging it is old:
- "Last order through Oakley was almost a year ago"
- "The Fishers store handled thirteen orders through early 2025"

Do not fabricate reasons for the gap. Do not apologize.

## Structure

**Subject line**: 5-8 words. Not needy.

**Body**: 80-110 words. Structure:
1. Honest acknowledgment: last order date and store, no drama about the gap
2. What has stayed the same at Wild Eggs and what may be new. Reference concrete specifics: same scratch kitchen, same cast-iron cinnamon roll, same 6:30 AM open time, same same-day catering.
3. **The offer**: order direct at the store's Toast link. No incentive push, just a working link and the fact that the store's catering coordinator is a real person answering the account directly.
4. One clear next step: click through, or reply. This is a single-touch, not a sequence.
5. Sign-off: Get cracking.

## Rules

- Zero em dashes
- No first-person "we" or "our"
- No "come back to us"
- No apologies
- No presumption about occasion
- Honest about the gap without softening
- Every URL is store-specific Toast or fallback

## Output

Write to `output/drafts/champion-lost-cause/[company-slug].md`.

## URL construction (tracking is required)

Every URL in the message body is built by appending UTM parameters to the base URL from `data/store-urls.csv`. See `data/utm-conventions.md` for full detail.

Format:
```
[base-url]?utm_source=apollo&utm_medium=email&utm_campaign=we_champion_lost_cause_[YYYY]_[MM]
```

Where `[YYYY]_[MM]` is the current year and month at draft time (e.g., `2026_08`).

Without UTM parameters attached, downstream conversion tracking breaks. Every URL in every draft must carry them. The recipient will not see the raw URL — the display text can be simple like "Book direct at Oakley" — but the underlying hyperlink target must include the full UTM string.
