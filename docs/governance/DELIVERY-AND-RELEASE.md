---
Doc Type: Governance
Audience: Human + AI
Authority Level: Domain Policy
Owns: Model A production delivery, Model B child integration and promotion, approval profiles, rollback policy boundaries, and release-unit promotion rules
Does Not Own: Agent role contracts, PMO sizing, CI gate implementation, environment isolation proof, or emergency stabilization procedures
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Related Issues: #2495, #1723
Last Reviewed: 2026-07-16
---

# Delivery and Release

## Purpose

This document is the canonical **Delivery and Release** domain policy. It defines how work reaches production through Model A direct delivery or Model B component construction and promotion, which approval profiles apply at each boundary, and how rollback profiles differ by delivery model.

Stable metadata values and classification invariants live in `docs/reference/ci/delivery-profile-contract.md`. Rollback evidence schemas live in `docs/reference/delivery/delivery-and-rollback-profiles.md`. Execution procedures live in `docs/how-to/delivery/run-model-a-release.md` and `docs/how-to/delivery/run-model-b-component-release.md`.

## Mutually exclusive delivery models

Every change uses **exactly one** delivery model. Models do not overlap for the same release unit.

| Model | When used | Production boundary | Rollback profile |
| --- | --- | --- | --- |
| **Model A** | Small or Medium work that fits one reviewable production PR | Single PR to `main` | `one-step` |
| **Model B child** | Bounded increment into a component branch | Component branch only — not production | `multi-step` (component scope) |
| **Model B promotion** | Final release-unit promotion after integrated component evidence | One promotion PR from `component/*` to `main` | `multi-step` (release-unit scope) |
| **Emergency recovery** | Production unavailable, unsafe, or materially degraded | Stabilization-first recovery path | `emergency-stabilization` |

Rules:

- Model A PRs target `main` and must not carry component-branch metadata.
- Model B child PRs target `component/<release-unit>` and must not claim production readiness.
- Model B promotion PRs introduce **no new feature implementation** — only integrated evidence and release activation.
- Emergency recovery does not reuse Model A or Model B sizing logic and does not auto-integrate into component branches.

PMO selects the model per `docs/governance/PMO-PORTFOLIO.md`. Agent execution roles remain in `docs/governance/AGENT-TEAM.md`.

## Model A — direct production delivery

Model A is the direct path for complete, reviewable changes that fit one production PR.

### Requirements

- One source issue and one implementation PR targeting `main`.
- `Delivery model: A`, `Target environment: production`, `Rollback profile: one-step`.
- Full behavior testable in preview before merge.
- Chat or Bill approval before production merge; Chat is primary.
- One-step rollback plan recorded before implementation.

### One-step rollback

Rollback is **one controlled action**:

1. Revert the production merge commit; or
2. Restore the previous known-good Cloudflare Pages deployment.

Targeted smoke tests confirm recovery. No ordered multi-component rollback package is required.

### Approval and gates

| Field | Value |
| --- | --- |
| Approval profile | `chat-bill-production` |
| Gate profile | `production-candidate` |
| Component branch | `not-applicable` |
| Component master | `not-applicable` |

## Model B — component construction and promotion

Model B builds a cohesive release unit on a non-production component branch before one controlled production promotion.

### Component branch structure

```text
component/<release-unit>     — integration branch (for example component/delivery-system-v1)
cursor/<issue>-<task>-2e48   — child implementation branch
child PR base                — component/<release-unit>
promotion PR head            — component/<release-unit>
promotion PR base            — main
```

### Model B child integration

Child PRs integrate bounded increments into the component branch.

| Field | Value |
| --- | --- |
| Delivery model | `B-child` |
| Target environment | `component` |
| Gate profile | `component-child` |
| Rollback profile | `multi-step` |
| Approval profile | `component-auto-integration` when no protected paths change; `protected-change-review` when protected paths change |

Child PRs do **not** require whole-feature production approval, production closeout prediction, or final Operations documentation closeout.

Protected-change child PRs require Chat review before integration. Cursor must not self-approve protected child work.

Governance documentation on an authorized project component branch is version-controlled project work. Edits under `docs/governance/**` (or other documentation paths) do **not** by themselves select `protected-change-review` or create an intermediate human gate. See `/docs/governance/PR_PROCESS.md` documentation authority levels.

### Model B promotion

Promotion activates production after all intended child increments are integrated and verified.

| Field | Value |
| --- | --- |
| Delivery model | `B-promotion` |
| Target environment | `production` |
| Gate profile | `component-promotion` |
| Rollback profile | `multi-step` |
| Approval profile | `chat-bill-production` |

Promotion prerequisites:

- all intended child PRs integrated into the component branch;
- integrated release-candidate testing complete;
- component branch synchronized with current `main`;
- multi-step rollback package finalized before promotion opens;
- as-designed, as-built, and Operations documentation complete;
- Chat or Bill approval; Chat is primary.

The promotion PR must introduce no new feature implementation.

### Multi-step rollback

Model B rollback is designed **before implementation begins** and finalized **before promotion**.

The rollback package must define, at minimum:

- feature disablement or traffic isolation;
- external-write stop controls;
- configuration restoration;
- compatible data restoration or migration reversal;
- previous deployment restoration;
- dependency rollback order;
- verification after rollback;
- issue, documentation, and incident reconciliation.

See `docs/reference/delivery/delivery-and-rollback-profiles.md` for the evidence schema.

## Approval summary

| Boundary | Primary approver | Alternate | Auto-integration |
| --- | --- | --- | --- |
| Model A production merge | Chat | Bill | No |
| Model B child (non-protected) | Chat (review when required) | Bill | Yes when eligibility checks pass |
| Model B child (protected) | Chat | Bill | No — blocked until Chat review |
| Model B promotion | Chat | Bill | No |
| Emergency recovery | Chat | Bill | No |

Cursor implements and remediates but never approves or merges its own work. Cursor does not merge to `main`.

## Protected changes

The following child changes require Chat review before component integration:

- destructive or non-backward-compatible database migration;
- authentication or authorization boundary;
- secret or credential handling;
- deployment workflow or production binding;
- branch protection or governance enforcement;
- irreversible external-service mutation.

Documentation-only edits, including governance documentation, are **not** listed above and do not inherit protected-change status merely from folder location. Program `#1719` Tasks `#1723` and `#1724` follow `component-auto-integration` on the project component branch; repository-wide authority still requires Bill/ChatGPT-approved promotion to `main`.

The protected-path baseline is defined in `docs/reference/ci/delivery-profile-contract.md`.

## Canonical references

| Topic | Owner |
| --- | --- |
| Delivery metadata and classification | `docs/reference/ci/delivery-profile-contract.md` |
| Rollback profiles and evidence schema | `docs/reference/delivery/delivery-and-rollback-profiles.md` |
| Model A release procedure | `docs/how-to/delivery/run-model-a-release.md` |
| Model B component release procedure | `docs/how-to/delivery/run-model-b-component-release.md` |
| PMO sizing and model selection | `docs/governance/PMO-PORTFOLIO.md` |
| Agent approval authority | `docs/governance/AGENT-TEAM.md` |
| Operations, degradation, and emergency recovery | `docs/governance/OPERATIONS-AND-RECOVERY.md` |

## Supersession

`docs/governance/standards/change-control_MASTER.md` is superseded for delivery-model selection, production approval routing, and rollback profile policy. Retained change-mechanics detail in that file remains non-authoritative execution context until archived in a later disposition pass.
