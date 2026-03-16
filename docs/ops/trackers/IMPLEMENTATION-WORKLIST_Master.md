---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Live implementation sequencing, task status, thread execution map
Does Not Own: Design specifications or final architecture decisions
Canonical Reference: /docs/ops/trackers/LGFC-REPO-RECOVERY-AND-IMPLEMENTATION_PLAN.md
Last Reviewed: 2026-03-16
---

Project Plan (authoritative roadmap):
/docs/ops/trackers/LGFC-REPO-RECOVERY-AND-IMPLEMENTATION_PLAN.md

Thread Closeout Log:
/docs/ops/trackers/THREAD-LOG_Master.md

# IMPLEMENTATION-WORKLIST_Master.md

Location (authoritative):
/docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md

Purpose:

Day-1 execution map with one-task / one-thread discipline and explicit closeout requirements.

---

# Operating Rules

- One task = one thread.
- Fresh repository ZIP at thread start for repo-specific work.
- Each thread must end with one closeout record appended to `/docs/ops/trackers/THREAD-LOG_Master.md`.
- No mixed intent inside a task unless the task explicitly allows it.
- No regressions.
- No case-sensitive duplicate folders or files.

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

# Current Status Snapshot — 2026-03-16

## Phase 1 — Documentation Stabilization
Status: COMPLETE  
Verification commit: `156afa647fad1aba7230a48ca7872b82c2c592bc`

## AI governance files
Status: COMPLETE  
Notes:
- `/Agent.md` replaced with updated agent entry instructions.
- `/docs/ops/ai/AGENT-RULES.md` added.
- `/docs/ops/ai/CURSOR-RULES.md` added.
- `/docs/ops/ai/CHATGPT-RULES.md` added.
- Erroneous duplicate folder `docs/ops/AI/` was removed.
- Cleanup commit pushed on 2026-03-16.

## T10 status
Status: OPEN  
Reason:
Homepage validation documentation sync was discussed but not completed in this thread. No approved T10 replacement tracker files were applied during this thread closeout.

## Constraint for next T10 thread
Next thread must review and rewrite only these three tracker files:

- `/docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md`
- `/docs/ops/trackers/THREAD-LOG_Master.md`
- `/docs/ops/trackers/LGFC-REPO-RECOVERY-AND-IMPLEMENTATION_PLAN.md`

---

# Phase 0 — Continuity Spine

## T00 — Logs + tasklist structure
Status: CLOSED
Scope: tracker/log structure only.
Exit: canonical tracker files exist and are used.

---

# Phase 1 — Foundation Stabilization

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

---

# Phase 2 — Public Homepage Integrity

## T10 — Homepage validation documentation synchronization
Status: OPEN
Scope:
Documentation only. No application code changes.
Allowed files:
- `/docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md`
- `/docs/ops/trackers/THREAD-LOG_Master.md`
- `/docs/ops/trackers/LGFC-REPO-RECOVERY-AND-IMPLEMENTATION_PLAN.md`

Required outcomes:
1. Tracker files reflect current known status.
2. Canonical homepage validation status is stated accurately.
3. No unsupported claims of completion are made.
4. Thread closeout language is appended only in `THREAD-LOG_Master.md`.

Exit:
Three tracker files are rewritten, reviewed, uploaded, and replace the current repo versions.

## T11 — Weekly Photo Matchup: UI wiring verification
Status: OPEN
Scope: weekly matchup UI + supporting data flow used by Home.
Exit: two-photo render and vote/result behavior verified.

## T12 — Join section: CTA correctness
Status: OPEN
Scope: Join CTA only.
Exit: CTA routes correctly; copy and labels match design authority.

## T14 — Social wall stability
Status: OPEN
Scope: embed only.
Exit: widget loads without hard failure.

## T15 — Calendar homepage section
Status: OPEN
Scope: homepage calendar section only.
Exit: title, presentation, and event visibility align with locked design.

## T16 — Friends tiles stability
Status: OPEN
Scope: friends section only.
Exit: expected tiles render and links behave correctly.

## T17 — Events preview wiring
Status: OPEN
Scope: homepage events preview only.
Exit: preview renders or empty state renders cleanly.

## T18 — FAQ preview wiring
Status: OPEN
Scope: homepage FAQ preview only.
Exit: preview renders and routes correctly.

## T19 — Footer invariants lock
Status: OPEN
Scope: footer only.
Exit: footer matches locked design authority.

---

# Phase 3 — Public Core Features

## T20 — FAQ page functionality
Status: OPEN
Scope: FAQ page + supporting data only.
Exit: search, pinned behavior, view count, and ask flow operate at launch-safe level.

## T21 — Ask-a-question intake
Status: OPEN
Scope: ask form + persistence only.
Exit: submission stores correctly with basic validation.

## T22 — Events page
Status: OPEN
Scope: events page only.
Exit: stable month/list presentation.

---

# Phase 4 — Fan Club Core

## T30 — FanClub home shell + navigation
Status: OPEN

## T31 — Member Profile + membership card panel
Status: OPEN

## T32 — Member Chat Day-1 flow
Status: OPEN

---

# Immediate Next Action

Close this thread.
Start a brand-new thread for T10 only.
Use the latest repository ZIP.
Rewrite the three tracker files only.
