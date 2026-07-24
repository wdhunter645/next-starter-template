---
Doc Type: How-To
Audience: Bill, ChatGPT, Cursor, LGFC operators, and reviewers
Authority Level: Operational Procedure
Owns: Operator procedure for consent review, recognition publication, anonymous handling, sponsor logo approval, and takedown
Does Not Own: Runtime implementation, vendor account configuration, or campaign launch authorization
Canonical Reference: /docs/reference/website/fundraiser-donor-sponsor-privacy-model.md
Related Issues: #1700, #1705
Last Reviewed: 2026-07-24
---

# Fundraiser Donor and Sponsor Recognition Privacy Operations

## Purpose

Apply the recognition privacy model before any public sponsor/donor recognition
appears on LGFC campaign surfaces.

## Scope

In scope:

- consent assessment;
- field allowlisting;
- anonymous/tier handling;
- sponsor logo/link approval;
- takedown/correction.

Out of scope:

- implementing UI;
- pasting raw exports into CMS;
- configuring Givebutter.

## Current known truth

- Privacy model:
  [`fundraiser-donor-sponsor-privacy-model.md`](/docs/reference/website/fundraiser-donor-sponsor-privacy-model.md)
- Default is fail closed (`unknown` → no public recognition).

## Steps

1. Collect candidate recognition rows from an approved private source.
2. Assign consent state per row.
3. Map only approved public fields.
4. Obtain required approvals for names/logos/winners.
5. Publish via authorized website surfaces only.
6. Handle takedowns immediately when requested.

## Procedure

### 1. Intake

1. Keep raw vendor exports private (outside public repo/routes).
2. Create a working recognition sheet with consent state and `display_label`.

### 2. Consent review

1. Default new rows to `unknown`.
2. Promote to `display-name-approved`, `anonymous-only`, or
   `sponsor-public-approved` only with recorded authority.
3. Reject minors/sensitive cases unless Product Authority explicitly approves.

### 3. Field mapping

1. Copy only approved public fields into the publication package.
2. Strip email/phone/address/payment/raw transaction IDs/notes.
3. Prefer amount bands/tiers over exact amounts when re-identification risk exists.

### 4. Sponsor assets

1. Confirm logo/name public-use approval.
2. Confirm logo URL is a public approved asset.
3. Confirm link is not an admin/private vendor URL.

### 5. Publish gate

1. Confirm campaign launch state allows recognition display.
2. Confirm Task 003 rules if publishing winners.
3. Publish only the approved package.

### 6. Takedown

1. Set `withdrawn`.
2. Remove public row/logo.
3. Record evidence on the controlling Issue.

## Verification

- Privacy checklist in
  [`fundraiser-task-005-privacy-checklist.md`](/docs/ops/reports/fundraiser-task-005-privacy-checklist.md)
  is complete for the publication package.
- No prohibited PII in public CMS/config payloads.

## Stop conditions

Stop when consent is unclear, requested fields are prohibited, or a takedown is
pending unresolved.
