# LGFC Design Documentation

This directory contains authoritative design specifications for the LGFC website.

## Header Design

### [Visitor Header](./visitor-header.md)
Specification for the public-facing header used on the homepage and other visitor pages.

**Key Features:**
- Sticky navigation controls
- Non-sticky logo (240px height)
- Logo overlaps banner area
- Fixed z-index layering

### [Member Header](./member-header.md)
Specification for the member-facing header used on authenticated member pages.

**Key Features:**
- Sticky navigation controls
- Non-sticky logo (240px height)
- Logo overlaps banner area
- Fixed z-index layering
- Member-specific navigation items

## Design Principles

### Locked Behaviors
These design specifications document **locked behaviors** that must not be changed without explicit design review:
- Header stickiness (controls remain fixed)
- Logo non-stickiness (does not scroll)
- Logo overlap mechanics (layering above banner)
- Logo sizing (3× baseline = 240px)
- Z-index hierarchy (controls > logo > banner)

### Guardrails
- Do not increase header height to accommodate logo
- Do not make logo sticky/fixed
- Do not center logo
- Do not block header control clicks
- Maintain aspect ratios

## Updating Design Specs
Design changes should follow the governance process in `/docs/website-PR-governance.md`:
1. Update design docs in this directory
2. Implement changes in components
3. Update tests to reflect new behavior
4. Document in PR description
