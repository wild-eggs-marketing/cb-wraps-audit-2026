# UTM Tracking Conventions

Every URL in every outbound email carries UTM parameters so the campaign is measurable end-to-end. This file is authoritative for the Wild Eggs catering growth program.

## The chain we are measuring

1. Email opens → Apollo Sequences (native pixel)
2. Email clicks → Apollo Sequences (native tracking)
3. Landing page visits → GA4 via GTM on wildeggs.com, or Cloudflare Analytics for catering.wildeggs.com
4. Toast catering booking click → GA4 event `toast_catering_click` (already firing)
5. Completed catering order → Toast Analytics (filtered by utm_campaign)

## Standard URL structure

```
[base-url]?utm_source=apollo&utm_medium=email&utm_campaign=[brand]_[segment]_[YYYY]_[MM]&utm_content=[optional]
```

## Field values

- **utm_source**: `apollo` when sending through Apollo Sequences. Change to `toast` if the send channel changes.
- **utm_medium**: `email` (always)
- **utm_campaign**: `we_[segment]_[year]_[month]`. Segment values:
  - `champion_recoverable`
  - `champion_lost_cause`
  - `winback`
  - `warm`
  - `cold`
- **utm_content**: optional. Use for subject-line A/B tests (`v1`, `v2`) or store-specific cohorts.

## Examples

WE Champion Recoverable, August 2026, subject variant 1:
```
utm_source=apollo&utm_medium=email&utm_campaign=we_champion_recoverable_2026_08&utm_content=v1
```

WE Winback, August 2026:
```
utm_source=apollo&utm_medium=email&utm_campaign=we_winback_2026_08
```

WE Lost Cause reintroduction, August 2026:
```
utm_source=apollo&utm_medium=email&utm_campaign=we_lost_cause_2026_08
```

## Where each metric lives

| Metric | Data source | How to filter |
|---|---|---|
| Email opens | Apollo Sequences | Campaign name in Apollo |
| Email clicks | Apollo Sequences | Campaign name |
| Email replies | Apollo Sequences | Campaign name |
| Landing page visits | GA4 (wildeggs.com) / Cloudflare Analytics (catering.wildeggs.com subdomain) | utm_campaign |
| Toast catering clicks | GA4 event `toast_catering_click` | utm_campaign |
| Completed catering orders | Toast Analytics | utm_campaign |

## Attribution limitations (be honest about these)

- **Direct booking bypass**: if someone reads an email but manually types the base URL or uses a bookmark, the UTM chain breaks and attribution defaults to `(direct)`.
- **Multi-touch attribution**: if someone gets three emails then converts, last-click typically takes credit unless we build a proper attribution model in GA4.
- **Cross-device**: GA4 handles this partially through cross-device sign-in but not perfectly.
- **Reply then convert**: if someone replies (triaged by the Haiku classifier), then converts later, attribution to the original email is manual. The reply triage output should tag the source campaign so this is tracked.
- **Image blocking**: some corporate email clients block images by default, which understates open rates. Industry-standard and unavoidable.

## Weekly reporting

Pull the following into a shared sheet every Monday:

1. From Apollo Sequences: opens, clicks, replies, unsubscribes, bounces by campaign
2. From GA4: landing page visits and `toast_catering_click` events by utm_campaign
3. From Toast Analytics: catering orders and revenue by utm_campaign
4. Compute: end-to-end conversion rate (email → order) and revenue per email sent

A Claude Code script can consolidate this weekly if the underlying platforms have API access.
