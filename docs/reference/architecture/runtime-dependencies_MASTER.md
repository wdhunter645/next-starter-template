---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Architecture Specification
Owns: System architecture, data flows, access model, runtime dependencies
Does Not Own: Operational runbooks; governance policies; UI/UX design specifics
Canonical Reference: /docs/explanation/ARCHITECTURE_OVERVIEW.md
Last Reviewed: 2026-02-20
---

# Runtime Dependency Map (MASTER)

## Purpose
Identify all external systems and impact of failure.

## Critical Dependencies
- Cloudflare Pages → site availability
- Cloudflare D1 → data availability
- GitHub → deploy pipeline
- CI workflows → validation and release safety

## Operator Guidance
During outages:
- Identify failing dependency
- Avoid unrelated changes
