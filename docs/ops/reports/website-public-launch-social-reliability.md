---
Doc Type: Report
Audience: Human + AI
Authority Level: Program Evidence
Status: Draft until #2044 PR merge
source issue: #2044
Parent Program: #2039
Owns: Task 004 media/social reliability and fallback evidence
Does Not Own: Vendor contract changes, scraping, or new paid social integrations
Canonical Reference: /docs/ops/reports/website-public-launch-gap-inventory.md
related issues: #2039, #2041, #2043, #2044, #2045, #2046, #2047
Last Reviewed: 2026-06-30
---

# Website Public Launch Social Reliability

## Purpose

Record Task #2044 fallback behavior for the homepage Elfsight social wall.

## Current known truth

- Homepage `SocialWall` still uses the existing Elfsight widget (`elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8`).
- Widget load failures or timeouts now render repo-owned fallback links for Facebook, Instagram, X/Twitter, and Pinterest.
- Fallback links point to platform-origin URLs; operator-owned official profile URLs remain a Bill/Atlas content decision.

## Platform handling

| Platform | Widget dependency | Fallback behavior |
| --- | --- | --- |
| Facebook | Elfsight feed | Direct platform link + reliability note |
| Instagram | Elfsight feed + CSP image hosts | Direct platform link + reliability note |
| X/Twitter | Elfsight feed | Direct platform link + reliability note |
| Pinterest | Optional in widget feed | Direct platform link + reliability note |

## Out of scope

- Scraping or bypassing platform terms
- New paid social vendors without explicit approval
- Replacing Elfsight in this task

## Operator follow-up

Bill/Atlas may replace generic platform home links with verified official Lou Gehrig Fan Club profile URLs when those accounts are confirmed.
