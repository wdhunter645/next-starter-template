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
