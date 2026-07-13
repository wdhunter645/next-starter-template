---
Doc Type: How-To
Audience: Human + AI
Authority Level: Procedure
Owns: Step-by-step Model A agent execution from launch through Chat verification and Bill final product review
Does Not Own: Domain policy, delivery-profile parser, or merge mechanics
Canonical Reference: /docs/governance/AGENT-TEAM.md
Related Issues: #2494
Last Reviewed: 2026-07-13
---

# Run Model A

## Purpose

Execute a Small or Medium Model A change: one reviewable PR targeting production with Chat as primary reviewer/approver and Bill as alternate. No routine Bill stop points exist between implementation Go and final product review.

## Prerequisites

- Source issue classified per `docs/governance/PMO-PORTFOLIO.md`
- Stable metadata recorded: `Delivery model: A`, production target, Chat/Bill approval profile
- Launch-control package complete per `docs/templates/agent-assignment-template.md`
- Cursor runtime declared on issue (`local` default)

## Procedure

### 1. Finalize launch package

Chat confirms design, allowlist, acceptance criteria, verification plan, and rollback plan on the source issue. Bill approves when material design or documentation package review is required.

### 2. Cursor pre-implementation review

Cursor reads the package and posts a checkpoint comment documenting pass/fail per required field. Cursor stops if the package is incomplete.

### 3. Authorize implementation Go

Chat records implementation Go on the issue. Bill acts only as alternate or for protected escalation. This is the last routine human gate before PR review.

### 4. Implement and validate

Cursor edits only allowlisted files, runs required validation, and opens or updates one PR targeting `main` with stable delivery metadata and full PR template sections.

Cursor continues through routine correction without Bill stop points unless a protected stop applies.

### 5. Hand off for review

When required gates and lifecycle preconditions are satisfied, Cursor marks the PR ready for review and stops. Cursor does not self-approve or merge.

### 6. Chat review, approval, and merge

Chat inspects diff, gates, and acceptance criteria. Chat approves and merges as primary reviewer. Bill merges or approves only when Chat is unavailable or as alternate per branch protection.

### 7. Verify and close loop

Chat runs or confirms post-merge verification, declares success on the issue when criteria are met, and notifies Bill for final completed-product review.

## Verification

```bash
DOCS_HEADER_FILE_LIST=docs/how-to/agents/run-model-a.md ./scripts/ci/docs_check_headers.sh .
```

Expected: PASS — procedure header and `## Procedure` section present.

## Stop conditions

- Any protected stop flag in `docs/reference/agents/implementation-authority-contract.md`
- PR metadata contradicts Model A branch facts
- Cursor attempts self-approval or merge
