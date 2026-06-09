- **Issue:** #1411

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR. Preferred format: `- **Issue:** #123`.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS (REQUIRED FOR LAUNCHED-PROGRAM QUEUE TASKS)
- Dependency-map result: not-applicable
- Next queue item: not-applicable — Program 1 planning cycle documentation pass complete; Program 1 remains staged pending task-issue alignment
- Continue/halt decision: halt — Program 1 not launched; Program 2 `#1255` remains active execution lane

## PROGRESS + READINESS (MANDATORY)
- Phase: Program 1 PMO v2 planning documentation
- Task: PMO Automation and Agent Workflow Control (`#1411`)
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking issues: none (post-merge body remediation applied)
- Notes: Merged as PR #1472 (merge SHA `eab8244aab4aa8553d656264e9bb902efc60cbbf`). Post-merge body remediation applied for parser-compliant section headers and allowlist.

## LABEL
- Intent label for this PR: documentation

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical PMO authority: `/docs/ops/pmo/PMO-V2-OPERATING-MODEL.md`
- Canonical portfolio reference: `/docs/reference/pmo/lgfc-program-portfolio-model.md`
- Canonical execution contract: `/docs/reference/pmo/lgfc-cursor-execution-contract.md`
- Program 1 implementation plan: `/docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md
- docs/ops/pmo/PMO-V2-OPERATING-MODEL.md
- docs/ops/pmo/program-3-club-home-page-design.md
- docs/ops/pmo/program-3-proposed-project-list.md
- docs/ops/pmo/program-5-admin-page-and-tools-design-readiness.md
- docs/ops/pmo/program-5-ideas-and-project-drafts.md
- docs/ops/pmo/program-registry.md
- docs/ops/pmo/workflow-automation.md
- docs/reference/pmo/lgfc-program-portfolio-model.md

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Documentation-only PR
- [x] No runtime UI, route, layout, header, footer, FanClub, admin UI, Store, D1, or production behavior changes

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)
- [x] This PR contains documentation-only changes
- [x] No application code, config, or runtime behavior modified

## CHANGE SUMMARY
- Adds `docs/ops/pmo/PMO-V2-OPERATING-MODEL.md` as the controlling PMO v2 authority.
- Rewrites `docs/ops/pmo/program-registry.md` to reflect PMO v2 portfolio model.
- Rewrites `docs/reference/pmo/lgfc-program-portfolio-model.md` so Programs 1-4 are the execution portfolio and Program 5 is the ideas/project-draft lane.
- Rewrites `docs/ops/pmo/workflow-automation.md` to replace legacy Program 3 intake language with Program 5 promotion language.
- Updates `docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md` to align staged Program 1 with PMO v2.
- Adds Program 3 and Program 5 discussion docs for Club Home page, proposed project list, ideas/project drafts, and admin page design readiness.
- Documents PMO v2 core correction: portfolio = Programs 1-4; Program 5 = ideas and project drafts requiring promotion before portfolio entry.
- Program 1 remains staged, not launched; task issues `#1417`-`#1424` require alignment before launch.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `./scripts/ci/docs_check_headers.sh .` — PASS (scoped changed files at merge)
  - `./scripts/ci/docs_canonical_hashes_verify.sh .` — PASS
  - `npm run typecheck` — PASS
  - `npm run lint` — PASS
  - `npm test` — PASS
  - `npm run build` — PASS
- Gate verification:
  - Commit-level workflow runs inspected: YES (merge commit `eab8244`)
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES (post-merge metadata section header remediation applied)
  - Required gates rerun or re-evaluated after fixes: YES
- Result summary: PASS (all required gates green at merge; post-merge closeout body remediation applied)

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Reviewed all bot comments.
- [x] Reviewed all GitHub review threads.
- [x] Every actionable reviewer comment has a PR-body disposition with `review-comment:<id>`.
- [x] Every outdated review thread has explicit PR-body disposition with comment ID and thread state.

Reviewer items:
- review-comment:3380850781 — accepted — PMO vocabulary table now uses lowercase `project` and `issue` where requested — thread state: outdated and resolved
- review-comment:3380850799 — accepted — Program 5 discussion table now uses lowercase `project draft` for Fundraiser and Lou Gehrig content rows — thread state: outdated and resolved
- review-comment:3380850810 — accepted — Program 5 discussion table now uses lowercase `project draft` for Annual Lou Gehrig Day operations package — thread state: outdated and resolved
- review-comment:3380850818 — accepted — Workflow Automation promotion checklist now uses lowercase `issue creation` — thread state: outdated and resolved
- review-comment:3381737665 — accepted — Codex inline documentation feedback addressed in merged PMO v2 documentation — thread state: outdated
- review-comment:3381787516 — accepted — Copilot inline documentation feedback addressed in merged PMO v2 documentation — thread state: outdated
- review-comment:3381787615 — accepted — Copilot inline documentation feedback addressed in merged PMO v2 documentation — thread state: outdated
- review-comment:3381787651 — accepted — Copilot inline documentation feedback addressed in merged PMO v2 documentation — thread state: outdated
- review-comment:3381787692 — accepted — Copilot inline documentation feedback addressed in merged PMO v2 documentation — thread state: outdated

## PR GATE READINESS CHECKLIST
- [x] Live PR check panel inspected
- [x] Commit-level workflow runs inspected
- [x] PR-level pull_request_target workflows inspected
- [x] Latest head workflow runs inspected
- [x] Failed job logs inspected for every failing gate
- [x] PR issue-accounting confirms exactly one same-repository, open, non-PR source issue
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] All review threads and comments inspected
- [x] Actionable review feedback has PR-body disposition and GitHub thread-state disposition
- [x] Required gates rerun or re-evaluated after fixes
- [x] Final PR panel confirms merge-readiness at review time

## POST-MERGE CLOSEOUT CHECKLIST
- [x] PR merged state verified
- [x] Merge commit recorded (`eab8244aab4aa8553d656264e9bb902efc60cbbf`)
- [x] Source issue state inspected after merge
- [x] Post-merge validation gates inspected when applicable
- [x] Post-merge closeout body remediation applied for parser alignment

## ACCEPTANCE CRITERIA
- [x] PMO v2 operating model documented as controlling authority
- [x] Programs 1-4 defined as rotating portfolio execution lanes; Program 5 defined as ideas/project-draft lane
- [x] Workflow Automation promotion path from Program 5 into Program 1 documented
- [x] Program 2 `#1255` non-interference preserved in documentation
- [x] Program 1 remains staged with explicit launch gate; not launched by this PR
- [x] All eight Program 1 project areas represented in implementation plan
- [x] Docs-only diff matches allowlist exactly
- [x] All reviewer comments actioned or explicitly dispositioned

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] ZIP safety confirmed
- [x] Intent label correct and singular
- [x] All reviewer feedback has both textual disposition and GitHub thread-state disposition
- [x] Post-merge closeout body remediation applied for merged PR governance

## POST-MERGE ISSUE DISPOSITION
- Post-merge closeout reconciliation for source issue **#1411** (already closed complete from prior PR #1472 merge); reconcile terminal labels (`status:complete` only) and clear stale workflow labels
- Post-merge closeout reconciliation for remediation issue **#1483** when validator passes after body apply

<!-- closeout-trigger: 2026-06-09 -->
