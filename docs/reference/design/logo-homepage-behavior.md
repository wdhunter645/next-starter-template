---
Doc Type: Design Spec
Audience: Human + AI
Authority Level: Supporting
---

# Homepage Logo Behavior (Canonical)

## Purpose
Define the correct rendering behavior for the LGFC logo on homepage and fanclub homepage.

## Rules

1. Homepage and FanClub homepage use a floating logo overlay model
2. Logo is NOT part of header layout flow
3. Logo is a separate positioned element
4. Anchor: top-left (tight to edges)
5. Logo is intentionally larger than standard header logo
6. Header and Hero render underneath the logo
7. Logo must visually overlap hero section

## Non-Homepage Pages

- Use standard inline header logo
- No floating behavior

## Constraints

- Do NOT modify header button layout
- Do NOT introduce layout shift
- Must be mobile safe

## Enforcement

This behavior is intentional branding and must not be refactored away.

## Implementation

- Component: `src/components/FloatingLogo.tsx` and `FloatingLogo.module.css`.
- Mounted only from `src/app/page.tsx` and `src/app/fanclub/page.tsx`.
- `SiteHeader` hides the small header logo on `/` and `/fanclub` via `showFloatingLogo` so the mark is not duplicated.
