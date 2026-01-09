# LGFC-Lite v1 Baseline (Lock Point)

When Steps 1–5 are green and deployed, tag the repository:

- Tag name: `lgfc-lite-v1.0-baseline`
- Purpose: a clean rollback point before adding new features.

Baseline expectations:
- B2 S3 smoke test passes in CI (Step 1)
- Inventory script produces JSON + CSV (Step 2)
- Enrichment script produces enriched inventory (Step 3)
- Site surfaces real Gehrig content and the Photo Archive reads from inventory (Step 4)
- No ZIP artifacts are committed to the repo (hygiene rule)

Operational rule:
- After baseline tag: additive PRs only. No more recovery ZIP cycles.
