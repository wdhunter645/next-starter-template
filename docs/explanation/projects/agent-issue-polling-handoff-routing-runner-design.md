---
Doc Type: Explanation
Audience: Human + AI
Authority Level: Project Design Authority
Owns: Repository-runner architecture, trust boundary, role in Project #2294, rollout phases, and relationship to GitHub-hosted CI
Does Not Own: Host registration token, Chromebook installation execution, project Go decision, workflow migration approval, or production deployment
Canonical Reference: /docs/explanation/projects/agent-issue-polling-handoff-routing-design.md
Related Issues: #2294, #2593, #2600, #2601
Last Reviewed: 2026-07-17
---

# Project #2294 Repository Runner Design

## Purpose

Extend the Project #2294 architecture with one repository-scoped GitHub Actions self-hosted runner hosted in the Chromebook Linux Debian 12 environment.

The runner provides controlled repository execution capacity. It does not replace GitHub-hosted CI, the GitHub connector, local Cursor, or ChatGPT watchers, and it does not create new project or production authority.

## Architectural role

The completed routing system has five execution surfaces:

1. GitHub-hosted deterministic CI for public and untrusted event evaluation;
2. the repository-scoped Chromebook runner for explicitly trusted, bounded repository jobs;
3. local Cursor for implementation and operational work;
4. broad ChatGPT watcher cycles using the GitHub connector;
5. Bill/ChatGPT at protected and production decision boundaries.

The Chromebook runner is an optional capacity surface, not a required dependency for repository authority. When it is offline, GitHub Issues, PRs, manifests, comments, and GitHub-hosted checks remain authoritative.

## Identity

| Field | Design value |
| --- | --- |
| Scope | repository |
| Repository | `wdhunter645/next-starter-template` |
| Runner name | `lgfc-chromebook-linux` |
| Host | Chromebook Linux environment |
| Distribution | Debian 12 |
| Architecture | x64 |
| Service model | systemd-managed GitHub Actions runner service |
| Required label | `lgfc-repo-runner` |

Machine-readable identity and restrictions live in `config/github-actions/repository-runner.json`.

## Public-repository trust boundary

The repository is public. Pull-request and fork content is therefore untrusted and must not execute on the persistent Chromebook runner.

The runner starts with these prohibitions:

- no `pull_request` or `pull_request_target` jobs;
- no fork jobs;
- no automatic push, schedule, issue-comment, or workflow-chain jobs;
- no repository secrets;
- no production, Cloudflare, D1, B2, SSH, or personal credentials;
- no deployment authority;
- no commands copied from Issues, PRs, or comments;
- no persistent checkout credentials;
- no automatic merge to `main`.

GitHub-hosted runners remain the correct surface for PR checks and other untrusted-event evaluation.

## Initial use

Initial use is limited to the manual `Repository Runner Health` workflow:

- event: `workflow_dispatch`;
- ref: `main`;
- actor: `wdhunter645`;
- explicit confirmation input;
- permission: `contents: read`;
- no secrets;
- no repository mutation.

The health workflow validates the repository contract and reports the host platform, runner identity, Node/npm/Git availability, disk, and memory.

## Rollout phases

### Phase R0 — repository configuration

- commit runner identity and restrictions;
- commit the manual health workflow;
- commit setup and rollback documentation;
- do not register the host;
- do not migrate workflows.

### Phase R1 — main availability

- independently review the inert repository configuration;
- promote the runner contract and health workflow to `main` through a human-approved PR;
- confirm no automatic job targets `lgfc-repo-runner`.

### Phase R2 — host registration

- create a repository-level registration token through GitHub settings;
- install the runner application in the Chromebook Linux environment;
- register the custom labels;
- install and start the systemd service;
- confirm the runner is online and idle.

### Phase R3 — manual health validation

- dispatch the health workflow from `main`;
- confirm the trusted-invocation guard;
- confirm contract validation and host inventory;
- test stop, restart, disable, and removal procedures;
- retain no registration token.

### Phase R4 — observe-only project use

After Project #2294 Go and task authorization:

- allow only specifically reviewed manual or observe-only jobs;
- collect timing, stability, disk, and service evidence;
- keep mutation mode disabled;
- keep all PR checks on GitHub-hosted runners.

### Phase R5 — bounded workflow adoption

A workflow may use the repository runner only after a separate review proves:

- its event is trusted;
- its checkout ref is trusted;
- its permissions are least-privilege;
- it uses no prohibited secret or credential;
- its commands are repository-owned and bounded;
- its failure and cancellation behavior is safe;
- the runner can be disabled without blocking required repository operation;
- Bill explicitly approves the migration.

## Scheduler relationship

Project #2294 may consider the repository runner when calculating available execution capacity, but availability does not create work authority.

A job is runner-eligible only when:

- its task or workflow is already authorized;
- the event and ref are trusted;
- the job is assigned the exact runner label;
- no collision exists with local Cursor or another repository-runner job;
- the runner is online and healthy;
- the job remains inside its approved scope.

If the runner is offline, the scheduler records the capacity reason and continues evaluating independent lanes. It must not weaken trust rules or invent work to use the runner.

## Failure and rollback

Runner failure must not corrupt project state.

- stop routing new jobs to the custom label;
- disable or remove the runner in repository settings;
- stop the local service;
- preserve safe diagnostic evidence;
- keep required checks on GitHub-hosted runners;
- return affected work to an authorized alternative surface or record an exact halt reason;
- never bypass the `main` approval boundary.

## Success criteria

The repository-runner extension succeeds when:

- repository configuration is reviewed and available on `main`;
- the Chromebook runner registers with the expected identity and labels;
- manual health validation passes;
- public-repository untrusted events cannot route to the runner;
- secrets and production credentials remain unavailable;
- stop/restart/removal are proven;
- Project #2294 can use the runner only through explicitly authorized bounded jobs;
- repository operation remains safe when the runner is offline.
