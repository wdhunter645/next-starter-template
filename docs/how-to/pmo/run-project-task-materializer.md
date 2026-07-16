---
Doc Type: How-To
Audience: Bill, ChatGPT, Cursor, LGFC maintainers
Authority Level: Operational Authority
Owns: Operator usage, authorization, rollback, and disable procedure for the PMO project task-materializer workflow
Does Not Own: Manifest schema design, production merge approval, branch protection settings, or unrestricted issue mutation
Canonical Reference: /docs/reference/pmo/project-delivery-manifest-contract.md
Related Issues: #2546, #2547, #2549
Last Reviewed: 2026-07-16
---

# Run the PMO project task materializer workflow

## Purpose

Validate an approved PMO project manifest and optionally reconcile its linked GitHub task issues using the Task 001 materializer.

Workflow file: `.github/workflows/pmo-project-task-materializer.yml`

## When to use

- After ChatGPT prepares or updates a project manifest.
- Before launching Cursor on a prepared project task graph.
- After changing task IDs, predecessors/successors, or generated metadata.

## Modes

| Mode | Mutation | Required authorization |
| --- | --- | --- |
| `dry-run` | None | Default; safe for PR/push validation |
| `apply` | May create/update issues | Manual `workflow_dispatch` only, with `authorize_apply=true` |

## Manual dry-run

1. Open **Actions → PMO Project Task Materializer → Run workflow**.
2. Set:
   - `manifest_path` to the repository-relative JSON path
   - `mode` = `dry-run`
   - `authorize_apply` = `false`
3. Review the job summary and artifact for create/update/no-change/blocked rows.

Local equivalent:

```bash
npm run pmo:project:validate -- <manifest-path>
npm run pmo:project:materialize -- --dry-run --repo wdhunter645/next-starter-template <manifest-path>
```

## Manual apply

1. Confirm the manifest validates and dry-run output is expected.
2. Confirm you intend to mutate only the manifest-selected task issues.
3. Run workflow with:
   - `mode` = `apply`
   - `authorize_apply` = `true`
4. Confirm the summary shows only the intended create/update/no-change actions.
5. Re-run apply; a second identical run must be `no-change` only.

Local equivalent:

```bash
PMO_MATERIALIZE_APPLY_AUTHORIZED=true \
  npm run pmo:project:materialize -- --apply --repo wdhunter645/next-starter-template <manifest-path>
```

## Automatic validation (no mutation)

Pull requests and pushes that touch `docs/ops/implementation-plans/**/project-manifest.json` run validation/dry-run only. Apply mode is refused for pull-request events, including forks.

## Safety boundaries

- Least privilege: `contents:read`; `issues:write` only for trusted dispatch apply.
- Fork pull requests cannot apply mutations.
- Invalid schema, cyclic task graphs, duplicate IDs, and `autoMergeProduction=true` fail closed.
- The materializer never merges pull requests and never targets `main` for automatic integration.

## Rollback / disable

To stop future materialization runs without changing repository settings:

1. Disable the workflow in the GitHub Actions UI (**Actions → PMO Project Task Materializer → ⋯ → Disable workflow**), or
2. Revert/remove `.github/workflows/pmo-project-task-materializer.yml` on the project branch via a follow-up PR.

If an apply run created incorrect issues:

1. Do not delete discussion comments.
2. Relabel or close only with explicit operator authority.
3. Correct the manifest and re-run dry-run/apply to reconcile generated blocks.
4. Record the incident on the project issue.

## Troubleshooting

| Symptom | Likely cause | Action |
| --- | --- | --- |
| Apply refused | `authorize_apply` false or non-dispatch event | Re-run with dispatch + authorize_apply=true |
| Validation failed | Schema/task-graph/production boundary defect | Fix manifest; do not apply |
| Duplicate marker blocked | Two issues share a task marker | Resolve manually before apply |
| Adoption-candidate | Issue number lacks stable marker | Explicitly adopt or create a new issue |
