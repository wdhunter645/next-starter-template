### PR Template

#### Reference
Refer to `/.github/pull_request_template.md` for required structure and change conventions.

#### Governance Reference
Follow operational, rollback, and testing standards in `/docs/governance/PR_GOVERNANCE.md`.
Use `docs/reference/governance/troubleshooting-data-surface-requirements.md` as the canonical PR-gate troubleshooting reference.
When new PR-gate troubleshooting information becomes available, maintainers and agents must update both `.github/pull_request_template.md` and `docs/reference/governance/troubleshooting-data-surface-requirements.md`.

- **Issue:** #____
<!-- Replace #____ with exactly one same-repository, open, non-PR Issue number before opening/updating the PR. Required final syntax example: `- **Issue:** #123`. -->

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [ ] Read the workflow files that will run for this PR's touched paths before opening the PR.
- [ ] Read or update `.github/CI_GUARDRAILS_MAP.md` when workflow behavior is unclear or changed.
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

## PROGRESS + READINESS (MANDATORY)
- Phase:
- Task:
- Status: READY FOR REVIEW / BLOCKED / DRAFT
- Scope Confirmed: YES / NO
- Out-of-Scope Changes Present: YES / NO
- Blocking Issues:
- Notes:

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [ ] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- Replace this line with exact source file paths used for this PR.

## DIATAXIS GAP (REQUIRED IF LEGACY_FALLBACK)
- [ ] Gap Identified
- Link to issue:
- Description:

## LABEL
- Intent label for this PR: change-ops

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- Additional design/reference docs used for this PR:
  - `/docs/governance/DOCUMENT-ARCHITECTURE.md`
  - `/docs/ops/trackers/THREAD-LOG_Master.md`
  - `/docs/reference/design/.canonical-files.txt`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
<!-- Replace this comment with one bullet per exact changed file path before opening the PR. Example: `- .github/pull_request_template.md` -->

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
  - ./scripts/ci/docs_check_headers.sh .
  - ./scripts/ci/docs_check_paths.sh .
  - ./scripts/ci/docs_canonical_hashes_verify.sh .
  - For changed Diataxis docs: inspect `.github/workflows/diataxis-folder-authority-check.yml` and verify the changed files satisfy its folder-specific rules.
- Result summary:
  - PASS / FAIL
- If FAIL, explain

## DOCUMENTATION UPDATES
- [ ] Documentation updated in this PR
- [ ] No documentation updates required
- Files:
  - Replace this line with exact documentation file paths when applicable.

## REVIEWER RESPONSE ACCOUNTING
- [ ] Reviewed all reviewer comments.
- [ ] Copilot disposition received.
- [ ] Codex disposition received.
- [ ] Gemini disposition received.
- [ ] Cubic disposition received.
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
- [ ] PR issue-accounting confirms exactly one same-repository, open, non-PR source Issue
- [ ] PR body contains the required Issue syntax (for example, `- **Issue**: #123`)
- [ ] All review threads and comments inspected
- [ ] Actionable review feedback has PR-body disposition and GitHub thread-state disposition
- [ ] Bot comments inspected
- [ ] Reviewer-response accounting includes required reviewer comment IDs
- [ ] Later maintainer replies posted where gate logs require them
- [ ] Required gates rerun or re-evaluated after fixes
- [ ] Final PR panel confirms merge-readiness

## ACCEPTANCE CRITERIA
- docs_check_headers.sh passes
- docs_check_paths.sh passes
- docs_canonical_hashes_verify.sh passes
- DIATAXIS Folder Authority Check passes for touched Diataxis docs
- All required document headers present
- All changed how-to docs include a Steps, Procedure, or Execution section
- All canonical references point to files that exist in the same PR branch
- No out-of-scope file changes
- Drift gate passes
- CI passes fully

## REQUIRED PRE-REVIEW SELF-CHECK
- [ ] PR body contains all required sections with exact headings
- [ ] PR body contains the required Issue syntax (for example, `- **Issue**: #123`)
- [ ] Allowed files section matches final diff exactly
- [ ] No files outside allowlist
- [ ] ZIP safety confirmed
- [ ] Intent label correct and singular
- [ ] Local checks executed and passed
- [ ] Commit message aligns with scope
- [ ] No prohibited artifacts introduced
- [ ] All new governance/reference docs satisfy `/docs/governance/standards/document-status-and-naming_MASTER.md` minimum content requirements: Purpose, Scope, Current known truth, and Intended final state if evolving
- [ ] All canonical references point to existing repository files in the same branch before the PR opens
- [ ] All reviewer feedback has both textual disposition and GitHub thread-state disposition
- [ ] No merge-readiness claim made before all gate surfaces inspected
