---
Doc Type: Governance
Audience: Human + AI
Authority Level: Canonical
Owns: Pull request process policy, PR body authority, PR-process CI promotion rules, reviewer lifecycle policy, and post-merge closeout ownership policy
Does Not Own: Website product requirements, page design specifications, administrative mutation taxonomy, historical PR evidence, or repository portfolio asset tracking
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Supporting References:
  - /docs/reference/ci/pr-process-current-state.md
  - /docs/reference/ci/codex-pr-review-disablement.md
  - /docs/reference/ci/pr-process-skeleton-validation.md
  - /docs/reference/ci/pr-process-rebuild-retired-assets.md
  - /docs/explanation/ci/lgfc-reviewer-lifecycle-redesign.md
  - /docs/reference/ci/merge-protection-surface.md
  - /docs/reference/ci/pr-workflow-ci-inventory.md
  - /docs/reference/operations/administrative-control-lane-contract.md
Related issues: #2175, #2208, #2217, #2641
Last Reviewed: 2026-07-19
---

# Pull Request Process

This document is the canonical LGFC pull request process policy.

All older PR-process guidance is superseded by this document unless it is explicitly listed above as a supporting reference. Historical PR body snapshots, legacy workflow records, and archived implementation notes are evidence only and are not process authority.

## Authority order

1. This file: canonical policy for pull requests.
2. Supporting reference docs: controlled details that must not contradict this file.
3. Active implementation assets: templates, workflows, and scripts that implement this policy.
4. Historical evidence: archived PR bodies, old workflow notes, and retained fixtures with no current authority.

## Core rules

1. GitHub Issues are executable work truth.
2. Pull requests describe how issue-scoped work was performed.
3. CI defines how work must be validated.
4. The PR body stores stable facts only.
5. The PR body must not store lifecycle state.
6. Reviewer lifecycle state comes from GitHub-native reviews and review threads.
7. PR lifecycle and administrative state come from GitHub-native PR state, Issues, labels, checks, reviews, comments, and closeout records.
8. PR-process checks must be deterministic before becoming required.
9. Advisory checks must prove low-noise behavior before promotion.
10. Post-merge closeout must be single-owner and idempotent.
11. Administrative reconciliation must follow existing authority and must not create a second lifecycle database or a redundant merge gate.
12. Codex must not be configured as an automatic PR reviewer.

## Required stable PR body facts

Every PR should use `.github/pull_request_template.md` and include:

- source issue;
- intent label;
- PR class;
- delivery-profile facts when applicable;
- allowed paths;
- out-of-scope declaration;
- change summary;
- verification summary from commands already run at PR-open or update time;
- acceptance criteria;
- follow-up issue declaration;
- reviewer/bot review attestation.

Stable facts may be corrected when the final diff changes. Dynamic state must remain outside the PR body.

## Prohibited PR body authority

The PR body must not be used as a lifecycle database. Do not require or generate:

- review-comment IDs as process authority;
- review-thread state ledgers;
- `READY FOR REVIEW` or `READY FOR MERGE` state fields;
- live CI status ledgers;
- approval-state ledgers;
- queue or successor lifecycle ledgers;
- administrative exception-state ledgers;
- post-merge closeout state ledgers;
- dynamic PR-body auto-repair lifecycle blocks.

External tools may append advisory summaries. Those summaries do not become LGFC process authority.

## GitHub-native lifecycle and administrative state

Dynamic state belongs in the surface that owns it:

| State | Authoritative surface |
| --- | --- |
| Draft / ready-for-review / merged / closed | GitHub PR state |
| Validation | GitHub checks and workflow runs |
| Human review and unresolved findings | GitHub reviews and review threads |
| Source-Issue lifecycle and routing | GitHub Issue state, labels, assignments, and canonical comments |
| Approval and merge decision | GitHub review/merge record and recorded human authority |
| Queue and successor state | Source Issue, successor Issue, project/program Issue, and canonical queue records |
| Post-merge closeout | Single-owner closeout workflow and durable closeout records |
| Administrative exceptions and final clarifications | Source Issue, bounded exception Issue, and administrative-control records |

The administrative control lane may reconcile these surfaces to existing authority. It may not copy all dynamic state into the PR body or convert reporting lag into a merge gate.

## PR classes

PR class controls expected verification depth. Missing or invalid class should route to the safest applicable profile until final class-aware CI is rebuilt.

Current classes include:

- `code`
- `docs-governance`
- `docs-content`
- `ci`
- `config`
- `ops`
- `mixed-approved`

## CI policy

CI must use one owner per concern. Required checks must be deterministic, necessary, and low-noise.

A gate should remain required only when it protects a material invariant that cannot be enforced more simply at an earlier transition. Reporting, dashboard synchronization, optional comments, or cosmetic administrative metadata must not become required PR gates.

During #2175 / #2208 rebuild, PR-process gates may remain marker-only, advisory, or manual-only. A paused gate may be promoted only after:

1. advisory behavior is implemented;
2. at least one clean PR validates it;
3. the required-check / branch-protection surface is updated;
4. the current-state docs are updated.

## Reviewer lifecycle policy

Reviewer lifecycle must be read from GitHub-native review and thread state.

The final design should distinguish:

- human reviews;
- human unresolved threads;
- stale or outdated review comments;
- trusted bot findings;
- advisory bot comments;
- external tool summaries.

Human blocking findings may become enforcement inputs only when the related gate is intentionally promoted. Bot findings remain advisory unless explicitly promoted by governance decision.

The administrative control lane may reflect reviewer state in Issue routing or reporting, but it cannot supply the independent review or approval itself.

## Post-merge closeout policy

Post-merge closeout must be single-owner and idempotent.

Successful post-merge closeout CI is the primary merge-triggered administrative actor where that workflow is configured for the PR base. It should:

- validate the merged PR;
- reconcile the source issue;
- reconcile terminal labels;
- update actively governed parent/project/program reporting;
- disposition the declared successor or halt reason;
- record closeout evidence;
- create or update one bounded exception issue only when required;
- avoid self-healing cascades, duplicate closeout transactions, and repeated mutation loops.

### Current implementation boundary

The current `.github/workflows/post-merge-closeout.yml` trigger runs only for merged PRs whose base is `main`.

Until equivalent deterministic coverage is implemented for component branches and other authorized non-`main` integration paths:

- the administrative control lane must perform or verify the equivalent atomic closeout for Model B child integrations;
- the source Issue must not be treated as complete merely because the child PR merged;
- terminal labels, parent/project reporting, successor disposition, and exceptions must still be reconciled;
- the manual or scheduled administrative path must remain idempotent and must not duplicate a later CI transaction;
- this implementation gap must not serialize independent approved lanes.

The broader administrative control lane also owns final clarifications, failed or partial closeout housekeeping, non-merge dispositions, and later-detected administrative drift. It must not duplicate a successful closeout transaction or change project objectives through housekeeping.

## Minimal-gate rule

The PR process should block only for necessary execution, authority, validation, independent-review, approval, protected-boundary, and predictable-closeout invariants.

The following are not independent merge gates unless a canonical policy explicitly promotes them:

- dashboard freshness;
- optional PMO reporting comments;
- cosmetic label ordering;
- duplicate lifecycle fields in the PR body;
- administrative summaries already derivable from GitHub-native state;
- watcher or dispatcher session presence.

A predictable clerical defect should be corrected at the earliest deterministic surface. A material ambiguity or objective-changing decision must stop for the owning authority.

## Codex PR review policy

Codex must not run as a standing automatic PR reviewer.

Codex may be used for deliberate assigned implementation or research work, but automatic PR review is disabled because it consumes usage and can interfere with operator rate limits. Do not uninstall GitHub connector access unless explicitly authorized.

## DIATAXIS placement

This document is governance policy. Supporting materials are placed by DIATAXIS function:

- `docs/reference/ci/*` for inventories, current-state surfaces, branch-protection surfaces, and validation records.
- `docs/reference/operations/*` for stable administrative-control contracts.
- `docs/explanation/ci/*` for design rationale and conceptual lifecycle models.
- `docs/how-to/ci/*` for operator procedures.
- historical evidence must be under clearly non-authoritative archive/evidence paths or marked as historical fixtures.

No active PR-process authority should live in legacy folders or unclassified historical paths.

## Current rebuild status

The PR-process transition is not fully complete. The current operational state is maintained in `/docs/reference/ci/pr-process-current-state.md` until #2175 and #2208 are closed.

## Superseded content

The older website-specific PR prompt, old `lgfc-validate` enforcement policy, legacy mandatory PR-body lifecycle sections, generated closeout ledgers, and old file-touch allowlist model are superseded. Website implementation rules belong in website design, as-built, reference, or how-to docs, not in this PR-process governance document.
