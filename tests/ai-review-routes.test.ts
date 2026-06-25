import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('AI review static route export (#1973)', () => {
  it('documents the postbuild rename script for /_ai-review URLs', () => {
    expect(existsSync('scripts/postbuild-ai-review-routes.mjs')).toBe(true);
  });
});
