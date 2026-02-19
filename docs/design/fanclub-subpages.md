# FanClub Sub-Page Specifications — LGFC

# purpose of this page
Covers all four FanClub sub-pages: 
photo gallery (3-column grid, tag filters, submit flow)
library (tabular list with year/author/title)
memorabilia (grid + tag filters + Library cross-links)


Covers: `/fanclub/photo`, `/fanclub/library`, `/fanclub/memorabilia`, `/fanclub/myprofile`

All pages:

- Require login (`/fanclub/**` auth boundary)
- Unauthenticated access redirects to `/`
- Use the FanClub header
- Desktop only — mobile/tablet implementation is deferred

-----

## Shared FanClub Page Layout

```
[FanClub Header]
[Page Container — 1200px max, 20px padding]
  [Page Title — H1]
  [Keyword Search Bar]
  [Content Area]
[Global Footer]
```

-----

-----

# `/fanclub/photo` — Photo Gallery

**Purpose:** Thumbnail gallery of approved fan club photos. Tag-based and
keyword searchable. Members can submit photos for admin approval.

## Page Layout

```
[H1: "Photo Gallery"]
[Search Bar]
[Tag Filter Bar]
[Photo Grid]
[Submit a Photo CTA]
```

## Search Bar

- Placeholder: `"Search photos…"`
- Filters by tag and description text
- Executes on submit (Enter or button click)
- URL param: `?q=keyword`

## Tag Filter Bar

A horizontal row of pill buttons, one per available tag category (populated
from approved photo tags in D1). Examples: “1927 Yankees”, “World Series”,
“Portrait”, “Action”.

- Active tag highlighted with LGFC Blue background
- Multiple tags selectable simultaneously (AND filter)
- “All” pill resets to no tag filter

## Photo Grid

- Grid layout: 3 columns desktop
- Each cell: thumbnail image + caption below
- Thumbnail: square crop, `300×300px` display size, served from B2
- Caption: photo title or description snippet, `13px`, color `#666666`
- Clicking thumbnail opens a lightbox / detail view (modal or dedicated route
  — implementation detail)

### Empty State

If no photos match search/filter:

> “No photos match your search.”

## Submit a Photo

Below the grid:

> “Have a photo to share? [Submit a Photo →]”

Submission flow: member uploads photo, which is hidden pending admin approval.
Upload mechanics are an implementation detail (not specified here).

## Data

- `GET /api/fanclub/photos?q=keyword&tags=tag1,tag2&page=N`
- Permission: member session required
- Returns approved photos only
- Fields: `id`, `b2_key`, `thumbnail_url`, `title`, `description`, `tags`, `uploaded_by`

-----

-----

# `/fanclub/library` — Library

**Purpose:** Curated reading list of articles, essays, and historical materials
related to Lou Gehrig.

## Page Layout

```
[H1: "Gehrig Library"]
[Search Bar]
[Library Table / List]
```

## Search Bar

- Placeholder: `"Search library…"`
- Filters by title, author, description
- URL param: `?q=keyword`

## Library List

Tabular list view (not a grid — text-heavy content):

|Year|Author|Title|Description  |
|----|------|-----|-------------|
|1939|…     |…    |Short snippet|

- Rows sorted by year descending (most recent first) by default
- Title is a link to the full entry detail view or external URL if applicable
- Description: truncated at ~100 characters
- Row hover: subtle background highlight `#f8f9ff`
- Border between rows: `1px solid #e8ecf5`

### Empty State

> “No library entries match your search.”

## Data

- `GET /api/fanclub/library?q=keyword&page=N`
- Permission: member session required
- Fields: `id`, `year`, `author`, `title`, `description`, `url` (optional external link),
  `content` (optional stored text)

-----

-----

# `/fanclub/memorabilia` — Memorabilia Archive

**Purpose:** Thumbnail gallery of memorabilia items (cards, equipment,
ephemera, etc.) with descriptions. Linked to Library for longer documentation.

## Page Layout

```
[H1: "Memorabilia Archive"]
[Search Bar]
[Tag Filter Bar]
[Memorabilia Grid]
```

## Search Bar

- Placeholder: `"Search memorabilia…"`
- Filters by tag, title, description
- URL param: `?q=keyword`

## Tag Filter Bar

Same pill-button pattern as Photo Gallery. Example tags: “Baseball Card”,
“Signed”, “1927”, “Equipment”, “Program”.

## Memorabilia Grid

- Grid layout: 3 columns desktop
- Each cell: thumbnail image + item title below
- Thumbnail: served from B2, constrained to `300×300px`
- Clicking item opens detail view showing:
  - Larger image
  - Full title and description
  - Tags
  - Link to Library entry if associated long-form documentation exists

### Empty State

> “No memorabilia items match your search.”

## Data

- `GET /api/fanclub/memorabilia?q=keyword&tags=tag1,tag2&page=N`
- Permission: member session required
- Fields: `id`, `b2_key`, `thumbnail_url`, `title`, `description`, `tags`,
  `library_id` (optional link to library entry)

-----

-----

# `/fanclub/myprofile` — My Profile

**Purpose:** Member profile view and edit page. Also hosts the membership

## Page Layout

```
[H1: "My Profile"]

[Profile Section]
  [Member fields — editable]
  [Save / Cancel buttons]

[Membership Card Section]
  [Section heading: "Membership Card"]
  [Card instructions — from canonical content]
  [Card front image]
  [Card back image]
```

## Profile Section

### Editable Fields

|Field          |Type    |Required|Notes                                                        |
|---------------|--------|--------|-------------------------------------------------------------|
|First name     |text    |Yes     |                                                             |
|Last name      |text    |Yes     |                                                             |
|Screen name    |text    |No      |Display name used in club                                    |
|Email address  |email   |Yes     |                                                             |
|Email opt-in   |checkbox|—       |Opt in/out of communications                                 |
|Profile picture|selector|No      |Selected from approved gallery images only; no member uploads|

### Profile Picture Selector

- Displays a grid of gallery images approved for profile use
  (`profile-avatar-eligible` tag)
- Member clicks to select; currently selected image is highlighted
- No file upload — selection only

### Save / Cancel

- **Save:** Persists all field changes to D1
- **Cancel:** Discards unsaved changes, reverts fields to last saved state
- Buttons appear below the form fields
- Save button: primary style (LGFC Blue)
- Cancel button: secondary style (white, blue border)

### Member UUID

Each member has an internal UUID for lookups. This UUID is never displayed
on the profile page.

-----

## Membership Card Section

Displayed below the profile section, separated by a horizontal rule.

### Content

- Section heading (H2): “Membership Card”
- Canonical copy: sourced from `docs/MembershipCard.MD` (the authoritative
  content file). This text is managed via the admin CMS
  (Admin → Membership Card Content).
- Card front image
- Card back image

### Purpose

Provides members with instructions for obtaining and using their
membership card. Content is admin-managed and updated via CMS, not
hardcoded in the component.

-----

## Data

- Member profile: `GET /api/fanclub/profile` (reads current member session)
- Save: `POST /api/fanclub/profile` with updated fields
- Membership card content: `GET /api/content/membercard` (returns canonical
  card copy from D1 `membership_card_content` table)
- Profile picture options: `GET /api/photos?eligible=profile-avatar`

-----

## Implementation Notes

- Client component (`'use client'`) for form state and Save/Cancel behavior
- Member session required; unauthenticated redirects to `/`
- Screen name and email changes take effect immediately on save
- Profile picture change takes effect immediately on save (no separate upload step)
