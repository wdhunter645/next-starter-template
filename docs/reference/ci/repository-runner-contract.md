---
Doc Type: Reference
Audience: Human + AI
Authority Level: Project Contract
Owns: Repository-scoped self-hosted runner identity, labels, trusted invocation policy, and rollout state for Project #2294
Does Not Own: Host registration, project launch, workflow migration, deployment, or production authorization
Canonical Reference: /config/github-actions/repository-runner.json
Related Issues: #2294, #2554, #2593
Last Reviewed: 2026-07-17
---

# LGFC Repository Runner Contract

## Purpose

Define the repository-side contract for the Chromebook Linux GitHub Actions runner before host registration.

Because the repository is public, the bootstrap runner is repository-scoped, read-only, and manual-only. It must not accept pull-request, fork, push, schedule, deployment, or secret-bearing work.

## Canonical files

- `config/github-actions/repository-runner.json`
- `.github/workflows/repository-runner-health.yml`
- `docs/how-to/ci/configure-lgfc-repository-runner.md`

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

Existing workflows must remain on their current runners until the host is registered, the health workflow passes, Project #2294 reaches the applicable Go boundary, and Bill authorizes a specific workflow migration.

## Promotion conditions

1. Repository-level runner registration is complete.
2. The systemd service is stable.
3. The manual health workflow passes from `main`.
4. Host capability and storage checks pass.
5. Public-repository isolation rules remain enforced.
6. Rollback is proven.
7. Bill approves each workflow migration.

## Disable and rollback

Disable the runner in repository settings, stop the local service, leave required checks on their current runners, and revert any workflow-routing change through a bounded PR.

The Chromebook runner must not become a required production dependency before rollback is proven.
