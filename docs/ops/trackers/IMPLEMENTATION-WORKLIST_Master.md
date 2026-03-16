---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Live implementation sequencing, launch readiness, production restoration, monitoring follow-through
Does Not Own: Redefining design/architecture/platform specs; historical records
Canonical Reference: /docs/ops/OPERATING_MANUAL.md
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
Execution map for LGFC Phase 2 website implementation, pre-launch stabilization, and Day 2 operations restoration.

This file is the operational control document for thread-by-thread execution.

---

# HARD DATES (LOCKED)

- Target implementation complete date: **2026-03-24**
- Review / adjust / finalize window: **2026-03-25 through 2026-03-31**
- Hard production + fundraiser announcement date: **2026-04-01**

Operational meaning:

- By **2026-03-24**, all required website implementation work must be functionally complete.
- By **2026-03-31**, production readiness, smoke coverage, and post-launch monitoring must be restored and verified.
- On **2026-04-01**, the website and ALS fundraiser announcement must be supportable as a live production event.

---

# OPERATING RULES (NON-NEGOTIABLE)

- **One Task = One Thread.** Close the thread when the task is DONE / PARTIAL / BLOCKED.
- **Fresh ZIP per thread.** Start each implementation or recovery thread with the latest repo ZIP attached.
- **Thread must end with a Closeout Record** appended to `/docs/ops/trackers/THREAD-LOG_Master.md`.
- **No mixed intent.** A task may touch shared foundations OR feature/page implementation unless explicitly allowed in the task card.
- **No regressions allowed.** Any task that touches shared UI, auth, routes, data flow, or admin paths must run verification before closeout.
- **Case-sensitive file safety.** Do not create duplicate paths that differ only by letter casing.
- **Design authority remains locked.** If any conflict appears, follow `/docs/reference/design/LGFC-Production-Design-and-Standards.md`.
- **Implementation priority beats documentation expansion.** Phase 3 documentation architecture work stays deferred until Phase 2 implementation and launch readiness are stable.

---

# REQUIRED VERIFICATION FOR IMPLEMENTATION TASKS

Run as applicable to the files touched:

- `npm ci`
- `npm run build`
- Route smoke for impacted routes
- Logged-out auth gate check for `/fanclub/**`
- Logged-in validation for impacted member/admin paths
- Cloudflare build verification for preview or production as applicable
- Production smoke verification before declaring any launch-critical task complete

---

# THREAD TEMPLATE (USE FOR EVERY TASK)

### Task Card
- Objective
- Scope (files/areas allowed)
- Execution Steps
- Verification Steps
- Exit Criteria
- Closeout Record Required → append to `/docs/ops/trackers/THREAD-LOG_Master.md`

---

# CURRENT STATUS SNAPSHOT (AS OF 2026-03-16)

## Phase 1 Documentation Stabilization
Status: **COMPLETE**

Verification commit:
`156afa647fad1aba7230a48ca7872b82c2c592bc`

Result:
- Documentation authority stabilized.
- Phase 2 website implementation can resume.
- Phase 3 long-term documentation architecture remains deferred until implementation stabilizes.

## Tracker health
Status: **PARTIALLY READY**

What changed in this revision:
- Added locked target dates through 2026-04-01.
- Added phase-level target completion dates.
- Added explicit pre-launch and Day 2 operations restoration phases.
- Preserved one-task-per-thread execution model.

## Day 2 Operations state
Status: **NOT YET RESTORED**

Repository contains monitoring and operational artifacts, but the worklist previously did not schedule restoration work required to support post-launch production operation.

Day 2 restoration is now tracked as required work before the 2026-04-01 announcement.

---

# PHASE TARGET SCHEDULE

## Phase 2 — Public Website Implementation
Target complete: **2026-03-20**

## Phase 3 — Fan Club + Admin implementation required for launch support
Target complete: **2026-03-22**

## Phase 4 — Launch-critical production verification and defect closure
Target complete: **2026-03-24**

## Phase 5 — Day 2 Operations & Monitoring restoration
Target complete: **2026-03-31**

This schedule supports:
- implementation complete by 2026-03-24
- final review / adjustment window through 2026-03-31
- hard launch and fundraiser announcement on 2026-04-01

---

# PHASE 2 — PUBLIC WEBSITE IMPLEMENTATION

Status: **OPEN**
Target complete: **2026-03-20**

## T10 — Homepage implementation validation against design authority
Scope: homepage sections against locked design authority only.
Exit: homepage structure validated against canonical design; missing or broken sections identified and corrected.
Target date: **2026-03-17**

## T11 — Hero / banner integrity
Scope: hero banner only.
Exit: banner structure, content, and styling stable with no shared-layout regression.
Target date: **2026-03-17**

## T12 — Weekly Photo Matchup wiring verification
Scope: homepage matchup components + supporting endpoint/data path.
Exit: homepage shows two valid photos; vote flow works; results behavior verified.
Target date: **2026-03-18**

## T13 — Join / Login call-to-action correctness
Scope: homepage/member-entry CTA area only.
Exit: Join and Login paths/buttons are correct, visible, and non-dead.
Target date: **2026-03-18**

## T14 — Social wall embed stability
Scope: social wall embed only.
Exit: widget loads without breaking homepage render; required domains/config recorded.
Target date: **2026-03-18**

## T15 — Calendar section title + presentation integrity
Scope: homepage calendar/events section only.
Exit: section title present; section renders cleanly in homepage layout.
Target date: **2026-03-19**

## T16 — Friends tiles stability
Scope: friends/supporters tile section only.
Exit: six tiles render and route correctly; layout stable.
Target date: **2026-03-19**

## T17 — Events preview wiring
Scope: homepage events preview only.
Exit: next events display works or empty state renders without runtime errors.
Target date: **2026-03-19**

## T18 — FAQ preview wiring
Scope: homepage FAQ preview only.
Exit: preview renders and routes correctly to FAQ page.
Target date: **2026-03-20**

## T19 — Footer invariants lock
Scope: footer only.
Exit: footer matches locked navigation order/content and links route correctly.
Target date: **2026-03-20**

---

# PHASE 3 — FAN CLUB + ADMIN IMPLEMENTATION REQUIRED FOR LAUNCH SUPPORT

Status: **OPEN**
Target complete: **2026-03-22**

## T20 — Public FAQ page functionality
Scope: FAQ page + supporting public data flow.
Exit: FAQ render, search, pinned behavior, and ask flow work at launch-safe level.
Target date: **2026-03-20**

## T21 — Ask-a-question intake persistence + validation
Scope: ask form + storage only.
Exit: intake persists required fields and basic validation works.
Target date: **2026-03-20**

## T22 — Public events page functionality
Scope: events page only.
Exit: events page renders cleanly and supports intended public viewing path.
Target date: **2026-03-21**

## T30 — Fan Club home shell + navigation integrity
Scope: fanclub layout + navigation only.
Exit: post-login shell loads correctly; navigation is stable; public header rules remain intact.
Target date: **2026-03-21**

## T31 — Member Profile + membership card panel
Scope: member profile page only.
Exit: required identity and membership card panel render correctly.
Target date: **2026-03-21**

## T40 — Admin access gate fail-closed verification
Scope: admin auth gate only.
Exit: only authorized admins can access `/admin/**`; non-admins fail closed.
Target date: **2026-03-22**

## T41 — Admin fundraiser pilot / launch support area
Scope: admin-only implementation area used to safely build and validate fundraiser-related functionality before public exposure.
Exit: fundraiser pilot area is usable in admin, hidden from public, and available for operational testing.
Target date: **2026-03-22**

---

# PHASE 4 — LAUNCH-CRITICAL VERIFICATION AND DEFECT CLOSURE

Status: **OPEN**
Target complete: **2026-03-24**

## T50 — Route structure verification sweep
Scope: all launch-critical public/member/admin routes.
Exit: required routes load, redirect, or fail closed exactly as intended.
Target date: **2026-03-23**

## T51 — Auth gating verification sweep
Scope: `/fanclub/**` and `/admin/**`.
Exit: logged-out redirects, logged-in access, and admin restrictions are verified end-to-end.
Target date: **2026-03-23**

## T52 — Production smoke harness execution
Scope: production smoke scripts/checklists only.
Exit: repeatable smoke run completed and recorded for launch-critical routes and features.
Target date: **2026-03-24**

## T53 — Launch blocker defect closure
Scope: defects discovered in T50–T52 only.
Exit: all launch-blocking defects either fixed or explicitly documented as accepted non-blockers.
Target date: **2026-03-24**

---

# PHASE 5 — DAY 2 OPERATIONS & MONITORING RESTORATION

Status: **OPEN**
Target complete: **2026-03-31**

Purpose:
Restore the repository to a functional Day 2 operational state so the site and fundraiser announcement can be supported after launch.

## T60 — Monitoring inventory verification
Scope: monitoring docs + scripts inventory only.
Exit: confirm what monitoring exists, what still functions, and what gaps remain.
Target date: **2026-03-25**

## T61 — Production build/deploy review path restoration
Scope: Cloudflare build review path, deployment review commands, and operational runbook references.
Exit: operators have a current, repeatable path to inspect build/deploy health.
Target date: **2026-03-26**

## T62 — Production smoke and rollback readiness
Scope: smoke + rollback operational readiness only.
Exit: smoke procedure, rollback reference, and production verification path are aligned and usable.
Target date: **2026-03-27**

## T63 — Launch-week incident response readiness
Scope: incident-response quick-use operator path only.
Exit: operator can respond to outage, partial failure, or degraded fundraiser/site behavior without reconstructing process during live operations.
Target date: **2026-03-28**

## T64 — Post-launch monitoring/check cadence
Scope: operational cadence for 2026-03-31 through 2026-04-07.
Exit: review cadence defined for site availability, build status, key launch flows, and fundraiser-related checks.
Target date: **2026-03-29**

## T65 — Day 2 operations restore complete
Scope: closeout verification for T60–T64.
Exit: repository is back in functional Day 2 operations state for launch support.
Target date: **2026-03-31**

---

# PHASE 6 — DEFERRED UNTIL POST-LAUNCH

Status: **DEFERRED**

## T70 — Long-term documentation architecture migration
Scope: Phase 3 documentation architecture work from the recovery plan.
Exit: execute only after implementation and launch stabilization are complete.

---

# COMPLETED WORK

## T01 — Lock Header + PageShell ownership
Status: CLOSED
Date closed: 2026-03-08
Summary: Header and PageShell ownership verified; header routing confirmed across Home/About/FAQ/Join; no regressions observed.

## T02 — Routing verification sweep (public pages)
Status: CLOSED
Date closed: 2026-03-08
Summary: Public routing sweep completed; header and footer links verified; no unexpected redirects or 404 routes.

## T03 — Auth gating verification (fanclub + admin)
Status: CLOSED
Date closed: 2026-03-08
Summary: Auth gating verified for /fanclub and /admin paths; logged-out redirects confirmed; authenticated access validated.

## T04 — Production smoke harness (repeatable checklist + commands)
Status: EXISTS
Summary: Production smoke artifacts exist and must be executed again in Phase 4 / Phase 5 launch readiness work.

---

# NOTES FOR EXECUTION MODE

Recommended execution model for the 2026-03-24 target:

- Atlas / ChatGPT = control plane, task authoring, acceptance criteria, verification, tracker updates.
- Cursor = implementation agent working directly in the live repo for thread-by-thread execution.
- Human operator = approves direction, uploads ZIPs when needed, and controls repo merges/deploy timing.

Reason:
The documentation is now stable enough for implementation work, and the schedule is compressed enough that direct in-repo execution is the practical path.
