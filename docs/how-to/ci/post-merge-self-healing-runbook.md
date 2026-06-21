---
Doc Type: How-To
Audience: Human + AI
Authority Level: Operational
Owns: Operator procedure for OPS — Post-Merge Self-Healing workflow dispatch, artifact review, and Cursor escalation handling
Does Not Own: Classifier contract, detector implementation, auto-fix execution code, escalation script implementation, merge approval
Canonical Reference: /docs/reference/ci/post-merge-self-healing-classification-contract.md
Related issues: #1847, #1853
Last Reviewed: 2026-06-21
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

## Activation model (Phase 2)

| Mode | Behavior |
|---|---|
| **A — Automatic visible escalation** | Scheduled, `workflow_run`, and `main` push triggers collect live evidence, detect findings, write an operator summary, and **open/update deduped escalation issues for `cursor_remediation_required` only**. |
| **B — Manual live fixes** | Manifest pruning and operator-authorization escalations require explicit `workflow_dispatch` with `dry_run=false` and the appropriate flags. |

`operator_authorization_required` findings are **never** opened automatically. They appear in the GitHub Actions summary and artifacts only until Bill/Atlas authorizes a full live escalation run.

## What the workflow does

The workflow orchestrates five repository steps in order:

1. **Collect evidence** — `scripts/ci/post_merge_self_heal_collect_evidence.mjs`
2. **Detect** — `scripts/ci/post_merge_self_heal_detect.mjs`
3. **Apply** — `scripts/ci/post_merge_self_heal_apply.mjs`
4. **Escalate** — `scripts/ci/post_merge_self_heal_escalate.mjs`
5. **Summarize** — `scripts/ci/post_merge_self_heal_operator_summary.mjs`

### Evidence sources (live runs)

The collector ingests:

- closeout manifests checked out from `main` (`targets-ci-pending-rerun.json`, `targets-ci-pending.json`, `targets-remediation-backlog.json`);
- recent `Post-Merge PR Body Closeout` workflow artifacts when available (`post-merge-batch-closeout.json`, `post-merge-result.json`);
- the triggering `workflow_run` artifact when this workflow is invoked by closeout/readiness completion;
- open post-merge exception/remediation issues (title/label search);
- existing open self-healing escalation issues (for dedupe).

Detection uses this evidence to identify pending manifest replays, stale manifest entries, failed closeout results, duplicate remediation issues, and other classified failures.

## What the workflow never does

The workflow and its scripts must not:

- bypass PR governance or mark a PR ready for merge;
- merge PRs or push directly to `main` except for explicitly authorized manifest hygiene when `dry_run=false` and `apply_safe_fixes=true`;
- edit runtime application code;
- fabricate reviewer dispositions or PR-body reviewer accounting;
- close, reopen, relabel, or advance **source task issues** without explicit repository authority;
- automatically open issues for `operator_authorization_required` findings;
- mutate secrets, production configuration, or active program-lane queue state;
- open duplicate escalation storms when deduplication keys match an existing open issue.

Cursor may continue remediation only inside the authorized source issue and PR
file-touch allowlist recorded in a generated escalation issue.

## Procedure

### Automatic runs (schedule / post-closeout / main push)

Automatic invocations use:

- `dry_run=true` for safe auto-fix planning (no manifest writes);
- `apply_safe_fixes=false`;
- `open_visible_escalations=true` (opens/updates deduped issues for `cursor_remediation_required`).

Operators should review:

1. GitHub Actions **job summary** (markdown table of findings and escalation actions);
2. Artifact `post-merge-self-healing-report`, especially:
   - `post-merge-self-heal-operator-summary.md`
   - `post-merge-self-heal-evidence.json`
   - `post-merge-self-heal-detection.json`
   - `post-merge-self-heal-escalation.json`

### Manual dispatch (live repairs or full escalation)

1. Open GitHub Actions → `OPS — Post-Merge Self-Healing`.
2. Choose **Run workflow**.
3. Leave `dry_run=true` for inspection-only runs.
4. Set `open_visible_escalations=true` to refresh cursor remediation issues without manifest writes.
5. For live manifest pruning:
   - `dry_run=false`
   - `apply_safe_fixes=true`
   - `open_escalation_issues=false` (unless escalation is also authorized)
6. For full live escalation including operator-authorization findings (Bill/Atlas required):
   - `dry_run=false`
   - `open_escalation_issues=true`

### Interpret artifacts

| Artifact file | Meaning |
|---|---|
| `post-merge-self-heal-evidence.json` | Live evidence bundle (manifests, reports, issue counts, workflow context) |
| `post-merge-self-heal-detection.json` | Classified findings and summary counts |
| `post-merge-self-heal-apply.json` | Planned or applied safe auto-fix actions |
| `post-merge-self-heal-escalation.json` | Planned or executed escalation issue actions |
| `post-merge-self-heal-operator-summary.md` | Operator-facing markdown digest |

Review detection status first:

- `success` with only `no_action` findings → clean state; no mutation expected.
- `findings` → inspect each finding classification before enabling apply/escalate.
- `partial_failure` → evidence ingestion failed partially; inspect `post-merge-self-heal-evidence.json` errors before retrying.

### Enable safe auto-fixes (manual only)

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

### Escalation issues

**Automatic:** `cursor_remediation_required` findings on scheduled/post-closeout runs.

**Manual full escalation:** dispatch with `dry_run=false` and `open_escalation_issues=true` when Bill/Atlas has authorized operator-level findings as well.

Escalation issues include:

- parent self-healing run context;
- failing PR and source issue numbers when known;
- failure class and evidence excerpt;
- Cursor constraints and acceptance criteria;
- whether Bill/Atlas authorization is required.

If an open issue already matches PR + source issue + failure class, the
escalation script updates the issue body instead of opening a duplicate.

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

Dry-run for **apply** means:

- no manifest files are written;
- safe auto-fix actions are planned only;
- artifacts and the operator summary still list what would change.

Dry-run does **not** suppress automatic visible escalation when `open_visible_escalations=true`.

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

These findings are surfaced in summaries/artifacts automatically but issue creation remains manual.

## Related references

- Classification contract: `docs/reference/ci/post-merge-self-healing-classification-contract.md`
- Post-merge validation surface: `docs/reference/ci/post-merge-validation-surface.md`
- Workflow file: `.github/workflows/ops-post-merge-self-healing.yml`

## Execution

Operators should expect automatic runs to produce visible summaries and cursor
escalation issues when manifests or closeout evidence show unresolved
`cursor_remediation_required` work. Use manual dispatch with `dry_run=false`
only after Bill/Atlas authorizes live manifest repair or operator-level
escalation.
