---
Doc Type: Operations Handoff
Audience: Bill, ChatGPT, Cursor Local, LGFC maintainers
Authority Level: Operator Handoff
Owns: Project #2294 repository implementation inventory, startup order, disable order, and external evidence checklist
Does Not Own: Credentials, repository settings, production approval, or automatic merge to main
Canonical Reference: /docs/how-to/agents/operate-agent-routing.md
Related Issues: #2294, #2601
Last Reviewed: 2026-07-18
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
- acceptance report: `docs/ops/reports/agent-routing-acceptance.md`.

## Startup order

1. Keep mode `observe` and actions disabled.
2. Promote reviewed repository workflows/configuration through the approved production PR boundary.
3. Run the controller and reconciler manually and inspect artifacts.
4. Install the local Cursor poller on Debian 12, preserve state at `~/.cursor/github-poller/state.json`, and verify exact pickup/no-op/restart/disable behavior.
5. Promote the inert repository-runner health workflow to `main`, register the host, and run manual health only.
6. Enable the five broad ChatGPT watchers only after explicit live-pilot authorization.
7. Promote modes one step at a time with evidence.

## Disable and rollback

Disable watchers, set mode `disabled`, disable scheduled reconciliation if necessary, stop the local poller while preserving state, expire active claims, and revert repository runtime changes in a bounded PR. Preserve all Issues, comments, alerts, reports, and dead letters. `main` remains manual throughout.

## External completion checklist

- [ ] Chromebook poller installed and authenticated.
- [ ] Poller no-op, claim, restart, heartbeat, and disable evidence attached.
- [ ] Repository runner configuration promoted to `main` through independent review.
- [ ] Repository runner registered and manual health workflow passed.
- [ ] Five watcher schedules enabled for the approved observe window.
- [ ] Live watcher claim-race and broad-discovery evidence attached.
- [ ] Bill/ChatGPT approves any mode beyond observe.

Until these boxes have direct evidence, the repository implementation is complete but the live operating rollout is not.
