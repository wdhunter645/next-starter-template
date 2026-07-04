---
Doc Type: Reference
Audience: Human + AI
Authority Level: Historical
Owns: Archived PR-process documentation and evidence index
Does Not Own: Current PR-process policy or active workflow behavior
Canonical Reference: /docs/governance/PR_PROCESS.md
Related issues: #2175, #2208, #2217
Last Reviewed: 2026-07-04
---

# PR Process Archive Index

This archive index identifies PR-process materials that are historical evidence only.

## Current authority

Use `/docs/governance/PR_PROCESS.md` for current PR-process policy.

Use `/docs/reference/ci/pr-process-current-state.md` for the temporary safe-mode state during #2175 / #2208.

## Historical evidence

The following retained materials are evidence only and must not be used as current PR-process authority:

- historical PR body snapshots under `scripts/ci/post-merge-closeout/pr-*-body.md`;
- old PR gate success patterns that require PR-body reviewer ledgers;
- old file-touch allowlist rituals;
- old website-specific PR prompt language;
- legacy PR-body auto-repair scaffolding references.

## Operating rule

If a historical file conflicts with `/docs/governance/PR_PROCESS.md`, the canonical governance doc wins.

Future document-asset work under #2217 should register these historical surfaces with `authority: none` using a glob entry instead of listing every fixture file individually.
