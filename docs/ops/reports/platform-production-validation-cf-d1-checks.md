---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Project #2778 Task 002 (#2891) Cloudflare Pages/Functions and D1 read-only validation evidence
Does Not Own: B2 validation (#2892), Promotion Candidate qualification (#2893), Production mutation, secret values
Canonical Reference: /docs/governance/PLATFORM-AND-ENVIRONMENT.md
Related Issues: #2778, #2891, #2890
Last Reviewed: 2026-08-03
---

# Platform production validation — Cloudflare / Functions / D1 checks (#2891)

## Purpose

Task **#2778-002 / #2891** deliverable: repeatable **read-only** checks for Cloudflare
Pages build/output/function routing, preview-isolation inventory rules, D1 binding
identity, migration/schema declarations, required application tables, and
representative public read paths.

## Tooling

| Item | Path |
| --- | --- |
| Validator | `scripts/ci/platform-cf-d1-validation.mjs` |
| npm script | `npm run validate:platform-cf-d1` |
| Unit tests | `tests/platform-cf-d1-validation.test.mjs` |
| Flags | `--json`, `--skip-http`, `--help` |

Guarantees:

- `productionMutation: false` and `writeAttempts: 0` on every run.
- Live D1 schema reads require `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`; without them the step is **fail-closed** (recorded, not attempted).
- Known repository debt from #2890 (migration prefix collisions; Pages name drift) is reported without blocking the offline validation land.

## Assessment identity

| Field | Value |
| --- | --- |
| Observed at (UTC) | 2026-08-03T13:00:40Z |
| Actor role | Implementation / Operations (Cursor Local) |
| Source issue | #2891 |
| Parent project | #2778 |
| Component branch | `component/platform-production-validation` |
| Candidate SHA inspected | `83043d8ca721115e109f66981deb24ab2387419c` |

## Results (this run)

Command:

```bash
npm run validate:platform-cf-d1
npx vitest run tests/platform-cf-d1-validation.test.mjs
```

| Check | Result | Notes |
| --- | --- | --- |
| wrangler.toml / `_routes.json` present | PASS | Pages output `./out` |
| D1 binding identity | PASS | `DB` → `lgfc_lite` / `22d0dc3e-ad34-43af-8e6a-2063df1a1e04` |
| Pages name drift recorded | PASS (info) | wrangler `lgfc-lite` vs docs `next-starter-template` |
| Functions inventory | PASS | 96 handlers; 45 mutating exports; 51 GET-oriented |
| `requireD1` fail-closed helper | PASS | `functions/_lib/d1.ts` |
| Preview isolation manifest | PASS | 11 resources; 6 production-shared with blocking rules |
| Migration prefix collisions | FAIL (known debt) | prefixes `0020`, `0028`, `0044` (from #2890) |
| Required application tables in migrations | PASS | 8/8 required; 39 CREATE TABLE total |
| Public `/api/health` www | PASS | `ok=true`, `db_ok=true` |
| Public `/api/health` pages.dev | PASS | `ok=true`, `db_ok=true` |
| Live D1 schema read | FAIL-CLOSED | No Cloudflare API token in Cursor Local runtime |

Overall tooling `ok=true` (blocking failures: none). Unit tests: **4 passed**.

## Protected follow-ups (not in this PR)

1. Credentialed operator run of `npm run validate:platform-cf-d1` with Cloudflare API token to clear `live_d1_schema_read`.
2. Migration prefix collision remediation (separate bounded task; do not silently rename without migration authority).
3. B2 + integrated runtime validation remains #2892.

## Rollback

Revert this component PR. Disable by removing the npm script / not invoking the validator. No Production configuration was changed.
