---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Live operating procedures, incident response, monitoring, operator workflows
Does Not Own: Redefining design/architecture/platform specs; historical records
Canonical Reference: /docs/ops/OPERATING_MANUAL.md
Last Reviewed: 2026-02-20
---

# Deployment and Operations Log

## 2026-06-09: Remove Social Wall subtitle from homepage (PR #1480)

**Context**: Post-merge closeout for PR #1480 (source issue #1479). Removed the "Live fan posts from Facebook." subtitle under the Social Wall section title on the homepage.

**Action**: Merged PR #1480 to `main` and verified the deployed homepage no longer renders the subtitle.

**Changes**:
- Removed subtitle paragraph from `src/components/SocialWall.tsx`
- Removed unused `.subtitle` CSS from `src/components/social-wall.module.css`
- Updated `tests/e2e/homepage-sections.spec.ts` to stop asserting the removed subtitle

**Result**: Social Wall section displays only the "Social Wall" heading above the Elfsight embed.

**Evidence**:
- Merge commit: `58343875ae14bbb8a5a39e272632d28a2fe53a6c`
- PR: https://github.com/wdhunter645/next-starter-template/pull/1480
- Verification: `npm run test:homepage-structure` — PASS (10/10)
- Preview check: https://cursor-remove-social-wall-su.next-starter-template-6yr.pages.dev/ — HTTP 200, no subtitle text in HTML

**Impact**: Copy-only homepage change. No routing, auth, or widget configuration changes.

---

## 2026-01-19: npm audit fix (PR #383 follow-up)

**Context**: Following successful deployment of PR #383 (admin role gating and D1 empty-state handling), this PR addresses remaining npm security vulnerabilities.

**Action**: Applied `npm audit fix --force` to remediate low-severity vulnerabilities in the dependency tree.

**Changes**:
- Updated wrangler from 4.52.1 → 4.35.0 (major version downgrade required to fix undici vulnerability)
- Updated various Cloudflare workerd and related packages
- Updated sharp and image processing dependencies
- Note: `npm audit fix` initially upgraded wrangler to 4.59.2, but this didn't resolve the vulnerability; `npm audit fix --force` was required to downgrade to 4.35.0

**Result**: **0 vulnerabilities** (down from 3 low-severity vulnerabilities)

**Build Status**: ✓ Successful (Next.js static build passes)

**Evidence**: 
- Pre-fix audit: `/docs/audits/npm-audit-before.txt` (3 low severity)
- Post-fix audit: `/docs/audits/npm-audit-after.txt` (0 vulnerabilities)

**Impact**: Dependency-only changes. No functional code changes. No breaking changes to application behavior.

---

## 2026-01-19: Admin role gating and D1 empty-state handling (PR #383)

**Context**: Successfully deployed admin access controls and database empty-state handling.

**Status**: Deployed and operational.
