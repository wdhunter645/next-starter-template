---
Doc Type: reference
Audience: human project owner and AI agents
Authority Level: supporting
Owns: Content Collection production definition, editorial model, boundaries, success criteria
Does Not Own: implementation code, migrations, ingestion scripts, or operations runbooks
Canonical Reference: docs/reference/content-inventory-design-spec.md
Last Reviewed: 2026-05-29
---

# Content Collection Production Definition

## Purpose

The Content Collection system is the LGFC editorial archive and story inventory model. It exists to collect, normalize, review, tag, rotate, and publish Lou Gehrig-related stories and media in a controlled, source-aware structure.

## Core model

D1 owns story structure, text, metadata, search fields, editorial state, placement rules, and rotation logic. B2 owns media storage only. The system is story-first, not media-first.

## Required fields

Core production records must support tag, title, text, media reference, story type, allowed sections, priority, search text, canonical state, source name, source URL, credit line, event date, rotation group, feature weight, and last-featured tracking.

## Editorial rules

- Every content record needs a tag.
- Every media reference needs attribution.
- One canonical record should exist per tag.
- Alternate perspectives are allowed as non-canonical records.
- Automation may triage, but humans make editorial and factual decisions.
- Rejected submissions are retained only until the quarterly purge process.

## Placement and rotation

Story type controls size, allowed sections control placement, and priority controls ordering. Event date, rotation group, feature weight, and last featured fields control anniversary and evergreen rotation.

## Submission model

Member or external submissions enter a queue. Automation may perform objective checks such as completeness, spam detection, duplicate suggestions, technical validity, and relevance scoring. Automation must not make final factual or editorial decisions.

## Boundaries

The Content Collection system must not own:

- B2 bucket configuration
- UI component layout implementation
- Admin dashboard implementation
- final moderation decisions by automation
- legal attribution decisions without human review

## Success criteria

The system is production-complete when:

- Story inventory records can be created, reviewed, tagged, searched, rotated, and published.
- Canonical and alternate perspective records are supported.
- Member submissions enter a review queue before publication.
- Source and credit metadata are preserved.
- Homepage, Fan Club, library, memorabilia, milestone, and search surfaces can consume content without redefining the content model.

## Implementation documentation relationship

This document defines the content system target. The companion implementation plan decomposes inventory, submission, review, rotation, and publication tasks for agents.