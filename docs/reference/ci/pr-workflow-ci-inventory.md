---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: PR-workflow CI inventory, pre-merge/post-merge classification, legacy PR CI adoption or decommission recommendations
Does Not Own: Full repository CI inventory, workflow implementation, branch protection settings UI, production deployment behavior, or non-PR scheduled operations
Canonical Reference: /docs/reference/ci/merge-protection-surface.md
Related issues: #2142, #1075, #1500, #1963
Last Reviewed: 2026-07-02
---

# PR Workflow CI Inventory

## Purpose

This reference defines the CI workflows and checks that are part of the LGFC Pull Request lifecycle.

It exists to prevent routine PR hygiene failures from escaping pre-merge review and becoming post-merge backlog issues.

## Scope

This inventory covers only CI workflows/checks used by the PR workflow:

- PR open;
- PR body/template validation;
- issue accounting;
- file/diff governance;
- reviewer and bot comment disposition;
- merge-readiness checks;
- post-merge PR closeout.

This inventory does not cover the full repository CI surface, production runtime monitoring, scheduled site audits, Cloudflare deployment management, data sync workflows, AI orchestration workflows, or manually dispatched maintenance jobs unless they participate directly in the PR lifecycle.

## Current known truth

The broader repository workflow inventory supports more than the PR process and must not be treated as a complete PR-workflow classification.

The current merge-protection reference identifies the deterministic pre-merge blocker surface as:

- `gate-quality.yml` / `quality`;
- `gitleaks.yml` / `gitleaks`;
- `ops-pr-issue-accounting.yml` / `pr-issue-accounting`;
- `gate-post-merge-readiness.yml` / `post-merge-readiness`.

The post-merge validation reference identifies `post-merge-closeout.yml` as the single automatic post-merge source-issue closeout owner and identifies `gate-close-work-issue.yml` as a parked no-op legacy workflow.

The reviewer lifecycle reference identifies reviewer disposition enforcement as a pre-merge gate, with post-merge reviewer audit used when late or undispositioned reviewer findings escape pre-merge control.

## Intended final state

Every CI workflow that participates in the PR lifecycle has one explicit role:

- pre-merge required gate;
- pre-merge advisory check;
- post-merge closeout gate;
- post-merge PR lifecycle monitor;
- scheduled/manual operation outside PR workflow;
- deprecated/legacy PR workflow.

Legacy PR CI must either be adopted into the current CI design or decommissioned. Routine PR hygiene failures should block before merge, not create new post-merge exception issues.

---

## Classification legend

| Class | Meaning | Failure handling |
|---|---|---|
| Pre-merge required gate | Required PR lifecycle check that must pass before merge authorization | Block merge |
| Pre-merge advisory check | PR workflow check that comments or warns but does not block during rollout | Do not block merge unless reclassified |
| Post-merge closeout gate | Runs after merge to reconcile source issue, closeout evidence, and merged-state validation | Create/update post-merge exception only for failures that could not be deterministically blocked before merge |
| Post-merge PR lifecycle monitor | Post-merge support, remediation, self-healing, or evidence publication | Create/update existing Ops issue or evidence only |
| Scheduled/manual operation | Not part of normal PR workflow | No PR merge effect |
| Deprecated/legacy PR workflow | Old workflow retained temporarily, parked, duplicated, or superseded | Decommission unless explicitly adopted |

---

## Current-design PR workflow CI

| Workflow file | Visible check / workflow | PR phase | Classification | Failure handling | Current design status | Notes |
|---|---|---:|---|---|---|---|
| `.github/workflows/gate-quality.yml` | `GATE — Quality Checks` / `quality` | Pre-merge | Pre-merge required gate | Block merge | Official current-design PR CI | Owns structure, backend guard, tracked ZIP block, PR ZIP taint, typecheck, lint, tests, and build. |
| `.github/workflows/gitleaks.yml` | `GATE — Secret Scan` / `gitleaks` | Pre-merge | Pre-merge required gate | Block merge | Official current-design PR CI | Owns secret exposure detection. |
| `.github/workflows/ops-pr-issue-accounting.yml` | `GATE — PR Issue Accounting` / `pr-issue-accounting` | Pre-merge | Pre-merge required gate | Block merge | Official current-design PR CI despite `ops-` filename legacy | Owns exactly one same-repository non-PR source issue. Filename should be renamed in a future cleanup only if doing so will not break branch protection unexpectedly. |
| `.github/workflows/gate-post-merge-readiness.yml` | `GATE — Post-Merge Readiness` / `post-merge-readiness` | Pre-merge | Pre-merge required gate | Block merge | Official current-design PR CI | Must catch PR-body, allowlist, acceptance, auto-repair, reviewer disposition, and source-issue evidence that would otherwise fail post-merge closeout. |
| `.github/workflows/reviewer-response-completion.yml` | `GATE — Reviewer Response Completion` | Pre-merge | Pre-merge required gate or protected-scope gate | Block merge when protected/reviewer obligations fail | Official current-design reviewer lifecycle CI | If this workflow is active, it is current-design PR CI. If replaced by another filename, the replacement must inherit this role in inventory. |
| `.github/workflows/docs-guardrails.yml` | `Docs Guardrails` | Pre-merge | Pre-merge advisory/check hybrid | Advisory on PR; block only if branch protection makes it required | Official current-design docs guardrail | Contains PR hygiene advisory and docs header checks. Its advisory behavior should not be treated as merge approval. |
| `.github/workflows/design-compliance-warn.yml` | `Design Compliance (Warn)` | Pre-merge | Pre-merge advisory check | Do not block merge during warning rollout | Official advisory PR CI | Posts missing-template/design-process findings. If findings are routine hygiene blockers, move enforcement into required pre-merge gate rather than relying on post-merge closeout. |
| `.github/workflows/gate-branch-freshness.yml` | `GATE — Branch Freshness` | Pre-merge | Pre-merge advisory or required gate, depending on branch protection | Block merge only if branch protection requires it | Current PR CI, branch freshness surface | Should remain pre-merge only. It is not a post-merge closeout owner. |
| `.github/workflows/gate-intent-labeler.yml` | `GATE — Intent Labeler` | Pre-merge | Pre-merge required/advisory label classification support | Block merge only through downstream intent/drift enforcement or branch protection | Official current-design PR CI | Assigns or normalizes PR intent label. Mixed-intent should be resolved before merge. |
| `.github/workflows/gate-drift.yml` | `GATE — Drift Control` | Pre-merge | Pre-merge required/advisory governance gate, depending on branch protection | Block merge if configured as required or if failure identifies governance drift | Current PR CI with legacy overlap | Still includes some legacy ZIP/intent overlap. Keep active until drift-gate rebuild or consolidation lands. |
| `.github/workflows/design-authority-check.yml` | `Design Authority Check` | Pre-merge | Pre-merge advisory/check hybrid | Block merge only if branch protection requires it | Current PR CI support | Classify as PR workflow when it runs on PRs. Not a post-merge closeout owner. |
| `.github/workflows/diataxis-folder-authority-check.yml` | `DIATAXIS Folder Authority Check` | Pre-merge | Pre-merge advisory/check hybrid | Block merge only if branch protection requires it | Current PR CI support | Classify as PR workflow for documentation folder authority checks. |
| `.github/workflows/cursor-review.yml` | `Cursor PR Review` | Pre-merge | Pre-merge reviewer/advisory support | Do not block unless explicitly adopted into required checks | Current PR review support | Should produce reviewer evidence only; should not be treated as merge approval. |

---

## Post-merge PR workflow CI

| Workflow file | Visible check / workflow | PR phase | Classification | Failure handling | Current design status | Notes |
|---|---|---:|---|---|---|---|
| `.github/workflows/post-merge-closeout.yml` | `Post-Merge Detection` | Post-merge | Post-merge closeout gate | Create/update post-merge exception only for failures that could not be deterministically blocked before merge | Official current-design post-merge owner | Sole automatic source-issue closeout owner. Must not be duplicated by legacy closeout workflows. |
| `.github/workflows/post-merge-pr-body-closeout.yml` | `Post-Merge PR Body Closeout` | Post-merge/manual | Post-merge PR lifecycle monitor | Manual/backfill only; do not block PR merge | Official manual/backfill closeout support | Supports one-off and batch reconciliation. Not normal PR merge gating. |
| `.github/workflows/post-merge-remediation.yml` | `Post-Merge Remediation` | Post-merge | Post-merge PR lifecycle monitor | Create/update remediation issue after failed closeout | Official post-merge remediation support | Must not become pre-merge required check. |
| `.github/workflows/ops-post-merge-self-healing.yml` | `OPS — Post-Merge Self-Healing` | Post-merge/scheduled | Post-merge PR lifecycle monitor | Self-heal or add `ops-pr-escalation` to existing exception issue | Official post-merge hygiene support | Should reduce backlog, not create new child escalation issues. |
| `.github/workflows/diataxis-post-merge-validate.yml` | `DIATAXIS Post-Merge Validation` | Post-merge | Post-merge PR lifecycle monitor | Publish/upload post-merge DIATAXIS evidence; create follow-up only when needed | Current post-merge docs validation support | Not a pre-merge gate unless separately adopted. |
| `.github/workflows/post-merge-intent-verification.yml` | `Post-Merge Maintainer Body Apply` | Post-merge/targeted support | Post-merge PR lifecycle monitor / legacy support | Use only for targeted legacy maintainer body apply or dispatch support | Redesign/decommission candidate | Keep only if still needed for legacy PR-body apply path. Otherwise decommission. |

---

## Legacy or pre-design PR CI assessment

| Workflow file | Visible check / workflow | Legacy assessment | Required action |
|---|---|---|---|
| `.github/workflows/gate-close-work-issue.yml` | `gate-close-work-issue` | Parked no-op legacy workflow; no effective closeout ownership | Decommission when no historical reference or fallback need remains. Do not adopt into current design. |
| `.github/workflows/gate-reviewer-response.yml` | `GATE — Reviewer Response` | Retired manual-only/stub reviewer workflow superseded by reviewer lifecycle redesign | Decommission if still present and not used by branch protection. Do not adopt. |
| `.github/workflows/pr-triage-zip-taint.yml` | PR ZIP taint triage | Legacy/pre-design ZIP PR support overlapping with `gate-quality.yml` ZIP taint and `zip-history-audit.yml` | Decommission unless a current failing scenario proves unique coverage. Do not keep as duplicate PR CI. |
| `.github/workflows/ensure-ai-build-label.yml` | Ensure AI build label | Legacy/pre-design label workflow, likely outside current PR required surface | Decommission unless explicitly adopted into PR intent/label model. Prefer `gate-intent-labeler.yml` for current design. |
| `.github/workflows/bridge-optional-closeout.yml` | Optional closeout bridge | Legacy bridge/orchestration support, not normal PR gate | Keep out of PR workflow unless a current design doc adopts it. Decommission if unused. |
| `.github/workflows/bridge-1314-verification-closeout.yml` | Bridge 1314 verification closeout | Historical bridge-specific closeout support | Decommission when associated bridge program is closed and no active dispatch path remains. |
| `.github/workflows/post-recovery-425-verify.yml` | Post-recovery 425 verify | Historical recovery verification | Scheduled/manual recovery support only. Not PR workflow. |
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

---

## Required trigger-order rule

Routine PR hygiene defects must be detected pre-merge.

| Defect | Correct phase | Correct handling |
|---|---|---|
| Missing required PR body section | Pre-merge | Block before merge via required readiness/template gate |
| Missing or invalid source issue | Pre-merge | Block before merge via issue-accounting gate |
| File outside allowlist | Pre-merge | Block before merge via readiness/drift gate |
| Unchecked acceptance criterion without disposition | Pre-merge | Block before merge via post-merge-readiness gate |
| Undispositioned reviewer or bot comment | Pre-merge | Block before merge via reviewer lifecycle/readiness gate |
| Late reviewer comment after merge | Post-merge | Create/update post-merge exception only when it could not be known pre-merge |
| Source issue closeout evidence mismatch | Post-merge | Create/update post-merge exception |
| Production deploy/smoke evidence missing | Post-merge/release lifecycle | Create release/ops follow-up unless release evidence becomes a pre-merge requirement for that PR class |

---

## Adoption/decommission decision

For #2142, the immediate CI trigger follow-up should be limited to PR workflow mismatches visible from this inventory:

1. Make routine PR hygiene requirements pre-merge blockers where already machine-detectable.
2. Keep advisory PR checks advisory unless the repo intentionally adopts them into merge protection.
3. Decommission parked/legacy duplicate PR workflows only in a separate scoped PR after confirming they are not referenced by branch protection or active runbooks.
4. Do not expand this stabilization into full CI redesign.

## Rollback

Revert this document and any routing note that points to it. Do not revert workflow YAML from this document alone because this PR-workflow inventory is a classification artifact, not an implementation change.
