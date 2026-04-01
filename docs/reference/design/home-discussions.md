---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Design Specification
Owns: Homepage recent discussions teaser contract and behavior
Does Not Own: Full FanClub discussion feature set; moderation policy
Canonical Reference: /docs/reference/design/home.md
Last Reviewed: 2026-03-27
---

# Homepage Section Spec — Recent Discussions Teaser

## Purpose
Define the public-home teaser section that previews recent club discussions and drives members to authenticated discussion flows.

## Route / Path
- Host page: `/`
- Section anchor/id: `#recent-club-discussions`

## Section / Component Breakdown
- Component owner: `src/components/RecentDiscussionsTeaser.tsx`
- Included from `src/app/page.tsx`

## Data Dependencies
- Reads latest posted discussions through the teaser’s backing API/data adapter.
- Must show deterministic loading and failure-safe fallback copy.

## Auth / Access Expectations
- Publicly viewable teaser content.
- Member-authenticated creation/reply flows remain in FanClub routes.

## Key UX / Behavior Notes
- Keep teaser scoped (summary style), not full threaded discussion UI.
- Preserve clear visual hierarchy between this teaser and deeper FanClub discussion experiences.
