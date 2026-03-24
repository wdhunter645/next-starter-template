# T19 — Footer invariants reopen

## Problem
Footer currently includes mailto/Gmail behavior which violates locked design authority.

## Required Fix
- Remove mailto/email support link from footer
- Ensure footer right column matches:
  - Privacy
  - Terms
  - Contact (/contact only)
  - Admin (admin only)

## Constraints
- No other layout changes
- No additional links
- No styling changes outside scope

## Exit Criteria
Footer matches LGFC-Production-Design-and-Standards.md exactly.
