---
Doc Type: How-To
Audience: Bill, ChatGPT, Cursor, LGFC operators, and reviewers
Authority Level: Operational Procedure
Owns: Operator pre-launch verification procedure for fundraiser campaign state, links, leaderboard, recognition privacy, fail-closed behavior, accessibility, archive readiness, and handoff
Does Not Own: Runtime feature implementation, Givebutter vendor configuration, Product Authority launch GO, or program closeout (Task 008)
Canonical Reference: /docs/ops/implementation-plans/fundraiser-charity-campaign-operations-buildout.md
Related Issues: #1700, #1707, #1706
Last Reviewed: 2026-07-24
---

# Fundraiser Pre-Launch Testing

## Purpose

Run the final website-side pre-launch verification package before any public
fundraiser campaign activation. This converts the implementation-plan
pre-launch checklist into an operator procedure.

## Scope

In scope:

- campaign launch-state checks;
- approved public link checks;
- fail-closed homepage spotlight checks;
- leaderboard snapshot checks;
- winner-rule documentation gate;
- recognition privacy checks;
- accessibility/viewport smoke checks;
- archive readiness;
- operator handoff confirmation.

Out of scope:

- authorizing Product Authority launch GO;
- configuring Givebutter accounts or payment processing;
- implementing new runtime features;
- promoting the component branch to `main`.

## Current known truth

- Canonical states:
  [`fundraiser-launch-state-model.md`](/docs/reference/website/fundraiser-launch-state-model.md)
- Campaign surface design:
  [`fundraiser-campaign-surface-design.md`](/docs/reference/website/fundraiser-campaign-surface-design.md)
- Recognition privacy:
  [`fundraiser-donor-sponsor-privacy-model.md`](/docs/reference/website/fundraiser-donor-sponsor-privacy-model.md)
- Task 006 as-built:
  [`fundraiser-task-006-campaign-display.md`](/docs/ops/reports/fundraiser-task-006-campaign-display.md)
- Automated fail-closed/status/privacy coverage exists in
  `tests/campaignSpotlight.test.tsx` (do not treat unit tests as launch GO).

## Steps

1. Confirm predecessor Task 006 evidence is integrated.
2. Complete every checklist area in Procedure below.
3. Record pass/fail and evidence links on the controlling Issue.
4. Stop at pre-launch ready; do not activate `active` without Product Authority GO.
5. File the Task 007 evidence report and hand Task 008 the package pointer.

## Procedure

### 1. Preconditions

1. Confirm #1706 is merged on
   `component/fundraiser-charity-campaign-operations`.
2. Confirm admin preview path
   [`admin-fundraiser-preview.md`](/docs/how-to/website/admin-fundraiser-preview.md)
   is available to the operator.
3. Confirm no open privacy/vendor blockers remain on the controlling Issue.

### 2. Campaign state

1. Verify the six canonical states are understood and usable in admin launch
   status: `draft`, `preview`, `active`, `paused`, `ended`, `archived`.
2. Confirm public homepage stays hidden for `draft` / `preview` / `archived`
   even when `enabled=true`.
3. Confirm `paused` / `ended` may show non-live messaging without donate CTAs.
4. Confirm live donate CTAs require `enabled` + `active` (or documented legacy
   enabled config without status).

### 3. Approved public links

1. Confirm primary/secondary CTAs use operator-approved public Givebutter (or
   vendor) URLs.
2. Confirm no admin/private vendor URLs appear on public surfaces.
3. Confirm placeholder `/charities` CTAs are rejected for enabled configs.
4. Confirm external links open with safe `rel` / new-tab handling in the card.

### 4. Fail-closed behavior

1. With no published CMS body: homepage spotlight renders nothing.
2. With invalid JSON or validation errors: homepage spotlight renders nothing.
3. With `enabled=false`: homepage spotlight renders nothing.
4. With unpublished draft only: public slot stays fail-closed.
5. Confirm core homepage sections still render when spotlight is absent.

### 5. Homepage spotlight

1. Confirm spotlight placement does not displace header, banner, matchup, join,
   or footer when inactive.
2. Confirm an eligible published active config can render without breaking
   navigation.
3. Confirm pause/ended badges do not claim donations are open.

### 6. Leaderboard snapshot

1. Confirm public leaderboard rows come from CMS snapshot fields, not a live
   vendor donor feed.
2. Confirm incomplete leaderboards fail validation when enabled.
3. Confirm operator refresh path is admin snapshot only from approved sources.

### 7. Winner rule gate

1. Confirm winner calculation, tiebreakers, publication timing, and Product
   Authority approval are documented in Task 003 artifacts before any winner
   label is shown.
2. Do not publish a winner label during pre-launch testing.

### 8. Recognition privacy

1. Confirm only approved public fields are candidates for display.
2. Confirm `unknown` / `withdrawn` / `rejected` rows stay hidden.
3. Confirm anonymous rows render as `Anonymous`.
4. Confirm no email/phone/address/payment/raw transaction IDs/private notes
   appear in published CMS bodies.
5. Complete privacy checklist cross-check from Task 005.

### 9. Accessibility and viewport

1. Keyboard-tab through spotlight CTAs when live messaging is shown in admin
   preview.
2. Confirm labels are readable and status badges are text (not color-only).
3. Spot-check mobile viewport: actions and leaderboard remain usable; absence
   of spotlight does not collapse core layout.

### 10. Archive readiness

1. Confirm operator can move to `ended` without stale live donate claims.
2. Confirm `archived` (or `enabled=off` publish) hides live claims.
3. Confirm prior published revisions remain recoverable via CMS revisions
   without re-enabling live CTAs accidentally.

### 11. Operator handoff

1. External (human/vendor): Givebutter campaign setup, payment, live donor
   operations.
2. LGFC website/admin: spotlight copy, launch status, snapshot leaderboard,
   privacy-safe recognition labels.
3. Evidence required before launch: Product Authority GO on controlling Issue,
   completed Task 007 checklist report, and no open privacy/link blockers.

## Evidence

Record results in
[`fundraiser-task-007-prelaunch-checklist.md`](/docs/ops/reports/fundraiser-task-007-prelaunch-checklist.md)
and link that report from Task 008 closeout.

## Non-goals

- Declaring a live campaign from this how-to alone
- Changing runtime code
- Closing parent program #1700
