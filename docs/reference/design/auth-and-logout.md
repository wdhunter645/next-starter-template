---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Design Specification
Owns: Routes, navigation invariants, UI/UX contracts, page content contracts
Does Not Own: How-to procedures; operational runbooks; governance policies
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-27
---

# Auth & Logout Page Specifications — LGFC

-----

# `/auth` — Authentication Entry

**Route:** `/auth`  
**Access:** Public  
**Desktop only.** Mobile/tablet implementation is deferred.

## Purpose

`/join` is the primary public Join/Login entry route for Day 1 authentication/session behavior.

`/login` is a legacy compatibility route that redirects to `/join#login`.

`/auth` is not the canonical public Join/Login source of truth; if retained, it is a supporting compatibility/auth-processing route only.

`/auth` must not be described as a separate localStorage-based auth source of truth.

## Behavior

1. Canonical public Join/Login entry is `/join` (with `/join#login` for login mode)
1. `/login` is handled as legacy routing behavior to `/join#login`
1. `/auth` is non-primary and must not be treated as the canonical Join/Login host
1. Day 1 auth model remains cookie-backed: Join creates member record, Login creates authenticated session (`lgfc_session` + D1 `member_sessions`)
1. Successful login proceeds to `/fanclub`; failed/invalid login/session state remains in the public auth flow

## UI

When used, `/auth` should mirror the same Day 1 Join/Login behavior without becoming a separate canonical public entry route.

## Notes

- Primary public auth entry is `/join` (not `/auth`)
- `/login` remains legacy redirect behavior to `/join#login`
- `/auth` is supporting/compatibility-only, not canonical
- Day 1 canonical auth/session behavior is defined in:
  - `docs/reference/design/join-login.md`
  - `docs/reference/design/LGFC-Production-Design-and-Standards.md`
- Join and Login remain separate functions even when presented through one shared route/form shell

-----

# `/logout` — Logout Handler

**Route:** `/logout`  
**Access:** Public (no auth required to visit — handles clearing session)  
**Desktop only.** Mobile/tablet implementation is deferred.

## Purpose

Clears the Day 1 cookie-backed member session and redirects to the public home page.

## Behavior

1. On load: calls logout endpoint to clear `lgfc_session` and remove the server-side session record from D1 `member_sessions`
1. Clears stale legacy local browser auth key (`lgfc_member_email`) when present
1. Redirects to `/` (public home)

## UI

No persistent UI. Momentary transition state only:

```
[Centered in viewport]
  "Signing out…"
```

- Same minimal loading style as `/auth`
- Redirect happens within 1 second

## Notes

- Logout is triggered by the Logout button in the header
- After redirect to `/`, header returns to visitor (not-logged-in) state
- No confirmation dialog — logout is immediate
- If user is already logged out and visits `/logout`, redirect to `/` silently
- Closing the browser is not treated as an immediate logout/offline signal in Day 1
