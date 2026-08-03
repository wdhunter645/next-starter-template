---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Project #2778 Task 003 (#2892) B2 and integrated runtime read-only validation evidence
Does Not Own: Cloudflare/D1 validation (#2891), Promotion Candidate qualification (#2893), Production mutation, secret values
Canonical Reference: /docs/governance/PLATFORM-AND-ENVIRONMENT.md
Related Issues: #2778, #2892, #2891, #2890
Last Reviewed: 2026-08-03
---

# Platform production validation — B2 / integrated runtime checks (#2892)

## Purpose

Task **#2778-003 / #2892** deliverable: repeatable **read-only** checks for Backblaze B2
endpoint/bucket/access-scope metadata, CORS documentation and probe, media read-path
normalization, sync/protected-stop assumptions, preview isolation for B2 write paths,
and representative public/admin/API integration without unauthorized mutation.

## Tooling

| Item | Path |
| --- | --- |
| Validator | `scripts/ci/platform-b2-runtime-validation.mjs` |
| npm script | `npm run validate:platform-b2-runtime` |
| Unit tests | `tests/platform-b2-runtime-validation.test.mjs` |
| Flags | `--json`, `--skip-http`, `--help` |

Guarantees:

- `productionMutation: false` and `writeAttempts: 0` on every run.
- Credential values from `B2_*` / related secret env keys are redacted from operator output.
- Live `ListObjectsV2` requires `B2_KEY_ID`, `B2_APP_KEY`, `B2_ENDPOINT`, `B2_BUCKET` plus `aws` CLI; without them the step is **fail-closed** (recorded, not attempted).
- No PutObject/DeleteObject symbols in Pages Functions; admin sync remains POST-only + `requireAdmin`.

## Assessment identity

| Field | Value |
| --- | --- |
| Observed at (UTC) | 2026-08-03T15:36:02Z |
| Actor role | Implementation / Operations (Cursor Local) |
| Source issue | #2892 |
| Parent project | #2778 |
| Component branch | `component/platform-production-validation` |
| Candidate SHA inspected (component head at run) | `36f19496e204bb7287d8e22783a36db78bfb3ef6` |

## Results (this run)

Commands:

```bash
npx vitest run tests/platform-b2-runtime-validation.test.mjs
npm run validate:platform-b2-runtime
```

| Check | Result | Notes |
| --- | --- | --- |
| B2 inventory doc present | PASS | `docs/reference/platform/Backblaze_B2.md` |
| Bucket / endpoint metadata | PASS | `LouGehrigFanClub` / `s3.us-east-005.backblazeb2.com` |
| Env names documented | PASS | 5/5 in docs + `.env.example` (names only) |
| CORS documented | PASS (info) | Section present; console rule finalization may remain |
| `requireB2` fail-closed helper | PASS | `functions/_lib/b2.ts` |
| Runtime list-only | PASS | ListObjectsV2 only in `b2.ts` |
| Functions mutation scan | PASS | 121 files; no Put/Delete symbols |
| Admin sync protected-stop | PASS | POST-only, admin-gated, INSERT OR IGNORE |
| Sync tooling present | PASS | Incremental sync, deletion reconcile, workflow, README |
| Media read-path URL normalize | PASS | friends/milestones/photos list+get |
| Preview isolation B2 rules | PASS | runtime list read-only; sync paths production-shared + blocking |
| Preview no Production write via GET | PASS | Admin sync GET → 405 |
| Public `/api/health` www | PASS | `ok=true` |
| Public media/API GETs www | PASS (info) | photos/friends/milestones/matchup-results 200 |
| Admin sync GET www | PASS (info) | 405 Method not allowed |
| Public `/api/health` pages.dev | PASS | `ok=true` |
| Public media/API GETs pages.dev | PASS (info) | 200 on representative reads |
| Admin sync GET pages.dev | PASS (info) | 405 Method not allowed |
| Public B2 endpoint HEAD | PASS (info) | bucket root HEAD → 403 (endpoint reachable; listing denied anonymously) |
| Public B2 CORS OPTIONS | PASS (info) | 403; no ACAO header observed (CDN/same-origin may still serve media) |
| Live B2 list read | FAIL-CLOSED | No B2 credentials in Cursor Local runtime |

Overall tooling `ok=true` (blocking failures: none). Unit tests: **6 passed**.

## Protected follow-ups (not in this PR)

1. Credentialed operator run of `npm run validate:platform-b2-runtime` with B2 secrets + `aws` CLI to clear `live_b2_list_read`.
2. Console CORS rule finalization documentation when Product Authority authorizes console inspection/update.
3. Promotion Candidate qualification remains #2893.

## Rollback

Revert this component PR. Disable by removing the npm script / not invoking the validator. No Production configuration, B2 object, or D1 row was changed.
