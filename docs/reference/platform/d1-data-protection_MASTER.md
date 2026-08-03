---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: D1 data-protection supporting notes for schema and migration safety
Does Not Own: Platform and Environment Domain Policy; UI design specifics; PR process; incident response playbooks
Canonical Reference: /docs/governance/PLATFORM-AND-ENVIRONMENT.md
Related Issues: #2688
Last Reviewed: 2026-07-21
---

# D1 Data Protection Notes (supporting)

This file is a **supporting D1 data-protection note** under the Platform and Environment Domain Policy (`docs/governance/PLATFORM-AND-ENVIRONMENT.md`). It is not a Domain Policy co-owner.

## Purpose
Protect database integrity and prevent accidental data loss.

## Core Rules
- Never change schema directly in production
- Always use controlled migrations
- Test schema changes in preview first
