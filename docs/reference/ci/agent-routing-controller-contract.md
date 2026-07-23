---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Deterministic handoff-controller observe-only event identities, expected-state reads, evidence-packet schema, and protected non-automatable boundaries for #2677-001
Does Not Own: Finding classification, remediation routing, component integration, closeout, successor activation, or Production authorization
Canonical Reference: /config/agent-routing/controller.json
Related Issues: #2677, #2770, #2676, #2433
Last Reviewed: 2026-07-23
---

# Agent Routing Controller Contract (Observe-Only)

## Purpose

Define the read-only foundation for the deterministic Cursor handoff controller.

This contract normalizes canonical source-Issue handoff/review events and collects current-head Issue, PR, check, diff-scope, acceptance, comment, and unresolved-review-thread evidence into one deterministic controller packet.

This task performs **no** Issue, PR, branch, label, closeout, resume, integration, or `main` mutation.

## Canonical files

| Path | Role |
| --- | --- |
| `config/agent-routing/controller.json` | Observe-only controller configuration |
| `config/agent-routing/controller.schema.json` | Configuration schema |
| `scripts/agent-routing/controller.mjs` | Observe entrypoint |
| `scripts/agent-routing/lib/event-contract.mjs` | Event marker and action-identity contract |
| `scripts/agent-routing/lib/evidence-collector.mjs` | Current-head evidence packet builder |
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

Before emitting a packet the controller must re-read:

1. source Issue (exactly one open Issue)
2. related PR and authoritative head SHA
3. current-head checks
4. changed-file scope
5. acceptance criteria from Issue and/or PR
6. Issue comments
7. review submissions
8. unresolved review threads

Fail closed when:

- source Issue is missing, closed, or ambiguous (not exactly one)
- PR primary `Issue:` reference is missing, multiple, or mismatched
- observed head SHA is stale versus the authoritative PR head
- delivery/ownership profile fields contradict (for example B-child targeting production)

## Evidence packet contents

A successful packet includes:

- normalized event envelope
- source Issue metadata and acceptance criteria
- PR metadata, delivery profile, head SHA, and sorted changed files
- normalized checks
- review evidence with **unresolved threads** and **late Issue comments** represented distinctly
- protected-boundary inventory
- idempotency key and action identity
- reread attestation

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

The primary fixture represents the observed incident path for source Issue `#2433` / PR `#2675` (content-collection CC-001). It must produce exactly one normalized current-head packet when the head is current and a single open source Issue is resolved.

## Successor ownership

| Later task | Owns |
| --- | --- |
| #2677-002 / #2771 | Finding classification and bounded remediation routing |
| #2677-003 / #2772 | Authorized non-`main` component integration |
| #2677-004 / #2773 | Eligible closeout and successor activation |
| #2677-005 / #2774 | Reconciliation, observability, E2E fixtures, rollout |

## Rollback

Revert the task PR from `component/deterministic-handoff-controller`. Because this foundation is read-only, no live routing state or source Issue is mutated by this contract.
