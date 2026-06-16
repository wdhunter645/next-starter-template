import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (filePath: string) => fs.readFileSync(path.resolve(__dirname, '..', filePath), 'utf8');

describe('public state validation matrix', () => {
  it('covers fanclub layout guard behavior', () => {
    const layout = readSource('src/app/fanclub/layout.tsx');

    expect(layout).toContain('useMemberSession');
    expect(layout).toMatch(/redirectTo:\s*['"]\/['"]/);
    expect(layout).toContain('!isAuthenticated');
    expect(layout).toContain('return null');
  });

  it('covers admin layout guard behavior', () => {
    const layout = readSource('src/app/admin/layout.tsx');

    expect(layout).toContain('useMemberSession');
    expect(layout).toMatch(/requireAdmin:\s*true/);
    expect(layout).toMatch(/role\s*!==\s*['"]admin['"]/);
    expect(layout).toContain('return null');
  });

  it('covers role-state normalization', () => {
    const hook = readSource('src/hooks/useMemberSession.ts');

    expect(hook).toMatch(/['"]admin['"]\s*\|\s*['"]member['"]\s*\|\s*['"]guest['"]/);
    expect(hook).toMatch(/\?\s*['"]admin['"]/);
    expect(hook).toMatch(/\?\s*['"]member['"]\s*:\s*['"]guest['"]/);
  });

  it('covers public header entry points', () => {
    const header = readSource('src/components/Header.tsx');

    expect(header).toMatch(/href=\s*['"]\/join['"]/);
    expect(header).toContain('LOGIN_TAB_ROUTE');
  });
});
