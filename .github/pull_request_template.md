#### MANDATORY FIRST STEP (ZIP SAFETY)
- Delete any uploaded ZIP files from the repository root before proceeding
- Confirm ZIP is not present in diff or commit history

#### DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- This PR strictly follows:
  - /docs/reference/design/LGFC-Production-Design-and-Standards.md
  - /docs/reference/design/fanclub.md
- No deviations permitted

#### FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `path/to/file1`
- `path/to/file2`

All other files are out of scope

#### VISUAL / UX INVARIANTS (MANDATORY)
- No UI, layout, or route changes
- No component modifications
- No CSS or visual changes
- Documentation-only PR

#### CHANGE SUMMARY
- [Describe exactly what this PR changes, with no filler and no out-of-scope work.]

#### REQUIRED DOCUMENTATION UPDATES
- [List documentation files updated, or state none required]

(No additional documentation updates required)

#### ACCEPTANCE CRITERIA
- [List the specific acceptance criteria for this PR]

#### PRE-REVIEW SELF-CHECK (REQUIRED)
- [ ] git diff contains only allowlisted files
- [ ] no ZIP files present
- [ ] local verification passed:
      ./scripts/ci/docs_check_headers.sh .
      ./scripts/ci/docs_canonical_hashes_verify.sh .
- [ ] commit message aligns with scope
- [ ] PR labeled correctly (change-ops)
