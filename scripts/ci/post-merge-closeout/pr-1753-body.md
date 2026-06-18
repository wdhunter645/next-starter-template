<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1259

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR. Preferred format: `- **Issue:** #123`.
- [x] Read the workflow files that will run for this PR's touched paths before opening the PR.
- [x] Read or update `.github/CI_GUARDRAILS_MAP.md` when workflow behavior is unclear or changed.
- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.
- [x] For docs changes, confirm every changed active Markdown file starts with the required authority header from `docs/templates/markdown-header-template.md`.
- [x] For `docs/how-to/**`, confirm every changed file includes `## Steps`, `## Procedure`, or `## Execution`.
- [x] For `docs/tutorials/**`, confirm every changed file includes `## Goal`, `## Outcome`, `## Steps`, or `## Walkthrough`.
- [x] For `docs/reference/**`, confirm no procedural/runbook sections or executable command blocks are present unless the relevant workflow explicitly permits them.
- [x] For `docs/explanation/**`, confirm no procedural/runbook sections or executable command blocks are present unless the relevant workflow explicitly permits them.
- [x] Confirm every `Canonical Reference:` value points to a file that exists in the same branch at PR-open time, or is intentionally self-referential.
- [x] Confirm every changed file is under the intended project folder when a project-specific folder has been declared.
- [x] Confirm all example code paths, extensions, aliases, and imports match current repository conventions.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list before opening.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] OR any ZIP file that was present in the repo root was deleted before any other change
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS (REQUIRED FOR LAUNCHED-PROGRAM QUEUE TASKS)
- Dependency-map result: pass — Task 009 complete on main; Task 008 disposition package is the authorized next deliverable
- Next queue item: post-merge tracker sync after Task 008 merge (Phase 4 queue complete pending Atlas review)
- Continue/halt decision: continue — Task 008 authorized on #1259 2026-06-17

Canonical reference: `/docs/reference/pmo/lgfc-program-queue-and-dependency-map.md`

## PROGRESS + READINESS (MANDATORY)
- Phase: Phase 4 — Website QA / Production Validation
- Task: Task 008 — Public-core legacy disposition documentation
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge closeout body remediation applied)
- Notes: Merged as PR #1753 (merge SHA `678699e346bc04f3f80f69e2888700d736ebcc91`). Post-merge closeout body remediation for exception #1761 (batch #1791).

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [x] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- `docs/ops/implementation-plans/website-qa-production-validation.md`
- `docs/ops/reports/website-qa-production-validation-legacy-issue-reconciliation.md`
- `docs/ops/reports/website-qa-production-validation-as-built-gap-analysis.md`
- `docs/ops/reports/website-qa-production-validation-route-nav-validation.md`
- `docs/ops/reports/website-qa-production-validation-auth-state-validation.md`
- `docs/ops/reports/website-qa-production-validation-mobile-responsive-validation.md`
- `docs/ops/reports/website-qa-production-validation-d1-b2-read-path-validation.md`
- `docs/ops/reports/website-qa-production-validation-content-inventory-public-surface-validation.md`
- `docs/ops/reports/website-qa-production-validation-launch-readiness-h011-disposition.md`
- `docs/ops/reports/website-qa-production-validation-final-qa-handoff.md`

## DIATAXIS GAP (REQUIRED IF LEGACY_FALLBACK)
- [ ] Gap Identified

## LABEL
- Intent label for this PR: infra

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`
- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- Additional design/reference docs used for this PR:
  - `docs/ops/implementation-plans/website-qa-production-validation.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `docs/ops/reports/website-qa-production-validation-legacy-disposition-package.md`
- `tests/website-qa-legacy-disposition-package.test.ts`

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved unless explicitly in scope
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced
- [x] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant unless explicitly in scope

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)
- [ ] This PR contains documentation-only changes
- [ ] No application code, config, or runtime behavior modified

## CHANGE SUMMARY
- Publish Task 008 legacy disposition package with copy-paste comments for `#1053`, `#943`–`#947`, `#1013`–`#1017`, `#1108`–`#1112`
- Map each legacy issue to Phase 4 verification evidence (Tasks 002–007) and original delivery PRs
- Preserve `#1112` T50 partially satisfied / H-011 bounded deferral per Task 007
- Add contract tests (`tests/website-qa-legacy-disposition-package.test.ts`) — 6 cases

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npm test -- tests/website-qa-legacy-disposition-package.test.ts` — PASS (6/6)
  - `npm run typecheck` — PASS
  - `DOCS_HEADER_FILE_LIST=/tmp/task008-docs-header-list.txt ./scripts/ci/docs_check_headers.sh .` — PASS
- Gate verification:
  - Commit-level workflow runs inspected: YES
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES
  - Required gates rerun or re-evaluated after fixes: YES
- Result summary:
  - PASS — all required gates green on head `a716300`

## DOCUMENTATION UPDATES
- [x] Documentation updated in this PR
- [ ] No documentation updates required
- Files:
  - `docs/ops/reports/website-qa-production-validation-legacy-disposition-package.md`

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Reviewed all bot comments.
- [x] Reviewed all GitHub review threads.
- [x] Copilot disposition received or not applicable.
- [x] Codex disposition received or not applicable.
- [x] Gemini disposition received or not applicable.
- [x] Cubic disposition received or not applicable.

## PR GATE READINESS CHECKLIST
- [x] Live PR check panel inspected
- [x] Commit-level workflow runs inspected
- [x] PR-level pull_request_target workflows inspected
- [x] Latest head workflow runs inspected
- [x] Failed job logs inspected for every failing gate
- [x] Workflow YAML or enforcement logic inspected before documenting gate behavior
- [x] PR issue-accounting confirms exactly one same-repository, open, non-PR source issue
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] All review threads and comments inspected
- [x] Actionable review feedback has PR-body disposition and GitHub thread-state disposition
- [x] Bot comments inspected
- [x] Reviewer-response accounting includes required reviewer comment IDs when required by gate logs
- [x] Later maintainer replies posted where gate logs require them
- [x] Required gates rerun or re-evaluated after fixes
- [x] Final PR panel confirms merge-readiness

## POST-MERGE CLOSEOUT CHECKLIST
- [ ] PR merged state verified
- [ ] Merge commit recorded
- [ ] Source issue state inspected after merge
- [ ] Source issue closed manually when automation did not close it
- [ ] Source issue closure comment references merged PR and merge commit
- [x] Explicitly required tracker/status-index follow-up is complete or delegated when the source issue authorizes that work — tracker sync PR required post-merge
- [ ] Post-merge validation gates inspected when applicable

## POST-MERGE ISSUE DISPOSITION
- Source issue **#1259** remains **open** with `status:active`; remove stale workflow labels; **do not close** #1259
- Close remediation exception **#1761** when validator passes after body apply.

## ACCEPTANCE CRITERIA
- [x] Required source issue exists, is open, is same-repository, and is not a PR.
- [x] PR issue-accounting gate passes.
- [x] Drift gate passes.
- [x] Intent gate passes.
- [x] ZIP safety gate passes.
- [x] Quality checks pass.
- [x] Secret scan passes.
- [x] Repository-specific governance gates pass.
- [x] All required document headers present when docs are changed.
- [x] All changed how-to docs include a Steps, Procedure, or Execution section when applicable.
- [x] All canonical references point to files that exist in the same PR branch.
- [x] No out-of-scope file changes.
- [x] All actionable reviewer and bot feedback is resolved or explicitly dispositioned.
- [x] PR is ready for human review.
- [x] Post-merge source issue closure is complete; tracker/status-index follow-up is complete only when explicitly authorized by the source issue — delegated: tracker sync post-merge; #1259 remains open per umbrella disposition

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] Allowed files section matches final diff exactly
<!-- CURSOR_AGENT_PR_BODY_END -->
