---
Doc Type: How-To
Audience: AI
Authority Level: Operational Authority
Owns: Cursor procedure for opening a task PR after review approval
Does Not Own: Merge authority, GitHub issue closeout, or PR-body policy (see `docs/governance/PR_PROCESS.md`)
Canonical Reference: /docs/governance/PR_PROCESS.md
Supporting References:
  - /docs/how-to/cursor/prepare-review-packet.md
  - /.github/pull_request_template.md
  - /docs/reference/ci/issue-pr-contract.md
Related Issues: #1449, #1351, #2615, #2618
Last Reviewed: 2026-07-29
---

# Open a Task PR

## Preconditions

- ChatGPT or Bill approved PR creation, or Bill/ChatGPT provided an explicit PR-opening
  instruction or approved PR template.
- Local diff matches the reviewed packet (when a packet was required).
- Changed files are inside the source issue allowlist.
- Validation results are ready for PR body disclosure.
- Cursor will not merge, close issues, or mutate issue state when opening the PR.

## Steps

1. Confirm the source issue number and file-touch allowlist match the local diff.
2. Prepare the PR body from `/.github/pull_request_template.md`.
3. Include all mandatory governance fields listed under **PR Body Requirements**.
4. Allow the intent labeler to apply the repo-canonical intent for the changed
   paths (for example `docs-only` when all files are under `docs/**`).
5. Open the PR unassigned when authorized; do not merge.
6. Report PR number, branch, head SHA, changed files, validation, and disclosures.

## PR Body Requirements

The PR body follows `.github/pull_request_template.md` and stores stable facts
only — see `docs/governance/PR_PROCESS.md` for the canonical policy. At minimum
it must include:

- **Source issue line** — exactly one, for example `- **Issue:** #NNNN`
- **Intent label and PR class** — `PR class` must be one of the values
  `scripts/ci/pr_hygiene_audit.mjs` defines as `VALID_PR_CLASSES`
- **Delivery/profile metadata** — size, delivery model, change mode, target
  environment, approval/gate/rollback profile, and component branch/master/
  promotion PR where applicable
- **Allowed paths** — exact paths expected in the diff, plus an out-of-scope
  declaration
- **Change summary** — what changed and why
- **Verification** — local verification commands/results and CI verification
  expectations
- **Acceptance criteria** — checklist mapped to the source issue, plus a
  follow-up-issue declaration
- **Rollback summary**
- **Reviewer / bot review attestation** — left unchecked at PR-open time;
  lifecycle-dependent state is never authored ahead of time (see
  `docs/reference/ci/issue-pr-contract.md`)

Do not add draft/review/merge/CI/approval/queue/hold/closeout state to the PR
body — that state lives on GitHub-native surfaces (checks, reviews, review
threads, labels) per `docs/governance/PR_PROCESS.md`.

Keep exactly one primary source issue in the PR body before merge. A wrong primary
issue number is still a pre-merge defect to correct when noticed; post-merge
closeout may deterministically repair that clerical mismatch only when exactly one
issue clearly owns the delivered scope.

When the source Issue publishes a marked Issue-side PR contract per
`docs/reference/ci/issue-pr-contract.md`, prefer sourcing these stable facts from
that contract instead of re-deriving them ad hoc.

## Validation

Before opening the PR, run the validation commands named in the source issue. When
repo-wide checks fail only on known pre-existing out-of-scope files, disclose that
in the PR body without fixing unrelated paths. After the PR opens, the advisory
`pr-hygiene` and `diff-scope` checks (see `docs/reference/ci/pr-process-current-state.md`
for which checks are currently required versus advisory) validate the body against
the actual diff; `gate-post-merge-readiness.yml` is manual-backfill-only and does
not block merge.

## Stop Conditions

Stop and report instead of opening a PR when:

- no primary source issue exists or more than one source issue is claimed;
- changed files fall outside the allowlist;
- mandatory governance fields cannot be completed honestly;
- validation fails on a touched file;
- issue closure or relabeling is required before merge;
- ChatGPT has not reviewed the packet and Bill/ChatGPT has not authorized direct PR
  creation.

## After Opening

Report:

```text
PR number:
Branch:
Head SHA:
Changed files:
Validation:
Known disclosures:
Intent label:
```
