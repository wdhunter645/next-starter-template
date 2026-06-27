---
Doc Type: Report
Audience: Bill, Atlas, operators, and AI implementation agents
Authority Level: Operational Evidence
Owns: Program #1685 audit register, gap disposition, remediation evidence
Does Not Own: Parent issue #1685 closure authority
Canonical Reference: /docs/ops/implementation-plans/website-completion-fan-club-product-buildout.md
Related issues: #1962, #1685
Last Reviewed: 2026-06-23
---

# Program #1685 Audit Register

Audit tracking issue: **#1962**

## Purpose

Record as-built verification outcomes for Program **#1685 — Website Completion / Fan Club Product Buildout** against canonical design authority, the implementation plan, and repository governance.

## Evidence inventory (Tasks 001–009)

| Task | Issue | PR | Merge SHA (short) | Closeout exception | Audit disposition |
| --- | --- | --- | --- | --- | --- |
| 001 | #1686 | #1695 | `8c988f8` | — | complete (gap review) |
| 002 | #1687 | #1926 | `0688965` | #1949 (separate) | complete (reconciliation report) |
| 003 | #1688 | #1931 | `69bf981` | — | complete (newspaper shell) |
| 004 | #1689 | #1947 | `1b8e996` | — | complete (workflow docs) |
| 005 | #1690 | #1950 | `47a5d2c` | #1951 | remediated (closeout body + Club Home layout cleanup) |
| 006 | #1691 | #1954 | `8978e0a` | — | complete (profile/tags/club_home API) |
| 007 | #1692 | #1955 | `620c3be` | #1957 | remediated (subpage gaps + closeout body) |
| 008 | #1693 | #1958 | `961108e` | #1959 | complete (runbook package + closeout body) |
| 009 | #1694 | #1960 | `9e754041` | #1961 | complete (closeout report + closeout body) |

## Gap disposition matrix

| Gap | Design authority | Pre-audit state | Audit action | Post-audit state |
| --- | --- | --- | --- | --- |
| G-007 Membership card on My Profile | `fanclub-subpages.md` | Card on `/fanclub/myprofile`; `/fanclub/membercard` redirects | Verified — no change | **complete** |
| G-009 Club Home newspaper layout | `program-3-club-home-page-design.md` | Newspaper modules plus legacy dashboard widgets | Removed `PostCreation`, `DiscussionFeed`, `GehrigTimeline`; added `ClubHomeMemberPrompt` → `/fanclub/chat`; updated `fanclub-home.md` | **complete** |
| G-013 Photo gallery tags + grid | `fanclub-subpages.md` | Tag pills; auto-fill grid | Enforced 3-column desktop grid | **partial** (detail view deferred) |
| G-016 Library H1 + search | `fanclub-subpages.md` | Implemented | Verified on `main` | **complete** |
| G-018 Memorabilia tags + grid | `fanclub-subpages.md` | Server `q` + related stories; no tag bar | Added tag pills, `GET /api/fanclub/memorabilia/tags`, 3-column grid | **partial** (detail view deferred) |
| Admin `club_home` UI | Task 006 / runbook | API only | Added `club_home` to admin editorial section options | **complete** |
| G-006 Extra routes (`submit`, `chat`, `membercard`) | Ops how-tos + design | Operational routes exist | **Retained** — documented Day-2 surfaces; `membercard` redirects to profile | **accepted operational** |
| Photo detail modal/route | `fanclub-subpages.md` | Not implemented | Deferred per design | **deferred** |
| Homepage `homepage_*` inventory | Program scope | Out of #1685 | Deferred per closeout report | **deferred** |
| Member binary photo upload | Unified workflow | Text-only submit | Deferred per closeout report | **deferred** |

## Governance remediation

| Item | Action | Artifact |
| --- | --- | --- |
| Closeout exception #1951 (PR #1950) | Remediated PR body | `scripts/ci/post-merge-closeout/pr-1950-body.md` |
| Closeout exception #1957 (PR #1955) | Remediated PR body | `scripts/ci/post-merge-closeout/pr-1955-body.md` |
| Closeout exception #1959 (PR #1958) | Remediated PR body | `scripts/ci/post-merge-closeout/pr-1958-body.md` |
| Closeout exception #1961 (PR #1960) | Remediated PR body | `scripts/ci/post-merge-closeout/pr-1960-body.md` |
| Closeout replay manifest | Created | `scripts/ci/post-merge-closeout/targets-website-completion-1685-closeout.json` |
| Closeout exception #2031 (PR #1981) | Remediated | `scripts/ci/post-merge-closeout/pr-1981-body.md` registered in manifest |

## Verification

| Check | Result | Notes |
| --- | --- | --- |
| `npm run typecheck` | pass | audit branch |
| Vitest fanclub suites | pass | 31 tests |
| `scripts/prod-smoke.sh` | pending | run after deploy |
| Authenticated member route smoke | pending | requires member credentials |

## Remaining before #1685 acceptance

1. Merge audit closeout replay remediation for PR #1981 / exception #2031.
2. Closeout replay closes #2031 and reconciles #1962 post-merge state.
3. Closeout replay closes #1951, #1957, #1959, #1961 and reconciles #1690–#1694.
4. Production/preview smoke with member session.
5. Bill/Atlas sign-off on deferred items.

## Day-2 documentation updated

- `docs/reference/design/fanclub-home.md`
- `docs/ops/reports/website-completion-program-closeout.md`
- This register
