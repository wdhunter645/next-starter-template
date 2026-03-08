---
Doc Type: How-To
Audience: Human + AI
Authority Level: Operational Authority
Owns: Snapshot cadence, publish gates, manual final lock procedure, tie resolution workflow
Does Not Own: UI design contracts; route/nav standards
Canonical Reference: /docs/reference/design/als-fundraiser-2026-campaign-spotlight.md
Last Reviewed: 2026-02-26T13:14:02Z
---

# How-To: ALS Fundraiser Snapshots, Publishing, and Final Lock

## Objective
Publish standings with **zero drama**: once posted, standings are official.

## Cadence (Locked)
- May 1–May 25: publish every 12 hours
- May 26–June 2: publish every hour
- June 3: manual final snapshot lock

## Publish Gate (Fail Closed)
A snapshot may be published only if:
- source data fetch completed successfully
- standings computed deterministically
- “no duplicate winners” logic applied
- snapshot timestamp (ET) recorded
If any check fails: do not publish; keep last published snapshot live.

## Tie Resolution (Manual Only, Rare)
If standings remain tied after applying the deterministic stacks:
1) Identify tied entries
2) Consult Givebutter dashboard record for those entries (registration/joined/created timestamp)
3) Select earliest registrant
4) Record the tie-break decision in the snapshot notes (audit trail)

## Final Lock (June 3)
1) Confirm fundraiser + auction closed (after June 2 11:59:59 PM ET)
2) Generate final standings
3) Run tie checks
4) Publish “FINAL” snapshot
5) Archive an evidence copy (exported standings) for audit
