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
endpoint/bucket/access-scope metadata, CORS documentation and representative preflight,
media read-path normalization, sync/protected-stop assumptions, preview isolation for B2
write paths, and representative public/admin/API integration without unauthorized mutation.

## Scope

In scope:

- Canonical validator `scripts/ci/platform-b2-runtime-validation.mjs`
- Focused unit/integration tests and this evidence report
- npm script `validate:platform-b2-runtime`
- Reconciliation of competing #3019 / #3020 implementations into one surface

Out of scope:

- Production mutation, B2 object writes/deletes, credential disclosure
- Promotion Candidate qualification (#2893)
- Cloudflare/D1 validation (#2891)
- Alternate validator filenames from superseded #3020 (`platform-b2-validation.*`)

## Current known truth

- Authoritative integrated land is PR **#3019** on `component/platform-production-validation`.
- PR **#3020** is the authorized reconciliation/remediation vehicle (not disposable).
- Single retained surface: `platform-b2-runtime-validation` (script, tests, evidence, npm script).
- Live credentialed `ListObjectsV2` is fail-closed in this Cursor Local runtime (no B2 secrets).
- Documented B2 CORS console finalization may remain incomplete; preflight probe does **not**
  report PASS on rejected OPTIONS responses.
- `/api/matchup/current` is excluded from read-only HTTP probes (GET can upsert/close matchups).

## Intended final state

One reviewed, mergeable component-child PR on #3020 that:

1. Preserves the strongest compatible read-only validation behavior from #3019 and #3020
2. Closes all six unresolved #3019 findings and both unresolved #3020 findings
3. Provides reproducible candidate identity (clean worktree SHA or explicit dirty identity)
4. Stops for independent OpenAI Work review without self-approval or self-merge

## Tooling

| Item | Path |
| --- | --- |
| Validator | `scripts/ci/platform-b2-runtime-validation.mjs` |
| npm script | `npm run validate:platform-b2-runtime` |
| Unit tests | `tests/platform-b2-runtime-validation.test.mjs` |
| Flags | `--json`, `--skip-http`, `--allow-dirty`, `--help` |

Guarantees:

- `productionMutation: false` and `writeAttempts: 0` on every run.
- Credential values from `B2_*` / related secret env keys are redacted exactly from operator output.
- Live `ListObjectsV2` requires `B2_KEY_ID`, `B2_APP_KEY`, `B2_ENDPOINT`, `B2_BUCKET` plus `aws` CLI; without them the step is **fail-closed** (`attempted: false`).
- Dirty worktrees refuse clean candidate evidence unless `--allow-dirty` (identity becomes `SHA+dirty:<hash>`).
- No B2 mutation APIs or B2-context HTTP PUT/DELETE/POST in Pages Functions; admin sync remains POST-only + `requireAdmin`.

## Comparison / disposition matrix (#3019 vs #3020)

| Capability | #3019 | #3020 | Disposition |
| --- | --- | --- | --- |
| Surface names | `platform-b2-runtime-validation` | `platform-b2-validation` | **Retain #3019 names** (already landed); do not reintroduce #3020 filenames |
| Exact secret redaction | Strong `redactSecrets` | Weak AKIA-only on CLI fail | **#3019 + sanitizeCliDetail** (exact values; never raw stdout) |
| Endpoint format parse | Missing | `parseB2Endpoint` | **Fold from #3020** |
| Deletion reconcile / smoke / photo-url | Missing | Present | **Fold from #3020** |
| Public on-disk read inventory | Narrow | 14 handlers (incl. side-effect) | **Fold 13 safe handlers; exclude `/api/matchup/current`** |
| Admin sync GET probe + timeout | Probe without timeout | Absent | **Retain #3019 + 12s timeout** |
| CORS probe | Any HTTP status = PASS | Absent | **Require 2xx + ACAO + GET; incomplete = not PASS** |
| Mutation scan | Literal SDK names | Literal markers | **Policy: APIs + aliases + B2-context HTTP methods** |
| Detail text vs `ok` | Misaligned | Partial | **Detail reflects computed `ok`** |
| Candidate identity | HEAD only | HEAD only | **Refuse dirty / record `SHA+dirty:<hash>`** |
| Representative HTTP success | `<500` / info | 2xx for 3 routes | **Require 2xx + `ok:true` (+ `db_ok` for health); blocking** |
| Evidence doc sections | Purpose-heavy | Purpose-heavy | **Add Scope / Current known truth / Intended final state** |

## Assessment identity

| Field | Value |
| --- | --- |
| Observed at (UTC) | 2026-08-03T16:04:31Z |
| Actor role | Implementation / Operations (Cursor Local) |
| Source issue | #2892 |
| Parent project | #2778 |
| Component branch | `component/platform-production-validation` |
| PR vehicle | #3020 |
| Candidate identity at dirty pre-commit run | `b417b895f954bd5ca8ffd72f9fad4a860ae36241+dirty:ef9361f60ae7385f` |
| Candidate SHA (authoritative post-commit) | _filled after clean commit validation_ |

## Results (this run)

Commands:

```bash
npx vitest run tests/platform-b2-runtime-validation.test.mjs
npm run validate:platform-b2-runtime -- --allow-dirty   # pre-commit dirty tree
# after commit:
npm run validate:platform-b2-runtime
```

| Check | Result | Notes |
| --- | --- | --- |
| Worktree identity | PASS (info/dirty allowed) | Dirty identity recorded; clean SHA required for final evidence |
| B2 inventory doc present | PASS | `docs/reference/platform/Backblaze_B2.md` |
| Bucket / endpoint metadata | PASS | `LouGehrigFanClub` / `s3.us-east-005.backblazeb2.com` |
| Env names documented | PASS | 5/5 in docs + `.env.example` (names only) |
| CORS documented | PASS (info) | Section present; console finalization may remain |
| `requireB2` fail-closed helper | PASS | Detail reflects computed ok |
| Runtime list-only | PASS | ListObjectsV2 only in `b2.ts` |
| Functions mutation policy scan | PASS | 121 files; APIs + B2-context HTTP methods |
| Photo URL public base | PASS | Folded from #3020 |
| Admin sync protected-stop | PASS | POST-only, admin-gated, INSERT OR IGNORE |
| Sync tooling present | PASS | Incremental sync, deletion reconcile, workflow, README |
| Media read-path URL normalize | PASS | friends/milestones/photos list+get |
| Public D1/B2 read paths on disk | PASS | 13 inventoried handlers (no matchup/current) |
| Preview isolation B2 rules | PASS | runtime list read-only; sync paths production-shared + blocking |
| Preview no Production write via GET | PASS | Admin sync GET → 405 |
| Deletion reconcile fail-closed | PASS | Empty inventory refused |
| Smoke script present | PASS | `list-objects-v2 --max-keys` |
| Public API GETs www + pages.dev | PASS | health/photos/friends/milestones/matchup-results require 2xx + ok |
| Admin sync GET bounded (timeout) | PASS | 405 on www and pages.dev |
| Public B2 CORS OPTIONS | INFO (not PASS) | 403; missing ACAO/GET — known debt |
| Public B2 endpoint HEAD | PASS (info) | 403 (reachable; listing denied anonymously) |
| Live B2 list read | FAIL-CLOSED | No B2 credentials; `attempted=false` |

Overall tooling `ok=true` (blocking failures: none). Unit tests: **13 passed**.

## Findings closed in this reconciliation

### From #3019

1. Fail-closed / list-only detail text reflects computed `ok`
2. Admin-sync GET probe uses 12s AbortSignal timeout
3. Mutation policy covers API names, aliases, and B2-context HTTP PUT/DELETE/POST
4. Representative API reads require 2xx + success payload; failures are blocking
5. CORS probe requires successful preflight + allowed origin + GET (incomplete ≠ PASS)
6. Dirty worktree refuses clean candidate evidence / records `SHA+dirty:<hash>`

### From #3020

1. Exact-secret redaction via `redactSecrets` + `sanitizeCliDetail` (no AKIA-only / raw stdout)
2. Evidence document includes Purpose, Scope, Current known truth, and Intended final state

## Protected follow-ups (not in this PR)

1. Credentialed operator run of `npm run validate:platform-b2-runtime` with B2 secrets + `aws` CLI to clear `live_b2_list_read`.
2. Console CORS rule finalization documentation when Product Authority authorizes console inspection/update.
3. Promotion Candidate qualification remains #2893 (held).

## Rollback

Revert this component PR on `component/platform-production-validation`. Disable by removing the npm script / not invoking the validator. No Production configuration, B2 object, or D1 row was changed.
