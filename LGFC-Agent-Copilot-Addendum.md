# LGFC Agent/Copilot Operations Addendum

This file centralizes the **exact commands** to orchestrate Copilot/Agent with small, atomic tasks. Paste these as-is into Copilot/Codex. Keep tasks short; avoid chatter.

---

## A) Create the master issue + 13 sub-issues (once)

**Command:**

> **Open a new issue titled:**  
> `Implement LGFC Cloudflare + Supabase Scaffold`  
> **Description:**  
> Read the file `LGFC-Cloudflare-Supabase-Scaffold.md` in the repository root. Identify all section headings labeled with `##` (there are **13** total). For each numbered section (1–13), create a sub-issue titled: `Step <n>: <section heading>`. Assign each sub-issue to **Agent**. Link all sub-issues to the main issue. Ensure sub-issues are ordered numerically (1 through 13). **No code generation yet** — this task is for issue setup and workflow scaffolding only.

**Acceptance:** 1 parent issue + 13 linked sub-issues, numbered 1–13, assigned to Agent.

---

## B) Execute each step and open PRs (repeat per step)

**Command (run after A completes):**

> For each **open** issue titled with prefix `Step 1:` through `Step 13:`, do the following in **ascending numeric order**:  
> 1. Read the corresponding section in `LGFC-Cloudflare-Supabase-Scaffold.md`.  
> 2. Implement exactly what the section specifies (create/modify the indicated files in the described paths). **Do not** work on any other steps.  
> 3. Create a new branch named `feat/step-<n>-<slug>`.  
> 4. Commit the minimal, compiling changes for this step only.  
> 5. Open a Pull Request titled `Step <n>: <section heading>` and link it to the corresponding issue.  
> 6. In the PR body, include a checklist that maps to the section’s acceptance criteria.  
> 7. Request review and wait. **Do not merge automatically.**

**Acceptance (per PR):**  
- Compiles or passes `wrangler dev` where applicable.  
- Only files for this step are changed.  
- PR links to the corresponding `Step <n>` issue and includes the checklist.

---

## C) Test Workers TEST env before merge

**Command (triggered when a PR opens):**

> Spin up the **TEST** environment described in `LGFC-Parallel-Test-Workers.md`:  
> - Use `[env.test]` from `wrangler.toml`.  
> - Ensure per-env secrets exist.  
> - Deploy to `*.workers.dev`.  
> - Post the TEST URL in the PR as a comment.  
> - Run `/healthz` and paste the JSON in the PR comment.  
> - Do **not** deploy to prod.

**Acceptance:** PR has a comment with TEST URL + `/healthz` JSON `{ ok: true }`.

---

## D) Merge & promote

**Command (maintainer use, not Copilot):**

> After review approval and passing TEST checks, merge the PR. Then run:  
> `wrangler deploy` (prod)  
> Confirm `/healthz` returns 200 on prod. Update the parent issue progress.

---

## E) Daily hygiene

**Command:**

> At 21:00 ET daily:  
> - Close or merge stale PRs if accepted.  
> - Reopen issues if PRs don’t meet acceptance criteria.  
> - Post a short status summary in the parent issue with links to merged PRs and next queued step.

---

## F) Escalation / reset (when a step drifts)

**Command (replace the drifting attempt):**

> Close the current PR for `Step <n>`. Open a fresh branch `feat/step-<n>-redo`. Re-implement strictly per `LGFC-Cloudflare-Supabase-Scaffold.md` section `<n>`. Do not modify files outside this step. Open a new PR with the same title and checklist. Link it to the same issue.

---

## G) Notes

- Keep each task to a single file or small set of changes.  
- If a section seems too big, split the **issue** first, then run B) on the smaller part.  
- Never self-approve or auto-merge. Prod stays quiet until a human promotes.

---

**End of file.**
