---
Doc Type: How-To
Audience: Human + AI
Authority Level: Operational Authority
Owns: Test plan for correctness, determinism, and fail-closed behavior
Does Not Own: UI design; backend implementation details outside verification
Canonical Reference: /docs/reference/design/als-fundraiser-2026-campaign-spotlight.md
Last Reviewed: 2026-02-26T13:14:02Z
---

# Test Plan: ALS Fundraiser Campaign Spotlight (Temporary Home Section)

## A. Deterministic Winner Logic
Using a fixed fixture set (Supporters/Funds):
- Verify Points = Funds × Supporters
- Verify Grand Prize selected by Points
- Verify Grand Prize winner is excluded from remaining categories
- Verify next winners selected correctly

## B. Tie Handling
Construct a fixture where:
- Points tie
- Supporters tie
- Funds tie
Expected:
- System flags “manual tie resolution required”
- Operator can resolve via dashboard timestamp
- Final published snapshot reflects resolved winner

## C. Fail‑Closed
- If snapshot fetch fails: spotlight renders nothing (or info-only if configured)
- If outbound links missing: spotlight must not render CTAs that would 404

## D. Embed Health
- Live feed iframe loads without console errors
- iframe has a title
- page remains usable if iframe fails (no layout collapse)

## E. Regression (Home)
- Weekly Photo Matchup still renders and functions
- Join CTA still renders
- No nav/routing changes introduced
