---
Doc Type: Reference
Audience: Human + AI
Authority Level: Project Runtime Contract
Owns: Project #2294 controller inputs, outputs, action classes, state revisions, alert/claim records, permission boundaries, and rollout modes
Does Not Own: Product decisions, credentials, repository settings, production approval, or automatic merge to main
Canonical Reference: /docs/explanation/projects/agent-issue-polling-handoff-routing-design.md
Related Issues: #2294, #2550, #2554, #2593-#2601
Last Reviewed: 2026-07-18
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

Every mutation includes the expected state revision and stable action key. The adapter re-reads live state before applying it.

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
