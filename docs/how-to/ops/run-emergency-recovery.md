---
Doc Type: How-To
Audience: Human + AI
Authority Level: Procedure
Owns: Step-by-step emergency recovery execution with stabilization-first ordering and mandatory follow-up
Does Not Own: Domain policy, delivery-model selection, PMO sizing, or routine production release procedures
Canonical Reference: /docs/governance/OPERATIONS-AND-RECOVERY.md
Related Issues: #2495
Last Reviewed: 2026-07-13
---

# Run Emergency Recovery

## Purpose

Execute emergency recovery when production is unavailable, unsafe, data is at risk, or service is materially degraded. Emergency recovery is stabilization-first and independent from Model A and Model B.

## Prerequisites

- Impact confirmed — use degraded-service routing in `docs/governance/OPERATIONS-AND-RECOVERY.md` when classification is uncertain
- Conflicting promotions and auto-integration paused
- Chat or Bill available for approval before production-affecting actions
- Emergency issue opened with `Delivery model: emergency-recovery`

## Procedure

### 1. Classify impact

Record on the emergency issue:

- symptom class and user impact;
- data risk level;
- whether production is unsafe or unavailable;
- routing decision: emergency recovery (this procedure), expedited Model A, or planned Model B.

When uncertain, prefer emergency recovery until Chat or Bill confirms a bounded one-PR fix.

### 2. Pause conflicting work

- Hold Model B auto-integration and promotion PRs that could worsen state.
- Do not start new Model A production merges unrelated to stabilization.
- Record pause disposition on affected issues.

### 3. Attempt last-known-good rollback

When rollback alone may restore service:

1. Identify last known good commit or Cloudflare deployment.
2. Obtain Chat or Bill approval for the rollback action.
3. Execute revert or deployment restore.
4. Run targeted recovery verification checks.

If rollback restores safe bounded service, proceed to step 7.

### 4. Apply smallest safe recovery change

When rollback is insufficient:

1. Define the smallest change that restores safe service.
2. Open one recovery PR with stable metadata:

```text
Delivery model: emergency-recovery
Change mode: emergency
Target environment: recovery
Approval profile: emergency-approval
Gate profile: emergency-recovery
Rollback profile: emergency-stabilization
Component branch: not-applicable
Component master: not-applicable
```

3. Record stabilization evidence per `docs/reference/delivery/delivery-and-rollback-profiles.md`.
4. Cursor does not self-approve or merge.

### 5. Obtain emergency approval

Chat or Bill approves the recovery PR before merge. Bill is alternate when Chat is unavailable.

### 6. Verify recovery

Run targeted checks documented in `recovery_verification`. Confirm `production_state_after` is `stabilized`, `degraded-bounded`, or `restored`.

### 7. Create mandatory follow-up work

Before or immediately after merge, link a follow-up issue for:

- root-cause analysis;
- hardening and regression prevention;
- deferred DIATAXIS migration on any touched legacy documents;
- documentation and incident reconciliation.

Emergency recovery does not close without a follow-up issue reference.

### 8. Route post-stabilization work

| Remaining need | Next path |
| --- | --- |
| Single bounded fix | Expedited Model A |
| Structural redesign | Planned Model B |
| Process or ops hardening | `change-ops` or routine ops issue |

Do not continue emergency metadata on follow-up work — use the normal delivery model selected for the fix.

## Verification

```bash
DOCS_HEADER_FILE_LIST=docs/how-to/ops/run-emergency-recovery.md ./scripts/ci/docs_check_headers.sh .
```

Expected: PASS — procedure header and `## Procedure` section present.

## Stop conditions

- Recovery PR uses Model A or Model B metadata instead of `emergency-recovery`
- Production-affecting action without Chat or Bill approval
- Emergency closeout without linked follow-up issue
- Cursor attempts self-approval or merge
- Attempt to auto-integrate emergency work into a component branch
