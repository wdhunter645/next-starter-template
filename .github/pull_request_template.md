### PR Template (REVISED — DESIGN COMPLIANCE GATES ARE MANDATORY)

#### Reference
Refer to `/docs/website.md` for required structure and change conventions.
Then follow `/docs/website-process.md` for operational, rollback, and testing standards.

---

## 0) MANDATORY FIRST STEP (ZIP SAFETY)
1) Delete any uploaded ZIP file from the repo root BEFORE any other work.
2) If no ZIP exists, explicitly state "No ZIP found in repo root" in the PR description.
3) Acceptance must confirm the ZIP is not committed.

---

## 1) DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
**The design is the law.** This PR must implement the locked design exactly as documented.

- Canonical design source: `/docs/website.md`
- If this PR affects a page/section specified elsewhere (e.g. `/docs/lgfc-homepage-legacy-v6.html`), that file is also authoritative for that scope.

Rules:
- Do not invent UI, copy, flows, or layout.
- If the design is ambiguous, STOP and ask. Do not guess.
- Documentation must describe the approved design, not justify implementation drift.

---

## 2) CHANGE SCOPE (SINGLE PATH ONLY)
Describe the requested change in one paragraph.
List the exact work items below.

Anything not explicitly listed is out of scope and forbidden.

---

## 3) FILE-TOUCH ALLOWLIST (MANDATORY)
List the ONLY files allowed to be edited in this PR.

Allowed files:
- [explicit file list]

Forbidden:
- Any file not listed above
- Refactors, formatting sweeps, dependency changes, or "cleanup"

---

## 4) VISUAL / UX INVARIANTS (MANDATORY)
List invariants that must remain true, for example:
- Do not remove existing buttons or links
- Do not change section order unless explicitly requested
- Do not add duplicate headers
- Do not change copy unless explicitly requested
- Do not change routing unless explicitly requested

---

## 5) IMPLEMENTATION STEPS
### A) Code / configuration changes
List exact steps with filenames.

### B) Documentation changes (REQUIRED if behavior changes)
Docs must be updated in the SAME PR whenever behavior/config/UI rules change.

List exact files to update, e.g.:
- `/docs/website.md`
- `/docs/website-process.md`
- `/.diagnostics/cloudflare-env-vars.md`

Docs must match the approved design AND shipped behavior.

---

## 6) ACCEPTANCE CRITERIA (MANDATORY)
- [ ] ZIP SAFETY confirmed
- [ ] Only allowlisted files were modified
- [ ] Requested behavior works as designed
- [ ] No design drift; invariants preserved
- [ ] Documentation updated and accurate
- [ ] CI passes
- [ ] Cloudflare deploy green (if applicable)

---

## 7) REQUIRED PRE-REVIEW SELF-CHECK
Before marking Ready for Review:
1) Confirm only allowlisted files changed
2) Verify behavior on deployed Preview URL
3) Post a brief verification comment (routes checked, screenshots if UI changed)

If any item is missing, PR must remain Draft.

---

## 8) COMMIT MESSAGE
Provide a single conventional commit message:
- `fix(header): …`
- `fix(nav): …`
- `docs(design): …`

---

## 9) GOVERNANCE
Follow `/docs/website-process.md`.
