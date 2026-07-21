---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Metadata fields required for Lou Gehrig content candidates
Does Not Own: Publication automation, scraping, OCR, AI enrichment, or public routing
Canonical Reference: /docs/ops/pmo/lou-gehrig-content-collection-expansion-readiness.md
Related Issues: #1738, #1741, #1739, #1740, #2433, #2434, #2286
Last Reviewed: 2026-07-21
---

# Lou Gehrig Content Metadata Schema

## Purpose

Every Lou Gehrig content candidate must carry enough metadata for provenance,
rights, editorial review, and future publication-safety automation.

## Required fields

| Field | Required | Description |
| --- | --- | --- |
| `candidate_id` | yes | Stable internal identifier. |
| `title` | yes | Working title for the content candidate. |
| `content_type` | yes | article, quote, photo, artifact, timeline item, event, biography note, source lead, other. |
| `source_title` | yes | Source title or collection name. |
| `source_url` | when available | URL to source or catalog entry. |
| `source_citation` | yes | Human-readable citation if URL is absent or insufficient. |
| `source_owner` | yes | Publisher, archive, institution, person, or platform. |
| `acquisition_method` | yes | manual lead, public archive, owned media, user submission, operator research, other. |
| `date_accessed` | yes | Date the source was reviewed. |
| `original_publication_date` | if known | Original publication date or date range. |
| `rights_status` | yes | See enforcement vocabulary below. |
| `credit_line` | yes | Required attribution or internal note explaining why no public credit line applies. |
| `provenance_confidence` | yes | high, medium, low. |
| `factual_confidence` | yes | high, medium, low. |
| `privacy_flag` | yes | See enforcement vocabulary below. |
| `editorial_use_candidate` | yes | public copy, admin reference, research-only, archive-only, reject. |
| `review_status` | yes | See enforcement vocabulary below. |
| `reviewer` | yes | Human/operator reviewer. |
| `reviewed_at` | when reviewed | Review date. |
| `rejection_reason` | if rejected | Required when review_status is rejected. |
| `notes` | optional | Operator notes. |

## Enforcement vocabulary (canonical for runtime)

Public/member display enforcement and #2286 pipeline code use the underscore
enums in `functions/_lib/content-pipeline-candidate-constants.ts`. Research
intake may still record hyphenated research labels; implementers **must**
normalize to the pipeline vocabulary before eligibility or display checks.

| Domain | Canonical field | Canonical (#2286) values | Research / draft aliases |
| --- | --- | --- | --- |
| Rights | `rights_status` | `unknown`, `public_domain_candidate`, `permission_needed`, `permission_requested`, `permission_granted`, `copyright_restricted`, `blocked` | `public-domain-candidate`, `permission-needed`, `permission-granted`, `link-only` → treat as citation-only / non-reproduction, `rejected` → `blocked` |
| Privacy flag | `privacy_flag` | `none`, `living_person`, `donor_member`, `minors`, `sensitive`, `other` | `living-person`, `donor/member` |
| Privacy review | `privacy_review_status` | `not_applicable`, `pending_review`, `approved`, `restricted`, `blocked` | draft `privacy_status` aliases |
| Review | `review_status` | `pending_review`, `approved_internal_reference`, `approved_public_candidate`, `approved_citation_reference_only`, `deferred_source_verification`, `deferred_rights_review`, `deferred_privacy_review`, `rejected`, `private_internal_only` | `candidate`, `needs-source`, `needs-rights-review`, `approved-for-reference`, `approved-for-public-copy`, `deferred` |
| Publication | `publication_status` | `not_ready`, `draft_candidate`, `staged`, `approved_for_publish`, `published`, `unpublished`, `archived` | draft `publication_status` / `approved_for_publication` |

Do not invent parallel field names (`privacy_status`, `publication_status` as a
rights alias, etc.) in runtime or tests. Prefer the canonical column names above.

## Review status rules

Pipeline / enforcement meanings:

- `pending_review`: newly captured; not approved for public or member display.
- `deferred_source_verification`: source incomplete or unverifiable.
- `deferred_rights_review` / `deferred_privacy_review`: source exists but clearance unresolved.
- `approved_internal_reference`: internal research/citation only — **not** public/member display.
- `approved_citation_reference_only`: link/citation surfaces only — **not** media reproduction.
- `approved_public_candidate`: human-approved candidate for public-copy conversion path.
- `rejected` / `private_internal_only`: must not display; rejection or privacy rationale required.

Research aliases (`candidate`, `needs-source`, `approved-for-public-copy`, …) map
into the pipeline values above before enforcement.

## Automation boundary

Future automation may validate metadata completeness and state transitions.
Automation must not decide source truth, rights approval, privacy clearance,
credit, provenance, or final publication approval. Human/operator review remains
authoritative. AI-ready or OCR-inferred fields stay advisory until a human
workflow records approval.

## Takedown / suppression mapping (#2434)

Dedicated `suppression_*` / `takedown_*` columns are **not** added in this freeze
(migrations outside #2434 allowlist). Map draft suppression concepts onto #2286:

| Draft concept | Canonical #2286 mapping |
| --- | --- |
| `suppression_reason` | `retention_reason` when soft-deleted; else `admin_notes` / candidate notes |
| `suppressed_by` | soft-delete audit `actor` |
| `suppressed_at` | `deleted_at` |
| `takedown_request_source` | **Deferred** — record in `admin_notes` / `retention_reason` until a migration-authorized schema extension |
| `takedown_resolution_note` | **Deferred** — same as above |

Any candidate with `deleted_at` set is soft-deleted and **must not** display on
public or member surfaces (`evaluatePublicMemberDisplaySafety`).

## Compatibility with content inventory model

When a candidate converts to website-ready content, fields map to
`content_inventory` requirements per
`docs/reference/website/content-inventory-model.md`:

| Candidate field | Inventory field |
| --- | --- |
| `title` | story title |
| `credit_line` | `credit_line` (required) |
| `source_citation` / `source_url` | source URL/reference |
| `source_owner` | source name |
| `reviewer`, `reviewed_at` | editorial audit context |

Conversion rules are defined in Task 005 (#1743).

## CC-001 / CC-002 boundary (#2433 / #2434)

CC-001 freezes the shared content-asset identity, type mapping, state path, and
downstream view-field contracts. This metadata schema remains the provenance and
rights field authority for candidates, with **#2286 enums as enforcement SOT**.

- CC-001 consume path: identity + `content_type` + review/publication gates map
  into the shared asset contract; no duplicate metadata SOT under
  `docs/reference/website/content-collection/`.
- CC-002 (#2434): owns provenance/rights/privacy display and public/member
  enforcement freeze detail that builds on these fields.
- #2286 runtime: consume existing pipeline libs
  (`content-pipeline-publication-prep.ts`, `content-pipeline-candidate-admin.ts`);
  do not rebuild metadata capture layers in feature PRs.
- Feature lanes remain blocked until Atlas verifies both
  `CONTRACT-FROZEN: content-asset-model v1` and
  `CONTRACT-FROZEN: provenance-rights-publication v1`.
