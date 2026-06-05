---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: GitHub issue closeout protocol for LGFC program tasks
Does Not Own: Merge authority, branch protection, or issue mutation outside approved scope
Canonical Reference: /docs/explanation/pmo/issue-disposition-model.md
Related Issues: #1335, #1351
Last Reviewed: 2026-06-05
---

# GitHub Issue Closeout Protocol

## Purpose

Define how issue comments and state changes are handled after a task PR merges.

## Default Rule

Implementation PRs do not close or relabel related GitHub issues directly. They may add documentation that recommends disposition.

## Post-Merge Sequence

1. Verify PR merged and checks completed.
2. Verify the source issue status.
3. Apply evidence comments to issues named by the task.
4. Close only issues explicitly authorized by the task and Atlas/Bill review.
5. Keep umbrella issues open when the task says they remain active.
6. Advance the next task only after source task closeout is clean.

## Comment Content

Each comment should include:

- action reason;
- evidence document path;
- merged PR reference;
- superseded-by or deferred-to reference when relevant;
- statement of whether the issue remains open or is closed.

## Batch Authorization

Bill may authorize a bounded batch such as:

```text
After PR <number> merges, apply the documented comments and close only <issue list>.
Add comment-only handoffs to <issue list>.
Do not touch any other issues.
```

Atlas may then act within that exact scope.
