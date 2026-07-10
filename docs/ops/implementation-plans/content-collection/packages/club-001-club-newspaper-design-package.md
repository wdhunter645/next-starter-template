---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor, LGFC maintainers, implementation agents
Authority Level: Operational Plan (non-authoritative until promoted via Issue/PR)
Owns: CLUB-001 implementation envelope — Club Home newspaper layout, shared shell risk controls, validation
Does Not Own: Program 3 launch authorization, Fanclub subpage designs, or merge authorization
Canonical Reference: /docs/ops/pmo/program-3-club-home-page-design.md
Related Issues: #2362, #2359, #2360, #2361, #1685, #1379
Last Reviewed: 2026-07-10
---

# CLUB-001 Club Newspaper Design Package

## Purpose

Define the implementation envelope for the **Club Home newspaper-style** member landing page (`/fanclub`) — layout hierarchy, content modules, shared shell risk, and validation. CLUB-001 controls shell risk for all fanclub lanes.

## Scope

**In scope:** Club Home route, `ClubHome*` components, home API, content-inventory club-home lib, responsive/editorial presentation within design authority.

**Out of scope:** Redesigning Gallery/Library/Memorabilia destination pages (see `fanclub-subpages.md`), fundraiser/campaign implementation, auth model changes.

## Current known truth

| Surface | Repo path | Status |
| --- | --- | --- |
| Route | `src/app/fanclub/page.tsx` | **Exists** — newspaper-style module stack |
| Layout | `src/app/fanclub/layout.tsx` | **Exists** — session gate for all `/fanclub/**` |
| Components | `src/components/fanclub/ClubHome*.tsx`, `ArchivesTiles.tsx`, `useClubHomeContent.ts` | **Exists** — not `club-newspaper/` folder |
| Styles | `src/components/fanclub/clubHomeStyles.ts` | Section spacing tokens |
| Home API | `functions/api/fanclub/home.ts` | **Exists** |
| Club home lib | `functions/_lib/content-inventory-club-home.ts` | **Exists** — `fetchClubHomeContent` |
| Floating logo | `src/components/FloatingLogo.tsx` | Design lock — homepage + fanclub only |
| Design authority | `docs/ops/pmo/program-3-club-home-page-design.md` | Newspaper section order |
| Subpage design | `docs/reference/design/fanclub-subpages.md` | Gallery/Library/Memorabilia destinations |
| Operator runbook | `docs/how-to/website/club-home-content-operations-runbook.md` | Publish + verify procedure |
| Tests | `tests/fanclub-home-dynamic.test.tsx`, `fanclub-home-shell.test.tsx`, `content-inventory-club-home.test.ts` | **Exist** |

**Implemented modules today:** Masthead, lead story, story rail, archive tiles, media feature, member prompt, archive spotlight, deferred campaign/events/recognition placeholders, submission CTA, admin link.

## Shared shell risk (critical)

Edits to these files affect **all** fanclub routes:

| Hot file | Risk |
| --- | --- |
| `src/app/fanclub/layout.tsx` | Auth gate for entire `/fanclub/**` tree |
| `src/app/fanclub/page.tsx` | Club Home only — but coordinates with feature links |
| `src/components/fanclub/fanclubGridStyles.ts` | Shared by Gallery + Memorabilia grids |
| `src/lib/fanclubApi.ts` | Shared API URL builders |
| `src/hooks/useMemberSession.ts` | Session boundary |

**Rule:** Gallery/Library/Memorabilia PRs must **not** edit Club Home shell or layout without explicit CLUB-001 coordination. Conversely, CLUB-001 must not break subpage routes.

## Blocked / unblocked conditions

| Condition | Status |
| --- | --- |
| CC-001 freeze for content block fields | **Recommended** before cross-cutting content field changes |
| Club Home newspaper **layout** docs/implementation | **Unblocked** when shell allowlist respected |
| Program 3 launch authorization | See `program-3-club-home-page-design.md` — planning vs execution |

## Gap matrix (intake CLUB-001 vs repo reality)

| Draft concept | Repo reality | Gap / action |
| --- | --- | --- |
| `club-newspaper/**` components | `ClubHome*` naming | **Document** — use existing component names in allowlist |
| Newspaper hierarchy | Implemented module order in `page.tsx` | **Mostly covered** — compare to Program 3 design table |
| Campaign/events modules | `ClubHomeDeferredModule` placeholders | **Deferred by design** — fail-closed |
| `docs/reference/website/content-collection/club-newspaper-*.md` | **Rejected** | Use Program 3 + this package |
| Responsive behavior | Design lock: desktop-first for subpages; Club Home follows clubHomeStyles | Verify per implementation PR |

## Repo-verified file allowlist (implementation child issue)

```text
src/app/fanclub/page.tsx
src/components/fanclub/ClubHome*.tsx
src/components/fanclub/ArchivesTiles.tsx
src/components/fanclub/useClubHomeContent.ts
src/components/fanclub/clubHomeStyles.ts
functions/api/fanclub/home.ts
functions/_lib/content-inventory-club-home.ts
tests/fanclub-home-*.test.tsx
tests/content-inventory-club-home.test.ts
tests/e2e/launch-readiness-fanclub-routes.spec.ts
docs/ops/implementation-plans/content-collection/packages/club-001-club-newspaper-design-package.md
docs/ops/reports/club-001-as-built-*.md
```

**Do not touch without approval:**

- `src/app/fanclub/layout.tsx` (unless auth bug fix explicitly scoped)
- `src/app/fanclub/photo/**`, `src/app/fanclub/library/**`, `src/app/fanclub/memorabilia/**`
- `src/components/fanclub/fanclubGridStyles.ts`
- `src/components/FloatingLogo.tsx` (design lock)
- `.github/workflows/**`, `scripts/ci/**`

## Parallel execution control

| Field | Value |
| --- | --- |
| `parallel_safe` | `conditional` |
| `allowed_parallel_lanes` | Docs-only; completed Gallery/Library/Memorabilia if shell files untouched |
| `prohibited_parallel_lanes` | Concurrent PRs touching `layout.tsx`, `fanclubGridStyles.ts`, or `fanclubApi.ts` |
| `collision_action` | Pause Club or feature lane until conflicting PR merges |

## Validation plan

**Route smoke:**

1. Member → `/fanclub`; confirm masthead, lead story, rail, tiles render (or static fallback).
2. Verify `ClubHomeDeferredModule` fail-closed messages for campaign/events.
3. Feature links navigate to `/fanclub/photo`, `/library`, `/memorabilia` without regression.
4. Anonymous `/fanclub` → redirect `/`.
5. Follow `docs/how-to/website/club-home-content-operations-runbook.md` for content publish verification.

**Commands:**

```bash
npm run typecheck
npm run build
npm test -- tests/fanclub-home-dynamic.test.tsx
npm test -- tests/fanclub-home-shell.test.tsx
npm test -- tests/content-inventory-club-home.test.ts
npm run test:e2e -- tests/e2e/launch-readiness-fanclub-routes.spec.ts
```

**Evidence:** screenshots/smoke notes, design compliance citation, auth boundary confirmation, as-built path.

## Design authority

- `docs/ops/pmo/program-3-club-home-page-design.md` — primary newspaper layout authority
- `docs/reference/design/fanclub-home.md`, `fanclub.md`
- `docs/reference/design/LGFC-Production-Design-and-Standards.md`
- `docs/reference/design/locks/header-memberheader-logo-banner-design-lock.md` — floating logo constraints

## Procedure

1. Read Program 3 design section order before layout changes.
2. Serialize with Gallery/Library/Memorabilia if shared shell files needed.
3. Cite design authority in PR; run club-home tests.
4. Post as-built; note deferred modules explicitly.

## Acceptance criteria

- [ ] Shell risk and hot zones documented.
- [ ] Repo-verified component names (ClubHome*, not fictional `club-newspaper/` tree).
- [ ] Validation ties to existing tests + operator runbook.
- [ ] Gallery/Library/Memorabilia routes protected in allowlist exclusions.
- [ ] No rejected `content-collection/` reference paths.
