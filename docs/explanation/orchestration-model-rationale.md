---
Doc Type: Explanation
Audience: Human + AI
Authority Level: Informational
Owns: Rationale and tradeoffs for the LGFC orchestration model
Does Not Own: Orchestrator state contracts; task writing procedure; workflow implementation
Canonical Reference: /docs/reference/architecture/orchestration-model.md
Last Reviewed: 2026-05-05
---

# Orchestration Model Rationale

## Context

LGFC implementation work spans website features, repository operations, governance changes, documentation, and recovery tasks. The project needs an execution model that keeps those workstreams reviewable while allowing AI agents and GitHub automation to do repeatable work.

The current model uses GitHub Issues, draft Pull Requests, labels, workflow scripts, and post-merge status tracking as the shared coordination layer.

## Why GitHub-Native Orchestration

GitHub is already the system of record for code, reviews, labels, pull requests, and merge history. Keeping orchestration in GitHub avoids a second task state system that could drift from the repository.

The model also keeps every task near the evidence needed to review it:

- the implementation plan is versioned in the repository
- generated Issues retain stable task markers
- draft PRs keep file allowlists and acceptance criteria visible
- status labels show execution state
- post-merge verification status is attached back to the linked Issue

## Why Serial Execution Is the Default

The routing configuration sets serial execution as the safety default while orchestration is still being proven. Serial execution reduces cross-task interference, especially when tasks may touch overlapping docs, workflows, labels, or website implementation areas.

Parallel lanes may be added later only by an explicit design change. That change would need lane ownership, conflict rules, and queue advancement behavior that are as deterministic as the current serial queue.

## Why Draft PRs Are Created Before Agent Work

Draft PR creation gives every task a bounded workspace before implementation begins. It also ensures the assigned agent receives:

- a linked issue
- a branch
- a PR body
- acceptance criteria
- validation requirements
- file allowlists

This reduces ambiguity and keeps agent output tied to one reviewable PR.

## Why Labels Drive State

Labels are readable by humans, GitHub Actions, and review tooling. They provide a compact shared state model without requiring a custom database.

The tradeoff is that missing or renamed labels can block or weaken state transitions. For that reason, the state label list is stored in `/.github/orchestrator-labels.json`, and post-merge sync treats missing status labels as a controlled failure mode rather than silent success.

## Why Post-Merge Verification Is Explicit

Passing PR checks does not prove that `main` remains correct after merge. Post-merge verification creates a distinct state between merge and completion:

```text
status:review -> status:post-merge-verify -> status:complete
```

If verification fails, the task enters `status:failed`, and the serial queue halts. That halt is intentional: continuing to queue more work after a failed merge would make recovery harder.

## Diataxis Boundary

The orchestration topic is split by document purpose:

- Reference: `/docs/reference/architecture/orchestration-model.md`
- How-to: `/docs/how-to/create-orchestrated-implementation-plan.md`
- Operations: `/docs/ops/orchestration-tier-design.md`
- Explanation: this document

No single document should mix all four roles.
