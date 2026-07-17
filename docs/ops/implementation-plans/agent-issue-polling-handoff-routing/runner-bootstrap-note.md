---
Doc Type: Operations
Audience: Human + AI
Authority Level: Project Preparation
Owns: Project #2294 repository-runner bootstrap disposition before Go/No-Go
Does Not Own: Host registration, workflow migration, project launch, or production approval
Canonical Reference: /docs/reference/ci/repository-runner-contract.md
Related Issues: #2294, #2593
Last Reviewed: 2026-07-17
---

# Repository Runner Bootstrap Disposition

Bill selected a repository-scoped GitHub Actions self-hosted runner hosted in the Chromebook Linux Debian 12 environment.

Repository preparation now includes:

- machine-readable runner identity and security configuration;
- a manual-only health workflow;
- a repository runner contract;
- a Chromebook installation procedure;
- explicit public-repository isolation boundaries.

The runner is not yet registered. Existing workflows are not routed to it. Registration and the manual health run occur after this repository configuration is reviewed and reaches `main`.
