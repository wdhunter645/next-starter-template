- **Issue:** #1411

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: not-applicable
- Next queue item: halt — Program 1 not launched; task issue alignment #1417–#1424 remains
- Continue/halt decision: halt — documentation pass merged; launch and child-issue alignment require Atlas/Bill authorization

## PROGRESS + READINESS (MANDATORY)
- Phase: Program 1 PMO v2 documentation pass
- Task: Introduce PMO v2 operating model documentation package
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge body remediation applied)
- Notes: Merged as PR #1472 (merge SHA `eab8244aab4aa8553d656264e9bb902efc60cbbf`). Post-merge body remediation applied for parser-compliant section headers.

## LABEL
- Intent label for this PR: docs-only

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
DOC_SOURCE: DIATAXIS_FULL
DOC_SOURCE_FILES:
- `docs/ops/pmo/PMO-V2-OPERATING-MODEL.md`
- `docs/ops/pmo/program-registry.md`
- `docs/reference/pmo/lgfc-program-portfolio-model.md`
- `docs/ops/pmo/workflow-automation.md`
- `docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md`
- `docs/ops/pmo/PMO-V2-OPERATING-MODEL.md`
- `docs/ops/pmo/program-3-club-home-page-design.md`
- `docs/ops/pmo/program-3-proposed-project-list.md`
- `docs/ops/pmo/program-5-admin-page-and-tools-design-readiness.md`
- `docs/ops/pmo/program-5-ideas-and-project-drafts.md`
- `docs/ops/pmo/program-registry.md`
- `docs/ops/pmo/workflow-automation.md`
- `docs/reference/pmo/lgfc-program-portfolio-model.md`

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Documentation-only PR
- [x] No runtime UI, route, layout, header, footer, FanClub, admin UI, Store, D1, or production behavior changes

## CHANGE SUMMARY
- Adds `docs/ops/pmo/PMO-V2-OPERATING-MODEL.md` as the controlling PMO authority.
- Rewrites `docs/ops/pmo/program-registry.md`, `docs/reference/pmo/lgfc-program-portfolio-model.md`, and `docs/ops/pmo/workflow-automation.md` for PMO v2 (Programs 1–4 portfolio, Program 5 ideas/drafts lane).
- Aligns `docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md` with PMO v2 staged Program 1 planning.
- Adds Program 3 discussion docs (club home page design, proposed project list) and Program 5 discussion docs (ideas/project drafts, admin tools readiness).

## BUILD / TEST / VERIFICATION
- Commands run:
  - `DOCS_HEADER_FILE_LIST=/tmp/docs-header-list.txt ./scripts/ci/docs_check_headers.sh .` — PASS (scoped allowlist files)
  - `./scripts/ci/docs_canonical_hashes_verify.sh .` — PASS
  - `git diff --name-only origin/main...eab8244` — nine allowlisted docs files only
- Gate verification:
  - Commit-level workflow runs inspected: YES (merge commit `eab8244`)
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES (post-merge metadata section alignment remediated)
  - Required gates rerun or re-evaluated after fixes: YES
- Result summary: PASS (docs-only merge; scoped header validation passed on allowlist files)

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Reviewed all bot comments.
- [x] Reviewed all GitHub review threads.
- [x] Copilot disposition received or not applicable.
- [x] Codex disposition received.
- [x] Gemini disposition received.
- [x] Cubic disposition received or not applicable.
- [x] Every actionable reviewer comment has a PR-body disposition with `review-comment:<id>`.
- [x] Every outdated review thread has explicit PR-body disposition with comment ID and thread state.

Reviewer items:
- review-comment:3380850781 — accepted — PMO vocabulary table now uses lowercase project and issue — thread state: outdated
- review-comment:3380850799 — accepted — Program 5 discussion table uses lowercase project draft for Fundraiser and Lou Gehrig rows — thread state: outdated
- review-comment:3380850810 — accepted — Program 5 discussion table uses lowercase project draft for Annual Lou Gehrig Day package — thread state: outdated
- review-comment:3380850818 — accepted — Workflow Automation promotion checklist uses lowercase issue creation phrasing — thread state: outdated
- review-comment:3381737665 — accepted — Restored issue-factory parseable Task 001–008 headings (`## Task NNN`) — thread state: resolved

## ACCEPTANCE CRITERIA
- [x] PMO v2 operating model documentation package merged with allowlist-only docs changes
- [x] Portfolio defined as Programs 1–4; Program 5 defined as ideas/project drafts lane
- [x] Program 1 implementation plan aligned to PMO v2 staged model
- [x] Docs header and canonical hash validation pass for changed files
- [x] No runtime, workflow YAML, D1, production config, or issue mutation in merged diff
- [x] All actionable reviewer comments dispositioned in merged PR record

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line
- [x] Allowed files section matches final diff exactly
- [x] ZIP safety confirmed
- [x] Intent label correct and singular
- [x] Post-merge closeout body remediation applied for merged PR governance

## POST-MERGE ISSUE DISPOSITION
- **Keep #1411 open** — Program 1 remains staged, not launched; task issues #1417–#1424 still require PMO v2 alignment in a separate bounded follow-up
- Reconcile #1411 labels: remove `status:post-merge-verify`; retain active Program 1 planning labels
- Close remediation **#1483** when validator passes after body apply

<!-- closeout-trigger: 2026-06-09 -->
