---
Doc Type: Reference
Audience: Human + AI
Authority Level: Canonical Technical Reference
Owns: Planned LGFC content archive schema and operational constraints
Does Not Own: Runtime implementation status or UI behavior
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-05-14
---

# LGFC Content Schema Reference

## Overview

This document defines the planned D1 schema model for the LGFC historical archive and editorial platform.

Implemented and planned systems must preserve compatibility with:

- story-centric architecture
- canonical historical preservation
- editorial governance
- AI-assisted enrichment
- homepage rotation systems
- long-term archival durability

## Primary Tables

### content_inventory

Primary historical archive table and D1 source of truth.

This reference extends the existing canonical `content_inventory` authority rather than creating a parallel story table. Implementers must preserve the table name and required fields defined in `/docs/reference/content-inventory-d1-schema.md`.

| Field | Type | Purpose |
|---|---|---|
| id | INTEGER | Internal identifier |
| tag | TEXT | Canonical story grouping |
| title | TEXT | Story title |
| text | TEXT | Full story body |
| media | JSON | Canonical story media linkage |
| story_type | TEXT | Story classification |
| allowed_sections | JSON | Approved rendering surfaces |
| priority | INTEGER | Editorial ordering weight |
| search_text | TEXT | Search normalization field |
| canonical | INTEGER | Canonical story flag |
| source_name | TEXT | Source attribution |
| source_url | TEXT | Source reference |
| credit_line | TEXT | Editorial attribution |
| event_date | TEXT | Historical event date |
| rotation_group | TEXT | Homepage rotation grouping |
| last_featured | TEXT | Last homepage feature timestamp |
| feature_weight | INTEGER | Editorial weighting |

Additional workflow metadata, including editorial status, AI suggestions, OCR confidence, and audit timestamps, must be added only when reconciled with canonical schema authority and must not replace the required fields above.

## Canonical Story Rules

- Only one canonical story may exist within a canonical grouping.
- Alternate perspectives remain independently preserved.
- Alternate stories reference the canonical grouping via tag.
- Canonical status changes require editorial review.

## submission_queue

Temporary intake and moderation table.

| Field | Type | Purpose |
|---|---|---|
| submission_id | INTEGER | Queue identifier |
| submitted_by | TEXT | Submission source |
| title | TEXT | Proposed story title |
| description | TEXT | Raw submission description |
| source_url | TEXT | Source reference |
| proposed_tag | TEXT | Proposed canonical tag |
| media_url | TEXT | Uploaded media linkage |
| status | TEXT | pending/approved/rejected_auto/rejected_manual |
| relevance_score | INTEGER | Automation relevance score |
| duplicate_candidate | INTEGER | Duplicate flag |
| risk_flags | TEXT | Objective moderation flags |
| review_notes | TEXT | Editorial notes |
| purge_flag | INTEGER | Quarterly purge eligibility flag |
| created_at | TEXT | Intake timestamp |

## Media Relationships

### media_assets

Media assets are linked by story relationship identifiers.

Supported media:

- photographs
- newspaper scans
- memorabilia images
- OCR source images
- normalized derivatives

Relationships:

content_inventory -> media_assets
submission_queue -> media_assets

## Editorial Status Values

Approved values:

- intake
- queued
- under_review
- approved
- rejected
- published
- archived

## AI Metadata Fields

AI metadata fields are assistive only.

AI-generated metadata may include:

- summary suggestions
- keyword suggestions
- duplicate probability
- OCR confidence
- relevance scoring
- topic clustering

AI metadata must never overwrite original source material.

## Rotation Fields

Homepage rotation fields:

| Field | Purpose |
|---|---|
| rotation_group | Editorial grouping |
| event_date | Anniversary targeting |
| feature_weight | Editorial weighting |
| last_featured | Repeat suppression |

## Tagging Standards

Tags should remain:

- historically meaningful
- stable
- reusable
- searchable

Example categories:

- lou-gehrig-day
- yankees-history
- als-awareness
- farewell-speech
- memorabilia
- cooperstown

## Search Strategy

Search indexing is generated from:

- title
- text
- search_text
- OCR text
- tags
- attribution
- alternate-perspective relationships
- AI keyword metadata

## Relationship Diagram

```text
content_inventory
 ├── media_assets
 ├── story_tags
 ├── story_relationships
 ├── editorial_reviews
 └── homepage_rotation

submission_queue
 ├── media_assets
 ├── moderation_reviews
 └── duplicate_candidates
```

## Governance Constraints

Mandatory rules:

- historical preservation first
- no destructive editorial overwrites
- no autonomous publishing
- attribution required for external sources
- rejected submissions retained until quarterly purge
- AI systems remain advisory only

## Operational Constraints

- Media objects stored in B2.
- Metadata stored in D1.
- Homepage rotation consumes published stories only.
- Search indexes must exclude rejected submissions.
- OCR source files remain preserved when possible.
