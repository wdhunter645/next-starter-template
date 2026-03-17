# CURSOR_RULES.md
Location: /docs/CURSOR_RULES.md
Purpose: Execution discipline for Cursor AI when operating in this repository.

---

## Authority

Design authority, route authority, footer rules, homepage inventory, and tracker content are
owned by their respective documents in `/docs`. Cursor must not duplicate or reinterpret them.

---

## Pre-Task Discipline

Before making any change:

1. Confirm the working tree is clean (`git status` shows no uncommitted changes).
2. Create a rollback checkpoint: `git stash` or note the current commit SHA.
3. Read the assigned task and the explicitly allowlisted files before touching anything.

---

## Execution Rules

- **One task per thread.** Do not carry over context or scope from a previous thread.
- **One file at a time** unless the task prompt explicitly allowlists additional files.
- **No autonomous branch creation** unless the task prompt explicitly instructs it.
- **No direct commits to `main`.**
- **No changes to `package.json` or lockfiles** unless explicitly assigned.
- **No changes to auth, API, DB, Cloudflare, workflow, or config files** unless explicitly assigned.
- **No renames** of functions, components, files, or routes unless explicitly assigned.
- **No improvements or cleanup** outside the exact task scope.
- **Stop after the assigned task.** Report files changed, verification run, and any risks identified.

---

## Post-Task Review

After completing the assigned task:

1. Run `git diff` and inspect every changed line.
2. Verify that only the allowlisted files changed.
3. Verify that no scope drift occurred (no unrelated edits, renames, or additions).
4. Open a PR instead of continuing into another task.

---

## Related Rules

General agent behavior: `/docs/ops/ai/AGENT-RULES.md`
