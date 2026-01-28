# LGFC — Navigation Invariants (AUTHORITATIVE)

This document is **authoritative**. If any UI or doc contradicts this file, this file wins.

Effective Date: 2026-01-21

---

## Canonical Routes — Day 1

### Public (visitor-accessible)
- `/` (Home)
- `/about`
- `/contact`
- `/support`
- `/terms`
- `/privacy`
- `/search`
- `/join`
- `/login`
- `/logout`
- `/faq`
- `/health`

### FanClub (auth required; unauthenticated traffic redirects to `/`)
- `/fanclub`
- `/fanclub/myprofile`
- `/fanclub/membercard`
- `/fanclub/photo`
- `/fanclub/library`
- `/fanclub/memorabilia`

**Authentication Enforcement:** The `/fanclub/**` routes are protected by a hard-gate implemented in `/fanclub/layout.tsx`. Unauthenticated users (those without 'lgfc_member_email' in localStorage) are immediately redirected to `/` (home page).

### Admin (admin gate)
- `/admin/**`

### Store
- Store is an **external** Bonfire link. There is **no** `/store` route.

### Weekly Vote
- Weekly vote routes are in transition. Do **not** delete existing weekly-related routes until the home page + hidden results page behavior is finalized.

---

## Global Header — Public pages

### Public header (not logged in)
Desktop/Tablet buttons (centered, fixed order):
1. Join → `/join`
2. Search → `/search`
3. Store → external Bonfire link
4. Login → `/login`

### Public header (logged in, but browsing public pages)
When logged in, the 4 public buttons remain, but Login is replaced with Club Home + Logout (5 total buttons):

1. Join → `/join`
2. Search → `/search`
3. Store → external Bonfire link
4. Club Home → `/fanclub`
5. Logout → `/logout`

Note: The header uses client-side localStorage ('lgfc_member_email') to determine login state.
When logged in, the Login button is replaced by Club Home and Logout buttons.

---

## FanClub Header — `/fanclub/**`

Single header variant (because unauthenticated traffic redirects to `/`):

1. Club Home → `/fanclub`
2. My Profile → `/fanclub/myprofile`
3. Search → `/search`
4. Store → external Bonfire link
5. Logout → `/logout`

Global logo behavior:
- The logo always links to `/` across the entire site.

---

## Footer (global)

Layout is locked:

- Left (left-justified)
  - Line 1: Quote (rotating)
  - Line 2: Legal tag

- Center
  - Small LGFC logo; clicking it scrolls to top of the current page (no navigation)

- Right (right-justified links, exact order)
  1. Contact → `/contact`
  2. Support → `/support`
  3. Terms → `/terms`
  4. Privacy → `/privacy`

The footer must not display any email address directly.
