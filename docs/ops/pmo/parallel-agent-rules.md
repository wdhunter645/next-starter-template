---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Safe parallel read-only exploration vs one-implementer-per-task PR rules for PMO-orchestrated agents
Does Not Own: Agent routing configuration, GitHub label automation, or legacy issue modifications
Canonical Reference: /docs/ops/pmo/critical-path.md
Related Issues: #1335, #1339
Last Reviewed: 2026-06-06
---

# PMO Parallel Agent Rules

## Purpose

Prevent issue sprawl and conflicting implementation PRs when multiple AI agents
and maintainers work in the same repository. Define what may run in parallel and
what must remain serial.

## Scope

This document owns:

- Read-only parallel work (audit, research, review)
- One-implementer-per-task PR rules
- Agent role boundaries for Program 1 (Cursor implementation, Atlas repo review)

This document does not own:

- Closing or relabeling legacy orchestrator issues
- Creating PRs for blocked tasks `#1340`–`#1346`
- Orchestrator routing defaults in `/.github/orchestrator-routing.json`

## Current Known Truth

- Program 1 Task `#1339` is the only active implementation task (`status:pr-draft`).
- Tasks `#1340`–`#1346` are `status:blocked`.
- Legacy orchestrator issues remain open; agents must not treat them as active work
  authority.
- Operating convention for this program: **Cursor implements**, **Atlas reviews**
  repository governance and doc authority.

## Intended Final State

- All agents consult these rules before opening implementation PRs.
- Parallel sessions produce comments and reports, not competing issue trees.
- Legacy backlog disposition follows Task 006–007 outputs under PMO registry rules.

## Rule 1 — One Implementation PR Per Active Task

| Allowed | Not allowed |
| --- | --- |
| One open implementation PR for the active task issue | Multiple PRs for the same task without program owner approval |
| One primary agent named on the task issue | Splitting one task across agents without PMO exception |
| File changes within the task allowlist only | Changes under blocked task allowlists |

**Active task (Program 1):** `#1339` until merge and queue advancement.

**Do not** open implementation PRs for `#1340`–`#1346` until each task is promoted
to `status:queued` / `status:pr-draft`.

## Rule 2 — Parallel Read-Only Work

Multiple agents may work in parallel when all of the following are true:

- The work is **read-only** (no commits, or local commits not pushed).
- The work does not relabel, close, or comment-close GitHub issues unless explicitly
  assigned that closeout task.
- The work stays outside blocked task allowlists if it would anticipate implementation.
- Output is delivered as issue comments, review notes, or draft findings for the
  assigned implementer.

### Permitted parallel activities

- Repository audit and evidence gathering for upcoming Program 1 tasks
- Reviewing merged PRs and gate logs
- Drafting doc outlines locally without pushing
- Atlas governance review of Cursor-produced diffs before PR open

### Prohibited parallel activities

- Pushing implementation branches for blocked tasks
- Bulk-closing legacy orchestrator issues
- Creating new orchestrator-labeled issues outside the issue factory
- Modifying workflow YAML or runtime behavior during docs-only tasks

## Rule 3 — Agent Roles (Program 1 Convention)

| Role | Agent | Responsibility |
| --- | --- | --- |
| Implementation | Cursor | Produce file changes within task allowlist; run validation; prepare PR body |
| Repo review | Atlas | Verify PMO chain compliance, header/canonical checks, scope, and governance |
| Program authority | Human program owner | Bootstrap exceptions, launch-gate sign-off, waive P0 findings |

Task `#1339` lists `agent:atlas` in the orchestrator issue; the program owner
directed Cursor for implementation and Atlas for review. Implementation PRs for
this task still reference `#1339` as the source issue.

Tasks **006–008** list `Agent: atlas` in
`program-1-phase1-wrapup-rollout.md` for synthesis, classification, and launch-gate
**ownership**. That plan label does **not** authorize Atlas to open implementation
PRs. Cursor still produces allowlisted file changes and PR bodies; Atlas reviews,
records closeout on the task issue, and signs governance outcomes. Void PR `#1373`
(Atlas implementation overlap on `#1344`) is superseded by a Cursor-authored PR.

## Rule 4 — Legacy Backlog Is Not Active Work

Agents encountering open legacy issues (website T-tasks, `#1273`–`#1276`, `#1089`)
must:

1. **Not** close, relabel, or merge PRs targeting those issues unless the active
   task explicitly authorizes it.
2. Record observations on the active Program 1 task issue or in Task 006/007
   deliverables.
3. Treat `/docs/ops/pmo/program-registry.md` as authority for program status, not
   stale tracker files or old issue titles.

## Rule 5 — No Synthetic Issue Trees

Do not create:

- Umbrella issues duplicating `#1335`
- Child issues for work already covered by `#1339`–`#1346`
- Tracker issues to compensate for PR-first work

New orchestrated work enters through production-ready implementation plans and the
issue factory.

## Rule 6 — PMO Bootstrap Exception (Recorded)

A one-time promotion of `#1339` to `status:queued` occurred while legacy
orchestrator issues remained open. This exception:

- Does **not** authorize parallel implementation on other tasks
- Does **not** authorize bulk legacy closure
- Establishes these PMO documents as the ongoing policy source

Comments recording the exception: `#1335`, `#1339`.

## Handoff Checklist (Implementer → Reviewer)

Before requesting Atlas review or opening a PR:

- [ ] Changes match active task allowlist only
- [ ] Changed files pass `./scripts/ci/docs_check_headers.sh <file>`
- [ ] Repo-wide `./scripts/ci/docs_check_headers.sh .` passed, or pre-existing out-of-scope failures are disclosed in the PR body
- [ ] `./scripts/ci/docs_canonical_hashes_verify.sh .` passed
- [ ] No legacy issues closed or relabeled
- [ ] No blocked task issues advanced
- [ ] PR body will cite exactly one source issue (`#1339` for Task 001)

## Related References

- Critical path: `/docs/ops/pmo/critical-path.md`
- Program registry: `/docs/ops/pmo/program-registry.md`
- Orchestration model: `/docs/reference/architecture/orchestration-model.md`
