---
Doc Type: Operations
Audience: Human + AI
Authority Level: Project Implementation Plan
Owns: Repository-runner implementation sequence, dependencies, validation, rollout, and rollback within Project #2294
Does Not Own: Project Go decision, GitHub registration token issuance, host command execution, individual workflow migration approval, or production deployment
Canonical Reference: /docs/ops/implementation-plans/agent-issue-polling-handoff-routing/implementation-plan.md
Related Issues: #2294, #2593, #2600, #2601
Last Reviewed: 2026-07-17
---

# Project #2294 Repository Runner Implementation Addendum

## Objective

Prepare, register, validate, and govern one repository-scoped Chromebook Linux GitHub Actions runner without exposing the persistent host to public-repository pull-request code, secrets, production credentials, or automatic deployment authority.

## Completed deliverable

- repository runner configuration on `main`;
- repository-level runner registration named `lgfc-chromebook-linux`;
- labels including `lgfc-repo-runner`;
- systemd service operating on Debian 12 x64;
- successful manual health workflow evidence;
- tested stop, restart, disable, and removal procedures;
- no existing workflow migration without separate approval;
- operator handoff integrated into Project #2294 evidence.

## Dependencies

1. PR #2603 is technically clean and integrated to `component/pmo-project-autonomous-delivery`.
2. The inert runner configuration and health workflow receive a separate human-approved promotion to `main`.
3. Bill has access to repository **Settings → Actions → Runners** and the Chromebook Linux shell.
4. The Chromebook environment meets the documented Debian 12 x64 and systemd assumptions.
5. No Project #2294 execution task is wake-enabled merely by runner registration.

## Implementation sequence

### R0 — repository configuration

Owned in PR #2603:

- `config/github-actions/repository-runner.json`;
- `.github/workflows/repository-runner-health.yml`;
- `docs/reference/ci/repository-runner-contract.md`;
- `docs/how-to/ci/configure-lgfc-repository-runner.md`;
- this design and implementation addendum.

Validation:

- JSON parse;
- workflow YAML parse;
- event and permissions inspection;
- proof that no current workflow uses `lgfc-repo-runner` except the manual health workflow;
- proof that the health workflow has no secret reference or mutation permission.

### R1 — promotion to main

Create a bounded production PR containing only the reviewed materializer remediation and inert runner bootstrap files required on `main`.

Required review:

- current required CI green;
- independent protected-change review;
- exact allowed paths;
- public-repository runner safety review;
- Bill/ChatGPT production approval.

The promotion does not launch Project #2294 and does not register the runner.

### R2 — Chromebook registration

Follow `docs/how-to/ci/configure-lgfc-repository-runner.md`.

Required outputs:

- repository settings show the runner online and idle;
- runner identity and custom labels match the contract;
- systemd service status is healthy;
- the registration token is no longer retained;
- the host contains no prohibited credentials or unrelated personal data used by jobs.

### R3 — health validation

Run `Repository Runner Health` from `main` with the required confirmation.

Evidence:

- trusted repository, ref, actor, and event checks pass;
- runner contract validation passes;
- Debian, architecture, Node, npm, Git, disk, and memory output is recorded;
- workflow requests no secret or write permission;
- no other job is routed to the runner.

### R4 — service recovery proof

1. stop the service;
2. confirm the runner becomes unavailable;
3. start the service;
4. confirm the runner returns online and idle;
5. rerun the manual health check;
6. test repository-side disable or removal without altering project authority.

### R5 — project observe pilot

After Project #2294 Go and applicable task authorization:

- add only a specifically reviewed observe-only job;
- use the exact custom label;
- maintain read-only permissions;
- collect run timing and reliability evidence;
- prove an offline runner produces an explicit capacity halt without blocking independent lanes;
- keep PR checks and production operations on existing trusted surfaces.

## Task graph relationship

- Task #2593 validates the runner contract as part of routing contracts and configuration.
- Task #2594 includes runner availability as a resource signal, never as authority.
- Task #2596 includes runner heartbeat and time-based capacity observability.
- Task #2600 validates trusted routing, offline behavior, collision prevention, and rollback.
- Task #2601 records pilot and operator-handoff evidence.

No new task Issue is required unless implementation discovers work outside these prepared scopes.

## Validation matrix

| Scenario | Expected result |
| --- | --- |
| Manual health from `main` by Bill with exact confirmation | Runner job may execute |
| Manual health from another ref | Job is skipped |
| Manual health by another actor | Job is skipped |
| Pull request or fork | No runner workflow trigger exists |
| Push or schedule | No runner workflow trigger exists |
| Secret reference introduced | Review/validation fails; do not promote |
| Runner offline | Job remains queued/fails by platform policy; project records capacity reason |
| Service restart | Runner returns online and health passes |
| Runner removed | No required workflow or authority is lost |
| Attempted automatic `main` merge | Rejected by project and repository authority |

## Rollback

- remove runner routing from any adopted workflow;
- disable or remove the repository runner in GitHub settings;
- stop and uninstall the local service;
- preserve non-sensitive health and failure evidence;
- keep GitHub-hosted required checks unchanged;
- return Project #2294 to manual/GitHub-hosted operation;
- do not change the production approval boundary.

## Go/No-Go evidence

The runner decision is ready for project review when:

- R0 files pass CI and independent review;
- the public-repository trust boundary is accepted;
- the separate `main` promotion path is understood;
- Chromebook registration is recognized as a post-promotion operator step;
- workflow migration remains a later, individually approved decision.
