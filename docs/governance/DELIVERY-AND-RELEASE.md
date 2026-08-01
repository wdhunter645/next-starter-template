---
Doc Type: Governance
Audience: Human + AI
Authority Level: Domain Policy
Owns: Delivery models, Sandbox/Development/Promotion Candidate/Production profiles, integration and promotion boundaries, approval profiles, rollback policy, and release-unit promotion rules
Does Not Own: Current team-member assignments, PMO sizing, CI implementation, environment-isolation proof, or emergency stabilization procedures
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Related Issues: #2495, #2640, #2641, #2622
Last Reviewed: 2026-07-30
---

# Delivery and Release

## Purpose

This document defines how approved work moves from experimentation or implementation into public production use.

- **Delivery models** define the shape of the release unit.
- **Promotion profiles** define the increasing control applied as work approaches Production.

Stable role names are used throughout. Current people and agents are mapped in `docs/governance/AGENT-TEAM.md` or the project manifest.

Canonical profile definitions live in `docs/reference/operations/operating-lanes-and-promotion-profiles.md`.

## Promotion profiles

### Sandbox

Sandbox is an optional, isolated PMO / Engineering proof-of-concept profile, and the fastest of the three non-production admission tiers (#2622).

- remote isolated `sandbox/*` branch, created from the current Development base on first use;
- required gate: the repository's secret scan (`gitleaks`) only — no universal build, typecheck, lint, test, reviewer, documentation, design-authority, PR-hygiene, or diff-scope gate is required for Sandbox admission;
- the required gate executes synchronously inside the same authorized controller run that creates the PR, not as a separate `pull_request`-triggered workflow (`docs/governance/CI-AND-VERIFICATION.md` owns why);
- eligible work records `APPROVED FOR SANDBOX ADMISSION` and automatically merges into the Sandbox target once the required inline check passes; a failing or unavailable required check blocks merge and leaves durable evidence on the source Issue;
- no production credentials, writes, or bindings;
- no direct path to Promotion Candidate or Production;
- output may be discarded, retained as evidence, or adopted into Development.

### Development

Development is the primary Model B implementation profile, and the second non-production admission tier (#2622).

- work targets a non-production component branch (including a dedicated `component/<release-unit>` branch);
- required gates: the Sandbox secret scan plus the repository's existing `quality` implementation (its current class-aware build/typecheck/lint/test behavior), both executing synchronously inside the same authorized controller run;
- current PR hygiene, diff scope, reviewer-response, design-authority, and documentation findings remain advisory in Development unless a source Issue explicitly promotes one for a bounded change;
- eligible non-protected work records `APPROVED FOR DEVELOPMENT ADMISSION` and automatically merges into the component branch once the required inline gates pass; a failing or unavailable required gate blocks merge;
- protected or material design concerns route to PR Approver / Engineering;
- independent work may continue while prior work is review- or administration-pending.

Sandbox output must enter Development before it can become a Promotion Candidate.

### Promotion Candidate

Promotion Candidate is the mandatory release barrier between Development and Production.

The exact integrated candidate identity must be recorded. Applicable release qualification includes:

- integrated acceptance and regression testing;
- load and performance testing;
- security and privacy validation;
- migration and data-integrity validation;
- failure-path, resilience, and recovery testing;
- deployment and rollback rehearsal;
- operational-readiness and monitoring validation;
- planned-versus-built and unresolved-gap review;
- documentation and repository-standards reconciliation;
- manual Go/No-Go by the required roles.

A material failure returns the candidate to Development. A solution that legitimately changes repository standards must reconcile those standards before Production Go.

### Production

Production is the controlled path to `main`, deployment, live verification, and public use.

- full repository standards apply;
- the approved candidate identity must not drift;
- applicable manual production authority is required;
- rollback readiness and production bindings are verified;
- deployment is controlled and followed by live health verification;
- failure enters containment, rollback, or Day-2 Operations.

## Mandatory transitions

Allowed:

```text
Sandbox -> Development
Development -> Promotion Candidate
Promotion Candidate -> Development
Promotion Candidate -> Production
Production -> Day-2 Operations
```

Prohibited:

```text
Sandbox -X-> Promotion Candidate
Sandbox -X-> Production
Development -X-> Production
```

The profiles progressively narrow work into full repository alignment. They are not interchangeable labels.

## Delivery models

Every release unit uses exactly one delivery model.

| Model | When used | Profile path | Rollback profile |
| --- | --- | --- | --- |
| Model A | Small or Medium work that fits one reviewable production PR | Promotion Candidate -> Production | `one-step` |
| Model B child | Bounded increment into a component branch | Development only | `multi-step` component scope |
| Model B promotion | Final integrated release-unit promotion | Promotion Candidate -> Production | `multi-step` release-unit scope |
| Emergency recovery | Production unavailable, unsafe, or materially degraded | Day-2 Operations -> Development/Promotion Candidate/Production as risk requires | `emergency-stabilization` |

Rules:

- Model A PRs target `main`, but the PR must still satisfy the Promotion Candidate profile before Production merge.
- Model B child PRs target `component/<release-unit>` and must not claim Production readiness.
- Model B promotion PRs contain the exact integrated candidate and release evidence; they introduce no unqualified feature implementation.
- Emergency recovery follows stabilization-first authority and must not bypass required release qualification unless emergency policy explicitly authorizes the bounded exception.

PMO / Engineering selects the delivery model under `docs/governance/PMO-PORTFOLIO.md`.

## Model A — direct release unit

Model A is a single reviewable change whose PR itself becomes the Promotion Candidate.

Requirements:

- one primary source Issue;
- one implementation PR targeting `main`;
- full behavior testable before merge;
- Promotion Candidate validation complete;
- PR Approver / Engineering approval;
- Production authority recorded;
- one-step rollback prepared.

One-step rollback is one controlled action:

1. revert the production merge commit; or
2. restore the previous known-good deployment.

Targeted smoke tests confirm recovery.

## Model B — component construction and promotion

Model B builds a cohesive release unit on a non-production component branch before one controlled Production promotion.

### Branch structure

```text
component/<release-unit>     — Development integration branch
<agent>/<issue>-<task>       — child implementation branch
child PR base                — component/<release-unit>
promotion PR head            — exact approved component candidate
promotion PR base            — main
```

### Development child integration

| Field | Value |
| --- | --- |
| Delivery model | `B-child` |
| Profile | `development` |
| Target environment | `component` |
| Gate profile | `component-child` |
| Rollback profile | `multi-step` |
| Approval profile | automated non-main eligibility when non-protected; Engineering review when protected or material |

Child PRs do not require whole-feature Production approval or final release closeout.

Deterministic CI may record automated eligibility and enable non-main integration. It must not impersonate a human Engineering decision. Implementation / Operations must not self-approve protected work.

### Promotion Candidate construction

The candidate is an exact component-branch identity selected after intended Development increments are integrated.

Prerequisites:

- intended Development work integrated;
- candidate scope frozen or identified;
- integrated release qualification complete;
- component branch synchronized with current `main`;
- rollback package finalized;
- as-designed, as-built, Operations, and user-facing documentation complete where applicable;
- repository standards reconciled;
- unresolved gaps explicitly dispositioned;
- required Go/No-Go recorded.

### Production promotion

| Field | Value |
| --- | --- |
| Delivery model | `B-promotion` |
| Profile | `production` |
| Target environment | `production` |
| Gate profile | `component-promotion` |
| Rollback profile | `multi-step` |
| Approval profile | required Engineering and Production authority |

The Production PR must promote the exact approved candidate and introduce no new feature implementation.

## Multi-step rollback

Model B rollback is designed before implementation and finalized before Production promotion.

The rollback package defines, as applicable:

- feature disablement or traffic isolation;
- external-write stop controls;
- configuration restoration;
- compatible data restoration or migration reversal;
- previous deployment restoration;
- dependency rollback order;
- verification after rollback;
- Issue, documentation, incident, and Administration & Communications reconciliation.

## Approval summary

| Boundary | Decision authority | Automated integration |
| --- | --- | --- |
| Sandbox experiment | PMO / Engineering | Yes — automatic merge into the isolated Sandbox target once the required inline secret scan passes |
| Development child, non-protected | Deterministic CI eligibility under Delivery policy | Yes — automatic merge to the non-main component branch once the required inline secret-scan and quality gates pass |
| Development child, protected/material | PR Approver / Engineering | No until approval |
| Promotion Candidate Go/No-Go | PMO / Engineering, PR Approver / Engineering, and other required roles | No |
| Production promotion | Production authority plus required Engineering approval | No |
| Emergency recovery | Day-2 Operations and required protected authority | Only pre-authorized deterministic recovery actions |

Implementation / Operations implements and remediates but does not approve its own protected work or Production promotion.

## Protected changes

Protected or material changes require PR Approver / Engineering review before Development integration or Production promotion, including:

- destructive or non-backward-compatible database migration;
- authentication or authorization boundary;
- secret or credential handling;
- deployment workflow or production binding;
- branch protection or governance enforcement;
- irreversible external-service mutation;
- material architecture or acceptance-criteria change.

## Canonical references

| Topic | Owner |
| --- | --- |
| Lane and promotion-profile contract | `docs/reference/operations/operating-lanes-and-promotion-profiles.md` |
| Delivery metadata and classification | `docs/reference/ci/delivery-profile-contract.md` |
| Rollback profiles and evidence | `docs/reference/delivery/delivery-and-rollback-profiles.md` |
| Profile operating procedure | `docs/how-to/operations/run-work-through-promotion-profiles.md` |
| PMO sizing and model selection | `docs/governance/PMO-PORTFOLIO.md` |
| Role mapping and approval authority | `docs/governance/AGENT-TEAM.md` |
| Operations, degradation, and recovery | `docs/governance/OPERATIONS-AND-RECOVERY.md` |

## Supersession

This policy supersedes any lower-level instruction that permits Sandbox or Development work to move directly to Production or that treats component integration as Production approval.