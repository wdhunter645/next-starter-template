---
Doc Type: Reference
Audience: Human + AI
Authority Level: Canonical
Owns: Content inventory schema, constraints, relationships, and data rules
Does Not Own: UI layout rendering, CI rules, issue workflow
Last Reviewed: 2026-04-20
---

# Content Inventory Reference Specification

## Core Model
The system is built on a story inventory model backed by Cloudflare D1.

### Story Table (D1)
Fields:
- id (uuid)
- tag (text)
- title (text)
- text (text)
- story_type (enum: primary, secondary, brief)
- allowed_sections (json array)
- priority (int)
- canonical (boolean)
- source_name (text)
- source_url (text)
- credit_line (text)
- event_date (date, nullable)
- event_year (int)
- rotation_group (text)
- last_featured (timestamp)
- feature_weight (int)
- search_text (text, generated)

## Media Relationship Model
Stories do not embed canonical media metadata.

### Media Table
- photo_id (uuid)
- title
- description
- attribution
- source_url
- storage_path (B2)

### Story-Media Link Table
- story_id
- photo_id

## Constraints
- unique index on (tag) where canonical = true
- search_text generated from title, text, and metadata

## Section Placement Model
Stories may appear in multiple sections.

Section placement is defined by a join model:
- story_id
- section_name
- section_priority
- section_story_type override (optional)

## Evergreen Definition
- event_date NULL indicates evergreen
- evergreen stories bypass anniversary weighting

## Search Model
search_text must be generated using deterministic logic (generated column or trigger)

## Data Integrity Rules
- one canonical story per tag
- media referenced by id only
- no duplicate media metadata in story rows
