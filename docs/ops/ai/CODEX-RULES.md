---
Doc Type: Operational Rules
Audience: AI (Codex)
Authority Level: Agent-Specific
Owns: Codex implementation-agent behavior for LGFC repository work
Does Not Own: Shared agent law, design authority, ChatGPT control-plane coordination, or merge approval
Canonical Reference: /docs/ops/ai/SHARED-AGENT-RULES.md
Last Reviewed: 2026-06-04
---

# CODEX-RULES.md

## Purpose

This document defines **Codex-specific** execution behavior when Codex is the assigned implementation agent.

Shared agent law: [`SHARED-AGENT-RULES.md`](./SHARED-AGENT-RULES.md).  
Detailed shared execution: [`CORE-RULES.md`](./CORE-RULES.md).  
Historical prompt summary: [`PROMPTS/Codex-Rules.md`](../../../PROMPTS/Codex-Rules.md) (supporting reference; this file wins on conflict).

---

## Role

Codex is an **implementation agent**, not the control plane.

Codex performs scoped code and documentation changes within an existing PR or approved task scope.

Codex does not:

- define scope or acceptance criteria;
- create new Pull Requests unless the source Issue explicitly instructs it;
- merge Pull Requests;
- override ChatGPT/operator coordination.

Agent routing priority: [`CORE-RULES.md` — Agent routing priority](./CORE-RULES.md#agent-routing-priority).

---

## Execution model

- **PR-as-task** — read the full PR and source Issue before acting.
- **One deliverable** — one task, one branch (when branch creation is in scope), one PR.
- **Allowlist boundary** — modify only files in the approved allowlist.
- **Default stop** — after updating an existing draft PR, stop unless the source Issue instructs further commits.

Apply all sections of [`SHARED-AGENT-RULES.md`](./SHARED-AGENT-RULES.md) before claiming completion.

---

## GitHub and git behavior (Codex-specific)

- Use **Codex GitHub integration** to commit and update the **existing** PR when that is the assigned workflow.
- **Do not** use ad-hoc `git push` when integration is required by the task.
- **Do not** create a new branch or new PR when the task assigns work to an existing PR.
- **Do not** leave work only in a sandbox — commits must appear on the PR branch the gate evaluates.

If the source Issue explicitly instructs standard git branch/PR workflow (for example repository automation issues), follow that Issue instruction and [`CURSOR-RULES.md`](./CURSOR-RULES.md) branch rules where applicable.

---

## Validation before handoff

Codex must confirm:

- only allowlisted files changed;
- PR body allowlist and change summary match the diff;
- task-relevant local checks were run when required by the source Issue;
- handoff includes files changed, verification commands, and blockers.

Skill references: `.agents/skills/lgfc-pr-governance/SKILL.md`, `.agents/skills/lgfc-verification-closeout/SKILL.md`.

---

## Failure conditions

Stop and report when:

- PR or allowlist is unclear;
- scope conflicts with shared law or design authority;
- Codex cannot update the assigned PR through the required integration path;
- extra files would be required outside the allowlist.

Treat **no PR update**, **new PR created against instruction**, **extra files**, or **no commit on the target branch** as execution failure.

---

## Stop conditions (Codex-specific)

Stop if:

- no primary source Issue exists for the work;
- instructions conflict with [`SHARED-AGENT-RULES.md`](./SHARED-AGENT-RULES.md);
- merge or push is requested without explicit source Issue authorization.

---

## Final

Codex executes within approved scope on an existing orchestrated PR. Shared law and gate discipline are mandatory; control-plane coordination remains with ChatGPT/operator unless the source Issue assigns otherwise.
