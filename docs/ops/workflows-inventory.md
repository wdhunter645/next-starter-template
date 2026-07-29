---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Operator-facing GitHub Actions inventory routing and current workflow disposition summary
Does Not Own: CI domain policy, merge-protection settings, workflow YAML implementation, or competing check classification
Canonical Reference: /docs/governance/CI-AND-VERIFICATION.md
Related Issues: #2769, #2469, #2175, #2208
Last Reviewed: 2026-07-22
---

# GitHub Actions Workflows Inventory

## Authority

This file is an **operator inventory**. It does not own CI policy.

Resolve conflicts in this order:

1. `docs/governance/CI-AND-VERIFICATION.md` — CI and Verification Domain Policy
2. `docs/governance/PR_PROCESS.md` — PR process procedure
3. Supporting CI references:
   - `.github/CI_GUARDRAILS_MAP.md`
   - `docs/reference/ci/merge-protection-surface.md`
   - `docs/reference/ci/pr-process-current-state.md`
   - `docs/reference/ci/pr-workflow-ci-inventory.md`
   - `docs/reference/ci/lgfc-ci-workflow-classification-matrix.md`
   - `docs/reference/ci/pr-process-rebuild-retired-assets.md`

Historical February 2026 GATE/OPS redesign text formerly in this file is superseded. Do not restore required-check lists, ZIP-gate filenames, or “add every GATE to branch protection” guidance from that era.

## Current known truth (main)

Live repository ruleset `Main` requires exactly these deterministic checks:

| Job id | Workflow file | Workflow name |
| --- | --- | --- |
| `quality` | `gate-quality.yml` | `GATE — Quality Checks` |
| `gitleaks` | `gitleaks.yml` | `GATE — Secret Scan` |

Do **not** configure as required:

- advisory checks (`pr-hygiene`, `diff-scope`, `reviewer-response-completion`)
- manual-only / paused gates (including `pr-issue-accounting`, drift, intent labeler, docs guardrails, design-compliance warn, post-merge-readiness)
- OPS, post-merge, orchestrator, bridge, PMO, or one-shot workflows
- retired #1075 names

Promotion of any advisory or manual-only check to required status requires evidence and ruleset alignment per `docs/governance/PR_PROCESS.md` and `docs/governance/CI-AND-VERIFICATION.md`.

## Architecture summary

Current CI separates:

- **Required merge safety** — `quality`, `gitleaks`
- **Advisory PR hygiene** — stable PR-body, diff-scope, reviewer lifecycle signals
- **Manual-only / paused** — stubs awaiting justified rebuild
- **Single-owner post-merge closeout** — `post-merge-closeout.yml`
- **OPS / platform / delivery automation** — scheduled, push-main, dispatch, or non-main profiles
- **Retired #1075 phase engine** — absent; do not restore

OPS and support workflows must not become merge blockers for `main`.

## Required merge protection

| File | Name | Triggers | Jobs | Class |
| --- | --- | --- | --- | --- |
| `gate-quality.yml` | GATE — Quality Checks | `pull_request`, `push`, `workflow_dispatch` | `quality` | Required |
| `gitleaks.yml` | GATE — Secret Scan | `pull_request`, `push`, `workflow_dispatch` | `gitleaks` | Required |

## Active advisory PR checks

| File | Name | Triggers | Jobs | Class |
| --- | --- | --- | --- | --- |
| `gate-pr-hygiene.yml` | GATE — PR Hygiene | `pull_request`, `workflow_dispatch` | `pr-hygiene` | Advisory |
| `gate-diff-scope.yml` | GATE — Diff Scope | `pull_request`, `workflow_dispatch` | `diff-scope` | Advisory |
| `reviewer-response-completion.yml` | GATE — Reviewer Response Completion | `pull_request`, `pull_request_review`, `workflow_dispatch` | `reviewer-response-completion` | Advisory |

## Manual-only / paused

These are `workflow_dispatch` only (or manual backfill). They are **not** merge blockers.

| File | Name | Jobs | Disposition |
| --- | --- | --- | --- |
| `gate-intent-labeler.yml` | GATE — Intent Labeler | `label-intent` | Defer / rebuild only if justified |
| `ops-pr-issue-accounting.yml` | GATE — PR Issue Accounting | `pr-issue-accounting` | Defer / rebuild only if justified (filename is `ops-*`; display name still GATE) |
| `gate-drift.yml` | GATE — Drift Control | `drift-gate` | Defer / rebuild only if justified |
| `gate-branch-freshness.yml` | GATE — Branch Freshness | `branch-freshness` | Defer |
| `docs-guardrails.yml` | Docs Guardrails | `docs_guardrails` | Defer |
| `design-compliance-warn.yml` | Design Compliance (Warn) | `design_compliance_warn` | Defer |
| `gate-post-merge-readiness.yml` | GATE — Post-Merge Readiness | `post-merge-readiness` | Manual backfill only; do not restore auto PR triggers |
| `post-merge-intent-verification.yml` | Post-Merge Maintainer Body Apply (Retired) | `retired` | Compatibility marker; read-only / no mutation |
| `pr-triage-zip-taint.yml` | PR Triage - ZIP Taint Classification | `triage` | Manual triage remnant |
| `preview-invariants.yml` | Preview Invariants (Cloudflare Pages) | `preview_invariants` | Manual preview checks |
| `lgfc-d1-migrate.yml` | LGFC D1 Migrate (remote) | `migrate` | Manual remote migrate |
| `ai_review.yml` | AI Code Review | `review` | Manual AI review |
| `ops-cf-pages-retry.yml` | OPS — Cloudflare Pages Auto-Retry | `retry-on-internal-error` | Manual retry |
| `ops-agent-doctrine-issue-closeout.yml` | OPS — Agent Doctrine Issue Closeout | `close-issues` | Manual closeout helper |
| `purge-zip-history.yml` | Purge ZIPs from Git History (FORCE PUSH) | `purge` | Dangerous manual history rewrite — keep gated |
| `repository-runner-health.yml` | Repository Runner Health | `health` | Manual runner health |

## Post-merge ownership

Automatic source-issue closeout has **one** owner:

| File | Name | Triggers | Role |
| --- | --- | --- | --- |
| `post-merge-closeout.yml` | Post-Merge Detection | `pull_request_target` (closed / merged to `main`) | Single automatic closeout owner |

Supporting / bounded (must not claim the same automatic closeout ownership):

| File | Name | Triggers | Role |
| --- | --- | --- | --- |
| `post-merge-pr-body-closeout.yml` | Post-Merge PR Body Closeout | `push`, `workflow_dispatch` | Manual / backfill closeout |
| `post-merge-remediation.yml` | Post-Merge Remediation | `workflow_run` | Failure remediation support |
| `ops-post-merge-self-healing.yml` | OPS — Post-Merge Self-Healing | `schedule`, `workflow_dispatch` | Exception hygiene |
| `ops-pr-process-metrics.yml` | OPS — PR Process Metrics | `pull_request`, `workflow_dispatch` | Metrics (PR-visible; not required) |
| `diataxis-post-merge-validate.yml` | DIATAXIS Post-Merge Validation | `pull_request` closed (merged → `main`) | Documentation validation support |

## Production / platform OPS

| File | Name | Triggers | Role |
| --- | --- | --- | --- |
| `ops-assess.yml` | OPS — Site Assessment | `schedule`, `push`, `workflow_dispatch` | Site assessment |
| `ops-design-compliance-audit.yml` | OPS — Design Compliance Audit | `schedule`, `push`, `workflow_dispatch` | Alert-only design audit |
| `production-audit.yml` | OPS — Production Audit | `schedule`, `push`, `workflow_dispatch` | Playwright production invariants |
| `snapshot.yml` | OPS — Snapshot Backup | `schedule`, `push`, `workflow_dispatch` | Repo + Cloudflare Pages snapshot |
| `b2-s3-smoke-test.yml` | OPS — B2 S3 Smoke Test | `schedule`, `workflow_dispatch` | B2 smoke |
| `b2-d1-daily-sync.yml` | OPS — B2 D1 Daily Sync | `schedule`, `workflow_dispatch` | B2/D1 sync |
| `ops-main-change-monitor.yml` | OPS — Main Change Monitor | `push`, `workflow_dispatch` | Unapproved main-push alerts |
| `d1-migrations.yml` | D1 Migrations | `push` | D1 migration apply |
| `enforce-pr-only.yml` | Enforce PR Only Changes | `push` | Direct-push policy signal |

Production scan trigger marker remains `docs/ops/scan-trigger.md` for on-demand OPS scans after merge to `main`.

## Docs / governance PR support (non-required)

These may appear on the PR check panel. They are **not** `main` required checks unless separately promoted.

| File | Name | Triggers | Notes |
| --- | --- | --- | --- |
| `agent-governance.yml` | Agent Governance | `pull_request`, `workflow_dispatch` | Agent governance check |
| `design-authority-check.yml` | Design Authority Check | `pull_request` (docs paths) | Duplicate design-definition guard |
| `diataxis-folder-authority.yml` | DIATAXIS Folder Authority | `pull_request` (docs paths) | Advisory; overlaps sibling workflow |
| `diataxis-folder-authority-check.yml` | DIATAXIS Folder Authority Check | `pull_request` (subset docs) | Advisory; shared comment marker with sibling |
| `zip-history-audit.yml` | ZIP History Audit (Full History) | `pull_request`, `workflow_dispatch` | Full-history ZIP scan; PR-visible noise risk |
| `cursor-review.yml` | Cursor PR Review | `pull_request` | Review helper |

## Delivery / component / orchestrators

Generic implementation-plan orchestration remains. The dedicated #1075 CI phase engine does **not**.

| File | Name | Triggers | Notes |
| --- | --- | --- | --- |
| `component-child-integration.yml` | Component Child Integration | `pull_request` (`component/**`), `workflow_run`, `workflow_dispatch` | Model B child integration |
| `orchestrator-issue-factory.yml` | Orchestrator — Issue Factory | `push` | Generic plan issue factory |
| `orchestrator-queue-advance.yml` | Orchestrator — Queue Advance | `issues` | Queue advance |
| `orchestrator-agent-trigger.yml` | Orchestrator — Agent Trigger | `issues` | Agent trigger |
| `orchestrator-draft-pr.yml` | Orchestrator — Draft PR Creator | `issues` | Draft PR creation |
| `orchestrator-pr-state-sync.yml` | Orchestrator — PR State Sync | `pull_request` | PR-visible state sync |
| `project-implementation-orchestrator.yml` | Project Implementation Orchestrator | `pull_request_target`, `workflow_dispatch` | High-sensitivity orchestrator |

## AI bridge / PMO / labels / wake

| File | Name | Triggers | Notes |
| --- | --- | --- | --- |
| `ai-execution-bridge.yml` | AI Execution Bridge | `issues`, `workflow_dispatch` | Bridge execution |
| `ai-execution-bridge-smoke.yml` | AI Execution Bridge Smoke Test | `push`, `schedule`, `workflow_dispatch` | Bridge smoke |
| `cursor-local-wake.yml` | Cursor Local Wake Delivery | `issues`, `issue_comment`, `workflow_dispatch` | Local wake delivery |
| `opencode.yml` | OpenCode Maintenance | `issue_comment` | Maintenance automation |
| `pmo-dashboard-ci-build.yml` | PMO dashboard CI build | `schedule`, `push`, `workflow_dispatch` | Dashboard build |
| `pmo-dashboard-ci-deploy.yml` | PMO dashboard CI deploy | `workflow_run`, `push`, `workflow_dispatch` | Pages deploy |
| `program-2477-chat-attention-pulse.yml` | Program 2477 Chat Attention Pulse | `schedule` (`*/15`), `workflow_dispatch` | Program-specific pulse |
| `ensure-ai-build-label.yml` | Ensure AI Build Label | `push` (self-path), `workflow_dispatch` | Label bootstrap |
| `ops-stale-issue-label-cleanup.yml` | OPS — Stale Issue Label Cleanup | `push` (self-path), `workflow_dispatch` | Label cleanup |
| `copilot-setup-steps.yml` | Copilot Setup Steps | `push`, `workflow_dispatch` | Copilot setup |
| `issue-pr-contract-validate.yml` | OPS — Issue PR-Contract Advisory Validation | `issues` (`labeled`), `workflow_dispatch` | Advisory-only `status:pr-ready` validation per #2615/#2620; separate read-only evaluate job and write-scoped mutate job; never creates a branch or PR |
| `ops-agent-routing-controller.yml` | OPS Agent Routing Controller | `issues`, `issue_comment`, `pull_request`, `pull_request_review`, `workflow_run`, `workflow_dispatch` | Project #2294 deterministic controller (#2594/#2595); automatic events remain observe-only; `CREATE_DRAFT_PR` (#2621) is reachable only via explicit `workflow_dispatch` with `authorize_mutation: true` and a scoped `issue_number`, never off the automatic `status:pr-ready` label event that #2620's validator already owns |

## One-shot / deprecated candidates

These remain in the tree pending separately authorized retirement. Treat as non-authority.

| File | Name | Triggers | Notes |
| --- | --- | --- | --- |
| `gate-ensure-issue.yml` | gate-ensure-issue | `pull_request_target` | Deprecated noop stub |
| `bridge-1314-verification-closeout.yml` | Bridge 1314 Verification Closeout | `workflow_dispatch`, `push` (self-path) | Historical bridge closeout |
| `bridge-optional-closeout.yml` | Bridge Optional Closeout | `workflow_dispatch`, `push` (self-path) | Historical issue closeout |
| `ops-close-superseded-pr-1492.yml` | OPS — Close Superseded PR #1492 | `workflow_dispatch`, `push` (self-path) | Hardcoded PR #1492 closeout |
| `post-recovery-425-verify.yml` | Post-Recovery Verification (PR #425) | `pull_request` (path-limited), `workflow_dispatch` | Historical recovery verification |

## Retired assets (must remain absent)

Retired by #2469 / related closeout — do not restore without new authorization:

- `ci-orchestration-engine.yml`
- `gate-reviewer-response.yml`
- `gate-close-work-issue.yml`
- parked legacy `ci.yml`, `deploy.yml`, `deploy-dev.yml`, `deploy-prod.yml`, `lgfc-validate.yml`, `test.yml`, `test-homepage.yml`
- `.github/ci-orchestration-state.json`
- `scripts/orchestrator/ci-orchestration-engine.mjs`
- `lgfc-ci-phase:*` issue generation
- `gate-zip-safety.yml` / required job `check-no-zip-files` (ZIP enforcement lives inside `quality`)

Retired by #2524:

- `update-docs.md` / `update-docs.lock.yml` (Copilot README auto-sync)

## Operator rules

1. **Required checks for `main`:** only `quality` and `gitleaks`.
2. **Do not** add OPS, advisory, manual-only, or retired checks to the required ruleset without promotion evidence.
3. **Do not** treat a red advisory/support PR check as a merge blocker unless the live ruleset lists it as required.
4. **New workflows:** classify under `docs/governance/CI-AND-VERIFICATION.md`, update the classification matrix / PR workflow inventory, and update this operator inventory in the same change set when practical.
5. **GATE naming** (`gate-*.yml` / `GATE — …`) does not automatically mean “required.”
6. **OPS naming** (`ops-*.yml` / `OPS — …`) must never become a `main` required check.
7. Prefer thin routing to July controlled references over duplicating long policy text here.

## Count

Current `.github/workflows/` file count at last review of this document: **64**.

When the live tree and this count disagree, trust the live tree and open a bounded docs correction under the active CI inventory issue.

## References

- Domain policy: `docs/governance/CI-AND-VERIFICATION.md`
- Guardrails map: `.github/CI_GUARDRAILS_MAP.md`
- Merge protection surface: `docs/reference/ci/merge-protection-surface.md`
- Classification matrix: `docs/reference/ci/lgfc-ci-workflow-classification-matrix.md`
- PR workflow inventory: `docs/reference/ci/pr-workflow-ci-inventory.md`
- PR process: `docs/governance/PR_PROCESS.md`
- PR template: `.github/pull_request_template.md`
