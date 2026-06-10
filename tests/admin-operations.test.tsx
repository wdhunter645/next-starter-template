import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminLayout from '@/app/admin/layout';
import AdminD1TestPage from '@/app/admin/d1-test/page';
import AdminJoinRequestsPage from '@/app/admin/join-requests/page';
import AdminMemberOperationsPage from '@/app/admin/member-operations/page';
import AdminWorklistPage from '@/app/admin/worklist/page';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminNav from '@/components/admin/AdminNav';
import { onRequestGet as statsGet } from '../functions/api/admin/stats';
import { onRequestGet as worklistGet } from '../functions/api/admin/worklist';

const mockUseMemberSession = vi.hoisted(() => vi.fn());
const mockUsePathname = vi.hoisted(() => vi.fn(() => '/admin'));

vi.mock('@/hooks/useMemberSession', () => ({
  useMemberSession: mockUseMemberSession,
}));

vi.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function adminRequest(path: string, token = 'secret'): Request {
  return new Request(`https://www.lougehrigfanclub.com${path}`, {
    headers: { 'x-admin-token': token },
  });
}

describe('admin route shell', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    mockUsePathname.mockReturnValue('/admin');
  });

  it('keeps admin layout gated to authenticated admins', () => {
    mockUseMemberSession.mockReturnValue({ isLoading: false, isAuthenticated: false, role: null });
    const { rerender } = render(
      <AdminLayout>
        <div>Protected admin content</div>
      </AdminLayout>,
    );

    expect(screen.queryByText('Protected admin content')).not.toBeInTheDocument();

    mockUseMemberSession.mockReturnValue({ isLoading: false, isAuthenticated: true, role: 'admin' });
    rerender(
      <AdminLayout>
        <div>Protected admin content</div>
      </AdminLayout>,
    );

    expect(screen.getByText('Protected admin content')).toBeInTheDocument();
  });

  it('exposes operational admin areas without public navigation leakage', () => {
    render(<AdminNav />);

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('link', { name: 'Moderation' })).toHaveAttribute('href', '/admin/moderation');
    expect(screen.getByRole('link', { name: 'Join Requests' })).toHaveAttribute('href', '/admin/join-requests');
    expect(screen.getByRole('link', { name: 'Worklist' })).toHaveAttribute('href', '/admin/worklist');
    expect(screen.getByRole('link', { name: 'Member Operations' })).toHaveAttribute(
      'href',
      '/admin/member-operations',
    );
    expect(screen.queryByRole('link', { name: 'Join' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Store' })).not.toBeInTheDocument();
  });
});

describe('admin operational pages', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem('lgfc_admin_token', 'secret');
    mockUsePathname.mockReturnValue('/admin');
  });

  it('renders join-request empty states and sends the admin token', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ ok: true, items: [] }) as never);

    render(<AdminJoinRequestsPage />);

    expect(await screen.findByText('No join requests found.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/join-requests/list?limit=50',
      expect.objectContaining({ cache: 'no-store' }),
    );
    const headers = fetchMock.mock.calls[0][1]?.headers as Headers;
    expect(headers.get('x-admin-token')).toBe('secret');
  });

  it('renders worklist empty states without crashing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ ok: true, results: [] }) as never);

    render(<AdminWorklistPage />);

    expect(await screen.findByText('No worklist items found.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
  });

  it('renders member-operation empty states without crashing', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ ok: true }) as never)
      .mockResolvedValueOnce(jsonResponse({ ok: true }) as never);

    render(<AdminMemberOperationsPage />);

    expect(await screen.findAllByText('No welcome email content is published yet.')).not.toHaveLength(0);
    expect(await screen.findAllByText('No membership card instructions are published yet.')).not.toHaveLength(0);
  });

  it('announces join-request API failures to assistive technology', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ ok: false, error: 'Unauthorized.' }, 401) as never);

    render(<AdminJoinRequestsPage />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/error: unauthorized/i);
  });

  it('announces worklist API failures to assistive technology', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ ok: false, error: 'Unauthorized.' }, 401) as never);

    render(<AdminWorklistPage />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/error: unauthorized/i);
  });

  it('announces dashboard stats failures to assistive technology', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ ok: false, error: 'Unauthorized.' }, 401) as never);

    render(<AdminDashboard />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/error: unauthorized/i);
  });
});

describe('admin d1 inspect page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    mockUsePathname.mockReturnValue('/admin/d1-test');
  });

  it('does not fetch D1 tables until a token is stored', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    render(<AdminD1TestPage />);

    expect(screen.getByText('Save an admin API token above to load D1 tables.')).toBeInTheDocument();
    await waitFor(() => {
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  it('loads D1 tables when a token is stored and announces API failures', async () => {
    window.localStorage.setItem('lgfc_admin_token', 'secret');
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ ok: false, error: 'Unauthorized.' }, 401) as never);

    render(<AdminD1TestPage />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/d1-inspect',
        expect.objectContaining({ cache: 'no-store' }),
      );
    });
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/error: unauthorized/i);
  });

  it('restores token gating when the admin token is cleared', async () => {
    window.localStorage.setItem('lgfc_admin_token', 'secret');
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ ok: true, tables: [] }) as never);

    render(<AdminD1TestPage />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const tokenInput = screen.getByLabelText('Admin token');
    await userEvent.clear(tokenInput);
    await userEvent.click(screen.getByRole('button', { name: 'Save token' }));

    expect(screen.getByText('Save an admin API token above to load D1 tables.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('admin operational APIs', () => {
  it('returns partial stats when one table is unavailable', async () => {
    const db = {
      prepare: vi.fn((sql: string) => ({
        all: async () => {
          if (sql.includes('photos')) throw new Error('no such table: photos');
          return { results: [{ n: 2 }] };
        },
      })),
    };

    const response = await statsGet({
      request: adminRequest('/api/admin/stats'),
      env: { ADMIN_TOKEN: 'secret', DB: db },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      counts: { join_requests: 2 },
      unavailable: { photos: 'no such table: photos' },
    });
  });

  it('lists an empty admin worklist safely', async () => {
    const db = {
      prepare: vi.fn(() => ({
        bind: () => ({
          all: async () => ({ results: [] }),
        }),
      })),
    };

    const response = await worklistGet({
      request: adminRequest('/api/admin/worklist'),
      env: { ADMIN_TOKEN: 'secret', DB: db },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true, results: [] });
  });
});
