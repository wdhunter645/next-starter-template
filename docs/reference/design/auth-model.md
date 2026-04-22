---
Doc Type: Design Authority
Audience: Human + AI
Authority Level: Controlled
Owns: Canonical authentication and redirect behavior definitions
Does Not Own: Join/Login UI composition; FanClub content layout; admin feature requirements
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-04-22
---

# Authentication Model (Canonical Auth Source)

This file is the **single owner/source of truth** for authentication/session behavior and auth-related redirects.

Canonical auth reference: /docs/reference/design/auth-model.md

## Day 1 Canonical Model (LOCKED)

LGFC Day 1 member access uses a **cookie-backed server session model** with **Cloudflare D1 as the only database**.

### Session
- Cookie name: `lgfc_session`
- Session store: D1 table `member_sessions`
- Session lookup endpoint: `/api/session/me`
- Member identity and role source: D1 table `members`

### Behavior
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

## Prohibited in Active Docs

- localStorage as the auth source of truth
- external auth providers
- ADMIN_EMAILS as the primary auth gate
- hybrid cookie + localStorage auth narratives

## Governance / Enforcement

Subordinate docs must reference this file for auth behavior and must not redefine or conflict with it.

If any subordinate doc conflicts with this file, **this file wins**.

Any file that mentions authentication/session/redirect behavior must include:

Canonical auth reference: /docs/reference/design/auth-model.md
