---
Doc Type: Report
Audience: Bill, ChatGPT, Cursor, LGFC maintainers, CI maintainers
Authority Level: Operational Evidence (non-authoritative until promoted via Issue/PR)
Owns: CI Stage 0 current-state inventory, CI-001/CI-002 boundary analysis, and sequencing recommendation for Content Collection Phase 1
Does Not Own: Merge authorization, workflow implementation, or live script behavior
Canonical Reference: /docs/reference/ci/pr-hygiene-foundation.md
Related Issues: #2435, #2431, #2436, #2437, #2409, #2361
Last Reviewed: 2026-07-21
---

# CI Stage 0 Current-State Gap Analysis

## Purpose

Inventory existing PR hygiene, post-merge closeout, documentation validation, and governance automation before CI-001 and CI-002 implementation. Define generator, validator, and auto-repair boundaries so Phase 1 tooling does not duplicate or conflict with current automation.

## Scope

This report covers read-only inspection of `scripts/ci/**`, `.github/workflows/**`, and `docs/reference/ci/**` as of branch `component/content-collection-phase1` at issue #2435 dispatch. No workflow or script behavior was changed.

## Executive summary

| Finding | Result |
| --- | --- |
| PR hygiene audit surface | **Exists** — advisory post-open validator only |
| PR body auto-repair | **Exists** — post-open repair, not pre-open generation |
| Local PR preflight | **Exists** — unified local check, not Content Collection generator |
| Post-merge closeout owner | **Exists** — single owner `post-merge-closeout.yml` |
| Post-merge self-heal classifier | **Partial** — classification contract exists; apply-mode auto-repair missing |
| CI-001 generator / preclearance validator | **Missing** — planned in #2436 |
| CI-002 admin closeout classifier / auto-repair | **Missing** — planned in #2437; overlaps with existing self-heal classifier |
| Duplication risk | **Low** if CI-001 stays pre-PR and CI-002 extends (not replaces) self-heal contract |
| Recommended sequencing | **Separate PRs** — #2436 then #2437, serial in P6 lane |

## Recommendation for #2431

**Proceed with CI-001 (#2436) and CI-002 (#2437) as separate PRs, serialized in order.**

Rationale:

1. **Different lifecycle phases** — CI-001 is pre-open procedural preclearance; CI-002 is post-merge administrative repair. They do not share the same mutation boundary.
2. **Different file allowlists** — CI-001 touches `**pr_body**` / `**pr_hygiene**`; CI-002 touches `**closeout**` / `**self_healing**` and closeout workflows. Merging into one PR would violate single-intent discipline and increase hot-zone collision risk.
3. **Explicit task graph** — #2437 lists #2436 as predecessor. CI-002 classifier inputs include PR body fields that CI-001 will standardize.
4. **Lane concurrency** — P6 CI Orchestration `max_active_tasks_in_lane: 1` requires serialization.
5. **Non-duplication confirmed** — Existing surfaces do not generate PR bodies pre-open or apply administrative closeout repairs. CI-001 and CI-002 fill documented gaps without replacing `post-merge-closeout.yml` ownership.

**Do not begin #2436 or #2437 until this report is merged and Atlas records acceptance on #2431.**

---

## 1. PR hygiene and preclearance inventory

### 1.1 Existing scripts

| Script | Role | Phase | Blocking | CI-001 relationship |
| --- | --- | --- | --- | --- |
| `scripts/ci/pr_hygiene_audit.mjs` | Detect issue line, ZIP statement, template sections, allowlist coverage | Post-open | Advisory | **Extend or complement** — does not generate bodies; CI-001 validator may share section/placeholder rules |
| `scripts/ci/run_pr_body_auto_repair.mjs` | GitHub API wrapper for body repair | Post-open | Non-blocking repair | **Do not replace** — different phase (repair vs generate) |
| `scripts/ci/pr_body_auto_repair.mjs` | Deterministic body repair/scaffold logic | Post-open | Non-blocking repair | **Do not replace** — adds managed block to open PRs |
| `scripts/ci/pr_preflight.mjs` | Unified local preflight (delivery profile, scope, source issue, closeout prediction) | Pre-open (local) | Local exit codes | **Complement** — agent-run local check; not CC package-scoped generator |
| `scripts/ci/issue_accounting.mjs` | Source issue line parsing and validation | Pre/post | Used by gates | **Reuse logic** — CI-001 should import or mirror canonical issue-line rules |
| `scripts/ci/diff_scope_gate.mjs` | Allowlist vs changed-file comparison | Post-open | Advisory | **Complement** — CI-001 preclearance should validate allowlist before PR open |
| `scripts/ci/reviewer_lifecycle_gate.mjs` | Reviewer thread/disposition assessment | Post-open | Advisory | **Out of scope** for CI-001 |
| `scripts/ci/reviewer_comment_disposition.mjs` | Disposition parsing | Post-open | Advisory | **Out of scope** for CI-001 |

### 1.2 Existing workflows

| Workflow | Job | Classification | CI-001 relationship |
| --- | --- | --- | --- |
| `gate-pr-hygiene.yml` | `pr-hygiene` | Advisory | **Do not modify** in CI-001 unless separately authorized; generator runs locally pre-PR |
| `gate-intent-labeler.yml` | — | Manual-only | **Do not touch** |
| `gate-diff-scope.yml` | `diff-scope` | Advisory | **Do not touch** |
| `reviewer-response-completion.yml` | `reviewer-response-completion` | Advisory | Triggers auto-repair; **do not wire CI-001 generator here** |
| `docs-guardrails.yml` | — | Manual-only | **Do not touch** |
| `diataxis-folder-authority-check.yml` | — | Manual/advisory | **Do not touch** |

### 1.3 Documentation validation scripts

| Script | Role | CI-001 relationship |
| --- | --- | --- |
| `scripts/ci/docs_check_headers.sh` | Required authority header validation | **Independent** — CI-001 may reference as validation command in generated body |
| `scripts/ci/docs_check_paths.sh` | Documentation path bucket validation | **Independent** |
| `scripts/ci/diataxis_folder_audit.mjs` | DIATAXIS folder intent validation | **Independent** |
| `scripts/ci/docs_canonical_hashes_verify.mjs` | Canonical documentation drift check | **Independent** |

### 1.4 Reference documentation

| Document | Role |
| --- | --- |
| `docs/reference/ci/pr-hygiene-foundation.md` | Advisory/corrective PR hygiene model |
| `docs/reference/ci/pr-body-auto-repair.md` | Post-open auto-repair safety model |
| `docs/reference/ci/pr-preflight.md` | Unified local preflight contract |
| `docs/reference/ci/pr-workflow-ci-inventory.md` | Active/retired PR workflow inventory |
| `.github/pull_request_template.md` | Canonical PR body structure |
| `.agents/skills/lgfc-pr-governance/SKILL.md` | Agent PR governance procedure |

### 1.5 CI-001 gap analysis

| Planned artifact | Status | Action |
| --- | --- | --- |
| `scripts/ci/pr_body_generator.mjs` | Missing | **Create in #2436** |
| `scripts/ci/validate_pr_body.mjs` (or extend `pr_hygiene_audit.mjs`) | Missing | **Create or extend in #2436** — prefer shared exported validators from `pr_hygiene_audit.mjs` to avoid rule drift |
| `docs/reference/ci/pr-body-generator-contract.md` | Missing | **Create in #2436** |
| `scripts/ci/fixtures/pr_body_generator/` | Missing | **Create in #2436** |

**Boundary rule:** CI-001 is **generator + pre-open preclearance validator only**. It must not approve, merge, mutate GitHub state, or replace post-open advisory audit or auto-repair.

**Duplication check:** No existing script generates PR bodies from structured package inputs before PR creation. `pr_preflight.mjs` evaluates an existing body file locally but does not generate template-compatible output from issue/package metadata. **Non-duplicative.**

---

## 2. Post-merge closeout and auto-repair inventory

### 2.1 Existing scripts

| Script | Role | Phase | CI-002 relationship |
| --- | --- | --- | --- |
| `scripts/ci/run_post_merge_closeout.mjs` | Single automatic closeout orchestrator | Post-merge | **Do not replace** — remains sole mutation owner |
| `scripts/ci/post_merge_validator.mjs` | Evidence aggregation and validation contract | Post-merge | **Do not replace** — CI-002 consumes its output |
| `scripts/ci/post_merge_source_issue_closeout.mjs` | Source issue closeout and label reconciliation | Post-merge | **Do not replace directly** — CI-002 may queue admin repairs that invoke existing helpers |
| `scripts/ci/post_merge_remediation_issue.mjs` | Bounded remediation issue handling | Post-merge | **Complement** |
| `scripts/ci/post_merge_self_heal_classify.mjs` | Classification-only outcome mapping | Post-merge | **Extend, do not fork** — CI-002 `closeout_classifier.mjs` should align with or wrap this contract |
| `scripts/ci/post_merge_self_heal_backlog.mjs` | Backlog scan helpers | Post-merge | **Complement** |
| `scripts/ci/run_pr_body_auto_repair.mjs` | PR body repair (also used in reviewer workflow) | Pre/post | **Separate concern** — not admin closeout |
| `scripts/orchestrator/sync-pr-state.mjs` | Shared issue lifecycle sync | Post-merge | **Hot zone** — do not modify without authorization |

### 2.2 Existing workflows

| Workflow | Role | CI-002 relationship |
| --- | --- | --- |
| `post-merge-closeout.yml` | **Single automatic closeout owner** | **Do not race** — CI-002 apply mode must not run parallel automatic mutations |
| `post-merge-pr-body-closeout.yml` | Manual/backfill closeout | Manual only — CI-002 dry-run first |
| `post-merge-remediation.yml` | Failure remediation support | **Complement** |
| `ops-post-merge-self-healing.yml` | Scheduled/manual exception hygiene | **Integration target** — CI-002 apply mode may extend this workflow after dry-run pass |
| `diataxis-post-merge-validate.yml` | Documentation evidence support | **Do not touch** |
| `post-merge-intent-verification.yml` | Inert compatibility marker | **Do not touch** |
| `gate-post-merge-readiness.yml` | Manual backfill only | **Do not touch** |

### 2.3 Reference documentation

| Document | Role |
| --- | --- |
| `docs/reference/ci/post-merge-validation-surface.md` | Closeout ownership and script surface |
| `docs/reference/ci/post-merge-self-healing-classification-contract.md` | Classifier outcomes and safety model |
| `docs/reference/ci/workflow-inventory.md` | Closeout workflow inventory excerpt |
| `docs/reference/ci/pr-body-auto-repair.md` | PR body repair (separate from closeout) |
| `.agents/skills/lgfc-verification-closeout/SKILL.md` | Agent closeout procedure |

### 2.4 CI-002 gap analysis

| Planned artifact | Status | Action |
| --- | --- | --- |
| `scripts/ci/closeout_classifier.mjs` | Missing | **Create in #2437** — align with `post_merge_self_heal_classify.mjs` outcomes |
| `scripts/ci/admin_closeout_auto_repair.mjs` | Missing | **Create in #2437** — dry-run first, apply mode only after fixtures pass |
| `docs/reference/ci/admin-closeout-auto-repair-contract.md` | Missing | **Create in #2437** |
| `scripts/ci/fixtures/admin_closeout/` | Missing | **Create in #2437** |

**Boundary rule:** CI-002 is **administrative closeout classifier + bounded auto-repair only**. It must never auto-repair product, build, test, security, auth, privacy, design, data, scope, or unresolved reviewer defects.

**Duplication check:** `post_merge_self_heal_classify.mjs` implements the Task 001 classification contract but performs **classification only** with no apply-mode auto-repair executor. `ops-post-merge-self-healing.yml` has dry-run/apply inputs but lacks the CI-002 admin closeout contract and Content Collection fixture coverage. **Partial overlap — extend, do not duplicate.**

**Outcome alignment note:** CI-002 package defines `queue_admin_closeout`; existing self-heal contract uses `intentionally_deferred`. #2437 must reconcile naming when implementing.

---

## 3. Generator vs validator vs auto-repair boundaries

```text
Lifecycle phase          │ Existing surface              │ CI-001 (#2436)     │ CI-002 (#2437)
─────────────────────────┼───────────────────────────────┼────────────────────┼──────────────────────
Pre-PR (local)           │ pr_preflight.mjs              │ pr_body_generator  │ —
                         │                               │ validate_pr_body     │
Pre-open validation      │ —                             │ preclearance       │ —
Post-open advisory       │ pr_hygiene_audit.mjs          │ extend shared rules│ —
Post-open repair         │ pr_body_auto_repair.mjs       │ do not touch       │ —
Post-merge validation    │ post_merge_validator.mjs      │ —                  │ consume output
Post-merge closeout      │ run_post_merge_closeout.mjs   │ —                  │ do not replace
Post-merge classify      │ post_merge_self_heal_classify │ —                  │ closeout_classifier
Post-merge admin repair  │ (partial via self-heal WF)    │ —                  │ admin_closeout_auto_repair
```

### 3.1 Rules of engagement

1. **One closeout owner** — `post-merge-closeout.yml` + `run_post_merge_closeout.mjs` remain the sole automatic source-issue closeout owner.
2. **CI-001 before CI-002** — Standardized PR body fields reduce classifier ambiguity.
3. **Dry-run before apply** — CI-002 must ship classifier dry-run and fixtures before any workflow apply-mode changes.
4. **No workflow hot-zone edits in CI-001** — Generator is local/CLI; no `.github/workflows/**` changes unless separately authorized.
5. **Workflow edits in CI-002 are bounded** — Only `*closeout*.yml` and `*self-healing*.yml` per #2437 allowlist; serialize with active feature PRs.

---

## 4. Workflow and script hot zones

| Hot zone | Risk | CI-001 | CI-002 |
| --- | --- | --- | --- |
| `.github/workflows/post-merge-closeout.yml` | Races automatic closeout | **No touch** | **Serialize** — dry-run first; apply only after Atlas review |
| `.github/workflows/ops-post-merge-self-healing.yml` | Scheduled mutations | **No touch** | **Integration target** after classifier fixtures pass |
| `scripts/ci/run_post_merge_closeout.mjs` | Single closeout orchestrator | **No touch** | **No direct edit** — invoke via existing contract |
| `scripts/ci/post_merge_validator.mjs` | Validation contract | **No touch** | **Read-only consumer** |
| `scripts/ci/post_merge_self_heal_classify.mjs` | Classifier contract | **No touch** | **Extend or wrap** — avoid parallel classifier logic |
| `scripts/ci/pr_hygiene_audit.mjs` | Shared validation rules | **Extend exports** | **No touch** |
| `scripts/orchestrator/sync-pr-state.mjs` | Issue lifecycle sync | **No touch** | **No touch without authorization** |
| `scripts/ci/run_pr_body_auto_repair.mjs` | Post-open body mutation | **No touch** | **No touch** |

---

## 5. CI-001 implementation boundaries (#2436)

### May create

- `scripts/ci/pr_body_generator.mjs`
- `scripts/ci/validate_pr_body.mjs` (or extend `pr_hygiene_audit.mjs`)
- `scripts/ci/fixtures/pr_body_generator/**`
- `tests/pr_body_generator*.test.*`
- `docs/reference/ci/pr-body-generator-contract.md`

### May extend (shared rules only)

- Exported validation helpers in `scripts/ci/pr_hygiene_audit.mjs` if done without changing advisory workflow behavior

### Must not touch

- `.github/workflows/**` (unless separately authorized)
- `scripts/ci/run_post_merge_closeout.mjs`
- `scripts/ci/post_merge_*` closeout scripts
- `scripts/orchestrator/**`
- Feature routes, content model, middleware/auth, production deploy workflows

---

## 6. CI-002 implementation boundaries (#2437)

### May create

- `scripts/ci/closeout_classifier.mjs`
- `scripts/ci/admin_closeout_auto_repair.mjs`
- `scripts/ci/fixtures/admin_closeout/**`
- `tests/closeout*.test.*`, `tests/self_healing*.test.*`
- `docs/reference/ci/admin-closeout-auto-repair-contract.md`

### May extend

- `scripts/ci/post_merge_self_heal_classify.mjs` (prefer extending over duplicating finding types)
- `.github/workflows/*closeout*.yml`, `*self-healing*.yml` (after dry-run pass, serialized)

### Must not touch

- `post-merge-closeout.yml` automatic ownership semantics
- Feature implementation files, fanclub UI, middleware/auth
- Unrelated deploy workflows
- CI-001 generator scripts

---

## 7. Documentation gaps closed by this report

| Gap (from package docs) | Resolution |
| --- | --- |
| CI Stage 0 inventory not promoted | This report |
| Generator vs validator vs auto-repair unclear | Section 3 boundary table |
| CI-001/CI-002 duplication risk unknown | Sections 1.5, 2.4 — non-duplicative with noted overlap |
| Workflow hot zones undocumented | Section 4 |
| Separate PR recommendation missing | Executive summary + Section 8 |

### Follow-up reference doc

Boundary inventory promoted to `docs/reference/ci/ci-stage-0-tooling-boundary-inventory.md` for ongoing CI-001/CI-002 implementation reference.

---

## 8. Sequencing recommendation detail

| Order | Issue | PR intent | Base branch | Depends on |
| ---: | ---: | --- | --- | --- |
| 1 | #2436 | CI-001 generator + preclearance validator | `component/content-collection-phase1` | #2435 merged |
| 2 | #2437 | CI-002 classifier + dry-run auto-repair | `component/content-collection-phase1` | #2435 merged, #2436 merged |
| 3 | #2438 | Integrated validation | `component/content-collection-phase1` | #2433–#2437 |

**Do not combine #2436 and #2437** — mixed intent, overlapping hot zones, and violated serial lane control.

---

## 9. Validation evidence (#2435)

Commands run on branch `cursor/2435-ci-stage-0-gap-analysis-2e48`:

```bash
bash scripts/ci/docs_check_headers.sh
node scripts/ci/diataxis_folder_audit.mjs
node .agents/checks/agent-governance-check.mjs
```

Results recorded in issue #2435 handoff / PR #2685.

---

## 10. Acceptance criteria mapping

| Criterion | Status |
| --- | --- |
| Existing PR hygiene and closeout automation surfaces inventoried | **Met** — Sections 1–2 |
| CI-001 and CI-002 implementation boundaries explicit | **Met** — Sections 3, 5–6 |
| New tooling work is not duplicative | **Met** — Sections 1.5, 2.4 |
| Workflow/script hot zones documented | **Met** — Section 4 |
| Recommendation posted to #2431 | **Pending PR merge** — see PR handoff comment |

---

## DOC_SOURCE

```text
DOC_SOURCE: DIATAXIS_ROUTED
DOC_SOURCE_FILES:
- docs/reference/ci/pr-hygiene-foundation.md
- docs/reference/ci/post-merge-validation-surface.md
- docs/reference/ci/pr-workflow-ci-inventory.md
- docs/reference/ci/post-merge-self-healing-classification-contract.md
- docs/ops/implementation-plans/content-collection/packages/ci-001-pr-body-generator-package.md
- docs/ops/implementation-plans/content-collection/packages/ci-002-admin-closeout-auto-repair-package.md
DIATAXIS_GAP:
- NONE
```
