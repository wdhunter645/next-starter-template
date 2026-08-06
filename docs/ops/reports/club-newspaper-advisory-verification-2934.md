---
Doc Type: Operations
Audience: Bill, ChatGPT / Atlas / WORK, Cursor, Claude Code, Grok (advisory consumer), LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: Task #2934 first-increment advisory evidence packet — Phase 0 authority set, live path inventory, #2464 heading-to-evidence matrix, preserved capabilities, implementation gaps, migration implications, failure-safe boundaries, and unresolved Product questions
Does Not Own: Grok advisory recommendations (#2464), Atlas/WORK disposition of advisory items, canonical zone/rotation/ops contracts (#2662/#2663/#2664 owners), Phase 1 runtime implementation, or Product direction
Canonical Reference: /docs/ops/reports/club-newspaper-technical-map-2664.md
Related Issues: #2461, #2463, #2464, #2661, #2662, #2663, #2664, #2934, #2665
Last Reviewed: 2026-08-06
---

# Club Newspaper Advisory Verification Packet (#2934)

## Purpose

Prepare the complete repository-verification and advisory-input packet for #2464 so Grok can review accepted Phase 0 authority against live as-built evidence, and so WORK can later disposition actual advisory recommendations without rediscovering the repository.

This increment does **not** invent Grok recommendations, does **not** disposition Product direction, and does **not** change runtime behavior.

## Scope

In scope: one evidence report at this path; verification of #2661–#2664 authority and cited live paths at component SHA `3eda2f0d6d849e9bc44176dd27ab2c0f908a8710`; a #2464 heading 1–10 input matrix; preserved capabilities vs gaps; migration/test/failure-safe notes; unresolved Product questions only.

Out of scope: fabricating advisory recommendations; Accept/Reject dispositions; editing canonical design/ops authority; runtime UI/API/schema/migration/D1/B2/Production changes; #2665 / Phase 1 launch.

## Current known truth

- Parent #2463 Phase 0 children #2661–#2664 are accepted and closed; their reports and contracted canonical docs exist on `component/club-newspaper-phase0`.
- Component tip / package Starting SHA: `3eda2f0d6d849e9bc44176dd27ab2c0f908a8710` (merge of PR #3110 / #2664).
- #2464 remains open and still has **no** recorded Grok recommendation set; its body defines review headings and response format only.
- Club Newspaper in runtime is the Club Home experience at `/fanclub` — there is no separate `/newspaper` route on this branch.

## Intended final state

- #2464 can consume this packet as its repository evidence input without additional discovery.
- WORK can run a later #2934 disposition increment against actual Grok recommendations when they exist.
- #2665 remains held until that disposition increment is accepted.

## Component identity

| Field | Value |
| --- | --- |
| Component branch | `component/club-newspaper-phase0` |
| Starting SHA (package) | `3eda2f0d6d849e9bc44176dd27ab2c0f908a8710` |
| Working branch | `cursor/2463-005-newspaper-advisory-verification` |
| Predecessor | #2664 COMPLETE via merged PR #3110 |
| Writable allowlist (this increment) | `docs/ops/reports/club-newspaper-advisory-verification-2934.md` only |

---

## 1. Exact Phase 0 authority set (#2661–#2664)

| Task | Issue | Report (exists on component tip) | Canonical contract updated by that task |
| --- | --- | --- | --- |
| #2463-001 | #2661 | `docs/ops/reports/club-newspaper-authority-disposition-2661.md` | Disposition map; retains `fanclub-home.md` / CLUB-001 / content-inventory model as current |
| #2463-002 | #2662 | `docs/ops/reports/club-newspaper-layout-contract-2662.md` | Zone/responsive/accessibility contract in `docs/reference/design/fanclub-home.md` |
| #2463-003 | #2663 | `docs/ops/reports/club-newspaper-selection-rotation-2663.md` | Rotation/media-pairing/edition contract in `docs/explanation/website/content-strategy.md` |
| #2463-004 | #2664 | `docs/ops/reports/club-newspaper-technical-map-2664.md` | Operator runbook updates in `docs/how-to/website/club-home-content-operations-runbook.md`; as-built admin/tech map |

### Supporting authorities cited by Phase 0 (all EXISTS at starting SHA)

| Path | Role |
| --- | --- |
| `docs/reference/design/fanclub-home.md` | Canonical Club Home route/zone/accessibility contract |
| `docs/ops/pmo/program-3-club-home-page-design.md` | Planning source for unimplemented newspaper depth |
| `docs/ops/implementation-plans/content-collection/packages/club-001-club-newspaper-design-package.md` | CLUB-001 implementation envelope |
| `docs/reference/website/content-inventory-model.md` | `content_inventory` field / media association model |
| `docs/explanation/lgfc-content-collection-strategy.md` | Story-centric archive rationale |
| `docs/explanation/website/content-strategy.md` | Editorial model + #2663 rotation/edition contract home |
| `docs/how-to/website/club-home-content-operations-runbook.md` | Operator publish/verify/troubleshoot procedure |
| Issue #2461 | Product visual/rotation requirements source |
| Issue #2464 | Advisory review headings and response format (no recommendations yet) |

---

## 2. Verified path / component / API / schema / test inventory

Every path below was checked present (`test -f` / tree search) at SHA `3eda2f0d6d849e9bc44176dd27ab2c0f908a8710` unless marked **ABSENT**.

### Runtime pages and components

| Path | Status | Role |
| --- | --- | --- |
| `src/app/fanclub/page.tsx` | EXISTS | Club Home / newspaper shell composition |
| `src/app/fanclub/layout.tsx` | EXISTS | Fan Club layout |
| `src/components/fanclub/ClubHomeMasthead.tsx` | EXISTS | Masthead zone |
| `src/components/fanclub/ClubHomeStaticStory.tsx` | EXISTS | Lead story |
| `src/components/fanclub/ClubHomeStoryRail.tsx` | EXISTS | Story rail |
| `src/components/fanclub/ArchivesTiles.tsx` | EXISTS | Feature-link cards |
| `src/components/fanclub/ClubHomeMediaFeature.tsx` | EXISTS | Media feature |
| `src/components/fanclub/ClubHomeMemberPrompt.tsx` | EXISTS | Member prompt |
| `src/components/fanclub/ClubHomeArchiveSpotlight.tsx` | EXISTS | Archive spotlight |
| `src/components/fanclub/ClubHomeDeferredModule.tsx` | EXISTS | Deferred campaign/events/recognition slots |
| `src/components/fanclub/ClubHomeSubmissionCta.tsx` | EXISTS | Submission CTA |
| `src/components/fanclub/clubHomeStyles.ts` | EXISTS | Spacing/typography tokens (no breakpoint composition) |
| `src/components/fanclub/useClubHomeContent.ts` | EXISTS | Client fetch hook for Club Home payload |
| `src/app/admin/editorial/page.tsx` | EXISTS | Admin editorial UI |
| `src/app/admin/clubstaging/page.tsx` | EXISTS | Staging preview |
| `src/app/**/newspaper/**` | **ABSENT** | No dedicated newspaper route |

### APIs and libraries

| Path | Status | Role |
| --- | --- | --- |
| `functions/api/fanclub/home.ts` | EXISTS | `GET /api/fanclub/home` |
| `functions/_lib/content-inventory-club-home.ts` | EXISTS | Club Home selection/ranking assembly |
| `functions/_lib/content-inventory-rotation.ts` | EXISTS | Deterministic rotation scoring + `last_featured` update |
| `functions/_lib/content-inventory-media.ts` | EXISTS | Media association normalization |
| `functions/api/admin/editorial/list.ts` | EXISTS | Draft/list preview |
| `functions/api/admin/editorial/review.ts` | EXISTS | Submission review lifecycle |
| `functions/api/admin/editorial/inventory.ts` | EXISTS | Draft inventory CRUD |
| `functions/api/admin/editorial/publish.ts` | EXISTS | Publish/unpublish/archive |
| `functions/api/admin/editorial/media-associations.ts` | EXISTS | Media pairing replace |
| `functions/api/**/edition/**` | **ABSENT** | No edition API |
| `functions/api/**/newspaper/**` | **ABSENT** | No newspaper-named API |

### Schema / migrations (selected)

| Path | Status | Notes |
| --- | --- | --- |
| `migrations/0035_editorial_archive.sql` | EXISTS | `content_inventory` rotation fields (`tag`, `rotation_group`, `last_featured`, `feature_weight`, `allowed_sections`, …) + `submission_queue` |
| `migrations/0036_content_inventory_schema_delta.sql` | EXISTS | Summary / perspective / event_year |
| `migrations/0038_content_inventory_media_association.sql` | EXISTS | `content_inventory_media` (roles include `newspaper_source`) |
| `migrations/0042_content_pipeline_core.sql` | EXISTS | Pipeline tags; source enum includes `'newspaper'` |
| Edition / placement-history / Club Home pin tables | **ABSENT** on this branch | Confirmed by #2663/#2664 and migration search |

### Tests (selected)

| Path | Status | Covers |
| --- | --- | --- |
| `tests/fanclub-home-dynamic.test.tsx` | EXISTS | `/fanclub` dynamic content |
| `tests/fanclub-home-shell.test.tsx` | EXISTS | Shell/session gate |
| `tests/content-inventory-club-home.test.ts` | EXISTS | `fetchClubHomeContent` |
| `tests/content-inventory-rotation.test.ts` | EXISTS | Rotation scoring |
| `tests/content-inventory-media.test.ts` | EXISTS | Media association helpers |
| `tests/admin-editorial-archive.test.tsx` | EXISTS | Admin archive/publish UI states |
| Direct tests for `review.ts` / `inventory.ts` / `publish.ts` / `media-associations.ts` | **ABSENT** | Gap recorded in #2664 |

---

## 3. Requirement-to-evidence matrix (#2464 headings 1–10)

For each #2464 review heading: what Phase 0 authority says, what live code does, and what evidence #2464 should read. **No advisory recommendation is stated.**

### 1. Visual newspaper authenticity

| Layer | Evidence |
| --- | --- |
| Product | #2461 newspaper mockup / section-order requirements (source Issue) |
| Authority | `docs/reference/design/fanclub-home.md`; #2661 gap inventory (match on section order); #2662 zone contract rationale |
| Live | `src/app/fanclub/page.tsx` composes masthead → lead → rail → feature links → media → member prompt → archive spotlight → deferred modules → submission CTA |
| Tests | `tests/fanclub-home-shell.test.tsx`, `tests/fanclub-home-dynamic.test.tsx` |
| Gap for advisory focus | Authenticity is currently layout/composition, not a separate design-token “newspaper chrome” system; Phase 0 docs do not define a parallel visual design system beyond zone contracts |

### 2. Editorial zone contracts

| Layer | Evidence |
| --- | --- |
| Authority | `fanclub-home.md` zone IDs/priority/visibility (#2662); supporting report `club-newspaper-layout-contract-2662.md` |
| Live | Components listed in §2 map 1:1 to zones; `clubHomeStyles.ts` is column stack only (no `@media` composition) |
| Open Product note (already recorded) | #2662 leaves `recognition` / `submission-cta` side-rail vs below-fold placement as an open Product design note — not resolved here |

### 3. Tagging and discovery

| Layer | Evidence |
| --- | --- |
| Authority | `docs/reference/website/content-inventory-model.md`; `content-strategy.md`; CLUB-001; migrations `0035`/`0042` |
| Live | `content_inventory.tag` / `allowed_sections` / pipeline `tags` tables; photo/memorabilia tag APIs under `functions/api/fanclub/*/tags.ts` |
| Gap for advisory focus | Controlled-vocabulary / synonym / negative-tag safeguards for Club Home selection are contract-level in Phase 0 docs more than a dedicated Club Home tag-governance runtime |

### 4. Article/media matching

| Layer | Evidence |
| --- | --- |
| Authority | #2663 pairing rule in `content-strategy.md`; CC-001/`content_inventory_media` model; `club-newspaper-selection-rotation-2663.md` |
| Live | `functions/_lib/content-inventory-media.ts`; admin `media-associations.ts`; single URL per association (no rendition fields) |
| Gap | Media renditions (thumb/small/medium/large) **ABSENT**; rights/credit fields exist in model — enforcement boundaries owned by CC-002 / compliance lane (takedown fields not on this component tip) |

### 5. Rotation and fairness

| Layer | Evidence |
| --- | --- |
| Authority | #2663 contract in `content-strategy.md`; #2661 gap inventory; `club-newspaper-selection-rotation-2663.md` |
| Live | `functions/_lib/content-inventory-rotation.ts` — deterministic score (`priority`, `feature_weight`, event proximity, soft recency penalty, rotation-group penalty); `last_featured` only |
| Tests | `tests/content-inventory-rotation.test.ts` |
| Gap | Hard cooldown, least-used selection among peers, usage-count, placement-history log, manual pinning — required by contract, **not implemented** |

### 6. Edition and publishing behavior

| Layer | Evidence |
| --- | --- |
| Authority | #2663 edition-history requirements in `content-strategy.md`; #2664 admin vs #2461 table |
| Live | Per-request recompute via `content-inventory-club-home.ts` + `GET /api/fanclub/home`; publish/unpublish via `publish.ts`; **no** edition table/API/scheduler |
| Gap | Edition persistence, regeneration, override, rollback, and edition audit — **ABSENT** (Phase 1) |

### 7. Accessibility and responsive behavior

| Layer | Evidence |
| --- | --- |
| Authority | `fanclub-home.md` accessibility + responsive sections; `club-newspaper-layout-contract-2662.md` |
| Live | Single-column flex stack today; heading hierarchy h1/h2/h3 verified in #2662; media-feature always supplies alt text; no custom focus overrides; no `prefers-reduced-motion` handling; muted text contrast claimed AA in #2662 |
| Gap | Tablet/desktop two-column composition specified in contract but **not implemented** in CSS |

### 8. Operational / admin requirements

| Layer | Evidence |
| --- | --- |
| Authority | #2664 technical map; `club-home-content-operations-runbook.md` |
| Live | Staging/preview via editorial list drafts; exclusion via unpublish/archive; media substitution via media-associations; approval via review+publish; audit **partial** (`review_notes` + timestamps) |
| Gap | Pinning UI/API **ABSENT**; edition regeneration **ABSENT**; structured per-action audit log **ABSENT**; takedown/suppress on this branch **ABSENT** (exists only on other component tip per #2664) |

### 9. Data model and implementation risk

| Layer | Evidence |
| --- | --- |
| Authority | #2664 risk register; content-inventory model; migrations `0035`/`0036`/`0038`/`0042` |
| Live risks already recorded | Full eligible-row scan + in-memory sort; no Cache-Control/KV on Club Home GET; `recordRotationFeature` update without optimistic lock; future placement-history join would amplify cost |
| Migration posture | Additive forward-only migrations recommended for pins/editions/history/renditions — none authorized here |

### 10. Duplication check

| Layer | Evidence |
| --- | --- |
| Authority | #2661 disposition table; #2662/#2663 “consume don’t duplicate” posture toward CC-001/CC-002 and `fanclub-home.md` |
| Live | Newspaper behavior is Club Home, not a second product surface — avoids duplicate `/newspaper` implementation |
| Stale-doc note | #2661 recorded `docs/reference/design/fanclub.md` Club Home section-order subsection as stale (update required); treated as documentation currency, not a Product-direction contradiction |

---

## 4. Preserved capabilities, gaps, migration implications, failure-safe boundaries

### Preserved capabilities (do not regress in Phase 1)

- Newspaper section order on `/fanclub` matching `fanclub-home.md`.
- Published `club_home` selection via `GET /api/fanclub/home`.
- Deterministic rotation scoring and within-request de-duplication of lead/rail before archive spotlight.
- Admin editorial draft/list/review/publish/media-association flows.
- Media associations with required alt text for public-facing roles.
- Existing focused tests for Club Home shell/dynamic content, club-home fetch, rotation, media helpers, and admin archive UI.

### Known implementation gaps (Phase 1 candidates — not authorized here)

- Hard cooldown / least-used fairness beyond soft recency penalty.
- Usage-count field and placement-history log.
- Manual pinning.
- Edition persistence / regenerate / rollback / scheduler.
- Media renditions.
- Structured editorial audit trail.
- Club Home responsive two-column composition.
- Direct tests for admin-write editorial endpoints.
- Takedown/suppress fields reconciliation with compliance component tip.

### Migration implications

- Gap-closing work is expected to be **additive** migrations (new tables/columns), not rewrite of `content_inventory` core.
- Cross-branch suppress/takedown field names must be reconciled when `component/compliance-readiness` and this component integrate toward `main` (#2663 note).

### Failure-safe boundaries (this increment)

- No runtime mutation.
- No invented Grok recommendations or Product Accept/Reject labels.
- Paths absent on this tip are marked **ABSENT**, not described as implemented.
- Requirements that need code/schema change remain Phase 1 / future task language.

---

## 5. Concise #2464 advisory input packet

Provide Grok (when WORK releases #2464) the following **exact** inputs — nothing more is required for repository discovery:

1. **Product / project**
   - Issues #2461, #2463, #2464 (headings only until recommendations exist).
2. **Accepted Phase 0 reports**
   - `docs/ops/reports/club-newspaper-authority-disposition-2661.md`
   - `docs/ops/reports/club-newspaper-layout-contract-2662.md`
   - `docs/ops/reports/club-newspaper-selection-rotation-2663.md`
   - `docs/ops/reports/club-newspaper-technical-map-2664.md`
   - **This packet:** `docs/ops/reports/club-newspaper-advisory-verification-2934.md`
3. **Canonical contracts**
   - `docs/reference/design/fanclub-home.md` (zones/responsive/a11y)
   - `docs/explanation/website/content-strategy.md` (rotation/media/edition contract section)
   - `docs/how-to/website/club-home-content-operations-runbook.md`
   - `docs/reference/website/content-inventory-model.md`
   - CLUB-001 package + `program-3-club-home-page-design.md` (planning depth)
4. **Live verification anchors**
   - Component SHA `3eda2f0d6d849e9bc44176dd27ab2c0f908a8710`
   - Runtime: `src/app/fanclub/page.tsx`, Club Home components, `functions/api/fanclub/home.ts`, rotation/club-home/media libs, admin editorial APIs
   - Tests listed in §2
5. **Response expectation (from #2464 body — not authored here)**
   - For each recommendation: concise recommendation; risk; affected doc/section; priority; new/partial/already-covered; no implementation code unless needed to show design ambiguity.

**Explicit non-output of this packet:** no Grok recommendations; no Atlas disposition classifications.

---

## 6. Unresolved-question register (Product / authority only)

| ID | Question | Why unresolved | Owner |
| --- | --- | --- | --- |
| Q1 | Should `recognition` and `submission-cta` remain below-the-fold, or move to side-rail as #2461 “candidate” language suggested? | Recorded open design note in #2662 / `fanclub-home.md`; not a defect | Product Authority |
| Q2 | When Grok recommendations arrive on #2464, which accepted Phase 0 contracts may be amended vs which require new Issues? | No recommendations exist yet; disposition process is defined but not exercised | WORK / Atlas after #2464 response |
| Q3 | Cross-branch takedown/suppress field reconciliation timing vs Club Newspaper Phase 1 | #2919 fields live on `component/compliance-readiness`, not this tip | PMO integration planning |

No other genuine Product-direction contradictions were found beyond documentation-currency items already dispositioned in #2661 (e.g., stale `fanclub.md` section-order subsection).

---

## Validation (local)

Commands for the PR / handoff (to be re-run at head SHA):

- `bash scripts/ci/docs_check_headers.sh docs/ops/reports/club-newspaper-advisory-verification-2934.md`
- `node scripts/ci/diataxis_folder_audit.mjs`
- `git diff --check`
- Path existence checks for every cited EXISTS path at starting SHA `3eda2f0d6d849e9bc44176dd27ab2c0f908a8710`

## Rollback

Documentation-only single-file PR. Revert the component PR to remove this report. No runtime or data recovery required.

## Boundaries confirmation

- Diff must contain only this file.
- No advisory recommendation invented.
- No Product disposition recorded.
- No runtime/schema/D1/B2/credential/Production mutation.
