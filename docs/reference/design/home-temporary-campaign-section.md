
---
Doc Type: Design Reference
Audience: Human + AI
Authority Level: Section Design Reference
Owns: Temporary campaign spotlight section placement rules and homepage activation behavior
Does Not Own: Homepage canonical section order; global navigation standards
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-08
---

# Temporary Campaign Spotlight Section (Homepage)

Last Updated: 2026-03-08

## Purpose
This document defines the **conditional campaign section** that appears on the homepage between:

Hero Banner → Campaign Spotlight → Weekly Matchup

The section is **hidden by default** and only activated when a campaign or event is active.

## Placement Rule
Homepage render order:

1. Hero Banner
2. Campaign Spotlight (conditional)
3. Weekly Matchup
4. Join Section
5. Social Wall
6. Calendar
7. FAQ

When disabled the page behaves exactly as if the section does not exist.

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

/admin/fundraiser-preview

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

