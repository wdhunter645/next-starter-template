---
Doc Type: Explanation
Audience: LGFC operators, editors, maintainers, and AI implementation agents
Authority Level: Controlled
Owns: Content strategy rationale, editorial model, source reconciliation, and architecture decisions for the website content inventory
Does Not Own: D1 migrations, runtime implementation, route behavior, or final factual editorial approval
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Related issues: #1256, #824, #819, #1137, #1689, #1685, #2461, #2662, #2663
Last Reviewed: 2026-08-05
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

### Club Newspaper rotation, media-pairing, and edition contract (#2663)

This subsection defines the `club_home` section's rotation, article/media
pairing, and edition-history contract, consuming the CC-001 (#2433) and CC-002
(#2434) frozen contracts and the zone identities defined in
`docs/reference/design/fanclub-home.md` (#2662) rather than creating a
competing content model. It is a documentation-only contract; the runtime gaps
it identifies remain future, separately authorized work.

**Zone eligibility.** Only rows with `status: published` and `club_home` in
`allowed_sections` are eligible for any `club_home` zone, per the base rule
above. Within that eligible pool, per-zone filters apply using the zone IDs
from `fanclub-home.md`:

| Zone ID | Eligible `story_type` | Negative filter |
| --- | --- | --- |
| `lead-story` | `primary` preferred, any type as fallback | None beyond the base rule |
| `story-rail` | `secondary`, `brief` | Excludes whatever row `lead-story` selected |
| `archive-spotlight` | Any type | Excludes rows already used by `lead-story` and `story-rail` in the same selection pass |

**Rights/privacy/publication gate (CC-002).** No `club_home` zone may render a
row whose `rights_status`, `privacy_status`/`privacy_flag`,
`publication_status`/`review_status`, or suppression state matches CC-002's
blocking-value table (`docs/ops/implementation-plans/content-collection/packages/cc-002-provenance-rights-contract-package.md`).
This is stricter than, and takes precedence over, the rotation-score ranking
below — a row that scores highest but fails a CC-002 blocking check must never
render.

**Article/media pairing.** Media association for `club_home` rows uses the
existing `content_inventory_media` model
(`docs/reference/website/content-inventory-model.md`'s "Media Association
Model"): `media_role`, `display_order`, `caption`, `alt_text`, `source_name`,
`source_url`, `credit_line` per association. `media-feature`'s pairing rule is:
prefer the `lead-story` row's `primary_image`-role association; if none
resolves, fall back to the most recent `photos` row with a non-empty URL.
Orientation/crop constraints and a formal "avoid prior pairing" rule are not
yet defined — both are open items in the current-state evidence report, not
resolved by this contract.

**Rotation scoring (current mechanism, unchanged by this contract).** Selection
uses the existing deterministic score
(`functions/_lib/content-inventory-rotation.ts`): editorial priority, feature
weight, event-date/event-year proximity boost, a recency penalty that decays
over a 90-day window, and a rotation-group penalty. This contract does not
replace that mechanism; it defines the requirements a future runtime change
would need to satisfy to close the gaps below.

**Fairness, cooldown, and duplicate prevention.**

- *Current:* the recency penalty is a soft, decaying score adjustment, not a
  hard exclusion window; a single row with a sufficiently higher priority or
  feature weight can be selected repeatedly. Duplicate prevention exists only
  within one page-render (`lead-story`/`story-rail`/`archive-spotlight` IDs are
  excluded from each other in the same request), not across requests or a
  formal "edition."
- *Required for #2461 conformance:* a hard recent-use exclusion window (not
  merely a score penalty), preference for the least-used eligible row within a
  zone (requiring a persistent usage-count field, which does not exist today —
  `last_featured` is the only per-row rotation-history field), and near-full
  eligible-pool rotation before any row repeats.

**Recurring and time-sensitive content.** `event_date`/`event_year` proximity
boosting already exists in the current scoring mechanism and satisfies #2461's
anniversary/recurring-content requirement (e.g., MLB Lou Gehrig Day on June 2)
without further contract change, provided the underlying `content_inventory`
rows exist with correct `event_date`/`event_year` values — populating those
specific rows is a content-operations task, not a contract gap.

**Manual pinning and emergency override.** No mechanism exists today. Required:
an admin-settable pin per zone that overrides rotation scoring for a bounded
time window, and an emergency-override path that does not corrupt rotation
history when released. Neither is authorized to be built by this contract.

**Edition generation, persistence, regeneration, rollback, and audit.** No
"edition" concept exists today; `club_home` content is recomputed fresh on
every `GET /api/fanclub/home` request from the live score ranking. Required for
#2461 conformance: a persisted edition record (the exact set of rows selected
per zone, generated on a defined cadence rather than per-request), a
regeneration path that supersedes rather than silently overwrites a prior
edition, a rollback path to the previous edition, and a placement-history log
recording asset ID, zone, size, timestamp, edition ID, automatic-vs-pinned
selection, and media rendition used per placement — none of which exist today
(only `last_featured`, a single timestamp per row, is recorded).

**Media renditions.** #2461 requires thumbnail/small/medium/large renditions,
generated once and requested by size rather than scaling a full-resolution
image in the browser. No rendition generation or size-specific URL field
exists anywhere in `functions/_lib/` today (verified by search); `photos.url`
and `content_inventory_media` both store a single URL per media item.

**Required D1/B2/API implications (future, not authorized here).** A
placement-history table (or equivalent event log); a usage-count field or
derivable equivalent on `content_inventory` (or the history table); an
edition-record table; admin-pin fields or an admin-pin table; rendition
generation (worker or build-time) plus size-specific URL storage or naming
convention on B2/`photos`/`content_inventory_media`. None of these are D1
migrations, API routes, or B2 changes performed by this task.

**Explicit non-goals of this contract.** No runtime code, migration, or API
change. No change to the existing deterministic scoring formula. No new public
route. No change to CC-001/CC-002's own field contracts — this section
consumes them. No decision on the open `recognition`/`submission-cta` side-rail
placement question left open by #2662.

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
