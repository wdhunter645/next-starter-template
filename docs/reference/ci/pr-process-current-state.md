---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Current PR process baseline during P1 rebuild
Does Not Own: Canonical PR-process policy, final branch protection settings, GitHub App installation settings
Canonical Reference: /docs/governance/PR_PROCESS.md
Related issues: #2175, #2208
Last Reviewed: 2026-07-04
---

# PR Process Current State

This reference records the **temporary current state** of the PR-process rebuild. It supports, but does not replace, `/docs/governance/PR_PROCESS.md` (canonical policy established in #2218).

**Operator rule:** Until #2175 and #2208 are closed, PR-process CI stays in safe-mode unless a later small PR intentionally changes one workflow after advisory evidence.

---

## Status

The repository is in **PR-process rebuild mode**.

The current process is intentionally **safe-mode**, not the final design. Legacy PR-process CI has been reduced so PR-process repair work can merge without repeatedly fighting the old process.

Cursor took over completion of #2175 / #2208 on 2026-07-04 after emergency stabilization (#2206–#2214) and documentation consolidation (`292a35a`).

---

## Current in-use PR process

1. Work starts from a GitHub issue.
2. PR body uses the stable-facts template (`.github/pull_request_template.md`).
3. PR body must include: source issue, intent label, PR class, allowed paths, out-of-scope declaration, change summary, verification, acceptance criteria, follow-up issue declaration, and reviewer/bot review attestation.
4. **Dynamic lifecycle state must not be stored in the PR body** — no review-comment IDs, thread-state text, READY FOR MERGE body status, CI ledgers, or post-merge closeout ledgers.
5. PR-process CI is held in safe-mode during the P1 rebuild.
6. Marker and manual workflows preserve workflow/check names while final validation is rebuilt.
7. Post-merge closeout ownership is consolidated and must not self-trigger through workflow cascades.

---

## What is active now

### Deterministic required checks (target surface)

Per `/docs/reference/ci/merge-protection-surface.md`:

| Job id | Workflow | Behavior |
|---|---|---|
| `quality` | `gate-quality.yml` | Marker (`echo ok`) — name preserved for branch protection |
| `gitleaks` | `gitleaks.yml` | **Real** secret scan |

Live GitHub branch protection must be verified against this reference (Gap 2 in #2175).

### Active safety / non-PR-process checks

These run on PRs and are **not** part of the legacy PR-process redesign debt:

- `GATE — Secret Scan` (`gitleaks.yml`) — real enforcement
- `ZIP History Audit (Full History)` — repo safety
- Agent governance workflows
- Design authority / DIATAXIS checks where wired
- `Cursor PR Review` (`cursor-review.yml`) — see [External and repo-owned automation](#external-and-repo-owned-automation)

### Auto-triggering marker workflows (pass quickly, no real validation)

These still fire on PR events but execute no-op marker steps only:

| Workflow | Triggers | Marker step |
|---|---|---|
| `gate-quality.yml` | `pull_request`, `push`, `workflow_dispatch` | `echo ok` |
| `gate-drift.yml` | `pull_request`, `workflow_dispatch` | `pwd` |
| `gate-branch-freshness.yml` | `pull_request`, `workflow_dispatch` | `pwd` |
| `docs-guardrails.yml` | `pull_request`, `push/main`, `workflow_dispatch` | `pwd` |
| `design-compliance-warn.yml` | `pull_request`, `workflow_dispatch` | `pwd` |
| `reviewer-response-completion.yml` | `pull_request_target`, `pull_request_review`, `workflow_dispatch` | `pwd` |

**Not final design.** These preserve check names and avoid branch-protection deadlocks. Each needs a final disposition: delete, manual/advisory only, or rebuild as deterministic validation.

---

## What is paused / manual-only

These workflows **do not auto-run** on PR open/sync. They require `workflow_dispatch`:

| Workflow | Job id | Current behavior |
|---|---|---|
| `gate-intent-labeler.yml` | `label-intent` | Marker (`pwd`) |
| `gate-diff-scope.yml` | `diff-scope` | Marker (`pwd`) |
| `ops-pr-issue-accounting.yml` | `pr-issue-accounting` | Marker (`pwd`) |

Validated: #2212, #2214 confirmed Intent Labeler, Diff Scope, and PR Issue Accounting do not run automatically and issue-accounting does not comment on new PRs.

---

## Rebuilt advisory checks

| Workflow | Job id | Behavior |
|---|---|---|
| `gate-pr-hygiene.yml` | `pr-hygiene` | Validates stable PR-body facts via `pr_hygiene_audit.mjs`; advisory/non-blocking; one upsert marker comment; machine-readable artifact; **no PR body mutation** |

Task 3 rebuild PR must validate this gate on a probe PR before Task 4 (diff-scope advisory).

---

## External and repo-owned automation

### Codex (external — disabled)

- **Status:** Bill disabled automatic Codex PR code review at the ChatGPT/Codex account UI level.
- **Policy:** `/docs/reference/ci/codex-pr-review-disablement.md`
- **Do not** re-enable automatic Codex PR review. Do not uninstall the ChatGPT/Codex GitHub connector unless explicitly instructed.
- **Verification:** Each validation PR must confirm no Codex reviewer request and no automatic Codex review comment.

### Cubic (external — still active)

- Appends PR body summary blocks and posts PR reviews.
- **No repo workflow source found** — treat as external GitHub App / integration configuration.
- Operator action to reduce noise is outside repo code unless a repo-owned disable path is discovered.
- Validation PRs should record whether Cubic appended a summary (expected) separately from repo-owned gate behavior.

### Cursor PR Review (repo-owned — active, advisory)

- Workflow: `.github/workflows/cursor-review.yml`
- Triggers: `pull_request` opened / synchronize / reopened
- Behavior: validates changed files against Cursor rules; fails only if duplicate `docs/CURSOR_RULES.md` would be introduced
- Permissions: `pull-requests: write` (does not mutate PR body in current script)
- **Recommendation during rebuild:** keep as advisory; consider reducing to read-only permissions after rebuild stabilizes

---

## What is not final design

The following are **deliberate temporary compromises**, not target-state behavior:

1. Six PR-process workflows are marker-only no-ops while preserving check names.
2. Three PR-process workflows are manual-only markers with real scripts not yet wired back in advisory mode.
3. `reviewer_comment_disposition.mjs` compatibility exports remain until reviewer lifecycle rebuild is complete.
4. Class-aware quality routing exists in scripts but is not enforced by CI yet.
5. First-pass / second-pass PR success metrics are not yet measured.
6. Live branch protection may still list retired or marker checks — must be verified.

---

## Rebuild sequence (Cursor ownership)

Execute in order. One concern per PR. Advisory before required. No PR-body mutation.

| Step | Task | Deliverable | Gate mode |
|---|---|---|---|
| 3 | PR hygiene | `pr_hygiene_audit.mjs` wired advisory via `gate-pr-hygiene.yml` | **In progress** — advisory |
| 4 | Diff scope | `diff_scope_gate.mjs` wired advisory; machine-readable artifact; no body mutation | Advisory |
| 5 | Reviewer lifecycle | `reviewer_lifecycle_gate.mjs` GitHub-native only; no PR-body ledger; remove disposition compat when safe | Advisory first |
| 6 | Class-aware quality | `pr_class_quality_plan.mjs` routes checks by PR class; no long build for docs-only | Advisory first |
| 7 | Branch protection | Verify live settings; align `merge-protection-surface.md`; required = deterministic only | Reference + operator |
| 8 | Post-merge closeout | Single owner; idempotent; no self-trigger loop | Rebuild + validate |
| 9 | Metrics | First-pass / second-pass success; failure source taxonomy | Lightweight artifact |
| 10 | Closeout | Close #2175 / #2208 after one clean validation PR on final behavior | — |

---

## Do not re-enable without advisory evidence

**Never re-promote to required / blocking unless a validation PR proves low-noise behavior:**

- PR-body auto-repair or lifecycle scaffold injection
- Review-comment ID accounting in PR body
- Review-thread state text in PR body
- READY FOR MERGE / merge-readiness status in PR body
- Post-merge closeout state in PR body
- Intent Labeler auto-mutation loops
- Diff Scope as blocking before advisory artifact review
- PR Issue Accounting as blocking while manual-only
- Reviewer Response Completion legacy PR-body gate
- Drift / Branch Freshness / Docs Guardrails / Design Compliance as blocking before rebuild
- Codex automatic PR review
- Any workflow that retriggers from its own issue/comment/label writes

**Safe to keep required now:** secret scan (`gitleaks`), and other deterministic non-PR-process safety checks.

---

## Known gaps (#2175 acceptance criteria still open)

1. Live branch-protection required checks verified against reduced surface
2. Marker/manual workflows have final dispositions
3. Remaining reviewer-disposition compatibility code removed or explicitly retained with rationale
4. Validation artifact model finalized beyond diff-scope
5. First-pass / second-pass PR success metrics established
6. Operator-facing docs fully aligned before #2175 closes

Codex auto-review disablement: operator-confirmed at UI level; repo documents guardrail. Continue recording validation evidence on #2208.

---

## Related references

- `/docs/governance/PR_PROCESS.md` — canonical policy
- `/docs/reference/ci/merge-protection-surface.md` — required check surface
- `/docs/reference/ci/pr-workflow-ci-inventory.md` — workflow classification
- `/docs/reference/ci/pr-process-skeleton-validation.md` — validation probe evidence
- `/docs/reference/ci/codex-pr-review-disablement.md` — Codex policy
- `/docs/reference/ci/pr-process-rebuild-retired-assets.md` — retired asset inventory
