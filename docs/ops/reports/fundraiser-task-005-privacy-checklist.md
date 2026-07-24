---
Doc Type: Operations
Audience: Bill, ChatGPT, Cursor, LGFC operators, and reviewers
Authority Level: Operational Evidence
Owns: Task 005 privacy checklist proving recognition rules coverage and Task 006 handoff readiness
Does Not Own: Runtime implementation, campaign launch, or merge authority
Canonical Reference: /docs/reference/website/fundraiser-donor-sponsor-privacy-model.md
Related Issues: #1700, #1705
Last Reviewed: 2026-07-24
---

# Fundraiser Task 005 — Privacy Checklist

## Purpose

Prove Task 005 acceptance so Task 006 can implement recognition display without
inferring privacy rules.

## Scope

In scope: #1705 acceptance evidence and readiness privacy cross-check.  
Out of scope: runtime edits and live campaign publication.

## Current known truth

- Predecessors #1701–#1704 are integrated on the component branch.
- Privacy model and operator how-to are the Task 005 deliverables.

## Intended final state

Reviewers can verify consent/fields/PII prohibitions from this checklist alone.

## Deliverable map

| Artifact | Path |
| --- | --- |
| Privacy model | `docs/reference/website/fundraiser-donor-sponsor-privacy-model.md` |
| Operator how-to | `docs/how-to/website/fundraiser-donor-sponsor-privacy-operations.md` |
| This checklist | `docs/ops/reports/fundraiser-task-005-privacy-checklist.md` |

## Coverage

| Topic | Covered |
| --- | --- |
| Consent states | YES |
| Approved public fields | YES |
| Anonymous/tiered display | YES |
| Sponsor logo/link rules | YES |
| Prohibited PII list | YES |
| Takedown/correction path | YES |
| Evidence retention | YES |
| Public PII prohibited by default | YES |

## Readiness cross-check

| Readiness rule | Result |
| --- | --- |
| Default anonymous/aggregated/tiered/consent-based | PASS |
| No email/phone/address/payment/raw txn/notes | PASS |
| Sponsor logo/name require public-use approval | PASS |
| Winner uses privacy-safe label | PASS |

## Acceptance criteria trace (#1705)

| Criterion | Result |
| --- | --- |
| Recognition display rules and consent boundaries documented | PASS |
| Approved public fields, tier/logo, anonymous, prohibited PII explicit | PASS |
| Public PII exposure prohibited by default | PASS |
| Task 006 can implement without inferring privacy rules | PASS |

## Residual / deferred

| Item | Owner |
| --- | --- |
| Website display implementation | #1706 |
| Pre-launch privacy verification | #1707 |
| Program closeout | #1708 |
