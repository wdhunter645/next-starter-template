---
Doc Type: Tutorial
Audience: Human + AI
Authority Level: Guided Implementation Tutorial
Owns: Initial LGFC content pipeline implementation sequence
Does Not Own: Final production governance policy
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-05-14
---

# Tutorial — Build First Content Pipeline

## Objective

Build the first operational LGFC historical content ingestion pipeline.

## Steps

### Step 1 — Create D1 Tables

Use canonical `content_inventory` as the primary story and layout source of truth.

Create only the auxiliary tables needed around it:

- submission_queue
- media_assets
- story_relationships
- editorial_reviews

Validate:

- indexes
- foreign keys
- compatibility with canonical `content_inventory` fields
- rotation fields
- editorial status constraints

### Step 2 — Configure B2 Media Storage

Configure:

- archival media bucket
- normalized derivatives
- OCR source retention
- public access patterns
- media relationship identifiers

### Step 3 — Create Submission Intake Flow

Build intake process:

- submission form
- media upload
- queue insertion
- moderation status initialization
- attribution capture

### Step 4 — Create Editorial Review Workflow

Build:

- review queue
- canonical assignment workflow
- rejection handling
- moderation notes
- publication approval process

### Step 5 — Build Publishing Flow

Publishing flow:

1. editorial approval
2. publish flag update
3. homepage eligibility calculation
4. search index update
5. media relationship validation

### Step 6 — Homepage Rotation Integration

Connect:

- anniversary rotation
- feature weighting
- editorial overrides
- rotation suppression
- homepage story selection

### Step 7 — Search Integration

Search indexing should include:

- titles
- canonical body text
- OCR text
- tags
- alternate-perspective relationships
- metadata enrichment

### Step 8 — Governance Validation

Verify:

- attribution rules
- canonical rules
- moderation boundaries
- automation restrictions
- historical preservation requirements

### Step 9 — Future Automation Integration

Future orchestration systems may later integrate:

- OCR pipelines
- duplicate detection
- metadata enrichment
- homepage recommendations
- editorial analytics
- ingestion monitoring

Automation remains advisory only.
