---
Doc Type: As-Built
Audience: Human + AI
Authority Level: Historical
Owns: Snapshot summary of implemented Cloudflare frontend behaviors at review time
Does Not Own: Canonical design authority or governance policy
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-27
---

# Cloudflare Frontend — As-Built Snapshot

## Overview
This document records observed implementation details for the Cloudflare-hosted frontend. Canonical behavior remains defined by active specification/governance docs, not this historical snapshot.

## Source-of-Truth References
- Design authority: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- FanClub specification: `/docs/reference/design/fanclub.md`
- Access/auth model: `/docs/reference/architecture/access-model.md`
- PR governance: `/docs/governance/PR_GOVERNANCE.md`

## Routes (observed)
- Public home: `/`
- FanClub home: `/fanclub`
- FanClub subroutes: `/fanclub/photo`, `/fanclub/library`, `/fanclub/memorabilia`, `/fanclub/myprofile`
- Diagnostics: `/health`

## FanClub Home Implementation Notes
- Route file: `src/app/fanclub/page.tsx`
- Section components currently used:
  - `src/components/fanclub/WelcomeSection.tsx`
  - `src/components/fanclub/ArchivesTiles.tsx`
  - `src/components/fanclub/PostCreation.tsx`
  - `src/components/fanclub/DiscussionFeed.tsx`
  - `src/components/fanclub/GehrigTimeline.tsx`
  - `src/components/fanclub/AdminLink.tsx`

## Session/Auth Implementation Notes
- Session state is resolved via `/api/session/me` in `useMemberSession`.
- Logout route clears session and redirects to `/`.
- Admin behavior is role-driven in resolved session payload (no legacy standalone `/apifanclub/*` role endpoint dependency documented here).

## Homepage Implementation Notes
- Homepage section composition is implemented in `src/app/page.tsx`.
- Campaign spotlight is conditional via `src/components/home/CampaignSpotlightSlot.tsx`.
- Social Wall behavior depends on both CSP entries in `public/_headers` and runtime component initialization in `src/components/SocialWall.tsx`.

## Maintenance Rule
When page-level route or section behavior materially changes, update this as-built snapshot in the same PR and keep canonical links MD-based (no `.html` canonical references).
