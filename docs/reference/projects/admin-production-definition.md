---
Doc Type: Reference
Audience: human project owner and AI agents
Authority Level: supporting
Owns: Admin system production definition, scope, actors, boundaries, success criteria
Does Not Own: implementation code, environment variable values, migrations, or operations runbooks
Canonical Reference: docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-05-29
---

# Admin System Production Definition

## Purpose

The Admin system is the controlled operations surface for managing LGFC content, moderation, diagnostics, and member oversight. It exists to protect production quality while allowing authorized administrators to manage D1-backed site data and operational content.

## Production location

Canonical Admin routes live under `/admin/**`. The public footer must not expose an Admin link. Admin access is by direct navigation and must never appear in public or Fan Club mobile hamburger navigation.

## Actors

- Admin operator: authorized person responsible for content, moderation, diagnostics, and operational decisions.
- Member: may be the subject of admin review or moderation but does not own admin functions.
- Public visitor: has no admin access.
- AI agent: may implement admin features only from documented requirements and issue scope.

## Security boundary

The Admin security boundary is the API layer. Admin UI pages may be browser-reachable, but sensitive reads, writes, exports, and configuration changes must be protected by admin API authorization. Admin implementation must not rely on UI obscurity as a security control.

## Required admin areas

### Dashboard

The dashboard provides entry points and operational visibility for admin sections.

### Content management

Content management covers public content, page content, news, Q&A, historical material, and editorial updates as assigned by content documentation.

### Media management

Media management covers B2-backed media records and D1 metadata, including approval state, tags, attribution, and relationship to stories, milestones, matchups, and library entries.

### Moderation queue

Moderation provides a review surface for reported or submitted content. The queue must separate objective technical triage from human editorial judgment.

### Milestones and events

Admin must be able to manage milestone and event records that feed public and member views.

### Weekly matchup

Admin must be able to configure, schedule, activate, close, and review weekly matchup records.

### Users and members

Admin member oversight is minimal and should avoid unnecessary exposure of personal data. High-impact actions require audit logging.

### System health

System health is a read-only diagnostic surface for D1, deployment, B2, external widgets, and critical configuration readiness.

## Audit and logging requirements

Destructive or high-impact actions must produce an audit record.

## Boundaries

The Admin system must not own public navigation design, Fan Club member-facing UX, store implementation, secret values, CI workflow implementation, or as-built environment configuration.

## Success criteria

The Admin system is production-complete when documented admin areas exist, protected actions are authorization-gated, high-impact actions are logged, and admin remains separated from public/member navigation.