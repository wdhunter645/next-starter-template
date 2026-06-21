---
Doc Type: How-To
Audience: Human + AI
Authority Level: Operational
Owns: Operator procedure for OPS — Post-Merge Self-Healing workflow dispatch, artifact review, and Cursor escalation handling
Does Not Own: Classifier contract, detector implementation, auto-fix execution code, escalation script implementation, merge approval
Canonical Reference: /docs/reference/ci/post-merge-self-healing-classification-contract.md
Related issues: #1847, #1853
Last Reviewed: 2026-06-20
---

# Post-Merge Self-Healing Operator Runbook

## Purpose

This runbook explains how operators and Cursor agents use the bounded
`OPS — Post-Merge Self-Healing` workflow to detect post-merge hygiene drift,
classify findings, plan or apply safe repo repairs, and escalate unsafe findings
to scoped remediation issues.

Self-healing CI is a post-merge hygiene and escalation layer. It does not replace
PR governance, reviewer-response accounting, source-issue accounting, or
Bill/Atlas merge authorization.

## What the workflow does

The workflow orchestrates three repository scripts in order:

1. **Detect** — `scripts/ci/post_merge_self_heal_detect.mjs`
2. **Apply** — `scripts/ci/post_merge_self_heal_apply.mjs`
3. **Escalate** — `scripts/ci/post_merge_self_heal_escalate.mjs`

Detection consumes closeout manifests, closeout reports, and optional issue
metadata fixtures. The classifier maps each finding to exactly one outcome:

- `safe_auto_fix`
- `cursor_remediation_required`
- `operator_authorization_required`
- `intentionally_deferred`
- `no_action`

## What the workflow never does

The workflow and its scripts must not:

- bypass PR governance or mark a PR ready for merge;
- merge PRs or push directly to `main` except for explicitly authorized manifest hygiene when `apply_safe_fixes=true`;
- edit runtime application code;
- fabricate reviewer dispositions or PR-body reviewer accounting;
- close, reopen, relabel, or advance issues without explicit repository authority;
- mutate secrets, production configuration, or active program-lane queue state;
- open duplicate escalation storms when deduplication keys match an existing open issue.

Cursor may continue remediation only inside the authorized source issue and PR
file-touch allowlist recorded in a generated escalation issue.

## Procedure

### Manual dispatch (recommended first step)

1. Open GitHub Actions → `OPS — Post-Merge Self-Healing`.
2. Choose **Run workflow**.
3. Leave `dry_run=true` unless Bill/Atlas has authorized live repairs.
4. Set `apply_safe_fixes=false` for inspection-only runs.
5. Set `open_escalation_issues=false` until safe-fix output has been reviewed.
6. Run the workflow and download the `post-merge-self-healing-report` artifact.

Default manual dispatch is dry-run. Scheduled and post-closeout triggers also
default to dry-run mode.

### Interpret artifacts

The workflow uploads three JSON files:

| Artifact file | Meaning |
|---|---|
| `post-merge-self-heal-detection.json` | Raw classified findings and summary counts |
| `post-merge-self-heal-apply.json` | Planned or applied safe auto-fix actions |
| `post-merge-self-heal-escalation.json` | Planned or executed escalation issue actions |

Review detection status first:

- `success` with only `no_action` findings → clean state; no mutation expected.
- `findings` → inspect each finding classification before enabling apply/escalate.
- `partial_failure` → report ingestion failed; fix missing report paths before retrying.

Apply artifact fields to inspect:

- `dry_run=true` → manifest changes are planned only.
- `planned` duplicate and stale-issue entries are always dry-run candidates.
- `applied` manifest prunes indicate repo files changed on the runner checkout only; commit via authorized PR if not auto-committed by workflow policy.

### Enable safe auto-fixes

Use live manifest repair only when:

- findings are classified `safe_auto_fix`;
- evidence is complete in the detection artifact;
- no operator-authorization finding is present for the same PR/source pair;
- Bill/Atlas has authorized bounded repo-hygiene repair.

Dispatch with:

- `dry_run=false`
- `apply_safe_fixes=true`
- `open_escalation_issues=false`

Re-run in dry-run mode afterward to confirm the stale manifest finding cleared.

### Enable escalation issues

Use escalation issue creation when:

- findings are classified `cursor_remediation_required` or
  `operator_authorization_required`;
- deduplication review shows no existing open canonical issue;
- the operator accepts potential issue creation load.

Dispatch with:

- `dry_run=false`
- `open_escalation_issues=true`

Escalation issues include:

- parent self-healing run context;
- failing PR and source issue numbers when known;
- failure class and evidence excerpt;
- Cursor constraints and acceptance criteria;
- whether Bill/Atlas authorization is required.

If an open issue already matches PR + source issue + failure class, the
escalation script updates the issue body and adds a comment instead of opening
a duplicate.

### Cursor response to generated issues

When Cursor receives a generated self-healing escalation issue:

1. Read the linked detection and escalation artifacts from the workflow run.
2. Confirm the source issue and file-touch allowlist before editing.
3. Implement only the bounded remediation described in the issue body.
4. Record verification commands and gate evidence in the remediation PR body.
5. Do not close the escalation issue until post-merge self-healing dry-run reports
   no remaining finding for the same dedupe key.

Operator-authorization findings require Bill/Atlas approval before Cursor
implements any issue or queue mutation.

## Dry-run mode

Dry-run is the default for:

- manual dispatch unless explicitly disabled;
- nightly schedule;
- post-closeout `workflow_run` triggers.

Dry-run guarantees:

- no manifest files are written;
- no GitHub issues are created or updated;
- artifacts still record the actions that would have been taken.

Use dry-run to validate clean repo state before enabling live repairs.

## Deduplication behavior

Escalation dedupe keys use:

- failing PR number;
- source issue number;
- failure class / finding code.

Duplicate remediation issue handling in the apply layer remains dry-run only.
Live duplicate closure continues to use the dedicated remediation hygiene scripts
when explicitly authorized elsewhere.

## Bill/Atlas authorization required

Stop and request operator authorization when classification is
`operator_authorization_required` or when findings involve:

- auth, secrets, or configuration failures;
- active alternate program lane decisions;
- source issue linkage or queue advancement;
- runtime app-code repair;
- ambiguous or conflicting repository evidence.

## Related references

- Classification contract: `docs/reference/ci/post-merge-self-healing-classification-contract.md`
- Post-merge validation surface: `docs/reference/ci/post-merge-validation-surface.md`
- Workflow file: `.github/workflows/ops-post-merge-self-healing.yml`

## Execution

Operators should keep manual dispatch in dry-run until a clean-state run produces
green no-op artifacts and any safe-fix plans have been reviewed. Only then enable
`apply_safe_fixes` and/or `open_escalation_issues` in separate authorized runs.
