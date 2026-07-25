---
Doc Type: How-To
Audience: Human + AI
Authority Level: Operational Authority
Owns: Operator procedure to run, diagnose, disable, recover, and verify the deterministic agent-routing controller without deleting event identities
Does Not Own: Production authorization, merge to main, or Promotion Candidate approval
Canonical Reference: /docs/reference/ci/agent-routing-controller-contract.md
Related Issues: #2774, #2677, #2676
Last Reviewed: 2026-07-24
---

# Operate the Agent Routing Controller

## Preconditions

- Source authority is an open GitHub Issue with exactly one related component PR.
- Target is a `component/**` branch. Never `main` or Production.
- `config/agent-routing/controller.json` remains `mode: observe-only` and `mutationAllowed: false`.
- Independent review owner remains ChatGPT / Atlas for protected promotion.

## Procedure

### Primary path (event-driven)

1. Dispatch `OPS — Agent Routing Controller` with `operation=route`, exact Issue number, and exact PR number.
2. Inspect the uploaded packet artifact and observability snapshot.
3. When integration is eligible, dispatch `operation=integrate-component` with exact head SHA, component target, and expected target-head SHA.
4. After verified integration, dispatch `operation=closeout-successor` with exact integration SHA and successor Issue number.

One state-changing transition per controller transaction. Re-read live GitHub state before every mutation.

## Reconciliation safety net

Use `OPS — Agent Routing Controller Reconciliation` only when an eligible transaction appears missed or stale.

```bash
node scripts/agent-routing/reconcile.mjs --issue <n> --pr <n> --output reports/agent-routing/reconcile-result.json
```

Rules:

- event-driven remains primary;
- reconciliation never mutates;
- duplicate identities suppress without a second action;
- replay authorized writes only through the event-driven jobs.

## Read-only diagnosis with mutation disabled

To preserve diagnostics while stopping mutation:

1. Set these switches to `false` in `config/agent-routing/controller.json`:
   - `mutationSwitches.remediationInstructions`
   - `mutationSwitches.componentIntegration`
   - `mutationSwitches.closeoutSuccessor`
2. Keep `componentIntegration.enabled` and `closeoutSuccessor.enabled` at `true` so diagnostics still evaluate eligibility; mutation switches alone clear actions.
3. Keep `observability.enabled: true`. Mutation-disabled suppressions emit `mutation_disabled`, not `duplicate_suppression`.
4. Keep `mutationSwitches.reconciliationMutations: false` and `reconciliation.mutationAllowed: false`.
5. Disable or avoid dispatching `ops-agent-routing-reconcile.yml` if the safety net itself should idle.

Route and reconcile runs continue to collect evidence and emit observability without actionable mutation instructions.

## Recovery and replay

1. Do not delete Issue comments, identity markers, logs, or artifacts.
2. Confirm which identity already exists (`response`, `resume`, `escalation`, `integration`, `verification`, `closeout`, `successor`, `reconciliation`).
3. Re-run only the next incomplete authorized transition through the event-driven workflow.
4. If a completed transaction was wrongly repeated, treat the duplicate suppression result as success and stop.

## Operator verification checklist

- [ ] Packet `source` is `github-native` and final reread is attested.
- [ ] Observability includes the expected transition kinds for the stage under test.
- [ ] Protected review path transports PR author and review commit SHA.
- [ ] Self-review, missing PR author, stale commit SHA, and headless approval fail closed.
- [ ] Event-driven and reconciliation results cannot both mutate the same identity.
- [ ] No workflow targets or mutates `main`.
- [ ] Disable rehearsal leaves diagnostics available and mutation instructions empty.

## Rollback

1. Disable all mutation switches and subsystem `enabled` flags as needed.
2. Disable the reconciliation workflow.
3. Revert the #2774 PR from `component/deterministic-handoff-controller` when full rollback is required.
4. Preserve identities and evidence so recovery cannot replay completed transactions.
