---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Deterministic handoff-controller event identities, expected-state reads, evidence-packet schema, current-head finding classification, bounded source-Issue remediation routing, duplicate suppression, and protected-stop escalation through #2677-002
Does Not Own: Component integration, closeout, successor activation, Product/design/Engineering/recovery decisions, credentials, destructive action, rights/privacy/publication decisions, or Production authorization
Canonical Reference: /config/agent-routing/controller.json
Related Issues: #2677, #2770, #2771, #2676, #2433
Last Reviewed: 2026-07-24
---

# Agent Routing Controller Contract

## Purpose

Define the evidence and bounded-remediation stages of the deterministic Cursor handoff controller.

This contract normalizes canonical source-Issue handoff/review events and collects current-head Issue, PR, check, diff-scope, acceptance, comment, and unresolved-review-thread evidence into one deterministic controller packet.

The remediation stage classifies that packet as `clean`, `bounded_correction`, or `protected_stop`. It may emit one source-Issue response and one exact `LOCAL CURSOR RESUME` only when current source-Issue authority already decides every correction. Otherwise it emits at most one protected-stop escalation.

The observe-only workflow performs no merge, closeout, relabel, successor activation, branch mutation, Issue write, or `main` mutation. Emitted remediation actions are transaction instructions for a separately authorized executor.

## Scope

This document covers the observe-only evidence foundation for #2677-001 / #2770 and the bounded remediation-routing stage for #2677-002 / #2771:

- canonical and legacy handoff/review event recognition;
- GitHub-native live collection of current-head Issue, PR, checks, files, comments, reviews, and unresolved threads;
- fail-closed comparison of optional trigger/snapshot hints against those live reads;
- stable action identities and protected non-automatable decision classes;
- current-head finding classification and source-Issue-only remediation routing;
- the read-only workflow that emits an evidence/remediation artifact.

It does not authorize component integration, closeout, successor activation, credential use beyond read-only GitHub token scopes, or any Production / `main` mutation.

## Current known truth

- Mode is locked to `observe-only` with `mutationAllowed: false`.
- Authoritative packet state comes from GitHub-native live reads performed immediately before emission.
- Caller-supplied snapshot and `reread` fields are hints only; they cannot substitute for live evidence and fail closed on mismatch.
- Checks retained in the packet are filtered to the authoritative current PR head SHA.
- Invalid or missing PR numbers fail closed before action-identity construction.
- Observe-only configuration invariants (markers, protected classes, workflow capabilities, reread/stale-head flags) are validated at load time.
- `remediationRouting.enabled: true` adds classification and transaction-instruction output without broadening workflow write permissions.
- Workflow permissions remain read-only; merge, close, relabel, resume, successor activation, and `main` mutation stay disabled at the workflow capability layer.

## Intended final state

Later #2677 child tasks consume this observe-only packet and remediation instructions without widening mutation authority in this foundation:

- #2677-002 / #2771 classifies findings and routes bounded remediation (this contract stage);
- #2677-003 / #2772 performs authorized non-`main` component integration;
- #2677-004 / #2773 performs eligible closeout and successor activation;
- #2677-005 / #2774 adds reconciliation, observability, E2E fixtures, and rollout.

This contract remains the freeze line for observe-only identities, live expected-state reads, remediation identities, and protected boundaries until a later authorized Issue changes it.

## Canonical files

| Path | Role |
| --- | --- |
| `config/agent-routing/controller.json` | Controller mode, protected boundary, capability, remediation, and idempotency configuration |
| `config/agent-routing/controller.schema.json` | Configuration schema |
| `scripts/agent-routing/controller.mjs` | Observe entrypoint with live collection and remediation classification |
| `scripts/agent-routing/lib/event-contract.mjs` | Event marker and action-identity contract |
| `scripts/agent-routing/lib/evidence-collector.mjs` | Live collector and current-head packet builder |
| `scripts/agent-routing/lib/disposition.mjs` | Current-head finding classification |
| `scripts/agent-routing/lib/idempotency.mjs` | Stable response/resume/escalation identities and stale suppression |
| `scripts/agent-routing/lib/remediation-router.mjs` | Source-Issue action construction and duplicate suppression |
| `.github/workflows/ops-agent-routing-controller.yml` | Read-only workflow (artifact only) |
| `tests/agent-routing-controller-evidence.test.ts` | Fixture coverage for #2433 / PR #2675 |
| `tests/agent-routing-remediation-routing.test.ts` | Clean, correction, duplicate, late-finding, stale-head, and protected-stop fixtures |

## Mode and mutation boundary

```text
mode: observe-only
mutationAllowed: false
remediationRouting.enabled: true
remediationRouting.sourceIssueOnly: true
```

Workflow capabilities are fixed false for:

- merge
- close
- relabel
- resume
- activateSuccessor
- mutateMain

The root workflow capabilities, including `resume`, remain false. The nested remediation-routing capabilities authorize deterministic response/resume/escalation transaction output for a separately authorized executor. Workflow permissions remain read-only; this task does not broaden the observe workflow into a GitHub writer.

Disabling `remediationRouting.enabled` suppresses remediation transaction output without erasing emitted identities.

## Recognized events

Canonical markers (authority surfaces):

- `IMPLEMENTATION HANDOFF`
- `PR REVIEW REQUEST`

Legacy adapters still accepted until migration completes:

- `CHATGPT HANDOFF`

Rules:

- Structured Issue comments carry authority.
- Labels alone are never authority (`labelsAreAuthority: false`).
- Missing event markers fail closed.

## Stable identities

Every packet emits:

```text
actionIdentity =
  issue:<n>:event:<type>:comment:<id>:pr:<n|none>:head:<sha|none>
```

Observation idempotency fields:

- `sourceIssueNumber`
- `eventType`
- `eventCommentId`
- `prNumber`
- `headSha`
- `actionIdentity`

Remediation idempotency fields:

- source Issue number
- PR number and current head SHA
- sorted review-thread/finding identities
- disposition revision
- response identity
- resume identity

Equivalent reruns independently suppress an already-posted response, resume, or escalation. This permits recovery after a partial response/resume transaction without duplicating the successful half.

A changed PR head invalidates the earlier disposition identity and requires a complete current-head re-evaluation. A higher disposition revision suppresses stale lower-revision actions on the same head.

## Expected-state reads

Before emitting a packet the controller must perform GitHub-native live reads of:

1. source Issue (exactly one open Issue)
2. related PR and authoritative head SHA
3. current-head checks (filtered to the authoritative head)
4. changed-file scope
5. acceptance criteria from Issue and/or PR
6. Issue comments
7. review submissions
8. unresolved review threads

Optional trigger/snapshot hint fields are compared against those live reads. Caller-supplied `reread` data is never authoritative. Operational CLI/workflow execution with both `--issue` and `--pr` always performs GitHub-native collection and overwrites any embedded `input.live` hint. Presence of either identity flag is operational intent; a partial `--issue`-only or `--pr`-only invocation fails closed before any embedded live fixture path is considered. Canonical event authority is resolved only from live Issue comments; a caller trigger ID/body is a selector hint that must exactly match a live comment. Delivery profile is derived from the live PR body; caller profile hints fail closed on mismatch.

After collecting files, comments, reviews, checks, and threads, the collector re-reads the source Issue and PR immediately before emission and fails closed on identity, open-state, full PR body/delivery-profile, linkage, or head-SHA drift. Check-run and review-thread retrieval paginate to completion and fail closed on API failure or incomplete evidence.

Fail closed when:

- live GitHub evidence is unavailable
- source Issue is missing, closed, or ambiguous (not exactly one)
- either `--issue` or `--pr` is supplied without the other (partial CLI identity)
- PR number is missing or invalid
- PR is closed or otherwise not open at final reread
- PR primary `Issue:` reference is missing, multiple, or mismatched
- observed or hint head SHA is stale versus the authoritative live PR head
- PR head, body/profile, or Issue identity/state/linkage drifts during collection
- caller-supplied reread/hint identity fields disagree with live evidence
- caller trigger/event comment is missing from live Issue comments
- caller delivery-profile hint disagrees with the live PR-derived profile
- check-run or review-thread collection fails or cannot prove completeness
- delivery/ownership profile fields contradict (for example B-child targeting production)
- observe-only configuration invariants drift

## Evidence packet contents

A successful packet includes:

- normalized event envelope
- source Issue metadata and acceptance criteria
- PR metadata, delivery profile, head SHA, and sorted changed files
- normalized checks filtered to the authoritative head
- review evidence with **unresolved threads** and **late Issue comments** represented distinctly
- protected-boundary inventory
- idempotency key and action identity
- reread attestation with `source: github-native`

## Disposition rules

`clean` requires no unresolved actionable current-head finding and emits no remediation resume.

`bounded_correction` requires every controlling finding to have:

- a stable finding identity;
- the current PR head SHA;
- an explicit `bounded_correction` disposition;
- `authorized: true`;
- a non-protected decision class;
- an exact decision URL on the authoritative source Issue.

An authorization available only in a PR comment or review does not complete source-Issue routing.

An unresolved current-head review thread controls even when all checks are green. A late actionable review finding re-enters classification and therefore cannot reuse an earlier clean result.

`protected_stop` applies when any current-head finding lacks bounded source-Issue authority or belongs to a protected/subjective class. It emits at most one `HOLD` escalation and no response or resume.

## Protected non-automatable decisions

Observe-packet inventory classes (event-contract / config):

- `product`
- `engineering-approval`
- `recovery`
- `credential`
- `destructive`
- `production`

Remediation classification always-escalates these additional protected/subjective classes as well:

- `design`
- `secret`
- `rights-privacy-publication`

The controller records and escalates these boundaries. It does not decide or mutate them.

## Transaction order and collision safety

Immediately before emitting each transaction, the controller uses the re-read open source Issue, PR head SHA, and current Issue comments supplied by the evidence stage. A transaction executor must repeat those expected-state reads before applying an emitted action.

For a bounded correction:

1. post or find the exact response identity;
2. use that response comment URL in the exact resume;
3. post the resume only when its identity is absent;
4. suppress remaining actions if the PR head changes.

The emitted transaction targets the source Issue only. A PR-only comment never satisfies a source-Issue decision or response identity.

## Fixture authority

The primary fixture represents the observed incident path for source Issue `#2433` / PR `#2675` (content-collection CC-001). Tests inject authoritative `live` evidence that simulates GitHub-native collection. The fixture must produce exactly one normalized current-head packet when the head is current and a single open source Issue is resolved. Fabricated caller `reread` data, stale heads/checks, invalid PR numbers, unavailable live evidence, and configuration drift must fail closed.

Remediation fixtures cover clean evidence, one bounded correction, duplicate suppression, late actionable findings, changed-head re-evaluation, and protected-stop escalation.

## Successor ownership

| Later task | Owns |
| --- | --- |
| #2677-002 / #2771 | Finding classification and bounded remediation routing (this contract) |
| #2677-003 / #2772 | Authorized non-`main` component integration |
| #2677-004 / #2773 | Eligible closeout and successor activation |
| #2677-005 / #2774 | Reconciliation, observability, E2E fixtures, rollout |

## Rollback

Disable `remediationRouting.enabled` and revert the task PR from `component/deterministic-handoff-controller`. Preserve emitted response, resume, and escalation markers so rollback cannot make an equivalent event eligible for duplicate routing.
