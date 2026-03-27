---
Doc Type: Review
Audience: Human + AI
Authority Level: Advisory
Owns: Design-flow validation findings and documentation gaps
Does Not Own: Canonical requirements or implementation behavior
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-27
---

# Design Flow Review — Top-Down Validation (2026-03-27)

## Scope

This review validates whether documentation currently flows correctly from canonical design authority down to implementation-facing documents.

## Top-Down Flow Check

### 1) Governance and authority root

- `docs/reference/design/LGFC-Production-Design-and-Standards.md` remains the active canonical design authority.
- The document explicitly states that if any implementation conflicts with it, this document wins.

**Result:** PASS (top-level canonical authority is explicit and stable).

### 2) Route/auth invariants inherited by child specs

- Canonical design currently defines Day 1 auth as localStorage marker `lgfc_member_email` and `/fanclub` gating/redirect behavior.
- Child design docs (`join-login.md`, `auth-and-logout.md`) align to that localStorage model.

**Result:** PARTIAL PASS with one major contradiction (see Gaps #1).

### 3) Homepage/fanclub section order consistency

- Homepage section order in `home.md` aligns with canonical order.
- FanClub canonical order in `fanclub.md` places Archives Tiles at position #3.
- `docs/as-built/cloudflare-frontend.md` still documents Archives Tiles as position #5 while claiming exact spec order.

**Result:** FAIL for as-built consistency.

### 4) Architecture/data-layer references

- Architecture docs now point canonical references to the Production Design document.
- `cms-data-layer.md` still includes non-canonical seed keys and a stale legacy reference path in its references section.

**Result:** PARTIAL PASS with data-contract drift.

### 5) Status/version hygiene

- `dashboard.md` still has `STATUS: INCOMPLETE` and older version date `2025-11-16`.

**Result:** FAIL for metadata freshness.

## Gaps Identified (Actionable)

1. **Critical auth model contradiction**
   - `auth-model.md` defines cookie-backed server sessions and prohibits localStorage auth.
   - Canonical design and multiple active docs define localStorage Day 1 auth.
   - This breaks top-down flow because a child spec conflicts with root canonical behavior.

2. **As-built source references are stale**
   - `docs/as-built/cloudflare-frontend.md` still references deprecated paths (`/docs/fanclub.html`, `/docs/fanclub-v1.html`, `/docs/website-PR-governance.md`).

3. **FanClub section ordering mismatch in as-built snapshot**
   - As-built doc claims exact spec order but lists Archives Tiles after discussion feed instead of at slot #3.

4. **CMS seed keys include non-canonical route domains**
   - `cms-data-layer.md` still lists keys tied to non-canonical/legacy route domains (`charities`, `events`, `photos`, `memorabilia`).

5. **Legacy path in references remains**
   - `cms-data-layer.md` references `/docs/architecture/cms.md` instead of the active archived/reference path strategy.

6. **Dashboard doc metadata drift**
   - `dashboard.md` version/date/status markers are stale relative to current review cycle.

## Conclusion

Documentation is **mostly repaired** and generally flows top-down, but it is **not yet fully coherent** because one critical contradiction (`auth-model.md`) and several residual stale references/order mismatches remain. The current state should be treated as **conditionally acceptable** only after resolving the auth contradiction and stale as-built/architecture remnants listed above.

## Recommended Remediation Order

1. Resolve auth model conflict (`auth-model.md` vs Production Design and auth child specs).
2. Correct stale paths and order assertions in `docs/as-built/cloudflare-frontend.md`.
3. Normalize `cms-data-layer.md` seeded key examples/reference paths to canonical routes.
4. Update `dashboard.md` metadata to current review date/status.
