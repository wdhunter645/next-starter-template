---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Current PR process baseline during P1 rebuild
Does Not Own: Final branch protection settings or GitHub App installation settings
Canonical Reference: /docs/reference/ci/merge-protection-surface.md
Related issues: #2175, #2208
Last Reviewed: 2026-07-04
---

# PR Process Current State

## Status

The repository is in PR-process rebuild mode.

The current process is intentionally safe-mode, not the final design. Legacy PR-process CI has been reduced so PR-process repair work can merge without repeatedly fighting the old process.

## Current in-use PR process

1. Work starts from a GitHub issue.
2. PR body uses the stable-facts template.
3. PR body should include source issue, intent label, PR class, allowed paths, change summary, verification, acceptance criteria, and reviewer/bot review attestation.
4. Dynamic lifecycle state must not be stored in the PR body.
5. PR-process CI must not block PR-process repair work during the P1 rebuild.
6. Simplified marker workflows preserve check names while the final checks are rebuilt.
7. Post-merge closeout ownership is consolidated and no longer intentionally loops through self-healing workflow cascades.

## Temporarily simplified checks

The following workflows are temporarily simplified to passing marker checks:

- `GATE — Quality Checks`
- `GATE — Drift Control`
- `GATE — Branch Freshness`
- `Docs Guardrails`
- `Design Compliance (Warn)`
- `GATE — Reviewer Response Completion`

These are not final-state checks. Each must later be deleted, kept manual/advisory, or rebuilt as deterministic validation.

## Still active / unresolved checks

The following remain active or partially active:

- `GATE — Intent Labeler`
- `GATE — Diff Scope`
- Secret scan
- ZIP history audit
- Agent governance
- Design authority / DIATAXIS checks where still wired

## New design target

The final PR process should have these properties:

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

1. Disable Codex automatic PR review outside repo code and verify ChatGPT connector access still works.
2. Verify live branch-protection settings against the reduced required-check reference.
3. Decide final disposition for each no-op marker workflow.
4. Remove or justify remaining reviewer-disposition compatibility code.
5. Decide whether more redesigned gates emit machine-readable artifacts.
6. Establish first-pass / second-pass PR success metrics.
7. Publish the final operator-facing PR process doc before closing #2175.

## Current operating rule

Until #2175 and #2208 are closed, do not re-enable any PR-process CI as a merge blocker unless it has explicit advisory evidence and a small PR promoting it intentionally.
