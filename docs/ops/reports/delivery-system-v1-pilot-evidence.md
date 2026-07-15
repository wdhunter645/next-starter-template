---
Doc Type: Report
Audience: Human + AI
Authority Level: Evidence
Owns: Delivery System v1 Task 11 (#2501) Pilot and rollback exercise evidence
Does Not Own: Promotion authorization, production merge, or Program #2477 closeout
Canonical Reference: /docs/ops/implementation-plans/two-model-delivery-system/implementation-plan.md
Related Issues: #2501, #2477, #2511
Last Reviewed: 2026-07-15
---

# Delivery System v1 Pilot Evidence

## Status

- Source issue: #2501
- Working branch: `cursor/2501-integrated-pilot`
- Target: `component/delivery-system-v1`
- Base component SHA at Pilot start: `8bf68e7de29c780feeecd398e5496817b2ee000d`
- Pilot acceptance command: `node scripts/ci/delivery_system_acceptance.mjs`
- Acceptance result: **PASS (12/12)**

## Scenario matrix

| ID | Scenario | Result |
| --- | --- | --- |
| 1 | Small Model A documentation change | PASS |
| 2 | Small Model A code change | PASS |
| 3 | Eligible Model B child auto-integrates | PASS |
| 4 | Failed Model B child does not integrate | PASS |
| 5 | Protected Model B child pauses for Chat review | PASS |
| 6 | Component red state blocks successor | PASS |
| 7 | Model B promotion requires complete child, evidence, and rollback package | PASS |
| 8 | Emergency recovery bypasses normal migration blocking but creates follow-up | PASS |
| 9 | Header-only legacy edit fails the migration ratchet | PASS |
| 10 | Preflight and CI produce identical classification | PASS |
| 11 | Model A one-step rollback simulation succeeds | PASS |
| 12 | Model B ordered rollback simulation succeeds | PASS |

Fixture authority: `tests/fixtures/delivery-system/**`

## PR #2511 originating-file defect corrections (in Pilot scope)

| Finding | File | Correction |
| --- | --- | --- |
| Paginated reviews/labels JSON invalid | `.github/workflows/component-child-integration.yml` | `jq -s 'add // []'` after `--paginate` |
| Paginated check-runs JSON invalid | `.github/workflows/component-child-integration.yml` | slurp + flatten `check_runs` |
| Auto-merge fails when disabled | `.github/workflows/component-child-integration.yml` | guard on `allow_auto_merge` + `continue-on-error` |
| Missing `GH_TOKEN` for ratchet body fetch | `.github/workflows/diataxis-folder-authority.yml` | set `GH_TOKEN: ${{ github.token }}` |
| Admin-token mutating handlers skipped in inventory | `tests/preview-isolation-inventory.test.ts` | stop exempting `requireAdmin(` handlers from inventory completeness |
| As-built said workflow pending | `docs/reference/github/delivery-system-repository-configuration.md` | mark workflow present; note auto-merge still false |
| Duplicate `### Model A` heading | `docs/reference/ci/delivery-profile-contract.md` | rename second heading to component-metadata constraints |

## Real component-child exercise

This Pilot opens one Model B child PR targeting `component/delivery-system-v1`.

Evidence expectations on that child PR:

1. Delivery metadata classifies as `B-child` / `component-child`.
2. Because the Pilot corrects workflow and `scripts/ci/**` files, the child is a **protected** change and must require Chat review (scenario 5 live proof).
3. Deterministic eligible auto-integration remains proven by scenario 3 fixtures; repository `allow_auto_merge` remains `false`, so eligible children currently receive a green eligibility check and Chat/manual integration, matching as-built configuration.

Live PR number, head SHA, and Component Integration Eligibility check conclusion are filled in the ChatGPT handoff comment after the child PR opens.

## Rollback simulations

### Model A one-step

Recorded and exercised in scenario 11:

```text
rollback_target_type: revert-commit
rollback_target_ref: 8bf68e7de29c780feeecd398e5496817b2ee000d
smoke_tests: 1 homepage; 2 health endpoint; 3 required GitHub checks
verification_owner: Chat
```

### Model B multi-step

Recorded and exercised in scenario 12 with ordered dependency steps covering disablement, external write stops, config restoration, deployment restoration, verification, and reconciliation. Package finalized before promotion: `yes`.

## Full repository validation

| Command | Result |
| --- | --- |
| `node scripts/ci/delivery_system_acceptance.mjs` | PASS 12/12 |
| `npm test -- tests/component-integration-eligibility.test.mjs tests/delivery-profile.test.mjs tests/diataxis-migration-ratchet.test.mjs tests/preview-isolation-inventory.test.ts tests/pr-class-quality-plan.test.mjs` | PASS 80/80 |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (existing `<img>` warnings only; no new errors) |
| `npm test` | PASS 835/835 |
| `npm run build` | PASS |

## Stop / non-claims

- Promotion PR #2511 is **not** merged by this Pilot.
- Issue #2502 remains blocked until Chat accepts this Pilot.
- Production promotion and Program #2477 closeout remain out of scope for #2501.
