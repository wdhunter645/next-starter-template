---
Doc Type: reference
Audience: human project owner and AI agents
Authority Level: supporting
Owns: Fan Club production definition, scope, actors, boundaries, success criteria
Does Not Own: implementation code, migrations, component internals, or operations runbooks
Canonical Reference: docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-05-29
---

# Fan Club Production Definition

## Purpose

The Fan Club system is the authenticated member area of the Lou Gehrig Fan Club website. It exists to give members a durable home for profile identity, member-card access, curated photos, library material, memorabilia views, and future member participation.

## Production location

Canonical Fan Club routes are:

- `/fanclub`
- `/fanclub/myprofile`
- `/fanclub/photo`
- `/fanclub/library`
- `/fanclub/memorabilia`

All `/fanclub` and `/fanclub/**` routes are auth-gated. Unauthenticated users redirect to `/`.

## Actors

- Public visitor: can view public pages and join/login entry points.
- Member: authenticated user with a valid `lgfc_session` and D1 `member_sessions` record.
- Admin: member with elevated authorization for administrative functions, but admin functions live under `/admin/**`, not inside the member Fan Club surface.
- AI agent: implements tasks from this documentation and related implementation plans without changing design authority.

## Data boundaries

The Fan Club depends on the canonical Day 1 D1 tables listed in the production design authority:

- `members`
- `member_sessions`
- `join_requests`
- `photos`
- `library_entries`
- `membership_card_content`

The `photos` table is the canonical photo store. Memorabilia is not a standalone table; it is a tagged or filtered view of `photos`. Written library content belongs in `library_entries` and may link to related `photos`.

## Member identity model

The member row is created during the Join process. The member profile page at `/fanclub/myprofile` represents the member record and is the canonical member identity surface.

The member card is not a standalone route. It is content shown on `/fanclub/myprofile`, consisting of instructional text plus front and back card imagery.

## Required member surfaces

### Club Home

`/fanclub` is the authenticated landing page. It should summarize member-only content and guide members to profile, photo, library, and memorabilia areas.

### My Profile

`/fanclub/myprofile` owns member-facing profile identity, member-card content, and future member self-service flows.

### Photo

`/fanclub/photo` presents member-accessible photo content sourced from the canonical `photos` table and associated B2 media URLs.

### Library

`/fanclub/library` presents written content from `library_entries`, with tagging and photo relationships where applicable.

### Memorabilia

`/fanclub/memorabilia` presents a filtered view of `photos` or related media tagged as memorabilia. It must not create or assume a separate memorabilia data store.

## Navigation contract

The Fan Club header on desktop and tablet exposes:

1. Club Home
2. My Profile
3. Search
4. Store
5. Logout

Mobile Fan Club navigation is handled by hamburger drawer and follows the production design authority. Admin access must not appear in the Fan Club hamburger drawer.

## Boundaries

The Fan Club system must not own:

- Admin moderation tools
- Admin dashboards
- Public footer behavior
- Store route creation
- D1 migration definitions
- B2 bucket configuration
- CI workflow behavior

## Success criteria

The Fan Club system is production-complete when:

- All canonical Fan Club routes exist and are reachable while authenticated.
- All Fan Club routes redirect unauthenticated users to `/`.
- Fan Club navigation matches the locked production design authority.
- Member profile and member-card content are visible on `/fanclub/myprofile`.
- Photo, library, and memorabilia surfaces use canonical D1 data boundaries.
- Memorabilia is implemented as a filtered/tagged view, not as a separate table.
- No Admin functionality leaks into the Fan Club navigation or member surfaces.

## Implementation documentation relationship

This document defines the target. The companion implementation plan decomposes the work into agent-consumable tasks. As-built and operations documentation must be produced after implementation PRs merge.