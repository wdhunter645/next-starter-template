---
Doc Type: How-To
Audience: Bill, Claude Code, Cursor, Day-2 Operations, LGFC maintainers
Authority Level: Operational Authority
Owns: Operator procedure for reading, writing, summarizing, and rolling back cumulative lane evidence v1
Does Not Own: Schema authority, Production promotion, or controller mutation switches
Canonical Reference: /docs/reference/operations/cumulative-lane-evidence-contract.md
Related Issues: #2678, #2885
Last Reviewed: 2026-08-01
---

# Operate cumulative lane evidence

## Purpose

Run day-to-day operations against the cumulative lane evidence model without blocking safe in-lane work and without promoting to Production.

## Preconditions

- Component branch `component/cumulative-lane-evidence` contains work units #2882–#2884 (and this qualification package).
- Schema and contract docs are current:
  - `docs/reference/operations/cumulative-lane-evidence-contract.md`
  - `docs/reference/operations/cumulative-lane-evidence-migration.md`
  - `docs/reference/operations/cumulative-lane-evidence-ownership.md`

## Steps

### 1. Validate a single event payload

```bash
node scripts/cumulative-lane-evidence/validate-event.mjs path/to/event.json
```

### 2. Run Promotion Candidate pilot scenarios

```bash
node scripts/cumulative-lane-evidence/pilot-scenarios.mjs
npx vitest run tests/cumulative-lane-evidence
```

Expect all pilot scenarios and the focused test suite to pass.

### 3. Interpret lane exit vs in-lane work

- Missing or invalid exit evidence **blocks lane exit only**.
- Administrative residue (duplicate suppression, legacy checklist lag, dashboard notes) **must not** halt safe Development coding/testing.
- Non-empty `protectedStops` on an exit/closeout event fail-closed.

### 4. Rollback (component scope)

1. Stop calling writer/adapters from controllers if enabled later.
2. Revert the component-branch PR(s) for this project if needed.
3. Do **not** delete Issue event comments or legacy closeout history.
4. Production / `main` remains untouched unless a separate Production Go authorizes promotion.

## Stop conditions

Stop and escalate when a protected-stop flag is active, authority conflicts, or a proposed action would mutate `main` / Production without Go.
