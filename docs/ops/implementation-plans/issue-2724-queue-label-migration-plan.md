---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled Implementation Plan
Owns: Current-state inventory, target queue-label registry, reversible migration design, and bounded implementation handoffs for Issue #2724 under Project #2702
Does Not Own: Queue policy, Product Authority decisions, live label creation, live Issue mutation, dashboard/runtime implementation, routing/controller implementation, merge approval, or Production authorization
Canonical Reference: /docs/governance/WORK-QUEUES-AND-COLLABORATION.md
Related Issues: #2699, #2702, #2724, #2725, #2726, #2727
Last Reviewed: 2026-07-21
---

# Queue Label Registry and Reversible Migration Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. #2724 is planning-only. Runtime implementation belongs to #2725 and #2726. Promotion and live migration belong to #2727.

**Goal:** Establish a machine-readable queue-label contract and a fail-closed, fully reversible migration sequence that implements the approved Operations, PMO Active, and Engineering Pipeline model without inventing Issue state.

**Architecture:** Canonical policy remains in `docs/governance/WORK-QUEUES-AND-COLLABORATION.md`. The new `.github/queue-label-registry.json` is the implementation contract consumed by later dashboard and routing work. Runtime changes are split between #2725 and #2726, and live repository mutation is isolated to #2727 after independent review.

**Tech Stack:** GitHub Issues and labels, JSON repository contracts, Node.js PMO dashboard scripts, Cursor Bridge/orchestrator scripts, GitHub Actions, Markdown operational documentation.

## Global Constraints

- Source authority is Project #2702 and planning child #2724.
- The PMO meeting decisions already merged through #2699, PR #2722, PR #2723, and PR #2730 must not be reinterpreted.
- No live label creation or existing-Issue mutation is authorized by #2724.
- No priority, stage, team, parent, graduation, or closeout value may be inferred merely to make validation pass.
- Every ambiguous record is quarantined for an explicit decision.
- All code and contract changes use branches and pull requests; no direct push to `main`.
- Builders do not approve their own work.
- Project Graduation is explicit; Engineering priority never transfers automatically into PMO priority.
- Child tasks never carry team or team-priority labels.
- Operations Monitoring and Hold are non-blocking interval-managed states.
- Rollback must restore the exact pre-migration label set for every mutated Issue.

---

## Baseline

The planning branch was created from `main` commit:

```text
0b98e759598bdca55f4c3d7bee26374cb2e488bf
```

### Baseline file identities

| Surface | Path | Baseline blob |
| --- | --- | --- |
| Canonical queue policy | `docs/governance/WORK-QUEUES-AND-COLLABORATION.md` | `34776f841a1c76a7c7571fb79d0679d56c6f1ec4` |
| Generic orchestrator labels | `.github/orchestrator-labels.json` | `2996db866b3a1c6cef5551d80f64975e9cb5e3b7` |
| Generic orchestrator routing | `.github/orchestrator-routing.json` | `210258b2b39ecd906e1e5753b47190402263c8f2` |
| Dashboard generator | `scripts/pmo-dashboard/build-dashboard.mjs` | `89f77ccc991bf28cd2f21d01efe42254ac8d5d24` |
| Dashboard validator | `scripts/pmo-dashboard/validate-dashboard.mjs` | `5a32c4bd6da224b93d398eb31282c19a894d2156` |
| PMO static inventory | `scripts/pmo-dashboard/pmo-tracked-inventory.json` | `2809881bdcb15615536b1e5c16aee3f81cc52f22` |
| Lifecycle transition fixture | `scripts/pmo-dashboard/test-lifecycle-transitions.mjs` | `87b2fea3575952dbbdb8eca4824447f18eb1e10a` |
| Label bootstrap procedure | `docs/ops/github-label-bootstrap.md` | `3e404fd00caf279c1323e6d089b66689665b88ea` |

## Current-state findings

### 1. Canonical policy is complete

The canonical model already defines:

- one Operations interrupt queue;
- peer PMO Active and Engineering Pipeline queues;
- mutually exclusive `team:*` ownership;
- Operations priorities 1–4 plus Monitoring and Hold;
- PMO priorities 1–4 for Active parents only;
- Engineering priorities 1–4 plus Idea for Pipeline parents and peer preparation Issues;
- explicit Project Graduation;
- no team priority on project child tasks.

This project implements that policy. It does not revise it.

### 2. The configured orchestrator label registry is legacy-only

`.github/orchestrator-labels.json` currently contains:

- generic `status:*` workflow labels;
- generic `type:*` labels;
- `agent:*` labels;
- the `orchestrator` marker.

It contains none of the approved `team:*`, `ops:*`, or `eng:priority:*` labels and does not encode lifecycle-specific PMO priority rules.

Disposition:

- preserve generic status/type labels during transition;
- do not treat them as queue ownership or priority authority;
- introduce the target queue contract in `.github/queue-label-registry.json`;
- reconcile `.github/orchestrator-labels.json` only in #2726 after consumers and tests are ready.

### 3. Generic routing still depends on retired or secondary named-agent defaults

`.github/orchestrator-routing.json` version 2 routes by task type and named-agent priority. It currently defaults:

- repository work to `codex`;
- governance work to `copilot`;
- website and CI work to `cursor`;
- docs and recovery work to `ChatGPT`.

This does not implement queue precedence and does not match the current durable-role model. It also risks routing to inactive or non-authoritative agents.

Disposition:

- #2726 must replace task-type-first dispatch with queue-aware eligibility;
- named-agent labels may remain assignment metadata but must not override queue ownership, priority namespace, protected stops, or role authority;
- `agent:codex` and `agent:copilot` are quarantined for an explicit retirement/remapping decision rather than silently deleted.

### 4. The dashboard generator still uses one PMO priority namespace

`scripts/pmo-dashboard/build-dashboard.mjs` currently:

- recognizes only `pmo:priority:[0-9]+`, `pmo:priority:idea`, and `pmo:priority:none`;
- requires a PMO priority for every PMO-tracked record, including Pipeline records and tasks;
- has no `teamLabel` field or team-namespace validation;
- allows arbitrary numeric PMO priority values;
- does not reject PMO priority on Pipeline or Engineering priority on Active;
- does not reject team priority on child tasks.

Disposition:

- #2725 must implement lifecycle-specific team and priority parsing;
- Active parent priority is limited to `pmo:priority:1..4`;
- Pipeline parent priority is `eng:priority:1..4` or `eng:priority:idea`;
- child tasks have no team priority;
- invalid combinations route to Incomplete.

### 5. The dashboard validator does not enforce queue ownership

`scripts/pmo-dashboard/validate-dashboard.mjs` currently validates lifecycle, view placement, PMO priority presence, Pipeline stage, task math, and residual inventory safety. It does not require or validate `teamLabel`, does not enforce lifecycle-specific priority namespaces, and still expects every valid top-level row to have a PMO-style priority.

Disposition:

- #2725 must add `teamLabel` to the row contract;
- validator rules must match `.github/queue-label-registry.json`;
- cross-namespace labels, dual team ownership, child priority, and invalid Graduation residue must fail closed.

### 6. The frozen-inventory authority repair is already complete

`scripts/pmo-dashboard/pmo-tracked-inventory.json` version 3 has:

- an empty `included` collection;
- explicit non-state exclusions;
- no live `expectedLifecycle` or `expectedPriority` values.

The validator retains constants that prohibit those fields from reappearing. That is a guardrail, not unfinished frozen-state enforcement.

Disposition:

- preserve exclusion-only behavior;
- do not reopen or duplicate the #2612 repair;
- extend the prohibited inventory fields to include `expectedTeam` if #2725 adds that guard.

### 7. Live repository state requires an execution-time snapshot

Repository files cannot prove the complete live GitHub label catalog or every Issue’s current metadata. #2727 must capture the live API snapshot immediately before mutation.

The snapshot is part of the migration transaction, not an optional report.

## Target queue-label registry

The machine-readable target is:

```text
.github/queue-label-registry.json
```

The registry defines:

- label names, colors, and descriptions;
- exclusivity and applicability rules;
- lifecycle-specific team and priority requirements;
- child-task prohibitions;
- Project Graduation label transitions;
- legacy label treatment;
- ordered migration stages.

The registry is planning authority for #2725–#2727. It is not a live-label bootstrap by itself.

## Legacy-to-target treatment

| Current or legacy state | Treatment | Rule |
| --- | --- | --- |
| `orchestrator` | Preserve | Marker only; no queue authority |
| `status:*` | Preserve during transition | Workflow state only; must not determine team priority |
| `type:*` | Preserve during transition | Classification only |
| `agent:ChatGPT` | Preserve | Assignment metadata only |
| `agent:cursor` | Preserve | Assignment metadata only |
| `agent:codex` | Quarantine | Explicit retirement/remapping decision required |
| `agent:copilot` | Quarantine | Explicit retirement/remapping decision required |
| Pipeline `pmo:priority:idea` | Replace with `eng:priority:idea` | Only after confirming the Issue is a Pipeline parent |
| Pipeline numeric `pmo:priority:*` | Replace with matching `eng:priority:*` only when the PMO decision is unambiguous | Otherwise quarantine |
| Active `pmo:priority:1..4` | Preserve | Add `team:pmo` when authority is unambiguous |
| `pmo:priority:none` | Remove and quarantine | Prohibited; replacement requires a recorded decision |
| Team/priority labels on `pmo:task` | Remove | Child sequence and dependency control execution |
| Multiple `team:*` labels | Quarantine | Do not select a winner automatically |
| Cross-namespace priority | Quarantine | Do not coerce automatically |
| Closed Issue without `pmo:closed` | Quarantine or reconcile from explicit closeout evidence | GitHub state alone does not select historical team/priority |
| Open Issue with `pmo:closed` | Quarantine | Requires close/reopen or lifecycle decision |

## Manual-decision quarantine classes

The migration dry run must produce a separate list for:

1. multiple team owners;
2. missing team owner where lifecycle and source authority do not establish one;
3. Pipeline parent with PMO priority whose intended Engineering priority is not explicitly recorded;
4. Active parent with Engineering priority;
5. `pmo:priority:none`;
6. multiple lifecycle labels;
7. Pipeline parent missing stage;
8. project child missing or conflicting parent reference;
9. project child with team or priority labels where removal would change active assignment semantics;
10. peer Operations or Engineering preparation Issue misclassified as `pmo:task`;
11. Project Graduation residue containing both Engineering and PMO namespaces;
12. terminal-state conflicts;
13. labels or values not defined by either the target registry or the approved transitional-preserve list.

Quarantined records are not mutated until the controlling authority records the missing decision.

## Pre-migration snapshot contract

#2727 must create a durable JSON snapshot before creating or applying labels.

### Snapshot metadata

```json
{
  "repository": "wdhunter645/next-starter-template",
  "sourceIssue": 2727,
  "parentProject": 2702,
  "registryVersion": 1,
  "mainCommit": "40 lowercase hexadecimal characters captured immediately before migration",
  "dashboardGeneratorBlob": "40 lowercase hexadecimal characters",
  "dashboardValidatorBlob": "40 lowercase hexadecimal characters",
  "routingBlob": "40 lowercase hexadecimal characters",
  "capturedAt": "ISO-8601 UTC timestamp",
  "capturedBy": "authenticated migration actor"
}
```

### Label catalog record

For every repository label, capture:

```json
{
  "name": "label-name",
  "color": "six lowercase hexadecimal characters",
  "description": "text or null"
}
```

### Issue record

For every open or closed Issue considered by migration, capture:

```json
{
  "number": 123,
  "title": "Issue title at capture",
  "state": "open",
  "stateReason": "GitHub state reason or null",
  "labels": ["sorted-label-name"],
  "assignees": ["GitHub-login"],
  "milestone": "milestone number or null",
  "updatedAt": "ISO-8601 UTC timestamp",
  "bodyHash": "64 lowercase hexadecimal characters",
  "parentReference": "parsed parent Issue number or null"
}
```

### Generated/runtime evidence

Capture:

- current public dashboard JSON and `generatedAt`;
- current generated dashboard artifact from the migration candidate;
- current orchestrator/queue configuration;
- current Cursor Bridge configuration and claim/consumed-state summary without secrets;
- current required workflow/check conclusions for the exact candidate.

The snapshot must be stored as a workflow artifact or another reviewed, access-controlled evidence location. Do not commit private Issue content or secrets to the public repository.

## Forward migration transaction

### Phase 0: Verify exact candidate

- [ ] Record the exact Promotion Candidate SHA.
- [ ] Confirm candidate is zero commits behind its required base.
- [ ] Confirm #2725 and #2726 independent reviews are complete.
- [ ] Confirm all blocking checks pass.
- [ ] Confirm no unresolved review threads remain.

### Phase 1: Capture snapshot

- [ ] Capture the complete label catalog.
- [ ] Capture all candidate Issue records.
- [ ] Capture current dashboard and routing evidence.
- [ ] Validate snapshot JSON and record its SHA-256 digest.
- [ ] Stop if any required record cannot be read.

### Phase 2: Create missing target labels without applying them

- [ ] Compare live labels to `.github/queue-label-registry.json`.
- [ ] Create only missing target labels with exact color and description.
- [ ] Do not modify existing label color/description unless the migration plan explicitly identifies the change.
- [ ] Re-read the live label catalog and verify every target label exists exactly once.
- [ ] Stop on naming collision, API failure, or unexpected duplicate.

### Phase 3: Dry-run classification

- [ ] Classify every candidate Issue as `unambiguous`, `quarantine`, `excluded`, or `no-change`.
- [ ] Emit proposed before/after labels for every `unambiguous` record.
- [ ] Emit reasons and controlling evidence.
- [ ] Confirm no dry-run operation changes title, body, assignee, state, milestone, or comments.
- [ ] Obtain approval for the dry-run output.

### Phase 4: Apply deterministic batches

Apply in this order:

1. standalone Operations Issues;
2. Active PMO parents;
3. Pipeline parents;
4. valid project child tasks;
5. peer Engineering preparation Issues;
6. no-op verification of excluded and quarantined records.

For each batch:

- [ ] Apply only the approved before/after label delta.
- [ ] Re-read every mutated Issue.
- [ ] Confirm exact expected label set.
- [ ] Regenerate and validate the dashboard where applicable.
- [ ] Run routing dry-run where applicable.
- [ ] Record batch evidence before continuing.

### Phase 5: Integrated verification

- [ ] Dashboard generator and validator pass against live state.
- [ ] Public dashboard JSON reports the expected source and fresh `generatedAt`.
- [ ] Active and Pipeline sorting use their lifecycle-specific priority namespaces.
- [ ] Child-task accounting excludes peer Operations and Engineering preparation Issues.
- [ ] Routing selects numbered Operations first.
- [ ] Monitoring and Hold do not block PMO or Engineering.
- [ ] PMO tasks are selected by parent priority and project sequence.
- [ ] Engineering preparation does not launch implementation.
- [ ] Ambiguous and cross-namespace records fail closed.
- [ ] Scheduled runs do not reintroduce drift.

### Phase 6: Legacy cleanup decision

- [ ] Produce a zero-use report for legacy labels.
- [ ] Do not delete any legacy label automatically.
- [ ] Route label retirement as a separate recorded decision.
- [ ] Preserve historical Issue readability.

## Exact rollback transaction

Rollback is initiated on any stop condition after live mutation begins.

1. Stop all migration writes.
2. Disable the migration workflow or token path used for mutation.
3. For each mutated Issue in reverse batch order:
   - read its current state;
   - compare with the snapshot;
   - restore the exact sorted snapshot label set;
   - do not alter title, body, assignee, milestone, or state unless that field was explicitly part of the approved migration and snapshot;
   - re-read and verify exact restoration.
4. Delete only labels that:
   - were created by this migration;
   - did not exist in the snapshot;
   - have zero current uses;
   - are not required by a merged runtime contract.
5. Revert the runtime promotion commit if the runtime itself caused the failure.
6. Regenerate the dashboard from the restored Issue state.
7. Run dashboard, routing, and CI verification.
8. Record rollback evidence and the unresolved cause on #2727 and #2702.

Rollback is incomplete until every mutated Issue matches its snapshot label set and required operational checks pass.

## Stop conditions

Stop before the next write when any of these occurs:

- snapshot read or digest failure;
- target label collision;
- unknown label namespace;
- unexpected Issue update after snapshot;
- before-state mismatch;
- ambiguous authority;
- multiple team owners;
- cross-namespace priority;
- missing required Pipeline stage;
- child parent-reference defect;
- dashboard generation or validation failure;
- routing dry-run changes queue eligibility unexpectedly;
- required CI failure;
- API partial failure;
- candidate drift;
- inability to prove rollback for the next batch.

## #2725 implementation handoff

### Allowed files

- Modify: `scripts/pmo-dashboard/build-dashboard.mjs`
- Modify: `scripts/pmo-dashboard/validate-dashboard.mjs`
- Modify: `scripts/pmo-dashboard/test-lifecycle-transitions.mjs`
- Modify: `scripts/pmo-dashboard/pmo-tracked-inventory.json` only for schema guardrails or exclusions; never for live expected state
- Create: `scripts/pmo-dashboard/test-queue-label-contract.mjs`
- Modify: `.github/workflows/pmo-dashboard-ci-build.yml` only if invocation or path filters must include the new deterministic test
- Modify: `.github/workflows/pmo-dashboard-ci-deploy.yml` only if validation invocation must change
- Modify: dashboard as-built reference documentation required by the final implementation

### Required interfaces

The generator must emit these parent-row fields:

```json
{
  "teamLabel": "team:pmo",
  "priorityLabel": "pmo:priority:1",
  "priorityDisplay": "1"
}
```

Pipeline example:

```json
{
  "teamLabel": "team:engineering",
  "priorityLabel": "eng:priority:idea",
  "priorityDisplay": "Idea",
  "pipelineStageLabel": "pmo:stage:intake"
}
```

Child rows must emit `teamLabel: null` and `priorityLabel: null`.

### Deterministic test matrix

| Case | Expected result |
| --- | --- |
| Active parent + `team:pmo` + one PMO priority | Active |
| Active parent missing `team:pmo` | Incomplete |
| Active parent with Engineering priority | Incomplete |
| Pipeline parent + `team:engineering` + one Engineering priority + one stage | Pipeline |
| Pipeline `eng:priority:idea` | Pipeline, display `Idea` |
| Pipeline parent with PMO priority | Incomplete |
| Pipeline parent missing stage | Incomplete |
| Child with valid parent, lifecycle, and no team priority | Nested task accounting |
| Child with any `team:*` | Incomplete |
| Child with PMO or Engineering priority | Incomplete |
| Standalone Operations Issue referencing a PMO project | Excluded from PMO rows and task counts |
| Peer Engineering preparation Issue referencing a Pipeline parent | Excluded from PMO rows and task counts |
| Multiple team owners | Incomplete |
| Cross-namespace priority | Incomplete |
| Graduation residue with both Engineering and PMO labels | Incomplete |
| Closed/open lifecycle conflict | Incomplete |
| Frozen inventory lifecycle/team/priority field | Validator failure |
| Live label transition without inventory edit | Live state wins |

### Required commands

```text
node scripts/pmo-dashboard/test-lifecycle-transitions.mjs
node scripts/pmo-dashboard/test-queue-label-contract.mjs
node scripts/pmo-dashboard/build-dashboard.mjs
node scripts/pmo-dashboard/validate-dashboard.mjs site/pmo-dashboard
npm run typecheck
npm test
```

## #2726 implementation handoff

### Allowed files

- Modify: `.github/orchestrator-labels.json`
- Modify: `.github/orchestrator-routing.json`
- Create: `scripts/orchestrator/test-queue-routing.mjs`
- Modify: queue-watch, orchestrator, controller, and Cursor Bridge scripts that directly consume the changed registry
- Create or modify deterministic routing fixtures/tests
- Modify: `docs/ops/github-label-bootstrap.md`
- Modify: routing/Bridge as-built reference documentation required by the final implementation

The implementation PR must enumerate every script path after repository search. Broad wildcard authority is not granted by this plan.

### Required routing order

```text
1. Numbered Operations
2. Active PMO project tasks
3. Engineering preparation
4. Interval updates for Operations Monitoring/Hold without blocking normal work
```

### Required eligibility rules

- exactly one queue owner;
- matching queue priority/state namespace;
- explicit implementation authority for Active tasks;
- valid parent and project sequence for child tasks;
- no automatic Graduation;
- no launch from collaboration metadata alone;
- no duplicate launch for claimed or consumed work;
- fail closed on stale or changed evidence.

### Deterministic test matrix

| Case | Expected result |
| --- | --- |
| Open `team:operations` + `ops:priority:1` | First eligible |
| Open `team:operations` + `ops:monitoring` | Interval update only |
| Open `team:operations` + `ops:hold` | Interval update only |
| PMO P1 parent with next executable child | Eligible after numbered Operations |
| PMO child with team priority | Ineligible |
| Pipeline Engineering P1 parent | Preparation selection only |
| Pipeline Ready for Launch without Go | No implementation launch |
| Collaboration request to Cursor | No ownership transfer |
| Multiple team labels | Ineligible |
| Cross-namespace priority | Ineligible |
| Active claim | No duplicate launch |
| Consumed handoff | No duplicate launch |
| API/auth/read failure | Fail closed |
| Stale snapshot or changed head SHA | Re-evaluate before action |

### Required commands

Exact commands depend on the touched scripts, but the PR must include:

```text
node scripts/orchestrator/test-queue-routing.mjs
node scripts/cursor-bridge/self-check.mjs
bash scripts/cursor-bridge/validate-host-isolated.sh
npm run typecheck
npm test
```

## #2727 promotion and migration handoff

### Required artifacts

- exact candidate SHA;
- required-check report;
- independent review disposition;
- complete pre-migration snapshot and digest;
- dry-run classification report;
- approved quarantine list;
- per-batch mutation log;
- post-batch readback evidence;
- dashboard verification;
- routing verification;
- scheduled-run verification;
- rollback log when invoked;
- final exception report.

### Prohibited actions

- no broad “fix all labels” mutation;
- no mutation without before-state comparison;
- no automatic selection of priority or stage;
- no deletion of legacy labels during the initial migration;
- no state/closeout mutation hidden inside label migration;
- no silent partial success.

## Plan completion criteria

#2724 is complete when:

- [ ] `.github/queue-label-registry.json` is merged.
- [ ] This plan is merged.
- [ ] The baseline inventory and known gaps are independently reviewed.
- [ ] The target registry matches canonical policy.
- [ ] The migration and rollback procedures are executable and exact.
- [ ] #2725 and #2726 file boundaries and test matrices are accepted.
- [ ] #2727 snapshot, dry-run, batching, stop, verification, and rollback gates are accepted.
- [ ] Parent #2702 records that bounded implementation may begin.
- [ ] No live repository labels or existing Issue metadata were mutated by #2724.
