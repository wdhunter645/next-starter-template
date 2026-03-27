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

1. Hero Banner
2. Campaign Spotlight (conditional)
3. Weekly Photo Matchup
4. Join CTA
5. About Lou Gehrig
6. Social Wall
7. Recent Discussions (teaser)
8. Friends of the Fan Club
9. Milestones
10. Calendar
11. FAQ

When disabled, section #2 is omitted and all other sections retain the same locked order.

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
