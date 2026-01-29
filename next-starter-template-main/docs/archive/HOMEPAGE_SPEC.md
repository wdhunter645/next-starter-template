# Homepage Specification

This document specifies the exact structure and sections of the homepage (`/`).

## Purpose

The homepage serves as the public front page for the Lou Gehrig Fan Club website, focusing on storytelling, engagement, and member recruitment.

## Section Order (Top to Bottom)

All sections must appear in this exact order:

1. **Hero Banner**
2. **Weekly Photo Matchup**
3. **Join / Login CTA**
4. **Social Wall**
5. **Member Posts Preview**
6. **Milestone Highlight**
7. **Friends of the Fan Club**
8. **Events Calendar**
9. **Footer**

## Section Specifications

### 1. Hero Banner

**Location:** Immediately below header  
**Component:** `<div className={styles.hero}>`

```tsx
// Section marker: Hero Banner
<div className={styles.hero}>
  <div className={styles.container}>
    <h1 className={styles.title}>Lou Gehrig Fan Club</h1>
    <p className={styles.subtitle}>
      Honoring the legacy of baseball's Iron Horse through community, 
      education, and support for ALS research.
    </p>
  </div>
</div>
```

**Visual Properties:**
- Height: 480px desktop / 360px tablet / 280px mobile
- Width: 100vw (edge-to-edge)
- Background: Rotating Gehrig images (auto-fade 5s)
- Text: H1 + H3 centered; white with text-shadow for contrast
- CTA: "Join the Club" button → `/member/join`

### 2. Weekly Photo Matchup

**Component:** `<WeeklyMatchup />`

```tsx
// Section marker: Weekly Photo Matchup
<WeeklyMatchup />
```

**Purpose:** Weekly engagement through photo voting  
**Data:** `matchups`, `votes` tables  
**Interaction:** Hover glow; click to vote  
**Refresh:** Weekly; results hidden until Sunday

### 3. Join / Login CTA

**Component:** `<JoinLogin />`

```tsx
// Section marker: Join/Login CTA
<JoinLogin />
```

**Purpose:** Primary conversion point for authentication  
**Content:** Centered H2 + buttons ("Join Now", "Login")  
**Height:** 160px  
**Background:** Linear gradient `#f9f7f4` → `#ffffff`

### 4. Social Wall

**Component:** `<SocialWall />`

```tsx
// Section marker: Social Wall
<SocialWall />
```

**Purpose:** Display social proof and cross-platform visibility  
**Implementation:** Elfsight social feed embed  
**Behavior:** Lazy-load (below fold)

### 5. Member Posts Preview

**Component:** `<MemberPostsPreview />`

```tsx
// Section marker: Member Posts Preview
<MemberPostsPreview />
```

**Purpose:** Preview member-generated content  
**Data:** `posts` where `kind IN ('news','qna')`  
**Layout:** 3-column responsive grid  
**Card Size:** 280px–320px width, 340px height

### 6. Milestone Highlight

**Component:** `<MilestoneTeaser />`

```tsx
// Section marker: Milestone Highlight
<MilestoneTeaser />
```

**Purpose:** Feature historical Lou Gehrig milestones  
**Height:** 240px  
**Background:** `--color-primary` (navy)  
**Text:** White, center aligned  
**Button:** "View All Milestones" → `/milestones`

### 7. Friends of the Fan Club

**Component:** `<FriendsOfFanClub />`

```tsx
// Section marker: Friends of the Fan Club
<FriendsOfFanClub />
```

**Purpose:** Display partner/sponsor logos  
**Layout:** Carousel / horizontal scroll  
**Item Size:** 100 × 100px logos  
**Spacing:** 24px between items

### 8. Events Calendar

**Component:** `<EventsCalendar />`

```tsx
// Section marker: Events Calendar
<EventsCalendar />
```

**Purpose:** Display upcoming events  
**Height:** 400px desktop / auto mobile  
**Component:** Grid calendar (7 × 5 cells)  
**Data:** `events` table  
**Interaction:** Click → `/calendar/[event-id]`

### 9. Footer

**Component:** Standard global footer (see layout specification)

```tsx
// Section marker: Footer (handled by layout)
```

**Content:** Privacy · Terms · Admin · Email  
**Copyright:** "© YYYY Lou Gehrig Fan Club"

## Implementation Requirements

### JSX Section Markers

Each section MUST include a JSX comment marker for navigation and spec enforcement:

```tsx
{/* Section: [Section Name] */}
<ComponentName />
```

### Component Order

Components must render in the exact order specified above. Do not reorder sections unless explicitly authorized by the parent issue.

### Styling Guidelines

- Use CSS Modules for component-specific styles
- Follow the design tokens in `docs/Design-spec.md`
- Maintain responsive breakpoints: 375px, 768px, 1024px, 1280px
- No layout shift (CLS ≤ 0.01)

### Header Requirements

**Fixed Top Navigation:**
- Left: LGFC logo → "/"
- Right: About · Store · Search · Login (exact order)
- Remove any middle/full-width nav elements
- Keep the 4 items on the right in order

### Accessibility

- All images include alt text
- Color contrast ≥ 4.5:1
- Keyboard focus ring visible on interactive elements
- Lighthouse ≥ 95 performance/accessibility

## Acceptance Criteria

- [ ] All sections render in exact order 1-9
- [ ] JSX section markers present for each section
- [ ] Header compacted to 64px desktop / 48px mobile
- [ ] Hero full-width, edge-to-edge, flush under header
- [ ] Fully responsive at all breakpoints
- [ ] No Tailwind CSS (CSS Modules only)
- [ ] All colors match design tokens
- [ ] No layout shift

## Related Documentation

- Full design specification: [docs/Design-spec.md](./Design-spec.md)
- Development setup: [docs/START_HERE.md](./START_HERE.md)
- Deployment guide: [docs/DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**Last Updated:** 2025-11-03  
**Status:** Locked specification (do not modify without parent issue approval)
