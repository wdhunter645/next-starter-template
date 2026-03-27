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

# `/auth` — Authentication Handler

**Route:** `/auth`  
**Access:** Public (handles redirects post-login)  
**Desktop only.** Mobile/tablet implementation is deferred.

## Purpose

`/auth` is a handler route, not a member-facing destination.

Day 1 canonical authentication is cookie-backed and server-validated through `/api/login` + `/api/session/me` using `lgfc_session` and D1 `member_sessions`.

If `/auth` is used in a flow, it must remain aligned to that same Day 1 model and must not become a separate localStorage-based source of truth.

## Behavior

1. On load, processes auth callback/transition state when present
1. Uses Day 1 session validation expectations (cookie-backed session resolution via `/api/session/me`)
1. On successful authenticated state: proceed to `/fanclub`
1. On failed or invalid callback/session state: redirect to `/join#login`

## UI

No persistent UI. During processing, display a minimal loading state:

```
[Centered in viewport]
  "Signing you in…"
  [Spinner or simple loading indicator]
```

- Background: page background `#f5f7fb`
- Text: `16px`, color `#666666`

## Notes

- This page should not appear in navigation or be linked directly
- If user navigates to `/auth` with no usable callback/session context, redirect to `/`
- Day 1 canonical auth/session behavior is defined in:
  - `docs/reference/design/join-login.md`
  - `docs/reference/design/LGFC-Production-Design-and-Standards.md`

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
