# Agent.md — Rules for Agent/Codex Work in This Repository

Effective Date: 2026-01-21

This file defines **mandatory** rules for any automated agent (Copilot Agent, Codex, or similar) making changes in this repo.

If you cannot comply, stop and request guidance rather than guessing.

---

## 1) Sources of Truth (non-negotiable)

Before any change, read:
- `/docs/LGFC-Production-Design-and-Standards.md`
- `/docs/NAVIGATION-INVARIANTS.md`

These documents are the design law. Do not invent routes, labels, or layouts.

---

## 2) Route + IA Guardrails

- Do not create new top-level routes without explicit instruction.
- Member home is `/member`; member-specific pages are under `/member/**` (e.g., `/member/profile`, `/member/card`).
- Member content pages exist as top-level routes (e.g., `/photo`, `/photos`, `/library`, `/memorabilia`, `/ask`, `/news`).
- Store is external only (no `/store` route).
- Weekly vote routes are in transition; do not delete weekly-related routes unless explicitly instructed.

---

## 3) Header / Footer Invariants

Follow `/docs/NAVIGATION-INVARIANTS.md` exactly.

Highlights:
- Public header (logged out): Join / Search / Store / Login
- Public header (logged in): add Club Home + Logout (6 total)
- Member header: Club Home / My Profile / Search / Store / Logout
- Logo always links to `/`
- Footer: left quote + legal, center logo scroll-to-top, right links Contact/Support/Terms/Privacy, no email displayed

---

## 4) File-Touch Discipline

- Make the smallest change set required to satisfy the task.
- Do not “refactor for cleanliness” unless explicitly instructed.
- Do not add new libraries, new frameworks, or new build systems without explicit instruction.

---

## 5) No Wildcard Hacking

Prohibited:
- Renaming large folders, mass reformatting, mass linting, or “sweeping” edits not required for the task
- Introducing new routes/components because “it seems useful”
- Rewriting docs without aligning to the explicit design requirements

---

## 6) ZIP Safety

If a ZIP file is present in the repo root during PR work:
- Delete it first (before any other changes)
- Acceptance criteria must confirm it is removed and not committed

---

## 7) Every change must include verification

When you change routing, headers, or footer:
- Verify the route exists and renders
- Verify authentication redirects work for member content pages
- Verify header variants and footer layout match the invariants
