---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Design Specification (Addendum)
Owns: Temporary Home section contract + enable/disable behavior + placement exception
Does Not Own: Navigation labels/order; route map; long-term redesign; fundraising program policy outside this section
Canonical Reference: /docs/reference/design/home.md
Last Reviewed: 2026-02-26T13:14:02Z
---

# Home Temporary Campaign Section (Addendum — Conditional Insert)

## Scope
This document defines a **temporary, conditional** campaign section on the public Home page.

- **Default state:** hidden (section not rendered).
- **When enabled:** rendered **between** the Hero Banner and Weekly Photo Matchup.
- **No navigation or routing changes** are introduced by this addendum.

## Placement
Canonical order in `/docs/reference/design/home.md` remains authoritative **when the section is disabled**.

When enabled, Home renders:

1) Hero Banner
2) **Temporary Campaign Section (this document)**
3) Weekly Photo Matchup
4) Join CTA
5) Social Wall
6) Recent Discussions (teaser)
7) Friends of the Fan Club
8) Milestones
9) Calendar
10) FAQ

## Visibility Rules (Fail‑Closed)
The section MUST NOT render unless all of the following are true:

- Campaign spotlight is explicitly enabled (feature flag / content presence as defined by implementation).
- Required presentation materials are available.
- Data required to display **standings** is available as a published snapshot (or the section is configured to show “info only” without standings).

If any requirement fails, the section renders nothing and Home remains visually stable.

## Content Contract (High Level)
When enabled, the section may contain:

- Title + short description (event‑specific)
- Primary CTA: campaign link (external)
- Optional CTA: auction link (external; may be shown only during auction window)
- Optional embedded live feed (external iframe)
- Optional leaderboard summary (from published snapshot)

## First Use (Locked)
First use of this temporary section is:

**Lou Gehrig Fan Club ALS Fundraiser 2026**

See: `docs/reference/design/als-fundraiser-2026-campaign-spotlight.md`

## Security / Privacy
- No donor PII is stored or displayed by this section.
- Donor metric uses **Supporters** as reported by Givebutter (public data mode).

## Accessibility
- All buttons/links must be keyboard accessible.
- iframe includes a descriptive title.
- Section must not introduce focus traps.
