---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: PR-workflow CI inventory, pre-merge/post-merge classification, legacy PR CI adoption or decommission recommendations
Does Not Own: Canonical PR-process policy, full repository CI inventory, workflow implementation, branch protection settings UI, production deployment behavior, non-PR scheduled operations
Canonical Reference: /docs/governance/PR_PROCESS.md
Related issues: #2142, #2175, #2208
Last Reviewed: 2026-07-04
---

# PR Workflow CI Inventory

This controlled reference supports `/docs/governance/PR_PROCESS.md` by identifying workflows that participate in the pull request lifecycle.

## Purpose

This reference defines the CI workflows and checks that are part of the LGFC Pull Request lifecycle.

It exists to prevent routine PR hygiene failures from escaping pre-merge review and becoming post-merge backlog issues, while avoiding noisy or overlapping gates.

## Scope

This inventory covers CI workflows/checks used by the PR workflow:

- PR open;
- PR body/template validation;
- issue accounting;
- file/diff governance;
- reviewer and bot review state;
- merge-readiness checks;
- post-merge PR closeout.

This inventory does not cover the full repository CI surface, production runtime monitoring, scheduled site audits, Cloudflare deployment management, data sync workflows, AI orchestration workflows, or manually dispatched maintenance jobs unless they participate directly in the PR lifecycle.

## Current known truth during #2175 / #2208

The broader repository workflow inventory supports more than the PR process and must not be treated as a complete PR-workflow classification.

The current reduced deterministic pre-merge blocker reference is maintained in `/docs/reference/ci/merge-protection-surface.md`.

The following PR-process workflows are currently safe-mode/manual-only and are not final design:

- marker/safe-mode: `gate-quality.yml`, `gate-drift.yml`, `gate-branch-freshness.yml`, `docs-guardrails.yml`, `design-compliance-warn.yml`, `reviewer-response-completion.yml`;
- manual-only: `gate-intent-labeler.yml`, `gate-diff-scope.yml`, `ops-pr-issue-accounting.yml`.

## Intended final state

Every CI workflow that participates in the PR lifecycle has one explicit role:

- pre-merge required gate;
- pre-merge advisory check;
- post-merge closeout gate;
- post-merge PR lifecycle monitor;
- scheduled/manual operation outside PR workflow;
- deprecated/legacy PR workflow.

Legacy PR CI must either be adopted into the current CI design or decommissioned. Routine PR hygiene failures should be caught before merge only by deterministic, low-noise checks.

---

## Classification legend

| Class | Meaning | Failure handling |
|---|---|---|
| Pre-merge required gate | Required PR lifecycle check that must pass before merge authorization | Block merge only after deterministic validation and branch-protection alignment |
| Pre-merge advisory check | PR workflow check that comments, reports, or emits artifacts but does not block during rollout | Do not block merge unless reclassified |
| Post-merge closeout gate | Runs after merge to reconcile source issue, closeout evidence, and merged-state validation | Create/update post-merge exception only for failures that could not be deterministically blocked before merge |
| Post-merge PR lifecycle monitor | Post-merge support, remediation, self-healing, or evidence publication | Create/update existing Ops issue or evidence only |
| Scheduled/manual operation | Not part of normal PR workflow | No PR merge effect |
| Deprecated/legacy PR workflow | Old workflow retained temporarily, parked, duplicated, or superseded | Decommission unless explicitly adopted |

---

## Current transition PR workflow CI

| Workflow file | Visible check / workflow | PR phase | Classification | Current transition status | Notes |
|---|---|---:|---|---|---|
| `.github/workflows/gate-quality.yml` | `GATE — Quality Checks` / `quality` | Pre-merge | Pre-merge required gate candidate | Marker/safe-mode | Must be rebuilt as class-aware deterministic quality routing before final promotion. |
| `.github/workflows/gitleaks.yml` | `GATE — Secret Scan` / `gitleaks` | Pre-merge | Pre-merge required gate | Active deterministic safety | Owns secret exposure detection. |
| `.github/workflows/ops-pr-issue-accounting.yml` | `GATE — PR Issue Accounting` / `pr-issue-accounting` | Pre-merge | Pre-merge advisory/required candidate | Manual-only | Must not be required while manual-only. Rebuild advisory-first. |
| `.github/workflows/reviewer-response-completion.yml` | `GATE — Reviewer Response Completion` | Pre-merge | Reviewer lifecycle candidate | Marker/safe-mode | Must be rebuilt around GitHub-native review/thread state. |
| `.github/workflows/docs-guardrails.yml` | `Docs Guardrails` | Pre-merge | Docs advisory/check hybrid | Marker/safe-mode | Rebuild only if it has one clear owner and no PR-body lifecycle mutation. |
| `.github/workflows/design-compliance-warn.yml` | `Design Compliance (Warn)` | Pre-merge | Design/process advisory | Marker/safe-mode | Old PR-body required-section model is superseded. |
| `.github/workflows/gate-branch-freshness.yml` | `GATE — Branch Freshness` | Pre-merge | Branch freshness candidate | Marker/safe-mode | Rebuild only if deterministic and low-noise. |
| `.github/workflows/gate-intent-labeler.yml` | `GATE — Intent Labeler` | Pre-merge | Label classification support | Manual-only | Rebuild advisory-first; avoid label mutation loops. |
| `.github/workflows/gate-diff-scope.yml` | `GATE — Diff Scope` | Pre-merge | Diff-scope advisory candidate | Manual-only | Rebuild as artifact/report first; no PR body mutation. |
| `.github/workflows/gate-pr-hygiene.yml` | `GATE — PR Hygiene` / `pr-hygiene` | Pre-merge | PR hygiene advisory | Active advisory | Validates stable PR-body facts; non-blocking; artifact + upsert comment. |
| `.github/workflows/gate-drift.yml` | `GATE — Drift Control` | Pre-merge | Governance drift candidate | Marker/safe-mode | Rebuild only after overlap with other gates is removed. |
| `.github/workflows/design-authority-check.yml` | `Design Authority Check` | Pre-merge | Pre-merge advisory/check hybrid | Active where wired | Not a post-merge closeout owner. |
| `.github/workflows/diataxis-folder-authority-check.yml` | `DIATAXIS Folder Authority Check` | Pre-merge | Pre-merge advisory/check hybrid | Active where wired | Supports DIATAXIS folder authority. |
| `.github/workflows/cursor-review.yml` | `Cursor PR Review` | Pre-merge | Reviewer/advisory support | Active where wired | Should not be treated as merge approval. |

---

## Post-merge PR workflow CI

| Workflow file | Visible check / workflow | PR phase | Classification | Current design status | Notes |
|---|---|---:|---|---|---|
| `.github/workflows/post-merge-closeout.yml` | `Post-Merge Detection` | Post-merge | Post-merge closeout gate | Official post-merge owner candidate | Should remain single-owner and idempotent. |
| `.github/workflows/post-merge-pr-body-closeout.yml` | `Post-Merge PR Body Closeout` | Post-merge/manual | Post-merge PR lifecycle monitor | Manual/backfill only | Not normal PR merge gating. |
| `.github/workflows/post-merge-remediation.yml` | `Post-Merge Remediation` | Post-merge | Post-merge PR lifecycle monitor | Current support | Must not become pre-merge required check. |
| `.github/workflows/ops-post-merge-self-healing.yml` | `OPS — Post-Merge Self-Healing` | Post-merge/scheduled | Post-merge PR lifecycle monitor | Current support | Should reduce backlog, not create new child escalation loops. |
| `.github/workflows/diataxis-post-merge-validate.yml` | `DIATAXIS Post-Merge Validation` | Post-merge | Post-merge PR lifecycle monitor | Current docs validation support | Not a pre-merge gate unless separately adopted. |
| `.github/workflows/post-merge-intent-verification.yml` | `Post-Merge Maintainer Body Apply` | Post-merge/targeted support | Legacy support | Redesign/decommission candidate | Keep only if still needed for legacy PR-body apply path. |

---

## Legacy or pre-design PR CI assessment

| Workflow file | Visible check / workflow | Legacy assessment | Required action |
|---|---|---|---|
| `.github/workflows/gate-close-work-issue.yml` | `gate-close-work-issue` | Parked no-op legacy workflow; no effective closeout ownership | Decommission when no historical reference or fallback need remains. Do not adopt into current design. |
| `.github/workflows/gate-reviewer-response.yml` | `GATE — Reviewer Response` | Retired manual-only/stub reviewer workflow superseded by reviewer lifecycle redesign | Decommission if still present and not used by branch protection. Do not adopt. |
| `.github/workflows/pr-triage-zip-taint.yml` | PR ZIP taint triage | Legacy/pre-design ZIP PR support overlapping with quality/ZIP checks | Decommission unless a current failing scenario proves unique coverage. |
| `.github/workflows/ensure-ai-build-label.yml` | Ensure AI build label | Legacy/pre-design label workflow | Decommission unless explicitly adopted into PR intent/label model. |
| `.github/workflows/bridge-optional-closeout.yml` | Optional closeout bridge | Legacy bridge/orchestration support, not normal PR gate | Keep out of PR workflow unless a current design doc adopts it. |
| `.github/workflows/update-docs.md` | Markdown file under workflows folder | Non-workflow documentation artifact in workflow directory | Move or archive outside `.github/workflows/` if not intentionally executable workflow documentation. |
| `.github/workflows/update-docs.lock.yml` | Update docs lock | Legacy/support workflow | Assess separately; not PR workflow unless it has PR triggers. |

---

## Non-PR workflow classes explicitly out of this inventory

The following workflow families are outside this PR-workflow inventory unless a future issue explicitly brings them into PR lifecycle scope:

- production deployment and Cloudflare workflows;
- B2/D1 sync and migration workflows;
- scheduled production audits and site assessment;
- AI execution bridge smoke/support workflows;
- PMO dashboard deploy workflows;
- orchestration issue-factory, queue, draft-PR, and agent-trigger workflows;
- snapshots and manual recovery operations.

These may still be valid repository CI, but they do not own PR readiness or post-merge source-issue closeout.
