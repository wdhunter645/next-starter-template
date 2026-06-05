---
Doc Type: Reference
Audience: Human + AI
Authority Level: Operational Authority
Owns: Cursor execution boundaries for LGFC program tasks
Does Not Own: Cursor product configuration, local developer environment, or GitHub merge authority
Canonical Reference: /docs/reference/pmo/lgfc-program-portfolio-model.md
Related Issues: #1335, #1351
Last Reviewed: 2026-06-05
---

# LGFC Cursor Execution Contract

## Purpose

Define what Cursor may do by default when implementing LGFC program tasks.

## Default Permissions

Cursor may:

- read repository docs and source issues;
- edit files inside the active task allowlist;
- run validation commands;
- produce local review packets;
- open a PR when Atlas or Bill authorizes PR creation.

Cursor may not, by default:

- merge PRs;
- close issues;
- relabel issues;
- create child issues;
- modify workflow YAML or runtime code outside the task allowlist;
- combine multiple task issues into one PR;
- make broad cleanup changes because they are nearby.

## Required Cursor Output

For each implementation pass, Cursor reports:

```text
Task:
Source issue:
Changed files:
Validation:
Out-of-scope files touched: yes/no
PR opened: yes/no
Recommended post-merge issue actions:
```

## File Authority

If a task issue allowlist conflicts with a broad repo cleanup impulse, the issue allowlist wins.

If Cursor finds necessary work outside the allowlist, it reports the finding and stops before editing that path.

## PR Rule

One task issue maps to one PR unless Atlas explicitly authorizes a split.

## Closeout Rule

GitHub issue state changes happen after PR merge and post-merge verification, not during local implementation.
