# Theme Configuration

This document describes the site's theming system using CSS variables and centralized configuration.

## CSS Variables

All theme colors and typography are defined as CSS variables in `src/app/globals.css`. This allows for consistent theming across the entire site.

### Color Tokens

Located in `:root` selector in `globals.css`:

```css
:root {
  /* Base colors */
  --color-bg: #ffffff;      /* Background color (light mode) */
  --color-fg: #171717;      /* Foreground/text color (light mode) */
  --color-accent: #1a73e8;  /* Accent color for highlights and focus */
  --color-link: #1a73e8;    /* Link color */
  --color-muted: #6b7280;   /* Muted text (e.g., build info) */
}
```

### Dark Mode

Dark mode colors are automatically applied via `prefers-color-scheme: dark` media query:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0a0a0a;      /* Dark background */
    --color-fg: #ededed;      /* Light text */
    --color-accent: #4a9eff;  /* Lighter blue for contrast */
    --color-link: #4a9eff;    /* Lighter link color */
    --color-muted: #9ca3af;   /* Lighter muted text */
  }
}
```

### Font Stacks

Typography is controlled through font stack variables:

```css
:root {
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
}
```

## Site Configuration

Site identity and navigation structure are centralized in `src/lib/site/config.ts`:

```typescript
export const siteConfig = {
  name: "Lou Gehrig Fan Club",
  shortName: "LGFC",
  description: "...",
  url: "https://www.lougehrigfanclub.com",
  
  // Header navigation links
  nav: [
    { label: "Weekly", path: "/weekly" },
    { label: "Milestones", path: "/milestones" },
    // ...
  ],
  
  // Footer links
  footer: {
    legal: [
      { label: "Privacy", path: "/privacy" },
      { label: "Terms", path: "/terms" },
    ],
    admin: [
      { label: "Admin", path: "/admin" },
    ],
  },
};
```

## How to Adjust Theming

### Changing Colors

1. Open `src/app/globals.css`
2. Locate the `:root` selector
3. Update color values (use hex, rgb, or hsl)
4. Check dark mode values in the media query
5. Build and preview changes

### Changing Typography

1. Update `--font-sans` or `--font-mono` in `globals.css`
2. Add any custom web fonts to `src/app/layout.tsx`
3. Reference font variables in component CSS modules

### Changing Navigation

1. Open `src/lib/site/config.ts`
2. Update `nav` array for header links
3. Update `footer.legal` or `footer.admin` for footer links
4. Labels and paths are automatically used by Header/Footer components

## Using Theme Variables in Components

In CSS modules, reference variables like this:

```css
.myComponent {
  background: var(--color-bg);
  color: var(--color-fg);
  border: 1px solid var(--color-accent);
}

.myLink {
  color: var(--color-link);
}

.myLink:hover {
  color: var(--color-accent);
}
```

## Component Structure

- **Header**: `src/components/Header.tsx` + `Header.module.css`
- **Footer**: `src/components/Footer.tsx` + `Footer.module.css`
- **Layout Components**: Also available in `src/components/Layout/` (SiteHeader, SiteFooter)

Both use the same configuration from `lib/site/config.ts`.

## Best Practices

1. **Always use CSS variables** for colors instead of hardcoded values
2. **Test in both light and dark modes** when making theme changes
3. **Keep navigation structure in sync** - update `siteConfig` only
4. **Avoid inline styles** - use CSS modules with theme variables
5. **Maintain consistent spacing** - consider adding spacing variables if needed

## Future Enhancements

Consider adding:
- Spacing scale variables (`--space-xs`, `--space-sm`, etc.)
- Border radius variables (`--radius-sm`, `--radius-md`, etc.)
- Shadow variables for consistent depth
- Transition/animation timing variables
