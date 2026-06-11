---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Current workflow inventory, classification, overlap notes, deprecation candidates
Does Not Own: Workflow implementation, branch protection settings, CI architecture rationale
Canonical Reference: /docs/reference/ci/github-actions_MASTER.md
Related Issues: #1199, #1058, #1545
Last Reviewed: 2026-06-11
---

# GitHub Actions Workflow Inventory

## Purpose

This inventory records the current GitHub Actions workflow surface for Issue #1058 Phase 1. It is an as-observed reference used to plan later narrow PRs for naming alignment, reviewer-gate redesign, consolidation, and blocker/advisory normalization.

## Scope

The inventory covers every `*.yml` workflow under `.github/workflows/` as of 2026-05-19. It does not change workflow behavior and does not define branch protection requirements.

## Current Known Truth

There are 54 workflow files on `main` as of 2026-06-03. The authoritative
as-built reconciliation for the `#1075` CI redesign is
`docs/reference/ci/lgfc-ci-as-built-reconciliation.md`.

Merged redesign phases on `main`:

- Task 001 PR hygiene advisories
- Task 002 merge protection consolidation (`gate-zip-safety.yml` retired)
- Task 003 reviewer lifecycle redesign (PR #1239)
- Task 004 post-merge validation expansion (PR #1240)
- Task 005 OPS runtime consolidation (PR #1242)

Task 005 merged before Task 004 without file conflicts because the domains are
disjoint.

Program #1500 closeout stabilization (partial on `main` as of 2026-06-11):

- Task 001 merged (pre-merge post-merge-readiness gate)
- Task 002 merged (post-merge closeout consolidation, PR #1567 / #1545)

Program #1500 is not fully complete; only Tasks 001–002 are merged on `main`.

Use the as-built reconciliation doc and domain surface references for
current merged truth:

- `docs/reference/ci/merge-protection-surface.md`
- `docs/reference/ci/pr-hygiene-foundation.md`
- `docs/reference/ci/reviewer-lifecycle-surface.md`
- `docs/reference/ci/post-merge-validation-surface.md`
- `docs/reference/ci/ops-runtime-surface.md`

Rows that remain materially stale until a full inventory rewrite include
`gate-zip-safety.yml` (retired) and several historical OPS workflow descriptions
in the table below. Post-merge closeout ownership rows were refreshed on
2026-06-11 after PR #1567; the full workflow count and remaining rows are still
deferred to Program 2 phase-2 Task 005.

## Intended Final State

Each workflow should have a clear owner, visible name, filename, trigger class, blocking/advisory status, protected scope, dependency list, and deprecation or consolidation recommendation. Future phases should reduce false positives, remove stale workflow surfaces, and make GitHub Checks panel names easy to map back to workflow files.

## Classification Legend

- `Blocking`: intended to fail PRs or protected integration when a concrete required condition fails.
- `Advisory`: reports warnings or guidance and should not block merge readiness.
- `Operational`: scheduled, manual, post-merge, deployment, audit, or maintenance workflow outside normal PR gating.
- `Support`: automation support for agents, orchestration, setup, or comments.
- `Parked`: legacy no-op workflow retained temporarily.

## Workflow Inventory

| YAML filename | Visible workflow name | Purpose | Triggers | Class | Protected scope | Dependencies | PR body parsing | False-positive risk | Overlap / redundancy | Deprecation candidate |
|---|---|---|---|---|---|---|---|---|---|---|
| `agent-governance.yml` | Agent Governance | Validate agent governance files and rules. | `pull_request`, `workflow_dispatch` | Blocking | Agent governance docs/checks | `.agents/checks/agent-governance-check.mjs`, Node | No | Low | Overlaps generally with docs guardrails but owns agent rules. | No |
| `ai_review.yml` | AI Code Review | Manual AI review/comment support. | `workflow_dispatch` | Support | Manual review comments | checkout, commit comment action | No | Low | Overlaps with external reviewer tooling. | Possible consolidation |
| `ai-execution-bridge.yml` | AI Execution Bridge | Validate `ai-build` issues and comment with plan JSON (phase 1). | `issues` (`labeled`) | Operational | Approved issue automation | `ai_execution_bridge_validate.mjs`, `ai_execution_bridge_prepare.mjs`, Node 22 | Yes | Low | Complements orchestrator handoff; no OpenAI execution. | No |
| `ensure-ai-build-label.yml` | Ensure AI Build Label | Create `ai-build` label when missing. | `workflow_dispatch`, `push` (this file) | Operational | Label bootstrap | actions/github-script | No | Low | One-time/bootstrap support for bridge trigger. | No |
| `ai-execution-bridge-smoke.yml` | AI Execution Bridge Smoke Test | Weekly and path-filtered bridge regression smoke. | `schedule`, `push` (bridge paths), `workflow_dispatch` | Operational | Bridge regression | bridge unit tests + validate/prepare scripts | No | Low | Does not run on every unrelated `main` merge. | No |
| `assess-nightly.yml` | Site Assessment (Nightly Drift Detection) | Legacy scheduled site assessment. | `schedule`, `workflow_dispatch` | Operational | Production/site health | `npm run assess:ci`, artifacts, issue comments | No | Medium | Overlaps with `ops-assess.yml`. | Yes |
| `b2-d1-daily-sync.yml` | B2 -> D1 Daily Sync | Scheduled/manual B2 to D1 content sync. | `workflow_dispatch`, `schedule` | Operational | Content data sync | checkout, Node, remote services | No | Medium | Related to D1/B2 smoke and migration jobs. | No |
| `b2-s3-smoke-test.yml` | B2 S3 Smoke Test | Validate B2 S3 connectivity. | `workflow_dispatch`, `schedule` | Operational | Storage connectivity | checkout, B2 credentials | No | Medium | Overlaps with B2/D1 sync preflight. | Possible consolidation |
| `ci.yml` | Legacy LGFC-main Workflow (Parked) | Parked legacy CI placeholder. | `workflow_dispatch` | Parked | None | none | No | Low | Duplicate parked workflow pattern. | Yes |
| `copilot-setup-steps.yml` | Copilot Setup Steps | Configure Copilot coding agent environment. | `workflow_dispatch`, `push` | Support | Agent setup | checkout, GitHub AW setup | No | Low | Support-only; separate from CI gates. | No |
| `cursor-review.yml` | Cursor PR Review | Validate Cursor-specific duplicate rules file is not introduced. | `pull_request` | Blocking | Cursor AI docs authority | checkout, git diff | No | Low | Narrow overlap with agent governance. | Possible consolidation |
| `d1-migrations.yml` | D1 Migrations | Apply D1 migrations on main changes. | `push` | Operational | Database migrations | checkout, Node, npm ci | No | Medium | Related to `lgfc-d1-migrate.yml`. | Possible consolidation |
| `deploy-dev.yml` | Legacy LGFC-main Workflow (Parked) | Parked legacy deploy placeholder. | `workflow_dispatch` | Parked | None | none | No | Low | Duplicate parked workflow pattern. | Yes |
| `deploy-prod.yml` | Legacy LGFC-main Workflow (Parked) | Parked legacy deploy placeholder. | `workflow_dispatch` | Parked | None | none | No | Low | Duplicate parked workflow pattern. | Yes |
| `deploy.yml` | Legacy LGFC-main Workflow (Parked) | Parked legacy deploy placeholder. | `workflow_dispatch` | Parked | None | none | No | Low | Duplicate parked workflow pattern. | Yes |
| `design-authority-check.yml` | Design Authority Check | Enforce design authority acknowledgement on PRs. | `pull_request` | Blocking | Design authority process | checkout, shell | No | Medium | Overlaps with design compliance warning and PR template checks. | Possible consolidation |
| `design-compliance-warn.yml` | Design Compliance (Warn) | Warn on missing PR template sections, ZIP statement, allowlist, and docs justification. | `pull_request` | Advisory | PR body guidance and design process | checkout, GitHub Script | Yes | Medium | Overlaps with PR template, docs guardrails, drift allowlist, ZIP guidance. | Redesign candidate |
| `diataxis-folder-authority-check.yml` | DIATAXIS Folder Authority Check | Validate documentation folder authority and intent. | `pull_request` | Blocking | DIATAXIS folder placement | checkout, shell | No | Medium | Overlaps with docs guardrails. | Possible consolidation |
| `diataxis-post-merge-validate.yml` | DIATAXIS Post-Merge Validation | Validate DIATAXIS results after merged labeled PRs. | `pull_request` closed | Operational | Post-merge docs validation | checkout, git diff | No | Medium | Overlaps with docs guardrails and post-merge verification. | Possible consolidation |
| `docs-guardrails.yml` | Docs Guardrails | Validate docs headers, paths, and canonical hashes. | `pull_request`, `push` | Blocking | Documentation governance | docs check scripts, GitHub Script | No | Low | Overlaps with DIATAXIS folder checks. | No |
| `enforce-pr-only.yml` | Enforce PR Only Changes | Block or flag direct pushes outside PR flow. | `push` | Blocking | Main branch governance | shell | No | Medium | Overlaps with `ops-main-change-monitor.yml`. | Consolidation candidate |
| `gate-close-work-issue.yml` | gate-close-work-issue | No-op legacy PR issue closer. | `pull_request_target` | Parked | None | none | No | Low | Replaced by issue-accounting/post-merge orchestration. | Yes |
| `gate-drift.yml` | GATE - Drift Control | Enforce intent label, allowlist, ZIP history, and invariant checks. | `pull_request`, `workflow_dispatch` | Blocking | PR changed-file scope and drift integrity | npm ci, intent labeler run lookup, CI scripts | No | Medium | Central PR governance gate; overlaps with ZIP and design allowlist warnings. | No |
| `gate-ensure-issue.yml` | gate-ensure-issue | No-op legacy PR issue enforcement. | `pull_request_target` | Parked | None | none | No | Low | Replaced by `ops-pr-issue-accounting.yml`. | Yes |
| `gate-intent-labeler.yml` | GATE - Intent Labeler | Apply exactly one intent label based on changed files. | `pull_request` | Blocking | PR intent labels | checkout, GitHub Script, allowlist config | No | Medium | Coupled to drift control. | No |
| `gate-branch-freshness.yml` | GATE - Branch Freshness | Fail when PR branch or feature-branch push is behind `main`; report merge remediation. | `pull_request`, `push` (non-main), `workflow_dispatch` | Blocking | Branch sync with `main` | checkout, `scripts/ci/branch_freshness_gate.mjs` | No | Medium | Detect-only; does not auto-merge `main`. | No |
| `gate-quality.yml` | GATE - Quality Checks | Run structure, forbidden backend guard, typecheck, lint, and tests. | `pull_request`, `push`, `workflow_dispatch` | Blocking | Build/test/code quality | npm ci, package scripts, CI scripts | No | Medium | Primary quality gate. | No |
| `gate-reviewer-response.yml` | GATE - Reviewer Response | Temporarily disabled reviewer response gate. | `workflow_dispatch` | Parked | None while disabled | none | No | Low | Replaced or superseded by reviewer response completion. | Yes |
| `gate-zip-safety.yml` | GATE - ZIP Safety | Check PR content for ZIP files. | `pull_request` | Blocking | ZIP artifact safety | checkout, shell | No | Low | Overlaps with drift gate ZIP checks and zip history audit. | Possible consolidation |
| `gitleaks.yml` | Secret Scan (gitleaks) | Scan for secrets. | `pull_request`, `push`, `workflow_dispatch` | Blocking | Secret safety | checkout, gitleaks action | No | Medium | Security-specific; keep separate unless consolidated into security suite. | No |
| `lgfc-d1-migrate.yml` | LGFC D1 Migrate (remote) | Manual D1 migration runner. | `workflow_dispatch` | Operational | Remote database migration | checkout, Node | No | Medium | Related to `d1-migrations.yml`. | Possible consolidation |
| `lgfc-validate.yml` | Legacy LGFC-main Workflow (Parked) | Parked legacy validation placeholder. | `workflow_dispatch` | Parked | None | none | No | Low | Duplicate parked workflow pattern. | Yes |
| `opencode.yml` | OpenCode Maintenance | Trigger OpenCode maintenance from issue comments. | `issue_comment` | Support | Agent maintenance | checkout, OpenCode action | No | Medium | Agent support surface. | No |
| `ops-assess.yml` | OPS - Site Assessment | Current scheduled/main/manual site assessment. | `schedule`, `push`, `workflow_dispatch` | Operational | Production/site health | npm ci, `npm run assess:ci`, artifacts, GitHub Script | No | Medium | Overlaps with `assess-nightly.yml`. | No, but consolidate duplicate |
| `ops-cf-pages-retry.yml` | OPS - Cloudflare Pages Auto-Retry | Manual retry for failed Cloudflare Pages deployments. | `workflow_dispatch` | Operational | Deployment recovery | Cloudflare/GitHub APIs | No | Medium | Deployment support only. | No |
| `ops-design-compliance-audit.yml` | OPS - Design Compliance Audit | Scheduled/main/manual production design audit. | `push`, `schedule`, `workflow_dispatch` | Operational | Production design observation | checkout, Node, artifacts | No | Medium | Related to PR design compliance warning. | No |
| `ops-main-change-monitor.yml` | OPS - Main Change Monitor | Detect direct pushes and update issues. | `push`, `workflow_dispatch` | Operational | Main branch change control | checkout, GitHub Script | No | Medium | Overlaps with `enforce-pr-only.yml`. | Consolidation candidate |
| `ops-pr-issue-accounting.yml` | OPS - PR Issue Accounting | Normalize and verify one source Issue per PR. | `pull_request_target` | Blocking | Issue-first PR accounting | GitHub Script | Yes | Medium | Owns source issue accounting; current normalizer/parser mismatch noted. | Redesign candidate |
| `orchestrator-agent-trigger.yml` | Orchestrator - Agent Trigger | Trigger assigned agent work from issues. | `issues` | Support | Orchestration | checkout, Node orchestrator script | No | Medium | Part of orchestrator suite. | No |
| `orchestrator-draft-pr.yml` | Orchestrator - Draft PR Creator | Create draft PRs from issue state. | `issues` | Support | Orchestration | checkout, Node orchestrator script | No | Medium | Part of orchestrator suite. | No |
| `orchestrator-issue-factory.yml` | Orchestrator - Issue Factory | Create implementation issues from project plan. | `push` | Support | Orchestration | npm, Node orchestrator script | No | Medium | Part of orchestrator suite. | No |
| `orchestrator-pr-state-sync.yml` | Orchestrator - PR State Sync | Sync PR state back to orchestration labels/issues. | `pull_request` | Support | Orchestration | checkout, Node orchestrator script | No | Medium | Related to post-merge remediation. | No |
| `orchestrator-queue-advance.yml` | Orchestrator - Queue Advance | Advance orchestrator queue from issue events. | `issues` | Support | Orchestration | checkout, Node orchestrator script | No | Medium | Part of orchestrator suite. | No |
| `post-merge-closeout.yml` | Post-Merge Detection | Sole automatic post-merge closeout owner for merged PRs to `main`: validate, single sync path, remediation handoff. | `pull_request_target` closed (merged to `main`) | Operational | Post-merge closeout | checkout, Node, `run_post_merge_closeout.mjs`, gh, `post_merge_reviewer_audit.mjs` | Yes, via closed PR event | Medium | Duplicate automatic closeout race resolved by PR #1567 (Program #1500 Task 002 / #1545); `post-merge-remediation.yml` depends on this workflow name. | No |
| `post-merge-intent-verification.yml` | Post-Merge Maintainer Body Apply | Maintainer PR body apply and manual workflow support. No longer owns automatic post-merge closeout. | `pull_request` synchronize (`main`), `workflow_dispatch` | Operational | Maintainer body apply | checkout, Node, `post_merge_validator.mjs` | Yes (dispatch/PR body) | Low | Former duplicate automatic closeout owner; `pull_request_target: closed` path removed in PR #1567. | No |
| `post-merge-pr-body-closeout.yml` | Post-Merge PR Body Closeout | Manual single-PR closeout, batch manifests, and push-triggered backfill only. | `push` (manifest paths), `workflow_dispatch` | Operational | Manual/batch post-merge closeout backfill | checkout, Node, `run_post_merge_closeout.mjs`, batch manifest scripts | Yes (manual modes) | Medium | Former duplicate automatic closeout owner; automatic `pull_request_target: closed` removed in PR #1567. Complements `post-merge-closeout.yml`. | No |
| `post-merge-remediation.yml` | Post-Merge Remediation | Opens remediation issues when Post-Merge Detection fails. | `workflow_run` (`Post-Merge Detection` completed) | Operational | Post-merge remediation | checkout, Node, `post_merge_remediation_issue.mjs` | No | Medium | Depends on `Post-Merge Detection` workflow name preserved by `post-merge-closeout.yml`. | No |
| `post-recovery-425-verify.yml` | Post-Recovery Verification (PR #425) | Legacy recovery verification. | `pull_request`, `workflow_dispatch` | Blocking | PR #425 recovery assumptions | checkout, Node | No | High | Stale PR-specific workflow. | Yes |
| `pr-triage-zip-taint.yml` | PR Triage - ZIP Taint Classification | Manual ZIP taint triage. | `workflow_dispatch` | Operational | ZIP history diagnosis | checkout, Node, artifact | No | Low | Related to ZIP safety and zip history audit. | Possible consolidation |
| `preview-invariants.yml` | Preview Invariants (Cloudflare Pages) | Manual preview URL invariant validation. | `workflow_dispatch` | Operational | Cloudflare preview validation | checkout, Node, artifact | No | Medium | Related to production audit and gate quality. | No |
| `production-audit.yml` | Production Audit (Playwright Invariants) | Scheduled/main/manual production invariant audit. | `push`, `schedule`, `workflow_dispatch` | Operational | Production site invariants | checkout, Node, artifact, GitHub Script | No | Medium | Related to `ops-assess.yml` and preview invariants. | Possible consolidation |
| `project-implementation-orchestrator.yml` | Project Implementation Orchestrator | Orchestrate next implementation task. | `pull_request_target`, `workflow_dispatch` | Support | Project orchestration | shell/GitHub APIs | No | Medium | Related to orchestrator suite. | Consolidation candidate |
| `purge-zip-history.yml` | Purge ZIPs from Git History (FORCE PUSH) | Manual destructive ZIP history purge. | `workflow_dispatch` | Operational | Repository history recovery | checkout, shell | No | High by design | Related to ZIP audit/remediation. | Keep manual with safeguards |
| `reviewer-response-completion.yml` | GATE - Reviewer Response Completion | Enforce current-head trusted reviewer response accounting. | `pull_request_target`, `issue_comment`, `pull_request_review`, `pull_request_review_comment` | Blocking | Reviewer response accounting | GitHub Script | No | High | Supersedes disabled reviewer gate; stale/deadlock risk. | Redesign candidate |
| `snapshot.yml` | Snapshot Backup (Repo + Cloudflare Pages) | Capture repository and Cloudflare Pages snapshots. | `schedule`, `workflow_dispatch`, `push` | Operational | Backup/rollback evidence | snapshot scripts, artifacts | No | Medium | Operational backup only. | No |
| `test-homepage.yml` | Legacy LGFC-main Workflow (Parked) | Parked legacy test placeholder. | `workflow_dispatch` | Parked | None | none | No | Low | Duplicate parked workflow pattern. | Yes |
| `test.yml` | Legacy LGFC-main Workflow (Parked) | Parked legacy test placeholder. | `workflow_dispatch` | Parked | None | none | No | Low | Duplicate parked workflow pattern. | Yes |
| `update-docs.lock.yml` | Auto-Sync Documentation | GitHub AW documentation auto-sync workflow. | `push` | Support | Documentation automation | GitHub AW setup, checkout, artifacts | No | Medium | Separate generated/support workflow. | Review needed |
| `zip-history-audit.yml` | ZIP History Audit (Full History) | Audit full history for ZIP artifacts. | `pull_request`, `workflow_dispatch` | Blocking | ZIP history safety | checkout, shell | No | Medium | Overlaps with drift and ZIP safety. | Possible consolidation |

## Deadlock and False-Positive Risks

- `reviewer-response-completion.yml` can block PRs on stale reviewer state, quiet periods, or missing current-head trusted reviewer artifacts. This is the primary Phase 3 redesign target.
- `ops-pr-issue-accounting.yml` currently normalizes PR bodies to `- **Issue:** #123`; Phase 1 observed that this exact emitted form is not accepted by its own parser on a later edit, causing duplicate issue lines while still passing from branch-name fallback.
- `design-compliance-warn.yml` is intended to be advisory, but it overlaps with hard-gate concepts such as allowlists and ZIP safety. Later phases should keep it advisory or move deterministic checks to the owning hard gate.
- Automatic post-merge closeout previously raced across `post-merge-intent-verification.yml`, `post-merge-pr-body-closeout.yml`, and related paths. PR #1567 consolidated ownership into `post-merge-closeout.yml` (`Post-Merge Detection`); manual and backfill paths remain on `post-merge-pr-body-closeout.yml` and `post-merge-intent-verification.yml`.
- `post-recovery-425-verify.yml` appears PR-specific and stale, which can create unrelated PR noise.

## Duplicate Governance Logic

- ZIP protection appears in `gate-zip-safety.yml`, `gate-drift.yml`, `zip-history-audit.yml`, `pr-triage-zip-taint.yml`, and `purge-zip-history.yml`.
- Documentation authority checks appear in `docs-guardrails.yml`, `diataxis-folder-authority-check.yml`, `diataxis-post-merge-validate.yml`, and parts of `design-compliance-warn.yml`.
- Main-branch change controls appear in `enforce-pr-only.yml` and `ops-main-change-monitor.yml`.
- Production/site health checks appear in `assess-nightly.yml`, `ops-assess.yml`, `production-audit.yml`, and `ops-design-compliance-audit.yml`.
- Reviewer response governance appears in disabled `gate-reviewer-response.yml` and active `reviewer-response-completion.yml`.
- Post-merge closeout previously duplicated automatic `pull_request_target: closed` handlers. PR #1567 retired that race; `post-merge-closeout.yml` is the sole automatic owner, with manual/batch support on `post-merge-pr-body-closeout.yml` and maintainer body apply on `post-merge-intent-verification.yml`.

## Naming Mismatches

Visible names and filenames that should be aligned or retired in Phase 2:

- `assess-nightly.yml` vs `Site Assessment (Nightly Drift Detection)`
- `ci.yml`, `deploy.yml`, `deploy-dev.yml`, `deploy-prod.yml`, `lgfc-validate.yml`, `test-homepage.yml`, and `test.yml` all share `Legacy LGFC-main Workflow (Parked)`
- `gate-close-work-issue.yml` vs `gate-close-work-issue`
- `gate-ensure-issue.yml` vs `gate-ensure-issue`
- `post-merge-intent-verification.yml` vs `Post-Merge Maintainer Body Apply`
- `post-merge-closeout.yml` vs `Post-Merge Detection` (intentional: preserves remediation chain workflow name)
- `post-recovery-425-verify.yml` vs `Post-Recovery Verification (PR #425)`
- `zip-history-audit.yml` vs `ZIP History Audit (Full History)`

## Phase 1 Recommendations

- Do not change workflow logic in the inventory PR.
- Use this inventory as the basis for Phase 2 filename/name alignment.
- Fix or retire parked no-op workflows before attempting broader consolidation.
- Treat reviewer response completion as a dedicated redesign target, not a side effect of naming cleanup.
- Keep hard blockers focused on deterministic repository safety: quality, secrets, ZIP safety, drift, docs guardrails, and source issue accounting.
