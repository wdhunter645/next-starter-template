---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Unified PR preflight contract, local command routing, and GitHub evidence surfaces
Does Not Own: Branch protection settings, auto-integration enablement, or production promotion approval
Canonical Reference: /docs/reference/ci/delivery-profile-contract.md
Last Reviewed: 2026-07-13
---

# PR Preflight

Unified preflight combines delivery-profile classification, PR-class quality
planning, scope accounting, GitHub evidence availability, review/thread
assessment, source-issue accounting, and closeout prediction for Model A and
promotion PRs.

## Command

```text
npm run pr:preflight
```

## Required inputs

- `PR_PREFLIGHT_BODY_FILE` or `PR_BODY_FILE` — required PR body Markdown file
- `PR_BASE_REF` — PR base ref
- `PR_HEAD_REF` — PR head ref
- `PR_PREFLIGHT_CHANGED_FILES_FILE` or `CHANGED_FILES_FILE` — optional
  newline-delimited changed-file list

Optional GitHub-native JSON snapshots:

- `PR_PREFLIGHT_PR_JSON`
- `PR_PREFLIGHT_REVIEWS_JSON`
- `PR_PREFLIGHT_REVIEW_COMMENTS_JSON`
- `PR_PREFLIGHT_REVIEW_THREADS_JSON`
- `PR_PREFLIGHT_ISSUE_COMMENTS_JSON`
- `PR_PREFLIGHT_LABELS_JSON`
- `PR_PREFLIGHT_SOURCE_ISSUE_JSON`
- `PR_PREFLIGHT_SOURCE_ISSUE_ERROR`

Optional artifact output:

- `PR_PREFLIGHT_RESULT_JSON`

## Result contract

`evaluatePrPreflight()` returns:

```text
delivery profile
PR-class quality plan
scope result
required local commands
GitHub evidence availability
review/thread result
source issue accounting
closeout prediction for A/promotion
protected-change status
final pass/fail/block result
```

Exit codes:

- `0` — pass
- `1` — fail
- `2` — block (invalid delivery profile or missing required input)

## Quality routing

PR class continues to control verification depth. Delivery profile adds a
stricter floor:

- Model A code/release paths require full production build
- Model B promotion requires full production build
- Non-protected Model B child docs remain light
- Protected Model B child paths upgrade to full quality
- Emergency recovery keeps ops-light routing

Local and CI routing both call `classifyDeliveryProfile()` and
`determineQualityPlan()`.

## Shared evaluators

Preflight reuses pure evaluators from existing readiness/closeout scripts:

- `buildDiffScopeReport()` from `scripts/ci/diff_scope_gate.mjs`
- `sourceIssueAccounting()` from `scripts/ci/issue_accounting.mjs`
- `assessReviewerLifecycle()` from `scripts/ci/reviewer_lifecycle_gate.mjs`
- `evaluatePostMergeReadinessGate()` from `scripts/ci/post_merge_readiness_gate.mjs`

This keeps pre-merge prediction aligned with post-merge validation for the
same evidence.

## Workflow artifact

`gate-quality.yml` writes `quality_result.json` with delivery profile fields
alongside PR-class routing outputs. Lifecycle prose is not stored in PR bodies.
