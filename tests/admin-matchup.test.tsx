import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminMatchupPage from '@/app/admin/matchup/page';
import { onRequestPost as matchupCloseActivePost } from '../functions/api/admin/matchup/close-active';
import { onRequestPost as matchupCreatePost } from '../functions/api/admin/matchup/create';
import { onRequestGet as matchupListGet } from '../functions/api/admin/matchup/list';
import { onRequestPost as matchupUpdatePost } from '../functions/api/admin/matchup/update';
import { onRequestGet as publicMatchupCurrentGet } from '../functions/api/matchup/current';
import { onRequestGet as publicMatchupResultsGet } from '../functions/api/matchup/results';

const mockUsePathname = vi.hoisted(() => vi.fn(() => '/admin/matchup'));

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

function adminPostRequest(path: string, body: unknown = {}, token = 'secret'): Request {
  return new Request(`https://www.lougehrigfanclub.com${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
    body: JSON.stringify(body),
  });
}

function makeMatchupDb(matchups: Array<Record<string, unknown>> = [], votes: Record<string, { a: number; b: number }> = {}) {
  const makeRun = (sql: string, args: unknown[] = []) => async () => {
    if (sql.includes("SET status='closed' WHERE status='active'") && sql.includes('AND id !=')) {
      const keepId = Number(args[0]);
      matchups.forEach((row) => {
        if (row.status === 'active' && Number(row.id) !== keepId) {
          row.status = 'closed';
        }
      });
      return { meta: { changes: 1 } };
    }
    if (sql.includes("SET status='closed' WHERE status='active'")) {
      matchups.forEach((row) => {
        if (row.status === 'active') row.status = 'closed';
      });
      return { meta: { changes: 1 } };
    }
    if (sql.includes("SET status='active' WHERE id")) {
      const target = matchups.find((row) => Number(row.id) === Number(args[0]));
      if (target) target.status = 'active';
      return { meta: { changes: 1 } };
    }
    if (sql.includes('INSERT INTO weekly_matchups')) {
      const week_start = String(args[0]);
      if (matchups.some((row) => String(row.week_start) === week_start)) {
        throw new Error('UNIQUE constraint failed: weekly_matchups.week_start');
      }
      const id = matchups.length + 1;
      matchups.push({
        id,
        week_start,
        photo_a_id: args[1],
        photo_b_id: args[2],
        status: args[3],
        created_at: '2026-06-03T12:00:00Z',
      });
      return { meta: { last_row_id: id, changes: 1 } };
    }
    if (sql.includes('UPDATE weekly_matchups')) {
      const target = matchups.find((row) => Number(row.id) === Number(args[3]));
      if (target) {
        target.photo_a_id = args[0];
        target.photo_b_id = args[1];
        target.status = args[2];
      }
      return { meta: { changes: 1 } };
    }
    return { meta: { changes: 0 } };
  };

  const db = {
    prepare: vi.fn((sql: string) => ({
      bind: (...args: unknown[]) => ({
        all: async () => {
          if (sql.includes('sqlite_master')) {
            return { results: [{ name: 'weekly_matchups' }, { name: 'weekly_votes' }] };
          }
          if (sql.includes('LEFT JOIN weekly_votes')) {
            const limit = Number(args[0] ?? 50);
            return {
              results: matchups.slice(0, limit).map((row) => {
                const week = String(row.week_start);
                const totals = votes[week] || { a: 0, b: 0 };
                return {
                  ...row,
                  a: totals.a,
                  b: totals.b,
                };
              }),
            };
          }
          if (sql.includes('FROM weekly_matchups') && sql.includes('LIMIT')) {
            return { results: matchups };
          }
          return { results: [] };
        },
        first: async () => {
          if (sql.includes("status='active'") && sql.includes('LIMIT 1') && !sql.includes('UPDATE')) {
            return matchups.find((row) => row.status === 'active') ?? null;
          }
          if (sql.includes('FROM weekly_votes') && sql.includes('week_start')) {
            const week = String(args[0]);
            const totals = votes[week] || { a: 0, b: 0 };
            return { a: totals.a, b: totals.b };
          }
          if (sql.includes('FROM weekly_matchups WHERE id')) {
            return matchups.find((row) => Number(row.id) === Number(args[0])) ?? null;
          }
          return null;
        },
        run: makeRun(sql, args),
      }),
      first: async () => matchups.find((row) => row.status === 'active') ?? null,
      run: makeRun(sql),
    })),
  };

  return { db, matchups };
}

describe('admin matchup page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem('lgfc_admin_token', 'secret');
    mockUsePathname.mockReturnValue('/admin/matchup');
  });

  it('renders admin navigation and loads matchup inventory', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const path = String(input);

      if (path.startsWith('/api/admin/matchup/list')) {
        return Promise.resolve(
          jsonResponse({
            ok: true,
            active: {
              id: 2,
              week_start: '2026-06-01',
              photo_a_id: 10,
              photo_b_id: 11,
              status: 'active',
              created_at: '2026-06-01T12:00:00Z',
              votes: { a: 3, b: 5, total: 8, winner: 'b' },
            },
            items: [
              {
                id: 2,
                week_start: '2026-06-01',
                photo_a_id: 10,
                photo_b_id: 11,
                status: 'active',
                created_at: '2026-06-01T12:00:00Z',
                votes: { a: 3, b: 5, total: 8, winner: 'b' },
              },
            ],
          }),
        );
      }

      if (path === '/api/matchup/current') {
        return Promise.resolve(
          jsonResponse({
            ok: true,
            week_start: '2026-06-01',
            matchup_id: 2,
            items: [
              { id: 10, url: '/photos/10.jpg' },
              { id: 11, url: '/photos/11.jpg' },
            ],
          }),
        );
      }

      if (path.startsWith('/api/matchup/results')) {
        return Promise.resolve(
          jsonResponse({ ok: true, week_start: '2026-06-01', totals: { a: 3, b: 5 }, last_week: null }),
        );
      }

      return Promise.reject(new Error(`Unexpected fetch: ${path}`));
    });

    render(<AdminMatchupPage />);

    expect(screen.getByRole('link', { name: 'Matchup' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Active matchup: week 2026-06-01/i)).toBeInTheDocument();
    });
  });

  it('shows fail-closed public preview when current matchup is unavailable', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const path = String(input);

      if (path.startsWith('/api/admin/matchup/list')) {
        return Promise.resolve(jsonResponse({ ok: true, active: null, items: [] }));
      }

      if (path === '/api/matchup/current') {
        return Promise.resolve(jsonResponse({ ok: true, week_start: null, items: [] }));
      }

      if (path.startsWith('/api/matchup/results')) {
        return Promise.resolve(
          jsonResponse({ ok: true, week_start: null, totals: { a: 0, b: 0 }, last_week: null }),
        );
      }

      return Promise.reject(new Error(`Unexpected fetch: ${path}`));
    });

    render(<AdminMatchupPage />);

    await waitFor(() => {
      expect(screen.getByText(/No active matchup in D1/i)).toBeInTheDocument();
    });
  });

  it('creates a matchup through the admin create API', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const path = String(input);

      if (path.startsWith('/api/admin/matchup/list')) {
        return Promise.resolve(jsonResponse({ ok: true, active: null, items: [] }));
      }

      if (path === '/api/admin/matchup/create') {
        expect(init?.method).toBe('POST');
        const body = JSON.parse(String(init?.body));
        expect(body.week_start).toBe('2026-06-08');
        expect(body.photo_a_id).toBe(21);
        expect(body.photo_b_id).toBe(22);
        return Promise.resolve(jsonResponse({ ok: true, id: 9 }));
      }

      if (path === '/api/matchup/current') {
        return Promise.resolve(jsonResponse({ ok: true, week_start: null, items: [] }));
      }

      if (path.startsWith('/api/matchup/results')) {
        return Promise.resolve(
          jsonResponse({ ok: true, week_start: null, totals: { a: 0, b: 0 }, last_week: null }),
        );
      }

      return Promise.reject(new Error(`Unexpected fetch: ${path}`));
    });

    render(<AdminMatchupPage />);

    await waitFor(() => {
      expect(screen.getByText(/No matchup records found/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Week start/i), { target: { value: '2026-06-08' } });
    fireEvent.change(screen.getByLabelText('Photo A ID'), { target: { value: '21' } });
    fireEvent.change(screen.getByLabelText('Photo B ID'), { target: { value: '22' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create matchup' }));

    await waitFor(() => {
      expect(screen.getByText(/Matchup created/i)).toBeInTheDocument();
    });

    expect(fetchMock.mock.calls.some(([path]) => path === '/api/admin/matchup/create')).toBe(true);
  });
});

describe('admin matchup APIs', () => {
  it('rejects unauthenticated list requests', async () => {
    const { db } = makeMatchupDb();
    const response = await matchupListGet({
      request: adminGetRequest('/api/admin/matchup/list', ''),
      env: { ADMIN_TOKEN: 'secret', DB: db },
    });

    expect(response.status).toBe(401);
  });

  it('returns active matchup and vote totals', async () => {
    const { db } = makeMatchupDb(
      [
        {
          id: 1,
          week_start: '2026-06-01',
          photo_a_id: 10,
          photo_b_id: 11,
          status: 'active',
          created_at: '2026-06-01T12:00:00Z',
        },
      ],
      { '2026-06-01': { a: 4, b: 2 } },
    );

    const response = await matchupListGet({
      request: adminGetRequest('/api/admin/matchup/list'),
      env: { ADMIN_TOKEN: 'secret', DB: db },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      active: { week_start: '2026-06-01', votes: { a: 4, b: 2, winner: 'a' } },
    });
  });

  it('creates matchup rows and enforces unique week_start', async () => {
    const { db, matchups } = makeMatchupDb();

    const createResponse = await matchupCreatePost({
      request: adminPostRequest('/api/admin/matchup/create', {
        week_start: '2026-06-08',
        photo_a_id: 3,
        photo_b_id: 4,
        status: 'closed',
      }),
      env: { ADMIN_TOKEN: 'secret', DB: db },
    });

    expect(createResponse.status).toBe(200);
    expect(matchups).toHaveLength(1);

    const duplicate = await matchupCreatePost({
      request: adminPostRequest('/api/admin/matchup/create', {
        week_start: '2026-06-08',
        photo_a_id: 5,
        photo_b_id: 6,
      }),
      env: { ADMIN_TOKEN: 'secret', DB: db },
    });

    expect(duplicate.status).toBe(409);
  });

  it('activates one matchup and closes others', async () => {
    const { db, matchups } = makeMatchupDb([
      {
        id: 1,
        week_start: '2026-06-01',
        photo_a_id: 10,
        photo_b_id: 11,
        status: 'active',
        created_at: '2026-06-01T12:00:00Z',
      },
      {
        id: 2,
        week_start: '2026-06-08',
        photo_a_id: 20,
        photo_b_id: 21,
        status: 'closed',
        created_at: '2026-06-08T12:00:00Z',
      },
    ]);

    const response = await matchupUpdatePost({
      request: adminPostRequest('/api/admin/matchup/update', { id: 2, status: 'active' }),
      env: { ADMIN_TOKEN: 'secret', DB: db },
    });

    expect(response.status).toBe(200);
    expect(matchups.find((row) => row.id === 1)?.status).toBe('closed');
    expect(matchups.find((row) => row.id === 2)?.status).toBe('active');
  });

  it('closes the active matchup for rotation', async () => {
    const { db, matchups } = makeMatchupDb([
      {
        id: 3,
        week_start: '2026-06-01',
        photo_a_id: 10,
        photo_b_id: 11,
        status: 'active',
        created_at: '2026-06-01T12:00:00Z',
      },
    ]);

    const response = await matchupCloseActivePost({
      request: adminPostRequest('/api/admin/matchup/close-active'),
      env: { ADMIN_TOKEN: 'secret', DB: db },
    });

    expect(response.status).toBe(200);
    expect(matchups[0].status).toBe('closed');
  });
});

describe('public matchup read paths', () => {
  it('returns empty items when no active matchup photos resolve', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input);
      if (url.includes('/api/photos/list') || url.includes('/api/photos/get')) {
        return Promise.resolve(jsonResponse({ ok: true, items: [], item: null }));
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    const db = {
      prepare: vi.fn((sql: string) => ({
        bind: () => ({
          first: async () => null,
          all: async () => ({ results: [] }),
        }),
        first: async () => {
          if (sql.includes("date('now'")) return { week_start: '2026-06-01' };
          return null;
        },
      })),
    };

    const request = new Request('https://www.lougehrigfanclub.com/api/matchup/current');
    const response = await publicMatchupCurrentGet({ request, env: { DB: db } });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true, items: [] });
  });

  it('returns zero totals when results week_start is missing', async () => {
    const db = {
      prepare: vi.fn(() => ({
        bind: () => ({
          first: async () => null,
        }),
        first: async () => null,
      })),
    };

    const response = await publicMatchupResultsGet({
      request: new Request('https://www.lougehrigfanclub.com/api/matchup/results'),
      env: { DB: db },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      week_start: null,
      totals: { a: 0, b: 0 },
    });
  });
});
