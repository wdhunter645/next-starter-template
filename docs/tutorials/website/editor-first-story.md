---
Doc Type: Tutorial
Audience: New LGFC editors, admins, maintainers, and AI implementation agents
Authority Level: Guided Tutorial
Owns: First-story onboarding walkthrough for the content inventory workflow
Does Not Own: Runtime UI implementation, D1 migrations, final editorial policy, or production deployment
Canonical Reference: /docs/how-to/website/add-content-story.md
Related issues: #1256, #824, #819, #1137, #1689
Last Reviewed: 2026-06-23
---

# Editor First Story Walkthrough

## Goal

Create a reviewed draft story that demonstrates the LGFC content inventory model:
story-first content, source attribution, canonical tagging, placement controls,
media association, and manual editorial review.

## Outcome

At the end of this walkthrough, the editor has one draft or under-review
`content_inventory` story with:

- a stable tag;
- title and story text;
- source name, source URL/reference when available, and credit line;
- canonical or alternate-perspective status;
- allowed sections and priority;
- event date or event year when relevant;
- media association notes when media exists;
- review notes ready for publication review.

### Alternate path — from member submission

When a member submits through `/fanclub/submit`, the story enters
`submission_queue` instead of `content_inventory`. Editors should:

1. Open the pending queue item per [Review a content submission](../../how-to/website/review-content-submission.md).
2. Verify source/credit fields captured at intake.
3. Convert an approved submission into a new or updated inventory record.
4. Set `allowed_sections` (including `club_home` when appropriate) before publish.

See `docs/reference/website/unified-content-workflow.md` for the full pipeline.

## Walkthrough

### Step 1 — Choose a simple historical story

Select a story with a clear source and limited scope.

Good first examples:

- a Lou Gehrig milestone tied to a known date;
- a sourced Yankees-history note;
- a Hall of Fame or ALS awareness item with a durable source;
- a member-submitted memory that has clear attribution.

Avoid the first walkthrough if the source is disputed, media rights are unclear,
or multiple existing canonical rows appear to conflict. Those are valid editorial
cases, but they are not the best onboarding example.

### Step 2 — Gather source and credit information

Record:

- source name;
- source URL or offline reference;
- credit line;
- contributor or collection when known;
- event date or event year when relevant.

If the source URL is unavailable, keep the offline reference in review notes so
future editors understand the attribution trail.

### Step 3 — Search for existing stories

Search approved inventory for:

- similar tag;
- similar title;
- same event year;
- same source;
- related canonical row;
- alternate perspectives.

If a canonical row already exists, treat the new story as a possible alternate
perspective or update instead of creating another canonical row.

### Step 4 — Create the draft story

Populate the required fields:

- `tag`;
- `title`;
- `text`;
- `story_type`;
- `canonical`;
- `allowed_sections`;
- `priority`;
- `source_name`;
- `source_url` when available;
- `credit_line`;
- `status = draft`.

Use `event_date` for exact anniversaries and `event_year` for year-only history.

### Step 5 — Choose placement fields

Pick only approved section keys from the placement reference.

For a first story, a conservative placement set is usually:

- `archive`;
- `search`;
- `library` when the story is appropriate for members;
- `homepage_milestones` only when the event date/year supports milestone use.

Do not add new section keys during the tutorial.

### Step 6 — Add media notes or associations

If the story has media:

- identify the media/photo record or upload candidate;
- choose the role, such as primary image or newspaper source;
- add alt text and caption when public display is expected;
- record media-specific source and credit when different from the story.

If media is not ready, leave the story as draft or under review rather than
publishing with missing required media context.

### Step 7 — Submit for review

Ask the reviewing editor to verify:

- the source supports the story text;
- the credit line is complete;
- canonical or alternate status is correct;
- placement is appropriate;
- rotation metadata is not exaggerated;
- media decisions are documented;
- search text can be generated from approved fields.

### Step 8 — Record the result

After review, record one of these outcomes:

- approved for publication;
- needs source or credit follow-up;
- should become an alternate perspective;
- should merge into an existing canonical row;
- should remain draft;
- should be rejected or retained in queue when it came from a submission.

## Steps Summary

1. Choose a simple sourced story.
2. Gather attribution.
3. Search for existing inventory.
4. Create the draft row.
5. Set allowed sections and priority.
6. Add media context when available.
7. Submit for manual review.
8. Record the review outcome.

## Next Reading

- `docs/how-to/website/add-content-story.md`
- `docs/how-to/website/add-content-media.md`
- `docs/how-to/website/review-content-submission.md`
- `docs/how-to/website/publish-update-content.md`
- `docs/reference/website/content-inventory-model.md`
- `docs/reference/website/editorial-placement-and-rotation.md`
