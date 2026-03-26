---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: execution scope for FanClub header centering fix
Does Not Own: canonical design authority or unrelated website behavior
Canonical Reference: /docs/ops/OPERATING_MANUAL.md
Last Reviewed: 2026-03-26
---

# FanClub Header Centering Fix

## Objective
Fix the FanClub-only header alignment defect so the navigation controls are visually centered while the floating logo remains independent.

## Scope
- `src/components/FanClubHeader.tsx`
- directly associated FanClub header CSS module only
- one tiny adjacent file only if absolutely required for layout integrity

## Out of Scope
- public-page headers
- `FloatingLogo` visuals or behavior
- route changes
- metadata, search, matchup, or other homepage fixes

## Acceptance Criteria
- `/fanclub` header controls are visually centered and balanced
- floating logo behavior unchanged
- hamburger remains correctly aligned
- public-page headers unchanged
- no navigation/order/behavior drift
