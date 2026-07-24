---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Deterministic handoff-controller observe-only event identities, expected-state reads, evidence-packet schema, and protected non-automatable boundaries for #2677-001
Does Not Own: Finding classification, remediation routing, component integration, closeout, successor activation, or Production authorization
Canonical Reference: /config/agent-routing/controller.json
Related Issues: #2677, #2770, #2676, #2433
Last Reviewed: 2026-07-24
---

# Agent Routing Controller Contract (Observe-Only)

## Purpose

Define the read-only foundation for the deterministic Cursor handoff controller.

This contract normalizes canonical source-Issue handoff/review events and collects current-head Issue, PR, check, diff-scope, acceptance, comment, and unresolved-review-thread evidence into one deterministic controller packet.

This task performs **no** Issue, PR, branch, label, closeout, resume, integration, or `main` mutation.

## Scope

This document covers only the observe-only evidence foundation for #2677-001 / #2770:

- canonical and legacy handoff/review event recognition;
- GitHub-native live collection of current-head Issue, PR, checks, files, comments, reviews, and unresolved threads;
- fail-closed comparison of optional trigger/snapshot hints against those live reads;
- stable action identities and protected non-automatable decision classes;
- the read-only workflow that emits an evidence artifact.

It does not authorize finding classification, remediation routing, component integration, closeout, successor activation, credential use beyond read-only GitHub token scopes, or any Production / `main` mutation.

## Current known truth

- Mode is locked to `observe-only` with `mutationAllowed: false`.
- Authoritative packet state comes from GitHub-native live reads performed immediately before emission.
- Caller-supplied snapshot and `reread` fields are hints only; they cannot substitute for live evidence and fail closed on mismatch.
- Checks retained in the packet are filtered to the authoritative current PR head SHA.
- Invalid or missing PR numbers fail closed before action-identity construction.
- Observe-only configuration invariants (markers, protected classes, workflow capabilities, reread/stale-head flags) are validated at load time.
- Workflow permissions remain read-only; merge, close, relabel, resume, successor activation, and `main` mutation stay disabled.

## Intended final state

Later #2677 child tasks consume this observe-only packet without widening mutation authority in this foundation:

- #2677-002 / #2771 classifies findings and routes bounded remediation;
- #2677-003 / #2772 performs authorized non-`main` component integration;
- #2677-004 / #2773 performs eligible closeout and successor activation;
- #2677-005 / #2774 adds reconciliation, observability, E2E fixtures, and rollout.

This contract remains the freeze line for observe-only identities, live expected-state reads, and protected boundaries until a later authorized Issue changes it.

## Canonical files

| Path | Role |
| --- | --- |
| `config/agent-routing/controller.json` | Observe-only controller configuration |
| `config/agent-routing/controller.schema.json` | Configuration schema |
| `scripts/agent-routing/controller.mjs` | Observe entrypoint with live collection |
| `scripts/agent-routing/lib/event-contract.mjs` | Event marker and action-identity contract |
| `scripts/agent-routing/lib/evidence-collector.mjs` | Live collector and current-head packet builder |
| `.github/workflows/ops-agent-routing-controller.yml` | Read-only workflow (artifact only) |
| `tests/agent-routing-controller-evidence.test.ts` | Fixture coverage for #2433 / PR #2675 |

## Mode and mutation boundary

```text
mode: observe-only
mutationAllowed: false
```

Workflow capabilities are fixed false for:

- merge
- close
- relabel
- resume
- activateSuccessor
- mutateMain

Workflow permissions are read-only (`contents`, `issues`, `pull-requests`, `checks`, `actions`).

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

Idempotency key fields:

- `sourceIssueNumber`
- `eventType`
- `eventCommentId`
- `prNumber`
- `headSha`
- `actionIdentity`

Later mutation tasks must reuse these identities for duplicate suppression.

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

Optional trigger/snapshot hint fields are compared against those live reads. Caller-supplied `reread` data is never authoritative. Operational CLI/workflow execution with `--issue`/`--pr` always performs GitHub-native collection and overwrites any embedded `input.live` hint. Canonical event authority is resolved only from live Issue comments; a caller trigger ID/body is a selector hint that must exactly match a live comment. Delivery profile is derived from the live PR body; caller profile hints fail closed on mismatch.

After collecting files, comments, reviews, checks, and threads, the collector re-reads the source Issue and PR immediately before emission and fails closed on identity, open-state, linkage, or head-SHA drift. Check-run and review-thread retrieval paginate to completion and fail closed on API failure or incomplete evidence.

Fail closed when:

- live GitHub evidence is unavailable
- source Issue is missing, closed, or ambiguous (not exactly one)
- PR number is missing or invalid
- PR primary `Issue:` reference is missing, multiple, or mismatched
- observed or hint head SHA is stale versus the authoritative live PR head
- PR head or Issue identity/state/linkage drifts during collection
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

## Protected non-automatable decisions

These classes are always marked non-automatable:

- `product`
- `engineering-approval`
- `recovery`
- `credential`
- `destructive`
- `production`

Observe-only mode records the boundary. It does not escalate, approve, or mutate.

## Fixture authority

The primary fixture represents the observed incident path for source Issue `#2433` / PR `#2675` (content-collection CC-001). Tests inject authoritative `live` evidence that simulates GitHub-native collection. The fixture must produce exactly one normalized current-head packet when the head is current and a single open source Issue is resolved. Fabricated caller `reread` data, stale heads/checks, invalid PR numbers, unavailable live evidence, and configuration drift must fail closed.

## Successor ownership

| Later task | Owns |
| --- | --- |
| #2677-002 / #2771 | Finding classification and bounded remediation routing |
| #2677-003 / #2772 | Authorized non-`main` component integration |
| #2677-004 / #2773 | Eligible closeout and successor activation |
| #2677-005 / #2774 | Reconciliation, observability, E2E fixtures, rollout |

## Rollback

Revert the task PR from `component/deterministic-handoff-controller`. Because this foundation is read-only, no live routing state or source Issue is mutated by this contract.
