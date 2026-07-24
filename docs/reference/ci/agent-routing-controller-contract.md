---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Deterministic handoff-controller live evidence, finding classification, bounded remediation identities, authorized non-main component-integration instructions, post-integration verification, closeout/successor activation, reconciliation safety net, structured observability, and disable/recovery controls for #2677-001 through #2677-005
Does Not Own: Production authorization or promotion to main
Canonical Reference: /config/agent-routing/controller.json
Related Issues: #2677, #2770, #2771, #2772, #2773, #2774, #2676, #2433
Last Reviewed: 2026-07-24
---

# Agent Routing Controller Contract

## Purpose

Define the deterministic controller foundation that:

1. performs GitHub-native current-head evidence collection;
2. classifies the packet as `clean`, `bounded_correction`, or `protected_stop`;
3. emits an idempotent source-Issue remediation instruction only when repository authority already decides the action;
4. when classification is `clean`, evaluates and may execute exactly one authorized non-`main` component integration;
5. verifies an already-recorded merge/integration SHA on the authorized component target without closing the source Issue;
6. closes an eligible verified child and activates exactly one authorized successor;
7. reconciles missed or stale eligible transactions as a non-mutating safety net;
8. emits structured observability for every controlling transition.

The route job remains read-only and emits transaction instructions as an artifact. Separate write-scoped jobs may perform one authorized component merge or one closeout/successor transaction after a second full GitHub-native reread. Reconciliation remains read-only. No job mutates `main` or Production.

## Scope

This document covers #2677-001 / #2770 through #2677-005 / #2774:

- canonical and legacy handoff event recognition;
- GitHub-native live collection of Issue, PR, checks, files, comments, reviews, and review threads;
- preservation of PR-author login and review commit SHA through `collectLiveGitHubEvidence()` into protected-integration evaluation;
- final Issue/PR expected-state rereads;
- current-head finding classification;
- source-Issue-bound bounded-correction authorization;
- one response plus one action-scoped `LOCAL CURSOR RESUME` instruction;
- one protected-stop escalation instruction;
- authorized non-`main` component-integration instruction emission and execution;
- exact post-integration verification of target branch and merge SHA;
- verified child closeout and exactly one successor wake;
- scheduled/manual reconciliation as a non-mutating safety net;
- structured observability for handoff, evidence, disposition, resume, integration, verification, closeout, successor, duplicate suppression, blocker, and escalation;
- independent mutation switches that preserve read-only diagnostics;
- stable transaction identities and duplicate/stale suppression.

It does not authorize credential changes, destructive action, or Production / `main` mutation.

## Current known truth

- Mode remains `observe-only` with `mutationAllowed: false`.
- Authoritative packet state comes from GitHub-native live reads performed immediately before emission (`source: github-native`).
- Caller `live`, `reread`, finding, authorization, and disposition objects cannot substitute for live evidence.
- Canonical event authority is resolved from live source-Issue comments.
- Bounded-correction authority must be an actual live comment on that same source Issue.
- Component integration requires a `clean` disposition plus an authorized component target.
- Automated eligibility is never treated as human approval.
- The deterministic approval profile `component-auto-integration` is repository-policy authority, not human approval.
- The protected approval profile `protected-change-review` requires a trusted recorded independent review or a trusted source-Issue integration authorization.
- Live collection must transport PR-author login and review commit SHA; missing identities fail closed for protected review.
- The route job has read-only GitHub permissions and produces transaction instructions only.
- The integration job has job-scoped pull-request/content write permission for one component merge only.
- The closeout job has job-scoped issues write permission for one child closeout and one successor wake only.
- Reconciliation is safety-net only, remains non-mutating, and reuses controller identities to suppress duplicates.
- Independent `mutationSwitches` can disable remediation instructions, component integration, and closeout while preserving diagnostics.
- Protected decisions never produce a remediation resume.
- Integration and verification never close the source Issue or activate a successor unless the dedicated closeout path is authorized.

## Intended final state

#2774 completes the component construction package. Independent Promotion Candidate review on `component/deterministic-handoff-controller` remains required before any `main` / Production promotion. #2676 and #2677 stay open until that protected promotion path succeeds.

This contract is the freeze line for evidence identities, remediation identities, component-integration identities, closeout/successor identities, reconciliation identities, source-Issue authority, observability schema, and protected boundaries.

## Canonical files

| Path | Role |
| --- | --- |
| `config/agent-routing/controller.json` | Observe, remediation, integration, closeout, reconciliation, observability, and mutation-switch configuration |
| `config/agent-routing/controller.schema.json` | Configuration schema |
| `scripts/agent-routing/controller.mjs` | Live evidence, routing, integration, and observability entrypoint |
| `scripts/agent-routing/reconcile.mjs` | Non-mutating reconciliation safety net |
| `scripts/agent-routing/lib/event-contract.mjs` | Event and action identities |
| `scripts/agent-routing/lib/evidence-collector.mjs` | GitHub-native current-head collector |
| `scripts/agent-routing/lib/disposition.mjs` | Finding classification and source-Issue authorization extraction |
| `scripts/agent-routing/lib/idempotency.mjs` | Disposition/response/resume/escalation/integration/verification/reconciliation identities |
| `scripts/agent-routing/lib/observability.mjs` | Structured transition records for SLO/conformance consumers |
| `scripts/agent-routing/lib/remediation-router.mjs` | Deterministic remediation instruction builder |
| `scripts/agent-routing/lib/component-integration.mjs` | Authorized non-main component-integration evaluator |
| `scripts/agent-routing/lib/post-integration-verify.mjs` | Exact post-integration verification |
| `scripts/agent-routing/lib/child-closeout.mjs` | Verified child closeout and successor activation evaluator/executor |
| `scripts/agent-routing/lib/child-closeout-guard.mjs` | Guarded workflow entrypoint for closeout/successor execution |
| `scripts/agent-routing/lib/successor-activation.mjs` | Successor launch-package evaluation and resume payloads |
| `.github/workflows/ops-agent-routing-controller.yml` | Read-only route job, write-scoped component-integration job, and closeout-successor job |
| `.github/workflows/ops-agent-routing-reconcile.yml` | Read-only reconciliation safety-net workflow |
| `docs/how-to/ci/operate-agent-routing-controller.md` | Operator disable, recovery, replay, and verification procedure |
| `tests/agent-routing-controller-evidence.test.ts` | Evidence foundation regressions |
| `tests/agent-routing-remediation-routing.test.ts` | Classification and routing regressions |
| `tests/agent-routing-component-integration.test.ts` | Component-integration and verification regressions |
| `tests/agent-routing-closeout-successor.test.ts` | Closeout/successor evaluation, execution, and guard regressions |
| `tests/agent-routing-controller-e2e.test.ts` | End-to-end fixtures, reconciliation, observability, and collector-to-controller proof |
| `tests/fixtures/agent-routing/*.json` | Operational fixtures for clean, late-review, duplicate, protected-stop, and #2433→#2434 path |

## Mode and mutation boundary

```text
mode: observe-only
mutationAllowed: false
```

Root route-workflow capabilities remain false for:

- merge
- close
- relabel
- resume
- activateSuccessor
- mutateMain

`remediationRouting.capabilities` describes artifact instruction types, not direct workflow mutation. The permitted remediation instruction types are `response`, `resume`, and `escalation`.

`componentIntegration.capabilities` permits `integrate` and `verify` only. `close` and `activateSuccessor` remain false. `allowMain` and `allowProduction` remain false. At most one integration mutation may execute per integration run.

Top-level and route-job permissions remain read-only for `contents`, `issues`, `pull-requests`, `checks`, and `actions`. The `integrate-component` job alone has `contents: write` and `pull-requests: write`; Issue, check, and action access remains read-only.

`componentIntegration.enabled`, `closeoutSuccessor.enabled`, `remediationRouting.enabled`, and `mutationSwitches.*` are independent rollback switches. When mutation switches are all false, route and reconcile modes continue as read-only diagnostics without emitting actionable mutation instructions. `reconciliation.mutationAllowed` and `mutationSwitches.reconciliationMutations` remain false.

## Reconciliation safety net (#2677-005 / #2774)

Event-driven `ops-agent-routing-controller.yml` remains primary. `ops-agent-routing-reconcile.yml` is recovery only:

- role: `safety-net`;
- primary path: `event-driven`;
- mutations: never;
- max candidates per run: 1;
- detects missed or stale eligible transactions;
- suppresses when integration, verification, closeout, successor, remediation, or reconciliation identities already exist;
- recommends replay through the event-driven write jobs rather than inventing a second mutation path.

## Observability (#2677-005 / #2774)

Every controller or reconciliation run may attach an `observability` snapshot with schema version `1`. Required transition kinds include:

- `handoff_received`
- `evidence_complete`
- `disposition`
- `resume`
- `integration`
- `verification`
- `closeout`
- `successor_activation`
- `duplicate_suppression`
- `blocker`
- `escalation`
- `reconciliation_scan`
- `mutation_disabled`

These records are consumable by #2680 and daily SLO/conformance reporting. Observability never mutates GitHub state.

## Recognized handoff events

Canonical markers:

- `IMPLEMENTATION HANDOFF`
- `PR REVIEW REQUEST`

Legacy adapter:

- `CHATGPT HANDOFF`

Rules:

- structured Issue comments carry event authority;
- labels alone never carry authority;
- a trigger hint must exactly match a live source-Issue comment;
- missing or ambiguous event authority fails closed.

## Expected-state reads

Operational execution requires both `--issue` and `--pr`. GitHub-native reads cover:

1. the exact open source Issue;
2. the related open PR and current head SHA;
3. current-head checks;
4. changed-file scope;
5. Issue comments;
6. review submissions;
7. review threads;
8. Issue and PR again immediately before emission.

Component execution requires explicit source-Issue number, PR number, expected PR head SHA, component target branch, and expected target-head SHA. It performs two complete GitHub-native collections and immediately before the sole merge re-validates:

- base / declared component target branch;
- required check conclusions on the current head;
- unresolved blocking threads;
- approval profile authority;
- absence of `main`, Production, or ambiguous targets.
- exact target-head identity and no mid-collection Issue, PR, check, review, thread, comment, or target drift.

The final reread fails closed on Issue identity/state/body drift; PR identity/state/head/body/profile/linkage drift; check, review, thread, target, or authority-comment drift; and source-Issue comment author/body changes between reads. Check-run and thread pagination must prove completeness or fail closed.

Optional hints are selectors only. Embedded `live`, findings, authorizations, disposition revisions, and latest-disposition objects are discarded by the operational CLI.

## Evidence packet

A successful packet includes:

- canonical event envelope;
- source Issue metadata and acceptance criteria;
- PR metadata, delivery profile, head SHA, and changed files;
- checks filtered to the current head;
- unresolved threads, review submissions, and late comments as distinct evidence;
- protected-boundary inventory;
- stable event/action identity;
- GitHub-native reread attestation.

## Finding classification

### `clean`

No unresolved actionable finding controls the current head. No remediation response or resume instruction is emitted. Component integration may be evaluated only from this class.

### `bounded_correction`

Every controlling finding has an exact live source-Issue decision that:

- begins with `CHATGPT RESPONSE` or `ADJUSTMENT`;
- states `Status: bounded correction authorized`;
- identifies the current PR;
- identifies the exact current head SHA;
- identifies the exact finding identity;
- provides a non-protected decision class;
- provides a requested action;
- optionally provides a disposition revision.

A caller-provided URL or authorization object is never authority.

### `protected_stop`

At least one finding lacks exact bounded authority or belongs to a protected class. The controller emits at most one escalation instruction and no response/resume pair.

Unresolved review threads and `CHANGES_REQUESTED` reviews remain controlling until dispositioned. A late actionable review comment re-enters remediation even after earlier green checks.

## Protected decision classes

The following always stop:

- `product`
- `design`
- `engineering-approval`
- `recovery`
- `credential`
- `secret`
- `destructive`
- `rights-privacy-publication`
- `production`

A source comment cannot convert one of these classes into an automated bounded correction.

## Source-Issue authority format

A bounded source decision uses this minimum structure:

```text
ADJUSTMENT
Status: bounded correction authorized
PR: #<number>
Head SHA: <current-sha>
Finding identity: <stable-finding-identity>
Decision class: implementation
Disposition revision: <revision>
Requested action:
- <exact bounded action>
```

The comment must be present in the GitHub-native source-Issue comment collection. A PR-only comment does not qualify.

## Component integration authority

Integration is permitted only when all of the following hold:

1. remediation classification is `clean`;
2. delivery model is `B-child` and gate profile is `component-child`;
3. target environment is `component`;
4. target branch is an authorized `component/**` ref matching PR base and declared metadata;
5. target is not `main`, `master`, Production, or otherwise ambiguous;
6. required checks use exact configured names, explicitly identify the current head, and are terminal-success;
7. no unresolved blocking review thread or `CHANGES_REQUESTED` review remains;
8. authority is either:
   - deterministic profile `component-auto-integration` (repository policy; not human approval), or
   - protected profile `protected-change-review` with a recorded independent current-head `APPROVED` review whose review commit SHA exactly matches the PR head, whose reviewer and PR author identities are both present, whose reviewer is configured trusted, and whose reviewer is not the PR author; or a source-Issue `APPROVED FOR INTEGRATION` / `Status: component integration authorized` decision from a configured trusted author that explicitly names the Issue, PR, Head SHA, target branch, and authorization marker.

A repeated equivalent invocation after the PR is merged verifies the merge SHA on the component target and suppresses with zero mutation.

## Post-integration verification

When an exact merge/integration SHA is recorded, verification confirms:

- the authorized target branch contains that merge SHA;
- the source Issue state is explicitly available and remains `OPEN`;
- closeout and successor activation remain deferred.

The write-scoped integration executor also performs a GitHub-native source-Issue reread after the merge mutation and target containment check. If that reread is unavailable, resolves to a pull request, or does not return `OPEN`, the executor reports the failed invariant with `mutations: 1` and still performs no closeout or successor activation.

Verification records the exact target branch and merge SHA. It never closes the source Issue or activates a successor.

## Stable identities

Evidence identity:

```text
actionIdentity =
  issue:<n>:event:<type>:comment:<id>:pr:<n>:head:<sha>
```

Disposition identity:

```text
issue:<n>:pr:<n>:head:<sha>:findings:<sorted-identities>:revision:<revision>
```

Derived remediation identities:

- `response:<dispositionIdentity>`
- `resume:<dispositionIdentity>`
- `escalation:<dispositionIdentity>`

Component-integration identity:

```text
issue:<n>:pr:<n>:head:<sha>:target:<branch>:disposition:<disposition>:merge:<sha|pending>
```

Verification identity:

```text
issue:<n>:pr:<n>:head:<sha>:target:<branch>:merge:<sha>
```

Identity markers are embedded in transaction bodies so repeated equivalent events produce no duplicate instruction.

## Stale and newer decisions

- A changed PR head creates a new disposition identity and requires current-head reevaluation.
- A higher recorded disposition revision on the same head suppresses an older proposal.
- A transaction from another head is never reused.
- Existing response, resume, escalation, integration, and verification markers are read only from live source-Issue comments.
- Routing decision and emitted transaction comments are not reclassified as new late findings.
- Target drift, failed required checks, unresolved blocking threads, missing authority, or forbidden targets block integration without mutation.

## Transaction output

For `bounded_correction`, the artifact contains:

1. one `post_source_issue_response` instruction;
2. one `post_local_cursor_resume` instruction tied to the response identity.

For `protected_stop`, the artifact contains one `post_source_issue_escalation` instruction.

For `clean` with authorized component integration, route output contains at most one `integrate_component_pr` instruction.

For `integrate-component`, the write-scoped job:

1. validates all five expected-state identities;
2. collects and evaluates GitHub-native state;
3. repeats the complete collection immediately before mutation;
4. executes at most one merge using the exact expected PR head;
5. verifies the exact returned merge SHA is contained by the target;
6. rereads the source Issue from GitHub and requires explicit `OPEN`;
7. records no closeout or successor action.

For a recorded merge SHA, the artifact may contain one `record_post_integration_verification` instruction.

The route job does not execute its instructions. Only the explicit integration operation executes a component merge. Closeout and successor activation remain owned by later authorized tasks.

## Validation

Required validation:

- `npx vitest run tests/agent-routing-controller-evidence.test.ts tests/agent-routing-remediation-routing.test.ts tests/agent-routing-component-integration.test.ts tests/agent-routing-closeout-successor.test.ts tests/agent-routing-controller-e2e.test.ts`
- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run check:structure`
- `git diff --check`
- changed-file inspection against the exact #2774 allowlist
- config/schema validation against `config/agent-routing/controller.schema.json`

Fixture coverage must prove:

- clean produces no resume;
- bounded authority produces one response and one resume;
- repeated events deduplicate;
- a changed head requires reevaluation;
- late findings re-enter;
- protected classes escalate only;
- fabricated caller authorization is ignored;
- PR-only authority cannot complete source-Issue routing;
- an authorized clean component PR integrates once;
- a PR targeting `main` is rejected without mutation;
- changed head, failed required check, unresolved blocking thread, missing authority, or target drift blocks integration;
- a repeated event after successful integration is suppressed;
- a protected approval without an explicit current-head review SHA is rejected;
- untrusted, self, missing-author, stale, or headless protected reviews are rejected through the collector-to-controller path;
- source-Issue integration authorization requires trusted author plus exact Issue, PR, Head SHA, target branch, and authorization marker fields;
- source-Issue authorization comment body or author drift blocks before mutation;
- GitHub check-run collection paginates until the complete current-head check surface is collected;
- post-merge source-Issue reread failure reports mutation evidence without closeout or successor activation;
- missing source-Issue state fails post-integration verification;
- component integration can be disabled without disabling route mode;
- the write-scoped integration executor performs two rereads, one merge, and exact merge-SHA containment verification;
- verification records exact target and merge SHA while the source Issue remains open;
- the #2433 → #2434 fixture completes through exactly one successor wake;
- event-driven and reconciliation paths cannot duplicate integration, closeout, or successor wake;
- mutation switches can disable mutation while read-only diagnosis remains available.

## Closeout and successor activation (#2677-004 / #2773)

The `closeout-successor` job invokes `scripts/agent-routing/lib/child-closeout-guard.mjs` as the sanctioned entrypoint. The guard re-exports the corrected closeout executor without broadening GitHub permissions.

Closeout idempotency markers are trusted only when authored by configured `closeoutSuccessor.trustedControllerAuthors`. Spoofed markers from untrusted authors do not suppress mutations or make a closed source appear completed.

Trusted `APPROVED FOR CLOSEOUT` authority requires exact identity fields plus `Review disposition: accepted` and `Integration verification: verified`. The parent/project body must identify the source Issue before the successor in explicit sequence order. An OPEN source child must retain `agent:cursor` and include an actual `## Acceptance criteria` section unless a trusted closeout marker already exists from a partial retry.

Post-mutation verification proves source `CLOSED` with `status:complete` and without stale workflow labels; the successor must carry `agent:cursor`, `handoff:ready`, and `status:in-progress` without retaining `status:blocked`.

## Rollback

1. Set `mutationSwitches.remediationInstructions`, `mutationSwitches.componentIntegration`, and `mutationSwitches.closeoutSuccessor` to `false` while leaving observability enabled.
2. Set `componentIntegration.enabled`, `closeoutSuccessor.enabled`, and/or `remediationRouting.enabled` to `false` as needed.
3. Disable or skip `ops-agent-routing-reconcile.yml`.
4. Revert the #2774 task PR from `component/deterministic-handoff-controller` when a full rollback is required.

Any already-created component integration or closeout must be reversed through a separately authorized revert; never rewrite branch history.

Preserve emitted identity markers, logs, and evidence during rollback so restoration cannot repeat completed response, resume, escalation, integration, verification, closeout, successor, or reconciliation transactions.
