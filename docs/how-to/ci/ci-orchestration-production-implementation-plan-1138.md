---
Doc Type: How-To
Audience: human project owner and AI agents
Authority Level: supporting
Owns: issue #1138 CI Orchestration System documentation package implementation plan and verification checklist
Does Not Own: GitHub Actions implementation, workflow code, branch protection settings, or runtime behavior
Canonical Reference: docs/reference/projects/ci-orchestration-production-definition.md
Related issues: #1132, #1138, #1075, #1058
Last Reviewed: 2026-05-30
---

# CI Orchestration Production Package Implementation Plan

## Purpose

This plan defines how the #1138 CI Orchestration System production design
package should be used to guide implementation work without modifying workflow
code in the documentation PR.

It bridges the production definition, existing CI design documents, and the
issue #1075 CI redesign rollout plan.

## Scope

This plan covers:

- documentation package completion for issue #1138
- implementation sequencing for future CI orchestration work
- lifecycle and verification checkpoints future implementation issues must carry
- acceptance criteria for converting the design package into implementation
  issues

This plan does not authorize runtime code, workflow YAML, script, branch
protection, or website changes.

## Current known truth

- CI architecture already separates merge protection, PR hygiene, post-merge
  validation, and OPS runtime domains.
- The as-built CI orchestration engine exists and uses a serial issue model.
- The issue #1075 rollout plan decomposes CI redesign into six implementation
  tasks.
- The #1138 package defines lifecycle and ownership expectations for production
  use; implementation issues must still be generated and executed separately.

## Intended final state

Future CI implementation issues can be generated directly from the production
definition and this plan without requiring an agent to infer missing lifecycle,
review, remediation, queue, or verification requirements.

## Source documents

Use these sources in this order:

1. `docs/reference/projects/ci-orchestration-production-definition.md`
2. `docs/explanation/ci/lgfc-ci-production-design.md`
3. `docs/how-to/ci/lgfc-ci-implementation-plan.md`
4. `docs/how-to/ci/lgfc-ci-orchestration-issue-model.md`
5. `docs/reference/ci/lgfc-ci-ci-domain-reference.md`
6. `docs/reference/ci/lgfc-ci-implementation-dependency-matrix.md`
7. `docs/reference/ci/lgfc-ci-workflow-classification-matrix.md`
8. `docs/reference/ci/lgfc-ci-orchestration-engine.md`
9. `docs/ops/implementation-plans/issue-1075-ci-redesign-rollout.md`

## Execution

Use this package in three passes:

1. Confirm the production definition is current before creating CI
   implementation issues.
2. Generate or update exactly one implementation issue for the next eligible CI
   lifecycle phase.
3. After that issue merges, run post-merge validation before advancing the
   queue.

If any blocking remediation exists, stop issue generation and resolve the
remediation path first.

## Milestones

| Milestone | Output | Acceptance gate |
|---|---|---|
| 1. Documentation package accepted | Production definition and implementation plan merged | Docs checks pass; source issue #1138 linked |
| 2. Lifecycle normalization for issues | Generated CI issues carry lifecycle states and queue markers | One active issue rule enforced |
| 3. PR lifecycle normalization | CI PRs require one source issue, one intent lane, allowlist, rollback, and verification | PR issue accounting and drift checks pass |
| 4. Agent lifecycle normalization | Agent handoff and ownership rules are embedded in generated issues | No scope invention or queue skipping |
| 5. Review lifecycle redesign | Reviewer timing no longer deadlocks valid PRs | Required protected findings still block |
| 6. Remediation lifecycle rollout | Remediation issues are deterministic, source-linked, and queue-aware | Queue pauses only on blocking remediation |
| 7. Post-merge validation rollout | Merged result is verified before queue advancement | Accepted or remediation-required outcome recorded |
| 8. As-built reconciliation | Final workflow behavior is documented after implementation | As-built docs match merged workflow behavior |

## Implementation issue requirements

Every future CI orchestration implementation issue must include:

- source issue and parent program issue
- CI domain
- lifecycle phase
- exact objective
- allowed files
- forbidden scope
- rollback boundary
- acceptance criteria
- verification commands
- post-merge verification expectations
- remediation behavior
- queue advancement rule

## Lifecycle implementation order

### 1. Lifecycle of issues

Implement or validate:

- state markers for planned, queued, active, PR open, review, merge-ready,
  merged, post-merge verify, complete, blocked, and failed
- duplicate issue prevention
- stale active issue detection
- failed issue pause behavior
- dependency gating

Verification points:

- engine dry run identifies the correct next phase
- duplicate marker prevents duplicate issue creation
- failed or stale issue pauses advancement

### 2. PR lifecycle

Implement or validate:

- one source issue in PR body
- exact file allowlist
- intent lane consistency
- rollback boundary
- validation evidence
- post-merge expectation section

Verification points:

- PR issue accounting passes
- drift gate agrees with allowed files
- docs-only PRs do not include workflow/runtime files

### 3. Agent lifecycle

Implement or validate:

- generated issues include agent ownership
- agent handoff forbids scope inference
- agent output requires verification evidence
- next issue creation is reserved for orchestrator/post-merge advancement

Verification points:

- issue body contains owner, lane, scope, and forbidden scope
- PR body includes implementation summary and validation results
- no agent creates follow-up implementation issues directly

### 4. Review lifecycle

Implement or validate:

- deterministic checks remain separate from asynchronous review
- protected-file findings remain enforceable
- advisory findings remain audit evidence unless promoted by policy
- review dispositions are captured in PR body or post-merge audit evidence

Verification points:

- required protected findings block when unresolved
- bot timing alone does not block
- post-merge audit can find unresolved accepted findings

### 5. Reviewer-response gate redesign

Implement or validate:

- reviewer validity persists across unrelated reruns
- meaningful reviewed-state changes invalidate prior review state
- metadata-only or timing-only changes do not force deadlock
- late reviewer findings become post-merge audit/remediation input

Verification points:

- rerun without diff change does not invalidate review
- protected-file diff change requires renewed review or explicit evidence
- late accepted finding creates remediation if not implemented

### 6. Remediation lifecycle

Implement or validate:

- remediation issue marker
- source issue and source PR linkage
- failure class
- evidence payload
- recovery criteria
- queue-blocking status

Verification points:

- blocking remediation prevents next issue advancement
- non-blocking follow-up is documented without pausing unrelated work
- remediation closure records validation evidence

### 7. Queue ownership

Implement or validate:

- orchestrator owns advancement
- implementation agent owns scoped PR delivery
- post-merge validator owns merged-state evidence
- human owner resolves priority or authority conflicts

Verification points:

- only one CI implementation issue is active
- dependency matrix controls phase order
- queue resumes only after post-merge verification succeeds

### 8. Post-merge validation model

Implement or validate:

- merged commit evidence
- source issue evidence
- changed-file evidence
- reviewer audit evidence
- implementation acceptance evidence
- remediation or rollback recommendation

Verification points:

- accepted merge closes or advances source issue
- remediation-required outcome pauses queue
- rollback-recommended outcome requires human review

## Acceptance criteria

This #1138 documentation package is complete when:

- production definition exists in `docs/reference/projects/`
- implementation plan exists in `docs/how-to/ci/`
- package defines issue, PR, agent, review, reviewer-response, remediation,
  queue, and post-merge lifecycles
- package links to #1138 as primary source issue
- package preserves existing CI source hierarchy
- package does not edit workflow, runtime, or PR #1148-owned files
- docs header and canonical hash checks pass

## Verification commands

For the #1138 documentation PR:

```bash
./scripts/ci/docs_check_headers.sh .
./scripts/ci/docs_canonical_hashes_verify.sh .
npm run check:structure
git diff --check
```

Future implementation issues may add workflow-specific tests, type checks, or
build checks according to their allowed files and risk.

## PR checklist for issue #1138

- PR body uses `- **Issue**: #1138`
- PR changes documentation only
- PR does not modify `.github/workflows/**`
- PR does not modify runtime app, API, component, or script files
- PR does not modify `docs/reference/documentation-gap-analysis-1132.md`
- PR includes source documents used
- PR includes reviewer-response accounting if reviewers comment

## Completion rule

Once this documentation package merges and the repository checks confirm that
the package is discoverable, source-linked, and docs-only, issue #1138 may
close.
