---
Doc Type: Template
Audience: Human + AI
Authority Level: Operational
Owns: Standard format for assigning scoped work to Cursor, Codex, Copilot, Devin, and future agents
Does Not Own: Source issue scope, design authority, implementation decisions, or merge approval
Canonical Reference: /docs/ops/ai/SHARED-AGENT-RULES.md
Related Issues: #1449
Last Reviewed: 2026-06-17
---

# Agent Assignment Template

## 1. Purpose

This template is the mandatory format for assigning scoped repository work to **Cursor** (sole LGFC implementation executor) and, when explicitly reauthorized, other execution agents under the LGFC PMO model.

Canonical team roles and workflow: [`docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md`](../ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md).

Assignments must give agents one source issue, one deliverable, exact Diataxis location, exact file scope, explicit non-goals, acceptance criteria, verification method, rollback plan, Cursor pre-implementation review checkpoint, and Bill/Atlas stop-gate authorization. Unclear authority causes scope drift, mixed-intent diffs, and gate failures.

This document does not replace shared agent law. It operationalizes how Bill and Atlas (ChatGPT) package work before Cursor executes.

**Do not assign LGFC implementation work to Codex** unless Bill explicitly reauthorizes Codex in a future governance update.

## 2. When to use this template

Use this template when:

- assigning any **implementation** task to **Cursor**;
- opening a Cursor Cloud session for LGFC implementation;
- routing work through Program 1 — Phase 1 Wrap-Up or any child project under the PMO model;
- converting a source GitHub issue into a launch-control-ready Cursor package without expanding scope.

Do not use this template for:

- assigning LGFC implementation to Codex (forbidden unless future Bill-approved reauthorization);
- merge approval or human-only decisions;
- defining design authority (use locked design, governance documents, and Atlas design packages);
- replacing the source issue — the issue remains task authority; this template is the assignment envelope.

## 3. Required assignment fields

Every Cursor implementation assignment must include all of the following. If any field is missing, do not start Cursor — complete the assignment first.

| Field | Requirement |
| --- | --- |
| Operating mode | Exactly one mode; agent must not switch modes |
| Source issue | Exactly one primary source issue (`#number`) |
| Documentation package | Link or PR reference to merged/approved canonical docs that gate this work |
| Draft/reference code | Pseudocode or reference implementation for Cursor handoff (not a substitute for allowlist authority) |
| Repository authority | Ordered read list including `Agent.md`, operating model, shared rules, and task-specific docs |
| Objective | Plain language; one task only |
| Deliverable | Exact file path(s) or issue/PR output |
| Approved file scope | Explicit allowlist; no wildcards unless gate-approved |
| Diataxis / documentation location | Target path under active DIATAXIS transition structure |
| Explicit non-goals | What the agent must not do |
| Acceptance criteria | Checklist the agent can verify |
| Verification plan | Commands, checks, or review steps with reported results |
| Rollback plan | How to revert or safely halt if verification fails |
| Cursor review checkpoint | Required pre-implementation comment/pass before file edits on new packages |
| Bill/Atlas stop-gate authorization | Explicit continue authorization before execution and at verification stop points |
| Handoff | Files changed, summary, verification, risks, scope confirmation |
| Dependency fields | For launched-program queue tasks: predecessor, successor, stage-before-merge, halt/resume condition |

These fields align with [`SHARED-AGENT-RULES.md`](../ops/ai/SHARED-AGENT-RULES.md) (one source issue per PR, scope boundaries, documentation taxonomy) and [`CORE-RULES.md`](../ops/ai/CORE-RULES.md) (execution discipline, allowlist, required verification).

## 4. Mandatory template block

Copy the block below into the agent prompt or issue comment. Replace every `<placeholder>` before sending.

```markdown
# AGENT ASSIGNMENT — <Work Path / Child Project / Task Name>

## 1. Operating Mode

You are operating in: <Design / Documentation / Governance / Worklist / Verification / Troubleshooting / Implementation / Operations cleanup>

Do not switch modes.

For LGFC implementation work, mode must be **Implementation** and executor must be **Cursor only**.

## 2. Source Issue

Primary source issue: #<number>

Use only this issue as task authority.

Do not treat umbrella issues, trackers, prior chats, old PRs, or memory as task authority unless explicitly listed below.

## 3. Documentation Package

Canonical documentation that gates this work:

- Documentation PR: #<number> (merged) / path: `<exact doc path(s)>`
- Bill approval: YES / pending — <reference>

Cursor must read this package before implementation.

## 4. Draft / Reference Code

Reference implementation or pseudocode for handoff:

- `<path, gist, or inline pseudocode block>`
- Purpose: orient Cursor; **not** a substitute for the file allowlist

## 5. Repository Authority

Read these files before acting:

1. `Agent.md`
2. `docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md`
3. `docs/ops/ai/SHARED-AGENT-RULES.md`
4. `docs/ops/ai/CORE-RULES.md`
5. `docs/ops/ai/CURSOR-RULES.md`
6. `<task-specific authority doc>`
7. `<relevant skill file>`

If any source conflicts, stop and report the conflict.

## 6. Objective

<Plain-language objective. One task only.>

## 7. Deliverable

Create/update exactly this deliverable:

- `<exact file path or issue/PR output>`

## 8. Approved File Scope

You may touch only:

- `<path 1>`
- `<path 2>`

Do not edit any other files.

## 9. Diataxis / Documentation Location

Documentation belongs here:

- `<docs/reference/...>`
- `<docs/explanation/...>`
- `<docs/how-to/...>`
- `<docs/tutorials/...>`
- `<docs/ops/...>`
- `<docs/governance/...>`
- `<docs/reports/...>`
- `<docs/templates/...>`

Use the required repository documentation header.

## 10. Explicit Non-Goals

Do not:

- modify app/runtime code unless explicitly authorized;
- modify workflows unless explicitly authorized;
- create unrelated cleanup;
- update trackers unless explicitly authorized;
- create additional issues or PRs unless instructed;
- expand scope beyond this assignment;
- route work to Codex.

## 11. Acceptance Criteria

This task is complete when:

- [ ] `<criterion 1>`
- [ ] `<criterion 2>`
- [ ] `<criterion 3>`

## 12. Verification Plan

Run or perform:

- `<command/check/review method>`

Report exact results. Stop at verification gates until Bill/Atlas authorize continue.

## 13. Rollback Plan

If verification fails or Bill/Atlas issue hold:

- `<revert steps, branch discard, feature flag off, or safe halt procedure>`

## 14. Cursor Review Checkpoint (pre-implementation)

Before editing files, Cursor must comment on the source issue:

- [ ] Documentation package read
- [ ] Draft/reference code reviewed
- [ ] Allowlist complete
- [ ] Non-goals clear
- [ ] Acceptance criteria verifiable
- [ ] Verification and rollback plans present
- [ ] **Checkpoint:** PASS / FAIL — <blockers if any>

Do not edit files until checkpoint PASS and Bill/Atlas execution authorization are recorded.

## 15. Bill/Atlas Stop-Gate Authorization

Execution authorization:

- Bill/Atlas authorized execution: YES / NO — <date or issue comment reference>
- Verification stop points: `<when Cursor must stop and wait>`
- Continue/hold/revise authority: **Bill** (Atlas partners on gate review)

## 16. Handoff Required

When complete, report:

- files changed;
- summary of changes;
- verification performed;
- unresolved risks/blockers;
- confirmation that scope was not expanded.
```

## 5. Prohibited omissions

Do not send a Cursor implementation assignment without:

- a single numbered source issue (not an umbrella tracker alone);
- a documentation package reference (merged PR or approved doc paths);
- draft/reference code or pseudocode;
- an explicit file allowlist (not “update docs as needed”);
- explicit non-goals (especially for documentation-only or design-only tasks);
- acceptance criteria that can be checked without interpretation;
- a verification plan (command, script, or defined manual check);
- a rollback plan;
- a Cursor pre-implementation review checkpoint requirement;
- Bill/Atlas stop-gate authorization for execution;

Do not:

- stack multiple unrelated tasks in one assignment;
- reference “see prior chat” or “continue from last PR” as authority;
- omit operating mode and expect the agent to infer Design vs Implementation;
- assign implementation to Codex for LGFC work;
- assign implementation while forbidding all git/PR steps without stating that constraint in non-goals and verification;
- weaken shared agent law in the assignment text (assignments cannot override `SHARED-AGENT-RULES.md` or `CORE-RULES.md`).

If the work is not yet definable at this level of precision, refine the source issue first. Do not feed high-capacity agents partial authority.

## 6. Examples of valid operating modes

Each example is one mode only. Mode names match [`LGFC-AI-TEAM-OPERATING-MODEL.md`](../ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md) and the mandatory template block.

| Mode | Valid assignment summary |
| --- | --- |
| Documentation | Create one how-to under `docs/how-to/` from issue #N; allowlist only that file; verify with `docs_check_headers.sh`. |
| Design | Produce implementation plan markdown in `docs/reference/`; no code changes; verify by checklist against source issue. |
| Verification | Inspect PR #M gates and review threads; no file edits; report evidence from live PR panel and workflow logs. |
| Implementation | Implement scoped feature per issue #N via **Cursor**; include documentation package, draft code, review checkpoint, and Bill/Atlas authorization; allowlist listed app files only; run targeted tests listed in verification plan. |
| Troubleshooting | Diagnose failing workflow on PR #M; allowlist workflow file + docs only if issue authorizes; PR-first only per ops exception rules. |
| Governance | Align one governance doc with canonical standard; docs allowlist only; header and DIATAXIS checks required. |
| Worklist | Reconcile program issue hierarchy in GitHub comments only; no repo file edits unless issue authorizes tracker maintenance. |
| Operations cleanup | Close or relabel stale ops issues per written criteria; no product code; human merge still required for any PR. |

Invalid pattern: “Documentation + fix the CI workflow + update the homepage” in one assignment (mixed intent).

## 7. Relationship to Agent.md, SHARED-AGENT-RULES, CORE-RULES, and agent-specific rules

| Document | Relationship to this template |
| --- | --- |
| [`Agent.md`](../../Agent.md) | Entry point and read order; assignments must require agents to read `Agent.md` first. |
| [`LGFC-AI-TEAM-OPERATING-MODEL.md`](../ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md) | Canonical team roles, modes, workflow, and launch-control requirements. |
| [`SHARED-AGENT-RULES.md`](../ops/ai/SHARED-AGENT-RULES.md) | Canonical shared law; this template must not contradict categorized rules (evidence-first, one issue per PR, scope, docs taxonomy). |
| [`CORE-RULES.md`](../ops/ai/CORE-RULES.md) | Detailed execution rules; allowlist, issue-first discipline, and verification doctrine are enforced through assignment fields. |
| [`CHATGPT-RULES.md`](../ops/ai/CHATGPT-RULES.md) | Atlas authors assignments and launch-control packages; defines acceptance criteria when the source issue lacks them. |
| [`CURSOR-RULES.md`](../ops/ai/CURSOR-RULES.md) | Cursor executes only within approved scope; pre-implementation review checkpoint is mandatory for new packages. |
| [`CODEX-RULES.md`](../ops/ai/CODEX-RULES.md) | Codex inactive for LGFC implementation — do not use this template to assign Codex. |
| [`governance/ai/AGENT-GOVERNANCE.md`](../../governance/ai/AGENT-GOVERNANCE.md) | Long-form cross-agent rules; assignments implement one-issue, narrow-scope, verified handoff. |
| [`ops/ai/CROSS-AGENT-OPERATING-RULES.md`](../../ops/ai/CROSS-AGENT-OPERATING-RULES.md) | Handoff contract in section 16 of the template block matches required handoff fields. |
| `.agents/skills/lgfc-pr-governance/SKILL.md` | Use when the deliverable is a PR; assignment must still name one source issue and allowlist before implementation. |
| `.agents/skills/lgfc-docs-authority/SKILL.md` | Use for documentation tasks; section 9 of the template block must name exact Diataxis paths. |

Authority order on conflict: follow [`Agent.md`](../../Agent.md) hierarchy — higher authority wins; stop and report.

## 8. Phase 1 Wrap-Up note

Program 1 — Phase 1 Wrap-Up adopts a PMO model with programs, child projects, tasks, issues, PRs, and verification closeout.

**This template is mandatory before feeding Cursor** during Phase 1 Wrap-Up. Operators and Atlas must not assign Cursor with informal prompts, umbrella trackers as sole authority, or partial file scope.

Every child-project task routed to Cursor should be packaged with the mandatory template block (section 4), linked to exactly one source issue, and closed with handoff evidence suitable for verification closeout (`.agents/skills/lgfc-verification-closeout/SKILL.md` when applicable).

Do not assign Codex for LGFC implementation during Phase 1 Wrap-Up unless Bill explicitly reauthorizes Codex in governance.

This note does not expand Phase 1 program documentation; it establishes the assignment standard required for safe agent execution during wrap-up.
