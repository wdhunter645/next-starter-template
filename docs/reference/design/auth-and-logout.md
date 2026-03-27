---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Design Specification
Owns: Auth entry compatibility routes and logout behavior
Does Not Own: Global route inventory; non-auth UI standards
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-27
---

# Auth & Logout Page Specifications — LGFC

## `/auth` — Compatibility Auth Entry

**Route:** `/auth`  
**Access:** Public

## Purpose

`/join` is the canonical public Join/Login entry route.

`/login` is a legacy compatibility route that redirects to `/join#login`.

`/auth` is a compatibility/auth-processing route and not a separate primary entry route.

## Behavior

1. Canonical Join/Login entry is `/join`.
2. `/login` redirects to `/join#login`.
3. `/auth` mirrors Join/Login behavior without becoming a separate entry surface.
4. Day 1 auth model is LGFC-lite local session marker behavior (`lgfc_member_email` in localStorage).
5. Successful login routes to `/fanclub`.
6. Failed login or invalid session state redirects to `/`.

## `/logout` — Logout Handler

**Route:** `/logout`  
**Access:** Public

### Purpose

Clears Day 1 local member session state and returns the user to the public home page.

### Behavior

1. Clears `lgfc_member_email` from localStorage when present.
2. Clears any stale compatibility cookie/session artifacts if present.
3. Redirects to `/`.

### Notes

- Logout is triggered from the header Logout action.
- After redirect to `/`, header returns to visitor state.
- Visiting `/logout` while already logged out still redirects silently to `/`.
