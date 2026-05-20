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

Tracking:

- Issue #1013
- Issue #1014
- Issue #1015

Implementation readiness:

- preserve `/fanclub` route family
- enforce auth-gated access
- preserve canonical navigation
- keep membership card behavior aligned to `/fanclub/myprofile`
- keep memorabilia as a tagged or filtered photo/library experience, not a standalone table unless design authority changes

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

## Closed Historical Issues

Issue #173 is closed as superseded historical planning documentation.

Its useful concepts remain preserved through this coverage map, the production design authority, and the newer implementation issues.
