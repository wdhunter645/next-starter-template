---
Doc Type: Explanation
Audience: LGFC operators, editors, maintainers, and AI implementation agents
Authority Level: Controlled
Owns: Content strategy rationale, editorial model, source reconciliation, and architecture decisions for the website content inventory
Does Not Own: D1 migrations, runtime implementation, route behavior, or final factual editorial approval
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Related Issues: #1256, #824, #819, #1137, #1689, #1685
Last Reviewed: 2026-06-23
---

# Content Strategy / Editorial Inventory

## Purpose

The LGFC website uses a story-centric editorial inventory so Lou Gehrig-related
historical content, source attribution, media references, placement controls, and
rotation metadata can be managed once and reused across public and Fan Club
surfaces.

This document explains the editorial strategy and design decisions behind the
content inventory package owned by project `#1256`.

## Scope

This strategy covers:

- story-first historical content modeling;
- canonical and alternate-perspective story handling;
- D1 ownership of content metadata and website placement rules;
- media association and credit/source requirements;
- submission intake before approved publication;
- human editorial review boundaries;
- dynamic population of homepage, discussions, milestones, search, archive,
  Fan Club library, and related-content surfaces;
- reconciliation of earlier content strategy issues.

This strategy does not authorize runtime code changes, D1 migrations, Pages
Functions, route changes, workflow changes, issue creation, issue closure, or
label changes.

## Current Known Truth

The production design authority identifies Cloudflare D1 as the primary
relational datastore and lists `content_inventory` and `submission_queue` as
canonical Day 1 data references. It also states that `content_inventory` is the
active editorial archive and member-library content authority introduced by the
T45 redesign.

The Program 2 website plan makes Content Strategy / Editorial Inventory the
first active child project under the website program because the dynamic content
layer must be documented before implementation agents adjust schema, public
rendering, search, admin/editor workflows, or media handling.

Earlier content strategy documents and issues contain useful requirements but do
not match the approved website documentation structure for this phase. This
package reconciles those requirements into the approved structure under:

- `docs/explanation/website/`
- `docs/reference/website/`
- `docs/how-to/website/`
- `docs/tutorials/website/`
- `docs/ops/implementation-plans/`

## Intended Final State

Implementation agents can build or reconcile the content inventory system
without inventing requirements from chat history, legacy issue comments, or
older placeholder documents.

The intended operating model is:

- `content_inventory` is the story-centric D1 source of truth for approved
  editorial content.
- `submission_queue` is the intake and review staging area before publication.
- Media objects remain media assets; they do not become the primary editorial
  authority.
- Placement is controlled by data fields such as `allowed_sections` and
  `priority`, not by per-section true/false columns.
- Canonical and alternate-perspective stories can share the same tag while only
  one row per tag is canonical.
- Automation may perform objective triage and suggestions only.
- Human editors make factual, editorial, canonical, merge, publication, and
  media-credit decisions.

## Source Reconciliation

### Related issue `#824`

Issue `#824` supplied an early design payload for a story-first archive, media
relationships, canonical tag uniqueness, rotation scoring, and submission flow.
This package retains the useful decisions but normalizes them to the current
repository authority:

- the primary approved inventory table is `content_inventory`, not a new
  parallel `stories` table;
- `allowed_sections` remains a placement field rather than separate section
  booleans;
- media is associated with stories but does not own editorial placement;
- automation remains advisory and does not publish or decide historical truth.

### Related issue `#819`

Issue `#819` requested a production-grade rewrite of earlier content inventory
documentation after placeholder and structure problems. This package resolves
that by creating complete documents in the approved website documentation
structure and preserving required headers, how-to procedure headings, and
reference boundaries.

### Related issue `#1137`

Issue `#1137` asked for a production design package defining source acquisition,
editorial workflow, canonical story model, alternate perspectives, review
process, archive lifecycle, implementation plan, milestones, acceptance
criteria, and verification points. This package captures those requirements and
retains future build work in an implementation plan rather than opening build
issues by default.

## Architecture Decisions

### Story-centric inventory

LGFC content is organized around historical stories rather than media files or
page sections. A story can appear in multiple website surfaces while preserving a
single editorial record, source lineage, media relationships, search text, and
rotation metadata.

This avoids duplicate page-specific copies and supports a write-once/read-many
archive for long-term historical preservation.

### D1 and media separation

D1 owns structured editorial data:

- story identity;
- body text and summary metadata;
- source, URL, and credit fields;
- canonical status and alternate-perspective grouping;
- placement and rotation controls;
- search and discovery text;
- publication status and review state.

Media storage remains a separate concern. B2 or existing media records may hold
binary objects and derivatives, while D1 associations describe how media supports
each story.

### Canonical and alternate perspectives

One tag groups related accounts of the same event, theme, source subject, or
historical moment.

The canonical row is the preferred editorial version for default presentation.
Alternate-perspective rows under the same tag are retained when they provide
attributed context, conflicting accounts, member perspectives, or source-specific
variations that should not be overwritten.

### Placement by allowed sections and priority

Website placement is driven by data:

- `allowed_sections` lists approved surfaces.
- `priority` orders eligible stories within a surface.
- `story_type` controls presentation weight.
- rotation fields control freshness and anniversary relevance.

The model must not add one true/false column per website section. New surfaces
should be represented as allowed section values governed by reference docs.

### Editorial rotation

The homepage and related dynamic surfaces can behave like an editorial newspaper
by selecting published content based on:

- allowed section eligibility;
- editorial priority;
- story type;
- event date or event year;
- rotation group;
- feature weight;
- last featured timestamp;
- recent-feature suppression.

Rotation assists placement but does not override publication status, canonical
rules, source requirements, or editorial holds.

### Submission queue before publication

Member/editor submissions enter `submission_queue` before they become published
inventory records. Queue review allows incomplete, duplicate, unsupported, or
potentially useful submissions to be triaged without polluting the approved
archive.

Approved submissions may create new inventory records, update existing records,
or become alternate-perspective rows. Rejected submissions remain excluded from
public rendering and search until the quarterly purge process removes eligible
rejected queue records.

### Content collection as intake layer (Priority #1)

For the Website Completion / Fan Club Product Buildout program (`#1685`), content
collection is **not** a separate workflow. It is the upstream intake and
source/credit capture layer inside this content management strategy.

| Layer | Responsibility |
| --- | --- |
| Content collection (intake) | Member `/fanclub/submit` and editor capture into `submission_queue` with source/credit fields |
| Content management (editorial) | Review, approval, publication into `content_inventory`, placement, and rotation |

Canonical workflow reference:
`docs/reference/website/unified-content-workflow.md`.

Member procedure:
`docs/how-to/website/member-content-submission.md`.

Task 004 reconciliation report:
`docs/ops/reports/website-content-workflow-reconciliation.md`.

Large-scale external or AI-assisted ingestion remains the separate Priority #4
Lou Gehrig Content Collection Expansion program and must not be conflated with
normal member/editorial intake.

### Automation boundaries

Automation may help with objective triage and suggestions, including:

- missing required field checks;
- duplicate candidate detection;
- media file type or URL sanity checks;
- OCR confidence capture;
- proposed tags or keywords;
- search text preparation.

Automation must not:

- publish content;
- reject factual claims as historically false;
- make canonical or merge decisions;
- delete historically relevant material;
- remove attribution;
- silently rewrite source text.

## Website Dynamic Population Model

The approved inventory can populate these website surfaces after implementation:

| Surface | Inventory use |
|---|---|
| Homepage spotlight or newspaper sections | Feature published stories eligible for homepage placement and rotation. |
| Discussions | Surface discussion-appropriate stories or prompts with approved tags and section eligibility. |
| Milestones | Feature stories with event dates, event years, and milestone tags. |
| Search | Index published canonical and alternate-perspective text, tags, source names, and media captions. |
| Archive | Browse approved historical inventory by tag, year, source, and story type. |
| Fan Club library | Present member-visible published inventory while preserving attribution. |
| Club Home (`club_home`) | Feature published stories and modules eligible for authenticated Club Home placement. |
| Related content | Link stories by shared tag, source, event year, rotation group, or media association. |

No public surface should read rejected submissions. Draft, under-review, or
editorial-hold content remains excluded unless an admin/editor surface is
explicitly designed to show it.
