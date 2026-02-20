---
Doc Type: TBD
Audience: Human + AI
Authority Level: TBD
Owns: TBD
Does Not Own: TBD
Canonical Reference: TBD
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
