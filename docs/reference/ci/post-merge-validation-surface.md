---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Current post-merge validation, source-issue closeout, evidence, and remediation surface
Does Not Own: Pre-merge required checks, branch protection settings, or production runtime monitoring
Canonical Reference: /docs/governance/PR_PROCESS.md
Related Issues: #1197, #1500, #2175, #2208, #2380, #2469
Last Reviewed: 2026-07-12
---

# LGFC Post-Merge Validation Surface

## Purpose

Define the current post-merge validation, remediation, and source-issue closeout surface.

## Scope

This reference covers automatic closeout ownership, supporting workflows, evidence domains, failure handling, and the #1075 retirement boundary. It does not define pre-merge branch protection or production monitoring.

## Current known truth

`.github/workflows/post-merge-closeout.yml` is the sole automatic post-merge source-issue validation and closeout owner. Supporting workflows may provide remediation, documentation evidence, manual backfill, metrics, or exception housekeeping without racing the same mutation boundary.

## Intended final state

Post-merge closeout remains single-owner, evidence-driven, and idempotent. The retired #1075 phase engine cannot generate false orchestration pauses, while legitimate current failures continue to produce bounded remediation evidence.

## Current ownership

Automatic post-merge source-issue validation and reconciliation has one owner:

- `.github/workflows/post-merge-closeout.yml`

It runs for merged pull requests targeting `main`, invokes `scripts/ci/run_post_merge_closeout.mjs`, writes evidence artifacts, comments the result, and fails when current validation reports a blocking exception.

## Current workflows

| Workflow | Role |
| --- | --- |
| `post-merge-closeout.yml` | Single automatic validation and source-issue closeout owner |
| `post-merge-pr-body-closeout.yml` | Manual/backfill and active-manifest closeout only |
| `post-merge-remediation.yml` | Failure remediation support after Post-Merge Detection fails |
| `diataxis-post-merge-validate.yml` | Documentation evidence support |
| `ops-post-merge-self-healing.yml` | Scheduled/manual exception backlog hygiene |
| `post-merge-intent-verification.yml` | Inert manual compatibility marker; no validation or mutation |

#2469 removes the parked `gate-close-work-issue.yml` workflow and the previous hardcoded implementation of `post-merge-intent-verification.yml`.

## Validation boundary

Post-merge validation may inspect:

- merged PR and merge SHA;
- accepted source issue linkage;
- changed-file and implementation evidence;
- required workflow outcomes on applicable merge/head scope;
- current reviewer findings and thread state;
- documentation evidence;
- remediation requirements.

The validator must follow current `/docs/governance/PR_PROCESS.md` policy. Historical PR-body reviewer ledgers are not current authority.

## Source-issue closeout

When validation passes and no blocking remediation remains, the closeout runner may:

1. resolve the accepted source issue;
2. reconcile stale lifecycle labels;
3. add `status:complete` when available;
4. record PR, merge SHA, validator result, and closeout reason;
5. close an eligible open source issue;
6. verify terminal label integrity.

Program, umbrella, parent, roadmap, queue, and tracking boundaries remain governed by current issue/PR policy and explicit closeout decisions.

## Failure and remediation

When current validation fails:

- terminal source-issue closeout is refused;
- the source issue may be reconciled to a failure state;
- `post-merge-remediation.yml` may create or update bounded exception evidence;
- queue advancement may halt when the failure affects authorized work;
- legitimate exception issues remain available for incremental housekeeping.

Retirement of #1075 prevents obsolete CI phase issues from creating false orchestration pauses. It does not suppress legitimate current validation, security, or production failures.

## Core scripts

| Script | Role |
| --- | --- |
| `scripts/ci/run_post_merge_closeout.mjs` | Single automatic closeout runner |
| `scripts/ci/post_merge_validator.mjs` | Evidence aggregation and result contract |
| `scripts/ci/post_merge_remediation_issue.mjs` | Bounded remediation issue handling |
| `scripts/ci/post_merge_source_issue_closeout.mjs` | Source-issue closeout decisions and label reconciliation |
| `scripts/orchestrator/sync-pr-state.mjs` | Shared issue lifecycle synchronization used by the closeout runner |
| `scripts/ci/post_merge_validation_surface.mjs` | Current workflow/script surface validator |

## Verification

Validation command: `node scripts/ci/post_merge_validation_surface.mjs`.

The validator must confirm the active automatic owner and its required supporting scripts without requiring retired #1075 workflows.
