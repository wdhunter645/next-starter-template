---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Implementation plan format for orchestrated GitHub execution
Does Not Own: Product design, route behavior, visual design, or platform architecture
Canonical Reference: /docs/reference/architecture/orchestration-model.md
Last Reviewed: 2026-06-06
---

# Implementation Plans

This directory stores production-ready implementation plans that can be converted into GitHub Issues by the LGFC orchestration tier.

## PMO Registry

Orchestrated work follows the PMO execution chain documented in `/docs/ops/pmo/program-registry.md`:

```text
Program → Child Project → Task → Issue → PR → Verification → Closeout
```

Related PMO documents:

- `/docs/ops/pmo/critical-path.md` — serial queue and track rules
- `/docs/ops/pmo/parallel-agent-rules.md` — read-only parallel vs one implementer per task

Program 1 Task 008 launch gate (when signed): `/docs/ops/reports/program-2-launch-gate.md`

## Purpose

An implementation plan is the handoff document created by Atlas after the project design is approved. It defines the exact execution steps required to complete a project safely through GitHub Issues, draft Pull Requests, AI agent implementation, automated review, and human approval.

## Activation Rule

Only plans with this front matter are eligible for orchestration:

```yaml
---
Doc Type: Implementation Plan
Status: production-ready
Project: <project-name>
Owner: Atlas
Execution Mode: orchestrated
---
```

Plans without `Status: production-ready` are drafts and must not trigger issue creation.

## Required Task Format

Each task must use this structure:

```markdown
## Task 001 — <short title>

Type: repository | website | governance | docs | recovery | ci
Agent: codex | cursor | copilot | atlas
Priority: 1
Depends On: none | Task 000
Allowed Files:
- path/example
Acceptance Criteria:
- exact measurable result
Validation:
- exact command or review requirement
```

## Orchestration Requirements

Each task must be specific enough for a bot to create a GitHub Issue and draft Pull Request without interpretation.

Required properties:

- One objective per task.
- One primary agent per task.
- Explicit file allowlist.
- Explicit acceptance criteria.
- Explicit validation requirements.
- No mixed website/repository implementation unless explicitly approved.

For a step-by-step plan authoring procedure, use `/docs/how-to/create-orchestrated-implementation-plan.md`.

## Stable Task Identity

Generated issues must include a stable marker:

```text
<!-- lgfc-task-id: <project-slug>:Task-001 -->
```

This marker prevents duplicate issue creation when a production-ready plan is updated.
