---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Current GitHub-native reviewer lifecycle surface and advisory enforcement status
Does Not Own: Canonical PR policy, branch protection settings, or post-merge closeout ownership
Canonical Reference: /docs/governance/PR_PROCESS.md
Related Issues: #2175, #2179, #2197, #2469
Last Reviewed: 2026-07-12
---

# LGFC Reviewer Lifecycle Surface

## Current model

Reviewer lifecycle state comes from GitHub-native reviews and review threads. The PR body is not a reviewer-state ledger.

The active reviewer workflow is:

| Workflow | Job | Status |
| --- | --- | --- |
| `reviewer-response-completion.yml` | `reviewer-response-completion` | Advisory and non-blocking |

The workflow may report:

- latest human review state;
- unresolved non-outdated human threads;
- stale or outdated comments;
- trusted-bot findings as advisory evidence;
- pagination or data-read failures.

Human findings may become blocking only after an explicit promotion decision and successful advisory observation. Bot findings remain advisory unless separately promoted by governance.

## Retired surface

#2469 removes `gate-reviewer-response.yml`, the retired manual stub from the #1075 design.

The prior PR-body disposition-ledger model and its synchronous timing rules are historical. Do not require review-comment IDs, thread-state lines, or dynamic reviewer status blocks in PR bodies.

## Post-merge boundary

Automatic post-merge validation and source-issue closeout are owned by `post-merge-closeout.yml`. Reviewer audit helpers may contribute evidence or bounded remediation on failure, but they do not own source-issue closeout.

The retained `post-merge-intent-verification.yml` file is an inert manual compatibility marker. It has no PR trigger, mutation permissions, validator execution, or closeout ownership.

## Required policy

Use `/docs/governance/PR_PROCESS.md` and `/docs/explanation/ci/lgfc-reviewer-lifecycle-redesign.md` for current policy and rationale.
