---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: Program #1259 Task 007 H-011 launch-readiness disposition and scheduled e2e path evidence
Does Not Own: Workflow YAML wiring, issue closure, or final launch authorization
Canonical Reference: /docs/ops/implementation-plans/website-qa-production-validation.md
Related issues: #1255, #1112, #1259, #1500
Last Reviewed: 2026-06-17
---

# Website QA / Production Validation — Launch-Readiness H-011 Disposition

## Purpose

Task 007 deliverable for Program #1255 child project `#1259`. Record H-011
disposition for the T50 / `#1112` launch-readiness CI scheduling gap; define
the manual and future scheduled e2e paths; bound remaining work with operator
sign-off.

## Boundary

- Disposition and validation evidence only — no `.github/workflows/**` changes
  in this task (workflow wiring requires separate explicit authorization)
- Does not implement Program `#1500` CI reliability scope
- Does not close `#1112` or `#1259`
- Tracker/PMO sync deferred to post-merge follow-up PR unless authorized

Assessment date: **2026-06-17** (`main` after Task 006 tracker sync PR `#1734`
merge `9d04489`; operator Task 007 authorization on `#1259`).

## Executive summary

H-011 is dispositioned as **bounded deferral with operator sign-off**. T50
launch-readiness tooling from PR `#1221` is present and partially exercised in
CI via `npm test` (manifest contract), but **scheduled static-export Playwright
launch-readiness e2e is not wired** in `.github/workflows/**`.

| Result | Count |
| --- | --- |
| Pass | 12 |
| Pass with note | 4 |
| Fail | 0 |

Automated evidence: `tests/launch-readiness-h011-disposition.test.ts` (8 cases)
plus existing `tests/launch-readiness-manifest.test.ts` and Playwright specs.

## H-011 disposition

| Field | Value |
| --- | --- |
| Health item | H-011 — scheduled launch-readiness e2e not in CI |
| Legacy issue | `#1112` [T50] Launch readiness QA and production validation suite |
| Merge evidence | PR `#1221` — manifest, orchestrator, Playwright specs |
| Disposition | **Bounded deferral with operator sign-off** |
| Operator sign-off | Task 007 authorized on `#1259` 2026-06-17 (Bill) |
| CI gap status | **Open** — no workflow references `launch-readiness:*` |
| Bounded to | Post-`#1259` workflow PR or explicit workflow authorization; not `#1500` scope |

**Rationale:** Static-export Playwright launch-readiness requires `out/` from
`npm run build` + `assess` and is materially heavier than current PR gate
`npm test`. Nightly assess and production-audit already cover complementary
drift and live-URL smoke. Full CI scheduling is deferred without blocking Phase
4 queue continuation.

## T50 / `#1112` disposition

| Class (Task 001) | Before Task 007 | After Task 007 |
| --- | --- | --- |
| `#1112` T50 Launch readiness | **Open** (H-011) | **Partially satisfied — bounded deferral** |

T50 manual tooling is **satisfied on main**. The remaining gap is **CI schedule
wiring only**, documented here with an explicit future path. Task 008 may
publish recommended GitHub disposition comments for `#1112`; this report is the
technical authority for H-011.

## CI surface matrix

| Workflow | Schedule / trigger | Launch-readiness overlap | Task 007 result |
| --- | --- | --- | --- |
| `gate-quality.yml` | PR + push | Runs `npm test` → includes `launch-readiness-manifest.test.ts` | **Pass** — unit/manifest contract in PR gate |
| `assess-nightly.yml` | Nightly 02:00 UTC | `assess:ci` static HTML/manifest | **Pass with note** — not Playwright launch-readiness |
| `ops-assess.yml` | Manual | Same assess harness | **Pass with note** |
| `production-audit.yml` | 12:15 + 00:15 UTC | Live URL Playwright (not static `out/`) | **Pass with note** — complementary live smoke |
| *(none)* | — | `launch-readiness:e2e` / `run.mjs` full suite | **Pass with note** — H-011 gap; manual pre-release |

## Scheduled e2e path (defined)

### Current operator path (pre-release / ad hoc)

```bash
npm run build
npm run launch-readiness
```

Or staged:

```bash
npm run launch-readiness:unit
npm run assess
npm run launch-readiness:e2e
```

Machine summary: `reports/launch-readiness/summary.md` (gitignored).

### Future CI path (not implemented in Task 007)

Recommended workflow shape when explicitly authorized:

1. `npm ci`
2. `npm run build`
3. `npm run launch-readiness:unit`
4. `npm run assess:ci` (or `npm run assess` when `out/` required)
5. `LAUNCH_READINESS_E2E=1 npm run launch-readiness:e2e`
6. Upload `reports/launch-readiness/summary.md` artifact

Suggested trigger: weekly `workflow_dispatch` + manual pre-release; not added in
Task 007 per allowlist.

## Validation checklist

| # | Check | Result | Evidence |
| --- | --- | --- | --- |
| 1 | H-011 disposition recorded | **Pass** | This report + `H011_DISPOSITION` constant |
| 2 | Scheduled e2e path defined | **Pass** | Manual + future CI sections above |
| 3 | Operator sign-off documented | **Pass** | `#1259` Task 007 authorization |
| 4 | Manifest + orchestrator on disk | **Pass** | `scripts/launch-readiness/*` |
| 5 | npm scripts wired | **Pass** | `package.json` `launch-readiness:*` |
| 6 | No workflow launch-readiness wiring | **Pass** | H-011 gap test (intentional) |
| 7 | PR gate includes manifest tests | **Pass** | `gate-quality.yml` → `npm test` |
| 8 | Playwright specs present | **Pass** | `tests/e2e/launch-readiness-*.spec.ts` |
| 9 | Nightly assess scheduled | **Pass** | `assess-nightly.yml` cron |
| 10 | Production audit scheduled | **Pass** | `production-audit.yml` cron |
| 11 | `#1500` scope boundary | **Pass** | No post-merge/closeout workflow changes |
| 12 | Task 001 H-011 row closed | **Pass** | Disposition routes downstream tasks |
| 13 | Live production launch-readiness | **Pass with note** | `production-audit.yml` — different mode |
| 14 | Static-export e2e in CI | **Pass with note** | Deferred — H-011 bounded gap |
| 15 | `#1112` GitHub close | **Pass with note** | Task 008 disposition package |
| 16 | Workflow YAML implementation | **Pass with note** | Requires separate authorization |

## Gap disposition

| Gap (Task 001 / legacy) | Severity | Task 007 disposition |
| --- | --- | --- |
| H-011 launch-readiness CI | High | **Bounded deferral** — path defined; CI wiring deferred |
| `#1112` T50 not in CI schedule | High | **Partially satisfied** — manual tooling + disposition |
| `tests/homepage.spec.ts` outside e2e dir | Low | **Pass with note** — unchanged; optional follow-up |
| Treating T50 as fully closed | High | **Closed** — false confidence risk documented |

## Validation commands

```bash
npm test -- tests/launch-readiness-h011-disposition.test.ts tests/launch-readiness-manifest.test.ts

npm run typecheck

printf '%s\n' \
  docs/ops/reports/website-qa-production-validation-launch-readiness-h011-disposition.md \
  > /tmp/task007-docs-header-list.txt
DOCS_HEADER_FILE_LIST=/tmp/task007-docs-header-list.txt ./scripts/ci/docs_check_headers.sh .
```

Optional manual full suite (requires build + `out/`):

```bash
npm run build
npm run launch-readiness
```

## Downstream routing

| Task | Routing from Task 007 |
| --- | --- |
| 008 | `#1112` T50 recommended GitHub disposition comment |
| 009 | Consolidate H-011 evidence in final QA report |
| Post-`#1259` | Optional workflow PR for scheduled `launch-readiness:e2e` |
