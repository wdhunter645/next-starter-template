# Auth & Logout Page Specifications — LGFC

-----

# `/auth` — Authentication Handler

**Route:** `/auth`
**Access:** Public (handles redirects post-login)
**Desktop only.** Mobile/tablet implementation is deferred.

## Purpose

`/auth` is a client-side handler page, not a user-facing destination.
It processes the result of an authentication event (e.g., email confirmation
link click from welcome email) and redirects accordingly.

Both are thin handler pages with no persistent UI — just a “Signing you in…” / “Signing out…” momentary state before redirecting.​​​​​​​​​​​​​​​​

## Behavior

1. On load, reads URL parameters (e.g., token, email, status)
1. Validates the session or token
1. On success: sets `lgfc_member_email` in localStorage and redirects to `/fanclub`
1. On failure: redirects to `/login` with an error indicator

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
- If user navigates to `/auth` with no parameters, redirect to `/`
- Part of the LGFC-Lite local session model (see `docs/design/login.md`
  and `docs/design/phases.md`)

-----

-----

# `/logout` — Logout Handler

**Route:** `/logout`
**Access:** Public (no auth required to visit — handles clearing session)
**Desktop only.** Mobile/tablet implementation is deferred.

## Purpose

Clears the member session and redirects to the public home page.

## Behavior

1. On load: removes `lgfc_member_email` from localStorage
1. Sets member status to Inactive in D1 (presence/online model)
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
