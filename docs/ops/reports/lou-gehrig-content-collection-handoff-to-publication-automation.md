---
Doc Type: Report
Audience: Bill, ChatGPT, LGFC maintainers
Authority Level: Program Evidence
Owns: Program #1738 validation, operator handoff, and #2040 readiness recommendation
Does Not Own: #2040 execution, program issue closure, or merge authority
Canonical Reference: /docs/ops/implementation-plans/lou-gehrig-content-collection-expansion.md
Related issues: #1738, #1746, #2040, #1739, #1740, #1741, #1742, #1743, #1744, #1745
Last Reviewed: 2026-07-04
---

# Lou Gehrig Content Collection Handoff to Publication Automation

## Purpose

Consolidate Program #1738 evidence and determine whether Program #2040 (Website
Automatic Content Publication Capability) is ready for design/implementation launch.

## Program #1738 task disposition

| Task | Issue | Deliverable | Status |
| --- | ---: | --- | --- |
| 001 Source inventory | #1739 | Source category inventory reference | PR submitted |
| 002 Research queue | #1740 | Queue/triage reference and how-to | PR submitted |
| 003 Provenance model | #1741 | Metadata schema and provenance model | PR submitted |
| 004 Rights review | #1742 | Provenance how-to and rights model | PR submitted |
| 005 Editorial conversion | #1743 | Intake how-to and editorial workflow | PR submitted |
| 006 Admin boundary | #1744 | Data surface boundary and gap report | PR submitted |
| 007 AI guardrails | #1745 | AI guardrails and automation inventory | PR submitted |
| 008 Program handoff | #1746 | This report and evidence template | PR submitted |

Disposition assumes Tasks 001–007 PRs merge in sequence. Reconcile if merge order differs.

## Evidence package summary

Phase 1 delivered:

- approved/disallowed source category inventory;
- human-operated research queue and triage model;
- metadata schema with review states;
- provenance, rights, privacy, and publication review procedures;
- manual intake and editorial conversion workflow;
- admin/data-surface gap inventory (documentation-only);
- AI guardrails and deferred automation inventory;
- manual workflow evidence template for operator trials.

## Deferred implementation tasks

| Item | Program/issue |
| --- | --- |
| D1 research candidate schema | Future task; Project 11 alignment |
| Admin research queue UI | Project 11 / post-#1738 |
| Publication automation | #2040 task chain |
| Media/archive acquisition | #2073 Phase 2 |
| OCR / bulk enrichment | Not authorized |

## Automation-safe slices (for #2040 planning)

After operator trials populate evidence report:

- metadata completeness validation;
- missing-source detection;
- review state transition checks;
- evidence report formatting;
- citation normalization (human-reviewed).

## Unsafe slices (remain blocked)

- autonomous scraping or monitoring;
- AI as source authority;
- automatic public publication without human gates;
- bulk copyrighted ingestion;
- social media harvesting.

## #2040 readiness recommendation

**Initial recommendation: ready with exceptions**

Rationale:

- Documentation pipeline for manual workflow is complete pending PR merge.
- Operator trials must populate `lou-gehrig-content-manual-workflow-evidence.md`
  before #2040 Task #2049 evidence review.
- No runtime automation should begin until Bill/ChatGPT accept handoff after trials.

Bill/ChatGPT final decision: _(pending review)_

## Operator handoff checklist

- [ ] Tasks 001–007 PRs merged
- [ ] Operator completes at least one manual trial cycle
- [ ] Evidence report trial tables populated
- [ ] Rejection reason patterns documented
- [ ] Pain points recorded
- [ ] Bill/ChatGPT accept #2040 launch or defer

## Program closeout note

Program issue #1738 remains **open** as PROGRAM umbrella. Do not close #1738
unless Bill/ChatGPT explicitly authorize program closeout after Task 008 acceptance.

## Acceptance checklist

- [x] Evidence package consolidated
- [x] Deferred tasks listed
- [x] Operator handoff checklist provided
- [x] Program closeout recommendation ready for Bill/ChatGPT review
