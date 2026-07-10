---
Doc Type: Operations Report
Audience: Bill, ChatGPT, Cursor
Authority Level: Implementation Evidence
Owns: #2414 documentation update evidence for ChatGPT citation and assumption control
Does Not Own: Shared agent law, PR merge authority, or repository-wide policy beyond the linked source issue
Canonical Reference: /docs/ops/ai/CHATGPT-RULES.md
Related Issues: #2414, #2423, #2366, #2359
Last Reviewed: 2026-07-10
---

# ChatGPT Citation and Assumption Control — #2414

## Purpose

Record the scoped documentation update for #2414: adding a ChatGPT-specific evidence, citation, and strict enumerated readiness posture to `docs/ops/ai/CHATGPT-RULES.md`.

## Source issue

- Source issue: #2414
- Post-merge exception: #2423 (PR #2416 closeout remediation)
- Problem: ChatGPT made or implied operational conclusions without sufficient repo-grounded citations, relied too much on memory/context, and stated or implied launch readiness when the program was not ready.

## Files changed

- `docs/ops/ai/CHATGPT-RULES.md`
- This report (terminology alignment per #2423 remediation)

## Change summary

The updated ChatGPT rule file now requires ChatGPT/Atlas to:

1. cite repository or GitHub-controlled sources for factual status, readiness, audit, postmortem, and governance claims;
2. separate facts from assumptions, inference, and unresolved questions;
3. use enumerated readiness decisions: **YES**, **NO**, **HOLD**, or **VERIFY MORE** (not a misleading binary Yes/No-only model);
4. explain what evidence or work is required to move from **NO**/**HOLD** to **YES**;
5. treat chat memory, prior chats, Drive drafts, side-channel notes, and agent memory as supporting context only;
6. use a structured readiness/gate decision template (distinct from the general Communication rules status format);
7. defer gate-inspection checklists to shared law rather than duplicating them in this agent-specific file.

## Scope boundary

This change is ChatGPT-specific. It does not weaken or replace `SHARED-AGENT-RULES.md`, which already owns shared evidence-first agent law.

## Validation expectation

The PR for this issue should be reviewed as a docs-governance change. Expected validation:

- docs header check passes;
- Diataxis folder audit passes;
- PR body identifies source issue and includes `## Verification`;
- no runtime, CI, workflow, or production configuration changes.

## Remediation note (#2423)

PR #2416 merged the initial rule. Post-merge closeout failed due to `status:in-progress` on #2414, PR-body section naming, and undispositioned reviewer threads. Remediation PR #2428 (source exception issue #2423) addresses reviewer terminology and scope-clarity findings without changing rule intent.
