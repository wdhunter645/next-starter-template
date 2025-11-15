# Lou Gehrig Fan Club — Full Website Design Specification  
*(Comprehensive visual, structural, and functional reference — locked production design, v2025-11-03)*

---

## 1. Global Visual & Technical Standards

### Framework
- **Architecture:** Next.js 14 (App Router)
- **Deployment Targets:**  
  - Cloudflare Pages — production  
  - Vercel — members-area mirror
- **Authentication:** Supabase magic link via `@supabase/auth-helpers-nextjs`
- **Database:** Supabase (PostgreSQL) with RLS; tables include `photos`, `quotes`, `matchups`, `votes`, `charities`, `milestones`, `posts`, `events`, `media_assets`
- **Media Handling:** Backblaze B2 (S3-compatible presign endpoints)

### Design Language
| Token | Purpose | Value |
|-------|----------|-------|
| `--color-primary` | Brand navy | `#0b3a75` |
| `--color-accent` | Heritage red | `#b22222` |
| `--color-bg` | Off-white cream | `#f9f7f4` |
| `--color-text` | Neutral black | `#222222` |
| `--color-muted` | Subtext gray | `#666666` |
| `--color-border` | Light gray border | `#e0e0e0` |
| `--font-head` | Serif headline | `"Georgia", "Times New Roman", serif` |
| `--font-body` | Sans-serif body | `"Helvetica Neue", Arial, sans-serif` |
| `--site-max` | Max content width | `1200px` |

### Layout Grid
- **Content width:** 100% viewport ≤ `--site-max`
- **Column grid:** 12-column fluid grid (8px baseline)
- **Gutters:** 16px mobile / 24px tablet / 32px desktop
- **Vertical rhythm:** 8px base unit
- **Breakpoints:**
  - Mobile ≤ 480 px  
  - Tablet 481–768 px  
  - Small desktop 769–1199 px  
  - Large desktop ≥ 1200 px

### Typography Scale
| Type | Font | Size | Weight | Line-Height |
|------|------|------|---------|-------------|
| H1 | `--font-head` | 2.25 rem (36 px) | 700 | 1.2 |
| H2 | `--font-head` | 1.75 rem (28 px) | 700 | 1.3 |
| H3 | `--font-body` | 1.25 rem (20 px) | 600 | 1.4 |
| Body | `--font-body` | 1 rem (16 px) | 400 | 1.5 |
| Small | `--font-body` | 0.875 rem (14 px) | 400 | 1.5 |

---

## 2. Global Layout Structure

### Header
**Role:** Persistent navigation banner appearing on all pages.

| Element | Property | Value |
|----------|-----------|-------|
| Overall height (desktop) | 64 px | compacted from ~120 px original |
| Overall height (mobile) | 48 px | |
| Background | `var(--color-bg)` | |
| Border bottom | 1 px solid `var(--color-border)` | |
| Padding | 8 px top / 8 px bottom | |
| Layout | Flex — `space-between`, center aligned | |
| Z-index | 10 | |
| Font | `--font-body`, 16 px | |

**Content:**
- **Left:** LGFC logo / text link to `/`
- **Right nav:** About, Store, Search, Login
- **Hover color:** `--color-accent`
- **Active underline:** 2 px solid `--color-accent`

### Footer
| Property | Value |
|-----------|-------|
| Height | ~80 px desktop / 100 px mobile |
| Background | `var(--color-bg)` |
| Border top | 1 px solid `var(--color-border)` |
| Padding | 24 px vertical |
| Text | 14 px muted gray |
| Links | Privacy / Terms / Admin + Email |

### Notice Bar (optional)
| Property | Value |
|-----------|-------|
| Height | 28 px |
| Background | `--color-accent` |
| Text color | `#ffffff` |
| Font | 14 px |
| Behavior | Hidden by default; slides down when active |

---

## 3. Homepage (`/`)

### Purpose
Public front page for storytelling, engagement, and member recruitment.

### Section Map

#### 1. Hero Banner
| Property | Value |
|-----------|-------|
| Position | Immediately below header |
| Height | 480 px desktop / 360 px tablet / 280 px mobile |
| Width | 100 vw (edge-to-edge) |
| Background | Rotating Gehrig images (auto-fade 5 s) |
| Overlay | Linear gradient top→bottom (black 0.4 opacity → transparent) |
| Text | H1 + H3 centered; white text-shadow for contrast |
| CTA | “Join the Club” button → `/member/join` |
| Button style | 18 px padding x 36 px radius 6 px background `--color-accent` hover→`#941b1b` |

#### 2. Weekly Photo Matchup
| Property | Value |
|-----------|-------|
| Height | 360 px desktop / auto mobile |
| Background | `--color-bg` |
| Layout | 2-column grid (image A vs image B) |
| Spacing | 24 px gutter |
| Interaction | Hover glow; click→vote |
| Data | `matchups`, `votes` tables |
| Refresh | Weekly; results hidden until Sunday |

#### 3. Join / Login CTA
| Height | 160 px |
| Background | Linear gradient `#f9f7f4` → `#ffffff` |
| Content | Centered H2 + buttons (“Join Now”, “Login”) |
| Buttons | Accent color, 16 px font, 6 px radius |

#### 4. Social Wall
| Height | Variable (auto) |
| Embed | Elfsight social feed `<div class="elfsight-app-…">` |
| Lazy-load | Yes (below fold) |
| Background | `--color-bg` |

#### 5. Member Posts Preview
| Card width | 280 px–320 px |
| Card height | 340 px |
| Layout | 3-column responsive grid |
| Data | `posts` where `kind IN ('news','qna')` |
| Includes | Title, image, 2-line excerpt, “Read More” link |
| Hover | Lift + shadow 0 2 8 rgba(0,0,0,0.15) |

#### 6. Milestone Highlight
| Height | 240 px |
| Background | `--color-primary` |
| Text | white; center aligned |
| Content | Single milestone (title, year, short text) |
| Button | “View All Milestones” → `/milestones` |

#### 7. Friends of the Fan Club
| Height | 200 px |
| Layout | Carousel / horizontal scroll |
| Item size | 100 × 100 px logos |
| Background | `#ffffff` |
| Spacing | 24 px |

#### 8. Events Calendar
| Height | 400 px desktop / auto mobile |
| Background | `--color-bg` |
| Component | Grid calendar (7 × 5 cells) |
| Highlight | Accent ring for event dates |
| Data | `events` table |
| Click | → `/calendar/[event-id]` |

#### 9. Footer
Standard global footer (see §2).

---

## 4. Members Homepage (`/member`)

### Purpose
Authenticated user hub for participation, archives, and recognition.

### Layout Map

#### 1. Member Welcome Panel
| Height | 200 px |
| Background | `--color-primary` |
| Text | “Welcome back, {Name}!” in white |
| Dynamic image | Random member-submitted photo |
| Overlay gradient | `rgba(0,0,0,0.3)` bottom fade |

#### 2. Today’s Highlights
| Layout | 2-column grid |
| Height | ~300 px |
| Data | `posts` where `featured = true` |
| Cards | Thumbnail + headline + excerpt |

#### 3. Gehrig Timeline
| Type | Interactive scroll |
| Height | auto |
| Data | `milestones` ordered ASC |
| Visual | Vertical timeline w/ year markers and modal popups |
| Color | Navy bar left, accent dots per event |

#### 4. Photo & Memorabilia Archive
| Layout | Masonry / 4-column desktop / 2 mobile |
| Card size | Variable; max 280 px wide |
| Hover | Zoom + caption fade-in |
| Data | `photos`, `media_assets` |
| Backend | Presigned URLs from B2 |
| Member actions | Favorite / Tag / Download (if allowed) |

#### 5. Member Q&A / Forum
| Layout | Thread list |
| Height | auto |
| Data | `posts` where `kind='qna'` |
| Interaction | Comment/reply via Supabase RPC |
| Sort | Latest activity descending |

#### 6. Recognition Board
| Height | 300 px |
| Background | `#fff7f7` |
| Content | Top contributors table (name / points / charity) |
| Data | Aggregated from `votes` + `charities` |
| Highlight | Top 3 rows accent-colored |

#### 7. Upcoming Events
| Height | 240 px |
| Data | Next 3 events from `events` table |
| Layout | Card row |
| Button | “View Full Calendar” → `/calendar` |

#### 8. Footer
Standard footer + “Sign Out” link when logged in.

---

## 5. Interaction & Animation Standards
| Element | Animation | Timing |
|----------|------------|--------|
| Hero image rotate | cross-fade opacity | 1 s |
| Buttons hover | color shift + shadow | 0.2 s |
| Cards hover | translateY(-4 px) + shadow | 0.15 s |
| Dropdowns | fade + scale-in | 0.2 s |
| Notice bar reveal | slide-down | 0.25 s |

---

## 6. Accessibility & Performance
- All images include alt text.  
- Header and hero maintain ≥ 4.5:1 color contrast.  
- Keyboard focus ring visible on all interactive elements.  
- Lighthouse ≥ 95 performance / accessibility targets.  
- Lazy-load noncritical images below fold.  
- Fonts preloaded via `<link rel="preload">`.

---

## 7. Page-Specific Use Cases

| Section | Audience | Goal | Output |
|----------|-----------|------|--------|
| Hero | Public | First impression | Convert to Join |
| Weekly Matchup | All | Engagement | Votes stored in `votes` |
| Join/Login | Public | Auth flow entry | Session creation |
| Social Wall | Public | Social proof | Cross-platform visibility |
| Member Posts | All | Read content | News/Q&A |
| Milestones | All | Education | Historical context |
| Friends | All | Credibility | Partner exposure |
| Calendar | All | Participation | Event awareness |
| Dashboard | Members | Retention | Personalized experience |

---

## 8. V6 Homepage Invariants (Non-Negotiable Contract)

The following homepage structural requirements are **locked and enforced by automated tests** (`tests/homepage-structure.test.tsx`). Any PR attempting to violate these invariants will fail CI.

### Required Sections (in order)

1. **Hero Banner** — Must contain `<h1>` with "Welcome to the Lou Gehrig Fan Club!"
2. **Weekly Photo Matchup** — Must contain `<h2>` with "Weekly Photo Matchup. Vote for your favorite!"
3. **Join/Login CTA** — Must contain membership call-to-action text
4. **Social Wall** — Must contain `<h2>` with "Social Wall" and description of social platforms
5. **Recent Club discussions** — Must contain `<h2>` with "Recent Club discussions"
6. **Friends of the Fan Club** — Must contain `<h2>` with "Friends of the Fan Club"
7. **Events Calendar** — Must contain `<h2>` with "Calendar"
8. **FAQ and Milestones** — Must contain both `<h2>` with "FAQ" and `<h2>` with "Milestones"
9. **Footer** — Standard global footer (handled by layout)

### Enforcement Rules

- **Section Order:** Sections must appear in DOM order exactly as listed above.
- **Heading Visibility:** Each section must have a visible heading matching the specified text.
- **No Removal:** Sections cannot be removed without explicit authorization and test updates.
- **No Reordering:** Section order cannot be changed without explicit authorization and test updates.

### Making Approved Changes

If a PR has explicit authorization to modify homepage structure:

1. **Update this document** with the new invariant specification
2. **Update `tests/homepage-structure.test.tsx`** to match the new structure
3. **Update `/docs/HOMEPAGE_SPEC.md`** with detailed implementation changes
4. **Reference the authorization** (issue number, governance decision) in the PR description

**Rationale:** These invariants prevent homepage drift (Audit #2) and ensure a single source of truth that cannot be violated accidentally through misapplied PRs (Audit #5). The v6 specification is now the enforced standard.

---

## 9. Acceptance Criteria
1. Header compacted to 64 px desktop / 48 px mobile, zero gap above hero.  
2. Hero full-width, edge-to-edge, flush under header.  
3. Homepage sections render in order 1–9 exactly as mapped.  
4. Member homepage restricted by Supabase session.  
5. No Tailwind; only plain CSS.  
6. All colors match tokens; fonts load correctly.  
7. No layout shift (CLS ≤ 0.01).  
8. Fully responsive at 375 px, 768 px, 1024 px, 1280 px.  

---

**Commit Message**  
