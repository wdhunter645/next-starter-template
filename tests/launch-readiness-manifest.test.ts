import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import manifest from '../scripts/launch-readiness/manifest.json';

function collectAppRoutes(dir: string, prefix = ''): string[] {
  const routes: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      routes.push(...collectAppRoutes(fullPath, `${prefix}/${entry}`));
      continue;
    }
    if (entry === 'page.tsx') {
      routes.push(prefix || '/');
    }
  }
  return routes;
}

describe('launch readiness manifest', () => {
  it('lists unique required routes', () => {
    const unique = new Set(manifest.requiredRoutes);
    expect(unique.size).toBe(manifest.requiredRoutes.length);
  });

  it('covers every Next.js app route in required or conditional lists', () => {
    const appRoutes = collectAppRoutes('src/app').sort();
    const allowed = new Set([
      ...manifest.requiredRoutes,
      ...(manifest.conditionalRoutes || []),
    ]);

    const missing = appRoutes.filter((route) => !allowed.has(route));
    expect(missing, `Add missing routes to manifest: ${missing.join(', ')}`).toEqual([]);
  });

  it('keeps playwright route lists within the static export contract', () => {
    const staticRoutes = new Set([
      ...manifest.requiredRoutes,
      ...(manifest.conditionalRoutes || []),
    ]);

    for (const route of [...manifest.publicPlaywrightRoutes, ...manifest.fanclubPlaywrightRoutes]) {
      expect(staticRoutes.has(route)).toBe(true);
    }
  });

  it('documents T48 matchup as conditional until PR #1212 merges', () => {
    expect(manifest.conditionalRoutes).toContain('/admin/matchup');
    const paths = [
      'out/admin/matchup/index.html',
      'out/admin/matchup.html',
    ];
    const present = paths.some((path) => existsSync(path));
    if (!present) {
      expect(manifest.requiredRoutes).not.toContain('/admin/matchup');
    }
  });
});
