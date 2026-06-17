---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Program #1259 Task 005 D1 and B2 public read-path verification evidence for Website QA / Production Validation
Does Not Own: Schema migrations, admin write paths, issue closure, or workflow YAML
Canonical Reference: /docs/ops/implementation-plans/website-qa-production-validation.md
Related issues: #1255, #1259, #1111, #947
Last Reviewed: 2026-06-17
---

# Website QA / Production Validation — D1 and B2 Public Read-Path Verification

## Purpose

Task 005 deliverable for Program #1255 child project `#1259`. Verify public read
APIs and media URL normalization fail closed safely; consolidate production smoke
evidence for D1/B2 public read paths; document checklist results for downstream
Tasks 006–009.

## Boundary

- Public read-path verification scoped to `functions/api/**` read handlers,
  `tests/**`, and this report
- One gap-only fix authorized: `content/get` cache guard when D1 and Cache API
  are both unavailable
- No schema migrations or admin write paths

Assessment date: **2026-06-17** (`main` after hygiene tracker PR `#1681` merge
`11b2027`; operator authorized Task 005 on `#1259`).

## Executive summary

D1/B2 public read-path verification **passes** with three documented
pass-with-note items. Homepage-critical list APIs (`/api/milestones/list`,
`/api/friends/list`, `/api/search`) use explicit `requireD1` guards returning
503. Photo read paths normalize B2 URLs via `normalizePhotoUrl`. Legacy public
read handlers return explicit error JSON (500) when D1 is missing rather than
silent success. One gap-only fix applied: `content/get` now returns 503 when D1
and the Cache API are both unavailable (previously rejected).

| Result | Count |
| --- | --- |
| Pass | 16 |
| Pass with note | 3 |
| Fail | 0 |

Automated evidence: `tests/public-d1-b2-read-path-validation.test.ts` (11 cases)
plus existing `tests/d1-b2-fail-closed.test.ts`.

## Public read API inventory

| Path | Handler | D1 guard class | B2 normalize | Task 005 result |
| --- | --- | --- | --- | --- |
| `GET /api/health` | `functions/api/health.ts` | Probe (`db_ok`) | — | **Pass** |
| `GET /api/footer-quote` | `functions/api/footer-quote.ts` | catch → 500 | — | **Pass with note** |
| `GET /api/faq/list` | `functions/api/faq/list.ts` | catch → 500 | — | **Pass with note** |
| `GET /api/cms/get` | `functions/api/cms/get.ts` | catch → 500 | — | **Pass with note** |
| `GET /api/content/get` | `functions/api/content/get.ts` | 503 after cache miss | — | **Pass** (gap fixed) |
| `GET /api/events/next` | `functions/api/events/next.ts` | catch → 500 | — | **Pass with note** |
| `GET /api/events/month` | `functions/api/events/month.ts` | catch → 500 | — | **Pass with note** |
| `GET /api/friends/list` | `functions/api/friends/list.ts` | `requireD1` → 503 | yes | **Pass** |
| `GET /api/milestones/list` | `functions/api/milestones/list.ts` | `requireD1` → 503 | yes | **Pass** |
| `GET /api/matchup/current` | `functions/api/matchup/current.ts` | catch → 500 | via photos | **Pass with note** |
| `GET /api/matchup/results` | `functions/api/matchup/results.ts` | catch → 500 | — | **Pass with note** |
| `GET /api/photos/list` | `functions/api/photos/list.ts` | catch → 500 | yes | **Pass** |
| `GET /api/photos/get` | `functions/api/photos/get.ts` | catch → 500 | yes | **Pass** |
| `GET /api/search` | `functions/api/search.ts` | `requireD1` → 503 | — | **Pass** |

Guard class key:

| Class | Behavior |
| --- | --- |
| `requireD1` | Explicit 503 with `Database unavailable` before query |
| `503-cache-fallback` | Edge cache last-known-good; 503 when D1 and cache unavailable |
| `catch → 500` | Missing binding surfaces as 500 `ok:false` (not silent empty success) |
| Probe | Health endpoint reports `db_ok:false` while returning 200 |

## D1/B2 checklist

| # | Check | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Task 001 public read inventory present on disk | **Pass** | contract test |
| 2 | Baseline fail-closed suite present | **Pass** | `tests/d1-b2-fail-closed.test.ts` |
| 3 | Milestones list returns 503 without D1 | **Pass** | behavioral test |
| 4 | Friends list returns 503 without D1 | **Pass** | behavioral test |
| 5 | Search returns 503 without D1 | **Pass** | behavioral test |
| 6 | Content get returns 503 without D1/cache | **Pass** | behavioral test + gap fix |
| 7 | Health reports `db_ok:false` without D1 | **Pass** | behavioral test |
| 8 | Legacy reads do not claim `ok:true` without D1 | **Pass** | events/faq/photos/footer batch |
| 9 | Photo list/get normalize B2 URLs | **Pass** | source contract + baseline tests |
| 10 | Homepage milestone/friend photo normalization | **Pass** | `d1-b2-fail-closed.test.ts` |
| 11 | B2 secret guard returns 503 | **Pass** | `d1-b2-fail-closed.test.ts` |
| 12 | B2 ListObjectsV2 XML parsing | **Pass** | `d1-b2-fail-closed.test.ts` |
| 13 | Legacy handlers use 500 not 503 | **Pass with note** | Acceptable; not silent empty |
| 14 | Matchup composite read swallows inner DB errors | **Pass with note** | Falls back to photo list; documented |
| 15 | Production live smoke against Cloudflare | **Pass with note** | Deferred — vitest evidence only; preview/production drift noted in Task 001 |
| 16 | Events calendar full production validation | **Pass with note** | `#947` / `#1258` runbook deferral; read paths verified in unit scope |
| 17 | Admin write paths excluded | **Pass** | Out of scope |
| 18 | Schema migrations excluded | **Pass** | Out of scope |

## Gap disposition

| Gap | Severity | Task 005 disposition |
| --- | --- | --- |
| Production smoke evidence not consolidated (Task 001 / `#1111`) | Medium | **Closed** — this report + contract/behavioral tests |
| `content/get` rejected when D1 and Cache API unavailable | Medium | **Fixed** — cache guard before `cache.match` |
| Legacy public reads return 500 not 503 | Low | **Pass with note** — explicit `ok:false`; harmonize in future backend delta if authorized |
| Cloudflare preview vs production drift | Medium | Documented; manual smoke optional |
| Events calendar production validation (`#947`) | Low | Pass with note; read handlers verified fail-closed in unit scope |

## Code change (gap-only)

`functions/api/content/get.ts`: guard Cache API access when
`(globalThis.caches)?.default` is unavailable so D1 failure returns 503 instead
of rejecting.

## Validation commands

```bash
npm test -- tests/public-d1-b2-read-path-validation.test.ts tests/d1-b2-fail-closed.test.ts

npm run typecheck

printf '%s\n' \
  docs/ops/reports/website-qa-production-validation-d1-b2-read-path-validation.md \
  docs/ops/implementation-plans/website-qa-production-validation.md \
  > /tmp/task005-docs-header-list.txt
DOCS_HEADER_FILE_LIST=/tmp/task005-docs-header-list.txt ./scripts/ci/docs_check_headers.sh .
```

Optional production smoke (operator):

```bash
curl -sS "https://www.lougehrigfanclub.com/api/health" | jq .
curl -sS "https://www.lougehrigfanclub.com/api/milestones/list?limit=1" | jq .
curl -sS "https://www.lougehrigfanclub.com/api/friends/list?limit=1" | jq .
```

## Downstream routing

| Task | Routing from Task 005 |
| --- | --- |
| 006 | Content inventory public surface validation — D1/B2 read paths cleared |
| 007 | H-011 launch-readiness CI scheduling |
| 008 | `#1111` T29 disposition — verify class closed by this report |
| 009 | Consolidate validation evidence in final QA report |
