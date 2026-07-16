---
Doc Type: Reference
Audience: Human + AI
Authority Level: Project Contract
Owns: Machine-readable PMO project manifest fields, validation invariants, generated issue markers, issue materialization behavior, and project/task linkage requirements
Does Not Own: Product-specific design, PMO priority decisions, GitHub workflow implementation, production approval decisions, secrets, credentials, or external-service authorization
Canonical Reference: /docs/reference/pmo/project-delivery-manifest-contract.md
Related Issues: #2546, #2547, #2549
Last Reviewed: 2026-07-16
---

# PMO Project Delivery Manifest Contract

## Purpose

Define the stable, machine-readable contract used to validate a prepared PMO project and materialize its linked GitHub task issues.

A manifest is an execution index. Human-readable design, implementation plans, issues, pull requests, and repository authority remain required. The manifest makes their project linkage deterministic and automatable.

## File placement

Each prepared project stores its manifest beside its implementation plan:

```text
docs/ops/implementation-plans/<project-slug>/project-manifest.json
```

## Required top-level shape

```json
{
  "schemaVersion": 1,
  "project": {},
  "roles": {},
  "delivery": {},
  "launch": {},
  "deliverables": [],
  "tasks": [],
  "validation": {},
  "closeout": {}
}
```

Unknown fields may be rejected in strict mode. The validator must report their exact paths.

## Project fields

| Field | Type | Requirement |
| --- | --- | --- |
| `project.issueNumber` | positive integer | Existing open PMO project/program issue |
| `project.slug` | string | Stable lowercase kebab-case identifier |
| `project.title` | string | Human-readable project title |
| `project.parentIssueNumber` | positive integer or `null` | Parent PMO program/project when applicable |
| `project.lifecycle` | `pipeline`, `active`, or `closed` | Must agree with GitHub PMO lifecycle |
| `project.priorityLabel` | string | Supported `pmo:priority:*` label |
| `project.objective` | string | One outcome-focused objective |
| `project.completedDeliverable` | string | Verifiable completed-project outcome |
| `project.designPath` | repository path | Human-readable design authority |
| `project.implementationPlanPath` | repository path | Implementation plan |
| `project.manifestPath` | repository path | This manifest |

## Role fields

```json
{
  "preparationOwner": "chatgpt-atlas",
  "executionAgent": "cursor-local",
  "operationsOwner": ["bill", "cursor-local"],
  "tier2Escalation": "chatgpt-atlas",
  "productAuthority": "bill",
  "productionApprovers": ["bill", "chatgpt-atlas"]
}
```

Invariants:

- `preparationOwner` must be `chatgpt-atlas` for PMO-prepared projects unless a source issue records an explicit exception.
- `executionAgent` must be `cursor-local` for repository implementation/operations projects.
- Cursor cannot be a production approver.
- At least one of Bill or ChatGPT/Atlas must remain a production approver.

## Delivery fields

| Field | Type | Requirement |
| --- | --- | --- |
| `delivery.model` | `A` or `B` | Must match project classification |
| `delivery.projectBranch` | string or `null` | Required for Model B; must not equal `main` |
| `delivery.productionBase` | string | Must equal `main` unless repository authority explicitly names another protected production branch |
| `delivery.autoIntegrateNonMain` | boolean | May be `true` only when `projectBranch` is non-production |
| `delivery.autoMergeProduction` | boolean | Must always be `false` |
| `delivery.childPullRequestBase` | string | For Model B, must equal `projectBranch` |
| `delivery.promotionPullRequestBase` | string | Must equal `productionBase` |
| `delivery.promotionApproval` | `bill-or-chatgpt` | Required |
| `delivery.rollbackProfile` | string | Project rollback class/reference |

Hard invariant:

```text
delivery.autoMergeProduction MUST equal false
```

The validator must reject any manifest that permits automatic merge to `main` or another protected production branch.

## Launch fields

```json
{
  "state": "prepared | launched | held | complete",
  "authorizationIssueNumber": 2546,
  "startConditions": [],
  "blockingConditions": [],
  "continuousExecution": true,
  "requiresNewPromptBetweenTasks": false
}
```

Rules:

- Pipeline projects normally use `prepared` or `held`.
- Active implementation projects use `launched`.
- `continuousExecution` may be true only when a validated task graph exists.
- A launched project with continuous execution must set `requiresNewPromptBetweenTasks` to false.
- Pipeline projects must not generate `handoff:ready` on their master or pending tasks.

## Deliverables

`deliverables` is a non-empty array. Each entry includes:

| Field | Requirement |
| --- | --- |
| `id` | Stable identifier |
| `type` | `runtime`, `documentation`, `test-evidence`, `operations`, or `closeout` |
| `description` | Verifiable output |
| `required` | Boolean |
| `acceptanceEvidence` | Expected file, test, report, or live verification |

The collection must include at least one closeout or operations handoff deliverable for Model B projects.

## Task fields

Each task object includes:

```json
{
  "id": "001",
  "issueNumber": 2547,
  "title": "Implement manifest validator",
  "objective": "...",
  "state": "active | prepared | held | complete",
  "predecessors": [],
  "successors": ["002"],
  "parallelGroup": null,
  "branchPattern": "cursor/2546-001-*",
  "pullRequestBase": "component/pmo-project-autonomous-delivery",
  "allowedPaths": [],
  "prohibitedPaths": [],
  "acceptanceCriteria": [],
  "verification": [],
  "stopConditions": [],
  "labels": [],
  "wakeEligible": true
}
```

### Task invariants

- `id` is unique within the manifest.
- `issueNumber`, when present, is a positive integer and the issue contains the matching generated marker.
- Every predecessor and successor resolves to another task ID.
- The dependency graph is acyclic.
- At least one task has no predecessor.
- Exactly one terminal task has no successor, unless the manifest explicitly permits multiple terminal lanes with one final closeout task joining them.
- Every non-terminal task has at least one successor.
- Every task uses the project branch as its PR base for Model B.
- No task may use `main` as an automatic-integration base.
- `wakeEligible` may be true only when the task is executable now.
- A pipeline/prepared/held task must not include `handoff:ready` in generated labels.
- Every task has non-empty objective, acceptance criteria, verification, and stop conditions.

## Validation fields

```json
{
  "manifestCommand": "npm run pmo:project:validate -- <path>",
  "materializeDryRunCommand": "npm run pmo:project:materialize -- --dry-run <path>",
  "requiredProfiles": ["docs", "node-tests"],
  "projectIntegrationChecks": [],
  "productionPromotionChecks": []
}
```

`projectIntegrationChecks` should contain only technically necessary checks for the project branch. `productionPromotionChecks` may be more comprehensive and always remain subject to Bill/ChatGPT approval.

## Closeout fields

| Field | Requirement |
| --- | --- |
| `closeout.terminalTaskId` | Resolves to the final closeout task |
| `closeout.finalReview` | Must equal `bill-or-chatgpt` |
| `closeout.productionVerificationRequired` | Boolean; normally true for runtime work |
| `closeout.operationsOwner` | Bill + Cursor Local unless explicitly excepted |
| `closeout.tier2Escalation` | ChatGPT / Atlas |
| `closeout.rollbackReference` | Plan or runbook path |

## Stable generated markers

### Project marker

```text
<!-- lgfc-project-manifest:<project-slug>:v<schemaVersion> -->
```

### Task marker

```text
<!-- lgfc-project-task:<project-slug>:<task-id> -->
```

The materializer uses these markers as identity keys. Titles and labels are not sufficient identity keys.

## Generated issue block

The materializer may own one explicitly delimited block:

```text
<!-- BEGIN LGFC GENERATED PROJECT TASK -->
...generated fields...
<!-- END LGFC GENERATED PROJECT TASK -->
```

Rules:

- Content outside the generated block is preserved.
- Comments are never rewritten or deleted.
- Existing task issues without a marker are not silently adopted; dry-run reports an adoption candidate requiring explicit operator action.
- The materializer never closes an issue unless a separate closeout task and source authority explicitly permit it.

## Materialization actions

The tool reports one action per task:

- `create` — no issue with the marker exists;
- `update` — generated fields differ;
- `no-change` — generated fields match;
- `blocked` — ambiguity or unsafe condition exists;
- `adoption-candidate` — a likely pre-existing task lacks the stable marker.

## Idempotency

For an unchanged manifest and unchanged generated blocks:

1. the first apply may create/update issues;
2. the second apply must produce only `no-change` actions;
3. no new issue number may be allocated;
4. no label, assignee, or body mutation may occur;
5. the tool exit status must indicate success.

## GitHub permissions

Dry-run requires read access only.

Apply mode requires minimum necessary permissions:

```yaml
permissions:
  contents: read
  issues: write
```

The workflow must not request pull-request merge, actions administration, repository administration, secrets, deployments, or contents write solely for issue materialization.

## Event safety

Apply mode must not run from:

- untrusted fork pull requests;
- arbitrary issue comments;
- public mention triggers;
- a manifest that is not present on the approved base/project branch;
- a project that is held or missing authorization.

Manual dispatch with explicit `apply=true`, or an equivalently trusted repository event authorized by policy, is required.

## Portfolio migration contract

When migrating existing PMO records:

- preserve project priority and lifecycle unless deterministic evidence requires correction;
- preserve product scope and dependencies;
- add ChatGPT preparation and Cursor execution role fields;
- add objective/deliverable, branch, production boundary, plan/manifest, and task linkage where known;
- record preparation gaps rather than inventing tasks;
- never add wake state to an unprepared pipeline record;
- never launch a project as a side effect of metadata migration.

## Schema artifact

The deterministic JSON Schema companion used by the Task 001 tooling lives at:

```text
scripts/pmo-projects/project-manifest.schema.json
```

Validation and materialization commands:

```text
npm run pmo:project:validate -- <manifest-path>
npm run pmo:project:materialize -- --dry-run [--repo owner/name] <manifest-path>
PMO_MATERIALIZE_APPLY_AUTHORIZED=true npm run pmo:project:materialize -- --apply [--repo owner/name] <manifest-path>
```

Apply mode is fail-closed without `PMO_MATERIALIZE_APPLY_AUTHORIZED=true`.

## Failure behavior

Validation and materialization fail closed when:

- schema or required fields are invalid;
- the project issue cannot be uniquely resolved;
- stable markers are duplicated;
- task dependencies are invalid or cyclic;
- an issue-number collision exists;
- generated task state conflicts with project lifecycle;
- project branch equals `main` for Model B;
- automatic production merge is enabled;
- apply mode lacks trusted authorization.

No partial apply should occur after a validation failure.
