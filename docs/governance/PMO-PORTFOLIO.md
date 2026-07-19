---
Doc Type: Governance
Audience: Human + AI
Authority Level: Domain Policy
Owns: PMO intake, work sizing, Medium Model A/B selection, launch authorization, portfolio inventory rules, and authoritative priority decisions
Does Not Own: Delivery execution, CI gate behavior, agent runtime routing, administrative-control mutation procedure, or production merge approval
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Related Issues: #2477, #2487, #2641
Last Reviewed: 2026-07-19
---

# PMO Portfolio

## Purpose

This document is the canonical **PMO and Portfolio** domain policy. It defines how work enters the portfolio, how size is classified, and how Medium work selects Model A or Model B before launch.

Shared delivery metadata values and parser fields live in `docs/reference/pmo/work-size-and-delivery-model-contract.md`. Execution steps live in `docs/how-to/pmo/classify-work-and-select-delivery-model.md`.

Administrative reconciliation of already-authorized PMO state is owned by the Operations and Recovery administrative control lane. That lane may correct PMO labels, parent/child links, lifecycle reporting, and dashboard state only when this policy, a source Issue, or an explicit Bill/Chat decision already establishes the correct value. It must not create or change priority, size, delivery model, launch authority, objectives, or dependency order.

## Intake rule

Every one-off, project, and program enters PMO as:

```text
Size: medium-provisional
```

Classification from evidence must complete before launch authorization. Provisional intake is not a final size.

## Size contract

### Small

Small requires **all** of the following:

- one complete and independently reviewable PR;
- one-step rollback;
- full preview-testable behavior;
- no unresolved architecture decision;
- no protected multi-step boundary;
- no harmful incomplete production state.

### Large

Large is satisfied when **any** of the following is true:

- multiple deployable components;
- multiple planned production promotions;
- multiple architectural or data domains requiring independent release units;
- several protected boundaries;
- a platform migration or repository-wide operating-model change.

### Medium

Medium is everything not objectively Small or Large.

## Medium Model A/B decision

Select **Model A** only when **every** condition is true:

1. The complete solution fits one reviewable PR.
2. The full behavior can be tested before production.
3. Intermediate production state is irrelevant because there is only one promotion.
4. Rollback is one controlled action.
5. No protected multi-step boundary requires isolated integration.

Any failed condition selects **Model B**.

No Medium case may satisfy both Model A and Model B for the same evidence set.

## Emergency exit

Emergency conditions leave the normal sizing tree and route to `emergency-recovery` per `docs/governance/OPERATIONS-AND-RECOVERY.md`.

Emergency routing does not reuse Medium Model A/B logic.

## Portfolio rules

- GitHub program and project issues are the durable portfolio record.
- Bill makes final prioritization decisions; Atlas may recommend elevation when repository risk blocks website build-out.
- Website build-out programs default to Priority #1 unless a repository need materially blocks safe execution.
- Drive notebooks are planning inputs only; repository authority requires issue/PR merge.
- Administrative-control corrections may reconcile PMO metadata to existing authority but must not originate priority, launch, sizing, delivery-model, objective, or sequencing decisions.
- PMO reporting lag is not an execution blocker unless the missing or contradictory metadata prevents authority, dependency, validation, approval, closeout, or collision safety from being determined.
- Independent approved projects may proceed in parallel. PMO and administrative reporting must represent each lane independently and must not create a repository-wide execution lock.

## Administrative control interface

The administrative control lane may:

- reconcile `pmo`, priority, lifecycle, task/project/program, active, queued, blocked, complete, and reporting labels to an authoritative value;
- correct parent/child and program/project references;
- update PMO dashboards and portfolio reports from live Issue and PR state;
- record final clarification and closeout-exception disposition;
- correct stale or contradictory PMO metadata;
- preserve the historical audit trail through comments or bounded exception Issues.

It may not:

- set or change priority without an explicit Bill-authorized or canonical PMO source;
- change work size or delivery model without a completed PMO classification decision;
- launch a project or program;
- change objectives, acceptance criteria, dependencies, or successor order;
- convert reporting preferences into implementation gates.

The stable contract is `docs/reference/operations/administrative-control-lane-contract.md`.

## Canonical references

| Topic | Owner |
| --- | --- |
| Size and delivery-model facts | `docs/reference/pmo/work-size-and-delivery-model-contract.md` |
| Classification procedure | `docs/how-to/pmo/classify-work-and-select-delivery-model.md` |
| Delivery metadata parser | `docs/reference/ci/delivery-profile-contract.md` |
| Administrative control lane | `docs/governance/OPERATIONS-AND-RECOVERY.md` |
| Administrative mutation contract | `docs/reference/operations/administrative-control-lane-contract.md` |
| Program registry and backlog indexes | `docs/ops/pmo/program-registry.md`, `docs/ops/pmo/pmo-backlog.md` |

## Supersession

`docs/ops/pmo/PMO-V4-OPERATING-MODEL.md` is superseded for sizing, Model A/B selection, launch policy, and administrative-control authority. Retained operational detail in that file remains non-authoritative execution context until archived in a later disposition pass.
