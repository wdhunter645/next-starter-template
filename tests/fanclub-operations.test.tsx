import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import FanclubPhotoGalleryPage from '@/app/fanclub/photo/page';
import LibraryPage from '@/app/fanclub/library/page';
import ArchivesTiles from '@/components/fanclub/ArchivesTiles';
import { onRequestGet as listDiscussions } from '../functions/api/discussions/list';
import { onRequestGet as listLibrary } from '../functions/api/library/list';

const mockUseMemberSession = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useMemberSession', () => ({
  useMemberSession: mockUseMemberSession,
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

function createRequest(path: string, cookie?: string): Request {
  return new Request(`https://www.lougehrigfanclub.com${path}`, {
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

function createMemberDb(options?: {
  email?: string;
  discussions?: Array<Record<string, unknown>>;
  library?: Array<Record<string, unknown>>;
}) {
  const email = options?.email ?? 'member@example.com';

  return {
    prepare: vi.fn((sql: string) => ({
      bind: (..._args: unknown[]) => ({
        first: async () => {
          if (sql.includes('FROM member_sessions')) return { email };
          return null;
        },
        run: async () => ({}),
        all: async () => {
          if (sql.includes('FROM discussions')) return { results: options?.discussions ?? [] };
          if (sql.includes('FROM library_entries')) return { results: options?.library ?? [] };
          return { results: [] };
        },
      }),
    })),
  };
}

describe('Fan Club member-only APIs', () => {
  it('rejects unauthenticated discussion reads', async () => {
    const response = await listDiscussions({
      env: { DB: createMemberDb() },
      request: createRequest('/api/discussions/list?limit=5'),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'Not authenticated',
    });
  });

  it('returns discussions only for an authenticated member session', async () => {
    const response = await listDiscussions({
      env: {
        DB: createMemberDb({
          discussions: [{ id: 1, title: 'Club note', body: 'Member-only post', created_at: '2026-06-01T00:00:00Z' }],
        }),
      },
      request: createRequest('/api/discussions/list?limit=5', 'lgfc_session=session-1'),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      items: [{ title: 'Club note' }],
    });
  });

  it('rejects unauthenticated legacy library reads', async () => {
    const response = await listLibrary({
      env: { DB: createMemberDb() },
      request: createRequest('/api/library/list?limit=5'),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'Not authenticated',
    });
  });
});

describe('Fan Club operational pages', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockUseMemberSession.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      email: 'member@example.com',
      role: 'member',
    });
  });

  it('renders member photos from thumbnail_url values returned by the Fan Club API', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({
        ok: true,
        items: [
          {
            id: 7,
            thumbnail_url: 'https://cdn.example.com/lgfc/photos/farewell.jpg',
            title: 'Farewell address',
            tags: 'lou,history',
            uploaded_by: 'archive',
          },
        ],
      }) as never,
    );

    render(<FanclubPhotoGalleryPage />);

    const image = await screen.findByRole('img', { name: 'Farewell address' });
    expect(image).toHaveAttribute('src', 'https://cdn.example.com/lgfc/photos/farewell.jpg');
    expect(fetchMock).toHaveBeenCalledWith('/api/fanclub/photos', { cache: 'no-store' });
    expect(screen.getByRole('link', { name: 'Submit a story or note' })).toHaveAttribute('href', '/fanclub/submit');
  });

  it('loads library entries through the member-gated Fan Club library API', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({
        ok: true,
        items: [
          {
            id: 3,
            title: 'Luckiest Man',
            author: 'Lou Gehrig',
            year: 1939,
            content: 'Today I consider myself the luckiest man on the face of the earth.',
          },
        ],
      }) as never,
    );

    render(<LibraryPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Luckiest Man' })).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith('/api/fanclub/library?page=1', { cache: 'no-store' });
    expect(screen.getByRole('link', { name: 'Submit an Article' })).toHaveAttribute('href', '/fanclub/submit');
  });

  it('exposes the approved member submission path from Club Archives without changing header navigation', () => {
    render(<ArchivesTiles />);

    expect(screen.getByRole('link', { name: 'Submit to the Library' })).toHaveAttribute('href', '/fanclub/submit');
  });
});
