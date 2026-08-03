---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Authentication and redirect behavior definitions as a supporting specification
Does Not Own: Product and Design Domain Policy; Join/Login UI composition; FanClub content layout; admin feature requirements
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Related Issues: #2687
Last Reviewed: 2026-07-21
---

# Authentication Model (Canonical Auth Source)

This file is the **canonical supporting specification** for authentication/session behavior and auth-related redirects under the Product and Design Domain Policy.

It is not a Domain Policy co-owner. Domain-policy conflicts resolve through `docs/governance/PRODUCT-AND-DESIGN.md`.

Canonical auth reference: /docs/reference/design/auth-model.md

## Day 1 Canonical Model (LOCKED)

LGFC Day 1 member access uses a **cookie-backed server session model** with **Cloudflare D1 as the only database**.

### Session
- Cookie name: `lgfc_session`
- Session store: D1 table `member_sessions`
- Session lookup endpoint: `/api/session/me`
- Member identity and role source: D1 table `members`

### Behavior
- Join/Login canonical page: `/join`
- Login tab entry point: `/join?mode=login`
- Login creates session + cookie, then redirects to `/fanclub`
- Logout clears the cookie and invalidates the session, then redirects to `/`
- Closing the browser does not immediately log the member out
- Online status is approximate and based on session records + `last_seen_at`

### Protected Routes
- `/fanclub`
- `/fanclub/**`

## Redirect Policy (LOCKED)

1. `/fanclub` or `/fanclub/**` when unauthenticated → `/`
2. Failed login/session validation → `/`
3. `/logout` completion (or already logged out) → `/`
4. `/login` legacy compatibility route → `/`
5. `/auth` legacy compatibility route → `/join`

## Prohibited in Active Docs

- localStorage as the auth source of truth
- external auth providers
- magic-link auth
- ADMIN_EMAILS as the primary auth gate
- hybrid cookie + localStorage auth narratives

## Governance / Enforcement

Subordinate docs must reference this file for auth behavior and must not redefine or conflict with it within the auth topic.

If subordinate design docs conflict on auth behavior, prefer this file, then resolve any remaining conflict through `docs/governance/PRODUCT-AND-DESIGN.md`.

Any file that mentions authentication/session/redirect behavior must include:

Canonical auth reference: /docs/reference/design/auth-model.md
