---
Doc Type: Reference
Audience: LGFC editors, operators, and AI implementation agents
Authority Level: Controlled
Owns: Editorial conversion stages, website-ready content criteria, and route/content-type mapping for Lou Gehrig research
Does Not Own: Runtime code changes, API routes, or public publication
Canonical Reference: /docs/reference/website/unified-content-workflow.md
Related issues: #1738, #1743, #1256
Last Reviewed: 2026-07-04
---

# Lou Gehrig Editorial Conversion Workflow

## Purpose

Define how reviewed Lou Gehrig research becomes website-ready biography, timeline,
media, gallery, library, or article content without bypassing human approval.

## Editorial conversion stages

| Stage | Input | Output | Gate |
| --- | --- | --- | --- |
| 1. Approved candidate | `approved-for-public-copy` metadata | Editorial draft outline | Provenance + rights complete |
| 2. Draft copy | Source citations | Website-safe text in operator words | Editor review |
| 3. Surface mapping | Content type | Target route/section assignment | Placement policy |
| 4. Staging preview | Draft + credit | Club staging sample review | Staging-only boundary |
| 5. Inventory publication | Approved draft | `content_inventory` row (future authorized task) | Human publish approval |
| 6. Public render | Published inventory | Website/Fan Club surfaces | Existing runtime rules |

Program #1738 documents stages 1–4. Stage 5 requires separate implementation authorization.

## Website-ready content criteria

Content is website-ready when:

- `review_status` is `approved-for-public-copy`;
- `rights_status` permits intended use;
- `credit_line` and source fields are complete;
- `factual_confidence` is acceptable or uncertainty is stated;
- `privacy_flag` is cleared for public display;
- editorial reviewer recorded approval (`reviewer`, `reviewed_at`);
- content matches LGFC tone and factual standards;
- no wholesale copyrighted reproduction without clearance.

## Content type to surface mapping

| Content type | Primary surface | Secondary surfaces | Notes |
| --- | --- | --- | --- |
| biography note | `/about`, Fan Club library | homepage feature | Canonical fact discipline |
| timeline item | milestones / timeline sections | events | Date verification required |
| photo / artifact | Photo Gallery, Memorabilia | club_home | Strong rights bar |
| article / story | library, club_home | search | Maps to `content_inventory` story |
| quote | library, about | — | Attribution mandatory |
| event | `/events`, calendar | club_home | Verify date and source |
| source lead | internal reference only | — | Not public until converted |

Read-only route reference: existing public routes under `src/app/` and Fan Club
surfaces documented in `docs/reference/website/unified-content-workflow.md`.

## Human approval requirement

No stage may skip human editor approval before public use. Automation may assist
formatting or metadata validation (#2040 future scope) but may not publish.

## Relationship to club staging

`/admin/clubstaging` provides staging-only preview of sample rotation cards.
Approved Gehrig editorial drafts may be validated against staging layout constraints
using sample patterns in `src/app/admin/clubstaging/clubStagingSamples.ts` without
 exposing staged copy on public routes.

## Alternate perspectives

Non-canonical variants follow `content_inventory` alternate-perspective rules.
Research conflicts must not silently overwrite canonical rows.

## Acceptance checklist

- [x] Editorial conversion stages documented
- [x] Website-ready content criteria documented
- [x] Route/content-type mapping documented
- [x] Human approval remains mandatory
