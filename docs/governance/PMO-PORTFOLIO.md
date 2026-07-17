---
Doc Type: Governance
Audience: Human + AI
Authority Level: Domain Policy
Owns: PMO intake, work sizing, Medium Model A/B selection, launch authorization, portfolio inventory rules, and emergency exit from the normal sizing tree
Does Not Own: Delivery execution, CI gate behavior, agent runtime routing, or production merge approval
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Related Issues: #2477, #2487
Last Reviewed: 2026-07-13
---

# PMO Portfolio

## Purpose

This document is the canonical **PMO and Portfolio** domain policy. It defines how work enters the portfolio, how size is classified, and how Medium work selects Model A or Model B before launch.

Shared delivery metadata values and parser fields live in `docs/reference/pmo/work-size-and-delivery-model-contract.md`. Execution steps live in `docs/how-to/pmo/classify-work-and-select-delivery-model.md`.

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

Emergency conditions leave the normal sizing tree and route to `emergency-recovery` per `docs/governance/OPERATIONS-AND-RECOVERY.md` (target policy; see disposition map until Task 5 lands).

Emergency routing does not reuse Medium Model A/B logic.

## Portfolio rules

- GitHub program and project issues are the durable portfolio record.
- Bill makes final prioritization decisions; Atlas may recommend elevation when repository risk blocks website build-out.
- Website build-out programs default to Priority #1 unless a repository need materially blocks safe execution.
- Drive notebooks are planning inputs only; repository authority requires issue/PR merge.

## Canonical references

| Topic | Owner |
| --- | --- |
| Size and delivery-model facts | `docs/reference/pmo/work-size-and-delivery-model-contract.md` |
| Classification procedure | `docs/how-to/pmo/classify-work-and-select-delivery-model.md` |
| Delivery metadata parser | `docs/reference/ci/delivery-profile-contract.md` |
| Program registry and backlog indexes | `docs/ops/pmo/program-registry.md`, `docs/ops/pmo/pmo-backlog.md` |

## Supersession

`docs/ops/pmo/PMO-V4-OPERATING-MODEL.md` is superseded for sizing, Model A/B selection, and launch policy. Retained operational detail in that file remains non-authoritative execution context until archived in a later disposition pass.
