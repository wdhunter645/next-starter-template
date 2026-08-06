---
Doc Type: Operations
Audience: Bill, ChatGPT / Atlas, Cursor, Claude Code, LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: Task #2663 evidence trail and rationale backing the rotation/media-pairing/edition contract added to `docs/explanation/website/content-strategy.md`
Does Not Own: The contract itself (canonical in `content-strategy.md`), zone/responsive/accessibility contracts (#2662, canonical in `fanclub-home.md`), editorial-operations technical verification (#2664), CC-001/CC-002's own field contracts (#2433/#2434, consumed not owned here)
Canonical Reference: /docs/explanation/website/content-strategy.md
Related Issues: #2461, #2433, #2434, #2661, #2662, #2663, #2664
Last Reviewed: 2026-08-05
---

# Club Newspaper Rotation, Media-Pairing, and Edition Contract — Evidence and Rationale (#2663)

## Purpose

Record the evidence trail behind the rotation, article/media-pairing, and edition-history contract added to `docs/explanation/website/content-strategy.md` for #2663. Per the pattern established by #2662, the durable contract lives in the canonical content-strategy document; this report is supporting evidence, not a competing authority.

## Scope

In scope: why each rule in the new contract section was written the way it was, the exact live-code evidence backing every "current" claim, and how CC-001/CC-002 were consumed rather than duplicated.

Out of scope: implementing any runtime change (a future, separately authorized task), #2662/#2664's own charters, and CC-001/CC-002's own field-contract content.

## Current known truth

- `functions/_lib/content-inventory-rotation.ts` implements a deterministic score: `priority * 100 + feature_weight * 50 + event-proximity boost - recency penalty - rotation-group penalty`, read directly before writing this contract. The recency penalty (`computeRecentFeaturePenalty`) decays linearly over a 90-day window from `last_featured`; it never fully excludes a row, so a sufficiently high-scoring row can repeat.
- `functions/_lib/content-inventory-club-home.ts`'s `fetchClubHomeContent` excludes the `lead-story` and `story-rail` selections' IDs before picking `archive-spotlight`, but only within one function call (one page request) — there is no cross-request or persisted "edition" concept.
- `content_inventory`'s only rotation-history field is `last_featured` (a single timestamp, confirmed by reading the `SELECT` column list in `fetchClubHomeRows`). No usage-count column, no placement-history table, and no pin-related column exist anywhere in `content_inventory` or a related table (searched `migrations/` for `pinned`; the one match, `0028_faq_view_count_and_pinned.sql`, belongs to an unrelated FAQ feature).
- `functions/_lib/content-inventory-media.ts`'s `content_inventory_media` table (read in full) stores exactly one URL per media association via the joined `photos.url` — no `thumbnail_url`/`small_url`/`medium_url`/`large_url` fields or equivalent rendition-selection logic exist anywhere under `functions/_lib/`.
- CC-001 (#2433, accepted 2026-07-20) freezes the Club Newspaper downstream view contract (`id`, `title`, summary/body, media reference, block type, date/era, source/credit when derived, display priority) and the `content_inventory_media` model this contract's pairing rule reuses.
- CC-002 (#2434, accepted 2026-07-21) freezes the rights/privacy/publication blocking-value table and the required takedown fields (`suppression_reason`, `suppressed_by`, `suppressed_at`, `takedown_request_source`, `takedown_resolution_note`); it also states human review is authoritative and AI must not auto-approve publication, rights, privacy, credit, or provenance — this contract does not touch that boundary since it authorizes no runtime enforcement change.
- Cross-branch note: #2919 (accepted, merged to `component/compliance-readiness`) added `suppression_reason`, `takedown_request_source`, and `takedown_resolution_note` to `content_inventory` for the editorial-suppression admin action, but not CC-002's exact `suppressed_by`/`suppressed_at` fields, and that migration is not present on `main` or `component/club-newspaper-phase0` as of this task. This is flagged as a future reconciliation item, not resolved here — no migration is authorized by this documentation-only task.
- #2662's zone contract (`fanclub-home.md`) defines the 12 stable zone IDs this contract's eligibility table keys off; it was read in full before writing the eligibility rules, not re-derived.

## Intended final state

- `content-strategy.md`'s new contract section becomes the single source #2664 (and any future Phase 1 runtime task) reads against for rotation/media-pairing/edition requirements, without re-deriving them from #2461 or CC-001/CC-002 directly.
- The identified runtime gaps (hard cooldown/least-used selection, usage-count field, placement-history log, manual pinning, edition persistence/regeneration/rollback, media renditions) are addressed by a future, separately authorized implementation task that can start directly from this contract's "Required D1/B2/API implications" list rather than re-deriving requirements.
- The cross-branch takedown-field discrepancy between #2919's `component/compliance-readiness` work and CC-002's exact field names is reconciled when both component branches next integrate toward `main` — this report surfaces it now so it is not rediscovered independently later.

## Why CC-001/CC-002 were consumed, not duplicated

CC-001's Club Newspaper downstream view contract already names every field this contract's pairing rule needs (`media reference`, `source/credit when derived`, `display priority`); repeating those field definitions here would create the parallel authority both CC-001's and #2662's charters explicitly prohibit. Instead, this contract's "Article/media pairing" rule references CC-001's existing `content_inventory_media` model directly and adds only the Club-Newspaper-specific pairing preference (lead-story's `primary_image` association first, most-recent `photos` row as fallback) that CC-001 leaves to each downstream lane to define.

CC-002's blocking-value table is stated as taking precedence over rotation scoring, not merged into the scoring formula, because CC-002 owns publication/rights/privacy gating and this contract must not weaken or reimplement that boundary — a row failing a CC-002 check must never render regardless of its rotation score, which is why the contract states the gate as a precedence rule rather than another scoring input.

## Why the gaps are documented as requirements, not implemented

#2663's own charter and allowlist are documentation-only (`fanclub-home.md`, `content-strategy.md`, this report); no runtime file is in the allowlist, and the task instructions state "No runtime implementation is authorized." Every gap in the new contract section (`hard cooldown`, `usage-count`, `placement-history`, `manual pinning`, `edition persistence`, `media renditions`) is therefore written as an explicit requirement for a future task rather than built here, consistent with how #2661 and #2662 both handled equivalent gaps.

## Validation

- `bash scripts/ci/docs_check_headers.sh .` — run against the three changed/added files (see PR evidence).
- `node scripts/ci/diataxis_folder_audit.mjs` — passes for `docs/ops/reports/*` for the same reason recorded on #2661/#2662's reports (outside the audited folder set); `docs/explanation/website/content-strategy.md` and `docs/reference/design/fanclub-home.md` are inside the audited set and were verified to still satisfy their respective structural requirements after this edit.
- `git diff --check` — run (see PR evidence).
- Every claim above was verified by reading the cited source file directly (`content-inventory-rotation.ts`, `content-inventory-club-home.ts`, `content-inventory-media.ts`, `fanclub-home.md`, CC-001, CC-002), not assumed from prior summaries.

## Rollback

This is a documentation-only change across three files (`content-strategy.md`, `fanclub-home.md`, this report). Revert the bounded PR to remove it; no runtime, schema, or public-copy change is made by this task.
