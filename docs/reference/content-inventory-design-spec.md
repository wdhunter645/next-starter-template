---
Doc Type: Design Authority
Audience: Human + AI
Authority Level: Canonical
Owns: LGFC content inventory model, storage separation, intake, review, rotation, and publication rules
Does Not Own: UI component implementation details, migration filenames, or agent runtime specifics
Last Reviewed: 2026-04-20
---

# LGFC Content Inventory Design Specification

## Purpose
Define the canonical design for the Lou Gehrig Fan Club content inventory project. This document is the source of truth for how stories, media, submissions, attribution, search, and editorial rotation are modeled and managed.

## Scope
This specification governs:
- story inventory design in Cloudflare D1
- media storage in Backblaze B2
- content acquisition and curation rules
- duplicate and alternate-perspective handling
- member submission intake and moderation
- homepage and editorial rotation behavior
- search-oriented metadata requirements

This specification does not govern implementation branch names, issue workflow mechanics, or visual component code.

## Design Summary
The LGFC content system is a story-first inventory. The site is not a loose media gallery. It is a newspaper-style publishing system built around structured historical and legacy stories.

The system separates responsibilities clearly:
- Cloudflare D1 stores all story text, metadata, attribution, relationships, placement rules, and rotation metadata.
- Backblaze B2 stores approved media files only.

## Core Objectives
The system must:
- support thorough coverage of Lou Gehrig's life and legacy
- support multiple valid perspectives on the same story without cluttering the inventory
- support high-quality search behavior across story text and media descriptions
- support newspaper-style layout hierarchy
- support anniversary-aware editorial rotation
- prevent uncontrolled bulk media accumulation
- preserve attribution and source integrity
- protect historical accuracy through manual review before publication

## Authoritative Source Hierarchy
### Tier 0 — Primary narrative source
Jonathan Eig's Lou Gehrig biography is the primary narrative source for initial story discovery, coverage planning, and baseline story development.

### Tier 1 — Supporting and validating sources
Supporting and validating sources may include archival, institutional, media, and approved member-contributed sources. These sources support media acquisition, corroboration, and alternate perspectives.

## Homepage Presentation Model
The content inventory exists to serve a newspaper-style website layout.

The layout uses:
- a center-led primary story area
- left and right rails for spotlight and smaller stories
- center feature bands for major secondary stories
- lower thematic sections for grouped topics
- varied headline sizes and media sizes to signal importance

Layout behavior is driven by inventory metadata, not hardcoded editorial placement.

## Storage Model
### D1 = source of truth
Cloudflare D1 stores:
- tag
- title
- text
- media metadata
- story_type
- allowed_sections
- priority
- canonical and alternate status
- source_name
- source_url
- credit_line
- event and rotation data
- submission review outcomes

### B2 = media storage only
Backblaze B2 stores:
- approved images
- approved video
- optional approved archival media files when needed

Backblaze B2 does not store story text, story structure, tags, or layout logic.

## Canonical Story Inventory Model
Each story record represents a publishable story block.

Required logical fields:
- id
- tag
- title
- text
- media
- story_type
- allowed_sections
- priority
- search_text
- canonical
- source_name
- source_url
- credit_line
- event_date
- event_year
- rotation_group
- last_featured
- feature_weight

## Field Definitions
### tag
Stable story key used for grouping, deduplication, search alignment, and story association.

### title
Display-ready story title or headline.

### text
Story narrative. The text must be coherent enough to explain the associated media clearly.

### media
JSON array of media metadata records. Each media object must describe what the media depicts and include attribution.

### story_type
Controls visual weight. Allowed values:
- primary
- secondary
- brief

### allowed_sections
JSON array of layout sections where the story may appear. This replaces per-section true/false columns.

### priority
Controls ordering within a section.

### search_text
Search-oriented flattened text derived from the story, title, dates, people, events, and media descriptions.

### canonical
Defines whether the record is the default or canonical version of the tag or an alternate perspective.

### source_name, source_url, credit_line
Required attribution fields for every published record.

### event_date, event_year, rotation_group, last_featured, feature_weight
Drive anniversary-aware editorial rotation and recurrence management.

## Duplicate and Alternate Perspective Rules
The system must deduplicate aggressively while preserving editorially valuable alternate viewpoints.

Rules:
- each tag may have one canonical=true record
- additional records for the same tag may exist with canonical=false when they add real value
- alternate records must represent a meaningful perspective, interpretation, or source distinction
- duplicate media should be avoided when the same depiction already exists in acceptable quality

## Search Rules
Search must leverage more than the tag.

Search-relevant fields include:
- tag
- title
- text
- search_text
- media descriptions
- source fields where useful

Tag alone is insufficient for production search quality.

## Story-First Acquisition Rule
Content acquisition must follow this order:
1. define or confirm the story tag
2. define or update the D1 story record
3. deduplicate against existing story coverage
4. qualify supporting media
5. upload approved media to B2
6. link approved media back into D1

Random bulk media dumping into B2 is prohibited.

## Media Curation Rule
The current large B2 photo set is treated as non-canonical and disposable.

A media file is eligible for long-term retention only when it is:
- Gehrig-relevant
- quality-acceptable
- tied to a defined tag
- attributed properly
- worth showing to users

## Rotation Model
The editorial system must prevent repetitive annual selection of the same June-heavy stories.

Rules:
- anniversary proximity increases eligibility
- last_featured prevents repeated overuse
- feature_weight controls comparative prominence
- rotation_group allows grouped alternation
- evergreen stories remain eligible outside anniversary windows
- manual editorial overrides are allowed when necessary

## Submission and Moderation Model
Member submissions do not enter the main inventory directly. They enter a submission queue first.

Automation may perform only objective triage:
- completeness checks
- spam checks
- technical validity checks
- duplicate suggestions
- relevance scoring
- risk flagging

Automation must not reject for factual inaccuracy.

All editorial and factual decisions require manual review.

Manual review determines:
- approve or reject
- merge into existing tag or create new tag
- canonical vs alternate perspective
- media acceptance or rejection

Rejected intake records remain flagged and are purged on a quarterly schedule.

## Acceptance Criteria
This design is implemented correctly only when:
- D1 stores all text and metadata
- B2 stores approved media only
- tags drive story grouping and association
- canonical and alternate perspectives are supported cleanly
- section placement is array-based, not per-section boolean columns
- member submissions are reviewed before publication
- rejected submissions are purged quarterly
- rotation prevents repetitive annual homepage choices
