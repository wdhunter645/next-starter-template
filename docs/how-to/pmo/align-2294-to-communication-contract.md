---
Doc Type: How-To
Audience: ChatGPT, Cursor, Bill
Authority Level: Operational Authority
Owns: Explicit alignment note that Project #2294 consumes the #2550 communication contract
Does Not Own: Poller implementation, project #2294 launch authority, or production promotion
Canonical Reference: /docs/ops/ai/chatgpt-cursor-handoff-workflow.md
Related Issues: #2294, #2550, #2546
Last Reviewed: 2026-07-16
---

# Align Project #2294 to the canonical communication contract

## Rule

Project #2294 (Agent Issue Polling and Handoff Routing) must implement polling, pickup, persistence, and operator behavior against the canonical contract owned by Task #2550:

- `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`
- `docs/how-to/cursor/github-poll-wake-loop.md`
- `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`

Do not create a competing label/comment state machine under #2294.

## Launch gate

Do not start #2294 implementation until its complete preparation package and one project-level Go decision exist. Until then, keep #2294 out of `handoff:ready`.
