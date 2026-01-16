# LGFC-Lite Design Notes — Open Topics (SHADOW) — January 15, 2026

This document captures **topics discussed that still require further design lock**.
It exists to support clean thread transitions and prevent loss of “still open” decisions.

---

## A) MEMBER/page.tsx (Members Home) — NOT COMPLETE
- Final section inventory (beyond hero) and ordering
- What sits directly under the hero
- Discussions module placement (full feed vs preview)
- Recent Activity / What’s New area (exists? what content types?)
- Member Resources tiles (which ones exist in v1 vs deferred; link behaviors)
- Admin Tools entry (conditional visibility + destination set)
- Contract for Home “Recent Discussion” teaser (exact fields, excerpt rules, count)

---

## B) My Profile Page — NOT DISCUSSED RECENTLY
- Exact fields shown/editable (name, screen name, email, etc.)
- Profile photo selection UI from gallery (selection UX + eligibility)
- Email change verification flow (magic link re-verify behavior)
- Any contribution summary vs account-only focus

---

## C) Search — Scope & UX Rules
- Visitor search: scope (public only? does it include FAQ only?)
- Member search: scope (discussions, library, photos, FAQs, etc.)
- Whether search appears in member header (not locked)
- Search results page design and empty-state behaviors (beyond FAQ)

---

## D) FAQ Admin / D1 Model — Design-level details pending
- Confirm table strategy (faq_inbox vs faq_entries) and required fields at design level
- De-duplication approach (canonical linkage) finalization
- Admin UI placement (Admin Dashboard vs standalone admin page in v1)

---

## E) Event Calendar Admin — Design-level details pending
- Where calendar admin lives (Admin Dashboard vs separate page)
- Event detail presentation: modal vs dedicated event detail page (intentionally left open)
- Whether there is a “View all events” page in v1

---

## F) Ask a Question — Minor locks pending
- Duplicate email behavior (new vs existing member) at design level
- Whether Ask a Question includes a Support button (not locked)
- Exact admin notification email formatting (fields included)

---

## G) Global Navigation — Final alignment pending
- Confirm public header “Search” placement is stable with existing UI
- Confirm which member-only resources appear as menu items vs tiles vs both
- Confirm whether visitor menu includes direct JOIN entry (currently not listed; JOIN is in header)

---

## H) Admin Dashboard (overall) — not revisited in this pass
- Reports list (unified reports) details are locked historically, but Admin UI page structure is not reviewed in this pass.

## Updates captured on 2026-01-16

### Locked this session (summary)
- Visitor + Member headers (desktop/mobile behavior, hamburger ordering, sticky controls + non-sticky overlap logo)
- Search (dedicated page; scope rules)
- Login/Logout clarification (success → Member Home; failed stays on Login; logout → Visitor Home)
- Footer layout (logo center; rotating quote left; links right; mobile behavior)
- My Profile (editable fields + Save/Cancel + UUID hidden)
- Admin Page v1 (health status; Search+Add; suppression flags; Footer Quotes; content management; Admin Team Worklist)

### Open / pending (not locked)
- Member Home page content/section order (still pending final lock)
- Stub pages off Member Home (Gehrig Library / Memorabilia Archive / Photo Gallery) are D1-driven; detailed page layouts, schemas, and filters to be finalized in a future design session
- Reports/Moderation section is deferred (Day 2/Day 3)
- Membership card front/back images to be selected and added to the MembershipCard page (content files are locked; images pending)
