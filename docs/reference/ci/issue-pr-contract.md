---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Canonical Issue-side PR-open contract schema, marker syntax, precedence, authorization, field-to-PR-template mapping, error codes, and pre-PR/pre-merge/post-merge boundary for #2615 label-triggered draft PR creation
Does Not Own: PR-body policy (docs/governance/PR_PROCESS.md), PR lifecycle states (docs/governance/PR_LIFECYCLE_STATE_MACHINE.md), delivery-model/size classification (docs/how-to/pmo/classify-work-and-select-delivery-model.md), or workflow/runtime implementation
Canonical Reference: /docs/governance/PR_PROCESS.md
Supporting References:
  - /docs/governance/PR_LIFECYCLE_STATE_MACHINE.md
  - /.github/pull_request_template.md
  - /.github/ISSUE_TEMPLATE/delivery-task.md
  - /scripts/ci/pr_hygiene_audit.mjs
  - /docs/how-to/cursor/open-task-pr.md
Related Issues: #2615, #2618, #2619, #2620, #2621, #2622, #2436, #2677, #2952, #2953
Last Reviewed: 2026-07-30
---

# Issue-Side PR Contract

## Purpose

This document is the design-time specification produced by #2618 for #2615. It defines the one canonical, versioned, marked Issue-side section that holds stable PR-open facts, how it maps onto the current `.github/pull_request_template.md` schema, who may trigger validation, and the deterministic failure/success behavior a future validator (#2620) and draft-PR creator (#2621) must implement.

**This document does not enable anything.** No label is created or activated, no workflow is deployed, and no PR is created by publishing this specification. Enablement is separately authorized in #2619–#2622, and automatic draft-PR creation additionally requires the advisory-rollout evidence described in `## 9. Rollout boundary` before it may run non-dry-run.

## Status

Design-accepted for #2618. Runtime/controller integration depends on the completed #2677 contract (already integrated on `component/deterministic-handoff-controller`); this document itself has no such dependency and may be published independently.

## 1. Canonical contract location and precedence

- The canonical contract lives **only** inside the implementation task Issue body, in one marked section. It is never split across comments, and ordinary discussion comments are never parsed as contract authority — this reuses the same rule `docs/governance/PR_PROCESS.md` already applies to formal PR review (advisory comment is not authority).
- Marker syntax (versioned, machine-parseable, consistent with the repository's established `lgfc-*` machine-marker convention — see `<!-- lgfc-task-id:... -->` in `docs/ops/implementation-plans/README.md` and `docs/ops/trackers/PROGRAM-1500-CLOSEOUT-STABILIZATION-IMPLEMENTATION-QUEUE.md`):

  ```text
  <!-- lgfc-issue-pr-contract:v1:rev=<n> -->
  ...YAML-like fields (see §2)...
  <!-- /lgfc-issue-pr-contract:v1 -->
  ```

  `<n>` is a positive integer the task owner increments by one every time the contract's field values materially change. The revision is part of the marker text itself (not a field), so a validator can detect a changed contract without diffing field-by-field.
- **Exactly one** `lgfc-issue-pr-contract:v1` block may exist in the current Issue body. Two or more is a hard validation failure (`contract_duplicate`) — the workflow must never guess which one is authoritative.
- A **separate** bot-managed validation-status marker records the last validated outcome. It is posted as one upserted Issue comment (never in the Issue body, so the task owner's edit history stays clean):

  ```text
  <!-- lgfc-issue-pr-contract-status:v1:<valid|invalid>:rev=<n> -->
  ```

  If the body's current `rev=<n>` does not match the status marker's `rev=<n>`, any prior `valid` disposition is stale and must not be trusted — the validator re-validates from scratch. This is the same stale-event discipline the #2677 controller enforces, applied independently here; it does not depend on or import the #2677 controller substrate itself, which lives only on the separate, not-yet-promoted-to-`main` `component/deterministic-handoff-controller` branch.
- The contract **may narrow but may not widen** the Issue's own `## Scope > Allowed paths` (already defined in `.github/ISSUE_TEMPLATE/delivery-task.md`). A contract `allowed_paths` value that introduces a path outside the Issue's own allowlist is `contract_scope_widens_issue_allowlist` and fails closed.

## 2. Contract fields

Every field below is required unless marked optional. `source` says where the value comes from; fields marked "reuse" must not be re-authored inside the contract block — the validator reads them from the existing Issue-body PMO intake block (`.github/ISSUE_TEMPLATE/delivery-task.md`) instead, so there is exactly one place each fact can drift out of sync.

| Field | Source | Notes |
| --- | --- | --- |
| `primary_source_issue` | Generated | Defaults to the hosting task Issue's own number. A contract naming a different Issue is `contract_field_invalid:primary_source_issue` unless the task Issue body explicitly documents itself as a shared/mixed-scope exception. |
| `purpose` | Contract | 2-5 sentences. Feeds `## Change Summary`. |
| `intent_label` | Contract | Must be a currently defined intent label. |
| `pr_class` | Contract | Must be one of `VALID_PR_CLASSES` exported by `scripts/ci/pr_hygiene_audit.mjs` (`docs-governance`, `docs-content`, `code`, `config`, `ci`, `release`, `ops`, `mixed-approved`). Reuse that export; do not restate the enum in a second location. |
| `size` | Reuse (Issue PMO intake) | From the Issue's own `Size:` line once classified past `medium-provisional`. |
| `delivery_model`, `change_mode`, `target_environment`, `approval_profile`, `gate_profile`, `rollback_profile`, `component_branch`, `component_master`, `promotion_pr` | Reuse (Issue PMO intake) | Same block as `size`; see `.github/ISSUE_TEMPLATE/delivery-task.md`. |
| `allowed_paths` | Contract | List. Must be a subset of (or equal to) the Issue's own `## Scope > Allowed paths`. |
| `out_of_scope_changes_present` | Contract | `YES` / `NO`. |
| `exception_issue` | Contract | `#<n>` when `out_of_scope_changes_present: YES`; otherwise `not-applicable`. |
| `change_summary` | Contract | Free text; may reuse `purpose` verbatim. |
| `verification_commands` | Contract | List of exact commands the task's own Issue body already requires under `## Validation`. |
| `verification_results` | Contract | Filled in once known, immediately before `status:pr-ready` is applied — this is "available evidence," not a plan. A placeholder value here is `contract_field_placeholder:verification_results`. |
| `follow_up_required` | Contract | `YES` / `NO`. |
| `follow_up_issue` | Contract | `#<n>` or `not-applicable`. |
| `rollback_summary` | Contract | May reuse the Issue's own `## Rollback` section verbatim. |
| `head_branch` | Contract | Exact branch name. Must exist at validation time (`branch_missing` otherwise). |
| `base_branch` | Contract | Must equal the reused `component_branch` value (or `main` only for an explicitly authorized Model A/emergency profile). |

### Explicitly excluded from the contract

Per `docs/governance/PR_PROCESS.md` and `.agents/skills/lgfc-pr-governance/SKILL.md`, the PR body — and therefore this contract — never carries dynamic lifecycle state. The following are generated by the validator/creator at PR-open time and are **never** contract fields:

- the `## Reviewer / Bot Review Attestation` checkboxes — always emitted unchecked; a contract that tries to pre-check them is `contract_field_invalid:reviewer_attestation`;
- review comment IDs, thread status, CI/check results, approval state, queue/priority/collaboration state, operational holds, or closeout status;
- the DIATAXIS source classification, dependency-map queue status, and post-merge-readiness `review-comment:<id>` ledger formerly required by the pre-#2175/#2208 version of `docs/how-to/cursor/open-task-pr.md` — that guidance is superseded (see `## 8. Reconciliation findings`).

## 3. Trigger and authorization

- Trigger label: `status:pr-ready`.
- Authorized actors — reusing the list #2615's own Project Graduation package already approved: **Product Authority, PMO/Engineering, Administration operating under recorded authority, or the assigned implementation role holder for that source task.**
- An unauthorized application of `status:pr-ready` is reversed (label removed) and produces `contract_unauthorized_trigger`; it does not run validation.
- The workflow is idempotent: reapplying `status:pr-ready` after a corrected contract simply re-validates against the new `rev=<n>`; it never accumulates duplicate validation comments (upsert only, per `## 5`).

## 4. Shared validation authority

One versioned module owns field definitions, parsing, validation, and PR-body rendering, consumed by three call sites:

1. Issue-side contract validation (new, #2620).
2. PR-body generation for the draft PR (new, #2621).
3. Existing PR hygiene validation (`scripts/ci/pr_hygiene_audit.mjs`) — the generated body must pass the **same** `buildPrHygieneReport()` used on live PRs; this document does not define a second, competing set of section/field rules.

`VALID_PR_CLASSES` and `REQUIRED_TEMPLATE_SECTIONS` exported by `scripts/ci/pr_hygiene_audit.mjs` are the single source of truth for those two enums; the future shared module (#2619) imports them rather than redeclaring them.

## 5. Failure behavior

| Code | Meaning |
| --- | --- |
| `contract_missing` | No `lgfc-issue-pr-contract:v1` block found in the Issue body. |
| `contract_duplicate` | More than one `v1` contract block found. |
| `contract_field_missing:<field>` | Required field absent. |
| `contract_field_placeholder:<field>` | Field present but a placeholder (`____`, `<...>`, empty). |
| `contract_field_invalid:<field>` | Field present but fails its own validation rule (e.g. `pr_class` not in the enum). |
| `contract_scope_widens_issue_allowlist` | `allowed_paths` is not a subset of the Issue's own `## Scope` allowlist. |
| `contract_unauthorized_trigger` | `status:pr-ready` applied by an actor outside `## 3`. |
| `contract_stale_revision` | The last recorded validation's `rev=<n>` does not match the current contract's `rev=<n>`. |
| `branch_missing` | `head_branch` does not exist. |
| `diff_empty` | `head_branch` has no diff against `base_branch`. |
| `pr_already_exists` | An open PR already targets `base_branch` from `head_branch` for this source Issue. |
| `template_mismatch` | The generated body fails `buildPrHygieneReport().isClean`. |

The advisory validator added by #2620 (`scripts/ci/issue_pr_contract_validate.mjs`) additionally covers:

| Code | Meaning |
| --- | --- |
| `contract_marker_version_unsupported` | A `lgfc-issue-pr-contract:v<n>` marker exists but `n` is not the supported version (currently `1`); distinct from `contract_missing` so an unrecognized future version reports honestly instead of appearing absent. |
| `delivery_profile_invalid` | The reused PMO-intake fields, combined with the contract's `head_branch`/`base_branch`, fail `classifyDeliveryProfile()` from `scripts/ci/delivery_profile.mjs`. |
| `issue_not_open` | The Issue is not open; checked before any contract parsing. |
| `base_head_invalid` | `head_branch` and `base_branch` are missing, identical, or `base_branch` is neither `component/**` nor `main`. |
| `live_state_changed` | The Issue/label/PR state changed between evaluation and the mutate job's pre-mutation re-check; no comment or label change is made — the workflow simply skips, since a fresh event will re-trigger evaluation. |

Two of the Issue-text names originally proposed for #2620 (`contract_author_unauthorized`, `contract_precedence_ambiguous`, `contract_expands_issue_scope`, `required_field_missing`, `placeholder_value`, `branch_has_no_diff`) name concepts #2619 already implements. Rather than fork a second vocabulary, the validator emits the existing canonical codes for these: `contract_unauthorized_trigger`, `contract_duplicate`, `contract_scope_widens_issue_allowlist`, `contract_field_missing:<field>`, `contract_field_placeholder:<field>`, and `diff_empty`, respectively. This table is the single source of truth for error-code names.

On any failure:

- do not create a branch or PR;
- upsert exactly one `lgfc-issue-pr-contract-status:v1:invalid:rev=<n>` comment listing every failing code and the exact corrective field(s) — never create comment spam by posting a new comment per attempt;
- remove `status:pr-ready`;
- apply `status:pr-contract-incomplete` (label creation itself is out of scope for this document — see `## 9`);
- allow a clean retry: correcting the contract, bumping `rev=<n>`, and reapplying `status:pr-ready` must produce a fresh validation, not a cached one (`contract_stale_revision` exists specifically to make stale-cache reuse impossible).

## 6. Successful PR creation

Before creating a PR, the validator confirms, in order:

1. contract is complete and unique (`## 2`, `## 1`);
2. `head_branch` exists;
3. `head_branch` differs from `base_branch` and contains a non-empty diff;
4. no open PR already exists for this source Issue/head-branch pair;
5. the generated body — built from `## 2`'s field mapping plus the always-unchecked reviewer attestation — passes the same hygiene validator used on live PRs (`## 4`).

Then, and only then:

- create a **draft** PR targeting `base_branch`;
- preserve exactly one primary source Issue line (`- **Issue:** #<primary_source_issue>`);
- record the PR URL on the source Issue;
- transition the Issue from `status:pr-ready` to `status:pr-created`;
- stop — normal PR-side gates (`pr-hygiene`, `diff-scope`, required checks) take over from here exactly as they do for a human- or agent-opened PR today.

## 7. Authentication and permissions

Least-privilege applies: the validator/creator identity may read Issues, read/write the validation-status comment, add/remove the specific lifecycle labels named in `## 3`/`## 5`, and open draft PRs. It must never hold approval or merge scope.

**#2621 disposition:** the `create-draft-pr` job uses the default `GITHUB_TOKEN` (via `actions/github-script`), not a personal token, satisfying the "no personal token" requirement. This has a known, accepted limitation for this rollout stage: GitHub does not run `pull_request`-triggered workflows off a PR opened with the default `GITHUB_TOKEN` (its built-in anti-recursion behavior), so `pr-hygiene`, `diff-scope`, and other PR-triggered gates will not fire automatically on a PR `CREATE_DRAFT_PR` opens — they require a manual re-trigger (e.g. an empty commit, or closing/reopening the PR) until a GitHub App installation token is evaluated and adopted. This is why `CREATE_DRAFT_PR` remains reachable only via explicit, single-Issue `workflow_dispatch` rather than the automatic `status:pr-ready` label event: an operator dispatching it can also arrange the re-trigger. Adopting an installation token to close this gap is left for a future task.

## 8. Reconciliation findings

Two governance documents contained PR-body requirements that predate the current stable-facts policy (`docs/governance/PR_PROCESS.md`, last reviewed 2026-07-21) and must be treated as superseded per that document's own Supersession clause:

1. **`docs/how-to/cursor/open-task-pr.md`** (previously last reviewed 2026-06-11) required a DIATAXIS source-classification field, a `## QUEUE / DEPENDENCY MAP STATUS` block, and a post-merge-readiness contract requiring `review-comment:<id>`-format trusted-reviewer dispositions inside the PR body — all dynamic-ledger requirements the current template and `pr_hygiene_audit.mjs` do not have and do not check. Updated by this task (#2618) to point at the current `.github/pull_request_template.md` fields and this document, while remaining at its existing path (required by `.agents/checks/agent-governance-check.mjs` bootstrap references — the path is not renamed or removed).
2. **`scripts/ci/pr_body_auto_repair.mjs`** (`REQUIRED_HEADINGS`) still encodes an even older heading set (`## PRE-OPEN GATE PREFLIGHT`, `## MANDATORY FIRST STEP (ZIP SAFETY)`, `## QUEUE / DEPENDENCY MAP STATUS`, `## POST-MERGE CLOSEOUT CHECKLIST`, etc.) that does not match `.github/pull_request_template.md`. This script is **not** modified by #2618 (out of allowlist) and is **not** reused by the new Issue-contract validator; a future task should evaluate whether it is still load-bearing anywhere or should be retired alongside the rest of the pre-#2175/#2208 surface documented in `docs/reference/ci/pr-process-current-state.md`.

Non-duplication boundaries confirmed by inspection:

- **`.github/workflows/orchestrator-draft-pr.yml`** already implements a label-triggered (`orchestrator` + `status:queued`) draft-PR creator via `scripts/orchestrator/create-draft-pr.mjs`, targeting `main` directly. It predates the component-branch Development profile and the stable-facts template. **Resolved by #2621:** kept unchanged (no functional overlap — see `docs/reference/ci/agent-routing-controller-contract.md`'s Legacy overlapping paths table); the `CREATE_DRAFT_PR` action never targets `main` and is reachable only via explicit `workflow_dispatch`, not the automatic `orchestrator`/`status:queued` labels this workflow consumes.
- **`scripts/ci/ai_execution_bridge_prepare.mjs`** builds `ai-build/*` branches and PR bodies for a separate, already-approved AI-build execution path. It is a peer mechanism, not something #2615's validator subsumes or duplicates.
- **#2436** (CI-001 PR Body Generator Preclearance Tooling) is closed/completed but scoped only to Content Collection-specific fields and `scripts/ci/**pr_body**` / `scripts/ci/**pr_hygiene**` naming; it did not produce a `docs/reference/ci/pr-body-generator-contract.md` file (none exists in the repository) or a general-purpose Issue-side contract. Nothing from #2436 needs to be reused verbatim; its non-duplication boundary is that this document's schema is repo-wide and package-agnostic where #2436's was Content Collection-specific.
- **#2294** (`component/agent-issue-polling-handoff-routing`) is the runtime substrate this contract's validator/creator runs inside as of #2621. **Correction of an earlier note:** this substrate does *not* live on `component/deterministic-handoff-controller` — that branch has a same-path, same-filename but functionally unrelated system built for #2677 (deterministic post-integration/closeout verification), a naming collision discovered and documented while implementing #2621 (`docs/reference/ci/agent-routing-controller-contract.md`'s Reconciliation findings). #2621 ported the real #2294 substrate (`scripts/agent-routing/**`, `tests/agent-routing/**`, this contract's own doc) forward from `component/agent-issue-polling-handoff-routing` by file copy onto `component/issue-contract-draft-pr`, since the two branches' git histories diverged before a repository-wide history rewrite and cannot be reconciled by merge.

## 9. Rollout boundary

Per #2615's own advisory-first requirement, no implementation task following this design may enable non-dry-run draft-PR creation before:

1. representative existing Issues validate without creating PRs;
2. missing-field frequency, false positives, and ambiguous parses are measured;
3. dry-run-generated bodies are confirmed to pass `buildPrHygieneReport().isClean`;
4. only then is draft-PR creation enabled, and only in the advisory/observe-first posture already established by the #2677 controller contract.

**Status:** step 1 is implemented by #2620's `.github/workflows/issue-pr-contract-validate.yml` — it evaluates and posts feedback on `status:pr-ready` but creates no branch or PR under any condition. Step 4 (draft-PR creation) is now implemented by #2621's `CREATE_DRAFT_PR` action (`docs/reference/ci/agent-routing-controller-contract.md`), but reachable only through an explicit, single-Issue-scoped `workflow_dispatch` on `.github/workflows/ops-agent-routing-controller.yml` — not automatically off `status:pr-ready`, so #2620's validator remains the sole automatic consumer of that label and the two workflows do not compete. Steps 2–3 (representative-Issue measurement and false-positive/ambiguous-parse review) were executed twice by #2622's pilot: evidence in `docs/ops/reports/issue-pr-contract-pilot-evidence.md`, recommendation in `docs/reference/ci/issue-pr-contract-promotion-decision.md`. The first pilot cycle found the generated PR body failed hygiene on first render; a fix (PRs #2952/#2953) corrected it, and a second pilot cycle confirmed the fix while surfacing that most downstream `pull_request`-gated checks never evaluate a `CREATE_DRAFT_PR`-opened PR at all (blocked `action_required`, a GitHub platform policy). The recommendation remains advisory for the original repo-wide/automatic-`status:pr-ready` question this design covers.

**#2622's revised, progressive non-production admission design is a distinct, later-stage mechanism, not a change to this section's advisory scope.** It adds a separate `workflow_dispatch` `mode: admit` path (`scripts/agent-routing/action-planner.mjs`'s `admit_environment_pr` mutation) that runs each non-production tier's required gates synchronously inside the controller's own run — avoiding the `action_required` block by never depending on it — and auto-merges into an authorized `sandbox/*` or non-`main` component branch once those gates pass. It remains explicit-dispatch-only, per-Issue-scoped, and reachable only through the same authorized, non-automatic trigger path this section already describes for `CREATE_DRAFT_PR`; it does not change #2620's automatic `status:pr-ready` validator, does not reach `main`/Production, and this section's rollout-boundary steps 1–4 (repo-wide/automatic non-dry-run enablement) remain unauthorized. See `docs/governance/DELIVERY-AND-RELEASE.md` and `docs/governance/CI-AND-VERIFICATION.md` for the profile/gate policy this mechanism implements.

## 10. Open research questions carried forward

Left for #2619–#2622 to resolve during implementation, not decided by this design:

- exact label-creation mechanics for `status:pr-contract-incomplete` / `status:pr-created` (label creation itself is explicitly out of scope for #2618);
- whether branch creation may ever become a workflow responsibility (currently: no — the validator only checks `head_branch` exists; it never creates one);
- whether a GitHub App installation token is required so a `CREATE_DRAFT_PR`-opened PR reliably triggers downstream PR-triggered gates (see `## 7`) — resolved as a known, accepted limitation for this rollout stage, not yet adopted;
- reconciliation or retirement plan for `orchestrator-draft-pr.yml` and `scripts/ci/pr_body_auto_repair.mjs`'s legacy heading set, tracked as a finding here but not resolved here.
