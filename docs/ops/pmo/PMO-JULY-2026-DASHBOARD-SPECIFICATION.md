---
Doc Type: Operations Specification
Audience: PMO operators, AI agents, dashboard maintainers
Authority Level: Canonical PMO Dashboard Authority
Owns: PMO July 2026 dashboard JSON contract, view placement rules, validation requirements, Incomplete view behavior, task calculations, sorting, and rendering expectations
Does Not Own: PMO governance authority, GitHub issue mutation, workflow YAML, runtime implementation, or live label creation
Canonical Reference: /docs/ops/pmo/PMO-JULY-2026-OPERATING-MODEL.md
Related Issues: #2313, #2471, #2516
Last Reviewed: 2026-07-14
---

# PMO July 2026 Dashboard Specification

## Purpose

Define how the PMO dashboard represents the PMO July 2026 issue contract in generated JSON and static dashboard views.

The dashboard is a reporting surface. GitHub Issues remain the executable source of truth for labels, issue state, parent/child relationships, comments, assignments, and closeout evidence.

## Scope

This specification covers:

- source issue inclusion and exclusion;
- JSON row fields;
- Active, Pipeline, Completed, and Incomplete view placement;
- lifecycle, priority, pipeline-stage, and task-accounting calculations;
- validation failures and remediation data;
- display and rendering expectations.

It does not authorize dashboard generator code changes, label creation, issue metadata backfill, workflow changes, or GitHub issue mutation.

## Current known truth

- The PMO July 2026 Operating Model owns the PMO issue contract.
- The `pmo` label controls PMO tracking eligibility.
- Every PMO-tracked issue must have exactly one PMO lifecycle label and exactly one PMO priority label.
- Every `pmo:pipeline` issue must have exactly one pipeline-stage label.
- `pmo:priority:idea` is valid for agenda-retained Pipeline topics without numbered execution priority.
- `pmo:priority:none` is prohibited.
- Incomplete PMO metadata must be visible in a dedicated Incomplete section instead of hidden or silently coerced into Active, Pipeline, or Completed.

## Intended final state

The generated `dashboard-data.json` and rendered dashboard are internally consistent, actionable, and lossless enough for operators to identify every PMO row, understand its state, and remediate missing or contradictory metadata.

## Source issue eligibility

An issue is PMO-tracked when it has the `pmo` label.

Standalone portfolio rows require both:

1. the `pmo` label; and
2. a supported standalone portfolio title prefix:
   - `PROGRAM:`
   - `PROJECT:`
   - `PROGRAM CANDIDATE:`
   - `STRATEGY:`
   - `STRATEGY REVIEW:`

Task issues use `pmo:task` and a valid parent reference. They do not render as standalone portfolio rows. They remain available for parent task accounting.

Unsupported PMO-labeled issues, missing identity, and contradictory classification must render in Incomplete with remediation guidance.

## Required JSON row fields

Every emitted row in any view must include:

| Field | Requirement |
| --- | --- |
| `issueNumber` | GitHub issue number |
| `issueUrl` | GitHub issue URL |
| `title` | Display title |
| `labels` | Current label names from the issue snapshot |
| `lifecycle` | `pipeline`, `active`, `closed`, or `incomplete` |
| `priorityLabel` | One accepted PMO priority label |
| `priorityDisplay` | Numeric priority display, `Idea`, or remediation text for Incomplete |
| `pipelineStageLabel` | Required for valid Pipeline rows; omitted or null outside Pipeline |
| `pipelineStageDisplay` | Human display name for Pipeline stage |
| `taskCount` | Count of valid linked `pmo:task` issues |
| `tasksCompleted` | Count of linked tasks with `pmo:closed` |
| `percentComplete` | `round(tasksCompleted / taskCount * 100)` when `taskCount > 0`; otherwise null or the documented no-task display value |
| `updatedAt` | GitHub issue last-updated timestamp |
| `dataQualityErrors` | Empty for valid Active/Pipeline/Completed rows; populated for Incomplete rows |
| `requiredRemediation` | Empty for valid rows; populated for Incomplete rows |

Generated output must never omit issue identity for a PMO-tracked issue. Missing identity is itself an Incomplete error.

## Lifecycle and view placement

Validation runs before view placement.

| Condition | View |
| --- | --- |
| Missing, duplicate, or unsupported required metadata | Incomplete |
| GitHub issue closed but not reconciled to `pmo:closed` | Incomplete |
| Valid `pmo:active` | Active Programs/Projects |
| Valid `pmo:pipeline` | PMO Pipeline |
| Valid `pmo:closed` | Completed Programs |

Closed GitHub issue state must reconcile to `pmo:closed`. Open issues may not be treated as completed unless their labels and issue state are reconciled according to the PMO issue contract.

## Pipeline stage mapping

Every valid Pipeline row must carry exactly one stage:

| Order | Label | Display |
| ---: | --- | --- |
| 1 | `pmo:stage:intake` | Idea / topic intake |
| 2 | `pmo:stage:discovery` | Discussion / discovery |
| 3 | `pmo:stage:definition` | Definition / design |
| 4 | `pmo:stage:planning` | Planning |
| 5 | `pmo:stage:prep` | Implementation preparation |
| 6 | `pmo:stage:ready-for-launch` | Ready for launch |

Ready for launch means preparation is complete and only Bill/Atlas Go/No-Go remains. It must not be rendered as launched, active, or authorized implementation.

## Priority handling

Accepted priority labels are:

- `pmo:priority:1`, `pmo:priority:2`, `pmo:priority:3`, and so on;
- `pmo:priority:idea`.

Rules:

- Exactly one accepted priority label is required on every PMO-tracked issue.
- Numeric priorities sort by numeric value.
- `pmo:priority:idea` displays as `Idea` and remains in Pipeline/PMO meeting agenda reporting until promoted to a numbered priority or closed.
- `pmo:priority:none` must fail validation and render the issue in Incomplete.

## Task accounting

Task accounting uses linked `pmo:task` issues with valid parent references.

For each parent:

```text
taskCount = count(linked pmo:task issues)
tasksCompleted = count(linked pmo:task issues with pmo:closed)
percentComplete = round(tasksCompleted / taskCount * 100) when taskCount > 0
```

Validation fails when:

- a `pmo:task` issue has no valid parent reference;
- a parent's `tasksCompleted` exceeds `taskCount`;
- a parent's percentage does not match the required calculation;
- a referenced task cannot be identified well enough to determine state;
- standalone row filtering removes a task from display but also removes it from parent accounting.

## Incomplete view contract

The Incomplete section is the required remediation view for PMO-tracked issues with invalid data.

Each Incomplete row must show:

- issue number and link;
- current labels;
- data-quality errors;
- required remediation;
- last updated date.

Incomplete detection includes at least:

- missing or conflicting lifecycle label;
- missing or conflicting priority label;
- prohibited `pmo:priority:none`;
- missing or conflicting pipeline-stage label for Pipeline work;
- missing or invalid parent reference for a task;
- invalid task accounting;
- missing issue identity or URL in generated output;
- unsupported or contradictory PMO classification.

## Sorting

- Active rows sort by numeric priority, then updated date.
- Pipeline rows sort by numeric priority, then stage order, then updated date.
- `pmo:priority:idea` rows sort after numbered Pipeline priority rows unless an operator view explicitly filters agenda ideas.
- Completed rows sort by closed date when available, then updated date.
- Incomplete rows sort by severity of data-quality error, then updated date, so remediation work remains visible.

## Rendering requirements

The static dashboard must:

- show Active, Pipeline, Completed, and Incomplete sections;
- escape issue-derived display text;
- link issue numbers to GitHub issue URLs;
- display current labels for Incomplete rows;
- display task counts and completion percentage from the generated contract fields;
- avoid substituting `TBD`, blank priority, or default stage values for invalid required metadata.

## Validation requirements

Validation must fail generated output that:

- omits required row identity fields;
- emits a PMO-tracked issue into Active/Pipeline/Completed despite invalid required metadata;
- accepts `pmo:priority:none`;
- accepts missing or multiple lifecycle labels;
- accepts missing or multiple priority labels;
- accepts a Pipeline row without exactly one stage label;
- loses linked `pmo:task` issues needed for parent task accounting;
- produces invalid task math.

## Operator remediation flow

1. Open the Incomplete section.
2. For each row, inspect issue number/link, labels, data-quality errors, and required remediation.
3. Correct labels, parent reference, issue identity, or task linkage in GitHub only when authorized.
4. Regenerate and validate dashboard output.
5. Confirm the issue moved to Active, Pipeline, or Completed only after contract validation passes.

## Related references

- PMO July 2026 Operating Model: `/docs/ops/pmo/PMO-JULY-2026-OPERATING-MODEL.md`
- PMO Dashboard how-to: `/docs/how-to/pmo/pmo-dashboard.md`
