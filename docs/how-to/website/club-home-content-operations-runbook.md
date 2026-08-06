---
Doc Type: How-To
Audience: LGFC operators, editors, and AI implementation agents
Authority Level: Operational Procedure
Owns: Operator handoff for Club Home content placement, source/credit review, and member-surface verification after Program #1685 Tasks 004–007
Does Not Own: Merge authority, production B2 configuration, or issue closure
Canonical Reference: /docs/reference/website/unified-content-workflow.md
Related issues: #1693, #1685, #1689, #1690, #1691, #1692, #2461, #2663, #2664
Last Reviewed: 2026-08-06
---

# Club Home Content Operations Runbook

## Purpose

Give operators a single procedure for publishing content to Club Home and
verifying member-facing surfaces after the Website Completion / Fan Club Product
Buildout implementation (Tasks 004–007).

## Scope

This how-to covers:

- editorial publish and `club_home` placement;
- source/credit checks before publication;
- post-publish verification on `/fanclub` and linked member routes;
- accepted limitations and deferred work recorded in task evidence.

Out of scope:

- fundraiser, CMS slug pages, and moderation lanes unrelated to Club Home;
- binary member photo upload (deferred);
- GitHub issue closure or PR merge actions.

## Current known truth

- Tasks 004–007 merged implementation evidence exists in `docs/reference/website/unified-content-workflow.md`, Club Home APIs/UI, and Fan Club subpages.
- Operators publish Club Home content through admin editorial inventory with `club_home` in `allowed_sections`.
- Member surfaces use server-side search and fail-closed empty states as implemented in Task 007.

## Steps

1. Confirm the story or media item has complete source/credit metadata.
2. Publish or update the item in admin editorial inventory with `club_home` in `allowed_sections`.
3. Set rotation priority within the `club_home` section per placement reference.
4. Save and wait for inventory APIs to reflect the published row.
5. Sign in as a test member and open `/fanclub`.
6. Verify lead story, rail, spotlight, and media modules render the published item or fail closed to static fallback.
7. Spot-check `/fanclub/library`, `/fanclub/photo`, and `/fanclub/memorabilia` for search and related-story behavior.
8. Record verification notes in the task evidence report if program closeout requires it.

## Procedure

### Source and credit gate

Before any Club Home placement:

1. Open [Review a content submission](./review-content-submission.md).
2. Confirm `source_name`, `source_url`, and `credit_line` (or legacy author fields) are present when the item claims third-party or archival provenance.
3. Reject or return items with missing attribution rather than publishing to `club_home`.

Canonical workflow reference: `docs/reference/website/unified-content-workflow.md`.

### Publish to `club_home`

1. Open the admin editorial inventory UI (`/admin/editorial`).
2. Create or edit a published `content_inventory` row.
3. Include `club_home` in `allowed_sections` (API and inventory model accept this key; confirm the admin checkbox list includes **Club Home** when UI and API are in sync).
4. Assign `priority` and rotation metadata per `docs/reference/website/editorial-placement-and-rotation.md`.
5. Associate approved media when the Club Home module requires a thumbnail or feature image.

Runtime read path: `GET /api/fanclub/home` aggregates published `club_home` inventory with rotation rules in `functions/_lib/content-inventory-club-home.ts`.

### Member surface verification

After Club Home publish:

| Route | Operator check |
| --- | --- |
| `/fanclub` | Dynamic modules show published inventory with source/credit; static fallback only when inventory empty |
| `/fanclub/library` | H1 **Gehrig Library**; server search via `?q=` returns published library-section inventory |
| `/fanclub/photo` | Tag pills load from `GET /api/fanclub/photos/tags`; search uses photo list API |
| `/fanclub/memorabilia` | H1 **Memorabilia Archive**; server search via memorabilia API; related library stories render when API returns `related_library_entries` |

Use [Fan Club operational workflows](./fanclub-operational-workflows.md) for session-gate and empty-state checks.

### Accepted limitations (Task 008 evidence)

| Item | State | Evidence |
| --- | --- | --- |
| Member binary photo upload on `/fanclub/submit` | Deferred | `docs/reference/website/unified-content-workflow.md` |
| Admin UI `club_home` checkbox drift vs API | Verify during ops | Task #1691 API accepts key; confirm admin UI option present on branch |
| Homepage `homepage_*` inventory sections | Deferred | `tests/content-inventory-public-surface-validation.test.ts` deferred surfaces |
| Photo detail modal route | Deferred | Design reference allows modal or dedicated route |

### Preview an unpublished draft (#2664)

Before publishing, review any `draft`-status row without exposing it publicly:

1. Call `GET /api/admin/editorial/list?inventory_status=draft` (or use the admin editorial UI's inventory-status filter) — draft rows never appear on `/fanclub` or any public route regardless of `allowed_sections`, since only `status: published` rows are eligible.
2. Review the row's `media_associations` (returned inline by `list`) for correct pairing, caption, and alt text before publish.
3. Use `POST /api/admin/editorial/inventory` with the row's `id` to correct any field while still in `draft`.

### Exclude (unpublish) or archive a published item (#2664)

Two reversible removal paths exist today, both via `POST /api/admin/editorial/publish`:

- **Unpublish (temporary exclusion):** call with `status: "draft"` on an already-published row. This is wired in the admin UI (`src/app/admin/editorial/page.tsx`) as a distinct "unpublish" action, not merely a side effect of archiving. The row stops rendering anywhere immediately; it is not deleted and can be republished with `status: "published"`.
- **Archive (longer-term removal):** call with `status: "archived"`. Same reversibility — `status: "published"` restores it — but signals a more durable removal than a temporary unpublish.

Neither path deletes data or media associations; both are simple status-field transitions with full history preserved in the row itself.

### Substitute or update media (#2664)

1. `GET /api/admin/editorial/media-associations?story_id=<id>` to read current pairings for a `content_inventory` row.
2. `POST /api/admin/editorial/media-associations` with the full replacement `media_associations` array (each `media_id` must match an existing `photos` row; `PUBLIC_IMAGE_ROLES` — `primary_image`, `gallery_image`, `memorabilia_reference`, `supporting_image` — require non-empty `alt_text` or the request is rejected).
3. This replaces the row's `content_inventory_media` associations wholesale for that story, not incrementally; omitting a previously-paired media item removes that pairing.

### Troubleshooting (#2664)

| Symptom | Cause | Fix |
| --- | --- | --- |
| `POST /publish` with `status: "published"` returns 400 | Row is missing `source_name` or `credit_line` | Set both via `POST /api/admin/editorial/inventory` before publishing |
| `POST /api/admin/editorial/review` with `action: "approve"` returns 409 "canonical content record already exists for that tag" | A published or draft row already owns that `tag` as canonical | Either pick a different `tag`, or submit with `canonical: false` and a `perspective_label` to create an alternate-perspective row instead |
| `POST /media-associations` returns 400 "media_id values do not match approved photo records" | One or more `media_id` values are not real `photos.id` rows | Confirm the photo exists and use its `photos.id`, not an external reference string |
| A submission stuck in `under_review` never resolves | No explicit timeout/expiry exists in `review.ts` today | Manually call `approve`, `reject`, or `merge`; there is no automatic escalation |

### Not yet available — explicit gaps (#2663/#2664 evidence)

The following #2461-required editorial capabilities do **not** exist in the admin editorial system on `main` or `component/club-newspaper-phase0` today, confirmed by reading every file under `functions/api/admin/editorial/` and `src/app/admin/editorial/page.tsx` directly:

- **Manual pinning** of a row to a specific Club Home zone, overriding rotation scoring.
- **Edition generation, publication, or regeneration** as a persisted concept — `club_home` content is recomputed fresh on every request; there is nothing to "regenerate."
- **A dedicated takedown/suppression action.** A `POST /api/admin/editorial/suppress` action exists, but only on `component/compliance-readiness` (from #2919's work) — it has not yet been merged to `main` or this component branch. Do not assume it is available here.
- **A placement-history audit log.** The only persisted history is `content_inventory.last_featured` (one timestamp per row) plus the free-text `review_notes` append trail — neither is a structured per-placement audit record.

These match the gaps #2663's contract (`docs/explanation/website/content-strategy.md`) already documents as required future work; this runbook does not duplicate that contract, only confirms the same gaps from the operator-procedure side.

### Escalation

- Editorial policy questions: use review workflow and `#1689` evidence.
- API or fail-closed defects: open a bounded follow-up against backend reconciliation report `docs/ops/reports/website-completion-fan-club-backend-reconciliation.md`.
- Program closeout: Task #1694 consolidates Tasks 001–008 evidence.

### Verification (operator / Cursor)

1. Run `npm run typecheck`.
2. Run targeted Vitest suites: `tests/fanclub-operations.test.tsx`, `tests/fanclub-home-shell.test.tsx`, `tests/fanclub-home-dynamic.test.tsx`, `tests/mobile-navigation.test.tsx`.
3. Record pass/fail outcomes in the PR body when making member-surface changes.
