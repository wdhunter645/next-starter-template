---
Doc Type: Operations Report
Audience: Human + AI
Authority Level: Operational Evidence
Owns: Preview and component-environment isolation audit evidence for Delivery System v1 Task 6
Does Not Own: Platform binding changes or credential provisioning
Canonical Reference: /docs/reference/platform/component-environment-isolation.md
Related Issues: #2496, #2495, #2478
Last Reviewed: 2026-07-13
---

# Delivery System Preview Isolation Audit

**Audit date:** 2026-07-13  
**Source issue:** #2496  
**Auditor:** Cursor (Model B child, local runtime)  
**Canonical reference:** `docs/reference/platform/component-environment-isolation.md`  
**Machine-readable inventory:** `scripts/ci/preview-isolation-manifest.json`

---

## Executive summary

Preview and component Cloudflare Pages deployments **can silently mutate production** today. The repository binds a single production D1 database (`lgfc_lite`, UUID `22d0dc3e-ad34-43af-8e6a-2063df1a1e04`) with no Wrangler environment override and no runtime environment guard in Pages Functions. Thirteen public/member API routes and all admin routes write directly to that database. A GET handler (`/api/matchup/current`) performs hidden writes on page load.

Email and analytics are **disabled by default** in `.env.example` but become production-shared when preview mirrors production Cloudflare Pages environment variables. B2 access from runtime code is read-only; admin sync writes production D1.

**Verdict:** Isolation is **not proven**. Affected paths are classified **production-shared** and remain **protected** for Model B auto-integration. Evidence-backed corrections in this audit are documentation and repository inventory enforcement only; separate preview D1 provisioning requires a platform decision.

---

## Audit method

1. Inspected `wrangler.toml`, `.env.example`, Pages Functions under `functions/`, and deployment workflows under `.github/workflows/`.
2. Grepped all `onRequestPost|Put|Patch|Delete` handlers and identified side-effect GET handlers.
3. Read platform docs (`CLOUDFLARE.md`, `MEDIA-01.md`, `AI-REVIEW-ACCESS.md`) and delivery policy from #2495.
4. Cross-checked against two-model delivery design isolation requirements.
5. Created machine-readable manifest and Vitest inventory check.

**Not audited live:** Cloudflare Pages dashboard Production vs Preview environment variable matrix (requires operator/API access outside repository).

---

## Resource inventory and classification

| # | Resource | Category | Classification | Evidence | Can preview mutate production? |
| --- | --- | --- | --- | --- | --- |
| 1 | Pages project `next-starter-template` | Pages | production-shared | `CLOUDFLARE.md`, `wrangler.toml` | Yes — same bindings |
| 2 | D1 `lgfc_lite` | D1 | production-shared | `wrangler.toml:9-12`, `functions/_lib/d1.ts` | Yes — all API writes |
| 3 | Rate limiter `API_RATE_LIMITER` | Pages | production-shared | `wrangler.toml:17-21` | Shared counter namespace |
| 4 | B2 list (runtime) | B2 | read-only | `functions/_lib/b2.ts` | No object writes |
| 5 | Admin B2→D1 sync | B2/D1 | production-shared | `functions/api/admin/media-assets/sync-from-b2.ts` | Yes — when token + B2 secrets set |
| 6 | MailChannels email | Email | disabled / production-shared* | `functions/_lib/email.ts:28-29` | *Yes when `MAILCHANNELS_ENABLED=1` |
| 7 | Google Analytics 4 | Analytics | disabled / production-shared* | `src/components/GoogleAnalytics.tsx` | *Yes when `NEXT_PUBLIC_GA_ID` set at build |
| 8 | Admin token APIs | Admin | disabled / production-shared* | `functions/_lib/auth.ts`, `functions/api/admin/**` | *Yes when `ADMIN_TOKEN` mirrored |
| 9 | AI review | API | read-only | `functions/api/_ai-review/page-snapshot.ts` | No — mutations denied |
| 10 | CI D1 migrations | CI | production-shared | `.github/workflows/d1-migrations.yml` | N/A — not preview URL |
| 11 | CI B2→D1 sync | CI | production-shared | `.github/workflows/b2-d1-daily-sync.yml` | N/A — scheduled GitHub Action |
| 12 | Public/member write APIs (13 routes) | API | production-shared | See canonical reference | Yes |
| 13 | `GET /api/matchup/current` side effect | API | production-shared | `functions/api/matchup/current.ts:289-300` | Yes — hidden write |

---

## Highest-risk findings

### F1 — Shared production D1 (critical)

`wrangler.toml` declares one D1 binding with no preview override:

```9:12:wrangler.toml
[[d1_databases]]
binding = "DB"                     # Must match Cloudflare binding name
database_name = "lgfc_lite"        # Must match CF dashboard
database_id = "22d0dc3e-ad34-43af-8e6a-2063df1a1e04"   # Will fill after fetching via wrangler
```

No `PREVIEW_MODE`, `CF_PAGES_ENV`, or equivalent guard exists in `functions/**`.

**Classification:** production-shared  
**Blocking:** Protected path; auto-integration blocked. Separate preview D1 required for true isolation.

### F2 — Hidden GET side effect (high)

`GET /api/matchup/current` closes stale matchups and upserts `weekly_matchups` during a read request (`functions/api/matchup/current.ts:289-300`). Any preview homepage load can rotate production matchup state.

**Classification:** production-shared  
**Blocking:** Documented; runtime guard or preview D1 required to block.

### F3 — Admin surface on static preview (high)

Static `/admin/**` pages deploy to preview URLs. If `ADMIN_TOKEN` is mirrored from production, the full admin write surface is available against production D1.

**Classification:** production-shared when token set  
**Blocking:** Preview must not mirror production `ADMIN_TOKEN`. `functions/api/admin/**` is a delivery-profile protected path.

### F4 — Email and analytics configuration risk (medium)

Defaults are safe in `.env.example`:

```24:24:.env.example
MAILCHANNELS_ENABLED=0
```

```11:11:.env.example
NEXT_PUBLIC_GA_ID=
```

Cloudflare Pages preview environment variables are dashboard-managed. Mirroring production values enables real email and GA pollution.

**Classification:** disabled by default; production-shared when misconfigured  
**Blocking:** Documented configuration rules; no runtime test routing in code.

### F5 — B2 sync D1 writes (medium)

Runtime B2 access is list-only, but `POST /api/admin/media-assets/sync-from-b2` inserts into `media_assets`. `docs/ops/tasks/MEDIA-01.md` explicitly allows mirroring B2 secrets to preview.

**Classification:** production-shared for D1 effect  
**Blocking:** Protected admin path; omit B2 secrets on preview unless intentionally testing.

---

## Existing controls (pre-audit)

| Control | Location | Isolation effect |
| --- | --- | --- |
| Delivery profile protected paths | `scripts/ci/delivery_profile.mjs:66-75` | Blocks auto-integration for sensitive file changes |
| D1/B2 fail-closed | `tests/d1-b2-fail-closed.test.ts` | 503 when binding missing — not separation |
| Email disabled default | `functions/_lib/email.ts:28` | Safe when env respected |
| Admin token required | `functions/_lib/auth.ts` | Safe when token not mirrored |
| Preview invariants workflow | `.github/workflows/preview-invariants.yml` | Manual-only Playwright; not isolation |
| D1 data protection policy | `docs/reference/platform/d1-data-protection_MASTER.md` | Says test in preview first — no separate DB defined |

---

## Corrections implemented

| Item | Path | Rationale |
| --- | --- | --- |
| Canonical isolation reference | `docs/reference/platform/component-environment-isolation.md` | Required Task 6 deliverable |
| Audit report | `docs/ops/reports/delivery-system-preview-isolation-audit.md` | Evidence record |
| CI manifest | `scripts/ci/preview-isolation-manifest.json` | Machine-readable inventory |
| Inventory test | `tests/preview-isolation-inventory.test.ts` | Prevents undocumented mutating routes |

**Not changed:** `wrangler.toml`, Cloudflare dashboard bindings, deployment workflows — no evidence-backed repo-only fix for D1 separation.

---

## Protected follow-up (out of scope #2496)

| Item | Owner | Dependency |
| --- | --- | --- |
| Provision isolated preview D1 and Wrangler env block | Platform / Bill | Cloudflare account decision |
| Runtime write guard (`CF_PAGES_ENV !== production`) | Cursor future task | Requires binding strategy |
| Disable matchup rotation on non-production | Cursor future task | Requires env guard or isolated D1 |
| CF Pages env parity dashboard audit | Operator | API token + dashboard access |
| Re-enable preview-invariants with isolation checks | Task 7+ CI | Requires isolated D1 for negative tests |

---

## Verification evidence

| Check | Command | Result |
| --- | --- | --- |
| Preview isolation inventory test | `npm test -- tests/preview-isolation-inventory.test.ts` | PASS (8/8) |

---

## Acceptance criteria mapping

| Criterion | Status | Evidence |
| --- | --- | --- |
| Complete isolation inventory exists | Met | Canonical reference + manifest |
| Every resource has one explicit classification | Met | Manifest `resources` and `mutatingRoutes` |
| Unsafe production-shared paths blocked or protected | Met | Blocking rules documented; delivery profile protected paths; CI inventory test |
| Evidence-backed corrections implemented and tested | Met | Docs + manifest + Vitest |
| Audit and as-built documentation complete | Met | This report + canonical reference |

---

## Rollback

Revert #2496 changes in reverse order: test → manifest → audit report → canonical reference. Audit findings remain factual until platform bindings change.
