---
Doc Type: Design Reference
Audience: Human + AI
Authority Level: Supporting Design
Owns: Homepage and FanClub homepage floating logo presentation behavior
Does Not Own: Global header navigation invariants, non-homepage logo behavior, implementation details outside the approved floating-logo pattern
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-25
---

# Homepage Logo Behavior

## Purpose
Define the approved logo presentation behavior for the homepage and FanClub homepage only.

## Canonical Rule

Homepage and FanClub homepage use a floating logo overlay model.

This is intentional.

The logo on these two surfaces is:
- larger than the standard header logo
- rendered as a separate positioned element
- not part of normal header layout flow
- anchored tight to the top-left area
- layered above the header and hero presentation

Header and hero content render underneath this logo layer.

## Route Scope

This behavior applies only to:
- `/`
- `/fanclub`

All other routes keep the standard small inline header logo.

## Constraints

- Do not change header button order or route behavior
- Do not change hamburger behavior
- Do not introduce duplicate logo rendering
- Do not convert non-homepage routes to the floating logo model
- Must remain mobile-safe and avoid clipping/blocking core UI

## Implementation Notes

Current implementation uses:
- `src/components/FloatingLogo.tsx`
- `src/components/FloatingLogo.module.css`

The floating logo is mounted from:
- `src/app/page.tsx`
- `src/app/fanclub/page.tsx`

`SiteHeader` hides the standard small header logo on `/` and `/fanclub` so the logo is not duplicated.

## Enforcement

This behavior is an approved branding/layout rule and must not be refactored away unless the design authority is intentionally changed first.
