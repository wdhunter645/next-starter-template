---
Doc Type: Operations
Audience: Bill, ChatGPT / Atlas, Cursor, Claude Code, LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: Task #2661 authority/source map, current-implementation-vs-approved-design gap inventory, document disposition table, and unresolved contradiction register for Club Newspaper project Phase 0
Does Not Own: Runtime implementation, zone/responsive/accessibility contracts (owned by #2662), rotation/media-pairing/edition contracts (owned by #2663), editorial-operations technical verification (owned by #2664), Grok advisory disposition (owned by #2934), or Bill's final Phase 0 acceptance
Canonical Reference: /docs/ops/pmo/program-3-club-home-page-design.md
Related Issues: #2461, #2463, #2464, #2661, #2662, #2663, #2664, #2934, #2665
Last Reviewed: 2026-08-05
---

# Club Newspaper Design Authority and Document Disposition (#2661)

## Purpose

Reconcile #2461 (the approved first 2026-07-11 newspaper mockup and requirements), recovered legacy evidence, and current repository design authority into one document-disposition map for Club Newspaper project Phase 0 (#2463). Identify exactly which existing files remain canonical, require update, merge, or supersession. This report does not create a parallel canonical design system and does not authorize runtime implementation.

## Scope

In scope: reconciling the ten cited design/content authorities plus #2461/#2463/#2464 against current repository implementation (`src/app/fanclub/page.tsx`, `ClubHome*` components, `functions/_lib/content-inventory-club-home.ts`, `functions/_lib/content-inventory-rotation.ts`); a document disposition table; a gap inventory between #2461's requirements and current implementation; a genuine-contradiction register; and exact proposed writable paths for #2662–#2664.

Out of scope: defining the zone/responsive/accessibility contract itself (#2662), rotation/media-pairing/edition contract implementation (#2663), editorial-operations technical verification (#2664), Grok advisory disposition (#2934), and any runtime code, migration, or Phase 1 implementation.

## Current known truth

- Club Newspaper Phase 0 was graduated 2026-07-28 with entry gate "#2785 completed and accepted." #2785 closed `state_reason: completed` on 2026-08-05T19:13:47Z; this task was released to Claude Code one second later.
- The component branch `component/club-newspaper-phase0` did not exist before this task; it was created from `main` tip `e3e66cb` because no prior work on this component exists to preserve.
- The live Club Home (`/fanclub`) implementation is already newspaper-style and already matches the section order documented in `docs/reference/design/fanclub-home.md` and `docs/ops/implementation-plans/content-collection/packages/club-001-club-newspaper-design-package.md`, both of which are current (last reviewed 2026-06-23 and 2026-07-10 respectively).
- `docs/reference/design/fanclub.md` contains a stale "FanClub Home Page (Club Home) — section order" section describing the pre-newspaper dashboard layout that `fanclub-home.md` records as removed under "audit #1962." This is a real, verifiable authority conflict, not a genuine open product decision — the live code and the more specific canonical doc agree; `fanclub.md`'s content simply was not updated when the newspaper redesign shipped.
- #2463's citation of legacy `/docs/memberpage.html` and `/docs/memberpage-v1.html` evidence "preserved through PR #397 and historical commits" does not surface under those literal filenames in a repository search (`git log --all -i --grep=memberpage`, a full-tree filename search across every commit, and a search for any PR #397 reference in commit messages all found nothing). **Correction (Product Authority clarification, #2662 comment `5196533860`):** this does not make the citation invalid. `memberpage` is the former name of the page now called `fanclub`; the legacy documentation is retained as historical design evidence under its original naming, and the absence of a literal `memberpage.html` filename in the current repository search is expected, not a sign the evidence is missing or fabricated. This report's original framing of the citation as "unverifiable" was incorrect and is corrected here per that clarification.
- Rotation, content-model, and content-strategy authority (`program-3-club-home-page-design.md`, `club-001-club-newspaper-design-package.md`, `lgfc-design-evolution.md`, `lgfc-content-collection-strategy.md`, `content-strategy.md`, `content-inventory-model.md`, `lou-gehrig-content-data-surface-boundary.md`, `club-home-content-operations-runbook.md`) is internally consistent with itself and with the live implementation; no genuine contradictions were found among these eight documents.
- `docs/reference/design/LGFC-Production-Design-and-Standards.md`, the top-level authority both `fanclub.md` and `fanclub-home.md` point to, defines FanClub navigation/header/route structure but does not itself define the Club Home page's internal section order — it delegates that to the route-level design reference, which is `fanclub-home.md`'s explicit charter ("Owns: FanClub home route purpose, section contracts").
- #2464 (Grok advisory review) remains correctly `Prepared — blocked pending coherent Club Newspaper Phase 0 draft package from #2463` — this report is part of producing that package, not a trigger to begin the Grok review itself (that remains #2934's scope).

## Intended final state

- `fanclub.md` no longer states a conflicting Club Home section order; it either points to `fanclub-home.md` as the section-order authority or is corrected in place, so no future agent can read `fanclub.md` and reasonably conclude the newspaper redesign has not shipped.
- #2463's legacy-evidence citation is treated as valid historical design evidence under its legacy `memberpage` naming (Product Authority clarification, #2662 comment `5196533860`), not as an open citation-accuracy question. Phase 0's "repository archaeology requirement" (#2461) is satisfied by preserving that legacy documentation and using `fanclub` for all current design and route authority — resolved, not requiring further correction.
- #2662 has an exact, bounded input (this report's gap inventory) to define the zone/responsive/accessibility contract without re-deriving authority from scratch.
- #2663 has an exact, bounded input to define the rotation/media-pairing/edition contract, scoped to the specific gaps this report identifies (usage-count/placement-history/manual-pinning, media renditions) rather than a full rewrite of already-working rotation logic.
- #2664 has an exact, bounded input to verify the editorial/admin operating model against #2461's requirements.
- This document itself reaches final state once its disposition table and gap inventory are accepted by WORK; it does not itself change any of the disposed documents.

## Authority / source map

| Source | Authority Level | Role | Current status |
| --- | --- | --- | --- |
| #2461 | Product decision (source Issue) | Canonical visual direction, content-asset model, rotation requirements, repository-archaeology requirement | Open, authoritative |
| #2463 | Project Graduation package | Phase 0 scope, sequencing, child task chain, cited legacy evidence | Open, authoritative for sequencing; legacy `memberpage` citation confirmed valid (see corrected note below) |
| #2464 | Advisory (Grok) | Bounded enrichment review after this report exists | Open, correctly blocked on this task |
| `docs/reference/design/fanclub-home.md` | Canonical Design Specification | Club Home route purpose and locked section-order contract | Current, matches live code |
| `docs/reference/design/fanclub.md` | Controlled (supporting) | FanClub routes/nav/UI-UX contracts generally | Current for nav/header/routes; **stale** for its own Club Home section-order subsection |
| `docs/ops/pmo/program-3-club-home-page-design.md` | Planning Draft | Original Program 3 newspaper layout, backend source map, rotation/reuse strategy candidate | Superseded in effect by `fanclub-home.md`/CLUB-001 for what's built; still the most detailed source for what is *not yet* built (media renditions, deeper rotation, focused content additions) |
| `docs/ops/implementation-plans/content-collection/packages/club-001-club-newspaper-design-package.md` (CLUB-001) | Operational Plan | Implementation envelope, shared-shell risk, repo-verified file allowlist, "implemented modules today" | Current (reviewed 2026-07-10), accurate against live code |
| `docs/explanation/lgfc-design-evolution.md` | Supporting/Explanation | Rationale: newspaper-style presentation is Pillar 2 of the product direction | Current, no conflicts |
| `docs/explanation/lgfc-content-collection-strategy.md` | Controlled/Explanation | Story-centric, write-once/read-many archive rationale | Current, no conflicts |
| `docs/explanation/website/content-strategy.md` | Controlled/Explanation | `content_inventory`/`submission_queue` editorial model, `club_home` as a documented dynamic-population surface | Current, no conflicts |
| `docs/reference/website/content-inventory-model.md` | Controlled/Reference | `content_inventory` field contract, rotation fields, media association model | Current, no conflicts; live schema usage matches this model |
| `docs/reference/architecture/lou-gehrig-content-data-surface-boundary.md` | Controlled/Reference | D1/B2 boundary for future Gehrig-content intake (narrow scope, Phase 1 of a different program) | Current, no conflict, not directly about Club Home layout |
| `docs/how-to/website/club-home-content-operations-runbook.md` | Operational Procedure | Operator publish/verify procedure for `club_home` placement | Current, consistent with live routes and APIs |
| `docs/reference/design/LGFC-Production-Design-and-Standards.md` | Canonical (top-level) | FanClub nav/header/route structure | Current; does not own Club Home internal section order (delegates to `fanclub-home.md`) — no conflict, but the delegation is implicit rather than an explicit cross-reference |

## Current implementation vs. approved design gap inventory

| Requirement (#2461) | Current implementation | Disposition |
| --- | --- | --- |
| Newspaper section order (masthead, lead story, rail, feature links, media feature, member prompt, archive spotlight, campaign/events/recognition, submission CTA) | `src/app/fanclub/page.tsx` renders exactly this order via `ClubHomeMasthead`, `ClubHomeStaticStory`, `ClubHomeStoryRail`, `ArchivesTiles`, `ClubHomeMediaFeature`, `ClubHomeMemberPrompt`, `ClubHomeArchiveSpotlight`, three `ClubHomeDeferredModule` instances, `ClubHomeSubmissionCta`, `AdminLink` | **Match** — no gap |
| Content Asset metadata (id, title, tagline, type, topic/tags, source, credit, destination, publication status, placement/size eligibility, rotation group, last-used, usage count, recent placement history, time-sensitivity) | `content_inventory` provides id, title, tag, source_name, credit_line, allowed_sections, priority, rotation_group, last_featured, feature_weight, event_date/event_year, status | **Partial** — no explicit usage-count field and no recent-placement-history log; only a single `last_featured` timestamp per row |
| Automated rotation: exclude recently used, prefer least-used, randomize among least-used eligible candidates, achieve full/near-full inventory rotation before reuse | `functions/_lib/content-inventory-rotation.ts` computes a deterministic score (priority × 100 + feature_weight × 50 + event-proximity boost − recency penalty − rotation-group penalty) and sorts; top-scored row wins every time absent score changes | **Gap** — this is deterministic score-ranking, not randomized selection among least-used candidates; a stable top scorer can be shown repeatedly rather than guaranteeing near-full inventory rotation. Squarely #2663's charter. |
| Placement history (asset ID, zone, size, timestamp, edition ID, auto-vs-pinned, rendition used) recorded per placement | Only `last_featured` is updated (`recordRotationFeature`); no per-placement history table found | **Gap** — no placement-history log exists. #2663 charter. |
| Manual pinning / editorial override | No pinning mechanism found in `content_inventory` schema or rotation code (the one `pinned` column found in the repo, migration `0028_faq_view_count_and_pinned.sql`, belongs to FAQs, an unrelated feature) | **Gap** — #2663 charter. |
| Duplicate simultaneous placement prevented | `fetchClubHomeContent` excludes the lead story's ID and rail-story IDs before picking the archive spotlight, within a single request | **Match within one page render**; no cross-zone/cross-request "edition" concept exists, so this is only partially the persistent-edition behavior #2461 describes — flagged for #2663 |
| Media renditions: thumbnail/small/medium/large, generated and requested by size | No rendition generation or size-specific URL fields found anywhere under `functions/_lib/` (searched for `thumbnail`, `rendition`, `small_url`, `medium_url`, `large_url`) — `resolveMediaFeature` returns one normalized URL | **Gap** — #2663 charter (media-pairing/rendition contracts) |
| Feature-link cards (Gallery/Library/Memorabilia) | `ArchivesTiles` implements exactly the Program 3 feature-link card model, linking to existing production-designed subpages | **Match** — no gap |
| Zone-driven selection, controlled tags/negative filters, responsive ordering (desktop/tablet/mobile) | Not yet defined in a dedicated contract; `clubHomeStyles.ts` provides section spacing only | **Not yet in scope for #2661** — this is #2662's exact charter, not a defect in current work |
| Focused content inventory additions (Lou Gehrig Award winners, Heart Sandlot Classic, Lou Gehrig Day recurring) | Not verified against live D1 rows in this read-only task (verifying actual seeded content is outside a documentation-authority reconciliation and requires DB inspection) | **Unresolved — routed to #2663** (content selection/rotation is where these would be represented as assets) |
| Admin/editorial operating model (staging, preview, pinning, exclusion, media substitution, edition regen, audit) | Admin editorial inventory (`/admin/editorial`) supports publish/placement per the operations runbook; no pinning, exclusion, or edition-regeneration UI found | **Gap** — #2664 charter (editorial operations and technical-boundary verification) |

## Document disposition table

| Document | Disposition | Action |
| --- | --- | --- |
| `docs/reference/design/fanclub-home.md` | **Retain as canonical** | No change — accurate, matches live implementation |
| `docs/reference/design/fanclub.md` | **Update required** | Its "FanClub Home Page (Club Home) — section order" subsection (lines ~70–83) describes the removed pre-newspaper layout and should be replaced with a pointer to `fanclub-home.md` as the section-order authority. Out of this task's one-file writable allowlist; recommend as the first proposed writable path for #2662 (see below), since #2662 already owns zone/section contract work. |
| `docs/ops/pmo/program-3-club-home-page-design.md` | **Retain as planning source** | No change now. Its still-unimplemented items (media renditions, deeper rotation, focused content additions, admin pinning/exclusion) should be promoted into canonical reference docs as #2662–#2664 address them, rather than treated as already satisfied. |
| CLUB-001 package | **Retain as canonical** | No change — accurate, current, correctly scoped |
| `docs/explanation/lgfc-design-evolution.md` | **Retain** | No change — rationale-only, consistent |
| `docs/explanation/lgfc-content-collection-strategy.md` | **Retain** | No change — consistent |
| `docs/explanation/website/content-strategy.md` | **Retain** | No change — consistent |
| `docs/reference/website/content-inventory-model.md` | **Retain** | No change — consistent, matches live schema usage |
| `docs/reference/architecture/lou-gehrig-content-data-surface-boundary.md` | **Retain** | No change — narrow scope, no conflict |
| `docs/how-to/website/club-home-content-operations-runbook.md` | **Retain** | No change — consistent with live routes/APIs |
| `docs/reference/design/LGFC-Production-Design-and-Standards.md` | **Retain** | No change required to resolve a conflict (none exists); optionally add an explicit cross-reference to `fanclub-home.md` for Club Home section order the next time this document is otherwise touched — not a bounded action for this report's allowlist |
| #2463 (legacy-evidence citation) | **Retain, no correction needed** | Confirmed valid by Product Authority; `memberpage` is the legacy name for the current `fanclub` page. See the corrected note below. |

## Unresolved contradiction register (genuine product decisions only)

No genuine open *product-direction* contradictions were found. The Club Home newspaper redesign is a settled, already-implemented decision that every current document agrees with once `fanclub.md`'s stale subsection is set aside as a documentation-currency defect rather than a live disagreement.

**Legacy `memberpage.html` / PR #397 citation — resolved, not a contradiction.** This report originally flagged #2463's citation of legacy `/docs/memberpage.html` and `/docs/memberpage-v1.html` evidence as unverifiable because no file matching `memberpage*` and no PR #397 reference surfaced in a full repository history search. Product Authority clarified (#2662 comment `5196533860`) that `memberpage` is the former name of the page now called `fanclub`, retained in legacy design documentation; the absence of a literal `memberpage.html` filename in the current repository is expected given that naming history, not evidence the citation is invalid. PMO disposition: preserve the legacy documentation as historical design evidence, use `fanclub` for all current design and route authority, and do not characterize the legacy evidence as invalid merely because a current repository search does not expose the former filename. No open item remains here.

## Exact proposed writable paths for #2662–#2664

These paths are corrected to match each successor task's already-defined `Claude Code execution package` allowlist (verified by reading #2662/#2663/#2664 directly), not invented fresh:

- **#2662** (zone/responsive/accessibility contract) — allowlist already defined as `docs/reference/design/fanclub-home.md` and `docs/ops/reports/club-newspaper-layout-contract-2662.md`. #2662 should use its own `fanclub-home.md` write access to add the formal zone map (IDs, labels, size classes, allowed/prohibited content types, responsive ordering, accessibility constraints per #2461's "Editorial zone contracts" and "Responsive behavior" sections) directly into that canonical doc, per its own instruction not to create parallel canonical authority.
- **#2663** (content selection, rotation, media pairing, edition contracts) — allowlist already defined as `docs/reference/design/fanclub-home.md`, `docs/explanation/website/content-strategy.md`, and `docs/ops/reports/club-newspaper-selection-rotation-2663.md`. This is the right home for the usage-count/placement-history/manual-pinning/randomized-least-used-selection and media-rendition contract gaps this report identifies; any resulting runtime change (`functions/_lib/content-inventory-rotation.ts`, `functions/_lib/content-inventory-club-home.ts`, a new placement-history table) remains separately authorized, not part of #2663's own documentation-only envelope.
- **#2664** (editorial operations and technical-boundary verification) — allowlist already defined as `docs/how-to/website/club-home-content-operations-runbook.md`, `docs/ops/reports/club-newspaper-technical-map-2664.md`, and `docs/reference/design/fanclub-home.md`.

**Gap resolved:** the concrete document-hygiene fix this report identified — replacing `fanclub.md`'s stale Club Home section-order subsection with a pointer to `fanclub-home.md` — had no task owner among #2662/#2663/#2664's original allowlists. WORK resolved this by expanding #2662's writable allowlist to include `docs/reference/design/fanclub.md` (release comment `5196486015`); #2662 applies that fix directly rather than leaving it open.

## Validation

- `bash scripts/ci/docs_check_headers.sh .` — run against this file (see PR evidence).
- `node scripts/ci/diataxis_folder_audit.mjs` — run; passed because `docs/ops/` is outside the audited DIATAXIS folder set (`docs/tutorials`, `docs/how-to`, `docs/reference`, `docs/explanation`), not because the audit validated this file's structure. A direct per-file run against this path would report `OUTSIDE_DIATAXIS_FOLDER` (matching this PR's own non-blocking advisory comment) — expected and non-blocking for `docs/ops/reports/*`, consistent with other accepted reports in this location.
- `git diff --check` — run (see PR evidence).
- Every cited path, component, table, and field name in this report was verified against live repository state (`src/app/fanclub/page.tsx`, `ClubHome*.tsx`, `content-inventory-club-home.ts`, `content-inventory-rotation.ts`, `content_inventory` field usage) rather than assumed from documentation alone.
- The legacy `memberpage`/PR #397 citation does not surface under that literal filename via `git log --all -i --grep=memberpage`, a full-tree filename search across every commit, or a commit-message search for "#397" — expected given `memberpage` is the legacy name for the current `fanclub` page (Product Authority clarification, #2662 comment `5196533860`), not evidence the citation is invalid.

## Rollback

This is a single-file, evidence-only report. Revert the bounded documentation PR to remove it; no runtime, schema, or public-copy change is made by this task.
