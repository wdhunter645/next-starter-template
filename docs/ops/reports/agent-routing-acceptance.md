---
Doc Type: Report
Audience: Bill, ChatGPT, Cursor Local, LGFC maintainers
Authority Level: Verification Evidence
Owns: Project #2294 deterministic acceptance results for the repository implementation
Does Not Own: Live Chromebook registration, production promotion, or watcher pilot authorization
Canonical Reference: /docs/ops/implementation-plans/agent-issue-polling-handoff-routing/implementation-plan.md
Related Issues: #2294, #2593-#2601
Last Reviewed: 2026-07-18
---

# Agent Routing Acceptance Report

## Result

The repository implementation contains 16 deterministic acceptance scenarios covering assignment/ACK planning, genuine ChatGPT handoff, broad watcher discovery without alerts, alert prioritization, watcher claim races, independent-lane scheduling, collision prevention, duplicate and stale events, missed-event reconciliation, CI-failure disposition, protected production review, local poller restart behavior, controller disable, the materializer wrong-manifest regression, and rejection of automatic `main` merge.

Local Node 22 evidence:

- module syntax checks: PASS;
- deterministic smoke assertions: PASS;
- `node scripts/agent-routing/acceptance.mjs`: 16/16 PASS;
- no OpenAI API dependency: PASS;
- observe mode default: PASS;
- automatic merge to `main`: prohibited.

Repository CI remains the authoritative full Vitest, lint, typecheck, workflow, and security verification surface for the implementation PR.

## Residual external validation

The following cannot be truthfully completed from a GitHub-only session and remain operator evidence items:

- Chromebook service installation and authenticated `gh` poller execution;
- repository-scoped runner registration and manual health run;
- timed live ChatGPT watcher pilot.

These do not change the deterministic repository implementation result and must not be represented as completed until direct host/scheduler evidence exists.
