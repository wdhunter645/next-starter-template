---
Doc Type: How-To
Audience: AI
Authority Level: Operational Authority
Owns: Cursor review-packet format for Atlas review
Does Not Own: PR review decisions, merge decisions, or issue closeout
Canonical Reference: /docs/reference/pmo/lgfc-cursor-execution-contract.md
Related Issues: #1351
Last Reviewed: 2026-06-05
---

# Prepare a Cursor Review Packet

## Purpose

Provide Atlas with enough information to review scope before a PR is opened.

## Required Packet

```text
Task:
Source issue:
Mode: Review packet only — no PR, no push, no merge
Command used for diff:
Changed-file list:
Scope confirmation:
Validation results:
Issue state timing:
Recommended closeout comments:
Full local diff:
```

## Scope Confirmation

Always include:

```text
Only these paths changed:
<git status / git diff --name-only output>
```

## Issue Timing Table

Separate actions into:

| Action | Before PR merge | After PR merge |
|---|---|---|
| Open PR | allowed after approval | n/a |
| Close source issue | no | yes, after verification |
| Close superseded issues | no | yes, after Atlas approval |
| Comment-only handoff | no | yes, after merge |

## Rule

Do not open the PR until Atlas has reviewed the packet unless Bill explicitly authorizes direct PR creation.
