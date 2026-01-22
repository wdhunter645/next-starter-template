# LGFC — Agent PR Draft Template (Authoritative)
Version 1 – Explicit Commands

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

#### 3) Documentation updates (mandatory — see `/docs/website-process.md` "Documentation ↔ Implementation Sync Gate")
- Update the required documentation files for this PR. You MUST either:
  - List the specific docs to update (with exact paths), OR
  - Explicitly state: **No documentation updates required** (only allowed when the change truly does not affect UI behavior, navigation, header/footer, login flow, or documented specifications).
- If the PR touches any section in `/docs/LGFC-Production-Design-and-Standards.md`, remove all "..." ellipses in that section and replace with complete specification text.
- Required doc updates for common change types:
  - Header/Footer/Navigation changes → `/docs/LGFC-Production-Design-and-Standards.md` + `/docs/NAVIGATION-INVARIANTS.md`
  - Login/auth flow changes → `/docs/LGFC-Production-Design-and-Standards.md` (LOGIN/LOGOUT section) + `/docs/design/login.md`
  - Page layout changes → `/docs/LGFC-Production-Design-and-Standards.md` + relevant `/docs/design/*.md` files

### Acceptance Criteria
- ZIP file(s) uploaded to repo root are **deleted** and **not committed**.
- All changed files match the Change Summary.
- Build/tests pass (or explicitly stated if none exist).
- No secrets or credentials added anywhere (including docs).
- Documentation updates are present and accurate (or the PR explicitly states **No documentation updates required** with justification).
- No "..." ellipses remain in any documentation sections touched by this PR.

### Commit Message
- [Single commit message, imperative mood.]

### Verification
- [What to click/check in the UI. Device breakpoints if relevant.]
