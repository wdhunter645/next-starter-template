---
Doc Type: Operations
Audience: Atlas, Bill, LGFC maintainers, and AI implementation agents
Authority Level: Controlled
Owns: Recommended GitHub disposition comments for legacy public-core website issues under #1259 Task 008
Does Not Own: GitHub issue mutation, label changes, bulk closure execution, or workflow YAML
Canonical Reference: /docs/ops/reports/website-qa-production-validation-legacy-issue-reconciliation.md
Related issues: #1255, #1256, #1258, #1259, #1053, #943, #946, #947, #1013, #1014, #1015, #1016, #1017, #1108, #1109, #1110, #1111, #1112, #1500
Last Reviewed: 2026-06-17
---

# Website QA / Production Validation — Legacy Disposition Package

## Purpose

Task 008 deliverable for Program #1255 child project `#1259`. Publish
copy-paste disposition comments for Atlas batch review of `#1053` and public-core
T21–T34 / T50 issues (`#943`–`#947`, `#1013`–`#1017`, `#1108`–`#1112`) after
Phase 4 Tasks 001–007 validation complete. This package **does not** execute GitHub mutations.

## Boundary

- No issues closed, relabeled, or edited by this document pass
- No bulk close without explicit Atlas/Bill authorization
- Merge evidence on `main` and Phase 4 verification PRs are authoritative over stale issue labels
- Does not close `#1259` or authorize Program `#1255` terminal closeout

Assessment date: **2026-06-17** (`main` after Task 009 merge PR `#1751` merge
`fd17af2`; operator Task 008 authorization on `#1259`).

## Phase 4 verification index

| Task | Report | Merge evidence |
| --- | --- | --- |
| 001 | `website-qa-production-validation-as-built-gap-analysis.md` | PR `#1657` / `da02c01` |
| 002 | `website-qa-production-validation-route-nav-validation.md` | PR `#1662` / `2e811a6` |
| 003 | `website-qa-production-validation-auth-state-validation.md` | PR `#1667` / `0347b27` |
| 004 | `website-qa-production-validation-mobile-responsive-validation.md` | PR `#1672` / `5e10f72` |
| 005 | `website-qa-production-validation-d1-b2-read-path-validation.md` | PR `#1684` / `8893591` |
| 006 | `website-qa-production-validation-content-inventory-public-surface-validation.md` | PR `#1728` / `c170d3c` |
| 007 | `website-qa-production-validation-launch-readiness-h011-disposition.md` | PR `#1737` / `552fb8f` |
| 009 | `website-qa-production-validation-final-qa-handoff.md` | PR `#1751` / `fd17af2` |

Supporting planning artifact:
`docs/ops/reports/website-qa-production-validation-legacy-issue-reconciliation.md`.

## Disposition summary

| issue | Lane | Disposition | Original delivery | Phase 4 verification | Recommended issue action |
| --- | --- | --- | --- | --- | --- |
| `#1053` | Coordination | Subordinated historical index | N/A | Task 001 / 008 | Body update + pointer to `#1259`; closeout deferred to Atlas |
| `#943` | T21 FAQ | Satisfied on main | Phase 1 website history | Task 002 PR `#1662` | Comment + optional label normalization |
| `#946` | T22 Ask | Satisfied on main | Phase 1 website history | Task 002 PR `#1662` | Comment + optional label normalization |
| `#947` | T23-E Events | Satisfied on main | Phase 1 website history | Task 002 PR `#1662` | Comment + optional label normalization |
| `#1013` | T30 FanClub shell | Satisfied on main | T30–T35 merge evidence | Task 003 PR `#1667` | Comment + optional label normalization |
| `#1014` | T31 Profile | Satisfied on main | T30–T35 merge evidence | Task 003 PR `#1667` | Comment + optional label normalization |
| `#1015` | T32 Library | Satisfied on main | T30–T35 merge evidence | Task 006 PR `#1728` | Comment + optional label normalization |
| `#1016` | T33 Social Wall | Satisfied on main | T30–T35 merge evidence | Task 006 PR `#1728` | Comment + optional label normalization |
| `#1017` | T34 Homepage D1 | Satisfied on main | PR `#1101` | Task 006 PR `#1728` | Comment; `homepage_*` deferred consumers documented |
| `#1108` | T25 Search | Satisfied on main | PR `#1130` | Task 002 PR `#1662` | Comment + optional label normalization |
| `#1109` | T26 Mobile / responsive | Satisfied on main | PR `#1166`; fix `#1178` | Task 004 PR `#1672` | Comment; clear `pr-draft` / `post-merge-verify` if present |
| `#1110` | T28 Auth / Join-Login | Satisfied on main | PRs `#1149`, `#1150`, `#1152`, `#1155` | Task 003 PR `#1667` | Comment + optional label normalization |
| `#1111` | T29 D1/B2 fail-closed | Satisfied on main | PR `#1169` | Task 005 PR `#1684` | Comment + optional label normalization |
| `#1112` | T50 Launch readiness | Partially satisfied — bounded deferral | PR `#1221` | Task 007 PR `#1737` | Comment; **do not** claim full CI schedule closure |

## Recommended disposition comments

Post the following comments only when Atlas/Bill authorizes the disposition batch.
Adjust merge SHAs if replaying on a different branch snapshot.

### #1053 — coordination umbrella

```markdown
## #1259 disposition — coordination subordinated (Task 008)

Program #1255 child project **#1259** is the active Website QA / Production Validation authority for public-core T21–T34 / T50 lanes.

This issue remains a **historical T21–T50 index** only. Public-core implementation and Phase 4 validation evidence supersede the outdated serial queue head in this issue body.

**Evidence:**
- Reconciliation: `docs/ops/reports/website-qa-production-validation-legacy-issue-reconciliation.md`
- Disposition package: `docs/ops/reports/website-qa-production-validation-legacy-disposition-package.md`
- Final handoff: `docs/ops/reports/website-qa-production-validation-final-qa-handoff.md`

**Recommended follow-up (Atlas):** Update issue body to point at #1259; do not use this issue as an implementation queue head. Closeout timing is an Atlas/Bill decision.
```

### #943 — T21 FAQ page functionality

```markdown
## #1259 disposition — satisfied on main (Task 002)

FAQ public surface is implemented and route-validated under Program #1259 Phase 4 Task 002.

**As-built:** `src/app/faq/**`
**Phase 4 verification:** PR `#1662` — `docs/ops/reports/website-qa-production-validation-route-nav-validation.md`

`status:post-merge-verify` is stale if still present. No greenfield rebuild required.
```

### #946 — T22 Ask-a-question intake

```markdown
## #1259 disposition — satisfied on main (Task 002)

Ask-a-question intake is implemented and route-validated under Program #1259 Phase 4 Task 002.

**As-built:** `src/app/ask/**`
**Phase 4 verification:** PR `#1662` — `docs/ops/reports/website-qa-production-validation-route-nav-validation.md`

`status:post-merge-verify` is stale if still present. No greenfield rebuild required.
```

### #947 — T23-E Events page

```markdown
## #1259 disposition — satisfied on main (Task 002)

Public events surface is implemented and route-validated under Program #1259 Phase 4 Task 002.

**As-built:** `src/app/events/**`
**Phase 4 verification:** PR `#1662` — `docs/ops/reports/website-qa-production-validation-route-nav-validation.md`

`status:post-merge-verify` is stale if still present. No greenfield rebuild required.
```

### #1013 — T30 FanClub shell

```markdown
## #1259 disposition — satisfied on main (Task 003)

FanClub shell routes, layout gate, and auth-state contracts are validated under Program #1259 Phase 4 Task 003.

**As-built:** `src/app/fanclub/**`
**Phase 4 verification:** PR `#1667` — `docs/ops/reports/website-qa-production-validation-auth-state-validation.md`

Mixed lifecycle labels are stale if still present. No greenfield rebuild required.
```

### #1014 — T31 Profile / member card

```markdown
## #1259 disposition — satisfied on main (Task 003)

FanClub profile / member card surfaces are validated under Program #1259 Phase 4 Task 003 auth-state matrix.

**As-built:** FanClub profile routes under `src/app/fanclub/**`
**Phase 4 verification:** PR `#1667` — `docs/ops/reports/website-qa-production-validation-auth-state-validation.md`

Mixed lifecycle labels are stale if still present.
```

### #1015 — T32 Library / memorabilia

```markdown
## #1259 disposition — satisfied on main (Task 006)

FanClub library / memorabilia public inventory surface is wired and validated under Program #1259 Phase 4 Task 006.

**As-built:** `src/app/fanclub/library/**` (or equivalent public surface)
**Phase 4 verification:** PR `#1728` — `docs/ops/reports/website-qa-production-validation-content-inventory-public-surface-validation.md`

Mixed lifecycle labels are stale if still present.
```

### #1016 — T33 Social Wall

```markdown
## #1259 disposition — satisfied on main (Task 006)

FanClub social wall public surface is validated under Program #1259 Phase 4 Task 006 content-inventory checks.

**As-built:** FanClub social surfaces under `src/app/fanclub/**`
**Phase 4 verification:** PR `#1728` — `docs/ops/reports/website-qa-production-validation-content-inventory-public-surface-validation.md`

Mixed lifecycle labels are stale if still present.
```

### #1017 — T34 Homepage D1 wiring

```markdown
## #1259 disposition — satisfied on main (Task 006)

Homepage D1 composition and public content-inventory wiring are validated under Program #1259 Phase 4 Task 006.

**Original delivery:** PR `#1101` tracker closeout
**Phase 4 verification:** PR `#1728` — `docs/ops/reports/website-qa-production-validation-content-inventory-public-surface-validation.md`

**Pass-with-note:** `homepage_*` inventory sections remain deferred consumers (not a launch blocker). Mixed lifecycle labels are stale if still present.
```

### #1108 — T25 Search experience completion

```markdown
## #1259 disposition — satisfied on main (Task 002)

Search experience is implemented and route-validated under Program #1259 Phase 4 Task 002.

**Original delivery:** PR `#1130`
**As-built:** `src/app/search/**`
**Phase 4 verification:** PR `#1662` — `docs/ops/reports/website-qa-production-validation-route-nav-validation.md`

`pr-draft` / `post-merge-verify` labels are stale if still present.
```

### #1109 — T26 Mobile navigation / responsive

```markdown
## #1259 disposition — satisfied on main (Task 004)

Mobile navigation and responsive contracts are validated under Program #1259 Phase 4 Task 004.

**Original delivery:** PR `#1166`; post-merge fix PR `#1178`
**Phase 4 verification:** PR `#1672` — `docs/ops/reports/website-qa-production-validation-mobile-responsive-validation.md`

`pr-draft` / `post-merge-verify` labels are stale if still present. Operator viewport smoke remains optional.
```

### #1110 — T28 Join/Login UX / auth-state

```markdown
## #1259 disposition — satisfied on main (Task 003)

Join/Login UX and guest/member/admin auth-state contracts are validated under Program #1259 Phase 4 Task 003.

**Original delivery:** PRs `#1149`, `#1150`, `#1152`, `#1155`
**Phase 4 verification:** PR `#1667` — `docs/ops/reports/website-qa-production-validation-auth-state-validation.md`

`pr-draft` / `post-merge-verify` labels are stale if still present. Fanclub true-unauth redirect e2e remains pass-with-note only.
```

### #1111 — T29 D1/B2 fail-closed validation

```markdown
## #1259 disposition — satisfied on main (Task 005)

Public D1/B2 read-path fail-closed behavior is validated under Program #1259 Phase 4 Task 005.

**Original delivery:** PR `#1169`
**Phase 4 verification:** PR `#1684` — `docs/ops/reports/website-qa-production-validation-d1-b2-read-path-validation.md`

`pr-draft` / `post-merge-verify` labels are stale if still present. Production curl smoke remains optional.
```

### #1112 — T50 Launch readiness QA / production validation

```markdown
## #1259 disposition — partially satisfied with bounded deferral (Task 007)

Launch-readiness tooling is **satisfied on main**; scheduled static-export Playwright `launch-readiness:e2e` in CI is **not wired** (H-011 bounded deferral with operator sign-off).

**Original delivery:** PR `#1221` — manifest, orchestrator, Playwright specs
**Phase 4 verification:** PR `#1737` — `docs/ops/reports/website-qa-production-validation-launch-readiness-h011-disposition.md`

**Disposition:** Partially satisfied — bounded deferral. Manual pre-release path: `npm run launch-readiness`.

**Do not** close this issue as fully satisfied until Atlas accepts H-011 CI scheduling deferral or authorizes a workflow PR. `status:pr-draft` / queued labels are stale if still present.

**Program boundary:** Full CI reliability scope remains `#1500`, not `#1259`.
```

## Atlas batch checklist

Before posting comments or normalizing labels:

1. Confirm `main` matches assessment date merge `fd17af2` or later Task 008 merge.
2. Post comments only for issues Atlas intends to disposition in this batch.
3. Remove stale workflow labels (`status:post-merge-verify`, `pr-draft`, erroneous `status:failed`) when normalizing — keep domain labels (`type:website`, `website`).
4. **Do not close `#1259`** — umbrella remains open until Program `#1255` terminal closeout.
5. For `#1112`, prefer **comment + label normalization** over premature closure.

## Validation commands

```bash
npm test -- tests/website-qa-legacy-disposition-package.test.ts

npm run typecheck

printf '%s\n' \
  docs/ops/reports/website-qa-production-validation-legacy-disposition-package.md \
  > /tmp/task008-docs-header-list.txt
DOCS_HEADER_FILE_LIST=/tmp/task008-docs-header-list.txt ./scripts/ci/docs_check_headers.sh .
```

## Acceptance mapping (Task 008)

| Criterion | Result |
| --- | --- |
| Disposition package ready for Atlas batch review | **Pass** — this document |
| Copy-paste comments for `#943`–`#1112` | **Pass** — see recommended comments |
| No unauthorized GitHub mutation | **Pass** — documentation only |
| H-011 / `#1112` bounded deferral preserved | **Pass** — Task 007 authority cited |
