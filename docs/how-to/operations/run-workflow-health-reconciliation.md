---
Doc Type: How-To
Audience: Human + AI
Authority Level: Operational Authority
Owns: Procedure to run, disable, pilot, and roll back workflow-health reconciliation
Does Not Own: Production promotion, metric contract changes, or GitHub evidence deletion
Canonical Reference: /docs/reference/operations/workflow-health-reconciliation-and-operator-handoff.md
Related Issues: #2680, #2889
Last Reviewed: 2026-08-01
---

# Run workflow-health reconciliation

## Preconditions

- Component branch `component/workflow-health-observability` (or a task branch
  cut from it) contains the #2887–#2889 modules.
- Node.js 22 available locally or in CI.
- Input envelopes are a JSON array of `lgfc-workflow-health-event:v1` objects
  (adapter output or fixture). Live GitHub collection may be supplied by a
  later authorized collector; this procedure does not invent execution
  authority.

## Run a local reconcile pass

```bash
# Optional prior store: { "events": [...], "dailyAggregates": [...] }
export WORKFLOW_HEALTH_STORE_FILE=/tmp/reconcile-store.json
export WORKFLOW_HEALTH_OUT_DIR=site/workflow-health

node scripts/workflow-health/reconcile.mjs path/to/events.json
```

Outputs:

- `site/workflow-health/health-data.json` — five views + reconciliation stamp
- `site/workflow-health/reconcile-store.json` — retained events + daily aggregates
- `site/workflow-health/index.html` — static renderer (copied when present)

## Run the seeded pilot

```bash
node scripts/workflow-health/pilot.mjs
npx vitest run tests/workflow-health/reconcile-retention-pilot.test.mjs
```

Exit code non-zero means a pilot case failed. Do not treat a failed pilot as
authority to change Production or to delete Issues/PRs.

## Disable generation

```bash
export WORKFLOW_HEALTH_DISABLED=1
node scripts/workflow-health/reconcile.mjs path/to/events.json
```

Expected: JSON report with `"disabled": true`, no view rewrite, source events
preserved. Unset the variable to recover.

## Scheduled / CI generation

Workflow: `.github/workflows/workflow-health-reconcile.yml`

- On pull-request / push path changes: runs the deterministic pilot + vitest suite.
- On `schedule` / `workflow_dispatch`: runs the pilot and uploads the generated
  `site/workflow-health` artifact (retention 7 days). Artifact publication is
  reporting only; it does not merge to `main` or promote Production.

## Rollback

1. Revert the component-branch PR that introduced #2889 (or disable via env).
2. Keep authoritative GitHub Issues, PRs, comments, and workflow evidence.
3. Fall back to direct GitHub Issue/PR inspection for operator visibility.
4. Do not delete source evidence to “clean up” derived dashboards.

## Stop conditions

Stop and escalate when:

- a change would introduce a paid monitoring dependency;
- reconciliation would mutate Issues, labels, approvals, or merges;
- missing evidence would be reported as healthy;
- Production promotion is requested without a separate Product Authority Go.
