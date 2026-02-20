---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Design Specification
Owns: Routes, navigation invariants, UI/UX contracts, page content contracts
Does Not Own: How-to procedures; operational runbooks; governance policies
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-02-20
---

## Headers (desktop only; mobile/tablet deferred)

All button groupings are page-centered. Hamburger is always present.

- Public, not logged in: Join, Search, Store, Login, Hamburger
- Public, logged in: Club Home, Search, Store, Logout, Hamburger
- FanClub (logged in): Club Home, My Profile, Search, Store, Logout, Hamburger
- FanClub (not logged in): redirect to public home (not logged in)

Hamburger menu items:
- /about (Fan Club history)
- /contact (admin + support contact info in text)

# LGFC — Navigation Invariants (AUTHORITATIVE)

## Footer (single design)

- Left:
  - Line 1: rotating quote from D1
  - Line 2: legal statement (static text)
- Center:
  - Small LGFC logo (uses the height of lines 1–2) that scrolls to top of current page
- Right:
  - Line 1: Terms + Privacy
  - Line 2: Contact
- No Support page. Contact page contains admin + support contact info in text.


This document is **authoritative**. If any UI or doc contradicts this file, this file wins.

Effective Date: 2026-01-21

---

## Canonical Routes — Day 1

### Public (visitor-accessible)
- `/` (Home)
- `/about`
- `/contact`
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
- ``
- `/fanclub/photo`
- `/fanclub/library`
- `/fanclub/memorabilia`

### Admin (admin gate)
- `/admin/**`
  - **UI Access:** Browser-reachable admin pages (diagnostic tools, CMS interfaces)
  - **API Access:** Token-gated via `ADMIN_TOKEN` environment variable
  - See `/docs/admin/access-model.md` for full admin access model documentation

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
The same center group of 4 buttons remains visible, plus **two additional buttons** appear to the right:

5. Club Home → `/fanclub`
6. Logout → `/logout`

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
  2. Contact → `/contact`
  3. Terms → `/terms`
  4. Privacy → `/privacy`

The footer must not display any email address directly.
