---
Doc Type: Report
Audience: Bill, ChatGPT, LGFC maintainers, and implementation agents
Authority Level: Program Evidence
Owns: Admin and data-surface gap inventory for Lou Gehrig content collection Phase 1
Does Not Own: Admin UI implementation, migrations, or merge authority
Canonical Reference: /docs/reference/architecture/lou-gehrig-content-data-surface-boundary.md
Related issues: #1738, #1744, #1685
Last Reviewed: 2026-07-04
---

# Lou Gehrig Admin and Data-Surface Boundary Review

## Purpose

Inventory admin tools, data surfaces, forms, and review states needed for Lou Gehrig
content collection. Separate required Phase 1 documentation from deferred implementation.

## Inventory summary

| Need | Phase 1 (#1738) | Deferred implementation |
| --- | --- | --- |
| Source category inventory | Documented | — |
| Research queue model | Documented | Admin queue UI |
| Metadata schema | Documented | D1 schema / forms |
| Provenance/rights how-to | Documented | Workflow enforcement |
| Manual intake procedure | Documented | Intake form |
| Editorial conversion rules | Documented | CMS integration |
| Club staging preview | Existing sample surface | Gehrig-specific staging hooks |
| Evidence reports | Documented templates | Automated report generation |
| `submission_queue` intake | Existing runtime | Gehrig-specific fields TBD |
| `content_inventory` publication | Existing runtime | Research-to-inventory automation (#2040) |

## Read-only code review findings

Reviewed (read-only, no changes):

| Area | Path | Finding |
| --- | --- | --- |
| Club staging | `src/app/admin/clubstaging/` | Staging-only boundary suitable for preview; not publication |
| Editorial APIs | `functions/api/admin/editorial/**` | Publication path exists; research queue does not |
| Member submit | `POST /api/library/submit` | Intake channel for member leads |
| Fan Club data | `docs/reference/architecture/fan-club-data-surface-inventory.md` | Inventory/content tables mapped |
| Migrations | `migrations/**` | No research candidate table present |

## Required versus deferred

### Required for Phase 1 closeout (documentation)

- metadata schema reference;
- operator how-to procedures;
- boundary and gap inventory (this report);
- manual workflow evidence template;
- #2040 handoff report (Task 008).

### Deferred — requires separate authorization

- D1 `research_candidates` table and migration;
- admin research queue UI;
- automated metadata validation;
- B2 upload for external archive media;
- OCR / AI enrichment pipelines;
- public auto-publication (#2040 program);
- media/archive acquisition Phase 2 (#2073).

## Project 11 dependency

Admin Page and Tools Design Readiness must be reviewed before admin implementation
tasks are authorized. Program #1738 does not implement admin tooling.

## Gap recommendations

| Gap | Recommendation | Target program/issue |
| --- | --- | --- |
| No research candidate store | Document-first operator records; defer schema | Future task post-#1738 |
| Queue ops manual | Spreadsheet/runbook until admin UI | Project 11 or #2040 |
| Staging lacks Gehrig samples | Optional future staging fixture task | Separate issue if needed |
| Evidence collection manual | Operator fills evidence report | Task 008 |

## No-code-change verification

This task produced documentation and inventory only. No runtime, migration, or
workflow files were modified.

## Acceptance checklist

- [x] Admin/data-surface needs inventoried
- [x] Required vs deferred candidates separated
- [x] Project 11 dependency documented
- [x] No code changes occurred
