---
Doc Type: TBD
Audience: Human + AI
Authority Level: TBD
Owns: TBD
Does Not Own: TBD
Canonical Reference: TBD
Last Reviewed: 2026-02-20
---

# Production Environment Definition (MASTER)

## Purpose
Define exactly what constitutes production, preview, and local environments so operators know what is live, what is test, and what is safe to modify.

## Environment Types

### Production
The live, public system serving real users.
Authoritative services:
- Cloudflare Pages (frontend hosting)
- Cloudflare D1 (database)
- GitHub main branch (source of truth)
- CI pipelines that deploy to production

Rules:
- Changes must come from merged PRs
- Direct manual edits are prohibited
- Stability takes priority over features

### Preview
Temporary environments generated from PRs.
Used for visual and functional validation only.

### Local
Developer machines used for development and testing only.

## Source of Truth
Production state is defined by:
- main branch
- production Cloudflare deployment
- current D1 schema
