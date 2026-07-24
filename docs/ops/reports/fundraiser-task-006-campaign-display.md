---
Doc Type: Report
Audience: Bill, ChatGPT, Cursor, LGFC operators, and reviewers
Authority Level: Evidence
Owns: Task 006 (#1706) website campaign configuration/display implementation evidence
Does Not Own: Campaign launch authorization, Givebutter configuration, or Task 007 pre-launch testing package
Canonical Reference: /docs/ops/implementation-plans/fundraiser-charity-campaign-operations-buildout.md
Related Issues: #1700, #1706, #1704, #1705
Last Reviewed: 2026-07-24
---

# Fundraiser Task 006 — Campaign Display Implementation Evidence

## Purpose

Record accepted website-side campaign config/display deltas implemented for
Task 006 and the verification that was run.

## Accepted deltas implemented

1. **Launch-status mapping (Task 001 / #1704)** — CMS config may include canonical
   `status` (`draft` | `preview` | `active` | `paused` | `ended` | `archived`).
   Public homepage visibility requires `enabled` and status in
   `active` | `paused` | `ended`. Live donate/auction CTAs only while `active`.
2. **Fail-closed public slot** — Missing/invalid/unpublished/disabled/non-public
   status continues to render nothing on the homepage.
3. **Recognition privacy (Task 005)** — Leaderboard rows honor consent /
   `display_label` / `is_anonymous`. Unknown, withdrawn, and rejected consents
   are hidden on public surfaces. Legacy team snapshots without consent remain
   displayable as public team labels.
4. **Admin controls** — Fundraiser preview exposes launch-status selection and
   homepage-eligibility messaging aligned to the public visibility helper.

## Out of scope / deferred

- Winner module placement (Task 003 + Product Authority)
- Live Givebutter donor feeds
- D1 migrations / workflow YAML
- Campaign launch authorization

## Verification

- `npx vitest run tests/campaignSpotlight.test.tsx tests/admin-fundraiser-preview.test.tsx tests/fundraiser.test.ts`
