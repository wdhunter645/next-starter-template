---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Design Specification
Owns: Routes, navigation invariants, UI/UX contracts, page content contracts
Does Not Own: How-to procedures; operational runbooks; governance policies
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-02-20
---

# LGFC — FanClub Area Specification (AUTHORITATIVE)

Status: LOCKED — PRODUCTION SOURCE OF TRUTH  
Effective Date: 2026-01-21

This document defines the **FanClub** (authenticated) experience and routes.
If any UI, code, or other doc conflicts with this file, this file wins.

---

## Runtime Platform Context

FanClub behavior runs on **Cloudflare Pages + Cloudflare Pages Functions**.
Auth/session, join/login, and member data flows rely on runtime APIs under `functions/api/**`.

---

## Canonical Route

- **FanClub Home (Club Home)**: `/fanclub`
- Auth boundary: `/fanclub` and all `/fanclub/**` routes require login.
- Unauthenticated access to `/fanclub/**` must **redirect to** `/` (public home).

---

## FanClub Header (single variant)

The FanClub header has **one** variant because unauthenticated traffic is redirected away.

Desktop/Tablet buttons (in this exact order):
1. Club Home → `/fanclub`
2. My Profile → `/fanclub/myprofile`
3. Search → `/search`
4. Store → external Bonfire link (no `/store` route)
5. Logout → `/logout`

Global logo behavior:
- The logo always links to **public home** `/` across the entire site (public, fanclub, admin).

---

## FanClub Pages

FanClub-only subpages (canonical):
- `/fanclub/photo`
- `/fanclub/library`
- `/fanclub/memorabilia`
- `/fanclub/myprofile`

Notes:
- The public routes `/photo`, `/photos`, `/library`, `/memorabilia` must not exist (fanclub only).

---

## FanClub Home Page (Club Home) — section order

The FanClub home must present the following sections in this order:

1. Header (rendered by the global header system)
2. Welcome Section
3. Archives Tiles (Photo, Memorabilia, Library) — links to the FanClub subpages
4. Post Creation / Work Area
5. Member Discussion Feed
6. Gehrig Timeline
7. Admin Dashboard Link (conditional; admins only)

The profile and member card are separate pages (linked), not inline sections.

---

## Weekly Photo Matchup Interaction (explicit design note)

- The current Weekly Photo Matchup (Photo A vs Photo B) is displayed as an inline section on the **public home page**.
- The results route `/weeklyvote` is a **hidden results page** revealed only **after** a user votes.
- This is intentionally deferred for implementation detail work; do not delete existing weekly-related routes during the FanClub routing migration.
