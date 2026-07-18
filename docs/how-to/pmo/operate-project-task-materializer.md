---
Doc Type: How-To
Audience: Bill, ChatGPT, Cursor Local, LGFC maintainers
Authority Level: Operational Procedure
Owns: Safe validation, dry-run, explicitly authorized apply, verification, disable, recovery, and rollback for the PMO project task materializer
Does Not Own: Project GO decisions, task scope, product priorities, production promotion, credentials, or repository settings
Canonical Reference: /docs/reference/pmo/project-delivery-manifest-contract.md
Related Issues: #2546, #2554
Last Reviewed: 2026-07-18
---

# Operate the PMO project task materializer

## Purpose

Use the PMO materializer to validate a committed project manifest and deterministically create or reconcile linked task Issues without weakening GitHub Issue authority, human-authored discussion, or the manual production boundary.

Automatic PR and push events are validation/dry-run only. Issue mutation is allowed only through an explicit trusted manual dispatch using the canonical manifest path and the apply-authorization input.

## Prerequisites

Before operating the materializer, confirm:

1. the project has an approved design, implementation plan, Model B branch, task DAG, validation profile, rollback reference, and production boundary;
2. the manifest path is canonical: `docs/ops/implementation-plans/<project-slug>/project-manifest.json`;
3. every task has one unique ID, valid predecessor/successor references, one non-`main` PR base, labels matching its current state, and an explicit wake-eligibility value;
4. exactly one terminal task matches `closeout.terminalTaskId`;
5. `delivery.autoMergeProduction` is `false`;
6. Cursor Local is not a production approver;
7. no unresolved product, credential, rights, privacy, legal, repository-setting, or production decision is being hidden by the manifest.

## Procedure

### 1. Validate the manifest locally or in a trusted repository checkout

Run:

```bash
npm ci
npm run pmo:project:validate -- docs/ops/implementation-plans/<project-slug>/project-manifest.json
```

Stop if validation reports any error. Do not bypass the validator or weaken the schema to force a pass.

### 2. Run a read-only materialization plan

Run:

```bash
npm run pmo:project:materialize -- --dry-run --repo wdhunter645/next-starter-template docs/ops/implementation-plans/<project-slug>/project-manifest.json
```

Review every planned row and the summary counts:

- `create` — no existing marker or issue-number mapping exists;
- `update` — the generated block, title, or labels differ;
- `no-change` — current Issue state already matches;
- `blocked` — duplicate/ambiguous marker or unsafe state;
- `adoption-candidate` — an issue number exists without the required marker and requires explicit human review.

Do not apply while `blocked` or `adoption-candidate` is nonzero.

### 3. Review generated changes before mutation

For each create/update action, confirm:

1. the parent project and task ID are correct;
2. the task title and objective match the approved implementation plan;
3. the PR base is the non-production project branch;
4. prepared or completed tasks are not wake-enabled;
5. only the exact currently executable task may carry routing/wake labels;
6. prohibited paths and stop conditions are preserved;
7. human-authored content outside the generated block will remain untouched.

### 4. Use manual dispatch for an authorized apply

In GitHub Actions, open **PMO Project Task Materializer** and choose **Run workflow**.

Set:

- `manifest_path` to the exact canonical repository-relative path;
- `mode` to `apply`;
- `authorize_apply` to `true` only after the plan is reviewed and mutation is explicitly authorized.

The write job must remain isolated with static `issues: write` permission. Pull-request, push, fork, scheduled, and other automatic events must never enter apply mode.

### 5. Verify the apply report

After the run completes:

1. inspect the job summary and uploaded apply report;
2. verify each created/updated Issue by number;
3. verify the canonical marker and generated-block delimiters;
4. verify human-authored content remains intact;
5. verify current labels and wake state;
6. verify no duplicate Issue or marker was created;
7. record the run ID and summary counts on the source task/project Issue.

### 6. Prove repeated-state idempotency

Run the same manifest in dry-run mode again.

Expected result after a correct apply:

- `create=0`;
- `update=0`;
- `blocked=0`;
- `adoption-candidate=0`;
- all managed tasks report `no-change`.

A nonzero create/update count requires investigation. Do not repeatedly apply in an attempt to make the report disappear.

### 7. Continue component-branch execution

After Issue reconciliation:

1. execute only dependency-eligible tasks;
2. target child PRs to the manifest’s project branch;
3. permit non-production integration only after required checks and review state are clean;
4. activate only the exact eligible successor;
5. route final promotion to Bill/ChatGPT;
6. never enable automatic merge to `main`.

## Event behavior

### Pull request

The workflow selects only canonical manifest files changed by the PR. Script/workflow-only changes produce a successful no-op rather than falling back to an unrelated project manifest.

### Existing component-branch push

The workflow compares the before/head revisions and selects only changed canonical manifests.

### New component-branch creation

A zero `before` SHA is a deterministic successful skip. An inherited manifest must not be treated as changed merely because the branch was created.

### Manual dispatch

The operator supplies one explicit canonical path. Dry-run is read-only. Apply additionally requires the explicit authorization flag and the trusted repository context.

### Deleted manifest

Deletion fails closed and requires deliberate project closeout/migration handling.

## Disable and rollback

### Disable mutation immediately

The materializer has no automatic write path. To stop mutation:

1. do not dispatch `mode=apply`;
2. cancel any queued/running apply job if safe;
3. if necessary, disable the workflow in GitHub Actions;
4. post a blocker on the source project/task Issue;
5. preserve all reports, generated blocks, comments, and run IDs.

Automatic PR/push validation may remain enabled because it is read-only.

### Roll back a manifest change

1. open a bounded PR reverting the manifest to the last accepted component-branch revision;
2. run validator and dry-run materializer;
3. review the exact reverse Issue changes;
4. apply only with explicit authorization;
5. repeat dry-run and require no-change;
6. record rollback evidence on the project Issue.

### Recover from a partial apply

1. stop further apply dispatches;
2. download the apply report and identify the last successful action;
3. compare each managed Issue against the accepted manifest and marker;
4. repair only deterministic generated-block/title/label state;
5. preserve human-authored content;
6. re-run dry-run until the plan is fully understood;
7. apply once with explicit authorization;
8. prove repeated no-change state.

### Restore manual operation

If the workflow must remain disabled, operators may continue using GitHub Issues manually under the same manifest, task-DAG, routing-label, component-branch, and human-production-approval rules. Do not delete evidence or create a second authority ledger.

## Production boundary

The materializer manages task Issues. It does not authorize production deployment or promotion. A final PR from the project branch to `main` requires an independent current-diff review, required checks, rollback readiness, and Bill/ChatGPT approval. Automatic merge to `main` remains prohibited.