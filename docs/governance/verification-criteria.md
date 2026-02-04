# Verification Criteria

Verification is evidence-driven. “Looks good” is not a criterion.

## Day 1 Verification Must Prove

- Production builds and deploys are green
- Required PR gates pass (drift gate, label gate, ZIP history protection)
- Public routes render correctly
- Member gating behaves correctly
- Admin gating behaves correctly
- Snapshot workflow exists and is producing weekly artifacts (retention 6)

## Evidence Types

- CI check results (green)
- Deterministic scripts or commands with recorded output
- URL verification for critical pages
- Snapshot artifact metadata

## Pass/Fail Rule

If evidence is missing, the item is not verified.
