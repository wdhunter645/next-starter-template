---
Doc Type: Report
Audience: Bill, ChatGPT, Cursor Local, LGFC maintainers
Authority Level: Pilot Preparation Evidence
Owns: Observe-mode fixture pilot results and the remaining live-pilot evidence boundary
Does Not Own: Production enablement or automatic merge to main
Canonical Reference: /docs/how-to/agents/operate-agent-routing.md
Related Issues: #2294, #2601
Last Reviewed: 2026-07-18
---

# Agent Routing Observe Pilot

## Fixture pilot

A deterministic observe-mode fixture pilot passed all 16 scenarios. Candidate selection remained broad without alert labels, an urgent alert increased ranking without creating authority, overlapping claims yielded to the first active lease, an independent lane advanced while a serial lane remained blocked, and repeated input produced stable results.

Configuration remains:

- routing mode: `observe`;
- watcher scheduling: disabled;
- local Cursor poller: disabled until host installation;
- repository runner: manual-health-only and unregistered;
- automatic `main` merge: false.

## Live-pilot boundary

A live timed pilot requires the Chromebook and ChatGPT scheduler surfaces. Those external actions are not available through repository APIs. Live latency, heartbeat, restart, and five-watcher overlap evidence therefore remain pending and must be appended after operator execution. No fabricated live evidence is accepted.
