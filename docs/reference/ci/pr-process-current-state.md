---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Current PR process baseline after #2228 and #2469 closeout
Does Not Own: Canonical PR-process policy, live GitHub branch protection settings, or GitHub App settings
Canonical Reference: /docs/governance/PR_PROCESS.md
Related Issues: #2175, #2208, #2228, #2469, #2622
Last Reviewed: 2026-07-29
---

# PR Process Current State

## Purpose

Define the current implemented PR-process baseline after the July 2026 rebuild and the retirement of the #1075 orchestration path.

## Scope

This reference covers required checks, active advisory checks, manual-only workflows, post-merge ownership, and the operational effect of #2469. It does not change canonical policy or live branch-protection settings.

## Current known truth

The PR-process redesign is implemented around stable-facts PR bodies, GitHub-native reviewer state, deterministic required checks, advisory-first promotion, single-owner post-merge closeout, and routine incremental exception housekeeping. There is no active dedicated #1075 CI phase-generation engine. Controlled and operational authority documents that formerly described that engine as active are reconciled by #2469.

## Intended final state

The repository maintains this minimal deterministic PR surface, confirms live branch protection matches documented required checks, and prevents retired #1075 mechanisms or PR-body lifecycle mutation from returning without new authorization and evidence.

## Status

Current principles:

- stable-facts PR bodies only;
- GitHub-native reviewer lifecycle;
- deterministic required checks;
- advisory-first promotion;
- single-owner post-merge closeout;
- routine incremental exception housekeeping;
- no dedicated #1075 CI phase-generation engine.

## Required operator confirmation

Before merging #2469, verify live branch protection for `main` requires only:

- `quality`
- `gitleaks`

Remove retired check names if still configured.

## Required checks

| Job | Workflow |
| --- | --- |
| `quality` | `gate-quality.yml` |
| `gitleaks` | `gitleaks.yml` |

## Active advisory checks

| Job | Workflow |
| --- | --- |
| `pr-hygiene` | `gate-pr-hygiene.yml` |
| `diff-scope` | `gate-diff-scope.yml` |
| `reviewer-response-completion` | `reviewer-response-completion.yml` |

## Manual-only / rebuild later

| Workflow | Disposition |
| --- | --- |
| `gate-intent-labeler.yml` | Manual-only |
| `ops-pr-issue-accounting.yml` | Manual-only |
| `gate-drift.yml` | Manual-only |
| `gate-branch-freshness.yml` | Manual-only |
| `docs-guardrails.yml` | Manual-only |
| `design-compliance-warn.yml` | Manual-only |
| `gate-post-merge-readiness.yml` | Manual backfill only |

## Post-merge and metrics

| Workflow | Role |
| --- | --- |
| `post-merge-closeout.yml` | Single automatic closeout owner |
| `post-merge-remediation.yml` | Failure support |
| `ops-post-merge-self-healing.yml` | Scheduled/manual exception hygiene |
| `ops-pr-process-metrics.yml` | Metrics |

## #1075 retirement

#2469 removes the old scheduled phase engine, fixed state file, orphaned decomposition assets, and legacy workflow residue. Historical #1075 phase issues do not block or authorize current CI work.

The remaining exception queue is handled incrementally through routine housekeeping rather than a new large remediation program.

## Do not promote without evidence

Do not promote advisory gates to required status or restore PR-body lifecycle mutation without satisfying `/docs/governance/PR_PROCESS.md`.

## Issue-side preclearance (#2615/#2618–#2622)

`docs/reference/ci/issue-pr-contract.md` defines Issue-side validation of stable PR-open facts before a PR exists. As of #2622's pilot, this is **implemented but not required and not automatic beyond its own advisory scope**:

- `issue-pr-contract-validate.yml` (#2620) runs on the `status:pr-ready` label and posts one advisory validation comment; it never creates a branch, PR, or label not already named in `## 3`/`## 5` of the design doc, and it is **not** one of the "Required checks" or "Active advisory checks" tables above (those apply to PR-triggered gates; this is Issue-triggered).
- `CREATE_DRAFT_PR` (#2621) exists on the #2294 controller but is reachable only via explicit `workflow_dispatch`, never automatically — it does not change any PR-triggered check in this document.
- Pilot evidence (#2622): `docs/ops/reports/issue-pr-contract-pilot-evidence.md`. Promotion decision: `docs/reference/ci/issue-pr-contract-promotion-decision.md`.

No check, label, or workflow in the tables above changes as a result of this feature existing. Promoting any part of it to a required PR-side gate remains subject to `## Do not promote without evidence` and `/docs/governance/PR_PROCESS.md`.
