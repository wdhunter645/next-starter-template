---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Project #2778 Task 001 (#2890) redacted repository and live-platform inventory matrix
Does Not Own: Live Cloudflare API dashboard dumps, secret values, Production mutation, or later validation children (#2891–#2893)
Canonical Reference: /docs/governance/PLATFORM-AND-ENVIRONMENT.md
Related Issues: #2778, #2890, #2680
Last Reviewed: 2026-08-02
---

# Platform production validation — repository and live inventory (#2890)

## Purpose

Task **#2778-001 / #2890** deliverable: a redacted environment matrix for local,
preview/component, Promotion Candidate, and Production that separates
repository-declared configuration from observed live metadata, records drift
explicitly, and lists owners without exposing secret values.

## Boundary

- No secret values in this report (names and presence only).
- No Cloudflare, D1, or B2 writes; no destructive tests.
- No Production configuration mutation.
- Live Cloudflare **API / dashboard** inventory was **not** executed in the
  Cursor Local session (API token and account id were absent from the runtime
  environment). Public HTTP/DNS observations and GitHub secret-name presence
  are the live evidence collected here.
- Supporting inventory docs under `docs/reference/platform/**` are cited, not
  rewritten, in this task.

Assessment identity:

| Field | Value |
| --- | --- |
| Observed at (UTC) | 2026-08-02T13:52:51Z (public surface checks) |
| Actor role | Implementation / Operations (Cursor Local) |
| Source issue | #2890 |
| Parent project | #2778 |
| Component branch | `component/platform-production-validation` |
| Base SHA inspected | `d136e364e00d5ee313de8981ae9043c57a6cedf3` (`origin/main` at branch creation) |

## Executive summary

Repository declarations already describe a **production-shared** Cloudflare Pages
+ D1 + B2 layout. Public Production and Pages.dev surfaces both answer healthy
(`/api/health` returns `ok: true` and `db_ok: true`), which is consistent with
shared D1 bindings and does **not** prove preview isolation.

Primary drift to hand to later children and Operations:

1. **Wrangler worker/Pages name** `lgfc-lite` versus documented / workflow Pages
   project name `next-starter-template`.
2. **GitHub secret naming**: workflows read `CLOUDFLARE_PAGES_PROJECT` (fallback
   `next-starter-template`); repository secrets list includes
   `CLOUDFLARE_PROJECT_NAME` and does **not** list `CLOUDFLARE_PAGES_PROJECT`.
3. **`ADMIN_TOKEN`** is required for admin mutation gates at runtime but is **not**
   present as a GitHub Actions secret name (expected to live only in Cloudflare
   Pages env — confirm in a credentialed live read).
4. **Deployment guide** still mentions an OpenNext transform step while also
   documenting static `out/` export — documentation inconsistency only.
5. **Migration filename collisions** exist for prefixes `0020`, `0028`, and
   `0044` (47 SQL files total) — schema-validation risk for #2891.
6. Live Cloudflare API inventory remains an **authorized-operator follow-up**
   (token present in GitHub secrets, not in Cursor Local env).

## Environment matrix (redacted)

| Concern | Local | Preview / component | Promotion Candidate | Production |
| --- | --- | --- | --- | --- |
| Definition | Operator workstation (`npm run dev` / `npm run dev:cf`) | Per-PR or `component/*` Pages URL | Exact integrated SHA on component branch awaiting Production Go | `main` deploy serving production domains |
| Isolation | Fail-closed `.env` defaults | **Not isolated** — shares Production bindings unless separately provisioned | Same as component tip; still not an isolation boundary | Authoritative write target |
| Pages project (declared) | Uses `wrangler.toml` / local `out/` | Same CF Pages project as Production | Same | Project name in docs/workflows: `next-starter-template`; `wrangler.toml` `name`: `lgfc-lite` |
| Domains (declared / observed) | `localhost` | `*.pages.dev` preview hostname | Candidate SHA on Pages | Declared: `www.lougehrigfanclub.com`, `next-starter-template-6yr.pages.dev`. Observed 200 OK on both hosts. |
| D1 binding | Optional local D1 via `wrangler pages dev --d1=DB` | Declared binding `DB` → `lgfc_lite` / `22d0dc3e-ad34-43af-8e6a-2063df1a1e04` | Same binding identity | Same binding; `/api/health` `db_ok: true` on www and pages.dev |
| Rate limiter | Local may omit | `API_RATE_LIMITER` namespace `1001` (production-shared) | Same | Same |
| B2 | Names in `.env.example` only | Runtime list read-only when secrets present; admin sync production-shared | Same | Bucket declared in docs: `LouGehrigFanClub`; secret **names** present in GitHub |
| Email / GA | Defaults disabled | Must remain disabled (`MAILCHANNELS_ENABLED=0`, empty GA) | Same | Production may enable only under Product Authority |
| Admin mutation | Blocked without `ADMIN_TOKEN` | Must not mirror Production token | Same | Token expected in Pages env (not in GitHub secret name list) |
| Owners | Operator | Implementation / Operations + CI | PMO / Engineering + PR Approver | Platform/Operations health; Product Authority for credentials/domains/cost |
| Evidence locations | This report; `.env.example` | `scripts/ci/preview-isolation-manifest.json`; public HTTP | Component PR + this report SHA | Public HTTP; GitHub secret **names**; CF dashboard (credentialed follow-up) |

## Repository-declared inventory

### Cloudflare Pages / Wrangler

| Item | Declared value | Source |
| --- | --- | --- |
| Wrangler name | `lgfc-lite` | `wrangler.toml` |
| Build output | `./out` | `wrangler.toml` `pages_build_output_dir` |
| Compatibility date | `2025-10-30` + `nodejs_compat` | `wrangler.toml` |
| Pages project (docs / ops default) | `next-starter-template` | `docs/reference/platform/CLOUDFLARE.md`; `.github/workflows/ops-cf-pages-retry.yml` |
| Production branch (docs) | `main` | `docs/reference/platform/CLOUDFLARE.md` |
| Domains (docs) | `next-starter-template-6yr.pages.dev`, `www.lougehrigfanclub.com` | `docs/reference/platform/CLOUDFLARE.md` |
| Deploy scripts | `build:cf` → static export; `deploy:prod` → `wrangler pages deploy out` | `package.json` |

### D1

| Item | Declared value | Source |
| --- | --- | --- |
| Binding name | `DB` | `wrangler.toml`, `functions/_lib/d1.ts` |
| Database name | `lgfc_lite` | `wrangler.toml`, `.env.example` |
| Database id | `22d0dc3e-ad34-43af-8e6a-2063df1a1e04` | `wrangler.toml`, isolation manifest |
| Classification | production-shared | `docs/reference/platform/component-environment-isolation.md` |
| Migration files on disk | 47 under `migrations/` | repository listing |
| Duplicate migration prefixes | `0020`, `0028`, `0044` | repository listing |
| CI auth preflight | `scripts/ci/verify_cloudflare_d1_auth.mjs` | requires `CLOUDFLARE_API_TOKEN` + account id |

### B2

| Item | Declared value | Source |
| --- | --- | --- |
| Bucket (docs) | `LouGehrigFanClub` (public) | `docs/reference/platform/Backblaze_B2.md` |
| Endpoint (docs) | `s3.us-east-005.backblazeb2.com` | same |
| Env var names | `B2_KEY_ID`, `B2_APP_KEY`, `B2_ENDPOINT`, `B2_BUCKET`, `PUBLIC_B2_BASE_URL` | `.env.example`, `functions/_lib/b2.ts` |
| Runtime class | object list read-only; admin sync production-shared | isolation inventory |
| Tooling | `scripts/b2_*`, `.github/workflows/b2-d1-daily-sync.yml` | repository |

### Secrets and variables (names only)

| Name | In `.env.example` | In GitHub Actions secrets list (2026-08-02) | Expected live consumer |
| --- | --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | yes | yes | Wrangler / Pages / D1 CI |
| `CLOUDFLARE_ACCOUNT_ID` | yes | yes | Wrangler / Pages / D1 CI |
| `CLOUDFLARE_PROJECT_NAME` | no (guide text) | yes | Docs/DEPLOYMENT_GUIDE naming |
| `CLOUDFLARE_PAGES_PROJECT` | no | **no** | `ops-cf-pages-retry.yml` (falls back to `next-starter-template`) |
| `D1_DATABASE_NAME` | as `D1_DB_NAME` locally | yes | D1 CI |
| `D1_DATABASE_ID` | no | yes | D1 CI |
| `B2_KEY_ID` / `B2_APP_KEY` / `B2_BUCKET` / `B2_ENDPOINT` | yes | yes | Pages Functions + sync jobs |
| `PUBLIC_B2_BASE_URL` | yes | yes | Public media URLs |
| `ADMIN_TOKEN` | yes (template) | **no** | Cloudflare Pages env (runtime admin gate) |
| `ADMIN_EMAILS` | yes | yes | Admin role allowlist |
| `MAILCHANNELS_*` / `NEXT_PUBLIC_GA_ID` | yes (disabled defaults) | not required for this matrix | Must stay disabled on preview/component |

Legacy / out-of-scope secret names also exist in GitHub, left over from prior hosting/backend platforms this project no longer uses. They are **not** part of the Cloudflare production path declared by current `wrangler.toml` and are recorded only as residual account inventory, not as active LGFC runtime dependencies for this project.

### Isolation machine inventory

`scripts/ci/preview-isolation-manifest.json` (audited 2026-07-13, issue #2496) remains the machine-readable classification source. It marks Pages project, D1 `lgfc_lite`, rate limiter, admin-when-token-set, MailChannels-when-enabled, GA-when-set, CI D1 migrations, and CI B2→D1 sync as **production-shared** or **disabled-by-default**.

## Observed live metadata (credential-free)

### DNS

| Host | Resolved addresses (sample) |
| --- | --- |
| `www.lougehrigfanclub.com` | Cloudflare anycast IPv4/IPv6 (`104.21.69.231`, `172.67.215.110`, plus IPv6) |
| `lougehrigfanclub.com` | Same Cloudflare anycast set as www |
| `next-starter-template-6yr.pages.dev` | Distinct Cloudflare anycast set (`172.66.44.193`, `172.66.47.63`, plus IPv6) |

### HTTP

| URL | Status | Notes |
| --- | --- | --- |
| `https://www.lougehrigfanclub.com/` | 200 | `server: cloudflare` |
| `https://next-starter-template-6yr.pages.dev/` | 200 | `server: cloudflare` |
| `https://www.lougehrigfanclub.com/api/health` | 200 | `{"ok":true,"db_ok":true,...}` |
| `https://next-starter-template-6yr.pages.dev/api/health` | 200 | `{"ok":true,"db_ok":true,...}` |

Interpretation: both the custom domain and the Pages.dev hostname currently serve a healthy Functions + D1 path. That agrees with **production-shared D1** and must not be read as preview isolation.

### Live Cloudflare API / dashboard

| Check | Result |
| --- | --- |
| Cursor Local env `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` | Absent |
| Redacted Pages project settings dump | Not executed |
| Redacted D1 list / binding confirmation via API | Not executed |
| Redacted B2 console confirmation | Not executed |

Protected follow-up: operator-authorized redacted read using GitHub-held credentials (or successor task #2891 tooling) to confirm Pages project name, env var **presence**, binding map, and domain attachment without printing secret values.

## Drift register

| ID | Declared | Observed / conflicting declaration | Severity | Owner | Follow-up |
| --- | --- | --- | --- | --- | --- |
| D-001 | Docs/workflows Pages project `next-starter-template` | `wrangler.toml` name `lgfc-lite` | Medium — naming ambiguity for operators | PMO / Engineering + Platform | Confirm canonical Pages project name via credentialed read; align docs/wrangler in a bounded later change if needed |
| D-002 | Workflow env `CF_PAGES_PROJECT` ← `secrets.CLOUDFLARE_PAGES_PROJECT` | Secret name missing; fallback string used | Medium — retry workflow depends on fallback | Operations | Add/rename secret or update workflow to `CLOUDFLARE_PROJECT_NAME` under a CI task |
| D-003 | `.env.example` documents `ADMIN_TOKEN` | Not listed in GitHub Actions secrets | Low if present only in Pages env; High if missing in Production Pages | Product Authority / Operations | Credentialed Pages env presence check (no value disclosure) |
| D-004 | DEPLOYMENT_GUIDE static export narrative | Same guide still says “Transforms build output with OpenNext” | Low — docs inconsistency | Documentation | Edit in docs remediation; not required for #2890 acceptance |
| D-005 | Ordered unique migration prefixes expected by operators | Duplicate prefixes `0020`, `0028`, `0044` | Medium for schema validation | Implementation (#2891) | Non-destructive migration/schema verification |
| D-006 | Live API inventory required by launch package | Not executed in Cursor Local (no token in runtime) | Medium — completeness gap, explicitly bounded | Operations / #2891 | Authorized redacted API inventory |
| D-007 | Preview/component isolation desired by delivery policy | Isolation inventory + dual `db_ok` health prove shared D1 | Protected platform truth | Product Authority for isolation investment | Do not claim isolation; keep mutating preview paths protected |

## Required bindings and services checklist

| Binding / service | Required for Production site | Declared | Live evidence this task | Status |
| --- | --- | --- | --- | --- |
| Pages project + `out/` deploy | yes | yes | Public 200 on www + pages.dev | Agree (project id pending API) |
| Pages Functions `/api/**` | yes | yes | `/api/health` 200 | Agree |
| D1 `DB` → `lgfc_lite` | yes | yes | `db_ok: true` on both hosts | Agree (id pending API confirm) |
| `API_RATE_LIMITER` | yes (declared) | yes | Not directly probed | Declared only |
| B2 list credentials | yes for media paths | names yes | Secrets names present; runtime not probed | Presence-only |
| `ADMIN_TOKEN` | yes for admin writes | example yes | GitHub secret name absent | Pages-env confirm pending |
| Custom domain www | yes | yes | DNS + HTTP 200 | Agree |
| Preview isolation | desired, not current | classified not isolated | Shared `db_ok` | Drift accepted as protected truth |

## Protected decisions (stop / do not invent)

- Provisioning separate preview D1 or write guards
- Mirroring Production `ADMIN_TOKEN` onto preview/component
- Enabling MailChannels or GA on non-Production
- Rotating or printing any credential
- Production deployment or domain changes
- Treating this inventory as Production Go

## Acceptance mapping (#2890)

| Criterion | Evidence |
| --- | --- |
| Repository declarations and observed metadata agree or each difference is explicit | Matrix + drift register D-001–D-007 |
| No secret values recorded | Names/presence only; health JSON contains no secrets |
| Protected decisions identified | Section above |
| Changes remain within task / parent launch package | Single report file allowlist |
| Builder does not self-approve or merge | PR left for independent review |
| Rollback / protected-stop behavior verified | Docs-only revert; no live mutation performed |

## Downstream handoff

- **#2891** — Cloudflare Pages/Functions/D1 validation should consume this matrix, close D-006 with credentialed redacted API reads, and address migration-prefix collisions non-destructively.
- **#2892** — B2 and integrated runtime validation should prove media read paths and fail-closed behavior without exposing keys.
- **#2893** — Promotion Candidate qualification and operator handoff.

## Rollback

Revert or delete this report via the component PR. No live platform rollback applies.
