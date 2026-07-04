---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Current PR process baseline after #2228 closeout
Does Not Own: Canonical PR-process policy, live GitHub branch protection settings, GitHub App installation settings
Canonical Reference: /docs/governance/PR_PROCESS.md
Related issues: #2175, #2208, #2228
Last Reviewed: 2026-07-04
---

# PR Process Current State

This reference records the **current operational state** after the PR-process redesign closeout (#2228). It supports, but does not replace, `/docs/governance/PR_PROCESS.md`.

---

## Status

**PR Process Redesign complete in repository code and workflow disposition.**

- stable-facts PR bodies only;
- GitHub-native reviewer lifecycle (no PR-body ledger);
- rebuilt advisory gates with artifacts;
- class-aware required quality routing;
- single-owner post-merge closeout;
- lightweight PR-process metrics on merge;
- legacy marker workflows paused as manual-only pending rebuild.

**Remaining operator actions before closing #2175 / #2208:**

1. Verify live GitHub branch protection matches `/docs/reference/ci/merge-protection-surface.md` (`quality` + `gitleaks` only).
2. Confirm Codex auto-review remains disabled (operator UI).
3. Remove `post-merge-readiness` from branch protection if still listed (retired as pre-merge auto-trigger).

Advisory gates remain advisory until observation across merged PRs satisfies promotion criteria in `/docs/governance/PR_PROCESS.md`.

---

## Required checks

| Job id | Workflow | Behavior |
|---|---|---|
| `quality` | `gate-quality.yml` | Class-aware structure/ZIP/backend-ref/typecheck/lint/tests/build |
| `gitleaks` | `gitleaks.yml` | Secret scan |

## Active advisory checks (rebuilt)

| Job id | Workflow | Owner script | Behavior |
|---|---|---|---|
| `pr-hygiene` | `gate-pr-hygiene.yml` | `pr_hygiene_audit.mjs` | Stable PR-body validation; artifact; upsert comment; non-blocking |
| `diff-scope` | `gate-diff-scope.yml` | `diff_scope_gate.mjs` | Allowed-path diff validation; artifact; upsert comment; non-blocking |
| `reviewer-response-completion` | `reviewer-response-completion.yml` | `reviewer_lifecycle_gate.mjs` | GitHub-native review/thread state; artifact; non-blocking |

## Manual-only / rebuild later

| Workflow | Disposition | Rationale |
|---|---|---|
| `gate-intent-labeler.yml` | Manual-only | Avoid label mutation loops until rebuilt advisory-first |
| `ops-pr-issue-accounting.yml` | Manual-only | Paused; must not be required while manual-only |
| `gate-drift.yml` | Manual-only | Retired auto-trigger marker; rebuild as advisory if needed |
| `gate-branch-freshness.yml` | Manual-only | Retired auto-trigger marker; rebuild as advisory if needed |
| `docs-guardrails.yml` | Manual-only | Retired auto-trigger marker; rebuild as advisory if needed |
| `design-compliance-warn.yml` | Manual-only | Retired auto-trigger marker; rebuild as advisory if needed |
| `gate-post-merge-readiness.yml` | Manual-only | Retired pre-merge auto-trigger; manual backfill only |

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

## Rebuild / closeout task status

| Task | Status |
|---|---|
| 3 PR hygiene advisory | **Complete** (#2224) |
| 4 Diff scope advisory | **Complete** (#2225) |
| 5 Reviewer lifecycle advisory | **Complete** (#2225) |
| 6 Class-aware quality | **Complete** (#2225) |
| 7 Branch protection reference | **Complete** — live GitHub verification pending operator |
| 8 Post-merge closeout | **Complete** |
| 9 Metrics | **Complete** (#2225, #2228 PR A) |
| 10 Closeout / disposition | **Complete** (#2228 PR B) |

---

## Do not promote without evidence

Do not promote advisory gates to required or reintroduce PR-body lifecycle mutation. See `/docs/governance/PR_PROCESS.md`, `/docs/reference/ci/pr-process-metrics.md`, and promotion criteria in #2228.

---

## Related references

- `/docs/governance/PR_PROCESS.md`
- `/docs/reference/ci/merge-protection-surface.md`
- `/docs/reference/ci/pr-workflow-ci-inventory.md`
- `/docs/reference/ci/pr-process-metrics.md`
- `/docs/reference/ci/pr-process-skeleton-validation.md`
- `/docs/reference/ci/codex-pr-review-disablement.md`
