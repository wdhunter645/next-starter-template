---
Doc Type: Reference
Audience: Bill, ChatGPT, Cursor, design reviewers, and implementers
Authority Level: Controlled
Owns: Design-authority crosswalk from production homepage spotlight invariants to the fundraiser campaign surface contract
Does Not Own: Website runtime implementation, CMS publishing operations, or vendor campaign configuration
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Related Issues: #1700, #1704
Last Reviewed: 2026-07-24
---

# Fundraiser Homepage Spotlight Design Crosswalk

## Purpose

Record how LGFC Production Design homepage spotlight invariants apply to the
fundraiser campaign spotlight so Task 004 reconciliation stays anchored to
canonical design authority.

## Scope

In scope:

- mapping production homepage section rules to fundraiser campaign spotlight;
- stating design non-negotiables for fail-closed and non-blocking behavior.

Out of scope:

- full redesign of homepage sections;
- runtime edits;
- detailed CMS field schema beyond design constraints.

## Current known truth

- Canonical homepage order places SPOTLIGHT third and **hidden by default**.
- Fundraiser campaign spotlight is the temporary/conditional occupant of that
  spotlight slot for campaign periods.
- Detailed operational/status mapping lives in
  [`fundraiser-campaign-surface-design.md`](/docs/reference/website/fundraiser-campaign-surface-design.md).

## Intended final state

Design and website references agree: the campaign spotlight may appear only when
authorized and valid, and must disappear cleanly without harming homepage
structure when not authorized.

## Design non-negotiables

1. Preserve locked homepage section order from Production Design standards.
2. Spotlight remains hidden by default.
3. Missing/invalid/disabled/unpublished campaign state must not break header,
   banner, matchup, join, or footer.
4. Public CTAs must use approved public destinations; no admin/private vendor URLs.
5. Campaign spotlight must not be confused with editorial `homepage_spotlight` or
   ALS `CharitySpotlight` surfaces.

## Crosswalk

| Production Design rule | Fundraiser campaign application |
| --- | --- |
| SPOTLIGHT hidden by default | CMS `enabled=false` / unpublished → render nothing |
| Section order fixed | Campaign slot stays in spotlight position only |
| Auth/nav integrity unrelated to campaign | Campaign failure must not redirect or block join/auth |
| Feature mapping must stay explicit | Use `CampaignSpotlight*` names in as-built docs; do not rename Weekly Matchup |

## Deferred design decisions

| Decision | Owner |
| --- | --- |
| Richer public status badges beyond enabled/published | Task 006 after Product Authority acceptance |
| Embed vs link-first visual treatment | Task 002 boundary + Product Authority |
| Winner module on homepage vs separate surface | Task 003 + Task 006 |
