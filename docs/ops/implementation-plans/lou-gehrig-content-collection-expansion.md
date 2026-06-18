---
Doc Type: Implementation Plan
Audience: Bill, Atlas, Cursor, LGFC maintainers, implementation agents, and reviewers
Authority Level: Operational Plan
Owns: Cursor task sequence, child-project boundaries, validation model, file-area expectations, and closeout rules for Lou Gehrig Content Collection / Research Pipeline Expansion
Does Not Own: Runtime implementation before task issues, issue creation before launch authorization, merge authority, bulk ingestion, OCR implementation, external monitoring implementation, AI enrichment implementation, publication rights decisions
Status: planning-ready
Project: lou-gehrig-content-collection-expansion
Owner: Atlas
Execution Mode: cursor-after-launch-authorization
Source Issue: 1736
Related Program Issue: #1738
Canonical Reference: /docs/ops/pmo/lou-gehrig-content-collection-expansion-readiness.md
Related Issues: #1736, #1738, #1255, #1256, #1685, #1690, #1693, #1379
Last Reviewed: 2026-06-17
---

# Lou Gehrig Content Collection / Research Pipeline Expansion Implementation Plan

> This program is BLOCKED from execution until Atlas/Bill explicitly launch it. Planning, review, and documentation discussion may continue, but Cursor may not execute implementation work from this program until Bill/Atlas explicitly launch it.

## Purpose

Define the future Cursor implementation sequence for **Lou Gehrig Content Collection / Research Pipeline Expansion**.

This plan turns the remaining project 12 scope into bounded tasks so LGFC can build a durable content supply chain for the website without confusing normal editorial intake, large-scale research collection, AI-assisted enrichment, copyright review, and public publishing.

## Scope

This plan covers:

- source discovery and intake rules;
- research queue and triage workflow;
- source/credit/provenance model;
- rights/copyright/privacy review gates;
- editorial conversion into website-ready content;
- admin/data-surface boundary review;
- AI-assisted research guardrails;
- testing, evidence, and operator handoff.

This plan does not authorize this documentation PR to change application code, workflows, migrations, route files, package files, issue labels, issue states, external crawler services, OCR tooling, AI enrichment systems, or public website content.

## Current known truth

- Normal editorial intake/source-credit workflow is partially absorbed into Priority #1.
- This program covers larger-scale collection/research expansion beyond current website content operations.
- Program #1255/#1259 remains active and ahead.
- Project 11 Admin Page and Tools Design Readiness should be reviewed before this program executes admin/tooling work.
- Human editorial review remains mandatory.
- Rights/copyright/privacy status must be captured before public publication.
- AI assistance, if later used, must preserve source evidence and cannot replace human review.

## Proposed task sequence

| Task | Title | Objective | Allowed files / areas | Verification | Predecessor | Successor |
| --- | --- | --- | --- | --- | --- | --- |
| 001 | Source discovery and intake inventory | Define approved source types, intake channels, evidence fields, and manual intake workflow. | `docs/reference/website/**`, `docs/how-to/website/**`, `docs/ops/reports/**` | Docs/header checks; source inventory checklist | Launch authorization | 002 |
| 002 | Research queue and triage workflow | Define how candidate items enter a queue, are prioritized, assigned, deferred, rejected, or promoted. | `docs/reference/website/**`, `docs/how-to/website/**`, `docs/ops/reports/**` | Docs/how-to checks; queue-state checklist | 001 | 003 |
| 003 | Source, credit, citation, and provenance model | Define required source metadata, credit display needs, citation fields, contributor/researcher records, and evidence retention. | `docs/reference/website/**`, `docs/reference/design/**`, `docs/ops/reports/**` | Docs checks; provenance checklist | 001 and 002 | 004 |
| 004 | Rights, copyright, privacy, and publication review model | Define clearance states, public-domain review, privacy review, excerpt/summary treatment, and no-publish conditions. | `docs/reference/website/**`, `docs/how-to/website/**`, `docs/ops/reports/**` | Rights/privacy checklist | 003 | 005 |
| 005 | Editorial conversion and website-ready content workflow | Define how reviewed research becomes website-ready biography, timeline, media, gallery, library, or article content. | `docs/reference/website/**`, `docs/how-to/website/**`, `docs/ops/reports/**`; read-only `src/**` if route mapping is needed | Docs checks; content conversion checklist | 002 through 004 | 006 |
| 006 | Admin/data-surface boundary and implementation gap review | Identify whether admin tools, D1/B2 data surfaces, forms, or review states are needed; defer build decisions to proper future tasks. | `docs/reference/architecture/**`, `docs/reference/website/**`, `docs/ops/reports/**`; read-only `src/**`, `functions/**`, `migrations/**` | Inventory report; no code-change verification | 001 through 005 | 007 |
| 007 | AI-assisted research guardrails and automation candidate review | Define if and how AI can assist source discovery, summarization, deduplication, OCR review, or enrichment without bypassing evidence/human review. | `docs/reference/website/**`, `docs/reference/ai/**`, `docs/ops/reports/**` | AI guardrails checklist; deferred automation list | 001 through 006 | 008 |
| 008 | Program validation and operator handoff | Consolidate evidence, publish operator handoff, identify deferred implementation tasks, and prepare Bill/Atlas acceptance packet. | `docs/ops/reports/**`, scoped `docs/ops/pmo/**`, scoped `docs/ops/implementation-plans/**` | Docs checks; closeout checklist | 001 through 007 | terminal |

## Dependency map

| Task | Predecessor | Successor | Stage-before-merge | Halt condition | Resume condition |
| --- | --- | --- | --- | --- | --- |
| 001 | launch authorization | 002 | yes | Launch not authorized | Bill/Atlas launch source issue exists |
| 002 | 001 | 003 | yes | Source intake fields unresolved | Task 001 merged |
| 003 | 001 and 002 | 004 | yes | Queue states or evidence fields unresolved | Tasks 001–002 merged |
| 004 | 003 | 005 | yes | Rights/privacy review states unresolved | Task 004 merged |
| 005 | 002 through 004 | 006 | yes | Editorial conversion rules unresolved | Task 005 merged |
| 006 | 001 through 005 | 007 | yes | Admin/data-surface dependencies unclear | Task 006 merged |
| 007 | 001 through 006 | 008 | yes | AI guardrails incomplete | Task 007 merged |
| 008 | 001 through 007 | terminal | yes | Evidence package incomplete | Tasks 001–007 merged or explicitly deferred |

## Validation model

Each implementation PR must run checks relevant to changed files and record exact outcomes in the PR body.

Expected validation categories:

- documentation header checks for docs changes;
- docs/how-to checks for operator workflows;
- rights/privacy checklist for publication-related docs;
- source/provenance checklist for collection-model docs;
- AI guardrail checklist for AI-assisted research docs;
- inventory-only verification when implementation files are read-only;
- no ZIP file in repo root;
- one source issue line in the PR body;
- exact file-touch allowlist alignment.

## Launch gate

This plan becomes executable only when Bill/Atlas create or update a program issue with explicit launch authorization.

Launch authorization must identify program issue number, first task source issue, Cursor as implementation agent, issue-creation authority, task sequencing mode, and Cursor stop condition.

Default stop condition: GitHub `READY FOR REVIEW`.

## Closeout rules

- Cursor does not approve PRs.
- Cursor does not merge PRs.
- Cursor does not close, reopen, or relabel GitHub issues unless a source issue explicitly grants that authority.
- Atlas does not self-approve Atlas-authored PRs.
- Source issue closeout occurs only after merge verification and clean post-merge validator state.
- Program closeout requires Task 008 evidence and explicit Bill/Atlas acceptance.

## Readiness conclusion

This implementation plan is sufficient for future Cursor task issue creation after explicit launch authorization.

Status: `planning-ready`.

Execution: blocked until Bill/Atlas launch the program.
