import fs from 'node:fs';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => fs.readFileSync(path, 'utf8');

describe('public state validation matrix', () => {
  it('covers fanclub layout guard behavior', () => {
    const layout = readSource('src/app/fanclub/layout.tsx');

    expect(layout).toContain('useMemberSession');
    expect(layout).toContain("redirectTo: '/'");
    expect(layout).toContain('!isAuthenticated');
    expect(layout).toContain('return null');
  });

  it('covers admin layout guard behavior', () => {
    const layout = readSource('src/app/admin/layout.tsx');

    expect(layout).toContain('useMemberSession');
    expect(layout).toContain('requireAdmin: true');
    expect(layout).toContain("role !== 'admin'");
    expect(layout).toContain('return null');
  });

  it('covers role-state normalization', () => {
    const hook = readSource('src/hooks/useMemberSession.ts');

    expect(hook).toContain("'admin' | 'member' | 'guest'");
    expect(hook).toContain("? 'admin'");
    expect(hook).toContain("? 'member' : 'guest'");
  });

  it('covers public header entry points', () => {
    const header = readSource('src/components/Header.tsx');

    expect(header).toContain('href="/join"');
    expect(header).toContain('LOGIN_TAB_ROUTE');
  });
});
