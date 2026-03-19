### PR Template

#### Reference
Refer to `/.github/pull_request_template.md` for required structure and change conventions.

#### Governance Reference
Follow operational, rollback, and testing standards in `/docs/governance/PR_GOVERNANCE.md`.

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
- docs/governance/DOCUMENT-ARCHITECTURE.md
- docs/ops/trackers/THREAD-LOG_Master.md
- docs/reference/design/.canonical-files.txt
- docs/reference/design/.canonical-hashes.sha256

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
- No “cleanup” or “misc” wording

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
  - (list exact files)

## ACCEPTANCE CRITERIA
- docs_check_headers.sh passes
- docs_canonical_hashes_verify.sh passes
- All required document headers present
- No out-of-scope file changes
- Drift gate passes
- CI passes fully

## REQUIRED PRE-REVIEW SELF-CHECK
- [ ] PR body contains all required sections with exact headings
- [ ] Allowed files section matches diff exactly
- [ ] No files outside allowlist
- [ ] ZIP safety confirmed
- [ ] Intent label correct and singular
- [ ] Local checks executed and passed
- [ ] Commit message aligns with scope
- [ ] No secrets or forbidden artifacts introduced
