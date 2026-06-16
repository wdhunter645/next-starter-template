import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AdminLayout from '@/app/admin/layout';
import LogoutPage from '@/app/logout/page';
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

describe('logout flow behavior (#1259 Task 003)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('posts to /api/logout, clears local storage, and returns home', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    const mockLocation = { href: '' };
    vi.stubGlobal('location', mockLocation);
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

    render(<LogoutPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      expect(removeItemSpy).toHaveBeenCalledWith('lgfc_member_email');
      expect(mockLocation.href).toBe('/');
    });
  });
});
