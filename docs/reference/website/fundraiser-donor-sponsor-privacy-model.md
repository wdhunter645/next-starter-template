---
Doc Type: Reference
Audience: Bill, ChatGPT, Cursor, LGFC operators, and reviewers
Authority Level: Controlled
Owns: Sponsor and donor recognition privacy model including consent states, allowed public fields, anonymous display, tier/logo rules, prohibited PII, and takedown path
Does Not Own: Runtime recognition UI implementation (Task 006), Givebutter configuration, or public campaign launch
Canonical Reference: /docs/ops/pmo/fundraiser-charity-campaign-operations-buildout-readiness.md
Related Issues: #1700, #1705, #1703, #1704
Last Reviewed: 2026-07-24
---

# Sponsor and Donor Recognition Privacy Model

## Purpose

Define privacy-safe rules for any public sponsor or donor recognition on LGFC
fundraiser campaign surfaces so Task 006 can implement display without inferring
consent or PII policy.

## Scope

In scope:

- consent states and publication eligibility;
- approved public recognition fields;
- anonymous / aggregated / tiered display;
- sponsor logo and link rules;
- prohibited PII;
- takedown/correction and evidence retention.

Out of scope:

- implementing recognition UI;
- ingesting raw vendor transaction exports into public routes;
- legal advice beyond operator procedure.

## Current known truth

- Readiness default: no public PII; display only approved public recognition
  fields.
- Task 003 winner publication already requires privacy-safe `display_label`.
- Task 002 prohibits public raw exports and admin/private vendor URLs.
- Campaign spotlight leaderboard currently shows snapshot `name` fields that must
  obey this model when treated as donor/sponsor recognition.

## Intended final state

Public recognition never exposes email, phone, address, payment details, raw
transaction IDs, or private notes. Every public recognition row has an explicit
consent/publication state.

## Consent states

| Consent state | Meaning | Public use |
| --- | --- | --- |
| `unknown` | Not assessed | Block public recognition |
| `anonymous-only` | May appear only as anonymous/aggregated | Anonymous/tier aggregate only |
| `display-name-approved` | Approved public display label | Show approved `display_label` only |
| `sponsor-public-approved` | Sponsor name/logo approved for public use | Show approved sponsor fields |
| `withdrawn` | Consent revoked or takedown requested | Must remove/hide promptly |
| `rejected` | Not eligible for public recognition | Never display |

Default for new rows: `unknown` (fail closed).

## Approved public fields

| Field | Allowed when | Notes |
| --- | --- | --- |
| `display_label` | `display-name-approved` or sponsor-approved name | Privacy-safe label; not raw legal name by default |
| `recognition_tier` | Any public-eligible consent | e.g. Bronze/Silver/Gold or amount band |
| `amount_band` | Explicitly approved | Prefer bands over exact amounts when sensitive |
| `sponsor_logo_url` | `sponsor-public-approved` + logo approval | Hosted/approved asset only |
| `sponsor_public_url` | `sponsor-public-approved` | Public marketing URL only; never admin URL |
| `is_anonymous` | always | Forces anonymous rendering when true |

## Prohibited public fields (always)

- email, phone, mailing address
- payment instrument data, payout details
- raw transaction IDs / export row IDs
- private account metadata / internal operator notes
- unapproved legal names, photos of people without rights review
- minor-identifying information (escalate; default reject)

## Anonymous and tiered display

When consent is `anonymous-only` or `is_anonymous=true`:

- render as “Anonymous” or equivalent approved label;
- may include tier/band only if that does not re-identify the person;
- never combine anonymous rows with unique timestamps/amounts that re-identify.

Aggregates (counts, totals) are preferred for public progress when individual
recognition is not approved.

## Sponsor logo and link rules

1. Sponsor name/logo require `sponsor-public-approved`.
2. Logo file must be an approved public asset (no private Dropbox/admin links).
3. Sponsor link must be a public marketing URL.
4. Withdrawal moves state to `withdrawn` and removes public logo/name.

## Winner recognition interaction (Task 003)

Winner publication uses the same prohibited-PII list and requires:

- privacy-safe `display_label`;
- Product Authority approval;
- campaign `ended` (or authorized announcement window).

## Takedown and correction

| Step | Action |
| --- | --- |
| 1 | Record request/reason on controlling Issue |
| 2 | Set consent to `withdrawn` |
| 3 | Remove or replace public recognition row |
| 4 | Republish campaign surfaces fail-closed if needed |
| 5 | Retain private evidence outside public repo/routes |

## Evidence retention

- Keep consent decision, approver, timestamp, and field set used publicly.
- Do not commit raw donor exports to the repository.
- Privacy checklist required for any Task 006 recognition display change.

## Boundaries for Task 006

Task 006 may display only approved public fields above and must fail closed when
consent is `unknown`, `withdrawn`, or `rejected`, or when required fields are
missing/invalid.

## Non-goals

- Publishing full donor lists
- Using Givebutter live donor feeds as recognition source
- Storing PII in public CMS bodies
