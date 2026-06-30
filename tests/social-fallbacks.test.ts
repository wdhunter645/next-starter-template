import { describe, expect, it } from 'vitest';

import {
  getSocialFallbackPlatforms,
  SOCIAL_FALLBACK_PLATFORMS,
  SOCIAL_WALL_WIDGET_ID,
} from '@/lib/socialFallbacks';

describe('socialFallbacks (#2044)', () => {
  it('defines fallback coverage for Facebook, Instagram, X, and Pinterest', () => {
    const ids = SOCIAL_FALLBACK_PLATFORMS.map((platform) => platform.id);
    expect(ids).toEqual(['facebook', 'instagram', 'x', 'pinterest']);
  });

  it('returns platform-origin links for every fallback entry', () => {
    for (const platform of getSocialFallbackPlatforms()) {
      expect(platform.href).toMatch(/^https:\/\//);
      expect(platform.label.length).toBeGreaterThan(0);
      expect(platform.reliabilityNote.length).toBeGreaterThan(0);
    }
  });

  it('keeps the Elfsight widget id stable for SocialWall', () => {
    expect(SOCIAL_WALL_WIDGET_ID).toContain('elfsight-app-');
  });
});
