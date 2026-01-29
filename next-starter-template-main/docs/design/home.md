# Home Page Design Specification

## Join CTA Section Contrast Requirements

### Background Color
The Join CTA section uses the LGFC blue brand color:
- **CSS Variable**: `var(--lgfc-blue)`
- **Hex Value**: `#0033cc`
- **RGB Value**: `rgb(0, 51, 204)`

### Text Color Requirement

**All text within the Join CTA section MUST be white for proper contrast.**

This applies to:
1. **Section heading** (`<h2 class="section-title">`)
2. **Body copy** (`.join-banner__text`)
3. **Links and any inline text** within the blue background area

### Implementation

#### CSS Rule (Authoritative)
```css
.joinBanner {
  background: var(--lgfc-blue);
  color: #fff;
  border-radius: var(--lgfc-radius-lg);
  padding: 20px;
}

/* Force all text in joinBanner to white for proper contrast */
.joinBanner h2,
.joinBanner h3,
.joinBanner h4,
.joinBanner p,
.joinBanner a,
.joinBanner .section-title {
  color: #fff !important;
}
```

#### Component Structure
```tsx
<div className="joinBanner section-gap">
  <h2 className="section-title">Join the Lou Gehrig Fan Club</h2>
  <div className="join-banner__container">
    <p className="join-banner__text">
      Become a member. Get access to the Gehrig library, media archive, 
      memorabilia archive, group discussions, and more.
    </p>
    <div className="join-banner__actions">
      <a className="join-banner__btn" href="/join">Join</a>
      <a className="join-banner__btn" href="/member">Login</a>
    </div>
  </div>
</div>
```

### Rationale

The WCAG 2.1 contrast ratio requirements mandate:
- **Minimum contrast**: 4.5:1 for normal text
- **Large text**: 3:1 for text 18pt+ or 14pt+ bold

Blue background (`#0033cc`) with white text (`#ffffff`) provides:
- **Contrast ratio**: ~8.6:1
- **Result**: Passes WCAG AAA for both normal and large text

### Common Issues to Avoid

1. **Inherited heading colors**: The global `h2` style sets `color: var(--lgfc-blue)`, which would create blue-on-blue text if not overridden
2. **Link color inheritance**: Default link colors may not have sufficient contrast
3. **Missing specificity**: Generic text color rules may be overridden by more specific selectors

### Testing

Verify Join CTA text contrast by:
1. Opening the home page
2. Scrolling to the "Join the Lou Gehrig Fan Club" section
3. Confirming:
   - Section heading is white
   - Body copy is white
   - All text is readable against the blue background

### Buttons Exception

The Join and Login buttons within the section have their own styling:
- **Background**: White (`#fff`)
- **Text color**: Black (`#000`)
- **Border**: Semi-transparent white

This provides visual hierarchy and clear call-to-action affordance while maintaining contrast.
