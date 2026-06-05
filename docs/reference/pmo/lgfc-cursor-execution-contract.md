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

## PMO Issue-Comment Bridge

GitHub issue comments may be used as a controlled operational bridge between Atlas and Cursor for PMO, program, project, and task execution.

The objective of the bridge is to move approved PMO-defined work to a pull request that passes required gates and is ready for human merge review.

The bridge is not a general chat surface. It exists only for repository-governed work that has been defined by an approved PMO, program, project, or task issue.

Bridge comments are allowed when all of the following are true:

- the issue is the active source issue, parent program issue, child project issue, or an explicitly named coordination issue;
- the work item is PMO-defined and approved for queue movement, implementation, review, or closeout;
- the comment is labeled by content as an Atlas handoff, Cursor status, PMO queue note, program instruction, project instruction, task instruction, or closeout evidence;
- the comment contains bounded operational instruction or bounded execution status;
- the comment supports progress toward a PR, PR review, gate completion, or authorized post-merge closeout;
- the comment does not bypass PR review, required checks, merge authority, or post-merge issue closeout rules.

Atlas may use issue comments to:

- promote or queue PMO-defined work;
- provide Cursor with short actionable instructions;
- authorize PR opening after review-packet approval;
- clarify approved program, project, or task sequencing;
- request a bounded Cursor status reply;
- provide post-merge closeout instructions when separately authorized by Bill.

Cursor may use issue comments to:

- acknowledge Atlas handoff instructions;
- report stop conditions;
- report branch or PR creation;
- report brief execution status needed for queue control;
- report required gate or validation status;
- provide post-merge closeout results when specifically authorized.

## Issue-Comment Bridge Limits

Issue comments must not become unrestricted working drafts.

Do not use issue comments for:

- work not defined by an approved PMO, program, project, or task issue;
- long reconciliation drafts;
- full review packets unless Atlas or Bill explicitly requests the packet on the issue;
- speculative design debate;
- unbounded planning;
- broad implementation summaries better suited to a PR body or PR comment;
- issue closure, relabeling, or state mutation unless separately authorized.

Before a PR exists, full review packets normally stay in chat unless Atlas or Bill explicitly routes the packet to the issue.

After a PR exists, detailed review material belongs in the PR body, PR comments, or PR review threads.

Post-merge closeout evidence remains governed by `/docs/ops/pmo/github-issue-closeout-protocol.md`.

## Bridge Reply Path Rule

The default reply path for Atlas/Cursor handoffs is the same surface where the handoff was delivered.

- If Atlas/Bill sends the Cursor prompt in chat, Cursor replies in chat.
- If Atlas posts a bounded bridge handoff on a GitHub issue, Cursor replies on that issue using the required bridge reply format.
- If the handoff occurs on a PR, Cursor replies on the PR.

Cursor must not move a response to a different surface unless Atlas/Bill explicitly requests it.

Issue comments remain opt-in for each handoff. The PMO Issue-Comment Bridge permits bounded issue comments, but does not make issue comments the default reply path for all Cursor work.

## Required Bridge Comment Format

Atlas bridge comments should use this shape:

```text
Atlas handoff — Cursor action requested

Task / program / project:
<issue or work item>

Instruction:
<short actionable instruction>

Scope:
<allowed branch/files/actions>

Prohibited:
<merge/close/relabel/etc.>

Expected reply:
<what Cursor should report back>
```

Cursor bridge replies should use this shape:

```text
Cursor status — Atlas handoff response

Task / program / project:
<issue or work item>

Result:
<short status>

Branch/PR:
<branch or PR if applicable>

Stop condition:
<none or reason>

Gate status:
<not run / running / passing / failing>

Next required Atlas action:
<approval/review/merge/etc.>
```

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