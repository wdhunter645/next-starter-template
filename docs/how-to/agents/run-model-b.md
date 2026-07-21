---
Doc Type: How-To
Audience: Human + AI
Authority Level: Procedure
Owns: Step-by-step Model B child execution on a component branch, independent integration review, post-integration task verification, and eligible child closeout
Does Not Own: Domain policy, current team mapping, auto-integration evaluator, or promotion release policy
Canonical Reference: /docs/governance/AGENT-TEAM.md
Related Issues: #2494, #2700
Last Reviewed: 2026-07-21
---

# Run Model B

## Purpose

Execute a Model B child task through durable roles: bounded Development work on a component branch, independent review or authorized integration, post-integration task verification, and eligible child closeout without routine Product Authority stops between implementation Go and final completed-product review.

Current role holders are resolved through `docs/governance/AGENT-TEAM.md` or the applicable project manifest.

## Prerequisites

- Source Issue classified Medium or Large with `Delivery model: B-child`
- Component branch and project/master Issue recorded on the child Issue and PR
- Assigned Implementation / Operations role holder recorded
- Assigned PR Approver / Engineering role holder or applicable approval profile recorded
- Issue class recorded as `project-child` or `child-remediation`
- Task-closeout delegation recorded as `delegated` or `reserved`
- Launch-control package complete per `docs/templates/agent-assignment-template.md`
- Runtime declared when the assigned role holder requires a runtime-specific policy
- Rollback plan recorded before implementation begins

## Procedure

### 1. Finalize the launch package

PMO / Engineering confirms design, allowlist, acceptance criteria, verification plan, parent/master identity, Issue class, closeout delegation, and multi-step rollback context on the child Issue.

Product Authority participates for product Go/No-Go or protected escalation only—not as a routine implementation-loop gate.

### 2. Perform pre-implementation review

The assigned Implementation / Operations role holder reads the package and posts the required checkpoint comment.

Stop if the package, allowlist, Issue class, parent/master, role assignment, or closeout delegation is missing or contradictory.

### 3. Authorize implementation Go

PMO / Engineering records implementation Go on the child Issue. An authorized alternate may act only when recorded by policy or the source Issue.

After Go, the assigned Implementation / Operations role holder does not wait for routine Product Authority approval between in-scope commits, validation fixes, or PR remediation cycles.

### 4. Implement continuously on the component branch

The assigned Implementation / Operations role holder creates or uses the assigned branch. The child PR targets `component/<release-unit>`.

The role holder may:

- edit allowlisted files;
- run required validation;
- push branch updates when authorized;
- open or update the child PR;
- remediate CI and review findings within scope; and
- prepare the task closeout evidence fields before integration.

Stop for protected conditions, scope conflict, missing authority, or an explicit hold—not for routine Product Authority approval.

### 5. Submit for integration review

When required gates pass and lifecycle preconditions are satisfied, the assigned Implementation / Operations role holder marks the PR ready for review and stops.

The implementer does not approve or merge its own protected work.

### 6. Perform independent review and integration

PR Approver / Engineering reviews the child PR under the applicable approval profile. When Delivery policy and eligibility checks pass, the child may integrate into the component branch through the authorized merge or deterministic integration path.

If the component branch enters red state after integration, halt technically dependent successor children until Implementation / Operations restores green and the required independent verification confirms recovery.

### 7. Verify the integrated task

After integration, the assigned Implementation / Operations role holder verifies:

- the expected commit or integration identity is present on the component branch;
- required post-integration checks pass;
- acceptance evidence remains valid in the integrated state;
- parent/master reporting and successor disposition are determinable; and
- no protected stop, operational hold, or closeout exception remains.

A failed or ambiguous result routes one bounded closeout exception. It does not permit closeout by inference.

### 8. Close the eligible assigned task

When `Task-closeout delegation: delegated` and all task-closeout invariants pass:

1. Deterministic CI attempts the idempotent closeout transaction first.
2. If automation succeeds, the assigned role holder does not duplicate the transaction.
3. If automation does not complete but the evidence is sufficient, the assigned Implementation / Operations role holder posts the `CLOSEOUT` packet, reconciles permitted task state, closes the assigned project-child or child-remediation Issue, and verifies the terminal state.
4. If delegation is `reserved`, or the Issue is not an eligible child class, route closeout to the designated Administration & Communications role holder.

Task closeout does not authorize project/master, program, Promotion Candidate, Production, release, incident, standalone `OPS:`, or Product Authority disposition closeout.

### 9. Continue component construction

Repeat steps 1–8 for subsequent authorized child tasks until the component Promotion Candidate package is ready.

An independent successor may proceed when its source authority and dependencies permit. A technically dependent successor remains blocked by component red state, unresolved integration evidence, collision, hold, or other recorded dependency.

### 10. Audit and close the project/master

PMO / Engineering and PR Approver / Engineering perform aggregate verification of all child dispositions and integrated acceptance evidence.

A designated Administration & Communications role holder who did not solely implement the underlying child work records and executes project/master closeout under `docs/ops/pmo/github-issue-closeout-protocol.md`.

### 11. Promote and complete final product review

Model B promotion to `main` follows `docs/how-to/delivery/run-model-b-component-release.md`.

After required Engineering verification, Production disposition, and project or program closeout, Product Authority receives final completed-product review.

## Verification

```bash
DOCS_HEADER_FILE_LIST=docs/how-to/agents/run-model-b.md ./scripts/ci/docs_check_headers.sh .
```

Expected: PASS — procedure header and `## Procedure` section present.

## Stop conditions

- Any protected-stop flag in `docs/reference/agents/implementation-authority-contract.md`
- Child PR base branch is not the assigned component branch
- Implementer attempts self-approval or self-merge
- Protected-change paths lack required independent review
- Issue class, parent/master, assigned role holder, or closeout delegation is missing or contradictory
- Post-integration verification fails or cannot determine terminal state
- Assigned task role holder attempts project/master or higher-level closeout through task delegation
