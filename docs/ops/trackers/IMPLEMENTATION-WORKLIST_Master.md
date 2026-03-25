---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Live implementation sequencing, task status, thread execution map
Does Not Own: Design specifications or final architecture decisions
Canonical Reference: /docs/ops/trackers/LGFC-REPO-RECOVERY-AND-IMPLEMENTATION_PLAN.md
Last Reviewed: 2026-03-18
---

Project Plan (authoritative roadmap):
/docs/ops/trackers/LGFC-REPO-RECOVERY-AND-IMPLEMENTATION_PLAN.md

Thread Closeout Log:
/docs/ops/trackers/THREAD-LOG_Master.md

# IMPLEMENTATION-WORKLIST_Master.md

Location (authoritative):
/docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md

Purpose:

Day-1 execution map with one-task / one-thread discipline, PR-driven execution control, explicit closeout requirements, and active sequencing for website implementation plus Day 2 repository operations.

---

# Operating Rules

- One task = one thread.
- Fresh repository ZIP at thread start for repo-specific work.
- Each thread must end with one closeout record appended to `/docs/ops/trackers/THREAD-LOG_Master.md`.
- No mixed intent inside a task unless the task explicitly allows it.
- No regressions.
- No case-sensitive duplicate folders or files.
- Repo tracker updates must be append-preserving and must not discard historical entries.

---

# Regression Checklist

Run when a task touches shared UI, routing, auth, or layout:

- Header links work on Home and at least 3 other public pages.
- Logo routes to `/`.
- Footer links match locked design authority.
- `/fanclub/**` redirects to `/` when logged out.
- Cloudflare build succeeds.
- Home page renders without obvious layout breakage.

---

# Current Status Snapshot — 2026-03-18

## Phase 1 — Documentation Stabilization
Status: COMPLETE
Notes:
- LGFC-Production-Design-and-Standards.md remains the sole design authority.
- Core documentation stabilization work is complete.
- Tracker files require recovered historical continuity after the 2026-03-16 overwrite incident.

## AI governance files
Status: COMPLETE
Notes:
- `/Agent.md` present as agent entry/control file.
- `/docs/ops/ai/AGENT-RULES.md` present.
- `/docs/ops/ai/CURSOR-RULES.md` / cursor rules governance present in repo history and operational use.
- `/docs/ops/ai/CHATGPT-RULES.md` present.
- Erroneous duplicate folder `docs/ops/AI/` was removed during cleanup.
- Cursor YAML / review workflow update is being handled in PR #544.

## T10 status
Status: CLOSED
Date Closed: 2026-03-16
Notes:
- Homepage validation and documentation synchronization were completed and accepted.
- Current tracker reconstruction effort is historical recovery, not a reopening of T10.

---

# Phase 0 — Agent Execution Model (LOCKED — REQUIRED)

## T00 — Logs + tasklist structure
Status: CLOSED
Scope: tracker / log structure only.
Exit: canonical tracker files exist and are used.

## 0.1 PR-Driven Execution Model (LOCKED)
Status: ACTIVE

- All work executed via PRs using canonical PR template.
- PR created first (no code), assigned to operator, labeled (one label only).
- Cursor executes only from PR Change Summary.
- One PR = one task = one Cursor run.

## 0.2 Cursor Guardrails (LOCKED)
Status: ACTIVE

- One file per task unless explicitly allowlisted.
- No renames, no package.json changes, no config changes unless task requires.
- No “improvements” outside scope.
- Stop immediately after task completion.

## 0.3 Review Discipline (MANDATORY)
Status: ACTIVE

- Run `git diff HEAD~1` after every Cursor run.
- Verify file allowlist compliance.
- Reject PR if scope drift detected.

## 0.4 CI Validation (MANDATORY)
Status: ACTIVE

- PR must pass lint, test (if present), and build via the repository’s active Cursor review / CI workflow.
- No merge on failed checks.

---

# Phase 1 — Documentation Stabilization (CLOSED)

## T01 — Lock header + PageShell ownership
Status: CLOSED
Date Closed: 2026-03-08
Summary:
Header and PageShell ownership verified; routing confirmed across key public pages.

## T02 — Routing verification sweep
Status: CLOSED
Date Closed: 2026-03-08
Summary:
Public routing sweep completed; no unexpected redirects or dead links reported in closeout.

## T03 — Auth gating verification
Status: CLOSED
Date Closed: 2026-03-08
Summary:
`/fanclub/**` and `/admin/**` gating verified.

## T04 — Production smoke harness
Status: CLOSED / EXISTS
Summary:
Production smoke docs/scripts exist.

## T05 — Design authority consolidation
Status: CLOSED
Summary:
LGFC-Production-Design-and-Standards.md established as sole design authority.

## T06 — Homepage authority alignment
Status: CLOSED
Summary:
Homepage structure and terminology brought into alignment with locked design authority.

## T07 — Navigation invariants lock
Status: CLOSED
Summary:
Header, footer, and public/FanClub route expectations stabilized.

## T08 — Documentation architecture cleanup
Status: CLOSED
Summary:
Conflicting or redundant documentation sources were reduced and archived/removed.

## T09 — Repo audit validation / implementation readiness
Status: CLOSED
Summary:
Deepwiki-supported validation and cleanup closed Phase 1 and cleared the path for implementation work.

---

# Phase 2 — Website Implementation (ACTIVE)

Execution Constraint Added:

- All Phase 2 tasks must be decomposed into Cursor-safe units (single file or tightly scoped multi-file allowlist).
- No direct manual edits outside PR workflow.
- Cursor tasks must begin in a brand-new thread with one opening prompt and one deliverable.

## T10 — Homepage Weekly Photo Matchup
Status: CLOSED
Date Closed: 2026-03-16 (corrected and closed. 2026-03-22)
Summary:
Homepage structure validated against design authority. All 11 canonical homepage sections confirmed. Design authority documentation synchronized to match the verified implementation. Footer specification corrected. Naming clarifications documented. Route privacy rules documented. T17 absorbed into T15 for homepage event visibility.
Notes:
- Implemented as "Weekly Photo Matchup"
- Located directly on homepage (inline section)
- A/B voting UI (Photo A vs Photo B) confirmed
- Vote buttons (Vote A / Vote B) present
- Documentation aligned to as-built implementation

## T11 — Hero / banner integrity
Status: CLOSED
Date Closed: 2026-03-24
Owner: Cursor
Scope: homepage hero banner component.
Exit: banner renders correctly and matches design authority.
Summary:
Post-merge tracker correction: task was previously implemented, verified, merged, and deployed; worklist status is now aligned to actual repo state.

## T12 — Weekly Photo Matchup: UI wiring verification
Status: CLOSED
Date Closed: 2026-03-24
Owner: Cursor
Scope: weekly matchup UI + supporting data flow used by Home.
Exit: two-photo render and vote/result behavior verified.
Summary:
Post-merge tracker correction: task was previously implemented, verified, merged, and deployed; worklist status is now aligned to actual repo state.

## T13 — Join / Login CTA correctness
Status: CLOSED
Date Closed: 2026-03-24
Owner: Cursor
Scope: Join CTA block on homepage.
Exit: links route correctly to `/join` and `/login`.
Summary:
Post-merge tracker correction: task was previously implemented, verified, merged, and deployed; worklist status is now aligned to actual repo state.

## T14 — Social wall stability
Status: CLOSED
Date Closed: 2026-03-24
Owner: Cursor
Scope: embed only.
Exit: widget loads without hard failure.
Summary:
Social Wall stabilized through combined CSP and runtime fixes. CSP coverage for Elfsight/social hosts was expanded in `public/_headers`, and runtime widget initialization was stabilized in `src/components/SocialWall.tsx`. Production now renders the Social Wall without hard failure; remaining source-specific variability may depend on external platform/Elfsight cache behavior.

## T15 — Calendar section integrity
Status: CLOSED
Date Closed: 2026-03-24
Owner: Cursor
Scope: homepage calendar/events section only.
Exit: title, presentation, and event visibility align with locked design.
Summary:
Homepage calendar section now uses a compact month grid (client state only) fed by `GET /api/events/next?limit=10`, with button day cells for event days, visible selection, and an adjacent details panel. Empty and error responses show seeded club-programming fallback entries (6) across the visible month so the block stays useful. Month navigation covers months that contain returned events.

## T16 — Friends tiles stability
Status: CLOSED
Date Closed: 2026-03-24
Owner: Cursor
Scope: friends section only.
Exit: expected tiles render and links behave correctly.
Summary:
Friends section refactored to CSS-module grid/cards (1 / 2 / 3 columns by breakpoint) with media area, kind label, name, blurb, and bottom CTA; API fetch, timeout fallback, default partners, and safe new-tab links preserved.

## T17 — Events preview wiring
Status: CLOSED (ABSORBED INTO T15)
Date Closed: 2026-03-16
Summary:
Calendar section satisfies homepage event visibility requirement.

## T18 — FAQ / Ask preview wiring
Status: CLOSED
Date Closed: 2026-03-24
Summary: Homepage FAQ preview cards implemented; /faq and /ask validated; PR #609.
Owner: Cursor
Scope: homepage FAQ preview section including Ask link.
Exit: preview renders; routes to `/faq`; Ask link routes to `/ask`.

## T19 — Footer invariants lock
Status: CLOSED
Date Closed: 2026-03-24
Owner: Cursor
Scope: footer only.
Exit: footer matches locked design authority.
Summary:
Footer `Footer.tsx` aligned to LGFC-Production-Design-and-Standards.md: right column Privacy → Terms → Contact → mailto Contact (support) → Admin when session role is admin (`useMemberSession`). PR_GOVERNANCE and `cloudflare-frontend.md` updated to remove stale “no Admin / no mailto” rules that contradicted the locked design doc.

## T20 — Campaign Spotlight implementation
Status: OPEN
Owner: Cursor
Scope: CMS-driven homepage Campaign Spotlight section.
Exit: optional/conditional section renders correctly when enabled and fail-closes when disabled or unset.

---

# Phase 3 — Public Core Features (QUEUED)

## T21 — FAQ page functionality
Status: OPEN
Scope: FAQ page + supporting data only.
Exit: search, pinned behavior, view count, and ask flow operate at launch-safe level.

## T22 — Ask-a-question intake
Status: OPEN
Scope: ask form + persistence only.
Exit: submission stores correctly with basic validation.

## T23 — Events page
Status: OPEN
Scope: events page only.
Exit: stable month/list presentation.

---

# Phase 4 — Fan Club Core (QUEUED)

## T30 — FanClub home shell + navigation
Status: OPEN
Notes: Current FanClub formatting/design requires dedicated implementation pass.

## T31 — Member Profile + membership card panel
Status: OPEN

## T32 — Member Chat Day-1 flow
Status: OPEN

---

# Day 2 — Repository Operations & Monitoring (ACTIVE)

## R01 — PR governance stabilization
Status: ACTIVE
Owner: Copilot Agent
Notes:
- One-label-per-PR enforcement
- Mixed-intent prevention
- PR template discipline

## R02 — Drift gate reliability
Status: ACTIVE
Owner: Copilot Agent
Notes:
- Prevent false failures from unrelated or pre-existing workflow issues

## R03 — Docs guardrails repair
Status: ACTIVE
Owner: Copilot Agent

## R04 — Workflow duplication cleanup
Status: ACTIVE
Owner: Copilot Agent
Notes:
- Eliminate overlapping or redundant checks/workflows where they create duplicate effort or false blockers

## R05 — Cursor rules consolidation
Status: ACTIVE
Owner: Copilot Agent
Notes:
- Standardize on a single Cursor rules authority file
- Avoid duplicate `cursor-rules.md` / `cursor_rules.md` style drift

---

# Immediate Next Actions

1. Restore tracker files in repo with recovered continuity.
2. Close repository gate failures blocking PR flow.
3. Use Phase 0 execution model for all new Cursor and Copilot work.
4. Resume Phase 2 website implementation sequentially starting with T11.

---

# UPDATE — IMPLEMENTATION-WORKLIST_Master.md

## T10 — Homepage validation against design authority

Status: CLOSED (REVALIDATED)  
Date Closed: 2026-03-22  

### Summary
Homepage revalidated against active design hierarchy after footer design audit and correction.

### Validation Scope
- Header / navigation invariants
- Section order (v6 canonical)
- Footer design (layout + behavior)

### Footer Revalidation (Critical)
The footer design was previously not fully defined across the design hierarchy.

Actions taken:
- Updated design documentation to match live production footer:
  - `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
  - `/docs/reference/design/reference/lgfc-homepage-legacy-v6.html`
- Updated as-built documentation:
  - `/docs/as-built/cloudflare-frontend.md`

### Final Footer State (Locked)
- Left:
  - D1-driven rotating quote
  - Dynamic year (`new Date().getFullYear()`)
- Center:
  - LG logo (scroll-to-top)
- Right:
  - Row 1: Terms, Privacy
  - Row 2: Contact

Constraints:
- No Admin link
- No mailto/email
- No additional links
- Order fixed

### Result
Design hierarchy and as-built configuration are now aligned with live production.

T10 is confirmed complete after revalidation.

---

## UPDATE — T19 Footer invariants lock (2026-03-24)

**Canonical footer (right column)** is defined solely by `/docs/reference/design/LGFC-Production-Design-and-Standards.md`: Privacy, Terms, Contact (`/contact`), Contact (`mailto` support), Admin (admin session only).

Notes in this file that describe an older footer (e.g. Terms-before-Privacy, no mailto, no Admin) reflected stale tracker/governance text before T19; implementation and governance are aligned to the locked design doc as of T19 closeout.

---



## UPDATE — T19 Footer docs reconciliation (2026-03-25)

The 2026-03-24 T19 note above described a five-link footer model (Privacy, Terms, Contact, mailto Contact, Admin when admin). That model is **superseded**.

Following the T19 footer invariants reopen (PR #623) and the T19 documentation reconciliation task, the canonical footer is:

- Row 1: Privacy (`/privacy`), Terms (`/terms`)
- Row 2: Contact (`/contact`)
- No `mailto:` footer link
- No Admin link in the public footer

All documentation — `LGFC-Production-Design-and-Standards.md`, `PR_GOVERNANCE.md`, `cloudflare-frontend.md`, and `dashboard.md` — has been updated to match the production footer implementation.

---
