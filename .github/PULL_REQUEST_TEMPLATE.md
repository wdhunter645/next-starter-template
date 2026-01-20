### PR Template

#### Reference
Refer to `/docs/website.md` for required structure and change conventions.

---

## Progress + Readiness (MANDATORY — keep updated)
This block is authoritative for PR status and MUST be maintained by Agent.

**Tasks:** X / Y complete  
**Current state:** NO ACTIVITY | ACTIVE | IMPLEMENTATION PRESENT | READY FOR REVIEW  
**Last update:** <YYYY-MM-DD HH:MM ET>

### Completed
- [ ] Task 1:
- [ ] Task 2:

### In Progress
- [ ] Task:

### Remaining
- [ ] Task:

### Evidence
- **Key commits:** `<sha>` — `<message>`
- **Key files changed:** `<paths>`
- **Checks / CI:** `<status + workflow name or link>`

### Ready-for-review gate (BINARY)
Mark **READY FOR REVIEW** only when ALL are true:
- [ ] Real diff exists (files changed)
- [ ] All required tasks complete
- [ ] CI / checks green (or explicitly N/A with reason)
- [ ] Required documentation updates complete
- [ ] No ZIP file committed (repo root clean)

> Note: The PR may remain marked as **Draft** due to workflow.  
> The **READY FOR REVIEW** state above is the authoritative signal for reviewers.

---

#### Change Summary
Describe the change at a high level. This PR must implement exactly what is defined in documentation. Documentation is the source of truth. Rip out and replace conflicting code as necessary.

##### Mandatory first step (NON-OPTIONAL)
1) Delete any uploaded ZIP file from the repo root before any other changes.
   - If a ZIP exists, remove it in the first commit (or a dedicated first commit) and ensure it is not reintroduced.

---

#### Scope
- Implement only what is defined in docs.
- Remove or replace conflicting legacy code.
- Do not invent features or redesign behavior.

---

#### Documentation Updates (REQUIRED — see `/docs/website-process.md` "Documentation ↔ Implementation Sync Gate")
List all documentation files updated with exact paths. If none are required, explicitly state with justification:
> **Documentation updates:** None required — [provide reason: e.g., "internal refactor with no observable behavior changes" or "test-only changes"]

**Common documentation requirements:**
- Header/Footer/Navigation changes → `/docs/LGFC-Production-Design-and-Standards.md` + `/docs/NAVIGATION-INVARIANTS.md`
- Login/auth flow changes → `/docs/LGFC-Production-Design-and-Standards.md` (LOGIN/LOGOUT section) + `/docs/design/login.md`
- Page layout changes → `/docs/LGFC-Production-Design-and-Standards.md` + relevant `/docs/design/*.md` files

**Placeholder prohibition:**
- If this PR touches any section in `/docs/LGFC-Production-Design-and-Standards.md`, all "..." ellipses in that section MUST be removed and replaced with complete specification text.

---

#### Acceptance Criteria
- [ ] ZIP removed from repo root (if present)
- [ ] Implementation matches documented spec
- [ ] Conflicting legacy code removed
- [ ] Build passes
- [ ] CI checks pass
- [ ] Documentation updates present and accurate (or explicitly justified as "None required")
- [ ] No "..." ellipses remain in documentation sections touched by this PR

---

#### Commit Message
Use a clear, scoped message (e.g.):
- `feat(member-home): rebuild Member Home to documented spec`
- `fix(header): close dropdown on click-away + Escape`

---

#### Verification
Describe how the change was verified (routes checked, behaviors confirmed, CI reviewed).

---

#### Governance Reference
Follow operational, rollback, and testing standards in `/docs/website-process.md`.
