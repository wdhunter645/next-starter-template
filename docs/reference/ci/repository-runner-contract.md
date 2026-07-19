---
Doc Type: Reference
Audience: Human + AI
Authority Level: Project Contract
Owns: Repository-scoped self-hosted runner identity, labels, trusted invocation policy, rollout state, and control-plane placement for Project #2294
Does Not Own: Host registration, project launch, workflow migration, deployment, production authorization, or the meaning of lane decisions
Canonical Reference: /config/github-actions/repository-runner.json
Related Issues: #2294, #2554, #2593, #2640, #2641
Last Reviewed: 2026-07-19
---

# LGFC Repository Runner Contract

## Purpose

Define the repository-side contract for the Chromebook Linux GitHub Actions runner before host registration.

Because the repository is public, the bootstrap runner is repository-scoped, read-only, and manual-only. It must not accept pull-request, fork, push, schedule, deployment, or secret-bearing work.

## Scope

- Owns repository-scoped self-hosted runner identity, labels, trusted invocation policy, rollout state, and control-plane placement for Project #2294.
- Does not own host registration, project launch, workflow migration, deployment, production authorization, or the meaning of lane decisions.

## Current known truth

- The runner is shared communications and control-plane infrastructure inside Administration & Communications.
- Horizontal lanes decide meaning and authorization; the runner transports or executes only authorized automation.
- Bootstrap posture for the public repository remains repository-scoped, read-only, and manual-only until a later authorized rollout changes that contract.

## Intended final state

A registered Chromebook Linux runner provides reliable Administration & Communications dial tone without owning product, design, implementation, approval, or recovery decisions.

## Operating-model placement

The repository runner is shared communications and control-plane infrastructure within the vertical **Administration & Communications** lane.

It provides the repository “dial tone” used by the horizontal lanes to route authorized events, assignments, evidence, acknowledgments, holds, resumes, and deterministic automation.

```text
Horizontal lane decides
  -> Administration & Communications records and routes
  -> runner/controller transports or executes authorized automation
  -> Administration & Communications confirms the result
```

The runner does not own the meaning or authority of an event. It must not make product, design, implementation, PR-approval, incident-classification, recovery-strategy, or production-promotion decisions.

Split responsibility:

- **Administration & Communications** owns event transport, routing semantics, acknowledgment, retry, escalation, and communication-health state.
- **Implementation / Operations** owns creation and onboarding of runner-backed workflows.
- **Day-2 Operations** owns the host, systemd service, capacity, patching, security, availability, stop/start, rollback, and recovery.
- The originating horizontal lane owns the meaning and authorization of the work request.

## Canonical files

- `config/github-actions/repository-runner.json`
- `.github/workflows/repository-runner-health.yml`
- `docs/how-to/ci/configure-lgfc-repository-runner.md`
- `docs/reference/operations/operating-lanes-and-promotion-profiles.md`

## Identity

| Field | Value |
| --- | --- |
| Scope | repository |
| Repository | `wdhunter645/next-starter-template` |
| Name | `lgfc-chromebook-linux` |
| Platform | Debian 12, Linux, x64 |
| Service | systemd |
| Routing label | `lgfc-repo-runner` |

Required routing:

```yaml
runs-on: [self-hosted, linux, x64, lgfc-repo-runner]
```

## Trusted bootstrap invocation

The initial health workflow is valid only when:

- event is `workflow_dispatch`;
- ref is `refs/heads/main`;
- actor is `wdhunter645`;
- confirmation is `RUNNER_HEALTH`;
- permissions remain `contents: read`;
- checkout credentials are not persisted.

## Initial rollout state

```text
repository-configured-host-not-registered
```

Permitted use:

```text
manual health and observe-only validation
```

Existing workflows must remain on their current runners until the host is registered, the health workflow passes, Project #2294 reaches the applicable Go boundary, and the applicable role authorizes a specific workflow migration.

## Promotion conditions

1. Repository-level runner registration is complete.
2. The systemd service is stable.
3. The manual health workflow passes from `main`.
4. Host capability and storage checks pass.
5. Public-repository isolation rules remain enforced.
6. Rollback is proven.
7. The applicable role approves each workflow migration.
8. The workflow’s promotion profile permits runner execution.
9. No workflow may bypass Sandbox, Development, Promotion Candidate, or Production transition rules.

## Communication failure

Runner unavailability, queued-job failure, lost acknowledgment, or unexpected workload routing is a communications/control-plane fault.

- Administration & Communications records and routes the fault.
- Day-2 Operations restores or disables the host/service.
- The originating lane determines whether work may proceed through another authorized path.

If any unexpected workflow is routed to the Chromebook, stop the service and disable the runner before investigation.

## Disable and rollback

Disable the runner in repository settings, stop the local service, leave required checks on their current runners, and revert any workflow-routing change through a bounded PR.

The Chromebook runner must not become a required production dependency before rollback is proven.