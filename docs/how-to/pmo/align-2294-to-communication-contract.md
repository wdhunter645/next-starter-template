---
Doc Type: How-To
Audience: ChatGPT, Cursor, Bill
Authority Level: Operational Authority
Owns: Explicit alignment of Project #2294 with the #2550 communication contract and the prepared #2294 project package
Does Not Own: Poller/controller implementation, project #2294 launch authority, watcher scheduling in ChatGPT, or production promotion
Canonical Reference: /docs/ops/ai/chatgpt-cursor-handoff-workflow.md
Related Issues: #2294, #2550, #2546, #2554, #2593, #2594, #2595, #2596, #2597, #2598, #2599, #2600, #2601
Last Reviewed: 2026-07-17
---

# Align Project #2294 to the canonical communication contract

## Rule

Project #2294 (Agent Issue Polling and Handoff Routing) implements polling, pickup, persistence, deterministic CI control, broad ChatGPT watcher operation, time-based alerting, reconciliation, and operator behavior against the canonical contract owned by Task #2550:

- `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`
- `docs/how-to/cursor/github-poll-wake-loop.md`
- `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`

Do not create a competing label/comment state machine under #2294.

## Prepared project package

- Design: `docs/explanation/projects/agent-issue-polling-handoff-routing-design.md`
- Implementation plan: `docs/ops/implementation-plans/agent-issue-polling-handoff-routing/implementation-plan.md`
- Project manifest: `docs/ops/implementation-plans/agent-issue-polling-handoff-routing/project-manifest.json`
- Operator runbook: `docs/how-to/agents/operate-agent-routing.md`
- Project branch: `component/agent-issue-polling-handoff-routing`
- Upstream dependency: `component/pmo-project-autonomous-delivery`
- Prepared tasks: #2593–#2601

## Required clarification under #2294

The #2550 contract remains authoritative for labels, canonical comments, Cursor pickup, claim transitions, routine non-`main` progress, genuine escalation, and the `main` approval boundary.

Project #2294 must reconcile one watcher-specific clause without weakening the rest of that contract:

- **Cursor pickup remains narrow:** `agent:cursor` + `handoff:ready` + valid assignment/response + manifest eligibility.
- **ChatGPT watcher review is broad:** every watcher initializes the GitHub app/connector, loads live repository authority, reviews Issues/PRs/checks/reviews/handoffs/dependencies/integration/closeout/workflow health, and performs one highest-priority authorized ChatGPT action.
- `agent:ChatGPT`, unresolved `CHATGPT HANDOFF`, production boundaries, and routing alerts are high-priority signals, but they are not the exclusive watcher input surface.
- Alerts remain durable acceleration and observability events. They do not transfer authority or replace canonical handoff markers and labels.

Task #2593 owns the implementation-time canonical-document reconciliation after project Go.

## Work-conserving rule

Approved executable work should not sit idle while an eligible agent has capacity and a safe non-colliding action exists.

- Manifest dependencies and production boundaries remain serial.
- Explicitly independent tasks may proceed in parallel when branch, file, Issue-mutation, and agent claims do not collide.
- A blocked lane does not block an independent approved lane.
- The dispatcher/controller/watcher must not invent work merely to keep an agent busy.

## PMO materializer prerequisite

Creation of `component/agent-issue-polling-handoff-routing` exposed a PMO materializer event-routing defect: a new `component/**` branch can trigger validation against the hardcoded #2546 manifest even when no #2294 manifest change caused the event.

Task #2554 owns reproduction, exact log evidence, event-to-manifest correction, regression tests, idempotency proof, and operator handoff. #2294 may be reviewed as a preparation package, but it must not be launched until #2554 resolves or explicitly safely dispositions this defect.

## Launch gate

Do not start #2294 implementation until:

1. this preparation package is reviewed;
2. the project manifest and task links validate;
3. #2554 resolves or safely dispositions the PMO materializer prerequisite;
4. Bill/ChatGPT records one project-level Go decision.

Until then:

- keep #2294 and Tasks #2593–#2601 out of `handoff:ready`;
- do not assign an execution agent;
- keep the five ChatGPT watchers disabled;
- do not open or merge implementation PRs;
- do not merge automatically to `main`.
