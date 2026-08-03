---
Doc Type: How-To
Audience: Bill, ChatGPT, Cursor, Day-2 Operations, LGFC maintainers
Authority Level: Operational Authority
Owns: Operator procedure for running #2778 platform production validation checks and qualification
Does Not Own: Production promotion, credential rotation, or secret disclosure
Canonical Reference: /docs/governance/PLATFORM-AND-ENVIRONMENT.md
Related Issues: #2778, #2893, #2892, #2891, #2890
Last Reviewed: 2026-08-03
---

# Run platform production validation

## Purpose

Execute the repeatable, read-only platform validation matrix for project #2778 and
interpret Promotion Candidate qualification without mutating Production.

## Preconditions

- Component branch `component/platform-production-validation` contains #2890–#2893 deliverables.
- Ownership map is current: `docs/reference/operations/platform-production-validation-ownership.md`.
- No Production Go is implied by running these commands.

## Steps

### 1. Inventory evidence (read)

Open:

- `docs/ops/reports/platform-production-validation-repository-live-inventory.md`
- `docs/ops/reports/platform-production-validation-cf-d1-checks.md`
- `docs/ops/reports/platform-production-validation-b2-runtime-checks.md`
- `docs/ops/reports/platform-production-validation-candidate-qualification.md`

### 2. Run child validators (read-only)

```bash
npm run validate:platform-cf-d1
npm run validate:platform-b2-runtime
```

Optional JSON:

```bash
npm run validate:platform-cf-d1 -- --json
npm run validate:platform-b2-runtime -- --json
```

Without Cloudflare/B2 credentials, live steps remain **fail-closed** and must not
expose secret values.

### 3. Run Promotion Candidate qualification

```bash
npm run validate:platform-candidate
npx vitest run tests/platform-candidate-qualification.test.mjs
```

Expect `recommendation=PROMOTION_CANDIDATE_READY_FOR_INDEPENDENT_REVIEW` and
`productionPromotion=not_authorized` on a clean worktree.

### 4. Prove tooling disable

```bash
LGFC_PLATFORM_VALIDATION_DISABLED=1 npm run validate:platform-candidate -- --json
```

Expect `"disabled": true`, `"ok": true`, and no child validator execution.

### 5. Credentialed operator follow-ups (optional, protected)

Only with separate Product Authority / credential authorization:

1. Re-run CF/D1 with Cloudflare API token to clear live D1 schema read.
2. Re-run B2 runtime with B2 secrets + `aws` CLI to clear live list read.
3. Record redacted results on the source Issue — never paste secret values.

## Rollback (component scope)

1. Disable tooling with `LGFC_PLATFORM_VALIDATION_DISABLED=1` or stop invoking the npm scripts.
2. Revert the component-branch PR(s) for #2778 children if needed.
3. Preserve Issue/PR evidence history.
4. Do not mutate Production / `main` without a separate Production Go.

## Stop conditions

Stop and escalate for authority conflict, secret exposure risk, ambiguous environment
identity, destructive test requirements, paid-tier changes, or any proposed Production mutation.
