---
Doc Type: Governance
Audience: Human + AI
Authority Level: Canonical
Owns: Pull request process policy, PR body authority, PR-process CI promotion rules, reviewer lifecycle policy, post-merge closeout policy
Does Not Own: Website product requirements, page design specifications, historical PR evidence, repository portfolio asset tracking
Canonical Reference: /docs/governance/standards/document-authority-hierarchy_MASTER.md
Supporting References:
  - /docs/reference/ci/pr-process-current-state.md
  - /docs/reference/ci/codex-pr-review-disablement.md
  - /docs/reference/ci/pr-process-skeleton-validation.md
  - /docs/reference/ci/pr-process-rebuild-retired-assets.md
  - /docs/explanation/ci/lgfc-reviewer-lifecycle-redesign.md
  - /docs/reference/ci/merge-protection-surface.md
  - /docs/reference/ci/pr-workflow-ci-inventory.md
Related issues: #2175, #2208, #2217
Last Reviewed: 2026-07-04
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
7. PR-process checks must be deterministic before becoming required.
8. Advisory checks must prove low-noise behavior before promotion.
9. Post-merge closeout must be single-owner and idempotent.
10. Codex must not be configured as an automatic PR reviewer.

## Required stable PR body facts

Every PR should use `.github/pull_request_template.md` and include:

- source issue;
- intent label;
- PR class;
- allowed paths;
- out-of-scope declaration;
- change summary;
- verification summary;
- acceptance criteria;
- follow-up issue declaration;
- reviewer/bot review attestation.

## Prohibited PR body authority

The PR body must not be used as a lifecycle database. Do not require or generate:

- review-comment IDs as process authority;
- review-thread state ledgers;
- `READY FOR MERGE` state fields;
- CI status ledgers;
- post-merge closeout state ledgers;
- dynamic PR-body auto-repair lifecycle blocks.

External tools may append advisory summaries. Those summaries do not become LGFC process authority.

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

CI must use one owner per concern. Required checks must be deterministic and low-noise.

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

## Post-merge closeout policy

Post-merge closeout must be single-owner and idempotent.

It should:

- validate the merged PR;
- reconcile the source issue;
- record closeout evidence;
- create an exception issue only when required;
- avoid self-healing cascades and repeated mutation loops.

## Codex PR review policy

Codex must not run as a standing automatic PR reviewer.

Codex may be used for deliberate assigned implementation or research work, but automatic PR review is disabled because it consumes usage and can interfere with operator rate limits. Do not uninstall GitHub connector access unless explicitly authorized.

## DIATAXIS placement

This document is governance policy. Supporting materials are placed by DIATAXIS function:

- `docs/reference/ci/*` for inventories, current-state surfaces, branch-protection surfaces, and validation records.
- `docs/explanation/ci/*` for design rationale and conceptual lifecycle models.
- `docs/how-to/ci/*` for operator procedures.
- historical evidence must be under clearly non-authoritative archive/evidence paths or marked as historical fixtures.

No active PR-process authority should live in legacy folders or unclassified historical paths.

## Current rebuild status

The PR-process transition is not fully complete. The current operational state is maintained in `/docs/reference/ci/pr-process-current-state.md` until #2175 and #2208 are closed.

## Superseded content

The older website-specific PR prompt, old `lgfc-validate` enforcement policy, legacy mandatory PR-body sections, and old file-touch allowlist model are superseded. Website implementation rules belong in website design, as-built, reference, or how-to docs, not in this PR-process governance document.
