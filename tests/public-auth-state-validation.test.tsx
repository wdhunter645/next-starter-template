import { readFileSync } from 'node:fs';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AdminLayout from '@/app/admin/layout';
import MemberLayout from '@/app/fanclub/layout';
import Header from '@/components/Header';

const mockUseMemberSession = vi.hoisted(() => vi.fn());
const mockRouterReplace = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useMemberSession', () => ({
  useMemberSession: mockUseMemberSession,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function mockSessionFetch(payload: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: async () => payload,
    }),
  );
}

describe('fanclub layout auth gate (#1259 Task 003)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks children while session is loading', () => {
    mockUseMemberSession.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      role: 'guest',
      email: '',
    });

    render(
      <MemberLayout>
        <div>FanClub protected content</div>
      </MemberLayout>,
    );

    expect(screen.queryByText('FanClub protected content')).not.toBeInTheDocument();
  });

  it('blocks unauthenticated guests from fanclub routes', () => {
    mockUseMemberSession.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      role: 'guest',
      email: '',
    });

    render(
      <MemberLayout>
        <div>FanClub protected content</div>
      </MemberLayout>,
    );

    expect(screen.queryByText('FanClub protected content')).not.toBeInTheDocument();
  });

  it('renders children for authenticated members', () => {
    mockUseMemberSession.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      role: 'member',
      email: 'fan@example.com',
    });

    render(
      <MemberLayout>
        <div>FanClub protected content</div>
      </MemberLayout>,
    );

    expect(screen.getByText('FanClub protected content')).toBeInTheDocument();
  });
});

describe('admin layout auth gate (#1259 Task 003)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks unauthenticated users', () => {
    mockUseMemberSession.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      role: 'guest',
      email: '',
    });

    render(
      <AdminLayout>
        <div>Admin protected content</div>
      </AdminLayout>,
    );

    expect(screen.queryByText('Admin protected content')).not.toBeInTheDocument();
  });

  it('blocks authenticated non-admin members', () => {
    mockUseMemberSession.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      role: 'member',
      email: 'fan@example.com',
    });

    render(
      <AdminLayout>
        <div>Admin protected content</div>
      </AdminLayout>,
    );

    expect(screen.queryByText('Admin protected content')).not.toBeInTheDocument();
  });

  it('renders children for authenticated admins', () => {
    mockUseMemberSession.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      role: 'admin',
      email: 'admin@example.com',
    });

    render(
      <AdminLayout>
        <div>Admin protected content</div>
      </AdminLayout>,
    );

    expect(screen.getByText('Admin protected content')).toBeInTheDocument();
  });
});

describe('layout auth source contracts (#1259 Task 003)', () => {
  it('wires fanclub layout to member session redirect', () => {
    const source = readFileSync('src/app/fanclub/layout.tsx', 'utf8');
    expect(source).toContain('useMemberSession');
    expect(source).toContain("redirectTo: '/'");
    expect(source).not.toContain('requireAdmin');
  });

  it('wires admin layout to admin-only session redirect', () => {
    const source = readFileSync('src/app/admin/layout.tsx', 'utf8');
    expect(source).toContain('useMemberSession');
    expect(source).toContain("redirectTo: '/'");
    expect(source).toContain('requireAdmin: true');
    expect(source).toContain("role !== 'admin'");
  });

  it('documents client-side gate flash behavior in layout files', () => {
    const fanclub = readFileSync('src/app/fanclub/layout.tsx', 'utf8');
    const admin = readFileSync('src/app/admin/layout.tsx', 'utf8');
    expect(fanclub).toContain('return null');
    expect(admin).toContain('return null');
  });
});

describe('public header auth variants (#1259 Task 003)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows guest controls when session is unauthenticated', async () => {
    mockSessionFetch({ ok: false });

    render(<Header showLogo={false} />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Join' })).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Club Home' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Logout' })).not.toBeInTheDocument();
  });

  it('shows member controls when session is authenticated', async () => {
    mockSessionFetch({ ok: true, email: 'fan@example.com', role: 'member' });

    render(<Header showLogo={false} />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Club Home' })).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'Logout' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Join' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument();
  });
});

describe('logout flow contract (#1259 Task 003)', () => {
  it('posts to /api/logout and returns home', () => {
    const source = readFileSync('src/app/logout/page.tsx', 'utf8');
    expect(source).toContain("fetch('/api/logout'");
    expect(source).toContain("method: 'POST'");
    expect(source).toContain("window.location.href = '/'");
  });
});
