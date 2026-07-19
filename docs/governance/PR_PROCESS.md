---
Doc Type: Governance
Audience: Human + AI
Authority Level: Canonical
Owns: Pull request process policy, PR-body authority, profile-specific PR boundaries, reviewer lifecycle, and closeout ownership
Does Not Own: Product requirements, design specifications, Administration mutation taxonomy, delivery-model selection, or workflow implementation
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Supporting References:
  - /docs/reference/ci/pr-process-current-state.md
  - /docs/reference/ci/merge-protection-surface.md
  - /docs/reference/ci/pr-workflow-ci-inventory.md
  - /docs/reference/operations/administrative-control-lane-contract.md
  - /docs/reference/operations/operating-lanes-and-promotion-profiles.md
Related Issues: #2175, #2208, #2640, #2641
Last Reviewed: 2026-07-19
---

# Pull Request Process

## Purpose

This document defines the canonical LGFC pull request process.

GitHub Issues are executable task authority. Pull requests document and validate issue-scoped changes. The PR process must preserve the mandatory profile progression:

```text
Sandbox -> Development -> Promotion Candidate -> Production
```

## Core rules

1. One primary source Issue per normal PR.
2. The PR body stores stable facts only.
3. Dynamic lifecycle, checks, reviews, routing, holds, and closeout remain on GitHub-native surfaces.
4. Required gates are deterministic, necessary, and profile-appropriate.
5. Implementation / Operations does not self-approve protected work or Production promotion.
6. Deterministic CI may record automated eligibility for non-main integration; it does not impersonate PR Approver / Engineering.
7. Promotion Candidate is mandatory before Production.
8. Sandbox cannot move directly to Promotion Candidate or Production.
9. Development cannot move directly to Production.
10. Post-merge closeout is single-owner and idempotent.
11. Administration & Communications may reconcile state but does not create technical or approval authority.

## Stable PR-body facts

Every PR should include:

- primary source Issue;
- intent label and PR class;
- delivery model and promotion profile;
- target branch/environment;
- component/release identity when applicable;
- allowed paths;
- out-of-scope declaration;
- change summary;
- verification already run;
- acceptance criteria;
- rollback summary;
- follow-up Issue declaration;
- reviewer/bot attestation.

The PR body must not become a live ledger for:

- draft/review/merge state;
- current CI results;
- review thread IDs or status;
- approval state;
- queue/successor state;
- operational hold state;
- administrative exceptions;
- post-merge closeout.

## Profile-specific PR rules

### Sandbox PR

A Sandbox PR or branch transaction:

- targets an isolated Sandbox branch;
- uses scaled-down safety checks;
- may auto-integrate within the Sandbox when authorized;
- must state that it is not Production-ready;
- must not target Promotion Candidate or `main`;
- exits only through discard, evidence-only, or deliberate Development adoption.

### Development PR

A Development PR:

- targets `component/**` or another approved non-production Development branch;
- uses automated build/test/security/scope/metadata gates;
- may use automated non-main eligibility and integration when non-protected;
- routes protected/material findings to PR Approver / Engineering;
- does not require whole-feature Production approval;
- does not claim public release readiness.

### Promotion Candidate PR or qualification record

A Promotion Candidate:

- identifies an exact integrated Development SHA or equivalent immutable identity;
- introduces no unqualified feature work after candidate selection;
- carries integrated, regression, load/performance, security, rollback, readiness, gap, and standards evidence as applicable;
- records Go, No-Go, or return-to-Development disposition;
- blocks Production until approved.

### Production PR

A Production PR:

- targets `main` or the canonical Production branch;
- promotes the exact approved candidate;
- contains no unreviewed post-candidate drift;
- applies the full repository standards;
- requires the recorded Production authority and required Engineering approval;
- includes rollback and live-verification expectations.

## GitHub-native state

| State | Authoritative surface |
| --- | --- |
| PR draft/open/merged/closed | GitHub PR state |
| Validation and eligibility | Checks and workflow runs |
| Independent review | GitHub reviews and review threads |
| Task routing and profile | Source Issue, labels, assignments, structured comments |
| Candidate identity and qualification | Release Issue/PR, checks, artifacts, reports |
| Production decision | Review/merge record and recorded role authority |
| Deployment and live verification | Deployment status, checks, incident/verification evidence |
| Closeout and exceptions | Source Issue, closeout record, bounded exception Issue |

## PR classes

Current classes include:

- `code`
- `docs-governance`
- `docs-content`
- `ci`
- `config`
- `ops`
- `mixed-approved`

PR class controls verification depth but does not replace promotion profile.

## Gate policy

Required pre-merge gates must protect material invariants that are:

- machine-provable;
- attributable to the PR/candidate;
- appropriate to the current profile;
- necessary for the next transition.

Reporting lag, dashboard freshness, optional comments, cosmetic labels, session presence, and duplicated PR-body state are not independent gates.

### Development automation

Development should heavily leverage automated PR gates for quality and eligible non-main integration.

### Promotion Candidate validation

Promotion Candidate applies broader solution-level validation that may span multiple PRs and the integrated release unit.

### Production controls

Production verifies the exact candidate, full standards, approvals, environment readiness, rollback, deployment, and live health.

## Reviewer lifecycle

Reviewer state comes from GitHub-native reviews and threads.

- PR Approver / Engineering owns subjective design and repository alignment.
- Deterministic CI owns only explicit machine checks and eligibility.
- Product Authority participates when product, priority, cost, business, or protected decisions require it.
- Administration & Communications may route and report reviewer state but cannot supply the independent review.

## Closeout

Closeout rules are profile-aware:

- Development child integration may close the task without claiming project/Production completion.
- Promotion Candidate closeout records approved, returned, superseded, or stopped disposition.
- Production closeout requires deployment and live verification.
- Incident closeout requires recovery and hold-release evidence.

A successful closeout transaction must not be duplicated. Routine closeout does not block an independent Development successor.

## Minimal-gate rule

Do not add a gate to duplicate information already available from GitHub-native state.

Correct deterministic clerical defects at the earliest safe surface. Route material ambiguity or plan change to the owning role.

## External tools

External reviewers or notifications are advisory unless canonical policy explicitly promotes them. Decisions made outside GitHub must be written back before repository work depends on them.

## DIATAXIS placement

- Governance policy: this document.
- Conceptual model: `docs/explanation/operations/four-lane-four-profile-operating-model.md`.
- Stable contract: `docs/reference/operations/operating-lanes-and-promotion-profiles.md`.
- Procedure: `docs/how-to/operations/run-work-through-promotion-profiles.md`.
- Learning walkthrough: `docs/tutorials/operations/idea-to-production-feature.md`.

## Supersession

Older PR guidance is superseded where it requires dynamic PR-body lifecycle ledgers, treats Development integration as Production approval, permits direct Sandbox/Development-to-Production movement, or serializes independent work through administrative closeout.