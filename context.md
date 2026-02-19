# context.md — Repository Context (LGFC)

Effective Date: 2026-01-21

This is the high-level, human-readable summary of this repository. It is intended to orient any contributor, Agent, or AI system quickly and correctly.

---

## Purpose

- Operate the **Lou Gehrig Fan Club** website (public site + FanClub authenticated area).
- Maintain strict design + navigation invariants as the primary product requirement.

---

## Stack

- Next.js (App Router) + TypeScript
- Cloudflare Pages deployment (static export build)
- Cloudflare D1 for content/data (FAQs, quotes, membership-related data, etc.)
- Backblaze B2 for media (Store is external; B2 is for images/assets)

---

## Auth Model (current implementation)

- Login state is represented client-side via `localStorage` key: `lgfc_member_email`.
- FanClub routes (`/fanclub/**`) are protected by redirecting unauthenticated traffic to `/`.
- Admin privilege is determined by `/api/member/role?email=...`.

---

## Canonical Routes (Day 1)

Authoritative list is in `/docs/NAVIGATION-INVARIANTS.md`.

High-level:
- Public: `/`, `/about`, `/contact`, `/terms`, `/privacy`, `/search`, `/join`, `/login`, `/logout`, `/faq`, `/health`
- FanClub (auth required): `/fanclub` and `/fanclub/**` subpages
- Admin: `/admin/**`
- Store: external Bonfire link only (no `/store` route)

---

## Design Sources of Truth

- `/docs/LGFC-Production-Design-and-Standards.md`
- `/docs/NAVIGATION-INVARIANTS.md`
- `/docs/fanclub.md`

If any code or other doc conflicts with these, these win.

---
