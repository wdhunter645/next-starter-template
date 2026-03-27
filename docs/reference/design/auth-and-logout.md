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

`/auth` is currently implemented as the public authentication entry route.

It hosts the shared Join and Login experience for Day 1 authentication/session behavior.

Within that shared experience:

- Join creates the member record only
- Login creates the authenticated session (`lgfc_session` + D1 `member_sessions`)
- Successful login proceeds to `/fanclub`

`/auth` must not be described as a separate localStorage-based auth source of truth.

## Behavior

1. On load, presents the public Join/Login entry experience
1. Supports the shared Day 1 auth model: Join for member creation, Login for cookie-backed session creation
1. Uses Day 1 session validation expectations through `/api/login` + `/api/session/me`
1. On successful authenticated state: proceed to `/fanclub`
1. On failed or invalid login/session state: remain in the public auth flow

## UI

Public authentication entry page containing the shared Join and Login experience.

## Notes

- This is a public auth route
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
