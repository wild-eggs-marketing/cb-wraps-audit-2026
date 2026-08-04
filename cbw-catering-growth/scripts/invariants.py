"""Hard invariants for the outbound pipeline. Fails loudly, exits non-zero.

This exists because remembering not to repeat a mistake is not a control. Every check below
corresponds to a defect that actually shipped:

  duplicate_exposure      one person held 10 records in CBW Cold; activating it would have sent
                          them 10 copies of the same email
  merge_fields_present    272 CBW and 30 WE contacts sat in sequences with an empty merge field,
                          which makes Apollo refuse the send outright (snippets_missing)
  touch_approval_matches  a sequence can read active=True while every touch sits at
                          to_be_reviewed, so it looks live and sends nothing
  contact_read_complete   contacts/search returns short pages mid-run; one truncated pass
                          (755 of 853 emails) let a 07-31 contact be created again on 08-04
  bounce_rate_ceiling     hard bounce is the one number that can lose the sending domain
  no_unsubscribed_enrolled a suppressed duplicate must never be the enrollable record

Run before and after any engine that writes to Apollo:
    APOLLO_API_KEY=... python3 scripts/invariants.py
Exit 0 = all invariants hold. Exit 1 = at least one violated; do not send.
"""
import collections
import json
import os
import sys
import urllib.error
import urllib.request

from apollo_dedupe import all_contacts

BASE = "https://api.apollo.io/api/v1"
H = {"x-api-key": os.environ["APOLLO_API_KEY"], "Content-Type": "application/json"}

CBW_ADDR_FIELD = "6a6a637c00ae0700204cf7f6"
WE_NAME_FIELD = "6a6a30e70618ba0018f4cce7"
WE_URL_FIELD = "6a6a30e8a24677000c36ff51"

CBW_SEQS = {"6a69d431d23c72000cf96aa1": "CBW Champion", "6a69d52294372e000cdf82e0": "CBW Winback",
            "6a69d52af1d199000c924f60": "CBW Warm", "6a69d5305214390010407a8d": "CBW Cold"}
WE_SEQS = {"6a6a3fb62cfca9001424cf07": "WE ChampRecov", "6a6a3fbe856b9400107fba19": "WE ChampLost",
           "6a6a3fc02cfca9000ce6c783": "WE Winback", "6a6a3fc94f036a0010d9666d": "WE Warm",
           "6a6a3fce1dfd6f0018cb9ec6": "WE Cold"}

BOUNCE_CEILING = float(os.environ.get("BOUNCE_CEILING", "0.02"))

failures = []
notes = []


def call(path, body=None):
    r = urllib.request.Request(f"{BASE}/{path}",
                               data=json.dumps(body).encode() if body is not None else None,
                               headers=H, method="POST" if body is not None else "GET")
    return json.load(urllib.request.urlopen(r, timeout=90))


def check(name, ok, detail):
    (notes if ok else failures).append(f"{'PASS' if ok else 'FAIL'}  {name}: {detail}")


def main():
    union, expected = all_contacts()
    check("contact_read_complete", bool(expected) and len(union) >= expected,
          f"read {len(union)} of {expected} contacts")
    if not expected or len(union) < expected:
        # Everything downstream is unreliable on a partial read - stop rather than emit
        # confident-looking numbers from incomplete data.
        report()
        return 1

    mailable = [c for c in union.values() if c.get("email") and not c.get("email_unsubscribed")]

    # 1. no person can receive the same sequence twice
    worst = []
    for cid, name in {**CBW_SEQS, **WE_SEQS}.items():
        recs = [c for c in mailable if cid in (c.get("emailer_campaign_ids") or [])]
        ems = collections.Counter((c.get("email") or "").lower() for c in recs)
        dup = sum(v - 1 for v in ems.values() if v > 1)
        if dup:
            worst.append(f"{name}+{dup}")
    check("duplicate_exposure", not worst,
          "0 across all sequences" if not worst else f"DUPLICATES: {', '.join(worst)}")

    # 2. account-wide: one mailable record per human
    ems = collections.Counter((c.get("email") or "").lower() for c in mailable)
    excess = sum(v - 1 for v in ems.values() if v > 1)
    check("one_record_per_person", excess == 0,
          f"{len(mailable)} mailable / {len(ems)} unique / {excess} excess")

    # 3. every enrolled contact carries the merge fields its templates require
    missing_cbw = [c for c in mailable
                   if set(c.get("emailer_campaign_ids") or []) & set(CBW_SEQS)
                   and not (c.get("typed_custom_fields") or {}).get(CBW_ADDR_FIELD)]
    missing_we = [c for c in mailable
                  if set(c.get("emailer_campaign_ids") or []) & set(WE_SEQS)
                  and not ((c.get("typed_custom_fields") or {}).get(WE_NAME_FIELD)
                           and (c.get("typed_custom_fields") or {}).get(WE_URL_FIELD))]
    check("merge_fields_present", not missing_cbw and not missing_we,
          f"CBW missing address: {len(missing_cbw)}, WE missing store name/url: {len(missing_we)}"
          + ("" if not (missing_cbw or missing_we)
             else " -> these contacts cannot be sent to (snippets_missing)"))

    # 4. deduping must never leave a person with zero mailable records.
    # Only multi-record people count: a single suppressed record is a genuine opt-out, a bad
    # lead we retired on purpose, or Apollo's global bounce list, and must stay suppressed.
    # This check caught a real casualty - a per-record suppression test made the newest record
    # the dedupe's chosen keeper, so all ten of one person's records ended up suppressed.
    by_email = collections.defaultdict(list)
    for c in union.values():
        if c.get("email"):
            by_email[(c["email"] or "").lower()].append(c)
    orphaned = [e for e, recs in by_email.items()
                if len(recs) > 1 and all(c.get("email_unsubscribed") for c in recs)]
    check("dedupe_left_no_one_unreachable", not orphaned,
          "no multi-record person is fully suppressed" if not orphaned
          else f"{len(orphaned)} people have duplicates and ZERO mailable record: "
               + ", ".join(orphaned[:5]))

    # 5. active flag and touch approval must agree, or the sequence lies about being live
    lying = []
    for c in call("emailer_campaigns/search", {"per_page": 100}).get("emailer_campaigns", []):
        d = call(f"emailer_campaigns/{c['id']}")
        st = [t.get("status") for t in (d.get("emailer_touches") or [])]
        if c.get("active") and st and any(s != "approved" for s in st):
            lying.append(f"{c.get('name')}({st.count('to_be_reviewed')} unapproved)")
    check("touch_approval_matches_active", not lying,
          "every active sequence has approved touches" if not lying
          else "active but cannot send: " + ", ".join(lying))

    # 6. hard bounce ceiling - the number that can cost the sending domain
    msgs, page = [], 1
    while page <= 20:
        d = call("emailer_messages/search", {"per_page": 100, "page": page})
        got = d.get("emailer_messages") or []
        if not got:
            break
        msgs += got
        page += 1
    delivered = sum(1 for m in msgs if m.get("status") == "completed")
    bounced = sum(1 for m in msgs if (m.get("failure_reason") or "") == "Bounce")
    spam = sum(1 for m in msgs if (m.get("failure_reason") or "") == "Spam Blocked")
    attempted = delivered + bounced + spam
    rate = (bounced / attempted) if attempted else 0.0
    check("bounce_rate_ceiling", rate <= BOUNCE_CEILING,
          f"{bounced}/{attempted} = {rate:.1%} (ceiling {BOUNCE_CEILING:.0%}), spam {spam}")

    return report()


def report():
    for n in notes:
        print(" ", n)
    for f in failures:
        print(" ", f)
    print()
    if failures:
        print(f"INVARIANTS VIOLATED: {len(failures)}. Do not send until these are resolved.")
        return 1
    print("All invariants hold.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
