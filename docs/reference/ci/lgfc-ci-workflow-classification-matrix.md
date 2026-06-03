---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Current-to-future CI workflow mapping, consolidation targets, rebuild classifications
Does Not Own: Workflow implementation details
Canonical Reference: /docs/reference/ci/workflow-inventory.md
Related Issues: #1058
Last Reviewed: 2026-05-21
---

# LGFC Workflow Classification Matrix

## Purpose

This document maps the current workflow inventory to the final LGFC CI architecture.

It identifies:

- workflows that remain valid
- workflows that require redesign
- workflows that should become corrective instead of punitive
- workflows that should move post-merge
- workflows that should retire entirely
- workflows whose responsibilities should be assimilated into larger CI domains

## Classification Definitions

### Keep

Workflow remains operationally valid with minimal structural change.

### Rebuild

Workflow purpose remains valid but lifecycle placement, logic, or architecture must change.

### Assimilate

Workflow responsibilities should move into a consolidated workflow domain.

### Retire

Workflow should be removed once replacement coverage exists.

## Current Workflow Mapping

| Workflow | Current Role | Final Role | Classification | Notes |
|---|---|---|---|---|
| gate-quality.yml | Pre-merge blocker | Merge Protection | Keep | Core deterministic merge safety |
| gitleaks.yml | Secret scan | Merge Protection | Keep | Remains hard blocker |
| gate-zip-safety.yml | ZIP blocker | Merge Protection | Assimilated | Absorbed into `gate-quality.yml` during Task 002 |
| gate-drift.yml | Drift enforcement | Scope advisor + post-merge audit | Rebuild | Remove timing-sensitive merge blocking |
| gate-intent-labeler.yml | Intent labeling | PR Hygiene | Rebuild | Corrective/advisory instead of blocking |
| reviewer-response-completion.yml | Reviewer lifecycle enforcement | Reviewer audit | Rebuild | Remove brittle synchronous logic |
| design-compliance-warn.yml | Advisory PR warnings | PR Hygiene + post-merge audit | Rebuild | Convert to corrective guidance |
| docs-guardrails.yml | Docs governance | Merge Protection + PR Hygiene | Rebuild | Add deterministic auto-fix capability |
| diataxis-folder-authority-check.yml | Docs placement validation | PR Hygiene | Assimilate | Fold into docs correction system |
| diataxis-post-merge-validate.yml | Post-merge docs validation | Post-Merge Validation | Keep/Rebuild | Expand evidence reporting |
| ops-pr-issue-accounting.yml | Source issue enforcement | Merge Protection | Keep/Rebuild | Use tolerant parser model |
| ops-assess.yml | Site assessment | OPS Runtime | Keep | Current operational assessment base |
| production-audit.yml | Production invariants | OPS Runtime + Post-Merge Validation | Rebuild | Consolidate operational reporting |
| ops-design-compliance-audit.yml | Design audit | Post-Merge Validation | Keep/Rebuild | Expand implementation-verification role |
| post-merge-intent-verification.yml | Post-merge metadata validation | Post-Merge Validation | Rebuild | Current YAML instability must be fixed |
| post-merge-remediation.yml | Remediation workflow | Post-Merge Validation | Keep/Rebuild | Expand remediation issue generation |
| ops-cf-pages-retry.yml | Deployment retry | OPS Runtime | Keep | Strong operational utility |
| snapshot.yml | Snapshot/rollback evidence | OPS Runtime | Keep | Preserve rollback evidence |
| d1-migrations.yml | Migration execution | Merge Protection + OPS | Rebuild | Consolidate D1 execution logic |
| lgfc-d1-migrate.yml | Manual migration execution | OPS Runtime | Assimilate | Fold into unified D1 model |
| enforce-pr-only.yml | Main branch protection | Merge Protection | Assimilate | Merge with main-monitor logic |
| ops-main-change-monitor.yml | Main branch monitoring | OPS Runtime | Assimilate | Combine with branch-protection monitoring |
| assess-nightly.yml | Legacy assessment | OPS Runtime | Retire | Superseded by ops-assess |
| gate-reviewer-response.yml | Disabled reviewer gate | None | Retire | Superseded by redesign |
| post-recovery-425-verify.yml | Legacy PR-specific recovery | None | Retire | Stale historical workflow |
| ci.yml | Legacy parked workflow | None | Retire | Remove after cleanup |
| deploy.yml | Legacy parked workflow | None | Retire | Remove after cleanup |
| deploy-dev.yml | Legacy parked workflow | None | Retire | Remove after cleanup |
| deploy-prod.yml | Legacy parked workflow | None | Retire | Remove after cleanup |
| lgfc-validate.yml | Legacy parked workflow | None | Retire | Remove after cleanup |
| test.yml | Legacy parked workflow | None | Retire | Remove after cleanup |
| test-homepage.yml | Legacy parked workflow | None | Retire | Remove after cleanup |

## Final Architectural Direction

The repository retains enterprise-grade governance discipline while moving each workflow responsibility to the correct lifecycle domain.

The final design intentionally separates:

- deterministic merge safety
- corrective branch hygiene
- retrospective implementation validation
- production operational monitoring

This reduces false-positive failures, eliminates reviewer deadlocks, improves AI-agent usability, and preserves long-term operational integrity.
