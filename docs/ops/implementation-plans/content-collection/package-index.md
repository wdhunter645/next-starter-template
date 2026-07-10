---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor, LGFC maintainers, implementation agents
Authority Level: Operational Plan (non-authoritative until promoted via Issue/PR)
Owns: Index, asset inventory, and promotion-status tracking for Content Collection packages, control documents, and support documents
Does Not Own: Canonical content model, governance law, runtime implementation, or merge authority
Canonical Reference: /docs/ops/reports/content-collection-docs-audit-dedup-2360.md
Related Issues: #2365, #2361, #2362, #2363, #2364, #2359, #2360, #1738, #2286
Last Reviewed: 2026-07-10
---

# Content Collection Package Index

## Purpose

Navigate Content Collection implementation packages enriched from Drive intake drafts under `_incoming/drive-drafts/content-collection/`. These are **operational envelopes** for future Cursor tasks — not Diataxis authority until promoted through a scoped Issue/PR.

**Phase 0 closeout:** `docs/ops/reports/content-collection-phase0-promotion-closeout-2365.md`

## Foundation packages (#2361)

| Package ID | Document | Phase | Blocks feature lanes | Status | PR |
| --- | --- | --- | --- | --- | --- |
| CC-001 | [cc-001-content-asset-model-package.md](./packages/cc-001-content-asset-model-package.md) | P0→P1 | **Yes** — until `CONTRACT-FROZEN: content-asset-model v1` | `validated` | #2405 |
| CC-002 | [cc-002-provenance-rights-contract-package.md](./packages/cc-002-provenance-rights-contract-package.md) | P0→P1 | **Yes** — public/member display enforcement | `validated` | #2405 |
| CI-001 | [ci-001-pr-body-generator-package.md](./packages/ci-001-pr-body-generator-package.md) | P1 | No — tooling deferred | `validated` | #2405 |
| CI-002 | [ci-002-admin-closeout-auto-repair-package.md](./packages/ci-002-admin-closeout-auto-repair-package.md) | P1 | No — admin boundary only | `validated` | #2405 |
| VAL-001 | [val-001-integrated-program-validation-package.md](./packages/val-001-integrated-program-validation-package.md) | P4 | Terminal closeout | `validated` | #2405 |

## Feature packages (#2362)

| Package ID | Document | Route | Blocked until freeze | Status | PR |
| --- | --- | --- | --- | --- | --- |
| GAL-001 | [gal-001-gallery-package.md](./packages/gal-001-gallery-package.md) | `/fanclub/photo` | **Yes** — CC-001/CC-002 freeze | `validated` | #2415 |
| LIB-001 | [lib-001-library-package.md](./packages/lib-001-library-package.md) | `/fanclub/library` | **Yes** | `validated` | #2415 |
| MEM-001 | [mem-001-memorabilia-package.md](./packages/mem-001-memorabilia-package.md) | `/fanclub/memorabilia` | **Yes** | `validated` | #2415 |
| CLUB-001 | [club-001-club-newspaper-design-package.md](./packages/club-001-club-newspaper-design-package.md) | `/fanclub` | **Conditional** — shell risk | `validated` | #2415 |

## Control documents (#2363)

| Doc ID | Title | Path | Status | PR |
| --- | --- | --- | --- | --- |
| CTRL-001 | Launch Readiness Checklist | [content-collection-launch-readiness-checklist.md](../../pmo/content-collection-launch-readiness-checklist.md) | `validated` | #2420 |
| CTRL-002 | Diataxis Promotion Map | [content-collection-diataxis-promotion-map.md](../../pmo/content-collection-diataxis-promotion-map.md) | `validated` | #2420, #2427 |
| CTRL-003 | Parallel Execution Matrix | [content-collection-parallel-execution-matrix.md](../../pmo/content-collection-parallel-execution-matrix.md) | `validated` | #2420 |
| CTRL-004 | Cursor Parallel Worktree Standard | [cursor-parallel-worktree-standard.md](../../../how-to/ops/cursor-parallel-worktree-standard.md) | `validated` | #2420 |
| CTRL-005 | Program Closeout Template | [content-collection-program-closeout-template.md](../../pmo/content-collection-program-closeout-template.md) | `validated` | #2420 |
| CTRL-006 | Dedup / Merge Plan | [content-collection-docs-audit-dedup-2360.md](../../reports/content-collection-docs-audit-dedup-2360.md) | `complete` | #2372 |
| CTRL-007 | Phase 0 Closeout Report | [content-collection-phase0-promotion-closeout-2365.md](../../reports/content-collection-phase0-promotion-closeout-2365.md) | `pr_open` | #2427 |

## Support documents (#2364)

| Doc ID | Title | Path | Status | PR |
| --- | --- | --- | --- | --- |
| SUP-001 | Support docs index | [support-docs-index.md](./support/support-docs-index.md) | `validated` | #2419 |
| SUP-002 | Label/status mapping addendum | [github-label-status-mapping-addendum.md](./support/github-label-status-mapping-addendum.md) | `validated` | #2419, #2424 |
| SUP-003 | Cursor assignment prompt pack | [cursor-assignment-prompt-pack.md](./support/cursor-assignment-prompt-pack.md) | `validated` | #2419, #2424 |
| SUP-004 | Review throttle / PR queue standard | [review-throttle-pr-queue-standard.md](./support/review-throttle-pr-queue-standard.md) | `validated` | #2419, #2424 |
| SUP-005 | Deferred work register | [deferred-work-register.md](./support/deferred-work-register.md) | `validated` | #2419, #2424 |
| SUP-006 | Risk register | [risk-register.md](./support/risk-register.md) | `validated` | #2419, #2424 |

## GitHub-only (not repo docs)

| Intake draft | Use |
| --- | --- |
| Project Lane Issue Body Pack | Paste parallel-control blocks from parallel matrix when Bill authorizes |
| Per-Lane Task Issue Body Pack | Paste per-task bodies when Bill authorizes |

## Current known truth

- Phase 0 docs promotion (#2360–#2364) completes on merge of closeout PR #2427 (source issue #2365).
- Rejected target roots: `docs/ops/programs/`, `docs/reference/website/content-collection/` (per #2360).
- All four feature routes **exist** on `main` with member auth; packages document gaps vs CC-001/CC-002 and implementation allowlists.
- Intake `.docx` remains on `atlas/drive-draft-intake-2367` only.
- Feature code blocked until `CONTRACT-FROZEN: content-asset-model v1`.

## Source intake mapping

| Intake draft | Enriched package doc |
| --- | --- |
| `CC-001 … Draft.docx` | `packages/cc-001-content-asset-model-package.md` |
| `CC-002 … Draft.docx` | `packages/cc-002-provenance-rights-contract-package.md` |
| `CI-001 … Draft.docx` | `packages/ci-001-pr-body-generator-package.md` |
| `CI-002 … Draft.docx` | `packages/ci-002-admin-closeout-auto-repair-package.md` |
| `VAL-001 … Draft.docx` | `packages/val-001-integrated-program-validation-package.md` |
| `GAL-001 … Draft.docx` | `packages/gal-001-gallery-package.md` |
| `LIB-001 … Draft.docx` | `packages/lib-001-library-package.md` |
| `MEM-001 … Draft.docx` | `packages/mem-001-memorabilia-package.md` |
| `CLUB-001 … Draft.docx` | `packages/club-001-club-newspaper-design-package.md` |
| `LGFC Launch Readiness Checklist v2 …` | `docs/ops/pmo/content-collection-launch-readiness-checklist.md` |
| `LGFC Parallel Execution Matrix …` | `docs/ops/pmo/content-collection-parallel-execution-matrix.md` |
| `LGFC Cursor Parallel Worktree …` | `docs/how-to/ops/cursor-parallel-worktree-standard.md` |
| `LGFC Program Closeout …` | `docs/ops/pmo/content-collection-program-closeout-template.md` |
| `LGFC Diataxis Promotion Map …` | `docs/ops/pmo/content-collection-diataxis-promotion-map.md` |
| `LGFC GitHub Label and Status Mapping Addendum …` | `support/github-label-status-mapping-addendum.md` |
| `LGFC Cursor Assignment Prompt Pack …` | `support/cursor-assignment-prompt-pack.md` |
| `LGFC Review Throttle and PR Queue Standard …` | `support/review-throttle-pr-queue-standard.md` |
| `LGFC Deferred Work Register …` | `support/deferred-work-register.md` |
| `LGFC Risk Register …` | `support/risk-register.md` |
| `LGFC Package Index …` | This document |
| `LGFC Documentation Dedup …` | `docs/ops/reports/content-collection-docs-audit-dedup-2360.md` |

## Procedure

1. Read #2360 audit disposition before implementation.
2. Open the package or control/support doc for the assigned child issue.
3. Re-verify paths on `main` before edits.
4. Respect `CONTRACT-FROZEN: content-asset-model v1` for GAL/LIB/MEM code PRs.
5. Serialize CLUB-001 shell edits with other fanclub lanes.
6. Post `CHATGPT HANDOFF` when authority conflicts remain.

## Execution

Package, control, and support enrichment (#2361–#2364) stops at these docs. Code implementation requires separate child issues with allowlists from each package and the parallel execution matrix.
