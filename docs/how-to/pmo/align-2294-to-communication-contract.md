---
Doc Type: How-To
Audience: ChatGPT, Cursor, Bill
Authority Level: Operational Authority
Owns: Explicit alignment note that Project #2294 consumes the #2550 communication contract
Does Not Own: Poller implementation, project #2294 launch authority, or production promotion
Canonical Reference: /docs/ops/ai/chatgpt-cursor-handoff-workflow.md
Related Issues: #2294, #2550, #2546
Last Reviewed: 2026-07-17
---

# Align Project #2294 to the canonical communication contract

## Purpose

Align Project #2294 with the existing communication authority without creating a second state model.

## Procedure

1. Use `docs/ops/ai/chatgpt-cursor-handoff-workflow.md` for label and comment semantics.
2. Use `docs/how-to/cursor/github-poll-wake-loop.md` for local Cursor pickup behavior.
3. Use `docs/ops/pmo/queue-watch-and-dispatch-protocol.md` for queue and lane handling.
4. Use the #2294 design, implementation plan, manifest, and linked task Issues for project-specific implementation scope.
5. Use PR #2603 as the materializer remediation package owned by ChatGPT / Atlas under #2294.
6. Use Task #2554 to validate the integrated PMO behavior and operator handoff without creating a duplicate implementation.

## Launch gate

Do not start #2294 implementation until its complete preparation package is reviewed and one project-level Go decision exists. Until then, keep #2294 and Tasks #2593–#2601 out of `handoff:ready` and keep the ChatGPT watchers disabled.
