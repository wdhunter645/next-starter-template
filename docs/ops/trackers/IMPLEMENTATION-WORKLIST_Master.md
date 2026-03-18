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

## T10 — Homepage validation against design authority
Status: CLOSED
Date Closed: 2026-03-16
Summary:
Homepage structure validated against design authority. All 11 canonical homepage sections confirmed. Design authority documentation synchronized to match the verified implementation. Footer specification corrected. Naming clarifications documented. Route privacy rules documented. T17 absorbed into T15 for homepage event visibility.

## T11 — Hero / banner integrity
Status: OPEN
Owner: Cursor
Scope: homepage hero banner component.
Exit: banner renders correctly and matches design authority.

## T12 — Weekly Photo Matchup: UI wiring verification
Status: OPEN
Owner: Cursor
Scope: weekly matchup UI + supporting data flow used by Home.
Exit: two-photo render and vote/result behavior verified.

## T13 — Join / Login CTA correctness
Status: OPEN
Owner: Cursor
Scope: Join CTA block on homepage.
Exit: links route correctly to `/join` and `/login`.

## T14 — Social wall stability
Status: OPEN
Owner: Cursor
Scope: embed only.
Exit: widget loads without hard failure.

## T15 — Calendar section integrity
Status: OPEN
Owner: Cursor
Scope: homepage calendar/events section only.
Exit: title, presentation, and event visibility align with locked design.

## T16 — Friends tiles stability
Status: OPEN
Owner: Cursor
Scope: friends section only.
Exit: expected tiles render and links behave correctly.

## T17 — Events preview wiring
Status: CLOSED (ABSORBED INTO T15)
Date Closed: 2026-03-16
Summary:
Calendar section satisfies homepage event visibility requirement.

## T18 — FAQ / Ask preview wiring
Status: OPEN
Owner: Cursor
Scope: homepage FAQ preview section including Ask link.
Exit: preview renders; routes to `/faq`; Ask link routes to `/ask`.

## T19 — Footer invariants lock
Status: OPEN
Owner: Cursor
Scope: footer only.
Exit: footer matches locked design authority.

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
