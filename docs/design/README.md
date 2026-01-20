# LGFC Design Documentation

This directory contains design specifications and standards for the Lou Gehrig Fan Club website.

## Purpose

Design documentation serves as the single source of truth for:
- Layout behavior and positioning rules
- Color contrast and accessibility requirements
- Component structure and styling standards
- Regression prevention guidelines

## Documents

### [visitor-header.md](./visitor-header.md)
**Visitor Header Layout Specification**

Defines the locked layout behavior for the public site header, including:
- Three-region layout structure (logo, button group, hamburger)
- Button group centering requirements
- Hamburger right-alignment rules
- Dropdown positioning and anchoring
- Regression prevention guidelines

**When to consult**: Before making any changes to header layout, navigation, or hamburger menu positioning.

### [home.md](./home.md)
**Home Page Design Specification**

Documents design requirements for the home page, focusing on:
- Join CTA section contrast requirements
- Text color rules for readability
- WCAG compliance standards
- Common contrast issues to avoid

**When to consult**: Before modifying home page sections, particularly the Join CTA, or making text color changes.

## Design Change Process

1. **Review existing documentation** in this directory before making changes
2. **Identify conflicts** between proposed changes and documented standards
3. **Update documentation** in the same PR as code changes
4. **Document rationale** for any deviation from locked standards
5. **Get design review approval** for changes that affect locked standards

## Locked Standards

Certain design elements are "locked" (finalized and should rarely change):
- Visitor header layout (three-region structure)
- Join CTA contrast requirements (white text on blue)
- Navigation invariants (documented in `/docs/NAVIGATION-INVARIANTS.md`)
- Color tokens (documented in `/docs/website.md`)

## Relationship to Other Documentation

- **`/docs/website.md`**: Overall website structure and PR process
- **`/docs/NAVIGATION-INVARIANTS.md`**: Navigation menu content and structure
- **`/docs/website-process.md`**: Development workflow and testing requirements
- **`/docs/as-built/`**: Implementation baseline and current state

This design documentation focuses on **visual design and layout behavior**, while other docs cover structure, content, and process.

## Contributing

When adding new design documentation:
1. Create a new markdown file in this directory
2. Use clear, specific language
3. Include code examples where relevant
4. Document both what to do AND what to avoid
5. Update this README to reference the new document
6. Link to the new doc from related documentation
