---
Doc Type: Design Authority
Audience: Human + AI
Authority Level: Canonical
Owns: Production behavior, routing rules, navigation invariants
Does Not Own: Implementation details inside components
Canonical Reference: /docs/governance/standards/document-authority-hierarchy_MASTER.md
Last Reviewed: 2026-03-27
---

# LGFC Production Design and Standards

This document defines the **production behavior of the Lou Gehrig Fan Club website**.

All implementations must conform to this document.

If any implementation conflicts with this file, **this document wins**.

---

# Runtime Platform Model (LOCKED)

Production runtime is **Cloudflare Pages + Cloudflare Pages Functions**.

- Static assets/routes are built by Next.js and served from Pages.
- Runtime read/write APIs are served from `functions/api/**`.
- The site is **not** pure static-only when validating auth, join/login, CMS reads, footer quote, or member flows.

---

# Navigation Model

Navigation is divided into four logical areas:

Public  
FanClub  
Admin  
Store

---

# Canonical Routes

Public:
/, /about, /contact, /terms, /privacy, /search, /join, /login, /auth, /logout, /faq, /ask, /health

FanClub (auth required):
/fanclub, /fanclub/myprofile, /fanclub/photo, /fanclub/library, /fanclub/memorabilia

Admin:
/admin/**

Store:
external Bonfire link (no /store route)

---


# Canonical Redirect Policy

- Protected FanClub routes (`/fanclub` and `/fanclub/**`) are auth-gated.
- If a user is unauthenticated, redirect to `/` (public home).
- If authentication/session validation fails, redirect to `/` (public home).
- `/login` is a legacy compatibility route and must redirect to `/`.

---

# Public Header (not logged in)

Buttons:

Join  
Search  
Store (external)  
Login

---

# Public Header (logged in)

Buttons:

Club Home  
Search  
Store (external)  
Logout  

(4 total — Club Home replaces Join, Logout replaces Login)

---

# Header Button Mapping

Join → /join  
Login → /join  
Club Home → /fanclub  
Search → /search  
Store → external Bonfire link  
Logout → /logout  

---

# FanClub Header

Buttons:

Club Home  
My Profile  
Search  
Store (external)  
Logout

---

# Hamburger Menu Behavior

Store is:
A page link in mobile hamburger menus only.

---

# Footer

Right column — two-row layout:

Row 1: Privacy → `/privacy`, Terms → `/terms`  
Row 2: Contact → `/contact`

Left: D1-backed rotating quote + dynamic-year copyright  
Center: LG logo — scroll-to-top affordance (not route navigation)

Constraints:
- No `mailto:` footer link
- No Admin link in the public footer
- Contact/support email belongs on `/contact`, not in footer navigation
- No extra footer links beyond the locked set

---

## Data Model (Cloudflare D1)

The LGFC platform uses **Cloudflare D1** as its primary relational datastore.

Canonical Day 1 data references:

- `members`
- `member_sessions`
- `join_requests`
- `photos`
- `library_entries`
- `membership_card_content`

Canonical rules:

- `photos` is the D1 table name and must be used consistently in design documentation when referring to the photo data store.
- Memorabilia is **not** a standalone table. It is a tagged/filtered view of `photos`.
- `library_entries` is the written content table and should support tagging plus linkage to related `photos`.
- `/fanclub/myprofile` is a page per member in `members`.
- The member row is created during the JOIN process.
- Membership card is **not** a page. It is instructions text plus front/back card images shown on `/fanclub/myprofile`.

Implementation-level schema definitions and migrations are maintained separately from the design authority.

---

## Authentication Model (Canonical Day 1 Reference)

Canonical auth reference: /docs/reference/design/auth-model.md

Day 1 auth/session and redirect behavior is defined in the canonical auth document.

- `/join` remains the canonical Join/Login page.
- `/login` is legacy compatibility and redirects to `/`.
- Day 1 auth uses the canonical cookie-backed session model (`lgfc_session` + D1 `member_sessions`).
- Protected FanClub routes (`/fanclub` and `/fanclub/**`) enforce auth and redirect unauthenticated users to `/`.
- Any failed auth/session validation path redirects to `/`.

---

## Homepage Canonical Section Order

Homepage sections are locked to this order:

1. HEADER
2. BANNER
3. SPOTLIGHT (hidden by default)
4. WEEKLY MATCHUP
5. JOIN
6. ABOUT
7. SOCIAL
8. DISCUSSIONS
9. FRIENDS
10. MILESTONES
11. CALENDAR
12. FAQ/ASK
13. FOOTER

---

## Weekly Photo Matchup (Homepage Section)

- Location: Homepage section #4, after the Spotlight slot
- Function: A/B image voting (Photo A vs Photo B)
- UI Elements:
  - Two images labeled Photo A and Photo B
  - Buttons: "Vote A" and "Vote B"
- Behavior:
  - User selects one option
  - Vote submitted via API
  - Results display is future enhancement
  - Content rotates weekly (operational process)

---

## Feature Mapping (Design → Implementation)

- WeeklyMatchup (design term)
  = Weekly Photo Matchup (as-built UI label)
  = Homepage section (not a dedicated route)
  = Component: WeeklyMatchup.tsx

---

## Verification Rule

Feature validation must be based on rendered UI and behavior, not file names or assumed routes.

---

## Floating Logo (Homepage + FanClub Only)

### Scope
- Appears ONLY on:
  - /
  - /fanclub
- MUST NOT appear on any other routes
- All other pages use the standard header logo

### Positioning
- position: fixed
- top: 0
- left: 0
- padding: 8px

### Size (LOCKED)
- height: clamp(120px, 28vw, 180px)
- width: auto
- max-width: none
- object-fit: contain
- border-radius: 12px

### Layering
- z-index: 60

### Behavior
- Visible on initial load
- Hidden after ~320px scroll
- Reappears when scrolling to top

### Interaction
- Click routes to /

### Separation of Concerns
- Floating logo is NOT part of header
- Header logo remains persistent across all pages

### Governance Rule
- Any change to FloatingLogo.tsx or FloatingLogo.module.css MUST:
  1. Update this section
  2. Reference change in PR
  3. Validate on / and /fanclub
