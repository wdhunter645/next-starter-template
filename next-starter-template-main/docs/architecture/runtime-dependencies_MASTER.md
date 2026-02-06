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
