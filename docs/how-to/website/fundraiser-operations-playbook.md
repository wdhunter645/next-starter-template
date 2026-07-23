---
Doc Type: How-To
Audience: Bill, ChatGPT, Cursor, LGFC operators, and reviewers
Authority Level: Operational Procedure
Owns: Repeatable operator procedure for fundraiser setup, preview, launch, pause, closeout, winner publication, and archive
Does Not Own: Vendor account configuration, payment processing, merge authority, public campaign launch without Product Authority approval, or donor privacy field definitions
Canonical Reference: /docs/reference/website/fundraiser-launch-state-model.md
Related Issues: #1700, #1701, #1696
Last Reviewed: 2026-07-22
---

# Fundraiser Operations Playbook

## Purpose

Run a repeatable LGFC fundraiser campaign lifecycle on the website side without
conflating LGFC display/config ownership with Givebutter (or other vendor)
ownership.

Use this playbook with the canonical states in
[`fundraiser-launch-state-model.md`](/docs/reference/website/fundraiser-launch-state-model.md).

## Scope

In scope:

- operator steps for setup → archive;
- approval gates and evidence capture;
- website copy limits before live launch;
- pause/rollback of public claims;
- handoff points for Givebutter boundary, leaderboard, recognition, and testing tasks.

Out of scope:

- creating or configuring Givebutter campaigns;
- storing secrets, tokens, or payment credentials in the repository;
- publishing donor/sponsor PII;
- merging PRs or closing Issues;
- claiming a public campaign is live without Product Authority authorization.

## Current known truth

- Canonical launch states and gates live in
  [`fundraiser-launch-state-model.md`](/docs/reference/website/fundraiser-launch-state-model.md).
- This playbook is operator procedure only; it does not authorize vendor
  configuration, store secrets, or launch a public campaign by itself.
- Admin preview behavior already exists at
  [`admin-fundraiser-preview.md`](/docs/how-to/website/admin-fundraiser-preview.md)
  and remains the preview check path during `preview`.
- Post-campaign reporting runs under `ended`; archive is a later gate after the
  reporting package is accepted.

## Steps

1. Confirm program/task authority and campaign identity.
2. Complete setup while state is `draft`.
3. Run internal preview while state is `preview`.
4. Obtain Product Authority launch authorization before `active`.
5. Operate `active` / `paused` controls during the campaign window.
6. Close to `ended`, complete winner publication gates, then `archived`.
7. File evidence using the Task 001 operations checklist report.

## Procedure

### 1. Setup (`draft`)

1. Record campaign identity: working title, charity/fundraiser purpose, target
   window, and Product Authority owner.
2. Separate external vs website workstreams:
   - External: vendor campaign creation remains human/vendor-owned (Task 002).
   - Website: display copy, spotlight eligibility, approved public URL reference,
     and fail-closed defaults.
3. Capture non-goals explicitly (no live claim yet; no donor list publication).
4. Keep public surfaces fail-closed. Do not publish live CTAs.
5. Evidence: draft package note on the controlling Issue or ops report checklist.

### 2. Preview (`preview`)

1. Populate only fields intended for eventual public use.
2. Open admin fundraiser preview per
   [`admin-fundraiser-preview.md`](/docs/how-to/website/admin-fundraiser-preview.md).
3. Validate title, public link target, dates, and spotlight eligibility.
4. Confirm public routes still do not claim the campaign is live.
5. Complete internal review and mark prelaunch-ready only when checklist items
   for links, copy limits, and privacy blockers are clear.
6. Evidence: preview checklist result and reviewer acceptance path.

### 3. Launch (`active`)

1. Confirm Product Authority **GO** for public activation on the controlling Issue.
2. Confirm approved public URL is operator-approved (not an admin/private vendor URL).
3. Activate only approved public fields.
4. Verify homepage/campaign surfaces show intended live messaging and do not
   break core navigation when present.
5. Evidence: launch authorization record, activated field set, and smoke notes.

### 4. Pause (`paused`)

1. Record pause authority, reason, and timestamp.
2. Replace or suppress live donate claims according to the approved pause message.
3. Decide resume vs early end path before leaving the pause unresolved.
4. Evidence: pause record and public messaging decision.

### 5. Closeout (`ended`)

1. Record end authorization.
2. Remove or replace live CTAs with closed/ended messaging.
3. Freeze website-side campaign claims to ended semantics.
4. Start winner and recognition disposition only under privacy-safe rules
   (Tasks 003 and 005). Do not publish winners from raw private vendor exports.
5. Evidence: end authorization and closed-state verification notes.

### 6. Winner publication gate

1. Confirm campaign is `ended` (or an explicitly authorized announcement window).
2. Confirm deterministic winner rule package exists (Task 003) and privacy model
   allows the display label (Task 005).
3. Obtain Product Authority approval for the public winner label.
4. Publish only the approved privacy-safe label/fields.
5. Evidence: winner validation notes + approval record.

### 7. Archive (`archived`)

1. Decide archive summary vs hide.
2. Ensure no remaining public live-state claims.
3. Store operator pointers to evidence and external ownership notes for future
   campaigns.
4. Evidence: archive confirmation on the checklist report.

## Operator responsibilities

| Role | Responsibility |
| --- | --- |
| Product Authority (Bill) | Public activation, pause/resume/end when mandated, winner publication, production/vendor irreversible actions |
| PMO / Engineering (ChatGPT) | Package completeness, acceptance review, boundary/design reconciliation |
| Implementation / Operations (Cursor) | Website-side docs/config/display work inside assigned Issue allowlists |
| Human vendor operator | Givebutter/account configuration outside the repository |
| Day-2 Operations | Incident pause/containment when a live campaign surface misbehaves |

## Required evidence checklist (all states)

Use
[`fundraiser-task-001-operations-checklist.md`](/docs/ops/reports/fundraiser-task-001-operations-checklist.md)
and confirm coverage for:

- [ ] `draft`
- [ ] `preview`
- [ ] `active`
- [ ] `paused`
- [ ] `ended`
- [ ] `archived`

## Rollback summary

If public messaging is wrong or unauthorized:

1. Move display claim to fail-closed, `paused`, or prior approved non-live state.
2. Record authority and reason on the controlling Issue.
3. Do not “fix forward” into a live claim without re-authorization.
4. Vendor payment remediation remains outside website rollback.

## Verification

- Confirm every canonical state appears in the operations checklist report.
- Confirm this playbook does not authorize vendor configuration or live launch by itself.
- Confirm Task 002 can document external/internal ownership using this flow without inventing states.
- Docs checks: header keys present; this how-to includes `## Steps` and `## Procedure`.

## Stop conditions

Stop and escalate when:

- required launch/pause/end/winner authority is missing;
- donor/sponsor privacy rules are unresolved for a public recognition change;
- vendor credentials or irreversible external actions are requested inside a docs/code task;
- requested work leaves the active Issue allowlist.
