---
Doc Type: Implementation Plan
Audience: Atlas, Bill, LGFC maintainers, implementation agents, and reviewers
Authority Level: Operational Plan
Owns: Future build issue sequence and verification plan for Content Strategy / Editorial Inventory after documentation approval
Does Not Own: Runtime implementation, issue creation before approval, D1 migrations before child issues, or final editorial decisions
Status: ready-for-review
Project: website-content-strategy-editorial-inventory
Owner: Atlas
Execution Mode: orchestrated-after-approval
Source Issue: 1256
Related Program Issue: 1255
Canonical Reference: /docs/ops/implementation-plans/README.md
Related Issues: #1256, #824, #819, #1137
Last Reviewed: 2026-06-07
---

# Website Content Strategy / Editorial Inventory Implementation Plan

## Purpose

Define the future child build issue sequence for the LGFC Content Strategy /
Editorial Inventory project after the Phase 1 documentation package is reviewed
and approved.

This plan is complete enough for future issue creation, but issue creation is
held until Atlas/Bill explicitly authorizes it after review.

## Scope

This plan covers future implementation work for:

- existing implementation inventory and gap analysis;
- `content_inventory` schema reconciliation;
- `submission_queue` schema and workflow reconciliation;
- media association and attribution handling;
- admin/editor workflow updates;
- public dynamic population queries;
- search/discovery support;
- editorial rotation logic;
- seed content and verification.

This plan does not authorize this documentation PR to change application code,
D1 migrations, Pages Functions, route files, React components, CSS, workflow
YAML, package files, production configuration, credentials, issue labels, issue
states, or build implementation issues.

## Current Known Truth

Program 2 Phase 0 is complete and identifies project `#1256` as the active
priority-one website child project under `#1255`.

The production design authority identifies D1 as the primary datastore and lists
`content_inventory` and `submission_queue` as canonical Day 1 data references.
It also states that `library_entries` is a legacy Day 1 written-content table
that must not be silently orphaned if reads move to `content_inventory`.

Prior website work introduced editorial/archive surfaces. Future build issues
must reconcile existing schema, API, admin/editor UI, public rendering, and
search behavior against the approved docs before adding new implementation.

## Intended Final State

The website dynamically populates approved content surfaces from a story-centric
D1 inventory with:

- canonical and alternate-perspective story support;
- source, URL, and credit-line preservation;
- media associations and attribution;
- allowed-section and priority placement controls;
- date-aware editorial rotation;
- public search and related-content discovery;
- submission queue intake before publication;
- manual editorial review for factual, canonical, merge, media, and publication
  decisions;
- quarterly rejected-submission purge behavior.

## Approval and Issue Creation Hold

Status is `ready-for-review`, not `production-ready`.

Future child issues must not be opened from this plan until Atlas/Bill approve
the Phase 1 documentation package and explicitly authorize issue creation.

When authorized, each child issue must:

- reference source issue `#1256`;
- include exactly one objective;
- include allowed files;
- include acceptance criteria;
- include validation commands or manual verification requirements;
- avoid duplicating already-implemented schema/API/admin work.

## Documentation Sources

Future child issues must cite the approved documentation source for their
requirements:

- Strategy: `docs/explanation/website/content-strategy.md`
- Model: `docs/reference/website/content-inventory-model.md`
- Placement/rotation: `docs/reference/website/editorial-placement-and-rotation.md`
- Add story: `docs/how-to/website/add-content-story.md`
- Add media: `docs/how-to/website/add-content-media.md`
- Review submission: `docs/how-to/website/review-content-submission.md`
- Publish/update: `docs/how-to/website/publish-update-content.md`
- Editor onboarding: `docs/tutorials/website/editor-first-story.md`

## Operating Rule

Reconcile before building.

The first implementation task must inventory current schema, APIs, UI, and public
reads against the approved docs. Build changes should target documented gaps
only.

## Program 2 Child-Task Continuation Handoff

Program 2 child-task continuation for the remainder of `#1255`, including work
after current Task 003 issue `#1401`, requires an explicit Atlas, Bill, or
controller `@cursor` issue comment on the next child issue.

Cursor must not infer executable authority from any of the following signals by
themselves:

- labels;
- merge state;
- closed or completed prior issue state;
- queue order;
- open PR order.

Cursor may execute only the child issue explicitly named in the latest valid
`@cursor` continuation comment. The controller remains responsible for choosing
the next child task. Cursor remains limited to that single authorized issue and
must stop at GitHub `READY FOR REVIEW` unless the controller explicitly grants a
different stop condition.

Cursor must not create additional child issues, close issues, relabel issues,
mutate `#1255`, mutate `#1256`, touch Program 1 / `#1411`, mutate unrelated
issues, change workflow YAML, or merge unless the active source issue explicitly
authorizes that action. If dependency or blocking status is unclear, Cursor must
pause and report findings instead of implementing.

### Child issue readiness requirements

Every executable Program 2 child issue must include or be paired with:

- parent program reference: `#1255`;
- parent project reference when applicable: `#1256`;
- dependency or prior-task criteria;
- blocking criteria;
- required source documents;
- exact scope;
- hard out-of-scope list;
- expected file areas or file-touch allowlist;
- validation expectations;
- exact PR source issue line requirement;
- stop condition: GitHub `READY FOR REVIEW`;
- no merge authority;
- no issue close or relabel authority unless explicitly granted.

### Continuation Authorization Template

Use this template on the next authorized child issue:

```text
@cursor

Program 2 continuation authorization.

Prior task complete:
- <prior issue> is closed completed or otherwise explicitly accepted.
- <prior PR> is merged.
- Superseded PRs, if any, are closed unmerged.
- Post-merge verification / label cleanup is complete or explicitly delegated.

Blocking criteria cleared:
- <dependency> is complete.
- <parent project> remains active.
- <parent program> remains active.
- Program 1 / #1411 must not advance.

Next authorized task:
- <next issue> — <title>

Proceed with <next issue> only.

Use exactly one PR source issue line:
- **Issue:** <next issue>

Hard boundaries:
- Do not touch Program 1 / #1411.
- Do not mutate #1255 or #1256 state unless explicitly authorized.
- Do not close or relabel issues unless explicitly authorized.
- Do not create additional child issues.
- Do not change workflow YAML unless explicitly authorized.
- Do not merge.

Validation:
- Run and report exact commands/results in the PR body.

Stop condition:
- Stop at GitHub READY FOR REVIEW.
```

### Blocked-Continuation Template

Use this template when the next child task is not yet executable:

```text
@cursor pause.

Program 2 continuation is blocked.

Do not implement the next child task.

Blocking criteria not cleared:
- <blocker list>

Allowed action:
- Investigate and report only, if explicitly requested.

Stop after posting findings.
```

---

## Task 001 — Existing Implementation Inventory and Gap Analysis

Type: website
Agent: cursor
Priority: 1
Depends On: documentation approval and issue creation authorization
Allowed Files:
- `docs/reference/website/**`
- `docs/ops/reports/**`
- current schema/API/admin/public files only for read-only inspection unless the child issue expands the allowlist
Acceptance Criteria:
- Current `content_inventory` schema is compared against the approved model.
- Current `submission_queue` schema is compared against the approved model.
- Current media/photo association behavior is documented.
- Current admin/editor workflows are documented.
- Current public reads for homepage, search, archive, Fan Club library, milestones, discussions, and related content are documented.
- Gaps are classified as already satisfied, needs docs update, needs schema delta, needs API delta, needs UI delta, needs public rendering delta, needs search delta, or needs operational validation.
Validation:
- Documentation headers pass for any changed docs.
- Changed-file list stays within the authorized child issue allowlist.
- No runtime behavior changes occur in a gap-analysis-only issue unless explicitly authorized.

## Task 002 — Content Inventory Schema Delta

Type: website
Agent: cursor
Priority: 1
Depends On: Task 001
Allowed Files:
- D1 migration files authorized by the child issue
- schema helpers or data-access files authorized by the child issue
- `docs/reference/website/content-inventory-model.md` only if implementation reveals an approved documentation correction
Acceptance Criteria:
- Missing approved `content_inventory` fields are added or reconciled.
- Canonical-per-tag enforcement is implemented or documented with an approved fallback.
- `event_year`, `event_date`, `rotation_group`, `last_featured`, and `feature_weight` are supported.
- `source_name`, `source_url`, and `credit_line` are preserved for published records.
- `allowed_sections` and `priority` remain the placement controls.
- No per-section true/false columns are introduced.
Validation:
- Migration validation command from the child issue passes.
- Existing content reads remain compatible or have an approved migration/fallback path.
- `library_entries` is not silently orphaned.

## Task 003 — Submission Queue and Review State Delta

Type: website
Agent: cursor
Priority: 1
Depends On: Task 001
Allowed Files:
- D1 migration files authorized by the child issue
- submission queue API/data-access files authorized by the child issue
- admin/editor review files authorized by the child issue
- relevant how-to docs only when implementation changes approved procedures
Acceptance Criteria:
- `submission_queue` supports pending, triaged, under-review, approved, rejected, merged, and purged states or approved equivalents.
- Objective triage fields do not create factual auto-rejection behavior.
- Manual review records factual, editorial, merge, canonical, and media decisions.
- Rejected records can be marked with purge eligibility and retention reason.
- Public surfaces cannot read queue records directly.
Validation:
- Queue state tests or manual verification cover approve, merge, reject, retain, and purge-eligible paths.
- Public search/rendering excludes rejected and under-review records.

## Task 004 — Media Association and Attribution Delta

Type: website
Agent: cursor
Priority: 1
Depends On: Task 001
Allowed Files:
- media/photo association data-access files authorized by the child issue
- admin/editor media files authorized by the child issue
- D1 migration files only if Task 001 identifies a schema gap
- relevant reference/how-to docs only when implementation changes approved procedures
Acceptance Criteria:
- Stories can link approved media/photo records with role and display order.
- Media-specific caption, alt text, source, URL/reference, and credit are preserved when distinct from story attribution.
- Memorabilia remains a tagged/filtered view of `photos`, not a standalone table.
- Media does not become the primary editorial content authority.
Validation:
- Manual or automated verification links media to an approved story and confirms attribution remains available to public/admin rendering.

## Task 005 — Admin/Editor Workflow Delta

Type: website
Agent: cursor
Priority: 1
Depends On: Tasks 002-004 as needed by gap analysis
Allowed Files:
- admin/editor route and component files authorized by the child issue
- relevant API/data-access files authorized by the child issue
- relevant how-to/tutorial docs only when implementation changes approved procedures
Acceptance Criteria:
- Editors can create or update story drafts.
- Editors can assign canonical or alternate-perspective status.
- Editors can set source, URL/reference, and credit fields.
- Editors can set allowed sections, priority, story type, event date/year, rotation group, and feature weight.
- Editors can review submissions and record manual decisions.
- Editors can attach or review media associations.
Validation:
- Manual admin/editor workflow verification covers add story, add media, review submission, and publish/update paths.
- Auth/admin gating remains compliant with production design authority.

## Task 006 — Public Dynamic Population Delta

Type: website
Agent: cursor
Priority: 1
Depends On: Tasks 002 and 005 as needed by gap analysis
Allowed Files:
- public query/data-access files authorized by the child issue
- public route/component files authorized by the child issue
- tests authorized by the child issue
Acceptance Criteria:
- Homepage content surfaces can read eligible published inventory.
- Milestones can use `event_date` and `event_year`.
- Discussions can use approved section eligibility.
- Fan Club library reads preserve source/credit requirements and avoid orphaning legacy `library_entries`.
- Related content can use tag, event/year, source, media, or rotation group relationships.
- Public surfaces exclude queue, rejected, draft, under-review, and editorial-hold content.
Validation:
- Manual route verification or automated integration tests prove modified public surfaces read approved inventory and exclude ineligible records.

## Task 007 — Search and Discovery Delta

Type: website
Agent: cursor
Priority: 1
Depends On: Tasks 002 and 006 as needed by gap analysis
Allowed Files:
- search route/query/index files authorized by the child issue
- data-access files authorized by the child issue
- tests authorized by the child issue
Acceptance Criteria:
- Public search indexes approved title, text, tag, search text, source, credit, event year/date, and approved media captions/OCR where available.
- Canonical and alternate-perspective rows can be discovered without confusing canonical defaults.
- Rejected, queue, draft, under-review, and editorial-hold records are excluded from public search.
Validation:
- Search verification covers canonical result, alternate-perspective result, source/credit result, and exclusion of rejected/under-review records.

## Task 008 — Editorial Rotation Delta

Type: website
Agent: cursor
Priority: 1
Depends On: Tasks 002 and 006
Allowed Files:
- rotation/query utility files authorized by the child issue
- tests authorized by the child issue
- relevant reference docs only when implementation changes approved rotation semantics
Acceptance Criteria:
- Rotation considers allowed section, priority, event proximity, event year/date, rotation group, feature weight, last featured, and recent-feature penalty.
- Rotation remains deterministic enough for review and debugging.
- Canonical rows are preferred unless a surface explicitly includes alternates.
- `last_featured` is updated only through approved publication/rotation behavior.
Validation:
- Tests or deterministic manual verification demonstrate event-aware boost, recent-feature suppression, and exclusion of ineligible records.

## Task 009 — Seed Content and Verification Pack

Type: website
Agent: cursor
Priority: 1
Depends On: Tasks 002-008
Allowed Files:
- seed data files authorized by the child issue
- tests authorized by the child issue
- docs/how-to or docs/tutorials updates only if verification changes procedures
Acceptance Criteria:
- Seed or pilot content includes at least one canonical story, one alternate-perspective story, one media-associated story, one event-year story, and one rejected queue example for validation.
- Seed content includes source and credit data.
- Verification demonstrates public inclusion and exclusion rules.
- Admin/editor workflow can reproduce the documented first-story path.
Validation:
- Automated and manual verification defined by the child issue passes.
- Any seeded content can be removed or rolled forward safely according to the child issue rollback plan.

## Acceptance Criteria for Plan Approval

- The Phase 1 documentation package exists in the approved repository structure.
- The future build sequence starts with implementation inventory and gap analysis.
- Schema, queue, media, admin/editor, public rendering, search, rotation, and seed verification work are separated into child-sized tasks.
- Each task identifies dependencies, allowed files, acceptance criteria, and validation expectations.
- No build issue creation occurs until Atlas/Bill authorize it after review.
- Future implementation agents can cite repository docs rather than issue comments or chat history.

## Rollback

This documentation plan can be reverted without affecting runtime behavior.

Future implementation child issues must define their own rollback or forward-fix
plans, especially for D1 migrations and public rendering changes.
