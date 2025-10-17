# Theme Configuration

This document describes the theme system and how to customize colors, fonts, and design tokens for the site.

## Overview

The site uses CSS custom properties (CSS variables) for theming, making it easy to maintain consistent styling and support dark mode.

## CSS Custom Properties

Theme tokens are defined in `src/app/globals.css`:

### Color Tokens

```css
:root {
  /* Background and foreground colors */
  --background: #ffffff;
  --foreground: #171717;
  
  /* Accent and interactive colors */
  --accent: #2563eb;
  --link: #2563eb;
  --muted: #6b7280;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
    --accent: #3b82f6;
    --link: #60a5fa;
    --muted: #9ca3af;
  }
}
```

### Font Tokens

```css
:root {
  /* Font families */
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Monaco, 'Cascadia Mono', monospace;
}
```

## How to Change Theme Tokens

1. **Edit `src/app/globals.css`** - Modify the CSS custom properties in the `:root` selector
2. **Update both light and dark modes** - Make sure to update values in the `@media (prefers-color-scheme: dark)` block
3. **Use semantic names** - Keep token names semantic (e.g., `--accent` not `--blue`)

## Site Configuration

Site metadata and navigation are centralized in `src/lib/site/config.ts`:

```typescript
export const siteConfig = {
  siteName: "Lou Gehrig Fan Club",
  siteDescription: "...",
  siteUrl: "https://www.lougehrigfanclub.com",
  
  navigation: {
    main: [
      { label: "Weekly", path: "/weekly" },
      // ...
    ],
    footer: [
      { label: "Privacy", path: "/privacy" },
      // ...
    ],
  },
};
```

### How to Change Navigation

1. **Edit `src/lib/site/config.ts`** - Add, remove, or modify items in `navigation.main` or `navigation.footer`
2. **Components update automatically** - `SiteHeader` and `SiteFooter` read from this config

## Layout Components

- `src/components/Layout/SiteHeader.tsx` - Main header with navigation
- `src/components/Layout/SiteFooter.tsx` - Footer with links and build info

Both components read from `siteConfig` for a single source of truth.

## Styling Guidelines

- Use CSS custom properties for colors to support dark mode
- Use Tailwind utility classes for layout and spacing
- Keep custom CSS minimal and scoped to CSS modules
- Maintain consistency with existing component styles

## Rollback Plan

To revert theme changes:
```bash
git revert <commit-sha>
```

All theme changes are in isolated files and can be safely reverted without breaking functionality.

## Related Documentation

- [Website Buildout Plan](../../README.md) - Parent planning document
- Site config: `src/lib/site/config.ts`
- Global styles: `src/app/globals.css`
