---
Doc Type: Template
Audience: Human + AI
Authority Level: Operational
Owns: Standard format for assigning scoped work to Cursor, Codex, Copilot, Devin, and future agents
Does Not Own: Source issue scope, design authority, implementation decisions, or merge approval
Canonical Reference: /docs/ops/ai/SHARED-AGENT-RULES.md
Last Reviewed: 2026-06-04
---

# Agent Assignment Template

## 1. Purpose

This template is the mandatory format for assigning scoped repository work to high-capacity agents (Cursor, Codex, Copilot, Devin, and future agents) under the LGFC PMO model.

Assignments must give agents one source issue, one deliverable, exact Diataxis location, exact file scope, explicit non-goals, acceptance criteria, and a verification method. Unclear authority causes scope drift, mixed-intent diffs, and gate failures.

This document does not replace shared agent law. It operationalizes how humans and control-plane agents (for example ChatGPT/Atlas) package work before execution agents act.

## 2. When to use this template

Use this template when:

- assigning any task to Cursor, Codex, Copilot, Devin, or a future execution agent;
- opening a Cursor Cloud session, Codex PR task, Copilot scoped PR, or Devin draft-PR assignment;
- routing work through Program 1 — Phase 1 Wrap-Up or any child project under the PMO model;
- converting a source GitHub issue into an agent-ready prompt without expanding scope.

Do not use this template for:

- merge approval or human-only decisions;
- defining design authority (use locked design and governance documents);
- replacing the source issue — the issue remains task authority; this template is the assignment envelope.

## 3. Required assignment fields

Every agent assignment must include all of the following. If any field is missing, do not start the agent — complete the assignment first.

| Field | Requirement |
| --- | --- |
| Operating mode | Exactly one mode; agent must not switch modes |
| Source issue | Exactly one primary source issue (`#number`) |
| Repository authority | Ordered read list including `Agent.md`, shared rules, and task-specific docs |
| Objective | Plain language; one task only |
| Deliverable | Exact file path(s) or issue/PR output |
| Approved file scope | Explicit allowlist; no wildcards unless gate-approved |
| Diataxis / documentation location | Target path under active DIATAXIS transition structure |
| Explicit non-goals | What the agent must not do |
| Acceptance criteria | Checklist the agent can verify |
| Verification method | Commands, checks, or review steps with reported results |
| Handoff | Files changed, summary, verification, risks, scope confirmation |

These fields align with [`SHARED-AGENT-RULES.md`](../ops/ai/SHARED-AGENT-RULES.md) (one source issue per PR, scope boundaries, documentation taxonomy) and [`CORE-RULES.md`](../ops/ai/CORE-RULES.md) (execution discipline, allowlist, required verification).

## 4. Mandatory template block

Copy the block below into the agent prompt or issue comment. Replace every `<placeholder>` before sending.

```markdown
# AGENT ASSIGNMENT — <Work Path / Child Project / Task Name>

## 1. Operating Mode

You are operating in: <Documentation / Design / Verification / Implementation / Troubleshooting / Governance / Worklist / Operations cleanup>

Do not switch modes.

## 2. Source Issue

Primary source issue: #<number>

Use only this issue as task authority.

Do not treat umbrella issues, trackers, prior chats, old PRs, or memory as task authority unless explicitly listed below.

## 3. Repository Authority

Read these files before acting:

1. `Agent.md`
2. `docs/ops/ai/SHARED-AGENT-RULES.md`
3. `docs/ops/ai/CORE-RULES.md`
4. `<task-specific authority doc>`
5. `<relevant skill file>`

If any source conflicts, stop and report the conflict.

## 4. Objective

<Plain-language objective. One task only.>

## 5. Deliverable

Create/update exactly this deliverable:

- `<exact file path or issue/PR output>`

## 6. Approved File Scope

You may touch only:

- `<path 1>`
- `<path 2>`

Do not edit any other files.

## 7. Diataxis / Documentation Location

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

## 8. Explicit Non-Goals

Do not:

- modify app/runtime code unless explicitly authorized;
- modify workflows unless explicitly authorized;
- create unrelated cleanup;
- update trackers unless explicitly authorized;
- create additional issues or PRs unless instructed;
- expand scope beyond this assignment.

## 9. Acceptance Criteria

This task is complete when:

- [ ] `<criterion 1>`
- [ ] `<criterion 2>`
- [ ] `<criterion 3>`

## 10. Verification Method

Run or perform:

- `<command/check/review method>`

Report exact results.

## 11. Handoff Required

When complete, report:

- files changed;
- summary of changes;
- verification performed;
- unresolved risks/blockers;
- confirmation that scope was not expanded.
```

## 5. Prohibited omissions

Do not send an agent assignment without:

- a single numbered source issue (not an umbrella tracker alone);
- an explicit file allowlist (not “update docs as needed”);
- explicit non-goals (especially for documentation-only or design-only tasks);
- acceptance criteria that can be checked without interpretation;
- a verification method (command, script, or defined manual check);

Do not:

- stack multiple unrelated tasks in one assignment;
- reference “see prior chat” or “continue from last PR” as authority;
- omit operating mode and expect the agent to infer Design vs Implementation;
- assign implementation while forbidding all git/PR steps without stating that constraint in non-goals and verification;
- weaken shared agent law in the assignment text (assignments cannot override `SHARED-AGENT-RULES.md` or `CORE-RULES.md`).

If the work is not yet definable at this level of precision, refine the source issue first. Do not feed high-capacity agents partial authority.

## 6. Examples of valid operating modes

Each example is one mode only. Mode names match the control-plane taxonomy in [`CHATGPT-RULES.md`](../ops/ai/CHATGPT-RULES.md) and the mandatory template block.

| Mode | Valid assignment summary |
| --- | --- |
| Documentation | Create one how-to under `docs/how-to/` from issue #N; allowlist only that file; verify with `docs_check_headers.sh`. |
| Design | Produce implementation plan markdown in `docs/reference/`; no code changes; verify by checklist against source issue. |
| Verification | Inspect PR #M gates and review threads; no file edits; report evidence from live PR panel and workflow logs. |
| Implementation | Implement scoped feature per issue #N; allowlist listed app files only; run targeted tests listed in verification. |
| Troubleshooting | Diagnose failing workflow on PR #M; allowlist workflow file + docs only if issue authorizes; PR-first only per ops exception rules. |
| Governance | Align one governance doc with canonical standard; docs allowlist only; header and DIATAXIS checks required. |
| Worklist | Reconcile program issue hierarchy in GitHub comments only; no repo file edits unless issue authorizes tracker maintenance. |
| Operations cleanup | Close or relabel stale ops issues per written criteria; no product code; human merge still required for any PR. |

Invalid pattern: “Documentation + fix the CI workflow + update the homepage” in one assignment (mixed intent).

## 7. Relationship to Agent.md, SHARED-AGENT-RULES, CORE-RULES, and agent-specific rules

| Document | Relationship to this template |
| --- | --- |
| [`Agent.md`](../../Agent.md) | Entry point and read order; assignments must require agents to read `Agent.md` first. |
| [`SHARED-AGENT-RULES.md`](../ops/ai/SHARED-AGENT-RULES.md) | Canonical shared law; this template must not contradict categorized rules (evidence-first, one issue per PR, scope, docs taxonomy). |
| [`CORE-RULES.md`](../ops/ai/CORE-RULES.md) | Detailed execution rules; allowlist, issue-first discipline, and verification doctrine are enforced through assignment fields. |
| [`CHATGPT-RULES.md`](../ops/ai/CHATGPT-RULES.md) | Control plane uses this template when routing to execution agents; ChatGPT defines acceptance criteria when the source issue lacks them. |
| [`CURSOR-RULES.md`](../ops/ai/CURSOR-RULES.md) | Cursor executes only within approved scope; assignment must state push/PR authorization when required. |
| [`CODEX-RULES.md`](../ops/ai/CODEX-RULES.md), [`COPILOT-RULES.md`](../ops/ai/COPILOT-RULES.md), [`DEVIN-RULES.md`](../ops/ai/DEVIN-RULES.md) | Tool-specific boundaries apply after the assignment is accepted; they do not relax shared law. |
| [`governance/ai/AGENT-GOVERNANCE.md`](../../governance/ai/AGENT-GOVERNANCE.md) | Long-form cross-agent rules; assignments implement one-issue, narrow-scope, verified handoff. |
| [`ops/ai/CROSS-AGENT-OPERATING-RULES.md`](../../ops/ai/CROSS-AGENT-OPERATING-RULES.md) | Handoff contract in section 11 of the template block matches required handoff fields. |
| `.agents/skills/lgfc-pr-governance/SKILL.md` | Use when the deliverable is a PR; assignment must still name one source issue and allowlist before implementation. |
| `.agents/skills/lgfc-docs-authority/SKILL.md` | Use for documentation tasks; section 7 of the template block must name exact Diataxis paths. |

Authority order on conflict: follow [`Agent.md`](../../Agent.md) hierarchy — higher authority wins; stop and report.

## 8. Phase 1 Wrap-Up note

Program 1 — Phase 1 Wrap-Up adopts a PMO model with programs, child projects, tasks, issues, PRs, and verification closeout.

**This template is mandatory before feeding high-capacity agents** during Phase 1 Wrap-Up. Operators and control-plane agents must not assign Cursor, Codex, Copilot, or Devin with informal prompts, umbrella trackers as sole authority, or partial file scope.

Every child-project task routed to an execution agent should be packaged with the mandatory template block (section 4), linked to exactly one source issue, and closed with handoff evidence suitable for verification closeout (`.agents/skills/lgfc-verification-closeout/SKILL.md` when applicable).

This note does not expand Phase 1 program documentation; it establishes the assignment standard required for safe agent execution during wrap-up.
