---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Deterministic handoff-controller live evidence, finding classification, bounded remediation transaction identities, and protected-stop boundaries for #2677-001 and #2677-002
Does Not Own: Component integration, child closeout, successor activation, or Production authorization
Canonical Reference: /config/agent-routing/controller.json
Related Issues: #2677, #2770, #2771, #2676, #2433
Last Reviewed: 2026-07-24
---

# Agent Routing Controller Contract

## Purpose

Define the deterministic controller foundation that:

1. performs GitHub-native current-head evidence collection;
2. classifies the packet as `clean`, `bounded_correction`, or `protected_stop`;
3. emits an idempotent source-Issue transaction instruction only when repository authority already decides the action.

The controller workflow remains read-only. It emits transaction instructions as an artifact; it does not itself merge, close, relabel, resume, activate a successor, or mutate `main`.

## Scope

This document covers #2677-001 / #2770 and #2677-002 / #2771:

- canonical and legacy handoff event recognition;
- GitHub-native live collection of Issue, PR, checks, files, comments, reviews, and review threads;
- final Issue/PR expected-state rereads;
- current-head finding classification;
- source-Issue-bound bounded-correction authorization;
- one response plus one action-scoped `LOCAL CURSOR RESUME` instruction;
- one protected-stop escalation instruction;
- stable transaction identities and duplicate/stale suppression.

It does not authorize component integration, Issue closeout, successor activation, credential changes, destructive action, or Production / `main` mutation.

## Current known truth

- Mode remains `observe-only` with `mutationAllowed: false`.
- Authoritative packet state comes from GitHub-native live reads performed immediately before emission (`source: github-native`).
- Caller `live`, `reread`, finding, authorization, and disposition objects cannot substitute for live evidence.
- Canonical event authority is resolved from live source-Issue comments.
- Bounded-correction authority must be an actual live comment on that same source Issue.
- The workflow has read-only GitHub permissions and produces transaction instructions only.
- Protected decisions never produce a remediation resume.

## Intended final state

Later #2677 children consume this contract serially:

- #2677-003 / #2772 performs authorized non-`main` component integration;
- #2677-004 / #2773 performs eligible closeout and successor activation;
- #2677-005 / #2774 adds reconciliation, observability, E2E fixtures, and rollout.

This contract is the freeze line for evidence identities, remediation identities, source-Issue authority, and protected boundaries.

## Canonical files

| Path | Role |
| --- | --- |
| `config/agent-routing/controller.json` | Observe and remediation-routing configuration |
| `config/agent-routing/controller.schema.json` | Configuration schema |
| `scripts/agent-routing/controller.mjs` | Live evidence and routing entrypoint |
| `scripts/agent-routing/lib/event-contract.mjs` | Event and action identities |
| `scripts/agent-routing/lib/evidence-collector.mjs` | GitHub-native current-head collector |
| `scripts/agent-routing/lib/disposition.mjs` | Finding classification and source-Issue authorization extraction |
| `scripts/agent-routing/lib/idempotency.mjs` | Disposition/response/resume/escalation identities |
| `scripts/agent-routing/lib/remediation-router.mjs` | Deterministic transaction instruction builder |
| `.github/workflows/ops-agent-routing-controller.yml` | Read-only routing workflow |
| `tests/agent-routing-controller-evidence.test.ts` | Evidence foundation regressions |
| `tests/agent-routing-remediation-routing.test.ts` | Classification and routing regressions |

## Mode and mutation boundary

```text
mode: observe-only
mutationAllowed: false
```

Workflow capabilities remain false for:

- merge
- close
- relabel
- resume
- activateSuccessor
- mutateMain

`remediationRouting.capabilities` describes artifact instruction types, not direct workflow mutation. The permitted instruction types are `response`, `resume`, and `escalation`.

Workflow permissions remain read-only for `contents`, `issues`, `pull-requests`, `checks`, and `actions`.

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

The final reread fails closed on Issue identity/state/body drift or PR identity/state/head/body/profile/linkage drift. Check and thread pagination must prove completeness.

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

No unresolved actionable finding controls the current head. No remediation response or resume instruction is emitted.

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

Derived transaction identities:

- `response:<dispositionIdentity>`
- `resume:<dispositionIdentity>`
- `escalation:<dispositionIdentity>`

Identity markers are embedded in transaction bodies so repeated equivalent events produce no duplicate instruction.

## Stale and newer decisions

- A changed PR head creates a new disposition identity and requires current-head reevaluation.
- A higher recorded disposition revision on the same head suppresses an older proposal.
- A transaction from another head is never reused.
- Existing response, resume, and escalation markers are read only from live source-Issue comments.
- Routing decision and emitted transaction comments are not reclassified as new late findings.

## Transaction output

For `bounded_correction`, the artifact contains:

1. one `post_source_issue_response` instruction;
2. one `post_local_cursor_resume` instruction tied to the response identity.

For `protected_stop`, the artifact contains one `post_source_issue_escalation` instruction.

For `clean`, the action list is empty.

The workflow does not execute these instructions in #2771. Execution, integration, closeout, and successor mutation remain owned by later authorized tasks.

## Validation

Required validation:

- `npx vitest run tests/agent-routing-controller-evidence.test.ts tests/agent-routing-remediation-routing.test.ts`
- `npm run typecheck`
- `npm run lint`
- `git diff --check`
- changed-file inspection against the exact #2771 allowlist

Fixture coverage must prove:

- clean produces no resume;
- bounded authority produces one response and one resume;
- repeated events deduplicate;
- a changed head requires reevaluation;
- late findings re-enter;
- protected classes escalate only;
- fabricated caller authorization is ignored;
- PR-only authority cannot complete source-Issue routing.

## Rollback

Disable `remediationRouting.enabled` and revert the #2771 task PR from `component/deterministic-handoff-controller`.

Preserve emitted identity markers during rollback so restoration does not permit duplicate response, resume, or escalation instructions.
