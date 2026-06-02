import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminMediaAssetsPage from '@/app/admin/media-assets/page';
import { onRequestGet as mediaListGet } from '../functions/api/admin/media-assets/list';
import { onRequestPost as mediaSyncPost } from '../functions/api/admin/media-assets/sync-from-b2';

const mockUsePathname = vi.hoisted(() => vi.fn(() => '/admin/media-assets'));

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

function adminGetRequest(path: string, token = 'secret'): Request {
  return new Request(`https://www.lougehrigfanclub.com${path}`, {
    headers: { 'x-admin-token': token },
  });
}

function adminPostRequest(path: string, token = 'secret'): Request {
  return new Request(`https://www.lougehrigfanclub.com${path}`, {
    method: 'POST',
    headers: { 'x-admin-token': token },
  });
}

function makeMediaDb(rows: Array<Record<string, unknown>> = []) {
  let boundLimit = 0;
  const db = {
    prepare: vi.fn((sql: string) => ({
      bind: (...args: unknown[]) => ({
        all: async () => {
          if (sql.includes('sqlite_master')) {
            return { results: [{ name: 'media_assets' }] };
          }

          if (sql.includes('FROM media_assets')) {
            boundLimit = Number(args[0]);
            return { results: rows };
          }

          return { results: [] };
        },
      }),
    })),
  };

  return {
    db,
    getBoundLimit: () => boundLimit,
  };
}

describe('admin media assets page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem('lgfc_admin_token', 'secret');
    mockUsePathname.mockReturnValue('/admin/media-assets');
  });

  it('renders admin navigation and token controls', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ ok: true, items: [] }));

    render(<AdminMediaAssetsPage />);

    expect(screen.getByRole('link', { name: 'Media Assets' })).toBeInTheDocument();
    expect(screen.getByLabelText('Admin token')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('No media assets found.')).toBeInTheDocument();
    });
  });

  it('loads media inventory with the stored admin token', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const headers = init?.headers instanceof Headers ? init.headers : new Headers(init?.headers);
      expect(String(input)).toBe('/api/admin/media-assets/list?limit=100');
      expect(headers.get('x-admin-token')).toBe('secret');

      return Promise.resolve(
        jsonResponse({
          ok: true,
          items: [
            {
              id: 7,
              media_uid: 'b2_abc',
              b2_key: 'photos/lou.jpg',
              b2_file_id: 'file-7',
              size: 42,
              etag: 'etag-7',
              ingested_at: '2026-06-02T00:00:00Z',
            },
          ],
        }),
      );
    });

    render(<AdminMediaAssetsPage />);

    await waitFor(() => {
      expect(screen.getByText('photos/lou.jpg')).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/media-assets/list?limit=100',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('posts B2 sync, reports changes, and refreshes inventory', async () => {
    let listCalls = 0;
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const path = String(input);
      const headers = init?.headers instanceof Headers ? init.headers : new Headers(init?.headers);
      expect(headers.get('x-admin-token')).toBe('secret');

      if (path === '/api/admin/media-assets/sync-from-b2') {
        expect(init?.method).toBe('POST');
        return Promise.resolve(
          jsonResponse({ ok: true, listed: 2, maxObjects: 2000, batches: 1, changes_reported: 1 }),
        );
      }

      listCalls += 1;
      return Promise.resolve(
        jsonResponse({
          ok: true,
          items:
            listCalls > 1
              ? [{ id: 8, media_uid: 'b2_def', b2_key: 'photos/new.jpg', size: 100 }]
              : [],
        }),
      );
    });

    render(<AdminMediaAssetsPage />);

    await waitFor(() => {
      expect(screen.getByText('No media assets found.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sync from B2' }));

    await waitFor(() => {
      expect(screen.getByText('B2 sync complete: listed 2 object(s), reported 1 D1 change(s).')).toBeInTheDocument();
      expect(screen.getByText('photos/new.jpg')).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/media-assets/sync-from-b2',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('shows fail-closed sync errors from the API', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      if (String(input) === '/api/admin/media-assets/sync-from-b2') {
        return Promise.resolve(jsonResponse({ ok: false, error: 'B2 secrets missing for this Pages environment' }, 503));
      }
      return Promise.resolve(jsonResponse({ ok: true, items: [] }));
    });

    render(<AdminMediaAssetsPage />);

    await waitFor(() => {
      expect(screen.getByText('No media assets found.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sync from B2' }));

    await waitFor(() => {
      expect(screen.getByText('Sync error: B2 secrets missing for this Pages environment')).toBeInTheDocument();
    });
  });
});

describe('media assets admin API', () => {
  it('rejects unauthenticated list requests', async () => {
    const response = await mediaListGet({
      request: adminGetRequest('/api/admin/media-assets/list', ''),
      env: { ADMIN_TOKEN: 'secret', DB: makeMediaDb().db },
    });

    expect(response.status).toBe(401);
  });

  it('fails closed when D1 is unavailable for inventory list requests', async () => {
    const response = await mediaListGet({
      request: adminGetRequest('/api/admin/media-assets/list'),
      env: { ADMIN_TOKEN: 'secret' },
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'Database unavailable',
    });
  });

  it('caps inventory list limits and returns media rows', async () => {
    const { db, getBoundLimit } = makeMediaDb([
      {
        id: 3,
        media_uid: 'b2_row',
        b2_key: 'photos/row.jpg',
        b2_file_id: 'file-3',
        size: 88,
        etag: 'etag-3',
        ingested_at: '2026-06-02T00:00:00Z',
      },
    ]);

    const response = await mediaListGet({
      request: adminGetRequest('/api/admin/media-assets/list?limit=9999'),
      env: { ADMIN_TOKEN: 'secret', DB: db },
    });

    expect(response.status).toBe(200);
    expect(getBoundLimit()).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      items: [{ media_uid: 'b2_row', b2_key: 'photos/row.jpg' }],
    });
  });

  it('fails closed when the media_assets table is missing', async () => {
    const db = {
      prepare: vi.fn(() => ({
        bind: () => ({
          all: async () => ({ results: [] }),
        }),
      })),
    };

    const response = await mediaListGet({
      request: adminGetRequest('/api/admin/media-assets/list'),
      env: { ADMIN_TOKEN: 'secret', DB: db },
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'Database schema incomplete',
      missingTables: ['media_assets'],
    });
  });

  it('rejects unauthenticated B2 sync requests', async () => {
    const response = await mediaSyncPost({
      request: adminPostRequest('/api/admin/media-assets/sync-from-b2', ''),
      env: { ADMIN_TOKEN: 'secret', DB: makeMediaDb().db },
    });

    expect(response.status).toBe(401);
  });

  it('fails closed when B2 secrets are missing for sync', async () => {
    const response = await mediaSyncPost({
      request: adminPostRequest('/api/admin/media-assets/sync-from-b2'),
      env: { ADMIN_TOKEN: 'secret', DB: makeMediaDb().db },
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'B2 secrets missing for this Pages environment',
    });
  });
});
