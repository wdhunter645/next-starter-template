---
Doc Type: How-To
Audience: LGFC operators, maintainers, and AI implementation agents
Authority Level: Operational Procedure
Owns: Weekly matchup create/update/close and public read-path checks
Does Not Own: Voting model redesign or matchup product policy
Canonical Reference: /docs/reference/architecture/access-model.md
Related Issues: #1258, #1565, #1126
Last Reviewed: 2026-06-14
---

# Admin Matchup

## Purpose

Manage weekly photo matchups and compare admin state to public read paths
(`#1126` / T48).

## Scope

Route: `/admin/matchup`

APIs: `functions/api/admin/matchup/**`, public `functions/api/matchup/**`.

## Steps

1. Sign in as admin and save the admin API token.
2. Open **Matchup**.
3. Load matchup list and active record.
4. Create, activate, or close matchups per schedule.
5. Compare public current/results preview shown on the admin page.

## Procedure

### Load matchups

1. Open **Matchup**.
2. Save token; wait for list load.
3. Review active matchup and historical items.

### Create matchup

1. Enter week start (Monday UTC), photo A ID, photo B ID.
2. Choose activate-on-create if the matchup should go live immediately.
3. Submit; confirm success status and list refresh.

### Close active matchup

1. Use close control for the active record when the voting period ends.
2. Confirm active flag clears and public preview updates.

### Public preview panel

The admin page fetches `/api/matchup/current` and `/api/matchup/results` for
operator comparison. Mismatches between admin and public data warrant investigation
before leaving an active matchup live.

## Verification

- `tests/admin-matchup.test.tsx`
- Manual: mutations blocked without token; stale refresh cancelled on token clear.

## Closeout Criteria

Matchup action is complete when admin and public read paths agree on the active week
and vote totals where applicable.
