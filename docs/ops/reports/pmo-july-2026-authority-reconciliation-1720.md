---
Doc Type: Operations
Audience: Bill, ChatGPT, Cursor, LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: Task #1720 durable evidence for PMO July 2026 authority reconciliation, historical #1411 / #1417–#1424 disposition, and Program #1719 continuous reduced-gate launch-state alignment
Does Not Own: Runtime implementation, workflow YAML, CI scripts, GitHub issue mutation, merge authority, or launch of deferred related projects
Canonical Reference: /docs/ops/pmo/PMO-JULY-2026-OPERATING-MODEL.md
Related Issues: #1720, #1719, #1411, #1417, #1418, #1419, #1420, #1421, #1422, #1423, #1424, #1500, #1725
Last Reviewed: 2026-07-16
---

# PMO July 2026 Authority Reconciliation (#1720)

## Purpose

Deliver Task **#1720** evidence for parent program **#1719**. Reconcile current
PMO authority routes to PMO July 2026, classify historical #1411 and stale
#1417–#1424 evidence without mutating those issues, and align touched Program
#1719 implementation-plan / readiness language with continuous reduced-gate
authorization recorded on #1719 (2026-07-16).

## Boundary statements

1. **PMO July 2026 is current PMO authority** via
   `docs/ops/pmo/PMO-JULY-2026-OPERATING-MODEL.md`.
2. **PMO V3 and superseded PMO V4 naming are historical** where July 2026
   supersedes them. Historical files remain evidence; they are not current
   routing targets for new work.
3. **#1411 is completed historical planning/control evidence** (closed,
   `status:complete`). It is not an open staged/blocked program.
4. **#1417–#1424 are stale historical task issues.** Cite only; do not close,
   reopen, relabel, reassign, or treat as current source issues.
5. **#1725 remains closed complete.** Do not rerun. Treat as valid dependency
   evidence for later #1726.
6. **This report is documentation-only.** No runtime, workflow YAML, CI script,
   package, or website changes.

Assessment date: **2026-07-16**.

## Inventory — stale-as-current references found in writable scope

| Surface | Pre-#1720 defect | Disposition |
| --- | --- | --- |
| Implementation plan | BLOCKED / launch-control-ready banner; execution blocked until #1720 auth | Reconciled to Implementation Active + continuous reduced-gate serial |
| Readiness package | BLOCKED banner; queued behind predecessors; “not executable” conclusion | Reconciled to Implementation Active; launch preconditions marked satisfied |
| `program-registry.md` | #1719 queued / blocked until #1720 auth | #1719 moved to active Implementation Active row |
| `pmo-backlog.md` | Rank 3 queued / blocked until queue authorization | Rank 3 Implementation Active; history entry 2026-07-16 |
| `PMO-JULY-2026-OPERATING-MODEL.md` | Workload row #1719 Blocked (launch-gated) | Workload row Implementation Active |
| `workflow-automation.md` | #1411 described as staged/blocked current program | #1411 historical; current route #1719 / #1721 |
| `lgfc-program-portfolio-model.md` | #1411 staged/blocked portfolio row | #1411 historical; #1719 Implementation Active |
| `lgfc-cursor-execution-contract.md` | #1411 staged/blocked authorizes planning | #1411 historical; #1719 continuous auth noted; #1722 owns hardening |

## Authority routes (current)

| Topic | Current route |
| --- | --- |
| Top-level PMO authority | `docs/ops/pmo/PMO-JULY-2026-OPERATING-MODEL.md` |
| Program registry | `docs/ops/pmo/program-registry.md` → July 2026 |
| PMO backlog | `docs/ops/pmo/pmo-backlog.md` → July 2026 |
| Program #1719 readiness | `docs/ops/pmo/pmo-governance-workflow-automation-completion-readiness.md` |
| Program #1719 plan | `docs/ops/implementation-plans/pmo-governance-workflow-automation-completion.md` |
| Workflow automation planning | `docs/ops/pmo/workflow-automation.md` → July 2026; execution via #1719 |
| Cursor execution contract | `docs/reference/pmo/lgfc-cursor-execution-contract.md` |
| Historical PMO V3 | `docs/ops/pmo/PMO-V3-OPERATING-MODEL.md` (historical) |
| Superseded PMO V4 naming | Historical naming only; do not use as current canonical route |

## Historical evidence disposition

| Record | Live GitHub state (2026-07-16) | Doc disposition |
| --- | --- | --- |
| #1411 | CLOSED (`status:complete`) | Completed historical planning/control evidence |
| #1417 | OPEN | Stale historical Task-001 evidence; superseded by #1720 |
| #1418 | OPEN | Stale historical Task-002 evidence; superseded by #1721 |
| #1419 | OPEN | Stale historical Task-003 evidence; superseded by #1722 |
| #1420 | OPEN | Stale historical Task-004 evidence; superseded by #1723 |
| #1421 | OPEN | Stale historical Task-005 evidence; superseded by #1724 |
| #1422 | OPEN | Stale historical Task-006 evidence; superseded by #1725 (complete) |
| #1423 | OPEN | Stale historical Task-007 evidence; related to closeout ranks satisfied by #1500/#1725 |
| #1424 | OPEN | Stale historical Task-008 evidence; superseded by #1727 terminal closeout |
| #1500 | CLOSED complete | Closeout/queue reconciliation baseline; cited by #1725 |
| #1725 | CLOSED complete | Queue/wave reconciliation complete — do not rerun |

No GitHub mutations were performed on #1411 or #1417–#1424.

## Continuous reduced-gate alignment (#1719)

| Rule | Reflected in touched docs |
| --- | --- |
| One local Cursor agent; one child; one PR | Implementation plan + readiness |
| Start #1720 now | Implementation plan dependency map + readiness conclusion |
| After predecessor merge + clean post-merge, continue without new launch prompt | Implementation plan dependency map; readiness launch preconditions |
| Stop at READY FOR REVIEW; no self-approve/merge | Implementation plan closeout rules; cursor contract |
| Protected governance review for #1723 / #1724 | Implementation plan dependency map; readiness |
| #1725 complete — do not rerun | Implementation plan; backlog; this report |
| Material stop conditions only (per #1719) | Implementation plan launch-gate section |

## Deferred conflicts (separate bounded Issues — do not start here)

These are listed only. They are outside #1720 execution:

| Issue | Note |
| ---: | --- |
| #2294 | Agent Issue Polling and Handoff Routing — related/deferred |
| #2304 | PMO Dashboard Task Accounting Reconciliation — closed related record |
| #2313 | PMO label-driven dashboard grouping — closed related record |
| #2323 | PMO dashboard Update Needed fallback — closed related record |
| #2334 | Post-merge source issue resolver hardening — closed related record |
| #2342 | Local Cursor Program Queue Pickup design — related/deferred |

Additionally identified as **follow-up candidates** (not launched by #1720):

| Candidate | Rationale |
| --- | --- |
| Operator hygiene for open stale #1417–#1424 | Docs now classify them historical; actual close/relabel requires separate operator-approved hygiene authorization |
| Broader PMO doc surfaces still using pre-July wording outside this PR’s focused #1719/#1411 reconciliation | Opportunistic DIATAXIS / authority cleanup when those files are next touched; do not expand #1720 |
| Full `lgfc-cursor-execution-contract.md` hardening | Owned by Task #1722 |

## Out of scope confirmation

- No runtime code, workflow YAML, CI scripts, package files, or website files changed.
- No GitHub issue create/close/reopen/relabel/reorder.
- No PR approval or merge by Cursor.
- Related/deferred issues listed above were not started.

## Successor

After this PR merges and post-merge verification is clean, Cursor may begin
**#1721** without another Bill/ChatGPT launch authorization.
