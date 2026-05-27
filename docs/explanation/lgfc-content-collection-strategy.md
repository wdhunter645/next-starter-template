---
Doc Type: Explanation
Audience: Human + AI
Authority Level: Controlled
Owns: Strategic rationale for LGFC continuous content collection
Does Not Own: Schema authority, implementation sequencing, or runtime behavior
Canonical Reference: /docs/reference/content-inventory-design-spec.md
Last Reviewed: 2026-05-14
---

# LGFC Continuous Content Collection Strategy

## Purpose

The LGFC content collection strategy explains why the site uses a durable content inventory model instead of a temporary blog-feed model.

The long-term goal is to preserve Lou Gehrig-related stories, sources, media references, and member contributions in a structure that can support public pages, Fan Club pages, search, homepage rotation, and future editorial automation without redesigning the archive.

## Story-Centric Architecture

The canonical content model is story-first.

D1 stores story text, metadata, placement rules, search text, source attribution, rotation metadata, and canonical status. B2 stores media objects. The D1 `content_inventory` record remains the editorial source of truth for how a story is identified, placed, searched, and rotated.

## Write-Once / Read-Many Archive Philosophy

The archive is designed for historical preservation.

A story record can be reused by:

- homepage newspaper-style sections
- search
- Fan Club library pages
- milestone displays
- campaign or anniversary features
- future editorial workflows

Published historical content is not treated as disposable page copy. Revisions and editorial updates must preserve attribution and source lineage.

## Historical Preservation Goals

The archive must support:

- Lou Gehrig biography and legacy material
- Yankees history context
- ALS awareness and charity context
- newspaper and memorabilia references
- member-submitted perspectives
- future expansion into related baseball legacy archives

The system must distinguish historical content from spam, incomplete submissions, or unsupported media references.

## Editorial Governance Model

Human editorial review remains authoritative.

Automation may assist with triage, metadata suggestions, duplicate detection, OCR extraction, and search preparation. Automation must not publish content, determine historical truth, or delete historically relevant material without governance review.

## Canonical and Alternate-Perspective Handling

The canonical content model supports one canonical record per tag. Alternate perspectives are preserved as non-canonical records rather than overwritten or silently merged.

This allows the archive to preserve conflicting or complementary accounts when attribution is available.

## Homepage and Newspaper-Style Rotation

The homepage can behave like a rotating digital newspaper by selecting published content using:

- allowed_sections
- story_type
- priority
- event_date
- rotation_group
- feature_weight
- last_featured

This lets the same archive power anniversary features, campaign highlights, milestone callouts, and recurring historical stories.

## Anniversary and Event-Aware Rotation

Event-aware metadata allows the site to feature relevant content near historical dates without creating duplicate page-specific content.

Examples include Lou Gehrig Day, major Yankees milestones, ALS awareness events, and Hall of Fame anniversaries.

## D1, B2, Search, Media, and Automation Relationship

- D1 owns structured content and layout metadata through `content_inventory`.
- B2 stores media objects and derivatives.
- Search consumes normalized text, tags, attribution, and OCR-derived content when available.
- Automation supports ingestion and enrichment but remains advisory.
- Editorial governance controls publication and canonical status.

## Long-Term Expansion Strategy

The strategy preserves future compatibility with additional legacy archives, broader baseball historical projects, and AI-assisted editorial operations. Expansion must reuse the same governance principles instead of creating parallel content systems.
