---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Live operating procedures, incident response, monitoring, operator workflows
Does Not Own: Redefining design/architecture/platform specs; historical records
Canonical Reference: /docs/ops/OPERATING_MANUAL.md
Last Reviewed: 2026-02-20
---

# Deployment Model Specification (MASTER)

## Purpose
Define how code moves from repository to production and what triggers deployments.

## Deployment Flow
1) Branch created
2) PR opened
3) CI runs checks
4) PR merged to main
5) Cloudflare deploys automatically

## Automatic Deployments
Triggered by merge into main.

## Manual Deployments
Allowed only for:
- Emergency rollback
- Infrastructure corrections

## Non-Deploy Actions
Do NOT deploy:
- Editing docs
- Issue creation
- Label changes

## Risk Rules
- No direct production edits
- No bypassing CI
- No partial deploys
