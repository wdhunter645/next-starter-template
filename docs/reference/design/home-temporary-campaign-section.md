---
Doc Type: Design Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Temporary campaign spotlight section placement rules and homepage activation behavior
Does Not Own: Homepage canonical section order; global navigation standards
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-27
---

# Temporary Campaign Spotlight Section (Homepage)

Last Updated: 2026-03-27

## Purpose
This document defines the **conditional campaign spotlight slot** on the homepage.

Canonical order authority remains `LGFC-Production-Design-and-Standards.md` and `home.md`.
This file provides subordinate rules for the campaign section only.

## Placement Rule
Homepage render order is:

1. HEADER
2. BANNER
3. SPOTLIGHT (hidden by default)
4. WEEKLY MATCHUP
5. JOIN
6. ABOUT
7. SOCIAL
8. DISCUSSIONS
9. FRIENDS
10. MILESTONES
11. CALENDAR
12. FAQ/ASK
13. FOOTER

When disabled, section #3 remains hidden (slot preserved) and all other sections retain the same locked order.

## Permanent Structure
The section layout itself **does not change** between campaigns.

Stable elements:
- typography
- spacing
- container layout
- heading structure
- CTA placement

Only the **content inside the section changes**.

Examples:
- ALS Fundraiser 2026
- Lou Gehrig Day 2026
- Special Fan Club campaigns

## Development Location

Because the section is hidden by default, development occurs in the admin dashboard.

Admin preview route:

`/admin/fundraiser-preview`

Purpose:
- build campaigns safely
- preview layout
- verify spacing/typography
- test API integrations
- validate leaderboard logic

Only after validation is the section enabled on the homepage.

## Activation Rules

The section becomes visible when:

- campaign configuration exists
- required data sources respond successfully
- preview validation completed

Otherwise it remains hidden.
