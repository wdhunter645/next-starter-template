---
Doc Type: Report
Audience: Bill, Atlas, and implementation agents
Authority Level: Program Evidence
Owns: Deferred automation candidate inventory for Lou Gehrig content collection
Does Not Own: Automation implementation or #2040 execution
Canonical Reference: /docs/reference/ai/lou-gehrig-research-ai-guardrails.md
Related issues: #1738, #1745, #2040
Last Reviewed: 2026-07-04
---

# Lou Gehrig Automation Candidate Inventory

## Purpose

Separate automation candidates into safe-to-assist, human-controlled, and unsafe/deferred
buckets for #2040 publication automation planning.

## Safe to automate or assist (after #1738 evidence)

| Candidate | Preconditions | Owner |
| --- | --- | --- |
| Metadata completeness checks | Schema stable; human confirms failures | #2040 |
| Missing-source detection | Required fields defined | #2040 |
| Status transition validation | Review states documented | #2040 |
| Candidate table formatting | Operator template approved | #2040 |
| Evidence report generation | Trial data exists | #2040 |
| Citation format normalization | Human reviews output | #2040 |
| Duplicate flagging | Human resolves merges | #2040 |

## Keep human-controlled

| Function | Rationale |
| --- | --- |
| Source truth decisions | Legal and editorial liability |
| Rights approval | Copyright and license risk |
| Privacy approval | GDPR/member/donor sensitivity |
| Final public-copy approval | Brand and factual standards |
| Publication approval | Public surface impact |
| Rejection decisions | Accountability |
| Escalation on ambiguous rights | Bill/Atlas authority |

## Unsafe or deferred

| Candidate | Status | Notes |
| --- | --- | --- |
| Uncontrolled scraping | blocked | Not authorized by #1738 |
| OCR at scale | deferred | Phase 2 / separate program |
| AI enrichment at scale | deferred | Guardrails only in #1738 |
| Automatic public publication | blocked until #2040 | Requires #1738 handoff |
| AI-generated factual claims without verification | blocked | Guardrail violation |
| External source monitoring | deferred | Ops and rights risk |
| Bulk D1 ingestion | deferred | Schema not authorized |
| Social media ingestion | blocked | Disallowed category |

## AI guardrails checklist

- [x] AI not source authority documented
- [x] Evidence preservation documented
- [x] Human review gates documented
- [x] Prohibited uses listed
- [x] Deferred automation list complete

## Follow-up issues (not created by Cursor)

| Topic | Suggested owner |
| --- | --- |
| #2040 publication automation | Program #2040 task chain |
| Media/archive acquisition | Program #2073 Phase 2 |
| Admin research queue UI | Project 11 dependency |

## Acceptance checklist

- [x] AI guardrails cross-referenced
- [x] Evidence-preservation requirements documented
- [x] Human-review requirements documented
- [x] Automation candidates separated into deferred follow-up scope
