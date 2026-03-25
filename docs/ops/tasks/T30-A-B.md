---
Doc Type: Task
Audience: Human + AI
Authority Level: Operational
Owns: Task definition for T30-A/B FanClub shell and auth gate
Does Not Own: Design authority, auth implementation logic
Canonical Reference: /docs/ops/tasks/T30-A-B.md
Last Reviewed: 2026-03-25
---

# T30-A/B — FanClub shell + auth gate

Objective: create launch-safe FanClub home shell backed by existing auth gating.

Scope:
- create or complete /fanclub home shell
- enforce existing auth redirect/gate behavior
- no profile editor
- no chat implementation in this task

Exit criteria:
- /fanclub renders a basic shell for signed-in users
- logged-out users are redirected per current auth rules
