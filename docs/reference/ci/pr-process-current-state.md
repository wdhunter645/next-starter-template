---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Current PR process baseline during P1 rebuild
Does Not Own: Canonical PR-process policy, final branch protection settings, GitHub App installation settings
Canonical Reference: /docs/governance/PR_PROCESS.md
Related issues: #2175, #2208
Last Reviewed: 2026-07-04
---

# PR Process Current State

This reference records the temporary current state of the PR-process rebuild. It supports, but does not replace, `/docs/governance/PR_PROCESS.md`.

## Status

The repository is in PR-process rebuild mode.

The current process is intentionally safe-mode, not the final design. Legacy PR-process CI has been reduced so PR-process repair work can merge without repeatedly fighting the old process.

## Current in-use PR process

1. Work starts from a GitHub issue.
2. PR body uses the stable-facts template.
3. PR body should include source issue, intent label, PR class, allowed paths, out-of-scope declaration, change summary, verification, acceptance criteria, follow-up issue declaration, and reviewer/bot review attestation.
4. Dynamic lifecycle state must not be stored in the PR body.
5. PR-process CI is held in safe-mode during the P1 rebuild.
6. Marker and manual workflows preserve workflow names while the final checks are rebuilt.
7. Post-merge closeout ownership is consolidated and should avoid self-healing workflow cascades.

## Temporarily simplified PR-process checks

The following workflows are temporarily simplified to passing marker checks:

- `GATE — Quality Checks`
- `GATE — Drift Control`
- `GATE — Branch Freshness`
- `Docs Guardrails`
- `Design Compliance (Warn)`
- `GATE — Reviewer Response Completion`

The following workflows are temporarily manual-only marker workflows:

- `GATE — Intent Labeler`
- `GATE — Diff Scope`
- `GATE — PR Issue Accounting`

These are not final-state checks. Each must later be deleted, kept manual/advisory, or rebuilt as deterministic validation.

## Still active safety checks

The following remain active because they are not legacy PR-process design gates or are still needed as safety controls:

- Secret scan
- ZIP history audit
- Agent governance
- Design authority / DIATAXIS checks where still wired
- Cursor PR Review where still wired

## Final design target

The final PR process is governed by `/docs/governance/PR_PROCESS.md` and should have these properties:

- Stable PR body only.
- No PR-body lifecycle ledgers.
- No PR-body auto-repair lifecycle blocks.
- GitHub-native review and review-thread state for reviewer lifecycle.
- One CI owner per concern.
- Class-aware CI routing.
- Deterministic required checks only.
- Advisory checks must prove low-noise behavior before promotion.
- Post-merge closeout is single-owner and idempotent.
- Codex is not an automatic PR reviewer.

## Known gaps

1. Verify live branch-protection settings against the reduced required-check reference.
2. Decide final disposition for each marker/manual PR-process workflow.
3. Remove or justify remaining reviewer-disposition compatibility code.
4. Decide whether more redesigned gates emit machine-readable artifacts.
5. Establish first-pass / second-pass PR success metrics.
6. Finish operator-facing PR-process documentation alignment before closing #2175.

## Current operating rule

Until #2175 and #2208 are closed, PR-process CI stays in safe-mode unless a later small PR intentionally changes one workflow after advisory evidence.
