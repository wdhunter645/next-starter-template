---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Legacy public-core website issue reconciliation for Program #1255 child project #1259
Does Not Own: GitHub issue closure or label mutation, application code, workflow YAML, or child issue creation
Canonical Reference: /docs/ops/implementation-plans/website-qa-production-validation.md
Related Issues: #1255, #1256, #1258, #1259, #1053, #1112, #943, #946, #947, #1013, #1014, #1015, #1016, #1017, #1108, #1109, #1110, #1111, #1500
Last Reviewed: 2026-06-15
---

# Website QA / Production Validation — Legacy issue reconciliation

## Purpose

Reconcile legacy website coordination issue `#1053` and public-core T21–T34 / T50
child issues against current `main` as-built state for Program #1255 child project
`#1259`. This report supports Phase 3 planning only.

## Boundary

- No GitHub issues closed or relabeled in this planning pass
- No implementation child issues created
- Merge evidence and file paths on `main` are the primary source of truth; GitHub
  issue labels are not authoritative unless reconciled against repo docs and
  as-built evidence

Assessment date: **2026-06-15** (`main` after `#1258` terminal merge PR `#1652`).

## Reconciliation table

| issue | Legacy title / intent | Current state | As-built evidence | Proposed #1259 disposition | Proposed child task | Notes / blocker |
| --- | --- | --- | --- | --- | --- | --- |
| `#1053` | LGFC Website Implementation Coordination (T21–T50 serial map) | Open | Body lists outdated queue head; mixed lifecycle labels | **Subordinated** — historical index under `#1255`; planning authority is `#1259` for QA | Task 008 | Do not use as implementation authority |
| `#943` | [T21] FAQ page functionality | Open | `status:post-merge-verify` | **Satisfied on main** — post-merge verification / disposition | Task 008 | `src/app/faq/**`; prior Phase 1 website PR history |
| `#946` | [T22] Ask-a-question intake | Open | `status:post-merge-verify` | **Satisfied on main** | Task 008 | `src/app/ask/**`; prior Phase 1 website PR history |
| `#947` | [T23-E] Events page | Open | `status:post-merge-verify` | **Satisfied on main** | Task 008 | Public events surface; verify against `src/app/**` |
| `#1013` | [T30] FanClub shell | Open | Mixed lifecycle labels | **Satisfied on main** | Task 003 | `src/app/fanclub/**`; T30–T35 merge evidence |
| `#1014` | [T31] Profile / member card | Open | Mixed lifecycle labels | **Satisfied on main** | Task 003 | FanClub profile surfaces |
| `#1015` | [T32] Library / memorabilia | Open | Mixed lifecycle labels | **Satisfied on main** | Task 006 | `src/app/fanclub/library/**` or equivalent |
| `#1016` | [T33] Social Wall | Open | Mixed lifecycle labels | **Satisfied on main** | Task 006 | FanClub social surfaces |
| `#1017` | [T34] Homepage D1 wiring | Open | Mixed lifecycle labels | **Satisfied on main** | Task 006 | PR `#1101` tracker closeout; homepage D1 composition |
| `#1108` | [T25] Search experience completion | Open | `pr-draft`, `post-merge-verify` | **Satisfied on main** | Task 002 | PR `#1130`; `src/app/search/**` |
| `#1109` | [T26] Mobile navigation / responsive | Open | `pr-draft`, `post-merge-verify` | **Satisfied on main** | Task 004 | PR `#1166`; post-merge fix PR `#1178` |
| `#1110` | [T28] Join/Login UX / auth-state | Open | `pr-draft`, `post-merge-verify` | **Satisfied on main** | Task 003 | PRs `#1149`, `#1150`, `#1152`, `#1155` |
| `#1111` | [T29] D1/B2 fail-closed validation | Open | `pr-draft`, `post-merge-verify` | **Satisfied on main** | Task 005 | PR `#1169`; public read-path verification |
| `#1112` | [T50] Launch readiness QA / production validation | Open | `status:pr-draft` / queued labels | **Partially satisfied** | Task 007 | PR `#1221` merged; **H-011** scheduled launch-readiness e2e not in CI |

## Cross-reference: `#1053` body drift

`#1053` still lists outdated queue heads and T40–T50 backlog language. Merge
evidence through PR `#1221`, Phase 0 reconciliation
(`docs/ops/reports/program-2-website-phase0-reconciliation.md`), and `#1258`
completion (PR `#1652`) supersede that body for planning. `#1259` must not revive
the old serial queue head.

## Genuine gaps (not greenfield rebuilds)

| Gap | Evidence | Route |
| --- | --- | --- |
| H-011 launch-readiness CI scheduling | Program 1 operational health review; `#1112` / PR `#1221` | Task 007 |
| Stale GitHub lifecycle labels on T21–T34 issues | Worklist CLOSED vs GitHub OPEN | Task 008 disposition batch |
| Public route/nav/auth validation evidence | As-built reconciliation dated 2026-06-05 | Tasks 002–004 |
| Content inventory public render spot-check | `#1256` complete; model in `docs/reference/website/content-inventory-model.md` | Task 006 |
| Production deploy preview confidence | Deferred from `#1258` runbooks | Task 009 QA report |
| Fan Club PDF/upload edge cases | Deferred from `#1258` runbooks | Task 009 or bounded follow-up |

## Out of scope for `#1259` legacy table

T40–T49 (`#1118`–`#1127`) are reconciled under `#1258`. See
`docs/ops/reports/website-operations-admin-legacy-issue-reconciliation.md` and
`docs/ops/reports/website-operations-admin-legacy-disposition-package.md`.

## Recommended disposition comments (deferred)

Atlas/Bill may authorize Task 008 to publish copy-paste disposition comments for
`#943`–`#947`, `#1013`–`#1017`, `#1108`–`#1111`, and a bounded disposition for
`#1112` (partially satisfied with H-011 caveat). This planning pass does **not**
execute that batch.

## Validation

```bash
./scripts/ci/docs_check_headers.sh docs/ops/reports/website-qa-production-validation-legacy-issue-reconciliation.md
```
