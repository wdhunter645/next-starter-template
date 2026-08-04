---
Doc Type: Operations
Audience: Bill, ChatGPT, Cursor, Claude Code, LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: Task #2775 replacement Promotion Candidate resynchronization evidence, conflict dispositions, validation results, and Go/No-Go recommendation for Program #1719
Does Not Own: Production promotion to `main`, self-approve/self-merge, unauthorized issue mutation, workflow YAML redesign, or secret/credential changes
Canonical Reference: /docs/ops/pmo/pmo-governance-workflow-automation-completion-readiness.md
Related Issues: #2775, #1719, #2647, #2652
Last Reviewed: 2026-08-03
---

# Program #1719 Replacement Promotion Candidate Qualification (#2775)

## Purpose

Record the exact replacement Promotion Candidate prepared under #2775 after the
prior qualified candidate (`9d6db7d`, accepted under #2647) went stale against
current `main` before Production review, including conflict dispositions,
validation evidence, rollback status, and the qualification recommendation.

## Scope

- Synchronization of `component/pmo-governance-workflow-automation` tip
  (`9d6db7d`) into working branch `cursor/1719-promotion-candidate-resync-2` by
  merging current `main` without rewriting component history.
- Conflict resolution for PMO tracker/registry/backlog and durable-authority
  reference files.
- This qualification report.
- One PR targeting only the component branch.

Out of scope: Production promotion PR to `main`, self-approval, self-merge,
workflow redesign, website changes, secrets, credentials, branch-protection
changes, and external mutations. No feature implementation was performed.

## Current known truth

| Field | Value |
| --- | --- |
| Source issue | #2775 |
| Parent program | #1719 |
| Prior qualified candidate (now stale) | `9d6db7d6c2dfcea78d0f941b562aa62b379d6f71` (accepted under #2647) |
| Accepted component starting SHA (this task) | `9d6db7d6c2dfcea78d0f941b562aa62b379d6f71` |
| Current `main` SHA consumed | `5287b4656bfc2a6b46d2ba2e16d01ae30133f077` |
| Merge base (component vs. main) | `8a3f56e65b90b36729d96dce2005ea21cc27e08f` |
| Working branch | `cursor/1719-promotion-candidate-resync-2` |
| Merge method | `git merge origin/main --no-edit` (no rebase / no history rewrite) |
| Ahead/behind at merge start | component 22 ahead / 130 behind `main` |
| New candidate head SHA | `edb8feef3c09085f0506306a3d21bc79f9baaf6e` |
| Executing agent | Claude Code (Implementation / Operations, parallel-authorized 2026-08-03) |

Divergence grew from the 22-ahead / 92-behind figures recorded at #2775
creation time (2026-07-22) to 22-ahead / 130-behind by execution time
(2026-08-03), confirming the #2647 candidate was correctly assessed as stale
and requiring a fresh resync rather than a fast-forward.

## Conflict inventory and dispositions

Eight conflict files, all PMO tracker/registry/reference documents (no
constitutional/governance-policy files conflicted this time — those were
already reconciled to current `main` authority under #2647).

| File | Disposition |
| --- | --- |
| `docs/ops/implementation-plans/pmo-governance-workflow-automation-completion.md` | Kept the more advanced component-side "construction complete" status blockquote (unique #1719 status narrative, not contradicted by any current `main` policy); relabeled "resynchronized #2775". |
| `docs/ops/pmo/pmo-backlog.md` | Merged: adopted `main`'s `ChatGPT` role-naming convention (over the component branch's `Atlas` alias) and rewrote the Priority #3 status/classification/history-log entries to the current true state — "Requalification in progress (#2775)" — rather than either side's now-stale "Implementation Active" or "Construction complete, promotion pending" framing. |
| `docs/ops/pmo/program-registry.md` | Same disposition as `pmo-backlog.md`: `ChatGPT` naming, status corrected to "Requalification in progress (#2775)" in both the current-state bullet and the active-program-issues table. |
| `docs/ops/pmo/workflow-automation.md` | Kept the component branch's richer four-column design-area map (unique #1719 deliverable, not conflicting with `main` authority) with `ChatGPT` naming, and added a row for the #2775 requalification task. |
| `docs/reference/pmo/lgfc-cursor-execution-contract.md` | **`main` wins in full.** `main` had already superseded this document with a leaner "current-member compatibility adapter" (`Canonical Reference: /docs/governance/AGENT-TEAM.md`, 195 lines) replacing the component branch's older 537-line procedural version (queue-mode matrix, Atlas-specific PMO Issue-Comment Bridge sections, `#1719`-specific hardcoded procedure). Took `main`'s file wholesale (`git show origin/main:<path>`). |
| `docs/reference/pmo/lgfc-program-queue-and-dependency-map.md` | Merged: kept the component branch's Model B / `component-auto-integration` detail (compatible, not contradicted) using `main`'s `ChatGPT` naming; corrected the `#1719` status line from stale "Implementation Active" to "Replacement candidate requalification in progress under #2775". |
| `docs/reference/pmo/pmo-dashboard-single-authority-implementation-plan.md` | **`main` wins in full.** `main` had reclassified this document `Authority Level: Historical Controlled Implementation Plan` (superseded by `WORK-QUEUES-AND-COLLABORATION.md` / PMO July 2026 operating model / dashboard specification / #2702), while the component branch still carried the older live/current-plan framing. Took `main`'s file wholesale. |
| `docs/templates/agent-assignment-template.md` | **`main` wins in full.** `main` had migrated this template to the durable role-based format (`Canonical Reference: /docs/governance/AGENT-TEAM.md`, executor-neutral), superseding the component branch's older Cursor/Codex/Copilot/Devin-specific format. Took `main`'s file wholesale. |

Rationale for the three full "main wins" dispositions: those three documents
had each undergone an independent structural redesign on `main` after the
component branch diverged (evidenced by materially different frontmatter
`Authority Level` / `Owns` / `Canonical Reference` fields, and a large line-count
reduction), making them "current main constitutional/governance/PMO authority"
supersessions rather than ordinary content drift — exactly the class of stale
statement/routing-marker/automation-assumption the task instructs to remove in
favor of current `main`.

For the other five files, the conflicting text was PMO status/tracker
narrative specific to Program #1719's own progress (a "unique #1719
deliverable" under the task's retention rule) rather than competing policy, so
the disposition reconciled the actual current state (stale candidate,
replacement requalification in progress) rather than mechanically preferring
either side's already-superseded status line. `Atlas`/`ChatGPT` naming
conflicts were resolved toward `ChatGPT`, matching `docs/governance/AGENT-TEAM.md`'s
current team mapping (note: `main` itself still uses the `ChatGPT/Atlas` paired
form in a couple of unrelated Bridge docs, so `Atlas` remains a recognized
alias — this is a naming-consistency preference within the touched files, not
a claim that `Atlas` is retired repository-wide).

No stale reconciliation was needed beyond the marked conflicts and the
directly-adjacent non-conflicting lines in `pmo-backlog.md` and
`program-registry.md` that asserted the same now-superseded "Construction
complete (component)" / "Implementation Active" status outside the conflict
markers (git's line-based merge did not flag them as conflicts because only
one side had touched that exact line, but the resulting content would have
been internally inconsistent with the resolved conflict lines immediately
above/below it). One new backlog-history row was appended (append-only) to
record the 2026-08-03 stale-candidate finding; no existing history rows were
edited.

## Validation

Recorded at PR open time (candidate head `edb8feef3c09085f0506306a3d21bc79f9baaf6e`):

- `npm test` — PASS, 923/923 tests, 90/90 files
- `npm run typecheck` — PASS (`tsc --noEmit`, no errors)
- `bash scripts/ci/docs_check_headers.sh` — 2 pre-existing failures unrelated to this task (`docs/ops/implementation-plans/issue-1075-ci-phase2-closeout-rollout.md`, `issue-1075-ci-redesign-rollout.md`; both already missing header keys on `main` prior to this merge, per `git log`/`git show origin/main:<path>` — out of the #2775 file-touch allowlist, not remediated here)
- `bash scripts/ci/docs_check_paths.sh` — PASS
- `node scripts/ci/diataxis_folder_audit.mjs` — PASS, no defects
- `bash scripts/ci/check_no_tracked_zips.sh` — PASS, no tracked ZIPs
- `git diff --check HEAD~1 HEAD` — flags only pre-existing Markdown hard-break trailing double-spaces (`docs/reference/ci/cursor-local-bridge-contract.md`, `docs/reference/design/fanclub.md`) and an unrelated pre-existing file (`.github/workflows/openhands-resolver.yml`) already present on `main`; none are in the 8 files touched by this task's conflict resolution
- `node scripts/pmo-dashboard/validate-dashboard.mjs` — pre-existing failures reproduced identically on a clean `origin/main` checkout in this same environment (confirmed by diffing output before/after the merge); not introduced by this task and out of the #2775 file-touch allowlist

No secret scan tooling beyond `check_no_tracked_zips.sh` was found invoked by
this repository's CI for docs-only changes; no credential or secret files were
touched.

## Rollback package

Rollback: close or reject the child PR without merging to the component
branch; if already integrated to `component/pmo-governance-workflow-automation`,
revert the merge commit there. No Production rollback is required because this
task never merges to `main`.

## Unresolved gaps

- ChatGPT/Bill Go/No-Go for this replacement candidate is not yet recorded.
- A separate, new protected Production-review Issue and Bill's explicit
  `PRODUCTION GO` remain required before any promotion PR to `main`, per
  Program #1719's Production decision boundary.
- Deferred workflow/CI candidates C-01–C-06 from #1727 remain out of scope.
- The two pre-existing `docs_check_headers.sh` failures and the
  `validate-dashboard.mjs` failures are known, pre-existing gaps outside this
  task's allowlist; they are not new regressions from this resync.

## Qualification recommendation

**PROMOTION CANDIDATE READY** for ChatGPT/Bill Go/No-Go review of this
replacement synchronized component candidate (head `edb8feef3c09085f0506306a3d21bc79f9baaf6e`),
contingent on CI gates on the child PR and ChatGPT independent review of this
packet. This is not Production Go and does not authorize merge to `main`.
