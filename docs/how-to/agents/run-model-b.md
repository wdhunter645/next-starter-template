---
Doc Type: How-To
Audience: Human + AI
Authority Level: Procedure
Owns: Step-by-step Model B child execution on a component branch without routine Bill implementation-loop gates
Does Not Own: Domain policy, auto-integration evaluator, or promotion release policy
Canonical Reference: /docs/governance/AGENT-TEAM.md
Related Issues: #2494
Last Reviewed: 2026-07-13
---

# Run Model B

## Purpose

Execute a Model B child task: bounded implementation into a component branch with Chat as primary reviewer/approver, eligible auto-integration when policy allows, and **no routine Bill stop points** between implementation Go and final completed-product review.

## Prerequisites

- Source issue classified Medium or Large with `Delivery model: B-child`
- Component branch and master issue recorded on issue and PR
- Launch-control package complete per `docs/templates/agent-assignment-template.md`
- Cursor runtime declared on issue (`local` default)
- Rollback plan recorded before implementation begins

## Procedure

### 1. Finalize launch package

Chat confirms design, allowlist, acceptance criteria, verification plan, and multi-step rollback context on the child issue. Bill participates for design go/no-go or protected escalation only—not as a routine implementation-loop gate.

### 2. Cursor pre-implementation review

Cursor reads the package and posts a checkpoint comment. Cursor stops if the package is incomplete or allowlist is missing.

### 3. Authorize implementation Go

Chat records implementation Go on the child issue. Bill is alternate only. After Go, Cursor does **not** wait for Bill between routine implementation commits, validation fixes, or PR remediation cycles.

### 4. Implement continuously on component branch

Cursor creates or uses the assigned branch. Child PR targets `component/<release-unit>` (for example `component/delivery-system-v1`).

Cursor may:

- edit allowlisted files;
- run required validation;
- push branch updates when the issue instructs;
- open or update the child PR;
- remediate CI and review findings within scope.

Cursor must stop for protected conditions, scope conflict, or explicit Chat/Bill hold—not for routine Bill approval.

### 5. Submit for integration review

When required gates pass and lifecycle preconditions are satisfied, Cursor marks the PR ready for review and stops. Cursor does not approve or merge its own work.

### 6. Chat review and integration

Chat reviews the child PR as primary approver. When delivery policy and eligibility checks pass, the child may auto-integrate into the component branch. Protected changes pause for Chat review per approval profile.

Bill approves or merges only as alternate when Chat is unavailable or branch protection requires it.

### 7. Continue component program

Repeat steps 1–6 for subsequent child tasks until the component promotion package is ready. Bill is not a routine gate between child integrations.

### 8. Promotion and final product review

Model B promotion to `main` follows the delivery-system promotion procedure (Task 5+). After Chat verifies promotion and declares program success, Bill receives final completed-product review.

## Verification

```bash
DOCS_HEADER_FILE_LIST=docs/how-to/agents/run-model-b.md ./scripts/ci/docs_check_headers.sh .
```

Expected: PASS — procedure header and `## Procedure` section present.

## Stop conditions

- Any protected stop flag in `docs/reference/agents/implementation-authority-contract.md`
- Child PR base branch is not the assigned component branch
- Cursor attempts self-approval or merge
- Protected-change paths require Chat review and auto-integration is blocked
