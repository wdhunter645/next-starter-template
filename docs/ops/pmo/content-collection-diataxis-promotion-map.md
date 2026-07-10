---
Doc Type: Operations Report
Audience: Bill, ChatGPT, Cursor, LGFC maintainers
Authority Level: Planning Map (non-authoritative until items promoted via Issue/PR)
Owns: Drive-draft → repository path mapping with C7-remapped targets and promotion status fields
Does Not Own: Diataxis authority of intake `.docx` files or merge authorization
Canonical Reference: /docs/ops/reports/content-collection-docs-audit-dedup-2360.md
Related Issues: #2363, #2360, #2359, #2367
Last Reviewed: 2026-07-10
---

# Content Collection Diataxis Promotion Map

## Purpose

Assign every Drive planning document under `_incoming/drive-drafts/content-collection/` to an approved repository path before promotion.

## Scope

Owns C7-remapped target paths, control/package mapping tables, promotion status tokens, and conflict stop rules for intake drafts.

Does not own Diataxis authority of intake `.docx` files, feature implementation, or merge authorization.

## Current known truth

- Intake `.docx` files on `atlas/drive-draft-intake-2367` are non-authoritative.
- Dedup/merge authority is `docs/ops/reports/content-collection-docs-audit-dedup-2360.md` only.
- Rejected roots: `docs/ops/programs/`, `docs/reference/website/content-collection/`.

## Intended final state

Every intake draft has an approved target path or explicit `do_not_promote` / `deferred` disposition with trackable `promotion_status` tokens.

## Promotion rule

Intake `.docx` files are planning support only. Authority requires Markdown at the mapped path, a reviewed PR with one source issue, and issue linkage.

Dedup/merge authority: `docs/ops/reports/content-collection-docs-audit-dedup-2360.md` only — no parallel dedup doc.

## C7 path strategy (accepted #2360)

| Rejected | Approved |
| --- | --- |
| `docs/ops/programs/content-collection/**` | `docs/ops/pmo/`, `docs/ops/implementation-plans/`, `docs/how-to/ops/`, `docs/ops/reports/` |
| `docs/reference/website/content-collection/**` | `docs/reference/content/*` + Lou Gehrig website refs |

## Control documents (#2363)

| Drive draft | Approved path | promotion_status | Issue |
| --- | --- | --- | --- |
| Launch Readiness Checklist v2 | `docs/ops/pmo/content-collection-launch-readiness-checklist.md` | `promoted_to_repo` | #2363 |
| Parallel Execution Matrix | `docs/ops/pmo/content-collection-parallel-execution-matrix.md` | `promoted_to_repo` | #2363 |
| Cursor Parallel Worktree Standard | `docs/how-to/ops/cursor-parallel-worktree-standard.md` | `promoted_to_repo` | #2363 |
| Program Closeout Template | `docs/ops/pmo/content-collection-program-closeout-template.md` | `promoted_to_repo` | #2363 |
| Diataxis Promotion Map | `docs/ops/pmo/content-collection-diataxis-promotion-map.md` | `pr_open` | #2363 |
| Package Index | `docs/ops/implementation-plans/content-collection/package-index.md` | `promoted_to_repo` | #2361, #2363 |
| Documentation Dedup Plan | `docs/ops/reports/content-collection-docs-audit-dedup-2360.md` | `complete` | #2360 |

## Package paths

| Package | Path | promotion_status | Issue |
| --- | --- | --- | --- |
| CC-001–VAL-001 | `docs/ops/implementation-plans/content-collection/packages/` | `promoted_to_repo` | #2361 |
| GAL-001–CLUB-001 | same cluster | `promoted_to_repo` | #2362 (#2415) |

## Deferred / do not promote

| Item | Disposition |
| --- | --- |
| Accelerated Policy | do_not_promote until rewrite (C1/C8) |
| Digital Asset Standard | deferred pending Owns review |
| Issue-body packs | GitHub-only |
| Deferred/risk registers | #2364 scope |

## Promotion status values

`planned` | `draft` | `promoted_to_repo` | `pr_open` | `merged_pending_validation` | `validated` | `complete` | `deferred` | `do_not_promote`

## Conflicts — stop without ChatGPT/Bill disposition

C1 pre-approved merge; C2 Codex active; C3/C4 parallel contracts; C5 dual validation authority; C6 parallel labels; C8 gate weakening.

## Validation

```bash
bash scripts/ci/docs_check_headers.sh
node scripts/ci/diataxis_folder_audit.mjs
node .agents/checks/agent-governance-check.mjs
```

## Procedure

1. Read #2360 disposition before adding rows.
2. Enrich with `git ls-files` verification.
3. Open one-issue docs PR with exact allowlist.
4. Update `promotion_status` column after merge.
