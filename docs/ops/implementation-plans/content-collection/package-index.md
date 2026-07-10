---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor, LGFC maintainers, implementation agents
Authority Level: Operational Plan (non-authoritative until promoted via Issue/PR)
Owns: Index and navigation for Content Collection foundation and feature implementation packages
Does Not Own: Canonical content model, governance law, runtime implementation, or merge authority
Canonical Reference: /docs/ops/reports/content-collection-docs-audit-dedup-2360.md
Related Issues: #2361, #2362, #2359, #2360, #1738, #2286
Last Reviewed: 2026-07-10
---

# Content Collection Package Index

## Purpose

Navigate Content Collection implementation packages enriched from Drive intake drafts under `_incoming/drive-drafts/content-collection/`. These are **operational envelopes** for future Cursor tasks — not Diataxis authority until promoted through a scoped Issue/PR.

## Foundation packages (#2361)

| Package ID | Document | Phase | Blocks feature lanes |
| --- | --- | --- | --- |
| CC-001 | [cc-001-content-asset-model-package.md](./packages/cc-001-content-asset-model-package.md) | P0→P1 | **Yes** — until `CONTRACT-FROZEN: content-asset-model v1` |
| CC-002 | [cc-002-provenance-rights-contract-package.md](./packages/cc-002-provenance-rights-contract-package.md) | P0→P1 | **Yes** — public/member display enforcement |
| CI-001 | [ci-001-pr-body-generator-package.md](./packages/ci-001-pr-body-generator-package.md) | P1 | No |
| CI-002 | [ci-002-admin-closeout-auto-repair-package.md](./packages/ci-002-admin-closeout-auto-repair-package.md) | P1 | No |
| VAL-001 | [val-001-integrated-program-validation-package.md](./packages/val-001-integrated-program-validation-package.md) | P4 | Terminal closeout |

## Feature packages (#2362)

| Package ID | Document | Route | Implementation blocked until freeze |
| --- | --- | --- | --- |
| GAL-001 | [gal-001-gallery-package.md](./packages/gal-001-gallery-package.md) | `/fanclub/photo` | **Yes** — CC-001/CC-002 freeze |
| LIB-001 | [lib-001-library-package.md](./packages/lib-001-library-package.md) | `/fanclub/library` | **Yes** |
| MEM-001 | [mem-001-memorabilia-package.md](./packages/mem-001-memorabilia-package.md) | `/fanclub/memorabilia` | **Yes** |
| CLUB-001 | [club-001-club-newspaper-design-package.md](./packages/club-001-club-newspaper-design-package.md) | `/fanclub` | **Conditional** — shell risk controls; content fields need freeze |

## Current known truth

- Rejected target roots: `docs/ops/programs/`, `docs/reference/website/content-collection/` (per #2360).
- All four feature routes **exist** on `main` with member auth; packages document gaps vs CC-001/CC-002 and implementation allowlists.
- Intake `.docx` remains on `atlas/drive-draft-intake-2367` only.

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

## Procedure

1. Read #2360 audit disposition before implementation.
2. Open the package for the assigned child issue.
3. Re-verify paths on `main` before edits.
4. Respect `CONTRACT-FROZEN: content-asset-model v1` for GAL/LIB/MEM code PRs.
5. Serialize CLUB-001 shell edits with other fanclub lanes.
6. Post `CHATGPT HANDOFF` when authority conflicts remain.

## Execution

Package enrichment (#2361, #2362) stops at these docs. Code implementation requires separate child issues with allowlists copied from each package.
