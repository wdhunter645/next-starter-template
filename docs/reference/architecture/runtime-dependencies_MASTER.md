---
Doc Type: TBD
Audience: Human + AI
Authority Level: TBD
Owns: TBD
Does Not Own: TBD
Canonical Reference: TBD
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
