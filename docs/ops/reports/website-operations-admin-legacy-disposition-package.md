---
Doc Type: Operations
Audience: Atlas, Bill, LGFC maintainers, and AI implementation agents
Authority Level: Controlled
Owns: Recommended GitHub disposition comments for legacy Website Operations Admin issues under #1258 Task 013
Does Not Own: GitHub issue mutation, label changes, or bulk closure execution
Canonical Reference: /docs/ops/reports/website-operations-admin-legacy-issue-reconciliation.md
Related issues: #1255, #1258, #1565, #1053, #1118, #1119, #1120, #1121, #1122, #1123, #1124, #1125, #1126, #1127
Last Reviewed: 2026-06-14
---

# Website Operations Admin — Legacy Disposition Package

## Purpose

Provide copy-paste disposition comments for Atlas batch review of `#1053` and
`#1118`–`#1127` after Phase 4 Tasks 003–012 complete. This package **does not**
execute GitHub mutations.

## Boundary

- No issues closed, relabeled, or edited by this document pass
- No bulk close without explicit Atlas/Bill authorization
- Merge evidence on `main` and Phase 4 verification PRs are authoritative over stale issue labels

Assessment date: **2026-06-14** (after Task 012 merge PR `#1651`).

## Operator runbook index

Per-surface runbooks published under `docs/how-to/website/`:

| Legacy lane | Runbook |
| --- | --- |
| Overview | [admin-operations-overview.md](../../how-to/website/admin-operations-overview.md) |
| `#1118` T40 Fan Club | [fanclub-operational-workflows.md](../../how-to/website/fanclub-operational-workflows.md) |
| `#1119` T41 Admin shell | [admin-dashboard-and-member-operations.md](../../how-to/website/admin-dashboard-and-member-operations.md) |
| `#1120` T42 Moderation | [admin-moderation-and-faq.md](../../how-to/website/admin-moderation-and-faq.md) |
| `#1121` T43 CMS/content | [admin-cms-and-page-content.md](../../how-to/website/admin-cms-and-page-content.md) |
| `#1123` T45 Editorial | [admin-editorial-archive-operations.md](../../how-to/website/admin-editorial-archive-operations.md) |
| `#1122` T44 Media | [admin-media-assets.md](../../how-to/website/admin-media-assets.md) |
| `#1124` T46 Events | [admin-events-calendar.md](../../how-to/website/admin-events-calendar.md) |
| `#1125` T47 Fundraiser | [admin-fundraiser-preview.md](../../how-to/website/admin-fundraiser-preview.md) |
| `#1126` T48 Matchup | [admin-matchup.md](../../how-to/website/admin-matchup.md) |
| `#1127` T49 Audit | [admin-audit-and-reporting.md](../../how-to/website/admin-audit-and-reporting.md) |
| D1 diagnostic | [admin-d1-inspect.md](../../how-to/website/admin-d1-inspect.md) |

## Disposition summary

| issue | Disposition | Original merge | Phase 4 verification | Recommended issue action |
| --- | --- | --- | --- | --- |
| `#1053` | Subordinated historical index | N/A (coordination) | Task 013 docs | Body update + pointer to `#1258`; closeout deferred to Atlas |
| `#1118` | Satisfied on main | PR `#1171` | Task 003 PR `#1536` | Comment + optional `status:complete` label normalization |
| `#1119` | Satisfied on main | PR `#1174` | Task 004 PR `#1542` | Comment + optional label normalization |
| `#1120` | Satisfied on main | PR `#1176` | Task 005 PR `#1551` | Comment + optional label normalization |
| `#1121` | Satisfied on main | PR `#1186` | Task 006 PR `#1572` | Comment + optional label normalization |
| `#1122` | Satisfied on main | PR `#1188` | Task 007 PR `#1571` | Comment + optional label normalization |
| `#1123` | Satisfied on main | PR `#1192` | Task 008 PR `#1582` | Comment; editorial authority remains `#1256` |
| `#1124` | Satisfied on main | PR `#1205` | Task 009 PR `#1596` | Comment; clear erroneous `status:failed` if present |
| `#1125` | Satisfied on main | PR `#1211` | Task 010 PR `#1646` | Comment; clear label conflicts if present |
| `#1126` | Satisfied on main | PR `#1212` | Task 011 PR `#1648` | Comment + optional label normalization |
| `#1127` | Satisfied on main | PR `#1216` | Task 012 PR `#1651` | Comment; clear erroneous `status:failed` if present |

## Recommended disposition comments

Post the following comments only when Atlas/Bill authorizes the disposition batch.
Adjust merge SHAs if replaying on a different branch snapshot.

### `#1053` — coordination umbrella

```markdown
## #1258 disposition — coordination subordinated (Task 013)

Program #1255 child project **#1258** is the active Website Operations Admin authority.

This issue remains a **historical T21–T50 index** only. T40–T49 implementation merged
2026-06-02–2026-06-03 (PRs `#1171`–`#1216`). Phase 4 verification Tasks 003–012
completed under #1258 (2026-06).

**Evidence:**
- Reconciliation: `docs/ops/reports/website-operations-admin-legacy-issue-reconciliation.md`
- Disposition package: `docs/ops/reports/website-operations-admin-legacy-disposition-package.md`
- Operator runbooks: `docs/how-to/website/admin-operations-overview.md`

**Recommended follow-up (Atlas):** Update issue body to point at #1258; do not use
this issue as an implementation queue head. Closeout timing is an Atlas/Bill decision.
```

### `#1118` — T40 Fan Club operational workflows

```markdown
## #1258 disposition — satisfied on main (Task 003)

Fan Club operational paths are implemented and verification-hardened under Program #1258 Task 003.

**Original delivery:** PR `#1171`
**Phase 4 verification:** PR `#1536` (issue `#1557` area / Task 003)
**Operator runbook:** `docs/how-to/website/fanclub-operational-workflows.md`

Remaining production PDF/upload edge cases may defer to #1259. No greenfield rebuild required.
```

### `#1119` — T41 Admin shell and member operations

```markdown
## #1258 disposition — satisfied on main (Task 004)

Admin dashboard, join requests, worklist, member operations, and D1 inspect token UX
are hardened under Program #1258 Task 004.

**Original delivery:** PR `#1174`
**Phase 4 verification:** PR `#1542`
**Operator runbook:** `docs/how-to/website/admin-dashboard-and-member-operations.md`

`footer-quotes` admin UI remains deferred. Labels `pr-draft` / `post-merge-verify` are stale if still present.
```

### `#1120` — T42 Moderation and review workflows

```markdown
## #1258 disposition — satisfied on main (Task 005)

Moderation hub, FAQ queue, Ask paths, and report admin APIs are verified under Task 005.

**Original delivery:** PR `#1176`
**Phase 4 verification:** PR `#1551`
**Operator runbook:** `docs/how-to/website/admin-moderation-and-faq.md`

Report closeout detail: `docs/how-to/website/admin-audit-and-reporting.md`
```

### `#1121` — T43 CMS and page content

```markdown
## #1258 disposition — satisfied on main (Task 006)

CMS blocks and page content admin surfaces match as-built inventory. Content strategy
authority remains Program #1256.

**Original delivery:** PR `#1186`
**Phase 4 verification:** PR `#1572`
**Operator runbook:** `docs/how-to/website/admin-cms-and-page-content.md`
```

### `#1122` — T44 Media management workflows

```markdown
## #1258 disposition — satisfied on main (Task 007)

Media asset inventory and B2 sync fail-closed UX verified under Task 007.

**Original delivery:** PR `#1188`
**Phase 4 verification:** PR `#1571`
**Operator runbook:** `docs/how-to/website/admin-media-assets.md`
```

### `#1123` — T45 Editorial/archive systems

```markdown
## #1258 disposition — satisfied on main (Task 008)

Editorial archive admin aligns with approved `content_inventory` model. Editorial
**authority** remains Program #1256; #1258 verified ops alignment only.

**Original delivery:** PR `#1192`
**Phase 4 verification:** PR `#1582`
**Operator runbook:** `docs/how-to/website/admin-editorial-archive-operations.md`
```

### `#1124` — T46 Event/calendar administration

```markdown
## #1258 disposition — satisfied on main (Task 009)

Events admin CRUD and seed paths verified; public calendar reads preserved.

**Original delivery:** PR `#1205`
**Phase 4 verification:** PR `#1596`
**Operator runbook:** `docs/how-to/website/admin-events-calendar.md`

Erroneous `status:failed` label (if present) is stale — implementation is on main.
```

### `#1125` — T47 Charity/fundraiser administration

```markdown
## #1258 disposition — satisfied on main (Task 010)

Fundraiser preview and campaign spotlight alignment verified under Task 010.

**Original delivery:** PR `#1211`
**Phase 4 verification:** PR `#1646`
**Operator runbook:** `docs/how-to/website/admin-fundraiser-preview.md`
```

### `#1126` — T48 Matchup administration

```markdown
## #1258 disposition — satisfied on main (Task 011)

Matchup create/update/close-active and public read comparison verified under Task 011.

**Original delivery:** PR `#1212`
**Phase 4 verification:** PR `#1648`
**Operator runbook:** `docs/how-to/website/admin-matchup.md`
```

### `#1127` — T49 Audit/reporting systems

```markdown
## #1258 disposition — satisfied on main (Task 012)

Audit page, stats, protected export, and report list/close hardened under Task 012.

**Original delivery:** PR `#1216`
**Phase 4 verification:** PR `#1651` (merge `6c79ca26c7b5bf2304c87b6732a48603f1d035e6`)
**Operator runbook:** `docs/how-to/website/admin-audit-and-reporting.md`

Erroneous `status:failed` label (if present) is stale — implementation is on main.
```

## Atlas batch execution checklist

When authorized:

1. Post disposition comments above (or edited variants) on each target issue.
2. Normalize lifecycle labels to `status:complete` where merge evidence is accepted.
3. Update `#1053` body with pointer to `#1258` and this disposition package.
4. Do **not** bulk-close without explicit authorization per issue.
5. Record batch completion in Program #1255 tracker when `#1258` terminal closeout is approved.

## Validation

```bash
./scripts/ci/docs_check_headers.sh \
  docs/ops/reports/website-operations-admin-legacy-disposition-package.md \
  docs/how-to/website/admin-operations-overview.md \
  docs/how-to/website/admin-dashboard-and-member-operations.md \
  docs/how-to/website/admin-moderation-and-faq.md \
  docs/how-to/website/admin-audit-and-reporting.md \
  docs/how-to/website/admin-cms-and-page-content.md \
  docs/how-to/website/admin-editorial-archive-operations.md \
  docs/how-to/website/admin-events-calendar.md \
  docs/how-to/website/admin-media-assets.md \
  docs/how-to/website/admin-fundraiser-preview.md \
  docs/how-to/website/admin-matchup.md \
  docs/how-to/website/admin-d1-inspect.md \
  docs/how-to/website/fanclub-operational-workflows.md
git diff --check
```
