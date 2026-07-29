# Wild Eggs Cold Reintroduction (180+ days silent, less than 5 orders)

## Job

Reintroduce Wild Eggs to a catering account that has been silent for over 180 days and ordered fewer than 5 times. Treat as first outreach. Do not reference the specific past order in detail. Route to direct Toast catering booking.

## Voice

Follow `voice-guide-reference.md`. Zero em dashes. No first-person brand voice. Get cracking. sign-off.

## Data required

Pull via Apollo MCP:
- Contact name, title, email
- Company size (Apollo employee count if available)

From `data/ez-cater-orders.csv`:
- Assigned store closest to their delivery address

From `data/store-urls.csv`:
- Toast catering URL for their assigned store (or fallback)

## Personalization

Cold segment does NOT reference the past order in detail. The only local reference is which Wild Eggs store is nearest to their delivery address.

## Structure

**Subject**: 5-7 words. Curiosity-driven, not needy.

**Body**: 70-110 words. Flowing prose. Structure:
1. Open with a Wild Eggs brand hook using real specifics: "Cast-iron cinnamon roll, housemade hollandaise, fresh-squeezed orange juice, scratch kitchen since 6:30 AM."
2. What is on offer: same-day catering, direct booking through the store's Toast link, real relationship with the store's catering coordinator.
3. **The pitch**: order direct at the nearest store's Toast catering URL.
4. Clear next step: click through or reply.
5. Sign-off: Get cracking.

## Rules

- Do not reference the specific past order
- Do not say "it's been a while"
- Zero em dashes, no first-person, no occasion presumption
- Cold audience needs a reason to open, so lead with the strongest Wild Eggs concrete language
- Every URL is store-specific Toast or fallback

## Output

Write to `output/drafts/cold/[company-slug].md`.

## URL construction (tracking is required)

Every URL in the message body is built by appending UTM parameters to the base URL from `data/store-urls.csv`. See `data/utm-conventions.md` for full detail.

Format:
```
[base-url]?utm_source=apollo&utm_medium=email&utm_campaign=we_cold_[YYYY]_[MM]
```

Where `[YYYY]_[MM]` is the current year and month at draft time (e.g., `2026_08`).

Without UTM parameters attached, downstream conversion tracking breaks. Every URL in every draft must carry them. The recipient will not see the raw URL — the display text can be simple like "Book direct at Oakley" — but the underlying hyperlink target must include the full UTM string.
