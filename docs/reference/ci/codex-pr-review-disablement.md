---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Codex automatic PR-review disablement policy for LGFC
Does Not Own: ChatGPT/Codex GitHub App installation settings or general AI-agent assignment policy
Canonical Reference: /docs/governance/PR_PROCESS.md
Related issues: #2175, #2208
Last Reviewed: 2026-07-04
---

# Codex PR Review Disablement

This controlled reference supports `/docs/governance/PR_PROCESS.md`.

## Decision

Codex must not run as an automatic pull-request code reviewer for this repository.

## Reason

Automatic Codex PR review consumes credits/usage and can contribute to 5-hour rate-limit exhaustion. That makes Codex unavailable for higher-value work such as deliberate implementation, targeted repository research, or operator-directed debugging.

## Required operating rule

Do not request, configure, or rely on Codex as a standing PR reviewer.

Codex may still be used deliberately when Bill/ChatGPT assigns a specific task, but not as an always-on PR review bot.

## Access distinction

Do not uninstall or disable the repository-level ChatGPT/Codex GitHub App connection unless a replacement ChatGPT GitHub access path exists.

The desired change is to disable automatic Codex PR review behavior, not revoke all OpenAI-side GitHub access.

## Disablement path

No repository workflow or file currently appears to request Codex PR reviews directly. The active switch is therefore treated as external integration configuration.

Operator action:

1. Open the repository or organization GitHub App / integration settings.
2. Locate ChatGPT Codex Connector / Codex review behavior.
3. Disable automatic PR review / automatic code review for this repository.
4. Preserve app installation access if ChatGPT GitHub connector access is still required.
5. Confirm by opening a test PR and verifying Codex is not automatically requested and does not post an automatic review.

## Repo-side guardrail

Repository documentation and process design must treat Codex PR review as disabled. Future PR-process rebuild work must not reintroduce automatic Codex reviewer requests.

## Verification evidence before closing #2208

- A PR opened after disablement did not automatically request Codex review.
- No Codex automatic PR review comment was posted.
- ChatGPT GitHub connector access still works after the change.
