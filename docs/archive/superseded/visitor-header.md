---
Doc Type: Specification
Audience: Human + AI
Authority Level: Canonical Design Specification
Owns: Routes, navigation invariants, UI/UX contracts, page content contracts
Does Not Own: How-to procedures; operational runbooks; governance policies
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-02-20
---

# Visitor Header Layout Specification

## Overview
This document defines the locked layout behavior for the Visitor header (public site header).

## Layout Structure

The Visitor header uses a three-region layout:

### 1. Left Region: Logo
- **Position**: Absolute positioned at top-left
- **Location**: `top: 8px; left: 16px;`
- **Behavior**: Static, does not scroll with page

### 2. Center Region: Button Group
- **Position**: Fixed, horizontally centered
- **Location**: `top: 8px; left: 50%; transform: translateX(-50%);`
- **Contents**: Join, Search, Store, Login buttons
- **Visibility**: Desktop/tablet only (hidden on mobile)
- **Styling**: 
  - White background with transparency (`rgba(255,255,255,0.9)`)
  - Backdrop blur effect
  - Rounded corners
  - Drop shadow
- **Behavior**: Buttons are centered as a group, independent of hamburger position

#### Login Button Behavior (LGFC-Lite)
- **Label**: "Login"
- **Destination**: `/login` route
- **Important**: The Login button routes to an informational stub page in LGFC-Lite phase
- **Does NOT**: Imply live authentication functionality
- **See**: `/docs/design/login.md` for login page specification
- **See**: `/docs/design/phases.md` for phase-based authentication status

### 3. Right Region: Hamburger Menu
- **Position**: Fixed, pinned to right edge
- **Location**: `top: 8px; right: 16px;`
- **Behavior**: 
  - Hamburger trigger remains right-aligned at all viewport widths
  - NOT affected by button group centering
  - Higher z-index (`z-index: 1001`) to appear above button group if needed
- **Styling**:
  - White background with transparency (`rgba(255,255,255,0.9)`)
  - Backdrop blur effect
  - Rounded corners
  - Drop shadow

## Hamburger Dropdown Positioning

The hamburger dropdown menu anchors to the hamburger trigger, not the viewport:

- **Position**: Absolute relative to the hamburger wrapper
- **Location**: `top: 60px; right: 0;`
- **Effect**: Dropdown appears directly below the hamburger icon, following its x-position
- **Z-index**: `1002` (above header elements)

## Implementation Details

### Header Component (`src/components/Header.tsx`)

```tsx
// Three separate containers:
<header>
  {/* Left: Logo */}
  <Link className="logo-link">...</Link>
  
  {/* Center: Button group */}
  <div className="header-center">
    <Link>Join</Link>
    <Link>Search</Link>
    <a>Store</a>
    <Link>Login</Link>
  </div>
  
  {/* Right: Hamburger */}
  <div className="header-right">
    <div className="burger-wrapper">
      <button className="burger-btn">...</button>
    </div>
  </div>
</header>
```

### Key CSS Rules

```css
.header-center {
  position: fixed;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  /* Centering applies ONLY to this container */
}

.header-right {
  position: fixed;
  top: 8px;
  right: 16px;
  /* Hamburger pinned to right edge */
}
```

## Design Rationale

1. **Button group centering**: Provides visual balance and symmetry for primary navigation actions
2. **Hamburger right-alignment**: Follows mobile UI conventions and keeps secondary actions at the edge
3. **Separate containers**: Prevents centering logic from affecting hamburger position
4. **Dropdown anchoring**: Ensures menu appears logically connected to its trigger

## Regression Prevention

**DO NOT:**
- Wrap buttons and hamburger in a single centered container
- Apply `left: 50%; transform: translateX(-50%)` to any container that includes the hamburger
- Position hamburger dropdown with `right: 0` relative to viewport
- Change hamburger position based on button group width

**DO:**
- Keep three separate regions (left/center/right)
- Apply centering ONLY to the button group container
- Position hamburger with fixed right offset from viewport edge
- Anchor dropdown to hamburger wrapper using absolute positioning
