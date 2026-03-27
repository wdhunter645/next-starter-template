---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Design Specification
Owns: Homepage Friends section contract and integration expectations
Does Not Own: Partner onboarding process; third-party legal approvals
Canonical Reference: /docs/reference/design/home.md
Last Reviewed: 2026-03-27
---

# Homepage Section Spec — Friends of the Fan Club

## Purpose
Define the Friends section on `/` that highlights partner/supporter entities.

## Route / Path
- Host page: `/`
- Section anchor/id: `#friends-of-the-club`

## Section / Component Breakdown
- Section container in home page: `src/app/page.tsx`
- Section component owner: `src/components/FriendsOfFanClub.tsx`
- Styling owner: `src/components/FriendsOfFanClub.module.css`

## Data Dependencies
- Reads friend entries from site data/API used by `FriendsOfFanClub`.
- Must render a deterministic loading and empty fallback state.

## Auth / Access Expectations
- Publicly visible.
- No member authentication required.

## Key UX / Behavior Notes
- Section title is fixed: “Friends of the Fan Club”.
- Cards/entries should remain scannable and consistent with homepage spacing rhythm.
