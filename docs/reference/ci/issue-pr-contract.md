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
Related Issues: #2615, #2618, #2619, #2620, #2621, #2622, #2436, #2677
Last Reviewed: 2026-07-29
---

# Issue-Side PR Contract

## Purpose

This document is the design-time specification produced by #2618 for #2615. It defines the one canonical, versioned, marked Issue-side section that holds stable PR-open facts, how it maps onto the current `.github/pull_request_template.md` schema, who may trigger validation, and the deterministic failure/success behavior a future validator (#2620) and draft-PR creator (#2621) must implement.

**This document does not enable anything.** No label is created or activated, no workflow is deployed, and no PR is created by publishing this specification. Enablement is separately authorized in #2619–#2622, and automatic draft-PR creation additionally requires the advisory-rollout evidence described in `## 9. Rollout boundary` before it may run non-dry-run.

## Status

Design-accepted for #2618. Runtime/controller integration depends on the completed #2677 contract (already integrated on `component/deterministic-handoff-controller`); this document itself has no such dependency and may be published independently.

## 1. Canonical contract location and precedence

- The canonical contract lives **only** inside the implementation task Issue body, in one marked section. It is never split across comments, and ordinary discussion comments are never parsed as contract authority — this reuses the same rule `docs/governance/PR_PROCESS.md` already applies to formal PR review (advisory comment is not authority).
- Marker syntax (versioned, machine-parseable, consistent with the existing identity-marker convention used by `scripts/agent-routing/lib/idempotency.mjs`):

  ```text
  <!-- issue-pr-contract:v1:rev=<n> -->
  ...YAML-like fields (see §2)...
  <!-- /issue-pr-contract:v1 -->
  ```

  `<n>` is a positive integer the task owner increments by one every time the contract's field values materially change. The revision is part of the marker text itself (not a field), so a validator can detect a changed contract without diffing field-by-field.
- **Exactly one** `issue-pr-contract:v1` block may exist in the current Issue body. Two or more is a hard validation failure (`contract_duplicate`) — the workflow must never guess which one is authoritative.
- A **separate** bot-managed validation-status marker records the last validated outcome. It is posted as one upserted Issue comment (never in the Issue body, so the task owner's edit history stays clean):

  ```text
  <!-- issue-pr-contract-status:v1:<valid|invalid>:rev=<n> -->
  ```

  If the body's current `rev=<n>` does not match the status marker's `rev=<n>`, any prior `valid` disposition is stale and must not be trusted — the validator re-validates from scratch. This mirrors the stale-event protection already required of the #2677 controller (`docs/reference/ci/agent-routing-controller-contract.md`) and must not be reimplemented differently.
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
| `contract_missing` | No `issue-pr-contract:v1` block found in the Issue body. |
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

On any failure:

- do not create a branch or PR;
- upsert exactly one `issue-pr-contract-status:v1:invalid:rev=<n>` comment listing every failing code and the exact corrective field(s) — never create comment spam by posting a new comment per attempt;
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

Least-privilege applies: the validator/creator identity may read Issues, read/write the validation-status comment, add/remove the specific lifecycle labels named in `## 3`/`## 5`, and open draft PRs. It must never hold approval or merge scope. Whether a GitHub App installation token is required (versus the default `GITHUB_TOKEN`) so that a workflow-opened PR reliably triggers downstream PR workflows is an open implementation question for #2621, not decided here.

## 8. Reconciliation findings

Two governance documents contained PR-body requirements that predate the current stable-facts policy (`docs/governance/PR_PROCESS.md`, last reviewed 2026-07-21) and must be treated as superseded per that document's own Supersession clause:

1. **`docs/how-to/cursor/open-task-pr.md`** (previously last reviewed 2026-06-11) required a DIATAXIS source-classification field, a `## QUEUE / DEPENDENCY MAP STATUS` block, and a post-merge-readiness contract requiring `review-comment:<id>`-format trusted-reviewer dispositions inside the PR body — all dynamic-ledger requirements the current template and `pr_hygiene_audit.mjs` do not have and do not check. Updated by this task (#2618) to point at the current `.github/pull_request_template.md` fields and this document, while remaining at its existing path (required by `.agents/checks/agent-governance-check.mjs` bootstrap references — the path is not renamed or removed).
2. **`scripts/ci/pr_body_auto_repair.mjs`** (`REQUIRED_HEADINGS`) still encodes an even older heading set (`## PRE-OPEN GATE PREFLIGHT`, `## MANDATORY FIRST STEP (ZIP SAFETY)`, `## QUEUE / DEPENDENCY MAP STATUS`, `## POST-MERGE CLOSEOUT CHECKLIST`, etc.) that does not match `.github/pull_request_template.md`. This script is **not** modified by #2618 (out of allowlist) and is **not** reused by the new Issue-contract validator; a future task should evaluate whether it is still load-bearing anywhere or should be retired alongside the rest of the pre-#2175/#2208 surface documented in `docs/reference/ci/pr-process-current-state.md`.

Non-duplication boundaries confirmed by inspection:

- **`.github/workflows/orchestrator-draft-pr.yml`** already implements a label-triggered (`orchestrator` + `status:queued`) draft-PR creator via `scripts/orchestrator/create-draft-pr.mjs`, targeting `main` directly. It predates the component-branch Development profile and the stable-facts template. #2621's controller-integrated creator must not double-trigger alongside it and must not target `main`; reconciling or retiring `orchestrator-draft-pr.yml` is out of scope for #2615 and is not addressed further here.
- **`scripts/ci/ai_execution_bridge_prepare.mjs`** builds `ai-build/*` branches and PR bodies for a separate, already-approved AI-build execution path. It is a peer mechanism, not something #2615's validator subsumes or duplicates.
- **#2436** (CI-001 PR Body Generator Preclearance Tooling) is closed/completed but scoped only to Content Collection-specific fields and `scripts/ci/**pr_body**` / `scripts/ci/**pr_hygiene**` naming; it did not produce a `docs/reference/ci/pr-body-generator-contract.md` file (none exists in the repository) or a general-purpose Issue-side contract. Nothing from #2436 needs to be reused verbatim; its non-duplication boundary is that this document's schema is repo-wide and package-agnostic where #2436's was Content Collection-specific.
- **#2294** (`component/agent-issue-polling-handoff-routing`) and the #2677 controller it fed are the runtime substrate this contract's validator/creator will eventually run inside (per #2615's Runtime Integration Dependency note on #2618's sibling tasks). This document defines the Issue-side contract only; it does not restate the controller's own event/state-machine contract, which remains owned by `docs/reference/ci/agent-routing-controller-contract.md`.

## 9. Rollout boundary

Per #2615's own advisory-first requirement, no implementation task following this design may enable non-dry-run draft-PR creation before:

1. representative existing Issues validate without creating PRs;
2. missing-field frequency, false positives, and ambiguous parses are measured;
3. dry-run-generated bodies are confirmed to pass `buildPrHygieneReport().isClean`;
4. only then is draft-PR creation enabled, and only in the advisory/observe-first posture already established by the #2677 controller contract.

## 10. Open research questions carried forward

Left for #2619–#2622 to resolve during implementation, not decided by this design:

- exact label-creation mechanics for `status:pr-contract-incomplete` / `status:pr-created` (label creation itself is explicitly out of scope for #2618);
- whether branch creation may ever become a workflow responsibility (currently: no — the validator only checks `head_branch` exists; it never creates one);
- whether a GitHub App installation token is required for #2621 (see `## 7`);
- reconciliation or retirement plan for `orchestrator-draft-pr.yml` and `scripts/ci/pr_body_auto_repair.mjs`'s legacy heading set, tracked as a finding here but not resolved here.
