---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor, LGFC maintainers, CI maintainers
Authority Level: Operational Plan (non-authoritative until promoted via Issue/PR)
Owns: CI-002 implementation envelope — safe administrative closeout auto-repair boundary for Content Collection program
Does Not Own: Product defect repair, merge authorization, reviewer disposition, or live classifier implementation (#2361 is docs-only)
Canonical Reference: /docs/reference/ci/post-merge-validation-surface.md
Related Issues: #2409, #2361, #2359, #2360, #1131
Last Reviewed: 2026-07-08
---

# CI-002 Administrative Closeout Auto-Repair Package

## Purpose

Define the safe boundary for administrative closeout auto-repair: classify label, closeout-comment, stale-exception, and PR-body bookkeeping findings so **administrative-only** issues do not block unrelated feature momentum when product evidence is clean.

CI-002 does **not** repair product, scope, security, build, data, auth, or design defects automatically.

## Scope

**In scope:**

- Finding classes (administrative warning vs blocker).
- Safe vs unsafe auto-repair actions.
- Classifier inputs and decision outcomes.
- Repo-verified existing closeout scripts and future implementation paths.

**Out of scope:**

- Bypassing Bill/ChatGPT merge authorization.
- Closing issues with failed/missing validation.
- Resolving reviewer objections without disposition.
- Implementing classifier scripts in #2361 (Phase P1 child issue).

## Current known truth

| Surface | Repo path | Role |
| --- | --- | --- |
| Post-merge validator | `scripts/ci/post_merge_validator.mjs` | Closeout validation |
| Post-merge closeout runner | `scripts/ci/run_post_merge_closeout.mjs` | Orchestrates closeout |
| Source issue closeout | `scripts/ci/post_merge_source_issue_closeout.mjs` | Issue closure helpers |
| Remediation issue creator | `scripts/ci/post_merge_remediation_issue.mjs` | Exception tracking |
| PR body auto-repair | `scripts/ci/run_pr_body_auto_repair.mjs` | Deterministic body fixes |
| Closeout surface doc | `docs/reference/ci/post-merge-validation-surface.md` | Reference |
| Verification closeout skill | `.agents/skills/lgfc-verification-closeout/SKILL.md` | Agent procedure |
| Admin closeout classifier | `scripts/ci/closeout_classifier.mjs` | **Missing** — P1 implementation |
| Admin auto-repair | `scripts/ci/admin_closeout_auto_repair.mjs` | **Missing** — P1 implementation |
| Intake `docs/ops/programs/...` path | — | **Rejected** per #2360 |

**Approved package path:** `docs/ops/implementation-plans/content-collection/packages/ci-002-admin-closeout-auto-repair-package.md`

## Finding classes

### Administrative warnings (may auto-repair or queue)

- Stale label after merge.
- Dashboard lifecycle mismatch.
- Duplicate post-merge exception issue.
- Missing closeout evidence comment where CI evidence exists.
- Source task not closed despite merged PR and clean evidence.
- Non-critical PR body formatting mismatch post-merge.
- Missing non-critical status comment.
- Stale administrative queue item.

### Blockers (never auto-repair)

- Build, test, or typecheck failure.
- Security or secret finding.
- Auth or public/private exposure defect.
- Route/API failure.
- Data corruption risk.
- Missing required validation evidence.
- Unapproved scope expansion.
- Unresolved review objection affecting implementation.
- Missing or ambiguous source issue.
- Package contract violation.
- Design compliance failure where design is acceptance-critical.

## Safe auto-repair actions

Allowed **only** with deterministic evidence:

- Add administrative closeout comment summarizing CI evidence.
- Apply terminal label when issue, PR, checks, and acceptance align.
- Close duplicate administrative exception with canonical reference.
- Mark item queued for program closeout.
- Update program closeout checklist item.
- Reconcile status text when machine-readable evidence is unambiguous.
- Create non-blocking administrative closeout issue.

## Unsafe auto-repair actions (require human authorization)

Never auto-repair without Bill/ChatGPT:

- Product code defects.
- Failed tests/checks.
- Auth, middleware, privacy, or security defects.
- Database/schema/migration defects.
- Public/private exposure issues.
- Unresolved review comments requiring judgment.
- Design disputes or scope expansion.
- Missing acceptance criteria.
- Ambiguous source issue lineage.

## Classifier decision outcomes

| Outcome | Meaning |
| --- | --- |
| `safe_auto_fix` | Administrative only; evidence complete; deterministic repair |
| `queue_admin_closeout` | Administrative; not safe to mutate automatically |
| `cursor_remediation_required` | Product/build/test/data/design issue — Cursor remediates |
| `operator_authorization_required` | Bill/ChatGPT decision required |
| `no_action` | No defect remains |

## Classifier inputs (required)

- PR number, source issue, merged status, base branch.
- Check status and validation evidence status.
- PR body source/package/validation fields.
- Labels/status before repair.
- Existing closeout exception issues.
- Reviewer thread disposition (when available).
- Package path and affected files.
- Blocker classification from table above.

## Naming convention

| Artifact kind | Convention | Example |
| --- | --- | --- |
| `scripts/ci/*.mjs` | **underscore** (matches `post_merge_validator.mjs`, `run_post_merge_closeout.mjs`) | `closeout_classifier.mjs`, `admin_closeout_auto_repair.mjs` |
| `scripts/ci/fixtures/` | **underscore** directory names | `fixtures/admin_closeout/` |
| `tests/` | **underscore** prefixes where applicable | `closeout_classifier.test.mjs` |
| `docs/reference/ci/*.md` | **hyphen** reference doc filenames | `admin-closeout-auto-repair-contract.md` |
| `.github/workflows/*.yml` | **hyphen** workflow filenames (existing repo pattern) | `post-merge-closeout.yml`, `ops-post-merge-self-healing.yml` |

Allowlist globs below use underscore patterns for scripts/fixtures/tests and hyphen patterns for workflow filenames.

## Repo-verified implementation surfaces

| Path | Status |
| --- | --- |
| `scripts/ci/post_merge_validator.mjs` | Exists |
| `scripts/ci/run_post_merge_closeout.mjs` | Exists |
| `scripts/ci/run_pr_body_auto_repair.mjs` | Exists |
| `scripts/ci/closeout_classifier.mjs` | To create (P1) |
| `scripts/ci/admin_closeout_auto_repair.mjs` | To create (P1) |
| `scripts/ci/fixtures/admin_closeout/` | To create (P1) |
| `docs/reference/ci/admin-closeout-auto-repair-contract.md` | To create with implementation |
| This package | Operational envelope |

## File allowlist (CI-002 implementation child issue)

```text
scripts/ci/**closeout**
scripts/ci/**self_healing**
tests/**closeout**
tests/**self_healing**
docs/ops/implementation-plans/content-collection/packages/ci-002-admin-closeout-auto-repair-package.md
docs/reference/ci/admin-closeout-auto-repair-contract.md
.github/workflows/*closeout*.yml
.github/workflows/*self-healing*.yml
```

`scripts/ci/**closeout**` matches existing underscore closeout scripts (for example `post_merge_closeout.mjs`). Workflow globs use hyphens because workflow filenames in this repo use hyphens.

**Do not touch without approval:** feature implementation files, content asset libs, fanclub UI, middleware/auth, unrelated deploy workflows.

## Dependency

- **CI Stage 0** gap analysis complete — see `docs/ops/reports/ci-stage-0-current-state-gap-analysis.md` and `docs/reference/ci/ci-stage-0-tooling-boundary-inventory.md` (#2435). Extend `post_merge_self_heal_classify.mjs` rather than duplicating classifier logic; do not replace `post-merge-closeout.yml` ownership.
- CI-001 (#2436) should merge before CI-002 implementation so PR body fields are standardized.
- VAL-001 terminal validation references administrative queue disposition.

## Validation plan

**Fixture cases (when implemented):**

| Case | Expected outcome |
| --- | --- |
| Stale label after clean merge | `safe_auto_fix` or `queue_admin_closeout` |
| Failed required test | `cursor_remediation_required` — never auto-fix |
| Missing validation evidence | Blocker — no issue close |
| Duplicate exception issue | Safe close/link |
| Ambiguous source issue | `operator_authorization_required` |

**Commands:**

```bash
npm test -- --run tests/closeout*
node scripts/ci/closeout_classifier.mjs --dry-run --pr <number>
```

**Dry-run mode required** before any apply mode ships.

**Pass:** Administrative issues repairable without blocking features; blockers never auto-repaired.

**Fail:** Classifier mislabels product/security/build issue as administrative.

## Procedure

1. Inventory existing closeout scripts (CI Stage 0).
2. Implement classifier with fixtures for every outcome row.
3. Ship dry-run mode first; apply mode only after fixture pass rate is clean.
4. Serialize workflow changes around active feature PRs.
5. Post `CHATGPT HANDOFF` if classifier would touch merge authorization or reviewer threads.

## Acceptance criteria

- [ ] Safe vs unsafe actions explicitly documented.
- [ ] Classifier outcomes and inputs defined.
- [ ] Existing closeout scripts referenced with verified paths.
- [ ] Bill/ChatGPT authority preserved; blockers never auto-repaired.
- [ ] Implementation deferred to P1 with file allowlist.
- [ ] Dry-run requirement stated before apply mode.
