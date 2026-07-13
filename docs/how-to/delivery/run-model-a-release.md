---
Doc Type: How-To
Audience: Human + AI
Authority Level: Procedure
Owns: Step-by-step Model A production release from PR open through one-step rollback verification
Does Not Own: Domain policy, PMO sizing, delivery-profile parser, or agent approval authority
Canonical Reference: /docs/governance/DELIVERY-AND-RELEASE.md
Related Issues: #2495
Last Reviewed: 2026-07-13
---

# Run Model A Release

## Purpose

Execute a Model A production release: one reviewable PR targeting `main` with one-step rollback, Chat as primary approver, and Bill as alternate.

## Prerequisites

- Work classified Small or Medium Model A per `docs/governance/PMO-PORTFOLIO.md`
- Source issue records `Delivery model: A`, `Rollback profile: one-step`
- One-step rollback evidence recorded per `docs/reference/delivery/delivery-and-rollback-profiles.md`
- Launch-control package complete per `docs/templates/agent-assignment-template.md`
- Agent execution follows `docs/how-to/agents/run-model-a.md`

## Procedure

### 1. Record rollback evidence before implementation

On the source issue, record:

- `rollback_target_type` (revert-commit or deployment-restore)
- `rollback_target_ref` (commit SHA or Cloudflare deployment ID)
- `smoke_tests` checklist

### 2. Open production-candidate PR

Cursor opens or updates one PR targeting `main` with stable delivery metadata:

```text
Delivery model: A
Target environment: production
Approval profile: chat-bill-production
Gate profile: production-candidate
Rollback profile: one-step
Component branch: not-applicable
Component master: not-applicable
```

PR must satisfy the full template in `.github/pull_request_template.md`.

### 3. Run production-candidate verification

Run required local and CI checks for the PR class. Model A code paths require full production build and preview verification when applicable.

### 4. Submit for production approval

When required gates pass, Cursor marks the PR ready for review and stops. Cursor does not self-approve or merge.

### 5. Chat or Bill approves and merges

Chat reviews diff, gates, acceptance criteria, and rollback evidence. Chat approves and merges as primary. Bill acts as alternate when Chat is unavailable.

### 6. Post-merge verification

Chat confirms production behavior against acceptance criteria and smoke tests.

### 7. Execute one-step rollback if required

If regression is observed after merge:

1. Execute the documented single action (revert or deployment restore).
2. Run the recorded smoke-test checklist.
3. Open bounded fix work if stabilization requires more than one controlled action.

One-step rollback does not require a multi-step ordered package.

### 8. Close loop

Chat declares success on the source issue when criteria are met and notifies Bill for final completed-product review.

## Verification

```bash
DOCS_HEADER_FILE_LIST=docs/how-to/delivery/run-model-a-release.md ./scripts/ci/docs_check_headers.sh .
```

Expected: PASS — procedure header and `## Procedure` section present.

## Stop conditions

- PR metadata contradicts Model A branch facts (component metadata present, wrong base branch)
- Rollback evidence missing before implementation Go
- Cursor attempts self-approval or merge
- Protected stop flags in `docs/reference/agents/implementation-authority-contract.md`
