# LGFC Locked Design Specification

**Status:** LOCKED - IMMUTABLE BASELINE  
**Effective Date:** 2026-01-25  
**Authority:** Repository Owner (@wdhunter645)  
**Purpose:** Immutable design baseline for automated drift detection and governance

---

## Overview

This document defines the **locked design specification** for the Lou Gehrig Fan Club (LGFC) website. These design elements are **immutable** and must not be changed without explicit governance approval. Any deviation from this specification is considered drift and must be rejected or remediated.

This specification serves as the baseline for:
- Automated drift detection
- Design compliance validation
- Code review standards
- Regression test boundaries

---

## Table of Contents

1. [Color Tokens](#color-tokens)
2. [Typography](#typography)
3. [Layout Standards](#layout-standards)
4. [Navigation Design](#navigation-design)
5. [Component Specifications](#component-specifications)
6. [Route Structure](#route-structure)
7. [Behavioral Locks](#behavioral-locks)

---

## Color Tokens

### Primary Colors (LOCKED)

**LGFC Blue (PRIMARY):**
- Token: `--lgfc-blue`
- Hex: `#0033cc`
- RGB: `rgb(0, 51, 204)`
- Usage: Primary brand color, buttons, headers, accents
- **Validation:** All tests must verify computed color equals `rgb(0, 51, 204)`

**Background:**
- Token: `--background-color`
- Hex: `#ffffff`
- RGB: `rgb(255, 255, 255)`
- Usage: Page background, card backgrounds

**Text:**
- Token: `--text-color`
- Hex: `#333333`
- RGB: `rgb(51, 51, 51)`
- Usage: Body text, default text color

**Secondary Text:**
- Token: `--text-secondary`
- Hex: `#666666`
- RGB: `rgb(102, 102, 102)`
- Usage: Supplementary text, captions, metadata

### Prohibited Actions

❌ **NEVER:**
- Change `--lgfc-blue` value from `#0033cc`
- Use alternative blue shades for primary actions
- Apply primary color to non-branded elements
- Override color tokens in component styles

✅ **ALWAYS:**
- Reference color via CSS custom property
- Validate color in tests using computed RGB values
- Document any new color additions with governance approval

---

## Typography

### Font Stack (LOCKED)

**Primary Font:**
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**Monospace (for code):**
```css
font-family: "Courier New", Courier, monospace;
```

### Type Scale (LOCKED)

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| H1 | 2.5rem (40px) | 700 | 1.2 | Page titles |
| H2 | 2rem (32px) | 700 | 1.3 | Section headers |
| H3 | 1.5rem (24px) | 600 | 1.4 | Subsection headers |
| H4 | 1.25rem (20px) | 600 | 1.4 | Minor headers |
| Body | 1rem (16px) | 400 | 1.6 | Body text |
| Small | 0.875rem (14px) | 400 | 1.4 | Captions, metadata |

### Text Locks

**Weekly Photo Matchup Title:**
- Exact text: "Weekly Photo Matchup. Vote for your favorite!"
- Must appear exactly once on homepage
- Color: `--lgfc-blue` / `rgb(0, 51, 204)`
- **Validation:** E2E tests enforce exact text and color

**Join Banner Copy:**
- Exact text: "Become a member. Get access to the Gehrig library, media archive, memorabilia archive, group discussions, and more."
- Must appear exactly once on homepage
- Background color: `--lgfc-blue` / `rgb(0, 51, 204)`
- **Validation:** E2E tests enforce exact text and background color

---

## Layout Standards

### Section Spacing (LOCKED)

**Section Gap:**
- CSS class: `.section-gap`
- Value: `3rem` (48px)
- Applied to: All major homepage sections
- Required sections:
  - Weekly Photo Matchup
  - Join Banner
  - Social Wall
  - FAQ
  - Milestones

### Container Widths (LOCKED)

**Maximum Content Width:**
- Desktop: `1200px`
- Tablet: `100%` with `2rem` padding
- Mobile: `100%` with `1rem` padding

### Responsive Breakpoints (LOCKED)

```css
/* Mobile first approach */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small desktops */
--breakpoint-xl: 1280px;  /* Large desktops */
```

---

## Navigation Design

### Visitor Header (Public Pages)

**Not Logged In:**
- Buttons (left to right): Join, Search, Store, Login
- Logo: Left-aligned, links to `/`
- Hamburger: Right-aligned (mobile only)

**Logged In (on public pages):**
- Buttons: Join, Search, Store, Club Home, Logout
- Logo: Left-aligned, links to `/`
- Hamburger: Right-aligned (mobile only)

**Sticky Behavior:**
- Buttons + Hamburger: Sticky
- Logo: NOT sticky (scrolls away)

### Member Header (Members-Only Pages)

**Always displays:**
- Buttons: Club Home, My Profile, Search, Store, Logout
- Logo: Left-aligned, links to `/`
- All buttons sticky

### Footer (LOCKED)

**Left Section:**
- Quote line: "The Lou Gehrig Fan Club celebrates the life and legacy of Lou Gehrig"
- Legal line: "© 2026 Lou Gehrig Fan Club. All rights reserved."

**Center Section:**
- Small logo
- Scroll-to-top functionality
- Stays on current page

**Right Section (links, in order):**
1. Contact → `/contact`
2. Support → `/support`
3. Terms → `/terms`
4. Privacy → `/privacy`

**Prohibited:**
- Email display in footer
- Social media icons (use Social Wall instead)
- Additional links without governance approval

---

## Component Specifications

### Social Wall (LOCKED)

**Critical Configuration:**
- Platform Script: `https://elfsightcdn.com/platform.js` (NOT static.elfsight.com)
- Script Loading: Global in `src/app/layout.tsx` with `strategy="beforeInteractive"`
- Widget Container Class: `elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8`
- Lazy Load Attribute: `data-elfsight-app-lazy` (REQUIRED)
- Fallback Text: "Loading social content..." (REQUIRED)

**Component Location:**
- File: `src/components/SocialWall.tsx`
- Homepage position: After Join Banner, before Recent Discussion

**Documentation Sync:**
- Changes to Social Wall MUST update both:
  1. `src/components/SocialWall.tsx`
  2. `/docs/lgfc-homepage-legacy-v6.html` (Social Wall subsection)

**Validation:**
- Test must verify widget container class exists
- Test must verify section is not empty
- Test must verify fallback text exists

### Weekly Vote (LOCKED)

**Section Requirements:**
- Title: "Weekly Photo Matchup. Vote for your favorite!"
- Two photo options displayed side by side
- Vote buttons below each photo
- Results page: `/weeklyvote` (hidden until vote cast)

**Styling:**
- Title color: `--lgfc-blue`
- Photos: Equal width, responsive
- Vote buttons: Primary button style

### Join Banner (LOCKED)

**Text Content:**
- Exact copy: "Become a member. Get access to the Gehrig library, media archive, memorabilia archive, group discussions, and more."
- Background: `--lgfc-blue` / `rgb(0, 51, 204)`
- Text color: White
- Buttons: Join + Login (both visible and clickable)

**Layout:**
- Full-width banner
- Centered text
- Buttons side by side (desktop) or stacked (mobile)

**Link Targets:**
- Join button → `/join` (NEVER `/member`)
- Login button → `/login` (NEVER `/member`)

---

## Route Structure

### Public Routes (LOCKED)

**Required Public Routes:**
```
/                    - Visitor home (src/app/page.tsx)
/join                - Membership signup
/login               - Member login
/contact             - Contact page
/support             - Support page
/terms               - Terms of service
/privacy             - Privacy policy
/search              - Search functionality
/faq                 - FAQ page
/health              - Health check endpoint
/weeklyvote          - Weekly vote results (accessible after voting)
```

### Members-Only Routes (LOCKED)

**Required Member Routes:**
```
/member              - Member home (requires login)
/member/profile      - Member profile
```

### Admin Routes (LOCKED)

**Required Admin Routes:**
```
/admin               - Admin dashboard (requires member login + admin role)
```

### Forbidden Routes (LOCKED)

**Routes that MUST NOT exist:**
```
/store               - External link only (Bonfire)
/member/login        - Use /login instead
```

### External Links (LOCKED)

**Store:**
- URL: `https://www.bonfire.com/store/lou-gehrig-fan-club/`
- Opens in new tab
- No internal `/store` route

---

## Behavioral Locks

### Authentication Flow (LOCKED)

**Login Process:**
1. User visits `/login`
2. Enters email
3. On success: Redirect to `/member`
4. Email stored in `localStorage` as `lgfc_member_email`

**Logout Process:**
1. User clicks Logout (any page)
2. Clear `lgfc_member_email` from localStorage
3. Redirect to `/` (visitor home)

**Member Access:**
- `/member/**` routes check for `lgfc_member_email`
- Missing session → Redirect to `/login`
- Valid session → Render member content

**Admin Access:**
1. Check member login state (`lgfc_member_email` exists)
2. If not logged in → Prompt to login
3. If logged in, check admin role
4. Not admin → "Access Denied" with link to `/member`
5. Is admin → Render admin dashboard

### Header State Logic (LOCKED)

**Visitor Header (public pages):**
```javascript
const isLoggedIn = localStorage.getItem('lgfc_member_email') !== null;
// Show Join, Search, Store, Login (not logged in)
// Show Join, Search, Store, Club Home, Logout (logged in)
```

**Member Header (member pages):**
```javascript
// Always show: Club Home, My Profile, Search, Store, Logout
// Logo always links to /
```

**Admin Routes:**
```javascript
const isLoggedIn = localStorage.getItem('lgfc_member_email') !== null;
// If logged in → Use Member Header
// If not logged in → Use Visitor Header
```

### Social Wall Rendering (LOCKED)

**Script Loading:**
```typescript
// In src/app/layout.tsx
<Script
  src="https://elfsightcdn.com/platform/platform.js"
  strategy="beforeInteractive"
/>
```

**Component Implementation:**
```typescript
// In src/components/SocialWall.tsx
<div className="elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8" 
     data-elfsight-app-lazy>
  Loading social content...
</div>
```

---

## Validation Requirements

### Automated Tests (REQUIRED)

All locked design elements MUST have corresponding automated tests:

**Color Validation:**
```typescript
const weeklyTitle = await page.locator('h2:has-text("Weekly Photo Matchup")');
const color = await weeklyTitle.evaluate(el => 
  window.getComputedStyle(el).color
);
expect(color).toBe('rgb(0, 51, 204)');
```

**Text Validation:**
```typescript
const weeklyTitle = await page.textContent('h2:has-text("Weekly Photo Matchup")');
expect(weeklyTitle).toBe('Weekly Photo Matchup. Vote for your favorite!');
```

**Component Validation:**
```typescript
const socialWall = await page.locator('.elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8');
expect(await socialWall.count()).toBe(1);
```

### Manual Review (REQUIRED)

For PRs touching locked elements:
- Visual review on staging
- Cross-browser testing (Chrome, Firefox, Safari)
- Responsive testing (mobile, tablet, desktop)
- Accessibility validation (WCAG 2.1 AA)

---

## Governance Process

### Proposing Changes to Locked Design

Changes to locked design elements require:

1. **Written proposal** documenting:
   - Element to change
   - Current state
   - Proposed state
   - Business justification
   - Impact assessment

2. **Review process:**
   - Submit proposal to repository owner
   - Design review meeting
   - Decision: Approve, Reject, or Defer

3. **Approval requirements:**
   - Repository owner sign-off
   - Documentation update plan
   - Test update plan
   - Rollback plan

4. **Implementation:**
   - Update this specification
   - Update tests
   - Update documentation
   - Create PR with governance tag

### Emergency Unlocks

In case of critical issues requiring immediate unlock:

1. Document emergency justification
2. Get repository owner approval
3. Make minimal necessary change
4. Create follow-up PR to restore lock or update spec
5. Document in `/docs/drift-log.md`

---

## Drift Detection

### Automated Drift Detection

The following workflows detect drift from this specification:

1. **Drift Gate** (`.github/workflows/drift-gate.yml`)
   - Runs on every PR
   - Validates ZIP prohibition
   - Checks PR intent allowlist
   - Verifies LGFC invariants

2. **Assessment Harness** (`npm run assess`)
   - Validates routes
   - Checks navigation invariants
   - Verifies page markers
   - Enforces footer structure

3. **Design Compliance** (`.github/workflows/design-compliance-warn.yml`)
   - Warns on missing template sections
   - Detects undocumented changes
   - Never blocks PRs (warn-only)

4. **Homepage Tests** (`npm run test:homepage-sections`)
   - Validates section visibility
   - Checks V6 token compliance
   - Verifies Social Wall presence

### Drift Remediation

When drift is detected:

1. **Assess severity:**
   - P0: Breaks core functionality → Rollback immediately
   - P1: Violates design lock → Fix within 24 hours
   - P2: Minor deviation → Schedule fix

2. **Create fix PR:**
   - Reference drift detection issue
   - Include regression test
   - Update documentation if spec changed

3. **Document:**
   - Update `/docs/drift-log.md`
   - Record root cause
   - Document prevention measures

---

## References

**Primary Authority:**
- `/docs/LGFC-Production-Design-and-Standards.md` - Complete design standards
- `/docs/NAVIGATION-INVARIANTS.md` - Navigation rules
- `/docs/website-process.md` - Process and governance

**Implementation:**
- `/docs/assess/manifest.json` - Assessment manifest
- `/docs/lgfc-homepage-legacy-v6.html` - Historical baseline
- `/docs/design/*.md` - Detailed design specs

**Testing:**
- `tests/e2e/homepage-sections.spec.ts` - Section tests
- `tests/homepage.spec.ts` - V6 compliance tests
- `scripts/ci/verify_lgfc_invariants.mjs` - Invariant validation

---

## Version History

| Version | Date | Changes | Approver |
|---------|------|---------|----------|
| 1.0 | 2026-01-25 | Initial locked design specification (ZIP #1) | @wdhunter645 |

---

**END OF LOCKED DESIGN SPECIFICATION**

**REMINDER:** This specification is LOCKED. Changes require explicit governance approval through the documented process. Unauthorized modifications will be rejected as drift.
