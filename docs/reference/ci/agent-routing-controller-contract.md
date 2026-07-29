---
Doc Type: Reference
Audience: Human + AI
Authority Level: Project Runtime Contract
Owns: Project #2294 controller inputs, outputs, action classes, state revisions, alert/claim records, permission boundaries, and rollout modes
Does Not Own: Product decisions, credentials, repository settings, production approval, or automatic merge to main
Canonical Reference: /docs/explanation/projects/agent-issue-polling-handoff-routing-design.md
Related Issues: #2294, #2546, #2550, #2554, #2593-#2601, #2621, #2639, #2640
Last Reviewed: 2026-07-29
---

# Agent Routing Controller Contract

## Runtime model

The controller is a deterministic adapter around four pure stages: event normalization, repository-state resolution, lane eligibility, and one-action planning. Equivalent inputs must produce byte-equivalent revisions and action keys. Automatic events run in `observe`; mutation requires a separately authorized non-main job and expected-state revalidation.

## Authority model

- GitHub Issues and committed manifests remain authority.
- Cursor pickup requires `agent:cursor`, `handoff:ready`, manifest eligibility, and a latest valid `CURSOR ASSIGNMENT` or `CHATGPT RESPONSE`.
- Every ChatGPT watcher run initializes the GitHub connector, reads repository authority, and scans active Issues, PRs, checks, reviews, dependencies, handoffs, integrations, closeout state, and workflow health broadly.
- Alerts are acceleration and observability hints. Alerts never narrow broad watcher review and never create execution authority.
- No action plan may authorize automatic merge to `main`.

## Rollout modes

| Mode | Meaning |
| --- | --- |
| `disabled` | Produce no mutation plan. |
| `observe` | Resolve, rank, report, and measure without mutation. |
| `normalize` | Permit exact label/comment normalization after explicit authorization. |
| `advance` | Permit bounded successor, rerun, remediation, and closeout actions. |
| `integrate` | Permit eligible non-main project-branch integration. |

The repository default is `observe`. Automatic triggers remain observe-only. A manual request cannot cross the production boundary.

## State snapshot

A snapshot contains project/task identity, current labels, latest valid canonical event, PR/check/review evidence, dependency state, active claims, consumed event IDs, mutation file scope, ambiguity reasons, and a deterministic state revision.

## Action classes

- `halt`: unsupported, untrusted, ambiguous, or unsafe state.
- `observe`: report only.
- `noop`: valid state with no safe action.
- `cursor_ack_required`: exact ready assignment awaiting Cursor claim.
- `ci_failure_disposition`: bounded required-check remediation or explicit stop.
- `integrate_non_main`: technically eligible child targeting the project branch.
- `chatgpt_review`: genuine ChatGPT responsibility.
- `human_decision`: production, credential, repository-setting, cost, privacy, legal, or destructive boundary.
- `nested_pr_review`: implementation handoff awaits nested PR review inside Implementation / Operations.
- `nested_review_remediation`: changes-required returns bounded remediation without erasing unrelated delivery state.
- `plan_adjustment_route`: `PROBLEM FOUND` awaits guidance/adjustment.
- `operational_assessment`: Day-2 assessment hold active before severity classification.
- `operational_auto_remediation`: safe, deterministic, reversible, evidence-backed auto-fix.
- `operational_incident_route`: classified incident requires Day-2 or corrective implementation routing.
- `operational_hold_release`: evidence-backed hold release and project resume.
- `create_draft_pr` (#2621): #2620's advisory Issue-contract validation is current, authorized, and diffed; opens a draft PR only, and only from `advance`/`integrate` mode.

Every mutation includes the expected state revision and stable action key. The adapter re-reads live state before applying it.

## CREATE_DRAFT_PR evidence and guards (#2621)

The snapshot's `issuePrContract` field (built by `scripts/agent-routing/evidence-adapters/issue-pr-contract.mjs` from #2620's `evaluateIssuePrContractRequest` output, never re-derived) carries: contract revision, validation status, label-actor authorization, head/base branch and SHA, diff presence, and any already-open PR for the same source Issue or head branch.

`planCreateDraftPr` (in `action-planner.mjs`) is reachable only in `advance`/`integrate` mode and fails closed with a specific reason before ever building a mutation:

| Condition | Reason |
| --- | --- |
| No contract evidence supplied | (not this action's concern — falls through to existing routing logic) |
| Trigger actor not authorized | `contract_actor_unauthorized` |
| #2620 validation not `ok` | `contract_invalid` |
| `head_branch`/`base_branch` missing | `contract_branch_missing` |
| No diff between head and base | `contract_diff_empty` |
| `base_branch` is `main` | `production_main_boundary` |
| Open PR already exists for the same Issue/head branch | `existing_pr_reconciled` (mutation: `update_contract_comment`, not a duplicate PR) |

`github-actions.mjs`'s `buildDraftPrPlan` re-validates a `create_draft_pr` mutation against freshly re-read live state immediately before mutating (issue still open, actor still authorized, head/base SHA and contract revision unchanged, no PR opened since planning) and returns the exact `pulls.create` request plus a `commentUpdateTemplate` for recording the PR URL and contract revision on the existing marked validation-status comment (`lgfc-issue-pr-contract-status:v1`, reusing #2619's `buildStatusMarker`) — never a second comment. Neither function calls the GitHub API; `.github/workflows/ops-agent-routing-controller.yml`'s `create-draft-pr` job does, via thin `github-script` steps between two `node scripts/agent-routing/controller.mjs` CLI calls (`AGENT_ROUTING_CLI_MODE=plan` default, then `mutate`).

`create_draft_pr` is reachable only through that job's explicit `workflow_dispatch` (`authorize_mutation: true`, a scoped `issue_number`, `mode: advance|integrate`) — never automatically off the `status:pr-ready` label event, which #2620's advisory validator already owns exclusively. This keeps the two workflows from becoming competing controllers over the same trigger.

## Alerts, claims, and dead letters

Alerts are keyed by subject, state revision, and code. Repeated identical events update no additional comment. Watcher claims use a stable action key and bounded lease; the earliest unexpired claim wins. Permanent or ambiguous failures create one redacted dead-letter record with bounded replay.

## Permissions

Evaluation requires read-only `contents`, `issues`, `pull-requests`, and `actions`. Write permissions are isolated to an explicitly authorized job. Fork or otherwise untrusted events cannot enter that job. Repository-runner workloads remain manual-health-only and exclude PR, push, scheduled, deployment, secret-bearing, and production work.

## Required invariants

1. Automatic merge to `main` is impossible.
2. No OpenAI API or paid AI worker is required.
3. CI cannot write substantive ChatGPT decisions.
4. Broad GitHub connector review does not depend on an alert or `agent:ChatGPT` label.
5. Repeated state is idempotent.
6. Serial dependencies remain serial; independent non-colliding lanes may advance.
7. Ambiguity fails closed with evidence.

## Four-lane runtime (#2639 / #2640)

`config.fourLaneRuntime.enabled` defaults to `false`. While disabled, the conservative serialized planner remains authoritative and automatic operational holds are off.

When enabled, the controller additionally resolves:

- horizontal lanes: `pmo-engineering`, `implementation-operations`, `day2-operations`;
- vertical lane: `administration-communications` (runner/controller transport belongs here);
- nested PR review inside `implementation-operations` (not a top-level lane);
- `implementationHandoffComplete` distinct from approval, integration, deployment, and closeout;
- repository-wide Day-2 assessment holds with preserved resume context;
- lightweight plan adjustment (`PROBLEM FOUND` → `GUIDANCE`/`ADJUSTMENT` → `RESUME`).

Typed disposition rules (fail-closed):

- Integration eligibility requires `APPROVED FOR INTEGRATION` or a legacy `CHATGPT RESPONSE` with explicit `disposition: approved-for-integration`.
- Review-pending from legacy handoff requires `PR REVIEW REQUEST` or a `CHATGPT HANDOFF` with explicit `disposition: PR REVIEW REQUEST`.
- Generic `CHATGPT RESPONSE` / `CHATGPT HANDOFF` markers alone never authorize those transitions.
- `HOLD`, `GUIDANCE`, and `ADJUSTMENT` route to remediation, not integration.
- Missing `dependencyClass` defaults to `direct` under four-lane mode. Direct/stacked successors remain blocked until predecessor completion unless `none`, `administrative-only`, or `independentAuthority` is explicit.

Administration & Communications is non-blocking unless an explicit substantive defect is present. Automatic merge or promotion to `main` remains prohibited in every mode.

## Reconciliation findings (#2621)

`scripts/agent-routing/**`, `tests/agent-routing/**`, and this document's originally-promoted content existed only on `component/agent-issue-polling-handoff-routing` (#2594/#2595's `Pull Request Base`), last updated 2026-07-19 and never promoted onto `component/issue-contract-draft-pr` or `main`. #2618's earlier note that this substrate "currently lives only on `component/deterministic-handoff-controller`" was incorrect: that branch has a same-path, same-filename (`scripts/agent-routing/controller.mjs`, `docs/reference/ci/agent-routing-controller-contract.md`) but **unrelated** system for #2677 (deterministic post-integration/closeout verification), actively developed as recently as 2026-07-29, with no `state-resolver.mjs`, `action-planner.mjs`, `github-actions.mjs`, `tests/agent-routing/`, or schemas of its own — a naming collision between two independent projects, not two versions of one. #2621 brought the real #2294 substrate forward from `component/agent-issue-polling-handoff-routing` by file copy (not a git merge — the two branches' histories diverged before a repository-wide history rewrite and cannot be reconciled by merge) onto `component/issue-contract-draft-pr`. Reconciling the #2677 same-named files on `component/deterministic-handoff-controller` with this document and directory remains open and out of #2621's scope.

Two files were intentionally not carried forward in this port: `scripts/agent-routing/acceptance.mjs` and `tests/agent-routing/integration/routing-acceptance.test.mjs` (and the `ops-agent-routing-reconcile.yml` workflow step that ran it) depend on `scripts/pmo-projects/lib/workflow-policy.mjs`, a separate subsystem that does not exist anywhere in the current tree either. Both are outside #2621's proposed file list and unrelated to `CREATE_DRAFT_PR`; a future task should either port `scripts/pmo-projects/**` forward too or retire the acceptance-report step.

### Legacy overlapping paths (#2621 requirement 11)

| Path | Disposition | Rationale |
| --- | --- | --- |
| `.github/workflows/orchestrator-draft-pr.yml` + `scripts/orchestrator/create-draft-pr.mjs` | Keep, no change | Triggers on a distinct `orchestrator` + `status:queued` label pair (not `status:pr-ready`/`lgfc-issue-pr-contract`), targets `main` directly, and by design never creates a PR itself — it only relabels to `status:pr-draft` for a human/agent handoff. No functional overlap with `CREATE_DRAFT_PR`, which creates a real draft PR from a validated non-`main` contract. Rollback: not applicable, no change made. |
| `.github/workflows/ai-execution-bridge.yml` | Keep, no change | Already documented as a non-overlapping `ai-build`-labeled, phase-1/execution-disabled peer mechanism (`docs/reference/ci/issue-pr-contract.md` §8, from #2618/#2620). Rollback: not applicable, no change made. |
