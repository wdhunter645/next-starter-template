---
Doc Type: Operations Handoff
Audience: Bill, ChatGPT, Cursor Local, LGFC maintainers
Authority Level: Operator Handoff
Owns: Project #2294 repository implementation inventory, startup order, disable order, and external evidence checklist
Does Not Own: Credentials, repository settings, production approval, or automatic merge to main
Canonical Reference: /docs/how-to/agents/operate-agent-routing.md
Related Issues: #2294, #2601, #2634, #2635, #2636, #2637, #2638
Last Reviewed: 2026-07-19
---

# Agent Routing Operator Handoff

## Repository implementation

- configuration: `scripts/agent-routing/config.json`;
- controller: `.github/workflows/ops-agent-routing-controller.yml`;
- reconciler: `.github/workflows/ops-agent-routing-reconcile.yml`;
- pure resolver/planner/lane/time modules: `scripts/agent-routing/*.mjs`;
- alert, claim, metric, and dead-letter modules: `scripts/agent-routing/*.mjs`;
- local Cursor reference poller: `scripts/agent-routing/local-cursor/**`;
- schemas: `scripts/agent-routing/schemas/**`;
- tests: `tests/agent-routing/**`;
- acceptance report: `docs/ops/reports/agent-routing-acceptance.md`;
- pilot report: `docs/ops/reports/agent-routing-pilot.md`.

## Startup order

1. Keep mode `observe` and actions disabled until an explicit mode promotion is recorded.
2. Promote reviewed repository workflows/configuration through the approved production PR boundary.
3. Run the controller and reconciler manually and inspect artifacts.
4. Install the local Cursor poller on Debian 12, preserve state at `~/.cursor/github-poller/state.json`, and verify exact pickup/no-op/restart/disable behavior.
5. Promote the inert repository-runner health workflow to `main`, register the host, and run manual health only.
6. Keep the five broad ChatGPT watchers on the staggered schedule (00/12/24/36/48) under current Bill/Atlas engage authority.
7. Promote controller modes one step at a time with evidence.

## Disable and rollback

Disable watchers, set mode `disabled`, disable scheduled reconciliation if necessary, stop the local poller while preserving state, expire active claims, and revert repository runtime changes in a bounded PR. Preserve all Issues, comments, alerts, reports, and dead letters. `main` remains manual throughout.

## External completion checklist

- [x] Chromebook poller installed and authenticated (`gh` as `wdhunter645` on Debian 12).
- [x] Poller no-op, claim, restart, heartbeat, and disable evidence attached (`#2597`, `#2600`, `#2601` host packages).
- [ ] Repository runner configuration promoted to `main` through independent review.
- [ ] Repository runner registered and manual health workflow passed.
- [x] Five watcher schedules enabled for the approved observe window (ChatGPT/Atlas; watcher 36 re-enabled).
- [x] Live watcher broad-discovery / observe-cycle evidence accepted (`#2601` Bill/Atlas engage authorization after completed observe cycles).
- [x] Watchers authorized for bounded collaboration-dispatch (engage, not report-only); `main` merge still prohibited without explicit Bill/Atlas approval.
- [ ] Bill/ChatGPT approves any controller mode beyond `observe`.

## Phase 1 → engage permissions matrix

| Actor | Allowed | Prohibited |
| --- | --- | --- |
| Cursor Local | Observe controller/reconciler, host poller kill-switch evidence, report updates on authorized `#2601` paths | Runner registration, persistent runner service, merge/promotion to `main` |
| ChatGPT watchers 00/12/24/36/48 | Broad repository review plus bounded collaboration-dispatch per Bill/Atlas engage authorization | Merge/promote to `main` without explicit approval; self-approve builder work; production/secret/credential/infra changes; destructive deletes; inventing scope |
| CI controller workflows | Deterministic observe reports once promoted/registered | Automatic merge to `main` |
| Bill / ChatGPT | Authorize phase promotion, accept evidence, close tasks, activate serial successors | N/A |

## Serial successor

Authorized critical-path chain after verified `#2601` closeout:

`#2601 → #2634 → #2635 → #2636 → #2637 → #2638`

`#2466` is deferred until this runner-service chain completes. Preserve one active Cursor claim per serial lane; do not wake `#2634` until `#2601` closeout and canonical queue disposition.

## Known exceptions

- Agent-routing GitHub Actions workflows exist on the component branch but are not yet callable on the default branch (`gh workflow run` 404 until production promotion).
- Repository `scripts/agent-routing/config.json` keeps `watchers.enabled: false` and `mode: observe`; live ChatGPT watcher enablement and engage behavior are scheduler-side / issue-authority surfaces.
- Cursor backend Automations list returned zero watcher records; do not treat that API gap as proof the ChatGPT schedules are off.

## Final acceptance gate

`#2640` / `#2639` predecessor blockers are **cleared**. `#2639` Development closeout accepted PR `#2655` at component head `f5bc9f14c2533def302a8cd2cfa79237e8403406`, supplying the deterministic promotion-profile matrix previously missing from the pilot package.

`#2601` now carries Phase 1 host evidence, watcher engage posture, four-lane runtime validation (prior resume at `79400f42…`), and promotion-profile gate observe reconciliation at `f5bc9f14…`. Executable profile-transition / bypass gates are **satisfied**; residual disclosed gaps are limited to live Sandbox adoption demo and enabling `fourLaneRuntime` in repository config (see `docs/ops/reports/agent-routing-pilot.md`).

This package requests ChatGPT Task 009 closeout disposition. Residual gaps must not be silently treated as complete.

Until the remaining unchecked runner boxes have direct evidence, Chromebook runner registration and controller mode promotion beyond `observe` remain separate decisions on the `#2634`→`#2638` chain after verified `#2601` closeout.
