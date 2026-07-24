---
Doc Type: Reference
Audience: Bill, ChatGPT, Cursor, LGFC operators, and reviewers
Authority Level: Controlled
Owns: Homepage campaign spotlight and fundraiser campaign-surface design reconciliation, status/gate mapping, fail-closed display rules, and read-only as-built inventory for Task 004
Does Not Own: Runtime code changes, Givebutter configuration, donor privacy field schema (Task 005), or production campaign launch
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Related Issues: #1700, #1704, #1701, #1702, #1703
Last Reviewed: 2026-07-24
---

# Fundraiser Campaign Surface Design Reconciliation

## Purpose

Reconcile homepage campaign spotlight and related campaign surfaces with
production design authority, Task 001 launch states, Task 002 link/embed
boundaries, and Task 003 leaderboard constraints—without changing runtime code
in this task.

## Scope

In scope:

- homepage spotlight placement and fail-closed public behavior;
- campaign status vs CMS enabled/published gates;
- public link/embed expectations for campaign CTAs;
- preview/review gates before public exposure;
- read-only inventory of existing `src/**` and `tests/**` campaign surfaces.

Out of scope:

- editing React/API/runtime files (Task 006);
- Givebutter account configuration;
- finalizing donor/sponsor privacy fields (Task 005);
- authorizing a live campaign.

## Current known truth

- Production homepage section order locks **SPOTLIGHT as section #3, hidden by
  default** (`docs/reference/design/LGFC-Production-Design-and-Standards.md`).
- As-built public homepage mounts `CampaignSpotlightSlot`, which renders nothing
  unless a published, valid, **enabled** CMS config exists.
- Admin preview lives at `/admin/fundraiser-preview` and can draft/publish the
  `home.campaign_spotlight` CMS block.
- Task 002 requires link-first Givebutter public URLs; embeds are not default.
- Task 003 requires snapshot leaderboard rows; live vendor feeds are not SoT.
- `CharitySpotlight` is a separate ALS-charity surface, not the fundraiser
  campaign spotlight.

## Intended final state

Operators and Task 006 implementers share one design contract:

1. where the campaign spotlight sits on the homepage;
2. which launch states may show public live claims;
3. how preview/publish gates work;
4. how missing/invalid/disabled/stale/unpublished state fails closed;
5. which existing files already implement parts of this contract.

## Homepage placement (design ↔ as-built)

| Design authority | As-built |
| --- | --- |
| Homepage order: HEADER → BANNER → **SPOTLIGHT (hidden by default)** → WEEKLY MATCHUP → … | `src/app/page.tsx` mounts `<CampaignSpotlightSlot />` after banner content and before matchup |
| Spotlight must not block core homepage when inactive | Slot returns `null` when no eligible published config |

Public spotlight must never displace header, banner, matchup, join, or footer
navigation when campaign data is absent.

## Campaign status mapping

Map Task 001 canonical states to website display posture:

| Launch state | Public spotlight | Admin preview |
| --- | --- | --- |
| `draft` | Hidden (fail closed) | May edit local/draft CMS body |
| `preview` | Hidden unless Product Authority explicitly authorizes limited preview copy; default hidden | Load/validate draft; do not imply live |
| `active` | May show only when CMS `enabled=true` **and** published body validates | Confirm alignment with public |
| `paused` | Prefer hidden or approved pause messaging; do not claim donations open unless pause copy is authorized | Update/publish pause posture |
| `ended` | Closed/ended messaging only if explicitly configured; otherwise hide | Winner/leaderboard publication remains gated by Task 003 |
| `archived` | Hidden; no live claims | Enabled off + published |

CMS fields today are primarily `enabled` + published body validity. Task 006 may
add richer status enums later; until then operators must keep launch-state truth
on the controlling Issue and keep `enabled` aligned.

## Preview and review gates

1. **Admin token gate** — fundraiser preview requires saved admin API token.
2. **Validation gate** — `validateCampaignSpotlightConfig` must pass before draft
   save / publish of enabled configs.
3. **Fundraiser source gate** — admin flow blocks save/publish when fundraiser
   source data errors are present.
4. **Publish gate** — public slot reads **published** body only
   (`published_body_md`), not unpublished draft.
5. **Enable gate** — public slot requires `enabled === true`.
6. **Product Authority gate** — entering public `active` still requires Issue
   authorization per Task 001; CMS publish alone is not Product Authority GO.

## Public link / embed behavior

| Behavior | Design rule |
| --- | --- |
| Primary CTA | Absolute approved public Givebutter (or vendor) URL preferred; relative placeholders like `/charities` forbidden when enabled |
| Secondary CTA | Optional; blank allowed; placeholder `/charities` forbidden when enabled |
| External link safety | Givebutter CTAs use safe external link handling in card rendering |
| Embed | Not default; only if Task 002 embed acceptance is recorded |
| Admin/private URLs | Prohibited on public surfaces (Task 002) |

## Fail-closed specification

Public `CampaignSpotlightSlot` must render **nothing** when any of the following
are true:

| Condition | Meaning |
| --- | --- |
| Missing | CMS key absent or no `published_body_md` |
| Disabled | `enabled` is false |
| Invalid | JSON parse fails or validation errors present |
| Stale / unpublished draft only | Draft exists but published body missing or not the approved public version |
| Leaderboard incomplete for enabled config | Validation requires complete leaderboard snapshot when enabled |
| Transport/API failure | CMS fetch fails or `ok !== true` |

Homepage core sections continue to render independently of spotlight failure.

Card-level suppressions (as-built):

- malformed primary CTA suppressed without breaking card shell;
- incomplete/malformed leaderboard rows suppressed;
- campaign shell may remain when leaderboard incomplete **inside admin/card
  preview paths**; public slot still fails closed on validation failure.

## Leaderboard surface boundary (Task 003)

Public leaderboard rows in the spotlight are **snapshot fields inside the CMS
config**, not a live Givebutter feed. Operators should refresh snapshots via
admin tooling only from approved sources and accept the snapshot before enabling
public display.

## Read-only implementation inventory (Task 004 evidence)

Inspected; **not modified** by this task:

### Source

| Path | Role |
| --- | --- |
| `src/app/page.tsx` | Mounts public `CampaignSpotlightSlot` |
| `src/components/home/CampaignSpotlightSlot.tsx` | Public fail-closed loader |
| `src/components/home/CampaignSpotlightCard.tsx` | Spotlight presentation + CTA/leaderboard rendering |
| `src/components/home/CampaignSpotlightCard.module.css` | Spotlight styles |
| `src/lib/campaignSpotlight.ts` | Config schema, parse/validate, Givebutter default URLs, leaderboard snapshot helpers |
| `src/lib/fundraiser.ts` | Fundraiser team source helpers used by admin snapshot |
| `src/app/admin/fundraiser-preview/page.tsx` | Admin draft/preview/publish UI |
| `src/components/CharitySpotlight.tsx` | Separate charity links surface (not campaign spotlight) |
| `src/components/fanclub/ClubHomeArchiveSpotlight.tsx` | Fan-club archive spotlight (out of fundraiser campaign scope) |
| `src/app/admin/editorial/page.tsx` | Editorial `homepage_spotlight` key (distinct editorial surface) |

### Tests

| Path | Role |
| --- | --- |
| `tests/campaignSpotlight.test.tsx` | Config validation, CTA safety, slot fail-closed cases |
| `tests/admin-fundraiser-preview.test.tsx` | Admin preview flow coverage |
| `tests/fundraiser.test.ts` | Fundraiser helper coverage |

## Boundaries for Task 005 / Task 006

- Task 005: recognition fields must not expand spotlight to raw donor PII.
- Task 006: may implement richer status mapping and display controls only within
  accepted deltas; must preserve fail-closed homepage behavior and design order.

## Non-goals

- Changing homepage section order
- Enabling a live campaign via documentation
- Replacing CharitySpotlight with CampaignSpotlight
