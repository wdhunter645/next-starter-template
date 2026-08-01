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

## Procedure

### Run a local reconcile pass

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

A reconcile pass exits non-zero when any incoming envelope is rejected as
malformed, or when the prior store contains corrupt envelopes. A partial view
is never persisted as a successful pass.

### Keep idle/pickup visibility inside one watcher interval

The informational watcher interval is five minutes. Do **not** schedule the
GitHub Actions workflow every five minutes. Instead, invoke the local hook from
the Cursor wake (5m) or check-in (12m) loops:

```bash
export WORKFLOW_HEALTH_STORE_FILE=/tmp/reconcile-store.json
export WORKFLOW_HEALTH_OUT_DIR=site/workflow-health
node scripts/workflow-health/local-watcher-reconcile.mjs path/to/events.json
```

This rebuilds derived views at watcher cadence while the Actions job remains a
six-hour reporting artifact refresh.

### Run the seeded pilot

```bash
node scripts/workflow-health/pilot.mjs
npx vitest run tests/workflow-health/reconcile-retention-pilot.test.mjs
```

Exit code non-zero means a pilot case failed. Do not treat a failed pilot as
authority to change Production or to delete Issues/PRs.

### Disable generation

```bash
export WORKFLOW_HEALTH_DISABLED=1
node scripts/workflow-health/reconcile.mjs path/to/events.json
```

Expected: JSON report with `"disabled": true`, no view rewrite, source events
preserved. Unset the variable to recover. In CI, set the repository variable
`WORKFLOW_HEALTH_DISABLED` (`1`, `true`, or `yes`); the scheduled workflow
reads the runtime disable decision from the reconcile step and skips store
persistence and artifact upload while disabled.

## Scheduled / CI generation

Workflow: `.github/workflows/workflow-health-reconcile.yml`

- On pull-request / push path changes: runs the deterministic pilot + vitest suite.
- On `schedule` / `workflow_dispatch`: the generate job requires the pilot job
  to pass first, restores the prior `reconcile-store.json` from the Actions
  cache, reconciles the retained store (incoming envelopes remain empty until
  an authorized live collector exists), persists the updated store back to the
  cache, and uploads the generated `site/workflow-health` artifact (retention
  7 days). Cache loss degrades to a gap-visible empty state, never invented
  health. Artifact publication is reporting only; it does not merge to `main`
  or promote Production.

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
