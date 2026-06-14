---
Doc Type: How-To
Audience: LGFC operators, maintainers, and AI implementation agents
Authority Level: Operational Procedure
Owns: D1 inspect diagnostic procedure for operators
Does Not Own: D1 migrations, production data repair, or schema design
Canonical Reference: /docs/reference/architecture/access-model.md
Related Issues: #1258, #1565, #1119
Last Reviewed: 2026-06-14
---

# Admin D1 Inspect

## Purpose

Use `/admin/d1-test` to inspect D1 table counts, schemas, and sample rows without
direct SQL console access.

## Scope

Route: `/admin/d1-test`

API: `/api/admin/d1-inspect`

## Steps

1. Sign in as admin (session gate).
2. Open **D1 Inspect**.
3. Save the admin API token via `AdminTokenPanel` (same `localStorage` key as other admin pages).
4. Select a table; load schema and sample rows.
5. Use results for diagnostics only — not for bulk data mutation.

## Procedure

### Access

1. Navigate to **D1 Inspect**.
2. Save token when prompted (unified with other admin surfaces after Task 004).
3. Choose table from the selector.
4. Run inspect; review counts and sample JSON.

### Fail-closed expectations

- Missing `ADMIN_TOKEN` in environment → API `503`.
- Missing or wrong browser token → API `401`.
- UI remains session-gated like other `/admin/**` routes.

### Safety

- Do not paste production tokens into shared screens.
- Sample rows may contain operational data — handle per LGFC privacy policy.
- Schema inspection supports debugging; structural changes belong in authorized migration tasks.

## Verification

- Manual: inspect loads only with valid session and saved token.
- Cross-check `docs/reference/architecture/access-model.md` dual-gate table.

## Closeout Criteria

D1 inspect session is complete when the operator recorded the diagnostic finding and
escalated data fixes through authorized migration/ops channels if needed.
