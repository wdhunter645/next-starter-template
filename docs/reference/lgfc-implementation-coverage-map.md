---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Mapping from LGFC implementation surfaces to authority documents and tracking issues
Does Not Own: Route behavior, visual design, runtime implementation, or issue completion status
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-05-14
---

# LGFC Implementation Coverage Map

## Purpose

This reference confirms where each remaining LGFC implementation surface is governed and where implementation is tracked.

It exists to prevent old planning issues from becoming accidental authority after they are closed as superseded.

## Authority Hierarchy

Primary design authority:

- `/docs/reference/design/LGFC-Production-Design-and-Standards.md`

Content inventory authority:

- `/docs/reference/content-inventory-design-spec.md`
- `/docs/reference/content-inventory-d1-schema.md`

Operational implementation tracking:

- GitHub Issues
- PR bodies
- implementation worklists
- post-merge validation records
- `/docs/ops/trackers/LGFC-WEBSITE-IMPLEMENTATION-QUEUE-NORMALIZATION.md`

## Issue 173 Closeout Mapping

| Topic from Issue 173 | Current authority | Current tracking |
|---|---|---|
| Hero banner | Production design standards homepage section order | Website implementation issue tree |
| Weekly matchup | Production design standards Weekly Photo Matchup section | Website implementation issue tree |
| Social Wall | Production design standards homepage section order | Issue #1016 |
| Milestones | Production design standards homepage section order and content inventory authority | Issue #1017 |
| Events/calendar | Production design standards homepage section order | Issue #947 |
| Friends tiles | Production design standards homepage section order | Website implementation issue tree |
| Quality gate philosophy | repository governance workflows and PR template | active governance workflows |

## Current Implementation Surfaces

### Social Wall Production Completion

Authority:

- Production design standards homepage section order

Tracking:

- Issue #1016

Implementation readiness:

- preserve homepage section order
- use production-safe embed loading
- provide safe empty and failure states
- avoid unrelated homepage redesign

### Calendar and Events Completion

Authority:

- Production design standards homepage section order
- canonical `/calendar` direction where applicable through active implementation issues

Tracking:

- Issue #947

Implementation readiness:

- render stable event/calendar experience
- preserve homepage calendar position
- avoid route drift
- include empty-state behavior

### Fan Club and Member Surfaces

Authority:

- Production design standards canonical FanClub routes
- production auth/session model
- `/docs/reference/design/fanclub.md`
- `/docs/reference/design/fanclub-home.md`

Tracking:

- Issue #1013
- Issue #1014
- Issue #1015
- Issue #1113
- T40 / Issue #1118 in the normalized website implementation queue

Implementation readiness:

- preserve `/fanclub` route family
- enforce auth-gated access
- preserve canonical navigation
- keep membership card behavior aligned to `/fanclub/myprofile`
- keep memorabilia as a tagged or filtered photo/library experience, not a standalone table unless design authority changes
- complete member photo/archive, submission, and discussion/chat surfaces through queued Fan Club operations work

### Admin Operational Surfaces

Authority:

- Production design standards canonical Admin route family
- production auth/session model
- active repository route/API inventory

Tracking:

- T41 / Issue #1119 in the normalized website implementation queue

Implementation readiness:

- preserve `/admin/**` as an admin-only surface
- keep admin navigation separate from public and FanClub hamburger navigation
- validate join-request, stats, worklist, export, and member-operation surfaces with safe empty and failure states
- avoid exposing admin affordances in public footer or mobile public navigation

### Moderation and Review Workflows

Authority:

- production auth/session model
- FAQ/Ask moderation implementation trace
- reports API surfaces

Tracking:

- T23 FAQ CMS moderation closeout
- T42 / Issue #1120 in the normalized website implementation queue

Implementation readiness:

- preserve auditable approval, rejection, archive, and close transitions
- keep moderation queues admin-only
- provide safe empty/error states for review queues
- avoid bypassing existing FAQ, Ask, or report workflow boundaries

### Content Management and Editorial Archive

Authority:

- content inventory design spec
- content inventory D1 schema reference
- content archive implementation plan

Tracking:

- T43 / Issue #1121 and T45 / Issue #1123 in the normalized website implementation queue

Implementation readiness:

- preserve `content_inventory` as the canonical archive/content authority
- route admin CMS/content operations through existing save, publish, and list API boundaries
- keep library submissions and archive editorial review distinct from public read paths
- avoid parallel page-specific content stores unless new authority explicitly permits them

### Media Management

Authority:

- content inventory design spec
- content inventory D1 schema reference
- active B2/media route and API inventory

Tracking:

- T44 / Issue #1122 in the normalized website implementation queue

Implementation readiness:

- preserve B2-backed media assumptions
- validate media-assets listing and sync behavior with safe failure states
- avoid changing public image rendering contracts outside the media management task scope

### Events, Charity, Matchup, and Reporting Operations

Authority:

- production design standards homepage section order
- active admin event, fundraiser, matchup, reports, stats, and export surfaces

Tracking:

- T46 / Issue #1124 Event/calendar administration
- T47 / Issue #1125 Charity/fundraiser administration
- T48 / Issue #1126 Matchup administration
- T49 / Issue #1127 Audit/reporting systems

Implementation readiness:

- preserve public homepage and `/events` read behavior when admin event tools change
- keep campaign/fundraiser preview workflows admin-only until public exposure is intentionally enabled
- keep matchup operations aligned to current weekly voting behavior
- preserve protected-data boundaries for audit, reporting, stats, and export flows

### Dynamic D1 Homepage Integrations

Authority:

- Production design standards homepage section order
- content inventory design spec
- content inventory D1 schema reference

Tracking:

- Issue #1017

Implementation readiness:

- use `content_inventory` as D1 source of truth
- preserve `story_type`, `allowed_sections`, `priority`, `event_date`, `rotation_group`, `feature_weight`, and `last_featured`
- provide safe empty states
- avoid creating a parallel story table without new authority

### Milestone and News Integrations

Authority:

- Production design standards homepage section order
- content inventory design spec

Tracking:

- Issue #1017 and related website implementation issues

Implementation readiness:

- use D1-backed content where implementation exists
- preserve homepage section order
- preserve canonical and alternate-perspective content model
- avoid duplicating content into page-specific systems

## Completion Standard

A topic is implementation-ready when all of the following exist:

1. canonical authority document
2. active implementation issue
3. allowed file scope in the implementation issue or PR
4. acceptance criteria
5. validation expectations
6. no conflict with existing navigation, auth, D1, B2, or content inventory authority

## Normalized Queue Coverage

| Surface | Current coverage | Remaining queue coverage |
|---|---|---|
| Public FAQ and Ask | T21, T22, T23 | post-merge verification or accepted completion record |
| Public Events | T23-E | post-merge verification or accepted completion record |
| Public Search | Issue #1108 | T25 queued |
| Mobile/responsive navigation | Issue #1109 | T26 queued |
| Join/Login auth UX | Issue #1110 | T28 queued |
| D1/B2 fail-closed validation | Issue #1111 | T29 queued |
| FanClub shell/profile/library/memorabilia | Issues #1013-#1015 | post-merge verification or accepted completion record |
| FanClub home composition | Issue #1113 | T35 active |
| FanClub operations | Issue #1118 | T40 queued |
| Admin operations | Issue #1119 | T41 queued |
| Moderation/review | Issue #1120 | T42 queued |
| CMS/content management | Issue #1121 | T43 queued |
| Media management | Issue #1122 | T44 queued |
| Editorial/archive | Issue #1123 | T45 queued |
| Event/calendar admin | Issue #1124 | T46 queued |
| Charity/fundraiser admin | Issue #1125 | T47 queued |
| Matchup admin | Issue #1126 | T48 queued |
| Audit/reporting | Issue #1127 | T49 queued |
| Launch readiness | Issue #1112 duplicate task-number repaired | T50 queued |

## Closed Historical Issues

Issue #173 is closed as superseded historical planning documentation.

Its useful concepts remain preserved through this coverage map, the production design authority, and the newer implementation issues.
