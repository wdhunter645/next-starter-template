---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Current PR process baseline after rebuild tasks 3–10
Does Not Own: Canonical PR-process policy, live GitHub branch protection settings, GitHub App installation settings
Canonical Reference: /docs/governance/PR_PROCESS.md
Related issues: #2175, #2208
Last Reviewed: 2026-07-04
---

# PR Process Current State

This reference records the **current state** after Cursor completed PR-process rebuild tasks 3–10. It supports, but does not replace, `/docs/governance/PR_PROCESS.md`.

---

## Status

**Rebuild tranche complete in repository code.** The PR process now uses:

- stable-facts PR bodies only;
- GitHub-native reviewer lifecycle (no PR-body ledger);
- rebuilt advisory gates with artifacts;
- class-aware required quality routing;
- single-owner post-merge closeout;
- lightweight PR-process metrics on merge.

**Remaining operator actions before closing #2175 / #2208:**

1. Verify live GitHub branch protection matches `/docs/reference/ci/merge-protection-surface.md`.
2. Observe advisory gate noise across several PRs before promoting any advisory gate to required.
3. Confirm Codex auto-review remains disabled (operator UI).
4. Decide final disposition of marker workflows (drift, branch-freshness, docs-guardrails, design-compliance, intent-labeler).

---

## Required checks

| Job id | Workflow | Behavior |
|---|---|---|
| `quality` | `gate-quality.yml` | Class-aware structure/ZIP/typecheck/lint/tests/build |
| `gitleaks` | `gitleaks.yml` | Secret scan |

## Active advisory checks (rebuilt)

| Job id | Workflow | Owner script | Behavior |
|---|---|---|---|
| `pr-hygiene` | `gate-pr-hygiene.yml` | `pr_hygiene_audit.mjs` | Stable PR-body validation; artifact; upsert comment; non-blocking |
| `diff-scope` | `gate-diff-scope.yml` | `diff_scope_gate.mjs` | Allowed-path diff validation; artifact; upsert comment; non-blocking |
| `reviewer-response-completion` | `reviewer-response-completion.yml` | `reviewer_lifecycle_gate.mjs` | GitHub-native review/thread state; artifact; upsert comment; non-blocking |

## Manual-only / marker (not final)

| Workflow | Status |
|---|---|
| `gate-intent-labeler.yml` | Manual-only marker |
| `ops-pr-issue-accounting.yml` | Manual-only marker |
| `gate-drift.yml` | Auto-trigger marker no-op |
| `gate-branch-freshness.yml` | Auto-trigger marker no-op |
| `docs-guardrails.yml` | Auto-trigger marker no-op |
| `design-compliance-warn.yml` | Auto-trigger marker no-op |

## Post-merge and metrics

| Workflow | Role |
|---|---|
| `post-merge-closeout.yml` | Single automatic closeout owner on merged PRs |
| `ops-post-merge-self-healing.yml` | Scheduled/manual only; no issue/push self-trigger loop |
| `ops-pr-process-metrics.yml` | Records first-pass/second-pass metrics artifact on merged PRs |

## External automation

- **Codex:** automatic PR review disabled at operator UI; do not re-enable.
- **Cubic:** external; may append PR summaries and post reviews.
- **Cursor PR Review:** repo advisory; scope validation only.

---

## Rebuild task status

| Task | Status |
|---|---|
| 3 PR hygiene advisory | **Complete** (#2224) |
| 4 Diff scope advisory | **Complete** (this tranche) |
| 5 Reviewer lifecycle advisory | **Complete** (this tranche) |
| 6 Class-aware quality | **Complete** (this tranche) |
| 7 Branch protection reference | **Complete** — live GitHub verification pending operator |
| 8 Post-merge closeout | **Complete** — existing single owner retained; self-healing decoupled |
| 9 Metrics | **Complete** — `pr_process_metrics.mjs` + `ops-pr-process-metrics.yml` |
| 10 Closeout | **Pending operator** — verify live settings + advisory observation window |

---

## Do not re-enable without advisory evidence

Do not promote advisory gates to required or reintroduce PR-body lifecycle mutation. See `/docs/governance/PR_PROCESS.md` and `/docs/reference/ci/pr-process-metrics.md`.

---

## Related references

- `/docs/governance/PR_PROCESS.md`
- `/docs/reference/ci/merge-protection-surface.md`
- `/docs/reference/ci/pr-workflow-ci-inventory.md`
- `/docs/reference/ci/pr-process-metrics.md`
- `/docs/reference/ci/pr-process-skeleton-validation.md`
- `/docs/reference/ci/codex-pr-review-disablement.md`
