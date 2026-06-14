---
Doc Type: Governance / Process
Audience: Human + AI Agents
Authority Level: Governance
Owns: Ready-for-review handoff requirements for pull requests
Canonical Reference: /docs/governance/PR_LIFECYCLE_STATE_MACHINE.md
Last Reviewed: 2026-06-14
---

# PR Ready-for-Review Handoff Requirement

## Rule

An agent handoff is invalid while a pull request remains in GitHub Draft state unless the PR body or a current PR comment records an explicit blocker that prevents the Ready for Review transition.

## Required behavior

Before reporting a PR as complete, ready, handed off, or awaiting human review, the responsible agent must confirm one of the following is true:

1. The PR has been moved out of Draft using GitHub's **Ready for review** transition.
2. The PR remains Draft and the blocker is explicitly recorded in the PR body or a current PR comment.

Opening a PR, updating the PR body, running checks, or saying the PR is ready is not sufficient if GitHub still shows the PR as Draft.

## Required handoff line

Every PR handoff must report the actual GitHub state:

```text
GitHub PR state: draft / ready for review / merged / blocked with documented reason
```

## Failure condition

If an agent reports a PR as ready for review while GitHub still shows the PR as Draft and no blocker is documented, the handoff is invalid and must be corrected before any human merge decision.
