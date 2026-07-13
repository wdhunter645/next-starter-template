---
Doc Type: How-To
Audience: Human + AI
Authority Level: Procedure
Owns: Step-by-step Model B child integration and promotion release with multi-step rollback evidence
Does Not Own: Domain policy, auto-integration evaluator implementation, PMO sizing, or agent role contracts
Canonical Reference: /docs/governance/DELIVERY-AND-RELEASE.md
Related Issues: #2495
Last Reviewed: 2026-07-13
---

# Run Model B Component Release

## Purpose

Execute Model B component construction and promotion: bounded child PRs into a component branch, integrated testing, multi-step rollback design, and one controlled promotion PR to `main`.

## Prerequisites

- Work classified Medium or Large Model B per `docs/governance/PMO-PORTFOLIO.md`
- Component branch and master issue recorded on child and promotion issues
- Multi-step rollback context recorded before child implementation begins
- Launch-control package complete per `docs/templates/agent-assignment-template.md`
- Agent execution follows `docs/how-to/agents/run-model-b.md`

## Procedure

### Phase 1 — Child integration

#### 1. Record child-scope rollback evidence

Before each child implementation Go, record increment-specific rollback steps on the child issue per `docs/reference/delivery/delivery-and-rollback-profiles.md`.

#### 2. Implement on component branch

Cursor creates or uses `cursor/<issue>-<task>-2e48` and opens a child PR targeting `component/<release-unit>`.

Stable child PR metadata:

```text
Delivery model: B-child
Target environment: component
Gate profile: component-child
Rollback profile: multi-step
Component branch: component/<release-unit>
Component master: #<program-issue>
```

#### 3. Run component-child verification

Run required technical checks for the PR class. Child PRs do not require production closeout prediction or final Operations documentation.

#### 4. Submit for integration review

Cursor marks the PR ready for review and stops. Cursor does not self-approve or merge.

#### 5. Chat reviews and integration proceeds

Chat reviews as primary approver. When eligibility checks pass and no protected-change block applies, the child may auto-integrate into the component branch.

If the component branch enters **red** state after integration, halt successor children until Cursor restores **green** with Chat verification.

#### 6. Repeat for each child task

Continue child cycles until all intended increments are integrated.

### Phase 2 — Synchronization

#### 7. Synchronize component branch with main

Before promotion:

```bash
git checkout component/<release-unit>
git fetch origin main
git merge origin/main
```

Resolve conflicts per Chat direction. Re-run integrated release-candidate tests. Record synchronized `main` SHA on the promotion issue.

### Phase 3 — Promotion

#### 8. Finalize promotion rollback package

Complete the full multi-step rollback package on the promotion issue. Set `package_finalized_before_promotion: yes` before opening the promotion PR.

#### 9. Open promotion PR

Open one promotion PR from `component/<release-unit>` to `main` with **no new feature implementation**.

Stable promotion metadata:

```text
Delivery model: B-promotion
Target environment: production
Approval profile: chat-bill-production
Gate profile: component-promotion
Rollback profile: multi-step
Component branch: component/<release-unit>
Component master: #<program-issue>
```

#### 10. Run promotion verification

Full production-candidate gates apply. Confirm integrated evidence, documentation closeout, and rollback package completeness.

#### 11. Chat or Bill approves promotion

Chat approves and merges as primary. Bill is alternate.

#### 12. Post-promotion verification and rollback readiness

Chat verifies production behavior. If rollback is required, execute the ordered multi-step package — not a single undocumented revert.

#### 13. Close program loop

Chat declares program success and notifies Bill for final completed-product review.

## Verification

```bash
DOCS_HEADER_FILE_LIST=docs/how-to/delivery/run-model-b-component-release.md ./scripts/ci/docs_check_headers.sh .
```

Expected: PASS — procedure header and `## Procedure` section present.

## Stop conditions

- Child PR base is not the assigned component branch
- Component red state with successors still dispatching
- Promotion PR opens before rollback package finalized
- Promotion PR contains new feature implementation
- Cursor attempts self-approval or merge
- Protected-change child without Chat review
