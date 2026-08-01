---
Doc Type: Reference
Audience: Human + AI
Authority Level: Project Contract
Owns: Claude Code wake-delivery trigger conditions, comment markers, and notification-only scope boundary
Does Not Own: Cursor Local Bridge, PR approval authority, Production promotion, or any guarantee that a Claude Code session launches
Canonical Reference: /.github/workflows/claude-code-wake.yml
Related Issues: #2994
Last Reviewed: 2026-08-01
---

# Claude Code Wake Contract

## Purpose

Give the repository a deterministic, automated way to alert Claude Code /
Engineering about work that needs attention, instead of relying on someone
typing an `@claude` mention by hand. This mirrors the existing
`cursor-local-wake.yml` delivery-only pattern (`docs/reference/ci/cursor-local-bridge-contract.md`)
but for Claude Code, and with a materially smaller footprint: there is no
local daemon to keep alive, so the workflow runs on a standard
GitHub-hosted runner and its only side effect is a comment.

## What this is not

This workflow is **delivery only**. It does not:

- prove a Claude Code session actually picked up the work;
- grant approval, merge, or execution authority;
- replace the source Issue/PR as the authority for scope and decisions;
- guarantee any particular backend automatically starts a session on
  `@claude` mentions — that depends on account/platform-level integration
  this repository does not configure. Worst case if no such integration is
  listening, the comment is still a durable, greppable signal that a
  polling Claude Code session (or a human) can search for.

## Triggers

| Trigger | Condition | Effect |
| --- | --- | --- |
| `pull_request` | `opened`, `reopened`, or `ready_for_review`; the PR is not a draft; and the head repo is this repo (not a fork) | Alert comment on the PR |
| `issue_comment` | Created on an open **issue** (not a PR) by `wdhunter645`, with a body starting with `CLAUDE CODE RESUME` | Alert comment on the issue |
| `workflow_dispatch` | Manual, restricted to `github.actor == 'wdhunter645'` | Alert comment on the given issue/PR number |

Every PR eventually needs PR Approver / Engineering review, so the `pull_request`
trigger covers that class without requiring a label. Issue-side routing
uses a resume marker (parallel to Cursor's `LOCAL CURSOR RESUME`) rather
than a dedicated label, keeping this bounded to the two use cases that
currently exist.

The fork and comment-author restrictions exist because this is a write
path: a fork PR's `pull_request` event only gets a read-only token
regardless of the `permissions:` block (so an unrestricted fork trigger
would just fail red on external contributors' PRs), and an unrestricted
`issue_comment` trigger would let anyone force a write by posting the
resume marker on any open issue.

## Comment markers

- `CLAUDE CODE WAKE: delivered` — the alert comment this workflow posts.
  Includes a delivery id and the triggering event name.
- `CLAUDE CODE RESUME` — the issue-side marker that requests a wake alert
  for Engineering, analogous to `LOCAL CURSOR RESUME` for Cursor. This
  marker is not currently part of the Bridge eligibility contract
  (`scripts/cursor-bridge/lib/eligibility.mjs`, which recognizes only
  `CHATGPT RESPONSE` / `CHATGPT CLOSEOUT` / `LOCAL CURSOR RESUME`) and does
  not attempt to be; it exists solely to trigger this delivery workflow.

## Deduplication

Before posting, the workflow lists existing comments on the target and
skips delivery if one already contains the line `CLAUDE CODE WAKE:
delivered` (the alert body leads with `@claude` so the marker is not the
first line — the check matches it anywhere in the comment, not only at the
start). This keeps `reopened` and repeated manual dispatch from spamming
the thread.

## Known gap this contract does not fix

The Bridge eligibility contract's response-marker vocabulary
(`CHATGPT RESPONSE`, `CHATGPT CLOSEOUT`) hardcodes a vendor/product name
rather than the durable `PMO / Engineering` role, which is out of step
with the naming rule in `docs/governance/AGENT-TEAM.md` ("Canonical policy
names durable roles, not preferred vendors, models, or agent products").
Now that Claude Code also holds the Engineering role, a Claude-authored
canonical response comment must still use the literal string
`CHATGPT RESPONSE` to be machine-claimable by Cursor Local Bridge. Renaming
that vocabulary is out of scope for this contract (it would require a
coordinated change to `eligibility.mjs`, `CURSOR-RUNTIME-ROUTING.md`, and
every doc that names the marker) and is left as follow-up work.

## Verification

Changes to the workflow are validated for YAML correctness and against the
CI header check before merge; validation evidence for a given change is
recorded on the PR, not in this reference document.
