- **Issue:** #1380

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present. `- **Issue:** #1380`
- [x] Read the workflow files that will run for this PR's touched paths before opening the PR.
- [x] Read or update `.github/CI_GUARDRAILS_MAP.md` when workflow behavior is unclear or changed.
- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.
- [x] For docs changes, confirm every changed active Markdown file starts with the required authority header from `docs/templates/markdown-header-template.md`.
- [x] Confirm every `Canonical Reference:` value points to a file that exists in the same branch at PR-open time, or is intentionally self-referential.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list before opening.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## PROGRESS + READINESS (MANDATORY)
- Phase: Documentation governance
- Task: Require startup verification of LGFC tools
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge body remediation applied)
- Notes: Merged as PR #1381 (merge SHA 093201ed4fb63eb500f1608750583b3ad77a93d1). Post-merge body remediation applied.

## DOCUMENTATION SOURCE (MANDATORY)
- [x] DIATAXIS_FULL
- [ ] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- `Agent.md`
- `docs/ops/ai/SHARED-AGENT-RULES.md`
- `docs/ops/ai/CORE-RULES.md`
- `docs/ops/ai/CHATGPT-RULES.md`
- `docs/ops/ai/pr-lifecycle-standard.md`
- `.github/pull_request_template.md`
- `.github/CI_GUARDRAILS_MAP.md`
- `docs/governance/PR_GOVERNANCE.md`
- `docs/governance/PR_PROCESS.md`
- `docs/governance/standards/pr-intent-labels.md`
- `docs/reference/governance/troubleshooting-data-surface-requirements.md`
- `docs/templates/markdown-header-template.md`

## DIATAXIS GAP (REQUIRED IF LEGACY_FALLBACK)
- [x] Gap Identified: N/A
- Link to issue: N/A
- Description: N/A

## LABEL
- Intent label for this PR: docs-only

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`
- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- Additional design/reference docs used for this PR:
  - `docs/ops/ai/CHATGPT-RULES.md`
  - `docs/ops/ai/SHARED-AGENT-RULES.md`
  - `docs/ops/ai/CORE-RULES.md`
  - `docs/governance/standards/pr-intent-labels.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `docs/ops/ai/CHATGPT-RULES.md`

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

## DOCS-ONLY ASSERTION (REQUIRED FOR docs-only)
- [x] This PR contains documentation-only changes
- [x] No application code, config, workflow YAML, tracker/status-index, credential, API integration, or runtime behavior modified

## CHANGE SUMMARY
- Adds an `LGFC startup verification` section to `docs/ops/ai/CHATGPT-RULES.md`.
- Requires startup verification/reporting for GitHub plus the four LGFC Google services: Gmail, Google Calendar, Google Contacts, and Google Drive.
- Defines LGFC `Google services` nomenclature as the current four-service set, not the broader Google product universe.
- Adds startup availability states: available, unavailable, and not verified.

## BUILD / TEST / VERIFICATION
- Commands run:
  - Manual changed-file header inspection — PASS
  - Manual docs-only scope inspection — PASS
- Gate verification:
  - Commit-level workflow runs inspected: YES
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES
  - Required gates rerun or re-evaluated after fixes: YES
- Result summary: PASS

## DOCUMENTATION UPDATES
- [x] Documentation updated in this PR
- Files:
  - `docs/ops/ai/CHATGPT-RULES.md`

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments
- [x] Reviewed all bot comments
- [x] Reviewed all GitHub review threads
- [x] Copilot disposition received or not applicable
- [x] Codex disposition received or not applicable
- [x] Gemini disposition received or not applicable
- [x] Cubic disposition received or not applicable
- [x] Every actionable reviewer comment has a PR-body disposition
- [x] Every GitHub review thread has an explicit thread-state disposition

## PR GATE READINESS CHECKLIST
- [x] Live PR check panel inspected
- [x] Commit-level workflow runs inspected
- [x] PR-level pull_request_target workflows inspected
- [x] Latest head workflow runs inspected
- [x] Failed job logs inspected for every failing gate
- [x] Workflow YAML or enforcement logic inspected before documenting gate behavior
- [x] PR issue-accounting confirms exactly one same-repository, open, non-PR source issue
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`
- [x] All review threads and comments inspected
- [x] Actionable review feedback has PR-body disposition and GitHub thread-state disposition
- [x] Bot comments inspected
- [x] Reviewer-response accounting includes required reviewer comment IDs when required by gate logs
- [x] Later maintainer replies posted where gate logs require them
- [x] Required gates rerun or re-evaluated after fixes
- [x] Final PR panel confirms merge-readiness

## POST-MERGE CLOSEOUT CHECKLIST
- [x] PR merged state verified
- [x] Merge commit recorded
- [x] Source issue state inspected after merge
- [x] Source issue closure comment references merged PR and merge commit when applicable
- [x] Post-merge validation gates inspected when applicable

## ACCEPTANCE CRITERIA
- [x] Required source issue exists, is open, is same-repository, and is not a PR.
- [x] `CHATGPT-RULES.md` states that LGFC startup must verify GitHub access.
- [x] `CHATGPT-RULES.md` states that LGFC startup must verify the four LGFC Google services: Gmail, Google Calendar, Google Contacts, and Google Drive.
- [x] The wording explicitly distinguishes the LGFC Google service set from all Google products.
- [x] No app code, workflow YAML, tracker/status-index files, credentials, API integration, or runtime configuration are changed.
- [x] PR uses exactly one source issue and one intent label.
- [x] PR issue-accounting gate passes.
- [x] Drift gate passes.
- [x] Intent gate passes.
- [x] ZIP safety gate passes.
- [x] Quality checks pass.
- [x] Secret scan passes.
- [x] Repository-specific governance gates pass.
- [x] All required document headers present when docs are changed.
- [x] No out-of-scope file changes.
- [x] All actionable reviewer and bot feedback is resolved or explicitly dispositioned.
- [x] PR is ready for human review.

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] ZIP safety confirmed
- [x] Intent label correct and singular: `docs-only`
- [x] Local/tool checks executed and passed or exact blocker documented
- [x] Commit message aligns with scope
- [x] No prohibited artifacts introduced
- [x] All canonical references point to existing repository files in the same branch before the PR opens
- [x] No merge-readiness claim made before all gate surfaces inspected
- [x] Post-merge closeout body remediation applied for merged PR governance

## POST-MERGE ISSUE DISPOSITION
- Close **#1380** after post-merge verification passes
- Close remediation **#1383** when validator passes after body apply

<!-- closeout-trigger: 2026-06-06 -->
