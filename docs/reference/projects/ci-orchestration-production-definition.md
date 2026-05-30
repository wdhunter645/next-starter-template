---
Doc Type: Reference
Audience: human project owner and AI agents
Authority Level: supporting
Owns: CI Orchestration System production definition, lifecycle model, queue ownership, review and remediation boundaries
Does Not Own: GitHub Actions implementation, branch protection settings, runtime website behavior, or secret configuration
Canonical Reference: docs/explanation/ci/lgfc-ci-production-design.md
Related issues: #1132, #1138, #1075, #1058
Last Reviewed: 2026-05-30
---

# CI Orchestration System Production Definition

## Purpose

The CI Orchestration System controls how LGFC CI redesign work is planned,
issued, reviewed, merged, verified, remediated, and advanced.

Its production goal is to keep repository governance strict while preventing
workflow timing, reviewer timing, or issue-generation timing from deadlocking
valid implementation work.

This package defines who participates, what lifecycle states exist, where each
responsibility belongs, and why the boundaries exist. Implementation agents
determine the workflow and script mechanics from the approved implementation
issues.

## Scope

This production definition covers:

- CI implementation issue lifecycle
- PR lifecycle for CI orchestration work
- agent lifecycle and handoff boundaries
- review lifecycle and reviewer-response gate redesign
- remediation lifecycle
- queue ownership and advancement rules
- post-merge validation model
- acceptance criteria and verification points

This definition does not change workflow files, runtime code, branch protection
rules, Cloudflare behavior, D1/B2 behavior, or website UI.

## Current known truth

The repository already has mature CI architecture sources:

- `docs/explanation/ci/lgfc-ci-production-design.md`
- `docs/how-to/ci/lgfc-ci-implementation-plan.md`
- `docs/how-to/ci/lgfc-ci-orchestration-issue-model.md`
- `docs/reference/ci/lgfc-ci-ci-domain-reference.md`
- `docs/reference/ci/lgfc-ci-implementation-dependency-matrix.md`
- `docs/reference/ci/lgfc-ci-workflow-classification-matrix.md`
- `docs/reference/ci/lgfc-ci-orchestration-engine.md`
- `docs/ops/implementation-plans/issue-1075-ci-redesign-rollout.md`

Those documents define CI design direction, workflow-domain placement,
dependency ordering, and the as-built issue orchestration engine. This #1138
package reconciles them into the #1132 production-definition model.

## Intended final state

The CI Orchestration System is production-ready when:

- one CI implementation issue is active at a time
- each CI issue has one clear source issue, scope, owner, rollback boundary,
  acceptance criteria, and verification path
- each CI PR uses exactly one source issue and one intent lane
- reviewer timing is not a brittle pre-merge blocker
- reviewer intelligence survives merge as post-merge audit evidence
- remediation issues are deterministic, source-linked, and queue-blocking until
  resolved
- queue advancement happens only after merge and post-merge verification are
  stable
- OPS runtime workflows protect production after merge instead of replacing
  merge protection

## Actors

| Actor | Responsibility |
|---|---|
| Project owner | Defines priority, approves production design, and accepts final merge readiness. |
| Orchestrator | Owns queue state, issue generation, dependency checks, pause decisions, and advancement. |
| Cursor agent | Implements scoped CI tasks from generated issues and PR bodies. |
| Codex/Copilot agents | Support governance, documentation, review, remediation, or CI debugging within assigned issues. |
| Human reviewer | Approves merge readiness and resolves judgment-based governance questions. |
| Reviewer bots | Provide asynchronous review findings, advisory analysis, and protected-file signals. |
| Post-merge validators | Inspect what landed on `main` and generate evidence or remediation. |
| OPS runtime monitors | Validate production health, deployment behavior, rollback evidence, and operational recovery. |

## Domain placement

| Domain | Production role | Blocking behavior |
|---|---|---|
| Merge Protection | Protect `main` from deterministic, locally attributable risk | Blocks only catastrophic or machine-provable merge-safety failures |
| PR Hygiene | Correct or report deterministic branch/metadata/documentation defects | Corrective first; advisory when uncertain |
| Review Governance | Preserve reviewer accountability without timing deadlocks | Blocks only unresolved required protected-review failures |
| Post-Merge Validation | Verify what actually landed on `main` | Creates evidence, remediation issues, and rollback recommendations |
| OPS Runtime | Protect live production operations | Detects, retries where safe, escalates, and preserves recovery evidence |

## Issue lifecycle

CI implementation issues follow this lifecycle:

1. `planned`: phase exists in the implementation plan but has not been generated.
2. `queued`: issue exists, dependencies are satisfied or waiting, and it is not
   yet the active implementation head.
3. `active`: issue is the single authorized implementation task.
4. `pr-open`: implementation PR exists and is linked to the issue.
5. `review`: PR is under human or bot review.
6. `merge-ready`: deterministic gates pass, required review requirements are
   satisfied, and no blocking remediation remains.
7. `merged`: PR is merged to `main`.
8. `post-merge-verify`: merged result is being validated against the issue,
   PR body, reviewer findings, and source docs.
9. `complete`: post-merge validation accepted; queue may advance.
10. `blocked`: queue cannot advance because dependency, CI instability,
    remediation, stale issue, duplicate issue, or branch-protection instability
    exists.
11. `failed`: implementation or post-merge validation failed and requires
    remediation or rollback.

The orchestrator may map these conceptual states to repository labels, issue
body markers, comments, or durable state files. The production rule is the same:
only one CI implementation issue may be active at a time.

## PR lifecycle

CI orchestration PRs follow this lifecycle:

1. PR is opened from one generated issue.
2. PR body names exactly one same-repository source issue.
3. PR body states allowed files, forbidden scope, rollback boundary, validation
   commands, and post-merge expectations.
4. PR receives exactly one intent lane.
5. PR Hygiene corrects deterministic formatting/metadata problems or reports
   uncertain problems without inventing scope.
6. Merge Protection evaluates deterministic safety.
7. Reviewer feedback is collected asynchronously.
8. Actionable reviewer findings are addressed or explicitly dispositioned.
9. Human approval occurs only after deterministic safety and required review
   requirements are satisfied.
10. PR merges.
11. Post-merge validation compares the merged result against the issue, PR body,
    reviewer findings, and CI design sources.
12. The source issue closes only after post-merge verification succeeds or a
    remediation path is created and linked.

## Agent lifecycle

Agent work follows a strict handoff model:

1. Orchestrator creates or selects the next issue.
2. Implementation agent reads source docs, issue scope, allowed files, and
   rollback boundary.
3. Agent implements only the assigned issue.
4. Agent opens or updates one PR.
5. Agent records verification commands and results.
6. Reviewer findings are handled in the same PR when they are in scope.
7. Agent does not create the next implementation issue.
8. Post-merge validators or orchestrator decide whether advancement is safe.

Agents must not infer CI scope from chat history, stale archived docs, unrelated
issues, or adjacent open PRs.

## Review lifecycle

Review is divided into deterministic and asynchronous layers.

Deterministic review includes:

- source issue accounting
- file allowlist compliance
- docs-only or code-change intent consistency
- secret and ZIP safety
- syntax, type, test, or build checks where applicable
- protected workflow or configuration boundaries

Asynchronous review includes:

- Copilot, Gemini, Cubic, Codex, or future reviewer findings
- advisory design observations
- non-catastrophic maintainability suggestions
- post-merge reviewer audit evidence

The system must preserve reviewer findings, but reviewer timing itself must not
become a merge-safety proxy.

## Reviewer-response gate redesign

The reviewer-response gate must move from brittle synchronous enforcement to
state-aware governance.

Pre-merge reviewer enforcement may block only when:

- a required protected-file review is missing
- requested changes from a required reviewer remain unresolved
- a security, secret, destructive-action, or protected-configuration finding is
  unresolved
- the PR materially changed reviewed protected scope after required review

Pre-merge reviewer enforcement must not block solely because:

- a bot has not posted yet
- a rerun changed workflow timing
- a metadata-only commit changed the head SHA
- a previous valid reviewer artifact is older than an unrelated CI rerun
- all findings are dispositioned but a bot timing artifact is absent

Post-merge reviewer audit must:

- collect review comments and inline findings
- compare findings against the merged diff
- identify unresolved, rejected, outdated, or accepted dispositions
- create remediation when accepted fixes did not land
- preserve evidence for human audit

## Remediation lifecycle

Remediation exists to handle failures without corrupting the main queue.

1. Failure detected by merge gate, reviewer audit, post-merge validation, OPS
   runtime check, or human review.
2. Orchestrator pauses advancement when the failure affects queue safety.
3. Remediation issue is created or updated with source PR, source issue,
   evidence, failure class, affected files or workflows, and recovery criteria.
4. Remediation owner is assigned.
5. Remediation PR is opened from the remediation issue.
6. Validation confirms the failure is resolved.
7. Post-remediation verification records evidence.
8. Queue advancement resumes only after the blocking condition is cleared.

Remediation must be deterministic and source-linked. It must not create broad
cleanup work without a specific failure or acceptance target.

## Queue ownership

The orchestrator owns:

- phase ordering
- duplicate issue detection
- active issue detection
- dependency checks
- pause and remediation decisions
- queue advancement after post-merge verification

Implementation agents own:

- scoped changes for the active issue
- PR body accuracy
- validation evidence
- reviewer-response disposition for in-scope findings

Post-merge validators own:

- merged-state evidence
- implementation completeness checks
- reviewer audit checks
- remediation trigger decisions

Humans own:

- final approval
- priority changes
- judgment calls when docs, issues, and workflow behavior conflict

## Post-merge validation model

Post-merge validation verifies reality on `main`, not intent on the PR branch.

Required evidence:

- merged commit and source PR
- source issue and parent program issue
- changed files
- gate results
- reviewer findings and dispositions
- implementation acceptance criteria
- rollback boundary
- follow-up or remediation decisions

Validation outcomes:

- `accepted`: source issue may close and queue may advance
- `accepted-with-follow-up`: queue may advance only if follow-up is non-blocking
- `remediation-required`: queue pauses until remediation clears
- `rollback-recommended`: queue pauses and human review is required

## Acceptance criteria

The production CI Orchestration System is acceptable when:

- issue lifecycle is documented and compatible with one-active-issue execution
- PR lifecycle is documented and enforces one source issue
- agent lifecycle prevents scope invention and queue skipping
- review lifecycle separates deterministic merge safety from asynchronous review
  intelligence
- reviewer-response gate redesign removes timing deadlocks while preserving
  protected-review enforcement
- remediation lifecycle is source-linked, evidence-driven, and queue-blocking
  only when appropriate
- queue ownership is explicit
- post-merge validation gates queue advancement
- implementation phases map to the existing dependency matrix and rollout plan
- acceptance criteria and verification points are defined before implementation

## Verification points

Before implementation:

- source issue exists and is open
- no other active CI implementation issue conflicts
- source docs are current
- allowed files and forbidden scope are explicit
- rollback boundary exists

During PR review:

- one source issue is present
- one intent lane is present
- changed files match allowlist
- deterministic gates pass or have actionable failures
- reviewer findings are dispositioned

After merge:

- merged commit exists on `main`
- post-merge checks ran or were intentionally skipped with rationale
- reviewer audit evidence is recorded
- remediation status is clear
- source issue is closed or left open with an explicit blocker
- next queue item is created only after stability is confirmed

## Non-goals

This package does not implement GitHub Actions, change branch protection,
modify scripts, change runtime code, alter website behavior, or migrate legacy
documentation.
