---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Legacy ops/admin issue reconciliation for Program #1255 child project #1258
Does Not Own: GitHub issue closure or label mutation, application code, workflow YAML, or child issue creation
Canonical Reference: /docs/ops/implementation-plans/website-operations-admin.md
Related Issues: #1255, #1258, #1053, #1118, #1119, #1120, #1121, #1122, #1123, #1124, #1125, #1126, #1127
Last Reviewed: 2026-06-10
---

# Website Operations Admin — Legacy Issue Reconciliation

## Purpose

Reconcile legacy website coordination issue `#1053` and T40–T49 child issues
(`#1118`–`#1127`) against current `main` as-built state for Program #1255
child project `#1258`. This report supports Phase 3 planning only.

## Boundary

- No GitHub issues closed or relabeled in this document pass
- No implementation child issues created
- Merge evidence and file paths on `main` are the primary source of truth; GitHub issue labels are not authoritative unless reconciled against repo docs and as-built evidence

Assessment date: **2026-06-10**.

## Reconciliation table

| issue | Legacy title / intent | Current state | As-built evidence | Proposed #1258 disposition | Proposed child task | Notes / blocker |
| --- | --- | --- | --- | --- | --- | --- |
| `#1053` | LGFC Website Implementation Coordination (T21–T50 serial map) | Open | Body lists outdated “current task” (T25); labels `status:active` + `status:post-merge-verify` | **Subordinated** — retain as historical index under `#1255`; planning authority is `#1258` | Task 013 (disposition docs) | **Atlas/Bill decision:** update body vs later closeout; do not use as implementation authority |
| `#1118` | [T40] Fan Club operational workflows | Open | Labels `pr-draft`, `post-merge-verify` | **Satisfied on main** — verification/hardening only | Task 003 | PR `#1171` merged; `src/app/fanclub/**`, `functions/api/fanclub/**`, discussions/library/photos APIs |
| `#1119` | [T41] Admin operating shell and member operations | Open | Labels `pr-draft`, `post-merge-verify` | **Satisfied on main** | Task 004 | PR `#1174`; `src/app/admin/page.tsx`, `layout.tsx`, `join-requests/`, `member-operations/`, `worklist/`, `AdminNav.tsx` |
| `#1120` | [T42] Moderation and review workflows | Open | Labels `pr-draft`, `post-merge-verify` | **Satisfied on main** | Task 005 | PR `#1176`; `src/app/admin/moderation/`, `faq/`, `functions/api/admin/faq/**`, `ask/**`, `reports/**` |
| `#1121` | [T43] Content management workflows | Closed | Labels `pr-draft`, `post-merge-verify` (stale) | **Satisfied on main** — CMS delta review | Task 006 | PR `#1186`; `src/app/admin/cms/`, `content/`, `functions/api/admin/cms/**`, `content/**` |
| `#1122` | [T44] Media management workflows | Open | Labels `pr-draft`, `post-merge-verify` | **Satisfied on main** | Task 007 | PR `#1188`; `src/app/admin/media-assets/`, `functions/api/admin/media-assets/**` |
| `#1123` | [T45] Editorial/archive systems | Closed | `status:complete` + `pr-draft` (conflict) | **Satisfied on main** — align with `#1256` inventory | Task 008 | PR `#1192`; `src/app/admin/editorial/`, `functions/api/admin/editorial/**` | **Atlas/Bill decision:** confirm `#1256` owns content authority; `#1123` is ops alignment only |
| `#1124` | [T46] Event/calendar administration | Open | `status:failed` + `pr-draft` (erroneous) | **Satisfied on main** | Task 009 | PR `#1205`; `src/app/admin/events/`, `functions/api/admin/events/**`, `functions/api/events/**` |
| `#1125` | [T47] Charity/fundraiser administration | Closed | `status:complete` + `status:failed` (conflict) | **Satisfied on main** | Task 010 | PR `#1211`; `src/app/admin/fundraiser-preview/` |
| `#1126` | [T48] Matchup administration | Closed | `status:complete` + `pr-draft` | **Satisfied on main** | Task 011 | PR `#1212`; `src/app/admin/matchup/`, `functions/api/admin/matchup/**`, `functions/api/matchup/**` |
| `#1127` | [T49] Audit/reporting systems | Open | `status:failed` + `post-merge-verify` | **Satisfied on main** | Task 012 | PR `#1216`; `src/app/admin/audit/`, `functions/api/admin/export.ts`, `stats.ts`, `reports/**` |

## Cross-reference: `#1053` body drift

`#1053` still lists T25 as “Current Website Task” and T40–T50 as “Queued Operational
Systems.” Merge evidence through PR `#1216` and Phase 0 reconciliation
(`docs/ops/reports/program-2-website-phase0-reconciliation.md`) supersede that
body for planning. `#1258` must not revive the old serial queue head.

## Genuine gaps (not greenfield rebuilds)

| Gap | Evidence | Route |
| --- | --- | --- |
| Access model documentation drift | `docs/reference/architecture/access-model.md` vs `src/app/admin/layout.tsx` + `functions/_lib/auth.ts` | Task 002 |
| Operator runbooks missing for several admin surfaces | Admin pages exist; how-to coverage incomplete | Task 013 |
| Legacy issue lifecycle labels stale | 8+ issues with `pr-draft` / `post-merge-verify` / `status:failed` conflicts | Task 013 + Atlas disposition batch |
| Editorial ops boundary with `#1256` | Both `#1123` and `#1256` touch editorial/archive | **Atlas/Bill decision** |
| Production QA / launch CI | H-011 in Phase 0 report | **`#1259`** — out of `#1258` scope |

## Recommended disposition comments (deferred)

Atlas/Bill may authorize a separate batch to:

1. Post merge-evidence disposition comments on `#1118`–`#1127`
2. Normalize lifecycle labels to `status:complete` where merge evidence accepted
3. Update `#1053` body with pointer to this report and `#1258` as active ops head

This planning pass does **not** execute that batch.

## Validation

```bash
./scripts/ci/docs_check_headers.sh docs/ops/reports/website-operations-admin-legacy-issue-reconciliation.md
```
