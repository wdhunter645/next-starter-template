### PR Template

#### Reference
Refer to `/.github/pull_request_template.md` for required structure and change conventions.

#### Governance Reference
Follow operational, rollback, and testing standards in `/docs/governance/PR_GOVERNANCE.md`.

- **Issue:** #123

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
- Replace this line with exact changed file paths before opening the PR.

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
  - ./scripts/ci/docs_canonical_hashes_verify.sh .
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
- [ ] PR body contains the required Issue syntax, for example `- **Issue:** #123`
- [ ] All review threads and comments inspected
- [ ] All actionable review comments acknowledged in PR body
- [ ] All addressed review threads resolved in GitHub
- [ ] All unresolved review threads have explicit rationale in PR body
- [ ] Bot comments inspected
- [ ] Reviewer-response accounting includes required reviewer comment IDs
- [ ] Later maintainer replies posted where gate logs require them
- [ ] Required gates rerun or re-evaluated after fixes
- [ ] Final PR panel confirms merge-readiness

## ACCEPTANCE CRITERIA
- docs_check_headers.sh passes
- docs_canonical_hashes_verify.sh passes
- All required document headers present
- No out-of-scope file changes
- Drift gate passes
- CI passes fully

## REQUIRED PRE-REVIEW SELF-CHECK
- [ ] PR body contains all required sections with exact headings
- [ ] PR body contains the required Issue syntax, for example `- **Issue:** #123`
- [ ] Allowed files section matches final diff exactly
- [ ] No files outside allowlist
- [ ] ZIP safety confirmed
- [ ] Intent label correct and singular
- [ ] Local checks executed and passed
- [ ] Commit message aligns with scope
- [ ] No prohibited artifacts introduced
- [ ] All new governance/reference docs include Purpose, Scope, Current Known Truth, and Intended Final State where applicable
- [ ] All canonical references point to existing repository files
- [ ] All reviewer feedback has both textual disposition and GitHub thread-state disposition
- [ ] No merge-readiness claim made before all gate surfaces inspected
