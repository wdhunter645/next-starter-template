---
Doc Type: Operations Report
Audience: Bill, ChatGPT, Cursor
Authority Level: Implementation Evidence
Owns: #2414 documentation update evidence for ChatGPT citation and assumption control
Does Not Own: Shared agent law, PR merge authority, or repository-wide policy beyond the linked source issue
Canonical Reference: /docs/ops/ai/CHATGPT-RULES.md
Related Issues: #2414, #2366, #2359
Last Reviewed: 2026-07-09
---

# ChatGPT Citation and Assumption Control — #2414

## Purpose

Record the scoped documentation update for #2414: adding a ChatGPT-specific evidence, citation, and binary readiness posture to `docs/ops/ai/CHATGPT-RULES.md`.

## Source issue

- Source issue: #2414
- Problem: ChatGPT made or implied operational conclusions without sufficient repo-grounded citations, relied too much on memory/context, and stated or implied launch readiness when the program was not ready.

## Files changed

- `docs/ops/ai/CHATGPT-RULES.md`

## Change summary

The updated ChatGPT rule file now requires ChatGPT/Atlas to:

1. cite repository or GitHub-controlled sources for factual status, readiness, audit, postmortem, and governance claims;
2. separate binary facts from assumptions, inference, and unresolved questions;
3. say **No**, **Hold**, or **Verify More** when evidence does not prove readiness;
4. explain what evidence or work is required to move from No/Hold to Yes;
5. treat chat memory, prior chats, Drive drafts, side-channel notes, and agent memory as supporting context only;
6. use a structured readiness/status response shape distinguishing facts, assumptions, decision, reason, and required evidence.

## Scope boundary

This change is ChatGPT-specific. It does not weaken or replace `SHARED-AGENT-RULES.md`, which already owns shared evidence-first agent law.

## Validation expectation

The PR for this issue should be reviewed as a docs-governance change. Expected validation:

- docs header check passes;
- Diataxis folder audit passes;
- PR body identifies #2414 as the single source issue;
- no runtime, CI, workflow, or production configuration changes.
