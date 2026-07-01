---
Doc Type: Report
Audience: Human + AI
Authority Level: Program Evidence
Status: Draft until #2045 PR merge
source issue: #2045
Parent Program: #2039
Owns: Task 005 donation/fundraiser public route readiness and campaign boundary evidence
Does Not Own: Live campaign launch, payment processing, or Program #1700 fundraiser operations
Canonical Reference: /docs/ops/reports/website-public-launch-gap-inventory.md
related issues: #2039, #2041, #2044, #2045, #2046, #2047, #1700
Last Reviewed: 2026-07-01
---

# Website Public Launch Fundraiser Boundary

## Purpose

Document public-safe donation and fundraiser messaging boundaries for Program #2039 Task #2045 without authorizing a live campaign launch.

## Scope

This report covers public homepage campaign spotlight behavior, About/Contact copy boundaries, Fan Club deferred campaign module messaging, and operator-only fundraiser preview tooling. It does not implement Givebutter checkout, payment flows, or Program #1700 fundraiser mechanics.

## Current known truth

- Homepage `CampaignSpotlightSlot` is fail-closed and renders only when valid published CMS config exists with `enabled: true`.
- Default campaign spotlight config ships with `enabled: false`.
- Fan Club `Campaign & Fundraiser` module fails closed with explicit separate-program messaging.
- `/admin/fundraiser-preview` is admin-only for operator preview and publish workflow.
- `/about` and `/contact` state there is no live LGFC website fundraiser campaign.
- Full fundraiser operations remain Program #1700.

## Intended final state

Public visitors see no false live-fundraiser claims. Any visible campaign spotlight requires explicit published CMS configuration and validated fundraiser data. Operator-owned vendor configuration (Givebutter, payment links) remains outside repo merge authority.

## Public route behavior

| Surface | Launch behavior | Owner |
| --- | --- | --- |
| Homepage `CampaignSpotlightSlot` | Hidden unless published CMS config is enabled and valid | #2045 fail-closed runtime |
| `/about` donation language | General ALS support only; no live campaign claim | #2042 copy |
| `/contact` coordination copy | Non-campaign coordination disclaimer | #2042 copy |
| `/fanclub` campaign module | Deferred/fail-closed placeholder | #1685 / #1700 boundary |
| `/admin/fundraiser-preview` | Admin-only configuration preview | Operator tooling |

## Privacy and vendor boundaries

| Topic | Repo boundary | Operator action |
| --- | --- | --- |
| Givebutter campaign URLs | Stored in CMS/fundraiser data only when operators publish | Bill/Atlas configure vendor accounts |
| Payment collection | Out of scope for #2039 | Program #1700 |
| PII in join/donation flows | Existing auth/join APIs unchanged | Legal/privacy review (#2042 escalation) |
| Live campaign go-live | Requires explicit Bill/Atlas authorization | Not implied by #2039 merge |

## Operator follow-up

1. Confirm official Givebutter or donation URLs before enabling campaign spotlight.
2. Keep `enabled: false` until launch authorization is recorded.
3. Route full fundraiser product work to Program #1700.
