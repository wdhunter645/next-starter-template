### PR Template

#### Reference
Refer to `/.github/pull_request_template.md` for required structure and change conventions.

#### Governance Reference
Before opening or updating any PR, agents must complete the mandatory documentation chain in `/Agent.md`:
`/Agent.md` → `/docs/ops/ai/SHARED-AGENT-RULES.md` → `/docs/ops/ai/CORE-RULES.md` → applicable agent-specific rules under `/docs/ops/ai/` → `/.agents/skills/lgfc-pr-governance/SKILL.md` → `/.github/pull_request_template.md` → applicable governance docs under `/docs/governance/`.

Follow operational, rollback, and testing standards in `/docs/governance/PR_GOVERNANCE.md`.
Use `docs/reference/governance/troubleshooting-data-surface-requirements.md` as the canonical PR-gate troubleshooting reference.
When new PR-gate troubleshooting information becomes available, maintainers and agents must update both `.github/pull_request_template.md` and `docs/reference/governance/troubleshooting-data-surface-requirements.md`.

## PR LIFECYCLE REQUIREMENT (MANDATORY FOR ALL AGENTS)
A PR is not complete when it is opened. The creating or working agent owns the PR through the full lifecycle until it reaches the final pre-merge handoff state (`READY FOR MERGE`) and then through post-merge closeout once the PR is merged.

This single template is the canonical lifecycle record for PR open, review readiness, merge approval readiness, and post-merge closeout. Phase-specific evidence must remain in the sections below so source issue, allowlist, verification, reviewer, acceptance, and closeout accounting stay in one auditable place.

`READY FOR REVIEW` and `READY FOR MERGE` are distinct states. Review-ready does not equal merge-ready. Use `READY FOR REVIEW` only when the PR is ready for reviewer/human inspection. Use `READY FOR MERGE` only when all required checks, reviewer-response accounting, source issue accounting, acceptance criteria, auto-repair status, and governance gates are satisfied and the PR is ready for final merge authorization.

Required lifecycle:
1. Confirm or create exactly one same-repository, open, non-PR source issue.
2. Insert one accepted source-issue accounting line consistent with `/docs/governance/PR_GOVERNANCE.md`. Preferred format: `- **Issue:** #123`.
3. Prepare the PR body from this template before or immediately after opening the PR.
4. Confirm the changed-file allowlist matches the actual final diff.
5. Inspect all gate checks after every PR body update or commit.
6. Troubleshoot every failing gate using `docs/reference/governance/troubleshooting-data-surface-requirements.md`.
7. Mark or claim `READY FOR REVIEW` only after implementation, PR body evidence, and initial gate inspection are complete and the PR is ready for reviewer/human inspection.
8. After the PR is review-ready, inspect reviewer comments, bot comments, and review threads.
9. Resolve or explicitly disposition every actionable reviewer item in the PR body.
10. Confirm no `pr-body-auto-repair` scaffold remains unresolved or marked `BLOCKED`.
11. Rerun or wait for all required gates after fixes.
12. Record the pre-merge closeout prediction fields in this PR body before claiming merge readiness.
13. Mark or claim `READY FOR MERGE` only after all required gates are green, reviewer-response accounting is complete, source issue accounting is complete, acceptance criteria are checked or dispositioned, pre-merge closeout prediction is recorded, and no actionable reviewer item remains unresolved.
14. After merge, verify the merge commit, verify the source issue state, close the source issue when automation did not, and record tracker/documentation follow-up only when explicitly required by the source issue.

Agents must not hand a PR to a human approver for final merge action while any gate, review comment, review thread, PR-body section, acceptance criterion, auto-repair scaffold, or source-issue accounting item still requires agent action.

## PR LIFECYCLE PHASE REQUIREMENTS

### Phase 1 — PR Open
Required before or immediately after opening:
- source issue line;
- lifecycle status set to `DRAFT` or `BLOCKED`;
- intent label field;
- file-touch allowlist;
- docs-only/runtime classification;
- queue/dependency applicability;
- ZIP safety;
- design/governance source of truth.

### Phase 2 — Ready for Review
Required before marking or claiming `READY FOR REVIEW`:
- implementation or documentation changes complete for scoped files;
- changed-file allowlist matches final diff;
- local checks or CI-only rationale recorded;
- acceptance criteria reviewed and updated;
- bot comments inspected;
- no known blocking PR-body scaffold remains.

### Phase 3 — Ready for Merge
Required before marking or claiming `READY FOR MERGE`:
- all required gates green on latest head;
- all reviewer comments, bot comments, and review threads inspected;
- every actionable item resolved, explicitly rejected with rationale, marked not applicable, or linked to bounded follow-up;
- no unresolved `pr-body-auto-repair` scaffold remains;
- pre-merge closeout prediction is recorded;
- final merge-readiness decision is recorded.

### Phase 4 — Post-Merge Closeout
Required after merge:
- merge commit verified;
- source issue state inspected;
- source issue closed or intentionally left open with rationale;
- release/deploy evidence recorded when applicable;
- tracker/status-index follow-up completed only when explicitly authorized by the source issue.

## Agent Completion / Ready-for-Merge Checklist
An implementation agent is not complete when code is pushed or a PR is opened.

Before handing this PR to Atlas/Bill as ready for final merge authorization, the agent confirms:

- [ ] PR body matches final diff, source issue, allowlist, verification evidence, acceptance criteria, auto-repair status, and reviewer-response accounting.
- [ ] All reviewer comments, bot comments, and review threads have been inspected.
- [ ] Every actionable reviewer item is fixed, rejected with rationale, marked not applicable, or linked to a bounded follow-up issue.
- [ ] All required gates pass on the latest PR head after final code and PR-body updates.
- [ ] No unresolved `pr-body-auto-repair` scaffold remains.
- [ ] PR status is `READY FOR MERGE`, or the exact blocker preventing that state is documented.
- [ ] Final report includes current head SHA, checks run, gate status, reviewer disposition status, acceptance-criteria status, auto-repair status, and ready-for-merge status.

A PR must not be handed to Atlas/Bill for merge while any required gate, reviewer comment, review thread, PR-body section, acceptance criterion, auto-repair scaffold, or source-issue accounting item still requires agent action.

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
- Next queue item: <issue # and title> / halt — <reason> / not-applicable
- Continue/halt decision: continue / halt / not-applicable — <one-sentence rationale>

For one-off tasks or programs without an approved dependency map, set all three fields to `not-applicable` with a one-line rationale.

Canonical reference: `/docs/reference/pmo/lgfc-program-queue-and-dependency-map.md`

## PRE-MERGE CLOSEOUT PREDICTION (REQUIRED BEFORE READY FOR MERGE)
- Pre-merge closeout prediction: pass / fail / blocked
- Source issue state before merge: open / closed / other
- Expected post-merge source issue action: auto-close / manual close / no-op / remediation follow-up
- Reviewer disposition parseability: pass / fail / not-applicable
- Acceptance criteria status: complete / incomplete / not-applicable
- PR body auto-repair status: not-present / resolved / unresolved / blocked
- Queue continuation after closeout: continue / halt / not-applicable

## PROGRESS + READINESS (MANDATORY)
- Phase: PR open / ready for review / ready for merge / post-merge closeout
- Task:
- Status: DRAFT / BLOCKED / READY FOR REVIEW / READY FOR MERGE
- Scope Confirmed: YES / NO
- Out-of-Scope Changes Present: YES / NO
- Blocking Issues:
- Notes:

Status rules:
- `DRAFT`: Implementation, PR body, tests, acceptance criteria, or review response is incomplete.
- `BLOCKED`: A specific external dependency, unresolved gate, unresolved auto-repair scaffold, or unresolved review obligation prevents agent completion.
- `READY FOR REVIEW`: Implementation and PR body evidence are complete enough for reviewer/human inspection. This state does not authorize merge and does not imply merge readiness.
- `READY FOR MERGE`: All required gates are green, reviewer/bot comments are addressed, review threads are resolved or explicitly dispositioned, source issue accounting is complete, acceptance criteria are complete or dispositioned, auto-repair status is resolved/not-present, pre-merge closeout prediction is recorded, and the final PR panel confirms merge-readiness. Human/operator merge approval is still required.

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
- Intent label for this PR: change-ops / code-change / content / design / other configured label

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`
- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md` / not-applicable — <rationale>
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

## RUNTIME / CONFIG ASSERTION (REQUIRED FOR NON-DOCS-ONLY PRS)
- [ ] Runtime or configuration behavior is intentionally modified
- [ ] Required tests for runtime/config changes were run or exact blocker is documented
- [ ] Deployment, rollback, and smoke-test impact is documented
- [ ] Not applicable — docs-only PR

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

## ACCEPTANCE CRITERIA STATUS (MANDATORY)
Each source-issue acceptance criterion must be checked, marked not applicable with rationale, or delegated to a bounded follow-up issue before `READY FOR MERGE`.

- Source issue acceptance criteria reviewed: YES / NO
- Unchecked acceptance criteria remain: YES / NO / N/A
- Follow-up issue required: YES / NO
- Follow-up issue number: #____ / not-applicable

## PR BODY AUTO-REPAIR STATUS (MANDATORY)
- Auto-repair block present: YES / NO
- Auto-repair status: not-present / resolved / unresolved / blocked
- Auto-repair scaffold removed or dispositioned before READY FOR MERGE: YES / NO / N/A
- If unresolved or blocked, exact blocker:

## REVIEWER RESPONSE ACCOUNTING
- [ ] Reviewed all reviewer comments.
- [ ] Reviewed all bot comments.
- [ ] Reviewed all GitHub review threads.
- [ ] Copilot disposition received or not applicable.
- [ ] Cubic disposition received or not applicable.
- [ ] Every actionable reviewer comment has a PR-body disposition with `review-comment:<id>`.
- [ ] Every actionable trusted bot or reviewer comment has a PR-body disposition with `review-comment:<id>`.
- [ ] Every GitHub review thread has an explicit thread-state disposition: resolved, outdated, unresolved-with-rationale, or follow-up.
- [ ] Every outdated review thread (`is_outdated: true` or stale commit SHA) has explicit PR-body disposition even when GitHub marks the thread outdated.
- [ ] Late reviewer comments arriving after `READY FOR REVIEW` or `READY FOR MERGE` are dispositioned before merge.
- [ ] Undispositioned reviewer findings are linked to a bounded follow-up issue when not fixed in this PR.

Accepted disposition states:
- resolved by code/doc change and thread marked resolved, or
- outdated with explicit PR-body disposition (`review-comment:<id>` + `thread state: outdated`), or
- rejected / not applicable with rationale and `thread state: unresolved-with-rationale`, or
- linked follow-up issue (`follow-up-issue:#<number>` + `thread state: follow-up`).

Reviewer items (required format for gate parsing):
- review-comment:<id> — accepted/rejected/acknowledged/not-applicable — <specific resolution or reason> — thread state: resolved/outdated/unresolved-with-rationale/follow-up
- review-comment:<id> — acknowledged — <bot or reviewer finding disposition> — thread state: resolved/outdated/unresolved-with-rationale/follow-up
- review-comment:<id> — rejected — <rationale> — thread state: follow-up — follow-up-issue:#<issue>

## FINAL MERGE READINESS DECISION (REQUIRED BEFORE READY FOR MERGE)
- Latest head SHA:
- Required gates green on latest head: YES / NO
- Live PR check panel inspected after last commit/body update: YES / NO
- Review threads resolved or explicitly dispositioned: YES / NO
- Bot comments resolved or explicitly dispositioned: YES / NO
- Acceptance criteria complete or dispositioned: YES / NO
- PR body auto-repair status resolved/not-present: YES / NO
- Pre-merge closeout prediction recorded: YES / NO
- Source issue closeout action known: YES / NO
- Final decision: READY FOR MERGE / BLOCKED / WAIT FOR REVIEW / WAIT FOR BILL

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

## POST-MERGE ISSUE DISPOSITION (REQUIRED FOR CHILD PROJECT / UMBRELLA SOURCE ISSUES)
Use only when the source issue is a child project, umbrella issue, or controller issue that should remain open after merge.

- Source issue **#____** remains **open** with `status:active`; remove only `status:post-merge-verify` and other stale workflow labels; **do not close** #____
- For one-off task issues that should close on merge, omit this section or replace with explicit terminal-close authorization.

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
- [ ] All source-issue acceptance criteria are checked, marked not applicable with rationale, or delegated to a bounded follow-up issue.
- [ ] PR body auto-repair status is `not-present` or `resolved`.
- [ ] All actionable reviewer and bot feedback is resolved or explicitly dispositioned.
- [ ] PR is ready for merge decision (`READY FOR MERGE`); review-ready alone is insufficient.
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
- [ ] Docs-only/runtime classification completed
- [ ] Queue/dependency applicability completed
- [ ] Acceptance criteria status completed
- [ ] PR body auto-repair status completed
- [ ] Final merge-readiness section exists and remains `BLOCKED`, `WAIT FOR REVIEW`, or `WAIT FOR BILL` until final gates are complete
- [ ] All new governance/reference docs satisfy `/docs/governance/standards/document-status-and-naming_MASTER.md` minimum content requirements: Purpose, Scope, Current known truth, and Intended final state if evolving
- [ ] All canonical references point to existing repository files in the same branch before the PR opens
- [ ] All reviewer feedback has both textual disposition and GitHub thread-state disposition
- [ ] No merge-readiness claim made before all gate surfaces inspected
- [ ] Status is set to READY FOR REVIEW only when the PR is ready for reviewer/human inspection
- [ ] Status is set to READY FOR MERGE only after all required gates, reviewer-response obligations, source issue accounting, acceptance criteria, auto-repair status, and pre-merge closeout prediction are complete
