---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor, LGFC maintainers, implementation agents
Authority Level: Operational Plan (non-authoritative until promoted via Issue/PR)
Owns: Index and navigation for Content Collection foundation implementation packages enriched under #2361
Does Not Own: Canonical content model, governance law, runtime implementation, or merge authority
Canonical Reference: /docs/ops/reports/content-collection-docs-audit-dedup-2360.md
Related Issues: #2361, #2359, #2360, #1738, #2286
Last Reviewed: 2026-07-08
---

# Content Collection Foundation Package Index

## Purpose

Navigate the five foundation implementation packages enriched from Drive intake drafts under `_incoming/drive-drafts/content-collection/`. These packages are **operational envelopes** for future Cursor tasks. They are not Diataxis authority until promoted through a scoped Issue/PR.

## Scope

This index covers only the #2361 foundation set:

| Package ID | Document | Phase | Blocks feature lanes |
| --- | --- | --- | --- |
| CC-001 | [cc-001-content-asset-model-package.md](./packages/cc-001-content-asset-model-package.md) | P0→P1 | **Yes** — Gallery, Library, Memorabilia, Club until frozen |
| CC-002 | [cc-002-provenance-rights-contract-package.md](./packages/cc-002-provenance-rights-contract-package.md) | P0→P1 | **Yes** — public/member display lanes until frozen |
| CI-001 | [ci-001-pr-body-generator-package.md](./packages/ci-001-pr-body-generator-package.md) | P1 | No — procedural preclearance only |
| CI-002 | [ci-002-admin-closeout-auto-repair-package.md](./packages/ci-002-admin-closeout-auto-repair-package.md) | P1 | No — administrative repair boundary only |
| VAL-001 | [val-001-integrated-program-validation-package.md](./packages/val-001-integrated-program-validation-package.md) | P4 | Terminal — program closeout |

## Current known truth

- #2360 audit (`docs/ops/reports/content-collection-docs-audit-dedup-2360.md`) rejects `docs/ops/programs/` and `docs/reference/website/content-collection/` as target roots.
- CC-001/CC-002 must **merge into** existing reference authority, not create parallel SOTs.
- CI-001/CI-002 tooling implementation is **deferred** to Phase 1 child issues; #2361 delivers enriched docs only.
- Intake `.docx` files remain non-authoritative under `_incoming/` on branch `atlas/drive-draft-intake-2367`.

## Source intake mapping

| Intake draft | Enriched package doc |
| --- | --- |
| `CC-001 Content Asset Model Package — Content Collection Draft.docx` | `packages/cc-001-content-asset-model-package.md` |
| `CC-002 Source Provenance Rights Contract Package — Content Collection Draft.docx` | `packages/cc-002-provenance-rights-contract-package.md` |
| `CI-001 PR Body Generator Package — Content Collection Draft.docx` | `packages/ci-001-pr-body-generator-package.md` |
| `CI-002 Administrative Closeout Auto-Repair Package — Content Collection Draft.docx` | `packages/ci-002-admin-closeout-auto-repair-package.md` |
| `VAL-001 Integrated Program Validation Package — Content Collection Draft.docx` | `packages/val-001-integrated-program-validation-package.md` |

## Procedure

1. Read the #2360 audit disposition before starting any package implementation.
2. Open the package doc for the assigned child issue.
3. Confirm canonical reference paths in the package still exist (`git ls-files` / repo search).
4. Execute only within the package file allowlist and source issue scope.
5. Post `CHATGPT HANDOFF` when path conflicts, authority overlap, or governance decisions remain unresolved.

## Execution

Foundation enrichment (#2361) stops at these operational docs. Implementation PRs require separate child issues under #2359 with explicit file allowlists copied from each package.
