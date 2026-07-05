---
Doc Type: Operations
Audience: Bill, Atlas, Cursor, LGFC maintainers, and implementation agents
Authority Level: Controlled
Owns: Phase 0.5 reconciliation audit for Program #2273 Task-001 (#2274)
Does Not Own: Canonical candidate model definition, D1 migrations, runtime implementation, or issue closure
Canonical Reference: /docs/ops/reports/lgfc-content-pipeline-reconciliation-audit.md
Related issues: #2273, #2274, #2270, #1738, #2073, #2040
Last Reviewed: 2026-07-05
---

# LGFC Content Pipeline Reconciliation Audit (Task-001)

## Purpose

This report is the Phase 0.5 deliverable for source issue `#2274` under controlling
program `#2273`.

It reconciles the approved `#2270` content pipeline strategy against existing
repository artifacts, D1 data surfaces, member/admin boundaries, and overlapping
documentation so Task-002 can define a canonical candidate model without creating
a parallel source of truth.

## Scope

Writable scope for this task:

- `docs/ops/reports/lgfc-content-pipeline-reconciliation-audit.md` (this report)

Out of scope (not performed):

- D1 migrations or schema changes;
- runtime code, admin UI/API, member-upload runtime, crawler/search automation,
  public publishing, or purge workers;
- modification, closure, relabeling, or decommissioning of `#1738`, `#2073`, or
  `#2040`.

## Source Authority Cross-Check

| Source | Role in this audit |
| --- | --- |
| `#2270` | Approved strategy: candidate fields, review/publication states, input streams, storage split |
| `#1738` artifacts | Reference-only provenance, rights, privacy, editorial, and data-surface docs |
| `docs/reference/website/content-inventory-model.md` | Operational D1 editorial model (`content_inventory`, `submission_queue`) |
| `docs/reference/website/unified-content-workflow.md` | Member intake → queue → inventory publication path |
| `docs/reference/website/lou-gehrig-content-metadata-schema.md` | `#1738` candidate metadata fields and review states |
| `docs/reference/architecture/lou-gehrig-content-data-surface-boundary.md` | `#1738` D1/B2 boundary and naming conventions |
| `migrations/0035`–`0038` | As-built D1 tables for editorial archive |
| `functions/api/library/submit.ts` | Member submission intake runtime |
| `functions/_lib/content-inventory-public.ts` | Public-surface eligibility guards |
| `seed/content/pilot-pack.json` | Editorial workflow verification fixtures |

---

## 1. Field Reconciliation Matrix

Legend: **Align** = same concept, compatible naming or mapping; **Partial** = overlapping concept with vocabulary or scope gap; **Gap** = strategy field has no durable repo surface today; **Conflict** = incompatible ownership, type, or requiredness.

| #2270 strategy field | #1738 metadata schema | `content_inventory` | `submission_queue` | `photos` | `media_assets` | Reconciliation |
| --- | --- | --- | --- | --- | --- | --- |
| `candidate_id` | `candidate_id` | — (uses numeric `id` after publish) | — | `photo_id` (photo catalog only) | `media_uid` | **Partial** — stable ID exists per surface; no unified candidate ID yet |
| `input_stream` | `acquisition_method` (partial) | — | implicit via intake path | — | — | **Gap** — strategy requires explicit stream enum; not stored in D1 editorial tables |
| `title` | `title` | `title` | `title` | `title` | — | **Align** |
| `source_url` | `source_url` | `source_url` | `source_url` | `url` (media location) | — | **Partial** — `photos.url` is object URL, not provenance URL |
| `source_name` | `source_owner` / `source_title` | `source_name` | `source_name` | `source` | `source_name` (association) | **Conflict** — three naming conventions for source identity |
| `source_domain` | — | — | — | — | — | **Gap** |
| `source_type` | — | — | — | `type` (photo context) | — | **Gap** in editorial tables |
| `content_type` | `content_type` | implied via `story_type` + media | — | `type` | — | **Partial** — editorial uses presentation weight, not content taxonomy |
| `summary` | — | `summary` | `description` (body) | `description` | — | **Partial** — queue body vs inventory summary |
| `date_or_period` | `original_publication_date` | `event_date`, `event_year` | — | `year`, `era` | — | **Partial** — multiple date fields, no single period field |
| `people_tags` | — | — | — | `people` (text) | — | **Gap** — no normalized tag table |
| `topic_tags` | — | — | — | `tags` (text) | — | **Gap** |
| `location_tags` | — | — | — | `location` | — | **Gap** |
| `provenance_notes` | `notes` | `review_notes` | `review_notes`, `payload` | `rights_notes` | — | **Partial** — notes scattered across surfaces |
| `rights_status` | `rights_status` | — (enforced at publish via triggers) | — | `rights_notes` (free text) | — | **Conflict** — enum in docs, not column in operational tables |
| `source_trust_status` | — | — | — | — | — | **Gap** |
| `relevance_status` | — | — | — | — | — | **Gap** |
| `review_status` | `review_status` | — (uses `status` draft/published/archived) | `status` (queue workflow) | — | — | **Conflict** — three different state machines |
| `publication_status` | `editorial_use_candidate` (partial) | `status` | — | — | — | **Conflict** — strategy separates review from publication; inventory collapses both |
| `credit_line` | `credit_line` | `credit_line` (required) | `credit_line` | via association | via association | **Align** at inventory layer |
| `media_asset_id` | — | `media` JSON + `content_inventory_media` | `media_url`, `media_reference` | `id` / `photo_id` | `media_uid`, `b2_key` | **Partial** — three media reference models |
| `duplicate_of` | — | canonical tag grouping | `duplicate_candidate` | — | — | **Partial** |
| `review_priority` | — | `priority` (placement, not review) | — | — | — | **Conflict** — name collision with editorial ordering |
| `admin_notes` | `notes` | `review_notes` | `review_notes` | — | — | **Partial** |
| `created_at` / `updated_at` | — | yes | yes | `created_at` | `ingested_at` | **Align** |
| `submitter_id` | — | `submitted_by` (post-merge) | `submitted_by` | — | — | **Partial** — string identity, not member FK |
| `submitter_name` | — | embedded in `submitted_by` | embedded in `submitted_by` | — | — | **Partial** |
| `submitter_contact` | — | email in session-derived `submitted_by` | same | — | — | **Partial** |
| `submission_type` | — | — | in `payload` JSON only | — | — | **Gap** — not first-class column |
| `ownership_statement` | — | — | — | — | — | **Gap** |
| `permission_statement` | — | — | — | — | — | **Gap** |
| `credit_preference` | — | — | — | — | — | **Gap** |
| `privacy_notes` | `privacy_flag` (enum) | — | — | — | — | **Conflict** — strategy uses notes; #1738 uses enum |
| `uploaded_media_reference` | — | — | `media_reference` | — | `b2_key` | **Partial** |
| `related_candidate_id` | — | — | — | — | — | **Gap** |
| `consent_status` | — | — | — | — | — | **Gap** |
| `admin_followup_required` | — | — | — | — | — | **Gap** |

### Field reconciliation summary

- **Operational editorial surfaces** (`submission_queue`, `content_inventory`) own
  member intake and published story authority today. They do not implement the full
  `#2270` candidate registry model.
- **`#1738` metadata schema** overlaps heavily with `#2270` on provenance and rights
  vocabulary but uses different field names and review-state enums.
- **Strategy-only fields** (input stream, source domain/type, tag dimensions, trust/
  relevance, member consent/permission) have no durable D1 home yet — expected per
  `#2270` Phase 4 storage design.

---

## 2. State Reconciliation Matrix

### Review and workflow states

| Concept | #2270 `review_status` | #1738 `review_status` | `submission_queue.status` | `content_inventory.status` | Notes |
| --- | --- | --- | --- | --- | --- |
| Awaiting review | `pending_review` | `candidate`, `needs-source`, `needs-rights-review` | `pending`, `triaged`, `under_review` | `draft` | Four parallel vocabularies |
| Internal reference OK | `approved_internal_reference` | `approved-for-reference` | `approved` (pre-merge) | `draft` | Queue `approved` ≠ public publish |
| Public candidate OK | `approved_public_candidate` | `approved-for-public-copy` | `approved` | `draft` | Editorial conversion still required |
| Citation-only | `approved_citation_reference_only` | `link-only` rights path | — | — | #1738 encodes in rights, not review |
| Deferred | `deferred_*` (3 variants) | `deferred`, `needs-*` | — | — | Strategy splits defer reasons |
| Rejected | `rejected` | `rejected` | `rejected`, `purged` | — | Queue retains purge lifecycle |
| Private/internal | `private_internal_only` | `research-only`, `archive-only` | — | — | #1738 uses editorial_use_candidate |
| Published | — (see publication_status) | — | `merged` | `published` | Publication is separate in #2270 |
| Archived | — | — | — | `archived` | Inventory only |

### Rights states

| #2270 `rights_status` | #1738 `rights_status` | Runtime enforcement | Notes |
| --- | --- | --- | --- |
| `unknown` | `unknown` | publish trigger blocks if missing attribution | **Align** conceptually |
| `public_domain` | `public-domain-candidate` | not stored in D1 column | **Conflict** — naming + confirmation semantics |
| `permission_needed` | `permission-needed` | not stored | **Conflict** — delimiter style |
| `permission_requested` | — | — | **Gap** in #1738 |
| `permission_granted` | `permission-granted` | not stored | **Partial** |
| `copyright_restricted` | — | — | **Gap** in #1738 |
| `blocked` | `rejected` | — | **Conflict** — blocked vs rejected |
| — | `owned`, `link-only` | — | **Gap** in #2270 |

### Publication states

| #2270 `publication_status` | `content_inventory.status` | Public API eligibility | Notes |
| --- | --- | --- | --- |
| `not_ready` | `draft` | excluded | **Partial** |
| `draft_candidate` | `draft` | excluded | Collapsed in inventory |
| `staged` | `draft` | excluded | No staging column today |
| `approved_for_publish` | `draft` | excluded until publish action | Human publish step required |
| `published` | `published` | included when section + attribution match | **Align** |
| `unpublished` | — | — | **Gap** |
| `archived` | `archived` | excluded from dynamic surfaces | **Align** |

### Source trust states (#2270 only)

`pending`, `trusted`, `questionable`, `blocked`, `deleted` — **no D1 column or
table** in current repo. Documented as future `sources` table in `#2270`.

### Privacy states (#2270 vs #1738)

| #2270 privacy states | #1738 `privacy_flag` | Reconciliation |
| --- | --- | --- |
| `not_applicable`, `pending_review`, `approved`, `restricted`, `blocked` | `none`, `living-person`, `donor/member`, `minors`, `sensitive`, `other` | **Conflict** — process states vs category flags |

### State reconciliation summary

`#2270` intentionally separates **review**, **rights**, **privacy**, **source trust**,
and **publication** into orthogonal state dimensions. Existing operational tables
collapse review and publication into `content_inventory.status` and encode queue
progress in `submission_queue.status`. `#1738` docs define a third review/rights
vocabulary for research candidates.

**No blocking source-of-truth conflict** was found that prevents Task-002: the
conflicts are vocabulary and layering gaps, not contradictory runtime ownership.
The canonical model should adopt `#2270` state dimensions and map legacy/editorial
states explicitly rather than reusing `content_inventory.status` for candidate review.

---

## 3. Existing Data-Surface Inventory

| Surface | Location | Authority role | Read paths | Write paths | Candidate pipeline role |
| --- | --- | --- | --- | --- | --- |
| `content_inventory` | D1 (`migrations/0035`, `0036`) | Published editorial stories | Public/member APIs via `content-inventory-public.ts`; search, library, club home | Admin editorial publish APIs | **Publication destination** after editorial conversion |
| `submission_queue` | D1 (`migrations/0035`, `0037`) | Member/editor intake staging | Admin editorial review/list | `POST /api/library/submit`; admin review | **Member submission intake** (partial overlap with candidate registry) |
| `content_inventory_media` | D1 (`migrations/0038`) | Story–photo associations | Public related content, memorabilia joins | Admin editorial media APIs | Media linkage after approval |
| `photos` | D1 (`0003`, `0007`) | Photo/memorabilia catalog | Fan Club photo/memorabilia APIs | Admin/operator managed; B2 sync | Legacy approved media; not candidate registry |
| `media_assets` | D1 (`0010`) | B2 object registry | Admin media-assets list/sync | B2 ingest scripts, admin sync | Binary index; referenced by future `media_asset_id` |
| `library_entries` | D1 (`0002`) | Legacy written content | Fallback reads in library/memorabilia | Legacy/admin paths | **Legacy** — fallback only per unified workflow |
| `seed/content/pilot-pack.json` | Repo fixture | Workflow verification pack | Tests, seed helpers | Not runtime-written | **Fixture-only** |
| `data/research/lou-gehrig-content-candidates.json` | Not present | Proposed seed registry (`#2270`) | — | — | **Planned seed** — does not exist yet |
| Admin editorial APIs | `functions/api/admin/editorial/**` | Review, publish, inventory CRUD | Admin UI | Admin session | Operational review for queue/inventory |
| Public safety helper | `functions/_lib/content-inventory-public.ts` | Eligibility filter | All dynamic public inventory reads | — | Enforces `published` + attribution + section |

### Storage assumptions (current)

| Layer | Current assumption | #2270 target | Gap |
| --- | --- | --- | --- |
| D1 | Editorial + member tables in `lgfc_lite` | Metadata, review state, candidates, audit | Candidate tables not created |
| B2 | Canonical media blobs (`LouGehrigFanClub` bucket) | Same + uploaded member media | Member binary upload not implemented |
| R2 | Not in active use | Optional alternative to B2 | Document-only |
| Repo JSON | Pilot fixtures only | Seed candidate registry | Seed file path not created |

### Member-facing upload/submission flows

| Flow | Route | Writes | Binary upload | Maps to #2270 stream |
| --- | --- | --- | --- | --- |
| Member story/note submit | `/fanclub/submit` → `POST /api/library/submit` | `submission_queue` | No (reference strings only) | `member_submission` |
| Member discussions | `/fanclub/chat` | `discussions` | No | Out of candidate pipeline |
| Join/profile | join/login APIs | `join_requests`, `members` | No | Identity source for future `submitter_id` |

### Admin/staging boundaries

- `/admin/editorial` — queue review, inventory draft/publish, media associations.
- `/admin/media`, `/admin/media-assets` — catalog and B2 registry (not candidate review).
- Public routes **must not** read raw queue or candidate records (`#2270`, enforced
  in `content-inventory-public.ts` for inventory).

---

## 4. Conflicting Terms, States, and Ownership Findings

| ID | Finding | Severity | Ownership today | Recommendation |
| --- | --- | --- | --- | --- |
| C-01 | Three source identity fields: `source_name`, `source_title`, `source_owner` | Medium | Split across #2270, #1738, D1 | Canonical: `source_name` + optional `source_owner` |
| C-02 | Review state vocabulary collision (`review_status` vs queue vs inventory) | High | Parallel docs + D1 | Candidate model uses #2270 dimensions; map editorial states in Task-002 |
| C-03 | `priority` means review priority (#2270) vs editorial ordering (inventory) | Medium | `content_inventory.priority` | Rename candidate field to `review_priority`; keep inventory `priority` |
| C-04 | Rights enums use underscores (#2270) vs hyphens (#1738) | Low | Docs only | Standardize on snake_case in canonical model |
| C-05 | `#1738` forbids new D1 tables; `#2270` proposes content pipeline tables | Medium | Governance | #2273 supersedes for new pipeline; #1738 remains reference — new tables via #2278 child issue |
| C-06 | `photos` treated as operator-approved catalog without status column | Medium | Runtime | Candidate photos enter via queue/registry; promotion to `photos` is explicit post-rights |
| C-07 | `submission_queue` partially implements member submission but lacks consent/permission fields | Medium | D1 + API | Extend in Task-004 design; do not overload queue as candidate registry |
| C-08 | `public_domain` vs `public-domain-candidate` semantics differ | Medium | Docs | Candidate model uses conservative `public_domain_candidate` until confirmed |
| C-09 | Privacy: process states (#2270) vs category flags (#1738) | Medium | Docs | Canonical model carries both `privacy_flag` (category) and `privacy_review_status` (process) |
| C-10 | Two programs (#1738 expansion vs #2273 pipeline) both define Gehrig content collection | Low | PMO | #2273 is controlling; #1738 artifacts are reference inputs only |

**Blocking source-of-truth conflict:** None identified. Editorial D1 surfaces remain
operational authority for **published website content**. The candidate registry is a
**new upstream layer** that must not replace or silently sync with `content_inventory`
without an explicit editorial conversion step.

---

## 5. Recommendation for Canonical Field Names

Adopt `#2270` field names as the canonical candidate registry vocabulary with these
refinements for repo compatibility:

| Canonical field | Notes |
| --- | --- |
| `candidate_id` | Prefix `lgfc-gehrig-{year}-{seq}` per `#1738` boundary doc |
| `input_stream` | Enum: `public_research`, `member_submission`, `admin_seed`, `scheduled_discovery` |
| `source_name` | Primary human-readable source label (absorbs #1738 `source_title` display role) |
| `source_owner` | Rights holder / institution (from #1738; optional when same as `source_name`) |
| `source_url`, `source_domain`, `source_type` | As #2270 |
| `content_type`, `summary`, `date_or_period` | As #2270 |
| `people_tags`, `topic_tags`, `location_tags` | JSON arrays in seed/D1; not free-text columns on inventory |
| `provenance_notes` | Absorbs operator `notes` from #1738 |
| `rights_status`, `source_trust_status`, `relevance_status` | As #2270 enums (snake_case) |
| `review_status`, `publication_status` | As #2270 — separate columns |
| `privacy_flag` | Category enum from #1738 |
| `privacy_review_status` | Process enum from #2270 privacy states |
| `credit_line`, `media_asset_id`, `duplicate_of`, `review_priority`, `admin_notes` | As #2270 |
| Member extension block | All `#2270` member fields; map `submitter_id` to `members.id` when resolvable |

**Editorial mapping fields** (not on candidate registry): `tag`, `story_type`,
`allowed_sections`, `priority`, `canonical`, `perspective_label` — remain
`content_inventory`-only and are populated during editorial conversion (Task-006 scope).

---

## 6. Recommendation for Canonical Review/Publication States

### Candidate layer (#2270 — canonical)

Use unchanged `#2270` enums for:

- `review_status` (9 values including defer variants)
- `rights_status` (7 values)
- `privacy_review_status` (5 values — renamed from #2270 `privacy states` for clarity)
- `source_trust_status` (5 values)
- `publication_status` (7 values)

### Editorial operational layer (existing — mapped, not replaced)

| Candidate state | Maps to editorial action |
| --- | --- |
| `approved_public_candidate` + `publication_status = approved_for_publish` | Admin creates/updates `content_inventory` draft then publishes |
| `member_submission` intake | Creates/updates candidate; may also create `submission_queue` row during transition |
| `published` (candidate) | Candidate frozen; `content_inventory.status = published` is runtime public authority |

### Queue layer (transition)

During Phase 2–3 pilot, `submission_queue` remains the **operational member intake
surface**. Candidate registry rows should reference `submission_id` when derived from
member submit rather than duplicating queue as source of truth.

---

## 7. Decision: Repo JSON — Seed-Only, Fixture-Only, or Operational

| JSON artifact | Classification | Rationale |
| --- | --- | --- |
| `data/research/lou-gehrig-content-candidates.json` (planned) | **Seed / transitional** | `#2270` explicitly authorizes repo JSON to prove the model before D1; not runtime source of truth |
| `data/research/lou-gehrig-content-candidates.schema.json` (planned) | **Fixture / contract** | JSON Schema for validation only |
| `seed/content/pilot-pack.json` | **Fixture-only** | Program #1255 workflow verification; imported by tests/seed helpers; IDs in 9000 range |
| `data/b2/inventory.json` | **Operator snapshot** | B2 inventory snapshot for ingest scripts; not editorial authority |

**Decision:** Repo JSON for the candidate registry is **seed/fixture/transitional
only**. D1 (`lgfc_lite`) remains operational authority for member intake, editorial
archive, and public rendering. No JSON file should become a permanent source of truth
without a child issue explicitly authorizing operational sync.

---

## 8. Recommended Promotion Path into Durable Data Surfaces

```text
Input streams (public research, member submit, admin seed, future discovery)
        ↓
Candidate registry (seed JSON → future D1 content_items / sources / submitters tables)
        ↓
Source/submitter review + item review + rights/privacy review (candidate state columns)
        ↓
Publication preparation (publication_status, credit_line, publication target)
        ↓
Editorial conversion → content_inventory (+ optional content_inventory_media → photos)
        ↓
Public surfaces (content-inventory-public helper — published + attributed only)
```

| Stage | Durable surface | Promotion trigger |
| --- | --- | --- |
| Seed pilot | `data/research/lou-gehrig-content-candidates.json` | Task-003 manual seed |
| Member intake (transition) | `submission_queue` + linked candidate row | Task-004 intake model |
| Metadata durability | Future D1 tables per `#2270` (`content_items`, `sources`, `member_submissions`, …) | Task-005 (#2278) design → authorized migration issue |
| Media binaries | B2 via `media_assets` / `photos` | Rights cleared + admin ingest |
| Public website | `content_inventory` | Editorial publish with attribution triggers |

Audit trail and moderation events should land in future `moderation_events` table
(per `#2270`) rather than overloading `review_notes` alone.

---

## 9. Implications for #1738, #2073, and #2040

| Issue | Status per #2273 | Implication from this audit |
| --- | --- | --- |
| **#1738** — Lou Gehrig Content Collection / Research Pipeline Expansion | Paused; reference-only | Reusable artifacts: metadata schema, provenance model, rights/privacy review, data-surface boundary, intake how-to. **Field/state vocab should be mapped into #2270 canonical model**, not copied verbatim. Child chain #1739–#1746 remains paused; recommendations feed Task-002/006 docs. |
| **#2073** — (future media/archive acquisition) | Paused; downstream | B2/`media_assets`/`photos` inventory confirms blob/index split. Advanced acquisition belongs after manual seed pilot and storage design (#2278). No repo change. |
| **#2040** — (publication automation) | Paused; downstream | `content-inventory-public.ts` already enforces safe publication view. Automation must read published inventory only, never raw candidates. Evidence retention paths in `#1738` reports remain valid references. |

**Explicit:** This audit did **not** modify, close, relabel, or decommission
`#1738`, `#2073`, or `#2040`.

---

## 10. Minimal Next-Step Recommendation for Task-002 (#2275)

Task-002 may proceed **without an additional strategy gate**.

Deliver:

1. `docs/reference/content/lgfc-content-candidate-model.md` — canonical field and
   state definitions with editorial/queue mapping tables from this audit.
2. `data/research/lou-gehrig-content-candidates.schema.json` — JSON Schema reflecting
   canonical names and enums (seed validation only).

Task-002 should:

- Adopt `#2270` as normative for candidate fields and state dimensions.
- Document explicit maps from `#1738` metadata fields and from `submission_queue` /
  `content_inventory` operational fields.
- Reserve `content_inventory` for post-conversion published stories only.
- Defer D1 table creation to Task-005 (#2278) unless a migration child issue is
  separately authorized.

---

## Acceptance Criteria Verification

| Criterion | Result |
| --- | --- |
| Report exists at required path | Yes — this document |
| Identifies #2270 vs repo field/state conflicts | Yes — Sections 1–4 |
| Defines JSON candidate registry classification | Yes — Section 7: seed/fixture/transitional |
| Identifies durable target surfaces | Yes — Sections 3, 8 |
| Recommends Task-002 proceed without extra gate | Yes — Section 10 |

---

## DOC_SOURCE

```text
DOC_SOURCE: DIATAXIS_ROUTED
DOC_SOURCE_FILES:
- docs/reference/website/content-inventory-model.md
- docs/reference/website/unified-content-workflow.md
- docs/reference/website/lou-gehrig-content-metadata-schema.md
- docs/reference/architecture/lou-gehrig-content-data-surface-boundary.md
- docs/reference/architecture/fan-club-data-surface-inventory.md
- migrations/0035_editorial_archive.sql
- migrations/0036_content_inventory_schema_delta.sql
- migrations/0037_submission_queue_workflow_delta.sql
- migrations/0038_content_inventory_media_association.sql
- functions/api/library/submit.ts
- functions/_lib/content-inventory-public.ts
- seed/content/pilot-pack.json
- GitHub issues #2270, #2274, #2273 (strategy and task authority)
DIATAXIS_GAP:
- NONE (routed through existing reference and ops report structure)
```
