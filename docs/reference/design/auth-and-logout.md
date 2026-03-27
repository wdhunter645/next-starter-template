---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Design Specification
Owns: Auth compatibility-route purpose and logout page contract
Does Not Own: Canonical auth/session rules and redirect policy
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-27
---

# Auth & Logout Page Specifications — LGFC

Canonical auth reference: /docs/reference/design/auth-model.md

## `/auth` — Compatibility Auth Entry

**Route:** `/auth`  
**Access:** Public

## Purpose

`/join` is the canonical public Join/Login entry route.

`/login` is a legacy compatibility route that redirects to `/`.

`/auth` is a compatibility/auth-processing route and not a separate primary entry route.

## Behavior

1. Canonical Join/Login entry is `/join`.
2. `/login` redirects to `/`.
3. `/auth` mirrors Join/Login behavior without becoming a separate entry surface.
4. Auth/session and redirect behavior are governed by `auth-model.md`.

## `/logout` — Logout Handler

**Route:** `/logout`  
**Access:** Public

### Purpose

Clears Day 1 local member session state and returns the user to the public home page.

### Behavior

1. Clears the `lgfc_session` cookie.
2. Invalidates the corresponding server session record in `member_sessions`.
3. Redirects to `/`.

### Notes

- Logout is triggered from the header Logout action.
- After redirect to `/`, header returns to visitor state.
- Visiting `/logout` while already logged out still redirects silently to `/`.
