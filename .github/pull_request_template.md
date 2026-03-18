## MANDATORY FIRST STEP (ZIP SAFETY)
- [ ] No ZIP file exists in the repo root
- [ ] OR any ZIP file that was present in the repo root was deleted before any other change
- [ ] Final diff confirms no ZIP file is committed

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- Additional design/reference docs used for this PR:
  - `[path/to/doc-or-state-none]`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `path/to/file1`
- `path/to/file2`
- `path/to/file3`

## VISUAL / UX INVARIANTS (MANDATORY)
- [ ] Header, footer, navigation, auth, and route invariants preserved unless this PR explicitly changes them
- [ ] No unauthorized visual drift introduced
- [ ] No out-of-scope UX changes introduced
- [ ] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant unless explicitly in scope

## LABEL
- Intent label for this PR: `[change-ops|feature|docs-only|infra|platform|codex]`

## CHANGE SUMMARY
- [Describe exactly what this PR changes, with no filler and no out-of-scope work.]

## BUILD / TEST / VERIFICATION
- Commands run:
  - `[command 1]`
  - `[command 2]`
- Result summary:
  - `[pass/fail and relevant notes]`

## DOCUMENTATION UPDATES
- [ ] Documentation updated in this PR
- [ ] No documentation updates required
- Documentation files touched or intentionally not required:
  - `[path/to/doc1 or justification]`
  - `[path/to/doc2 or justification]`

## REQUIRED PRE-REVIEW SELF-CHECK
- [ ] PR body contains all mandatory sections with exact required headings
- [ ] `Allowed files:` section is present and matches the final diff exactly
- [ ] No files changed outside the allowlist
- [ ] ZIP safety handled correctly
- [ ] Docs/code/config are synchronized for the change
- [ ] No secrets, credentials, or forbidden artifacts were introduced
