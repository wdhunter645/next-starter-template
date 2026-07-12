---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Current PR-workflow CI inventory and active/retired classification
Does Not Own: Canonical PR-process policy, branch protection settings, production deployment, or non-PR operations
Canonical Reference: /docs/governance/PR_PROCESS.md
Related Issues: #2175, #2208, #2469
Last Reviewed: 2026-07-12
---

# PR Workflow CI Inventory

## Current required surface

| Workflow | Job | Classification |
| --- | --- | --- |
| `gate-quality.yml` | `quality` | Required deterministic blocker |
| `gitleaks.yml` | `gitleaks` | Required deterministic blocker |

## Active advisory surface

| Workflow | Job | Classification |
| --- | --- | --- |
| `gate-pr-hygiene.yml` | `pr-hygiene` | Advisory |
| `gate-diff-scope.yml` | `diff-scope` | Advisory |
| `reviewer-response-completion.yml` | `reviewer-response-completion` | Advisory |

## Manual-only or paused

| Workflow | Disposition |
| --- | --- |
| `gate-intent-labeler.yml` | Manual-only |
| `ops-pr-issue-accounting.yml` | Manual-only |
| `gate-drift.yml` | Manual-only |
| `gate-branch-freshness.yml` | Manual-only |
| `docs-guardrails.yml` | Manual-only |
| `design-compliance-warn.yml` | Manual-only |
| `gate-post-merge-readiness.yml` | Manual backfill only |

These workflows must not be required while manual-only.

## Post-merge PR workflow

| Workflow | Role |
| --- | --- |
| `post-merge-closeout.yml` | Single automatic source-issue closeout owner |
| `post-merge-remediation.yml` | Failure support |
| `ops-post-merge-self-healing.yml` | Scheduled/manual exception hygiene |
| `diataxis-post-merge-validate.yml` | Documentation validation support |
| `ops-pr-process-metrics.yml` | Metrics |

## Retired in #2469

The following legacy PR/CI assets are removed and must not be treated as active:

- `ci-orchestration-engine.yml`
- `gate-reviewer-response.yml`
- `gate-close-work-issue.yml`
- `post-merge-intent-verification.yml`
- parked legacy `ci.yml`
- parked legacy `deploy.yml`
- parked legacy `deploy-dev.yml`
- parked legacy `deploy-prod.yml`
- parked legacy `lgfc-validate.yml`
- parked legacy `test.yml`
- parked legacy `test-homepage.yml`

The fixed #1075 state file and scripts are also removed. No workflow may recreate `lgfc-ci-phase:*` issues.

## Non-PR operations

Production deployment, Cloudflare, D1/B2, site audits, snapshots, and other scheduled operational workflows are outside this PR inventory unless they directly participate in PR readiness or source-issue closeout.

## Promotion rule

A check may become required only after deterministic implementation, advisory observation, branch-protection alignment, and current-state documentation updates.
