---
Doc Type: Reference
Audience: Bill, ChatGPT, Cursor, LGFC operators, and reviewers
Authority Level: Controlled
Owns: Canonical fundraiser campaign launch-state vocabulary, state transitions, approval gates, and evidence expectations for website-side campaign operations
Does Not Own: Givebutter/vendor configuration, payment processing, public campaign launch authorization, donor/sponsor privacy field rules (Task 005), or website runtime implementation (Task 006)
Canonical Reference: /docs/ops/pmo/fundraiser-charity-campaign-operations-buildout-readiness.md
Related Issues: #1700, #1701, #1696
Last Reviewed: 2026-07-22
---

# Fundraiser Launch-State Model

## Purpose

Define the canonical campaign launch states used by LGFC fundraiser operations so
operators, reviewers, and later tasks share one vocabulary.

This model covers website-side campaign lifecycle only. External Givebutter (or
other vendor) campaign ownership remains outside LGFC runtime and is documented
by Task 002.

## Canonical launch states

These six states are authoritative for acceptance, checklists, and website
display contracts:

| State | Meaning | Public website claim |
| --- | --- | --- |
| `draft` | Campaign concept and internal config are being prepared | Must not imply a live fundraiser |
| `preview` | Internal/admin review of approved public fields and links | Preview/admin only; no public live claim |
| `active` | Operator-authorized public campaign period | May show approved public campaign surfaces |
| `paused` | Temporary halt while campaign remains recoverable | Must not claim donations are currently open unless explicitly approved pause messaging exists |
| `ended` | Public fundraising period is closed; closeout in progress | May show closed/ended messaging; no live donate CTA unless authorized residual messaging exists |
| `archived` | Campaign retained as historical summary only | Summary or hidden; no live-state claims |

## Operator workflow stages (map to canonical states)

Operators may use finer workflow labels. Each maps to exactly one canonical state:

| Workflow stage | Canonical state | Typical exit gate |
| --- | --- | --- |
| Concept | `draft` | Product Authority confirms campaign intent for 2027 planning |
| Draft campaign | `draft` | Required fields and ownership notes captured |
| Internal review | `preview` | Bill/ChatGPT or designated reviewer accepts preview package |
| Prelaunch ready | `preview` | Pre-launch checklist complete; no open privacy/vendor blockers |
| Scheduled launch | `preview` | Launch time/authority recorded; still not public-live until activation |
| Live campaign | `active` | Explicit launch authorization recorded on the controlling Issue |
| Closed campaign | `ended` | End authorization recorded; winner/recognition work may continue |
| Post-campaign reporting | `ended` or `archived` | Reporting complete → archive decision |

## Allowed and forbidden actions by state

| State | Allowed | Forbidden |
| --- | --- | --- |
| `draft` | Internal planning docs; private admin notes; draft config edits | Public live CTA; public donor lists; production vendor mutations without separate authority |
| `preview` | Admin fundraiser preview; internal link checks; fail-closed public surfaces | Claiming the campaign is live; publishing unapproved recognition |
| `active` | Approved public spotlight/links; approved recognition fields; operator pause | Secrets in repo; scraping private vendor donor PII; unauthorized winner publication |
| `paused` | Pause messaging; resume or end decisions; incident notes | Silent resume to live without recorded authorization when pause was mandated |
| `ended` | Closed messaging; winner validation; recognition finalization; evidence capture | New live donate claims; treating vendor live feed as website truth without snapshot rules |
| `archived` | Historical summary; operator archive references | Presenting archived campaigns as currently active |

## Required approval gates

| Gate | Required before | Authority |
| --- | --- | --- |
| Campaign planning start | Leaving pure concept into durable draft package | Product Authority or PMO / Engineering per project package |
| Preview publication to admin surfaces | Entering `preview` | Implementation / Operations with recorded reviewer acceptance path |
| Public activation | Entering `active` | Product Authority (Bill) with ChatGPT/PMO coordination as recorded |
| Pause / resume | Entering or leaving `paused` | Product Authority or designated Day-2 / Operations owner recorded on the controlling Issue |
| Winner publication | Any public winner label | Product Authority after privacy-safe validation (Task 003 / Task 005) |
| Archive | Entering `archived` | Product Authority or PMO / Engineering closeout acceptance |

Labels and comments are routing evidence. They do not replace recorded approval on
the controlling source Issue when a gate requires it.

## Website copy and surface limits before `active`

Until the campaign is `active`:

- Homepage and public routes must fail closed or show non-live messaging.
- Do not use “donate now,” “campaign is live,” or equivalent live claims.
- Public links may be prepared in draft/preview packages but must not be
  published as live campaign CTAs without activation authority.
- Admin preview (`docs/how-to/website/admin-fundraiser-preview.md`) may render
  draft/preview payloads for operators only.

## Pause and rollback semantics

| Action | From | To | Evidence required |
| --- | --- | --- | --- |
| Pause | `active` | `paused` | Reason, authority, timestamp, public messaging decision |
| Resume | `paused` | `active` | Explicit resume authorization and re-check of links/privacy |
| Early end | `active` or `paused` | `ended` | End authorization and closed-state messaging decision |
| Abandon before launch | `draft` or `preview` | `archived` or retained `draft` | Decision note; no public live residue |

Rollback of website display means restoring fail-closed or prior approved non-live
state. Vendor-side refunds, payment disputes, and Givebutter admin actions are out
of scope for this model.

## Evidence expectations per state

| State | Minimum evidence |
| --- | --- |
| `draft` | Campaign identity, owner, target window, non-goals |
| `preview` | Preview checklist, approved public fields, link inventory |
| `active` | Launch authorization comment/Issue record, activated public field set |
| `paused` | Pause authorization, operator contact, resume/end path |
| `ended` | End authorization, winner/recognition disposition status |
| `archived` | Archive summary location and “no live claim” confirmation |

## Relationship to later tasks

| Later task | Consumes this model for |
| --- | --- |
| #1702 | External vs website ownership without inventing lifecycle flow |
| #1703 | When winner calculation/publication is allowed (`ended` gate) |
| #1704 | Spotlight/surface behavior per state |
| #1705 | Recognition publication only under allowed states + privacy rules |
| #1706 | Fail-closed runtime mapping of these states |
| #1707 | Pre-launch checklist coverage of every canonical state |

## Non-goals

- Authorizing a live 2027 campaign by documenting this model
- Defining Givebutter API contracts
- Implementing runtime enums or CMS fields (Task 006)
- Replacing Production design standards for homepage layout
