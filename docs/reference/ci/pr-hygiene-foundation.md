---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: PR Hygiene Foundation behavior, advisory correction surfaces, deterministic PR metadata remediation model
Does Not Own: Merge protection consolidation, reviewer lifecycle redesign, workflow branch protection settings, or runtime behavior
Canonical Reference: /docs/explanation/ci/lgfc-ci-production-design.md
Related Issues: #1131, #1075, #1058
Last Reviewed: 2026-06-02
---

# PR Hygiene Foundation

## Purpose

The PR Hygiene Foundation improves branch quality before merge-protection
consolidation. It identifies deterministic PR defects early and provides
corrective guidance without adding brittle blockers.

## Scope

This foundation covers:

- source issue line normalization guidance
- ZIP safety statement detection
- required PR template section detection
- file allowlist coverage detection
- intent-label normalization when one intent is clear
- mixed-intent advisory comments when one intent is not clear
- documentation header remediation comments
- documentation path bucket remediation comments
- DIATAXIS folder intent remediation comments

It does not consolidate merge protection, redesign reviewer lifecycle gates,
change production website behavior, or alter Cloudflare runtime behavior.

## Current Known Truth

The repository CI design separates PR Hygiene from Merge Protection. PR Hygiene
is corrective first and advisory when the correct automated fix is uncertain.

The current foundation uses:

- `.github/workflows/gate-intent-labeler.yml`
- `.github/workflows/docs-guardrails.yml`
- `.github/workflows/diataxis-folder-authority-check.yml`
- `scripts/ci/pr_hygiene_audit.mjs`
- `scripts/ci/diataxis_folder_audit.mjs`

## Intended Final State

PR Hygiene should make common deterministic defects easy to correct before they
become noisy gate failures. It should not hide defects; it should report them in
stable, source-linked PR comments and leave hard merge-safety decisions to the
Merge Protection domain.

## Post-Merge Closeout

Issue #1131 is the completed PR Hygiene Foundation implementation issue. PR
#1189 merged on 2026-06-02 and established the foundation described in this
reference.

After merge, the repository state must not leave issue #1131 represented as an
active CI implementation task. The correct closeout state is:

- issue #1131 retains CI ownership and post-merge verification traceability
- stale active execution state is removed
- Task 002 remains the next CI implementation task after this cleanup closes
- no merge-protection, reviewer lifecycle, runtime, or website behavior changes
  are included in the closeout

## Advisory Surfaces

| Surface | Corrective behavior | Blocking behavior |
|---|---|---|
| Intent labeler | Applies the matching intent label when one intent is clear | Mixed intent posts advisory instead of failing |
| PR hygiene audit | Reports issue-line, ZIP statement, template, and allowlist defects | Advisory during foundation rollout |
| Docs headers | Posts file-specific remediation comments with canonical template | Advisory on PRs during foundation rollout |
| Docs paths | Posts path bucket remediation comments | Advisory on PRs during foundation rollout |
| DIATAXIS folder intent | Posts folder-intent remediation comments | Advisory during foundation rollout |
| Canonical drift | Verifies canonical documentation hashes | Remains deterministic check |

## Acceptance Criteria

This foundation is acceptable when:

- clear intent labels are normalized automatically
- mixed intent receives an actionable advisory comment
- PR metadata defects receive an actionable advisory comment
- documentation header and path defects receive remediation guidance
- DIATAXIS folder mismatches receive correction guidance
- behavior is covered by targeted tests
- no runtime, website, Cloudflare, package, or reviewer lifecycle changes are introduced
