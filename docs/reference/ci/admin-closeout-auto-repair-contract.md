---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: CI-002 administrative closeout classifier outcomes, dry-run auto-repair boundary, and blocker safety rules
Does Not Own: Merge authorization, automatic post-merge closeout ownership, product defect repair, or apply-mode GitHub mutations
Canonical Reference: /docs/ops/implementation-plans/content-collection/packages/ci-002-admin-closeout-auto-repair-package.md
Related Issues: #2437, #2435, #2436, #2431
Last Reviewed: 2026-07-21
---

# Admin Closeout Auto-Repair Contract

## Purpose

Define the CI-002 administrative closeout classifier and dry-run repair boundary so
deterministic administrative-only closeout defects can be planned safely without
auto-repairing product, build, test, security, auth, privacy, design, data,
scope, or unresolved reviewer defects.

## Scope

In scope:

- Classifier inputs and outcomes for administrative closeout findings
- Dry-run classification CLI (`closeout_classifier.mjs`)
- Dry-run repair planning CLI (`admin_closeout_auto_repair.mjs`)
- Fixture coverage for required CI-002 cases
- Outcome naming reconciliation with the existing self-heal classifier

Out of scope:

- Apply-mode GitHub mutations (disabled in this delivery)
- Replacing `post-merge-closeout.yml` / `run_post_merge_closeout.mjs` ownership
- Auto-approval, auto-merge, or reviewer-intent inference
- Product/feature remediation

## Current known truth

| Surface | Path | Role |
| --- | --- | --- |
| Self-heal classifier | `scripts/ci/post_merge_self_heal_classify.mjs` | Existing classification contract (wrap, do not fork) |
| CI-002 classifier | `scripts/ci/closeout_classifier.mjs` | Admin closeout outcomes + dry-run CLI |
| CI-002 repair planner | `scripts/ci/admin_closeout_auto_repair.mjs` | Dry-run plan only; apply refused |
| Fixtures | `scripts/ci/fixtures/admin_closeout/` | Required outcome cases |
| Tests | `tests/closeout_classifier.test.mjs` | Unit coverage |
| Package envelope | `docs/ops/implementation-plans/content-collection/packages/ci-002-admin-closeout-auto-repair-package.md` | Operational plan |
| Stage 0 boundary | `docs/reference/ci/ci-stage-0-tooling-boundary-inventory.md` | Non-duplication inventory |

`post-merge-closeout.yml` remains the sole automatic source-issue closeout owner.

## Classifier outcomes

| Outcome | Meaning | Auto-repair |
| --- | --- | --- |
| `safe_auto_fix` | Administrative only; evidence complete; deterministic | Planned in dry-run; apply deferred |
| `queue_admin_closeout` | Administrative; not safe to mutate automatically | Queue only |
| `cursor_remediation_required` | Product/build/test/data/design/reviewer issue | Never |
| `operator_authorization_required` | Bill / ChatGPT decision required | Never |
| `no_action` | No remaining defect | None |

### Naming reconciliation

Stage 0 noted that the CI-002 package uses `queue_admin_closeout` while the
self-heal contract uses `intentionally_deferred`. CI-002 maps
`intentionally_deferred` → `queue_admin_closeout` for administrative closeout
planning. Self-heal classification remains authoritative for its own callers;
CI-002 wraps it rather than duplicating finding-type tables.

## Precedence

When multiple findings are present, the highest-priority outcome wins:

1. `operator_authorization_required`
2. `cursor_remediation_required`
3. `queue_admin_closeout`
4. `safe_auto_fix`
5. `no_action`

Ambiguous evidence never reaches `safe_auto_fix`.

## Required fixture cases

| Fixture | Expected outcome |
| --- | --- |
| `stale_label_after_clean_merge.json` | `safe_auto_fix` |
| `failed_required_test.json` | `cursor_remediation_required` |
| `missing_validation_evidence.json` | `cursor_remediation_required` (blocker; no issue close) |
| `duplicate_exception_issue.json` | `safe_auto_fix` |
| `ambiguous_source_issue.json` | `operator_authorization_required` |
| `admin_warning_queue.json` | `queue_admin_closeout` |

## Safe vs unsafe actions

### Safe (planned only while apply is disabled)

- Add administrative closeout comment summarizing CI evidence
- Reconcile stale terminal labels when merge + validation evidence is clean
- Close duplicate administrative exception with canonical reference

### Unsafe (never auto-repaired)

- Failed tests/checks or missing validation evidence
- Product, security, auth, privacy, design, data, or scope defects
- Unresolved reviewer objections
- Ambiguous source issue lineage
- Merge authorization, auto-approval, or auto-merge

## Dry-run requirement

Both CLIs require `--dry-run`:

```bash
node scripts/ci/closeout_classifier.mjs --dry-run --fixture scripts/ci/fixtures/admin_closeout/stale_label_after_clean_merge.json
node scripts/ci/closeout_classifier.mjs --dry-run --pr 2701
node scripts/ci/admin_closeout_auto_repair.mjs --dry-run --fixture scripts/ci/fixtures/admin_closeout/duplicate_exception_issue.json
```

`--pr <number>` resolves a local fixture at
`scripts/ci/fixtures/admin_closeout/pr-<number>.json` only. Live GitHub fetch is
not performed by the dry-run classifier.

`--apply` is refused with a non-zero exit until a later authorized delivery.

## Authority boundary

- Bill / ChatGPT retain merge and protected-boundary authority
- Classifier and repair planner do not approve or merge pull requests
- Blocker classes cannot be marked `may_auto_repair`
- Apply-mode workflow integration remains deferred after fixture soak

## Governance invariant

CI-002 cannot:

- bypass `post-merge-closeout.yml` ownership
- auto-close issues with failed or missing validation
- resolve reviewer objections without human disposition
- mutate secrets, production configuration, or runtime app code
- enable apply mode without explicit later authorization
