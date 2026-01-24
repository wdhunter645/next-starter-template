# LGFC — Agent PR Draft Template (Authoritative)

This file is the **single authoritative PR draft template** for LGFC work when using an uploaded ZIP workflow.
All PR drafts must follow this structure and must be delivered as **one continuous, single-fence Markdown block**.

---

## PR Template

### Reference
- Refer to `/docs/website.md` for required structure and change conventions.
- Follow operational, rollback, and testing standards in `/docs/website-process.md`.
- Follow navigation rules in `/docs/NAVIGATION-INVARIANTS.md`.

### Change Summary
- [Describe exactly what changes will be made, and where. No options.]

### Implementation (Agent instructions)
#### 0) ZIP cleanup (mandatory, first step)
- If there is any uploaded ZIP file in the repo root (example: `*.zip`), **delete it immediately** before doing anything else.
- The final PR diff must show the ZIP file(s) removed and **not re-added**.

#### 1) Apply changes
- [List exact file edits/additions/deletions. Include paths.]
- [If copying from a ZIP: unzip locally, copy files into their target paths, then delete the ZIP.]

#### 2) Build / test
- [List exact commands to run.]

#### 3) Documentation updates (mandatory)
- Update the required documentation files for this PR. You MUST either:
  - List the specific docs to update (with exact paths), OR
  - Explicitly state: **No documentation updates required** (only allowed when the change truly does not affect docs).

### Acceptance Criteria
- ZIP file(s) uploaded to repo root are **deleted** and **not committed**.
- All changed files match the Change Summary.
- Build/tests pass (or explicitly stated if none exist).
- No secrets or credentials added anywhere (including docs).
- Documentation updates are present and accurate (or the PR explicitly states **No documentation updates required**).

### Commit Message
- [Single commit message, imperative mood.]

### Verification
- [What to click/check in the UI. Device breakpoints if relevant.]
