---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Task brief for T19 footer reopen / verification
Does Not Own: Final design authority (see canonical reference)
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-25
---

# T19 — Footer invariants reopen

## Problem

Footer previously included mailto/Gmail behavior and layout drift relative to production footer spec.

## Required fix

- Remove mailto/email support link from the footer.
- Footer right column (two rows): row 1 — Privacy, Terms; row 2 — Contact linking to `/contact` only.
- Do not add Admin or other links in the public footer; admin/support contact belongs on the `/contact` page body as needed.

## Constraints

- No other layout changes beyond the footer link set above.
- No additional footer links.
- No styling changes outside scope.

## Exit criteria

Footer matches the production footer rules documented in governance and design references (Privacy, Terms, Contact `/contact`; no mailto; no footer Admin).
