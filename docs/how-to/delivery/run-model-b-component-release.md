---
Doc Type: How-To
Audience: Human + AI
Authority Level: Procedure
Owns: Step-by-step Model B child integration, delegated task closeout, project/master audit, and promotion release with multi-step rollback evidence
Does Not Own: Domain policy, current team mapping, auto-integration evaluator implementation, PMO sizing, or agent role contracts
Canonical Reference: /docs/governance/DELIVERY-AND-RELEASE.md
Related Issues: #2495, #2700
Last Reviewed: 2026-07-21
---

# Run Model B Component Release

## Purpose

Execute Model B component construction and promotion through durable roles: bounded child PRs into a component branch, independent integration review, post-integration task closeout, integrated testing, multi-step rollback design, independent project/master audit, and one controlled promotion PR to `main`.

Current role holders are resolved through `docs/governance/AGENT-TEAM.md` or the applicable project manifest.

## Prerequisites

- Work classified Medium or Large Model B per `docs/governance/PMO-PORTFOLIO.md`
- Component branch and project/master Issue recorded on child and promotion Issues
- Assigned Implementation / Operations and PR Approver / Engineering role holders recorded
- Child Issue class and task-closeout delegation recorded
- Multi-step rollback context recorded before child implementation begins
- Launch-control package complete per `docs/templates/agent-assignment-template.md`
- Child execution follows `docs/how-to/agents/run-model-b.md`

## Procedure

### Phase 1 — Child integration and closeout

#### 1. Record child-scope rollback evidence

Before each child implementation Go, record increment-specific rollback steps on the child Issue per `docs/reference/delivery/delivery-and-rollback-profiles.md`.

#### 2. Implement on the component branch

The assigned Implementation / Operations role holder creates or uses the assigned task branch and opens a child PR targeting `component/<release-unit>`.

Stable child PR metadata:

```text
Delivery model: B-child
Target environment: component
Gate profile: component-child
Rollback profile: multi-step
Component branch: component/<release-unit>
Component master: #<project-master>
Issue class: project-child | child-remediation
Task-closeout delegation: delegated | reserved
Assigned Implementation / Operations role holder: <member-or-system>
Assigned PR Approver / Engineering role holder: <member-or-system>
```

#### 3. Run component-child verification

Run required technical checks for the PR class. Child PRs do not require Production closeout prediction or final Operations documentation.

#### 4. Submit for independent integration review

The assigned Implementation / Operations role holder marks the PR ready for review and stops. The implementer does not self-approve or self-merge.

#### 5. Review and integrate

PR Approver / Engineering reviews under the applicable approval profile. When eligibility checks pass and no protected-change block applies, the child may integrate into the component branch through the authorized merge or deterministic integration path.

If the component branch enters red state after integration, halt technically dependent successor children until Implementation / Operations restores green and required independent verification confirms recovery.

#### 6. Verify integrated child state

The assigned Implementation / Operations role holder verifies the exact integration identity, required checks, integrated acceptance evidence, parent reporting, successor disposition, and absence of protected stops or operational holds.

Failed or ambiguous evidence routes one bounded closeout exception.

#### 7. Close the eligible child task

When task-closeout delegation is `delegated` and all invariants pass:

1. Deterministic CI attempts the idempotent closeout transaction first.
2. If automation does not complete, the assigned Implementation / Operations role holder posts the required closeout packet, reconciles permitted task state, closes the assigned project-child or child-remediation Issue, and verifies the final state.
3. If delegation is `reserved`, route the transaction to the designated Administration & Communications role holder.

Child closeout does not assert project, Promotion Candidate, Production, or program completion.

#### 8. Repeat for each child task

Continue authorized child cycles until all intended increments are integrated and dispositioned.

### Phase 2 — Project/master audit and synchronization

#### 9. Audit project/master completion

PMO / Engineering identifies the complete planned child set and acceptance criteria. PR Approver / Engineering independently verifies child approval and integrated evidence.

A designated Administration & Communications role holder who did not solely implement the child work reconciles child terminal states, deferred or superseded scope, unresolved gaps, project acceptance, Promotion Candidate readiness, and reporting.

The project/master remains open until this aggregate audit passes.

#### 10. Synchronize the component branch with main

Before promotion:

```bash
git checkout component/<release-unit>
git fetch origin main
git merge origin/main
```

Resolve conflicts under PMO / Engineering and PR Approver / Engineering direction. Re-run integrated release-candidate tests. Record the synchronized `main` SHA on the promotion Issue.

### Phase 3 — Promotion

#### 11. Finalize the promotion rollback package

Complete the full multi-step rollback package on the promotion Issue. Set `package_finalized_before_promotion: yes` before opening the promotion PR.

#### 12. Open the promotion PR

Open one promotion PR from `component/<release-unit>` to `main` with no new feature implementation.

Stable promotion metadata:

```text
Delivery model: B-promotion
Target environment: production
Approval profile: <applicable-production-profile>
Gate profile: component-promotion
Rollback profile: multi-step
Component branch: component/<release-unit>
Component master: #<project-master>
```

#### 13. Run Promotion Candidate verification

Full Production-candidate gates apply. Confirm integrated evidence, documentation closeout, standards reconciliation, and rollback-package completeness.

#### 14. Approve and merge promotion

The authorized PR Approver / Engineering role holder and any additional roles required by the approval profile approve promotion. The authorized merge role performs the controlled merge.

The Implementation / Operations role holder that implemented child scope does not self-approve protected promotion work.

#### 15. Perform post-promotion verification

The required Engineering and Day-2 roles verify Production behavior, deployment identity, health, and rollback readiness. If rollback is required, execute the ordered multi-step package—not a single undocumented revert.

#### 16. Close project, program, and Production loops

- The designated Administration & Communications role holder executes project/master closeout after PMO / Engineering and independent PR Approver / Engineering aggregate verification.
- Program or umbrella closeout requires recorded Product Authority and PMO / Engineering authority.
- Production closeout requires recorded Production authority, Engineering approval, live verification, rollback disposition, and Day-2 transfer.
- Product Authority receives final completed-product review at the applicable project or program completion point.

## Verification

```bash
DOCS_HEADER_FILE_LIST=docs/how-to/delivery/run-model-b-component-release.md ./scripts/ci/docs_check_headers.sh .
```

Expected: PASS — procedure header and `## Procedure` section present.

## Stop conditions

- Child PR base is not the assigned component branch
- Component red state with technically dependent successors still dispatching
- Implementer attempts self-approval or self-merge
- Issue class, assigned roles, parent/master, or closeout delegation is missing or contradictory
- Child closeout is attempted before required integration and post-integration evidence exists
- Project/master closeout is attempted without independent aggregate verification
- Promotion PR opens before rollback package is finalized
- Promotion PR contains new feature implementation
- Protected-change child lacks required independent review
