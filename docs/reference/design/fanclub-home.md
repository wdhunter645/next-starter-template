---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Design Specification
Owns: FanClub home route purpose, section contracts, data dependencies
Does Not Own: FanClub subpage specs; API schema details; implementation internals
Canonical Reference: /docs/reference/design/fanclub.md
Last Reviewed: 2026-03-27
---

# `/fanclub` — FanClub Home Page Specification

## Purpose
Define the authenticated FanClub member home experience and locked section sequence.

## Route / Path
- Canonical route: `/fanclub`
- Access boundary: authenticated members only (`/fanclub/**`)
- Unauthenticated behavior: redirect to `/`

## Section / Component Breakdown
1. Page shell + member gate: `src/app/fanclub/page.tsx`
2. Welcome: `src/components/fanclub/WelcomeSection.tsx`
3. Archives tiles: `src/components/fanclub/ArchivesTiles.tsx`
4. Post creation: `src/components/fanclub/PostCreation.tsx`
5. Discussion feed: `src/components/fanclub/DiscussionFeed.tsx`
6. Gehrig timeline: `src/components/fanclub/GehrigTimeline.tsx`
7. Admin link (conditional): `src/components/fanclub/AdminLink.tsx`

## Data Dependencies
- Member session state from `useMemberSession` hook.
- Discussions feed + post submission APIs used by `DiscussionFeed` and `PostCreation`.
- Welcome/event summary reads upcoming events.
- Admin-link visibility depends on resolved member role.

## Auth / Access Expectations
- Route is member-only.
- Session/role checks are required before rendering member content.
- Admin-only affordances are conditional UI, not a global route override.

## Key UX / Behavior Notes
- This page is distinct from public home (`/`).
- Section order is locked and must not be rearranged without design-authority change.
- Floating logo remains present and links to `/`.
