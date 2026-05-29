---
Doc Type: Reference
Audience: human project owner and AI agents
Authority Level: supporting
Owns: Fan Club production definition, scope, actors, boundaries, success criteria
Does Not Own: implementation code, migrations, component internals, or operations runbooks
Canonical Reference: docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-05-29
---

# Fan Club Production Definition

## Purpose

The Fan Club system is the authenticated member area of the Lou Gehrig Fan Club website.

## Production location

Canonical routes:

- `/fanclub`
- `/fanclub/myprofile`
- `/fanclub/photo`
- `/fanclub/library`
- `/fanclub/memorabilia`

All Fan Club routes are auth-gated.

## Actors

- Public visitor
- Member
- Admin
- AI agent

## Data boundaries

Uses canonical member, session, photo, library, and membership-card data sources.

## Navigation contract

Fan Club navigation exposes Club Home, My Profile, Search, Store, and Logout.

## Boundaries

The Fan Club system does not own admin tools, public footer behavior, store implementation, migrations, B2 configuration, or CI behavior.

## Success criteria

Canonical routes exist, auth gates function, navigation matches authority, profile/member-card content exists, and photo/library/memorabilia experiences use canonical data boundaries.