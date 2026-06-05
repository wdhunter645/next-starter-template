---
Doc Type: Explanation
Audience: Human + AI
Authority Level: Operational Authority
Owns: Rationale for issue disposition categories in LGFC program closeout
Does Not Own: Actual GitHub issue mutation or merge authority
Canonical Reference: /docs/ops/pmo/github-issue-closeout-protocol.md
Related Issues: #1335, #1351
Last Reviewed: 2026-06-05
---

# Issue Disposition Model

## Purpose

Provide a shared vocabulary for classifying open issues during Program 1 closeout.

## Categories

| Category | Meaning | Typical action |
|---|---|---|
| complete | Merged work already satisfies the issue | evidence comment, then close |
| superseded | Newer authority replaces the issue | superseded-by comment, then close |
| deferred-program-2 | Valid follow-up for Program 2 | keep or recreate under Program 2 launch gate |
| deferred-program-3 | Valid backlog outside Program 2 launch | classify and keep out of active queue |
| duplicate | Same obligation exists elsewhere | reference canonical issue |
| not-planned | No longer part of accepted scope | rationale required |

## Evidence Rule

Every disposition needs an evidence pointer:

- PR number;
- authority document path;
- replacement issue;
- launch-gate decision;
- owner decision.

## Timing Rule

Disposition comments may be prepared during implementation, but issue state changes occur after PR merge and verification unless an issue-management-only task authorizes earlier action.
