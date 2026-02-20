# FAQ Page Specification — LGFC

**Route:** `/faq`
**Access:** Public
**Header state:** Visitor header (public)
**Desktop only.** Mobile/tablet implementation is deferred.

-----

## Purpose

Full FAQ listing page. Extends the FAQ teaser shown on the homepage.
Visitors can browse all approved FAQs, search them, and link through to
the Ask a Question form.

Two specs in one file. /faq covers the full listing with client-side search, accordion expand/collapse, pinning, view-count tracking, 
and the Ask CTA. /ask covers the form fields (identical to join + question textarea), submission behavior including the dual join+question write, and the admin inbox model.
-----

## Page Layout

```
[Global Header]
[Page Container — 1200px max, 20px padding]
  [Page Title — H1: "Frequently Asked Questions"]
  [Search Bar]
  [FAQ List]
    [FAQ Item — expandable]
    ...
  [Ask a Question CTA]
[Global Footer]
```

-----

## Search Bar

- Input type: `text`
- Placeholder: `"Search questions…"`
- Client-side filtering of loaded FAQ items (no server round-trip)
- Filters on question text and answer text
- Empty search state: all FAQs shown
- No-results state: “No questions match your search. [Ask a Question →]”

-----

## FAQ List

Loads up to 50 approved, answered FAQ entries on mount.

### Ordering

1. Pinned entries first (admin-pinned via `pinned = 1`)
1. Then by most recently updated (`updated_at DESC`)

### FAQ Item (expandable)

Each item is an accordion-style row:

```
[Question text]                              [▼ expand icon]
──────────────────────────────────────────────────────────
[Answer text — shown when expanded]
```

- Question row: font weight `600`, `16px`, color `#333333`, cursor pointer
- Expand/collapse icon: chevron, rotates on open
- Answer: `16px`, line height `1.6`, color `#333333`, padding `16px 0`
- Divider line between items: `1px solid #e8ecf5`
- Only one item open at a time is not required — multiple can be open simultaneously

### View Count

When a visitor expands an FAQ item, a fire-and-forget `POST /api/faq/view`
increments the view count. No deduplication in v1. Does not block UI.

-----

## Ask a Question CTA

Below the FAQ list:

```
Have a question we haven't answered?
[Ask a Question →]
```

- Text: `14px`, color `#666666`
- Link routes to `/ask`
- Link style: LGFC Blue, no underline, underline on hover

-----

## Data

- API: `GET /api/faq` returns approved + answered entries
- Client-side search filters the loaded set
- See `docs/architecture/faq-system.md` for schema and API contract

-----

-----

# Ask a Question Page Specification — LGFC

**Route:** `/ask`
**Access:** Public
**Header state:** Visitor header (public)
**Desktop only.** Mobile/tablet implementation is deferred.

-----

## Purpose

Allows visitors to submit a question to the fan club. Submission:

1. Adds the person to the club (same as Join) and sends welcome email
1. Captures the question for admin review and response

Entry point: FAQ section link “Ask a Question” on both homepage and `/faq`.

-----

## Page Layout

```
[Global Header]
[Page Container — 1200px max, 20px padding]
  [Page Title — H1: "Ask a Question"]
  [Intro text]
  [Form]
    [First name — required]
    [Last name — required]
    [Screen name — optional]
    [Email — required]
    [Question — required, textarea]
    [Submit button]
    [Contact link]
  [Status messages]
[Global Footer]
```

-----

## Form Fields

Inherits the same identity fields as `/join` plus a question field:

|Field      |Type    |Required|Notes                            |
|-----------|--------|--------|---------------------------------|
|First name |text    |Yes     |                                 |
|Last name  |text    |Yes     |                                 |
|Screen name|text    |No      |                                 |
|Email      |email   |Yes     |Must contain `@`, min 3 chars    |
|Question   |textarea|Yes     |Freeform, min 10 chars after trim|

-----

## Validation

Client-side:

- Submit button disabled until all required fields valid
- First name, last name: non-empty after trim
- Email: contains `@` and length > 3
- Question: non-empty after trim, min 10 characters

Server-side:

- Same field requirements
- Email normalized to lowercase, fields trimmed
- Screen name set to `null` if empty string

-----

## Submission Behavior

`POST /api/ask`

### On success (200)

- Shows: “Your question has been submitted. We’ll reply by email.”
- Clears form fields
- Adds person to club (same D1 write as Join, idempotent on duplicate email)
- Sends welcome email if first-time joiner
- Captures question in D1 `ask_inbox` table for admin review

### On duplicate email (existing member submitting a question)

- Still accepts the question (question captured, no new join record)
- Shows same success message — no need to surface the duplicate distinction to the user

### On error (400 / 500)

- Shows: “Submission failed. Please try again.”

-----

## Contact Link

Below the form (same pattern as Join page):

`mailto:Contact@LouGehrigFanClub.com?subject=Contact%20Needed%20ASK`

-----

## Data

Questions stored in D1 as an inbox (triage via admin UI):

- Fields: `id`, `first_name`, `last_name`, `screen_name`, `email`,
  `question`, `status` (open / responded / hidden), `created_at`
- Admin UI: `docs/admin/dashboard.md` FAQ/Q&A section

-----

## Related

- `/faq` — links to this page via “Ask a Question”
- `/join` — identical identity field behavior
- Admin dashboard FAQ/Q&A section — admin response workflow
