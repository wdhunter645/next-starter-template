---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Operational index for the LGFC orchestration tier
Does Not Own: Orchestration state contracts; implementation plan procedure; orchestration rationale; product UI, routes, or content
Canonical Reference: /docs/reference/architecture/orchestration-model.md
Last Reviewed: 2026-05-05
---

# LGFC Orchestration Tier

## Purpose

This operations document points contributors and agents to the active Diataxis-aligned orchestration documentation.

## Documentation Map

| Need | Document |
| --- | --- |
| State model, labels, routing, workflow inventory | `/docs/reference/architecture/orchestration-model.md` |
| Why the system uses GitHub Issues, draft PRs, and a serial queue | `/docs/explanation/orchestration-model-rationale.md` |
| How to write a production-ready implementation plan | `/docs/how-to/create-orchestrated-implementation-plan.md` |
| Implementation plan storage and task format | `/docs/ops/implementation-plans/README.md` |

## Current Operating Model

The orchestration tier uses GitHub-native artifacts:

- Implementation plans under `/docs/ops/implementation-plans/`.
- Issues generated from production-ready plans.
- Draft PRs generated from queued issues.
- Agent trigger comments on linked issues.
- PR state sync back to issue status labels.
- A serial queue that advances only after the active issue completes post-merge verification.

## Active Automation

| Automation | File |
| --- | --- |
| Issue factory | `/.github/workflows/orchestrator-issue-factory.yml` |
| Draft PR creator | `/.github/workflows/orchestrator-draft-pr.yml` |
| Agent trigger | `/.github/workflows/orchestrator-agent-trigger.yml` |
| PR state sync | `/.github/workflows/orchestrator-pr-state-sync.yml` |
| Queue advance | `/.github/workflows/orchestrator-queue-advance.yml` |

## Operating Invariants

- No direct commits to `main` for orchestrated implementation work.
- One task maps to one generated issue.
- One issue maps to one generated draft PR.
- Only one orchestrator issue is active at a time while the concurrency policy remains serial.
- `status:failed` halts queue advancement until recovery work resolves the failure.
- Product UI, route behavior, and content design remain owned by `docs/reference/design/`.

## Supersession Note

Earlier versions of this document mixed architecture reference, rationale, and operating notes. Going forward, this file is the operations index only. The reference model owns exact contracts.
