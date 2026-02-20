---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Platform Specification
Owns: Cloudflare, D1, B2, platform constraints, platform operational rules
Does Not Own: UI design specifics; PR process; incident response playbooks
Canonical Reference: /docs/reference/platform/CLOUDFLARE.md
Last Reviewed: 2026-02-20
---

# D1 Data Protection Policy (MASTER)

## Purpose
Protect database integrity and prevent accidental data loss.

## Core Rules
- Never change schema directly in production
- Always use controlled migrations
- Test schema changes in preview first
