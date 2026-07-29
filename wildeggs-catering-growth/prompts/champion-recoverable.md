# Wild Eggs Champion Recoverable Reactivation (30-180 days overdue)

## Job

Draft a personalized reactivation message for a Wild Eggs catering Champion that is 30 to 180 days past their expected next order. These are recoverable accounts. The message must sound human, must not presume the occasion, must not use first-person brand voice, and must not contain a single em dash.

Every draft routes the recipient to their assigned store's direct Toast catering URL. Where the store's specific slug is not confirmed in `store-urls.csv`, use the general Wild Eggs catering fallback URL.

## Voice

Follow `voice-guide-reference.md` in full. Every rule applies. Zero em dashes. No "we" or "our" as the brand voice. Get cracking. as the sign-off.

## Data required per account

Pull via Apollo MCP:
- Primary contact name and title (target: office manager, executive assistant, catering coordinator, HR lead, or facilities lead)
- Contact email

From `data/ez-cater-orders.csv`:
- Order count for this company
- First order date
- Last order date
- Median gap in days between orders
- Days overdue
- Assigned Wild Eggs store name
- Approximate typical order size
- Delivery city (most common City value)
- Assigned driver if consistent

From `data/store-urls.csv`:
- Look up the Toast catering URL that matches their assigned store name
- If notes column shows FALLBACK, use the general Wild Eggs catering URL instead

## Personalization — use only VERIFIED signals

Reference ONE authentic detail in the opening. Never invent.

Allowed references:
- Order count and rough pattern ("Seven orders through Oakley over the last year, about every six weeks")
- Store relationship ("Oakley has run every one of the last seven orders")
- Lifetime spend anchor ("A little over nine thousand in catering through Oakley")
- Consistent driver ("Marcus at Oakley knows the delivery")
- Timing pattern ("Usually booking two days out")
- Order source ("Every order delivered, none picked up")

NEVER invent:
- Specific menu items ("the Bar-style setup", "the cinnamon roll spread")
- Headcount served
- Occasion type — this violates the Wild Eggs voice rule
- Any dish name reference (unless it appears in verified EZ Cater data)

## Structure

**Subject line**: 5-8 words. Zero em dashes. No "we miss you." No "checking in."

**Body**: 90-140 words. Flowing prose, connected sentences. Structure:
1. Open with one specific verified detail. Do not presume the occasion.
2. Note the gap without pressure. Something like "The Oakley team was expecting the next order around the middle of June, and that window has passed."
3. **The switching pitch (Wild Eggs specific)**: order direct at the store's Toast catering link. Reason to switch is not points or discount, it is the store's actual catering coordinator handling the account instead of a marketplace. Name the store's actual coordinator if known.
4. One clear next step: reply to book, or click through to the direct Toast link. Do not offer a phone call.
5. Sign-off: Get cracking.

## Rules

- Zero em dashes
- No first-person "we" or "our" (biggest voice rule)
- Never apologize for reaching out
- Never say "we miss you" or "just checking in"
- Never reference the dollar amount at risk
- Never write two drafts with the same opening line
- Never presume the occasion
- Every URL is the store-specific Toast URL from `store-urls.csv`, or the fallback if the store's slug is not confirmed

## Output format

For each account, write to `output/drafts/champion-recoverable/[company-slug].md`:

```
Company: [name]
Contact: [name, title]
Email: [address]
Assigned store: [store name]
Toast catering URL: [url from lookup]
Days overdue: [n]

Subject: [subject]

[body]
```

## URL construction (tracking is required)

Every URL in the message body is built by appending UTM parameters to the base URL from `data/store-urls.csv`. See `data/utm-conventions.md` for full detail.

Format:
```
[base-url]?utm_source=apollo&utm_medium=email&utm_campaign=we_champion_recoverable_[YYYY]_[MM]
```

Where `[YYYY]_[MM]` is the current year and month at draft time (e.g., `2026_08`).

Without UTM parameters attached, downstream conversion tracking breaks. Every URL in every draft must carry them. The recipient will not see the raw URL — the display text can be simple like "Book direct at Oakley" — but the underlying hyperlink target must include the full UTM string.
