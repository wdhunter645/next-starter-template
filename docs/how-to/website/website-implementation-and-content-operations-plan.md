---
Doc Type: How-To
Audience: LGFC operators, maintainers, and implementation agents
Authority Level: Program Implementation Plan
Owns: Phased implementation sequence, deliverables, child issue rules, validation, rollback, closeout, and handoff checklist for #1255
Does Not Own: Final editorial content decisions, production secrets, vendor account configuration, or runtime implementation code
Canonical Reference: docs/how-to/website/website-implementation-and-content-operations-plan.md
Last Reviewed: 2026-06-04
---

# Website Implementation and Content Operations Plan

## Purpose

This document turns the website implementation and content operations program into an executable implementation plan.

The program completes remaining LGFC website work in a serial sequence. The sequence starts with the content strategy and editorial inventory system because that system supplies the structured content layer used to populate website surfaces dynamically.

## Scope

This document owns the program execution path for:

- content strategy and editorial inventory planning;
- content inventory implementation;
- website operations and admin planning;
- website operations and admin implementation;
- website QA and production validation;
- child issue creation rules;
- validation gates;
- rollback and closeout rules;
- operations handoff checklist.

This document does not own final editorial judgment, final historical content approval, vendor account configuration, production secrets, or runtime implementation details beyond sequencing and acceptance criteria.

## Current known truth

The website program has one active program master and three child project masters.

- program: #1255 — Website Implementation and Content Operations
- priority project: #1256 — Content Strategy / Editorial Inventory
- secondary project: #1258 — Website Operations Admin
- final validation project: #1259 — Website QA and Production Validation

The content strategy and editorial inventory project is the top overall website priority because it supplies the dynamic content layer for the site.

## Intended final state

The final state is a website operations program with documented content inventory, documented admin and operations workflows, verified production behavior, and a clear handoff package for long-term operations.

Before the program closes:

- content inventory docs exist in the approved structure;
- content inventory implementation work is decomposed into child issues;
- admin and operations work is decomposed into child issues;
- production QA is complete or explicitly deferred with retained issues;
- the program master links all final docs and outcomes.

## Operating rule

One child project is active at a time unless the program owner explicitly authorizes parallel work.

The active order is:

1. Content Strategy / Editorial Inventory
2. Website Operations Admin
3. Website QA and Production Validation

## Steps

### Phase 0 — Program baseline and issue reconciliation

Objective: make the issue queue reliable before new implementation work begins.

Deliverables:

- Confirm the website program master remains the current program authority.
- Confirm the three child project masters remain current.
- Reconcile older related issues under the correct child project.
- Add comments to older issues that are superseded, retained, or subordinated.
- Close duplicate or obsolete issues only after useful requirements are captured.

Child issue creation rules:

- Do not create build issues until the related child project master has an approved implementation plan.
- Each build issue must reference exactly one project master.
- Each build issue must include scope, allowed files, validation, rollback, and acceptance criteria.
- Each build issue must be small enough for one implementation PR.

Validation gates:

- Open PR count is checked before starting build work.
- Related existing issues are classified.
- No duplicate active child issue exists for the same task.

Rollback / closeout rules:

- If an issue was incorrectly classified, reopen or relabel it with a correction comment.
- If old issue content was lost during consolidation, restore it from issue history or comments before closing.

Exit criteria:

- The program master has an updated active-project status comment.
- The content strategy project is confirmed as active priority one.
- The operations/admin and QA projects remain queued.

### Phase 1 — Content Strategy / Editorial Inventory documentation package

Objective: complete the content model, editorial workflow, and implementation plan before code is changed.

Deliverables:

- Explanation document covering content strategy, editorial purpose, and architecture decisions.
- Reference document defining the D1 inventory schema, field definitions, content placement rules, rotation rules, source/credit rules, and media association model.
- How-to documents for adding stories, adding media, reviewing submissions, and publishing or updating content.
- Tutorial document for editor onboarding and first story creation.
- Implementation plan decomposing the build into child issues.

File/document targets:

- `docs/explanation/website/content-strategy.md`
- `docs/reference/website/content-inventory-model.md`
- `docs/reference/website/editorial-placement-and-rotation.md`
- `docs/how-to/website/add-content-story.md`
- `docs/how-to/website/add-content-media.md`
- `docs/how-to/website/review-content-submission.md`
- `docs/how-to/website/publish-update-content.md`
- `docs/tutorials/website/editor-first-story.md`
- `docs/ops/implementation-plans/website-content-strategy-editorial-inventory.md`

Required design content:

- One story-centric D1 inventory model.
- No per-section true/false columns.
- Canonical and alternate-perspective stories under the same tag.
- Source name, source URL, and credit line fields.
- Event date, event year, rotation group, last featured date, and feature weight.
- Allowed sections and priority for placement control.
- Submission queue before approved inventory publication.
- Automation limited to objective triage only.
- Manual review for factual, editorial, merge, canonical, alternate-perspective, and media decisions.
- Quarterly rejected-submission purge process.

Child issue creation rules:

- Create documentation child issues first if the docs are incomplete.
- Create schema/build issues only after the docs identify exact tables, fields, and route surfaces.
- Split build issues by responsibility: data model, admin/editor UI, public rendering, search/discovery, media linking, seed content, validation.

Validation gates:

- Documentation headers pass.
- How-to documents include a `## Steps` section.
- Reference documents avoid procedural runbooks except where explicitly allowed.
- Implementation plan maps every build issue to a document source.
- No implementation agent is required to infer requirements from chat history.

Rollback / closeout rules:

- Documentation PRs may be reverted without touching runtime behavior.
- If content model fields change before build starts, update reference docs first and then regenerate child issues.
- Close older related content strategy issues only after their useful requirements are captured under the active content strategy project or linked as retained references.

Exit criteria:

- The content strategy project has final docs linked.
- Implementation child issues exist and are ordered.
- The program master is updated to mark Phase 1 documentation complete.

### Phase 2 — Content Strategy / Editorial Inventory implementation

Objective: build the content inventory system that dynamically populates website surfaces.

Deliverables:

- D1 migration or schema artifact for approved content inventory tables.
- Submission queue model.
- Admin/editor workflow for content review and publication.
- Media association workflow.
- Public content query utilities.
- Dynamic population of approved website surfaces.
- Seed or pilot content set sufficient for verification.

Likely child build issue sequence:

1. Content inventory schema and migration.
2. Submission queue schema and objective triage fields.
3. Admin/editor content management interface.
4. Media association and credit/source handling.
5. Public content query layer.
6. Homepage and archive population wiring.
7. Search and related-content indexing.
8. Seed content and verification pack.

File/document targets:

- D1 migration files under the repository's existing database/migration structure.
- Existing website route and component files only as required by approved child issues.
- Existing admin/editor files only as required by approved child issues.
- Reference and how-to docs updated only when implementation varies from design.

Validation gates:

- Build passes.
- Type checks pass where available.
- Tests pass or are added for content selection logic.
- Manual route verification covers affected public and admin surfaces.
- No unauthorized header, footer, auth, or navigation drift.
- Seed content contains source and credit data.

Rollback / closeout rules:

- Schema changes must include a rollback or safe forward-correction plan.
- Public rendering changes must be reversible without data loss.
- Content seed failures must not block rollback of runtime code.

Exit criteria:

- Dynamic content population works from approved inventory data.
- Admin/editor workflow can add or update content using documented steps.
- The content strategy project can be marked implemented or moved to final validation.

### Phase 3 — Website Operations Admin project planning

Objective: prepare the operations/admin project for implementation after the content system has a stable foundation.

Deliverables:

- Updated design and implementation plan for operations/admin workflows.
- Reconciliation of existing operations/admin issues under the operations/admin project.
- Serial child build issues for admin, moderation, media, events, charity/fundraiser, matchup, and audit/reporting workflows.

Child issue creation rules:

- Promote one operational area at a time.
- Do not mix admin operations with public website QA in the same issue.
- Every child issue must identify its operator role, route surface, data dependency, and validation method.

Validation gates:

- Existing website behavior remains stable.
- Admin/fanclub gating remains compliant.
- No content model changes are introduced unless linked back to the content strategy project.

Rollback / closeout rules:

- Admin feature rollbacks must preserve existing data.
- If an operational workflow depends on unfinished content work, pause the operations/admin project and return to content strategy.

Exit criteria:

- The operations/admin project has an approved implementation plan and ordered child issues.

### Phase 4 — Website Operations Admin implementation

Objective: build and verify operational/admin workflows.

Deliverables:

- Fan Club operations workflow.
- Admin member operations workflow.
- Moderation/review workflow.
- Content management workflow.
- Media management workflow.
- Editorial/archive workflow.
- Events/calendar administration.
- Charity/fundraiser administration.
- Matchup administration.
- Audit/reporting system.

Validation gates:

- Build and type checks pass where available.
- Route access and admin gating are verified.
- Each operator workflow has at least one documented manual verification path.
- Audit/reporting produces useful evidence for operations.

Rollback / closeout rules:

- Roll back one operational lane at a time.
- Preserve data and published content where possible.
- Any partial operational feature must remain hidden or fail closed.

Exit criteria:

- Operations/admin child issues are closed or explicitly deferred.
- Operations documentation is updated for handoff.

### Phase 5 — Website QA and Production Validation

Objective: validate production readiness and close or reclassify remaining public-core issues.

Deliverables:

- Route validation report.
- Header/footer/navigation validation report.
- Auth-state validation report.
- Mobile/responsive validation report.
- D1/B2 integration validation report.
- Public-core issue closeout table.
- Final launch-readiness report.

Child issue creation rules:

- Create corrective child issues only for concrete failed validations.
- Do not reopen broad design debates during QA unless a blocker contradicts the current design authority.
- Convert large corrective findings into a new project only when they exceed one PR.

Validation gates:

- Production route checks pass.
- Critical public flows pass.
- Auth-protected areas fail closed.
- Content inventory data renders correctly.
- Admin-only surfaces remain protected.
- B2/media links resolve where expected.

Rollback / closeout rules:

- Production-breaking findings pause program closeout.
- Non-critical defects may become post-launch follow-up issues only with explicit severity classification.
- Close or reclassify stale website issues before final program closeout.

Exit criteria:

- The QA project has a completed QA report.
- The program master has final as-built and operations handoff links.
- Program can be closed or moved to post-launch operations.

## Handoff checklist

Before the program can close:

- [ ] Content strategy completed or explicitly transitioned to operations.
- [ ] Operations/admin completed or explicitly deferred with retained issues.
- [ ] QA and production validation completed.
- [ ] Existing related issues are closed, subordinated, or retained with current next steps.
- [ ] Final content inventory docs exist in the approved structure.
- [ ] Final operations/admin docs exist in the approved structure.
- [ ] Final QA report exists in the approved structure.
- [ ] Program master links all final docs and child project outcomes.
- [ ] Remaining post-launch issues are labeled and assigned to the correct future program.

## Closeout comment format

Use this format when closing the program master:

```text
## Program closeout

Final status: complete / transitioned / partially deferred

Completed child projects:
- content strategy — result:
- operations/admin — result:
- QA and production validation — result:

Final documentation:
- Explanation:
- Reference:
- How-to:
- Tutorial:
- QA report:

Remaining deferred work:
- issue:
- reason:
- next owner/project:

Operations handoff status:
- Ready / Not ready
```
