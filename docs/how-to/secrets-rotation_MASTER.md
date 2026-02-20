---
Doc Type: How-To
Audience: Human + AI
Authority Level: Operational
Owns: Step-by-step procedures to accomplish tasks safely
Does Not Own: Defining specs; redefining design/architecture/platform rules
Canonical Reference: /docs/governance/standards/document-authority-hierarchy_MASTER.md
Last Reviewed: 2026-02-20
---

# Secrets Rotation Policy (MASTER)

## Purpose
Define how credentials are stored, replaced, and secured.

## Secrets Covered
- API keys
- Service tokens
- Deployment credentials

## Storage
Use:
- Cloudflare environment variables
- GitHub encrypted secrets

Never commit secrets to the repo.

## Rotation Triggers
- Exposure
- Staff change
- Platform migration
