### PR Template

#### Reference
Refer to `/.github/pull_request_template.md` for required structure and change conventions.

#### Governance Reference
Follow operational, rollback, and testing standards in `/docs/governance/PR_GOVERNANCE.md`.
Use `docs/reference/governance/troubleshooting-data-surface-requirements.md` as the canonical PR-gate troubleshooting reference.
When new PR-gate troubleshooting information becomes available, maintainers and agents must update both `.github/pull_request_template.md` and `docs/reference/governance/troubleshooting-data-surface-requirements.md`.

## PR LIFECYCLE REQUIREMENT (MANDATORY FOR ALL AGENTS)
A PR is not complete when it is opened. The creating or working agent owns the PR through the full lifecycle until it is ready for human review and then through post-merge closeout once the PR is merged.

This single template is the canonical lifecycle record for PR open, review readiness, merge approval readiness, and post-merge closeout. Do not split lifecycle evidence across separate PR templates; keep phase-specific evidence in the sections below so source issue, allowlist, verification, reviewer, and closeout accounting stay in one auditable place.

Required lifecycle:
1. Confirm or create exactly one same-repository, open, non-PR source issue.
2. Insert one accepted source-issue accounting line consistent with `/docs/governance/PR_GOVERNANCE.md`. Preferred format: `- **Issue:** #123`.
3. Prepare the PR body from this template before or immediately after opening the PR.
4. Confirm the changed-file allowlist matches the actual final diff.
5. Inspect all gate checks after every PR body update or commit.
6. Troubleshoot every failing gate using `docs/reference/governance/troubleshooting-data-surface-requirements.md`.
7. Inspect reviewer comments, bot comments, and review threads.
8. Resolve or explicitly disposition every actionable reviewer item in the PR body.
9. Rerun or wait for all required gates after fixes.
10. Mark or claim `READY FOR REVIEW` only after all required gates are green and no actionable reviewer item remains unresolved.
11. After merge, verify the merge commit, verify the source issue state, close the source issue when automation did not, and record tracker/documentation follow-up only when explicitly required by the source issue.

Agents must not hand a PR to a human approver while any gate, review comment, or review thread still requires agent action.
Agents must not treat merge as complete closeout until the source issue is reconciled and any explicitly required tracker/status-index work is complete or delegated.

- **Issue:** #____
<!-- Required: replace #____ with exactly one same-repository, open, non-PR issue number before opening/updating the PR. Preferred final syntax: `- **Issue:** #123`. Other accepted source-issue formats are governed by `/docs/governance/PR_GOVERNANCE.md`. Do not use a PR number, an external issue, or a closed issue as the source issue. -->

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [ ] Confirm exactly one same-repository, open, non-PR source issue exists.
- [ ] Confirm one accepted issue-accounting line is present before opening or updating the PR. Preferred format: `- **Issue:** #123`.
- [ ] Read the workflow files that will run for this PR's touched paths before opening the PR.
- [ ] Read or update `.github/CI_GUARDRAILS_MAP.md` when workflow behavior is unclear or changed.
- [ ] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.
- [ ] For docs changes, confirm every changed active Markdown file starts with the required authority header from `docs/templates/markdown-header-template.md`.
- [ ] For `docs/how-to/**`, confirm every changed file includes `## Steps`, `## Procedure`, or `## Execution`.
- [ ] For `docs/tutorials/**`, confirm every changed file includes `## Goal`, `## Outcome`, `## Steps`, or `## Walkthrough`.
- [ ] For `docs/reference/**`, confirm no procedural/runbook sections or executable command blocks are present unless the relevant workflow explicitly permits them.
- [ ] For `docs/explanation/**`, confirm no procedural/runbook sections or executable command blocks are present unless the relevant workflow explicitly permits them.
- [ ] Confirm every `Canonical Reference:` value points to a file that exists in the same branch at PR-open time, or is intentionally self-referential.
- [ ] Confirm every changed file is under the intended project folder when a project-specific folder has been declared.
- [ ] Confirm all example code paths, extensions, aliases, and imports match current repository conventions.
- [ ] Confirm PR body file allowlist exactly matches the final changed-file list before opening.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [ ] No ZIP file exists in the repo root
- [ ] OR any ZIP file that was present in the repo root was deleted before any other change
- [ ] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS (REQUIRED FOR LAUNCHED-PROGRAM QUEUE TASKS)
- Dependency-map result: pass / fail / not-applicable
- Next queue item: <issue # and title> or halt — <reason>
- Continue/halt decision: continue / halt — <one-sentence rationale>

For one-off tasks or programs without an approved dependency map, set all three
fields to `not-applicable` with a one-line rationale.

Canonical reference: `/docs/reference/pmo/lgfc-program-queue-and-dependency-map.md`

## PROGRESS + READINESS (MANDATORY)
- Phase:
- Task:
- Status: DRAFT / BLOCKED / READY FOR REVIEW
- Scope Confirmed: YES / NO
- Out-of-Scope Changes Present: YES / NO
- Blocking Issues:
- Notes:

Status rules:
- `DRAFT`: Implementation, PR body, tests, or review response is incomplete.
- `BLOCKED`: A specific external dependency or unresolved gate prevents agent completion.
- `READY FOR REVIEW`: All required gates are green, reviewer/bot comments are addressed, review threads are resolved or explicitly dispositioned, and the final PR panel has been inspected.

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [ ] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- Required: list exact source file paths used for this PR.

## DIATAXIS GAP (REQUIRED IF LEGACY_FALLBACK)
- [ ] Gap Identified
- Link to issue:
- Description:

## LABEL
- Intent label for this PR: change-ops

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`
- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- Additional design/reference docs used for this PR:
  - Required: list exact applicable paths.

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
<!-- Required: provide one bullet per exact changed file path before opening the PR. Example: `- .github/pull_request_template.md` -->

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [ ] Header, footer, navigation, auth, and route invariants preserved unless explicitly in scope
- [ ] No unauthorized visual drift introduced
- [ ] No out-of-scope UX changes introduced
- [ ] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant unless explicitly in scope

## DRIFT GATE ALIGNMENT (MANDATORY)
- [ ] Exactly ONE intent label applied
- [ ] File changes match allowlist exactly
- [ ] No mixed-intent changes present

## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)
- [ ] This PR contains documentation-only changes
- [ ] No application code, config, or runtime behavior modified

## CHANGE SUMMARY
- Describe the exact change in 1–5 bullets
- No vague language
- No cleanup or misc wording

## BUILD / TEST / VERIFICATION
- Commands run:
  - Required: list exact commands and outcomes.
- Gate verification:
  - Commit-level workflow runs inspected: YES / NO
  - PR-level governance/accounting workflows inspected: YES / NO
  - Failed job logs inspected for every failing gate: YES / NO / N/A
  - Required gates rerun or re-evaluated after fixes: YES / NO / N/A
- Result summary:
  - PASS / FAIL / PENDING
- If FAIL, explain the exact failing workflow, job, step, and next agent action.

## DOCUMENTATION UPDATES
- [ ] Documentation updated in this PR
- [ ] No documentation updates required
- Files:
  - Required: list exact documentation file paths when applicable.

## REVIEWER RESPONSE ACCOUNTING
- [ ] Reviewed all reviewer comments.
- [ ] Reviewed all bot comments.
- [ ] Reviewed all GitHub review threads.
- [ ] Copilot disposition received or not applicable.
- [ ] Codex disposition received or not applicable.
- [ ] Gemini disposition received or not applicable.
- [ ] Cubic disposition received or not applicable.
- [ ] Every actionable reviewer comment has a PR-body disposition.
- [ ] Every GitHub review thread has an explicit thread-state disposition: resolved, outdated, or intentionally left unresolved with rationale.

Reviewer items:
- review-comment:<id> — accepted/rejected/acknowledged — <specific resolution or reason> — thread state: resolved/outdated/unresolved-with-rationale

## PR GATE READINESS CHECKLIST
- [ ] Live PR check panel inspected
- [ ] Commit-level workflow runs inspected
- [ ] PR-level pull_request_target workflows inspected
- [ ] Latest head workflow runs inspected
- [ ] Failed job logs inspected for every failing gate
- [ ] Workflow YAML or enforcement logic inspected before documenting gate behavior
- [ ] PR issue-accounting confirms exactly one same-repository, open, non-PR source issue
- [ ] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [ ] All review threads and comments inspected
- [ ] Actionable review feedback has PR-body disposition and GitHub thread-state disposition
- [ ] Bot comments inspected
- [ ] Reviewer-response accounting includes required reviewer comment IDs when required by gate logs
- [ ] Later maintainer replies posted where gate logs require them
- [ ] Required gates rerun or re-evaluated after fixes
- [ ] Final PR panel confirms merge-readiness

## POST-MERGE CLOSEOUT CHECKLIST
- [ ] PR merged state verified
- [ ] Merge commit recorded
- [ ] Source issue state inspected after merge
- [ ] Source issue closed manually when automation did not close it
- [ ] Source issue closure comment references merged PR and merge commit
- [ ] Explicitly required tracker/status-index follow-up is complete or delegated when the source issue authorizes that work
- [ ] Post-merge validation gates inspected when applicable

## ACCEPTANCE CRITERIA
Post-merge validation fails if any acceptance criterion remains unchecked after merge. Post-merge-only criteria must be checked with evidence, marked not applicable with rationale by replacing the checkbox line, or delegated to a tracked remediation issue before closeout is claimed.

- [ ] Required source issue exists, is open, is same-repository, and is not a PR.
- [ ] PR issue-accounting gate passes.
- [ ] Drift gate passes.
- [ ] Intent gate passes.
- [ ] ZIP safety gate passes.
- [ ] Quality checks pass.
- [ ] Secret scan passes.
- [ ] Repository-specific governance gates pass.
- [ ] All required document headers present when docs are changed.
- [ ] All changed how-to docs include a Steps, Procedure, or Execution section when applicable.
- [ ] All canonical references point to files that exist in the same PR branch.
- [ ] No out-of-scope file changes.
- [ ] All actionable reviewer and bot feedback is resolved or explicitly dispositioned.
- [ ] PR is ready for human review.
- [ ] Post-merge source issue closure is complete; tracker/status-index follow-up is complete only when explicitly authorized by the source issue.

## REQUIRED PRE-REVIEW SELF-CHECK
- [ ] PR body contains all required sections with exact headings
- [ ] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [ ] Allowed files section matches final diff exactly
- [ ] No files outside allowlist
- [ ] ZIP safety confirmed
- [ ] Intent label correct and singular
- [ ] Local checks executed and passed or exact blocker documented
- [ ] Commit message aligns with scope
- [ ] No prohibited artifacts introduced
- [ ] All new governance/reference docs satisfy `/docs/governance/standards/document-status-and-naming_MASTER.md` minimum content requirements: Purpose, Scope, Current known truth, and Intended final state if evolving
- [ ] All canonical references point to existing repository files in the same branch before the PR opens
- [ ] All reviewer feedback has both textual disposition and GitHub thread-state disposition
- [ ] No merge-readiness claim made before all gate surfaces inspected
- [ ] Status is set to READY FOR REVIEW only after all required gates and reviewer-response obligations are complete
