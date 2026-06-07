import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminEditorialArchivePage from '@/app/admin/editorial/page';
import { onRequestGet as editorialListGet } from '../functions/api/admin/editorial/list';
import { onRequestPost as editorialReviewPost } from '../functions/api/admin/editorial/review';
import { onRequestPost as editorialPublishPost } from '../functions/api/admin/editorial/publish';
import { onRequestPost as librarySubmitPost } from '../functions/api/library/submit';
import { onRequestGet as fanclubLibraryGet } from '../functions/api/fanclub/library';

const mockUsePathname = vi.hoisted(() => vi.fn(() => '/admin/editorial'));

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

function adminPostRequest(path: string, body: unknown, token = 'secret'): Request {
  return new Request(`https://www.lougehrigfanclub.com${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
    body: JSON.stringify(body),
  });
}

function memberRequest(path: string, body?: unknown): Request {
  return new Request(`https://www.lougehrigfanclub.com${path}`, {
    method: body ? 'POST' : 'GET',
    headers: body
      ? { Cookie: 'lgfc_session=session-1', 'Content-Type': 'application/json' }
      : { Cookie: 'lgfc_session=session-1' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function makeEditorialDb(options?: {
  submissions?: Array<Record<string, unknown>>;
  inventory?: Array<Record<string, unknown>>;
  library?: Array<Record<string, unknown>>;
  sessionEmail?: string;
}) {
  const submissions = options?.submissions ?? [];
  const inventory = options?.inventory ?? [];
  const library = options?.library ?? [];
  const sessionEmail = options?.sessionEmail ?? 'member@example.com';
  const runs: Array<{ sql: string; args: unknown[] }> = [];
  const tableNames = ['submission_queue', 'content_inventory', 'library_entries', 'member_sessions', 'members'];

  function filterRows(sql: string, rows: Array<Record<string, unknown>>, args: unknown[]) {
    let filtered = rows;
    if (sql.includes("status = 'published'")) {
      filtered = filtered.filter((row) => !row.status || row.status === 'published');
    }
    if (sql.includes("LIKE '%library%'")) {
      filtered = filtered.filter((row) => !row.allowed_sections || String(row.allowed_sections).includes('library'));
    }

    const likeArg = args.find((arg) => typeof arg === 'string' && arg.includes('%'));
    if (typeof likeArg === 'string') {
      const needle = likeArg.replace(/%/g, '').toLowerCase();
      if (needle) {
        const fields = sql.includes('FROM library_entries')
          ? ['title', 'content']
          : ['title', 'text', 'summary', 'search_text', 'credit_line', 'source_name', 'perspective_label'];
        filtered = filtered.filter((row) =>
          fields.some((field) => String(row[field] || '').toLowerCase().includes(needle)),
        );
      }
    }

    return filtered;
  }

  const db = {
    prepare: vi.fn((sql: string) => {
      const allFn = async (args: unknown[] = []) => {
        if (sql.includes('sqlite_master')) {
          const requested = args.length ? tableNames.filter((name) => args.includes(name)) : tableNames;
          return { results: requested.map((name) => ({ name })) };
        }
        if (sql.includes('FROM submission_queue')) return { results: submissions };
        if (sql.includes('FROM content_inventory')) return { results: filterRows(sql, inventory, args) };
        if (sql.includes('FROM library_entries')) return { results: filterRows(sql, library, args) };
        return { results: [] };
      };

      const firstFn = async (args: unknown[] = []) => {
        if (sql.includes('sqlite_master')) {
          const table = String(args[0] || '');
          return tableNames.includes(table) ? { name: table } : null;
        }
        if (sql.includes('FROM member_sessions')) return { email: sessionEmail };
        if (sql.includes("SELECT datetime('now')")) return { now: '2026-06-02T12:00:00Z' };
        if (sql.includes('COUNT(1)') && sql.includes('FROM content_inventory')) {
          return { n: filterRows(sql, inventory, args).length };
        }
        if (sql.includes('COUNT(1)') && sql.includes('FROM library_entries')) {
          return { n: filterRows(sql, library, args).length };
        }
        if (sql.includes('FROM submission_queue')) return submissions[0] ?? null;
        if (sql.includes('FROM content_inventory')) return inventory[0] ?? null;
        return null;
      };

      const runFn = async (...args: unknown[]) => {
        runs.push({ sql, args });
        return { meta: { changes: 1, last_row_id: 44 } };
      };

      return {
        all: () => allFn(),
        first: () => firstFn(),
        run: () => runFn(),
        bind: (...args: unknown[]) => ({
          all: () => allFn(args),
          first: () => firstFn(args),
          run: () => runFn(...args),
        }),
      };
    }),
  };

  return { db, runs };
}

describe('admin editorial archive page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem('lgfc_admin_token', 'secret');
    mockUsePathname.mockReturnValue('/admin/editorial');
  });

  it('loads pending submissions and archive publication state with admin token', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({
        ok: true,
        submissions: [
          {
            submission_id: 9,
            submitted_by: 'Member <member@example.com>',
            title: 'Gehrig memory',
            description: 'A submitted memory for review.',
            proposed_tag: 'gehrig-memory',
            status: 'pending',
          },
        ],
        inventory: [
          {
            id: 4,
            tag: 'luckiest-man',
            title: 'Luckiest Man',
            text: 'Published text',
            story_type: 'brief',
            allowed_sections: '["library"]',
            priority: 1,
            canonical: 1,
            credit_line: 'Archive',
            status: 'draft',
          },
        ],
      }),
    );

    render(<AdminEditorialArchivePage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Gehrig memory' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Luckiest Man' })).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/editorial/list?limit=100',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('approves a submission into a content_inventory draft', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const path = String(input);
      if (path.startsWith('/api/admin/editorial/list')) {
        return Promise.resolve(
          jsonResponse({
            ok: true,
            submissions: [
              {
                submission_id: 9,
                submitted_by: 'Member <member@example.com>',
                title: 'Gehrig memory',
                description: 'A submitted memory for review.',
                proposed_tag: 'gehrig-memory',
                status: 'pending',
              },
            ],
            inventory: [],
          }),
        );
      }
      expect(path).toBe('/api/admin/editorial/review');
      expect(init?.method).toBe('POST');
      return Promise.resolve(jsonResponse({ ok: true, inventory_id: 44 }));
    });

    render(<AdminEditorialArchivePage />);

    await screen.findByRole('heading', { name: 'Gehrig memory' });
    fireEvent.click(screen.getByRole('button', { name: 'Approve as Draft' }));

    await waitFor(() => {
      const reviewCall = fetchMock.mock.calls.find(([path]) => path === '/api/admin/editorial/review');
      expect(reviewCall).toBeDefined();
      expect(JSON.parse(String(reviewCall?.[1]?.body))).toMatchObject({
        submission_id: 9,
        action: 'approve',
        tag: 'gehrig-memory',
        allowed_sections: ['library'],
      });
    });
  });
});

describe('editorial archive APIs', () => {
  it('rejects list requests without admin token', async () => {
    const response = await editorialListGet({
      request: adminGetRequest('/api/admin/editorial/list', ''),
      env: { ADMIN_TOKEN: 'secret', DB: makeEditorialDb().db },
    });

    expect(response.status).toBe(401);
  });

  it('lists submissions and content inventory records', async () => {
    const response = await editorialListGet({
      request: adminGetRequest('/api/admin/editorial/list'),
      env: {
        ADMIN_TOKEN: 'secret',
        DB: makeEditorialDb({
          submissions: [{ submission_id: 1, title: 'Pending story', status: 'pending' }],
          inventory: [{ id: 2, title: 'Draft story', status: 'draft' }],
        }).db,
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      submissions: [{ title: 'Pending story' }],
      inventory: [{ title: 'Draft story' }],
    });
  });

  it('approves pending submissions as draft content_inventory records', async () => {
    const { db, runs } = makeEditorialDb({
      submissions: [
        {
          submission_id: 7,
          submitted_by: 'Member <member@example.com>',
          title: 'Submitted story',
          description: 'Story text for editorial review.',
          proposed_tag: 'submitted-story',
          status: 'pending',
        },
      ],
    });

    const response = await editorialReviewPost({
      request: adminPostRequest('/api/admin/editorial/review', {
        submission_id: 7,
        action: 'approve',
        summary: 'A concise summary for archives.',
        perspective_label: 'Member perspective',
        source_name: 'Member interview',
        credit_line: 'Member <member@example.com>',
        event_year: 1939,
      }),
      env: { ADMIN_TOKEN: 'secret', DB: db },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      action: 'approve',
      inventory_id: 44,
    });
    const insertRun = runs.find((run) => run.sql.includes('INSERT INTO content_inventory'));
    expect(insertRun).toBeDefined();
    expect(insertRun?.args).toEqual(
      expect.arrayContaining([
        'A concise summary for archives.',
        'Member perspective',
        'Member interview',
        1939,
      ]),
    );
    expect(runs.some((run) => run.sql.includes("status = 'approved'"))).toBe(true);
  });

  it('does not coerce blank event_year values to zero', async () => {
    const { db, runs } = makeEditorialDb({
      submissions: [
        {
          submission_id: 7,
          submitted_by: 'Member <member@example.com>',
          title: 'Submitted story',
          description: 'Story text for editorial review.',
          proposed_tag: 'submitted-story',
          status: 'pending',
        },
      ],
    });

    const response = await editorialReviewPost({
      request: adminPostRequest('/api/admin/editorial/review', {
        submission_id: 7,
        action: 'approve',
        source_name: 'Member interview',
        credit_line: 'Member <member@example.com>',
        event_year: '   ',
      }),
      env: { ADMIN_TOKEN: 'secret', DB: db },
    });

    expect(response.status).toBe(200);
    const insertRun = runs.find((run) => run.sql.includes('INSERT INTO content_inventory'));
    expect(insertRun?.args[15]).toBeNull();
  });

  it('updates publication state for archive records', async () => {
    const { db, runs } = makeEditorialDb({
      inventory: [{ id: 4, status: 'draft', source_name: 'Archive', credit_line: 'LGFC Archive' }],
    });

    const response = await editorialPublishPost({
      request: adminPostRequest('/api/admin/editorial/publish', { id: 4, status: 'published' }),
      env: { ADMIN_TOKEN: 'secret', DB: db },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      id: 4,
      status: 'published',
    });
    expect(runs.some((run) => run.sql.includes('UPDATE content_inventory'))).toBe(true);
  });

  it('rejects publishing content_inventory records without required attribution', async () => {
    const { db, runs } = makeEditorialDb({
      inventory: [{ id: 4, status: 'draft', source_name: '', credit_line: 'LGFC Archive' }],
    });

    const response = await editorialPublishPost({
      request: adminPostRequest('/api/admin/editorial/publish', { id: 4, status: 'published' }),
      env: { ADMIN_TOKEN: 'secret', DB: db },
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'Published content_inventory records require source_name and credit_line.',
    });
    expect(runs.some((run) => run.sql.includes('UPDATE content_inventory'))).toBe(false);
  });
});

describe('member submissions and library archive reads', () => {
  it('queues member library submissions for editorial review', async () => {
    const { db, runs } = makeEditorialDb();

    const response = await librarySubmitPost({
      request: memberRequest('/api/library/submit', {
        name: 'Member Name',
        title: 'A long submitted story',
        content: 'This is a submitted story with enough body text for review.',
      }),
      env: { DB: db },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      message: 'Submission queued for editorial review',
    });
    expect(runs.some((run) => run.sql.includes('INSERT INTO submission_queue'))).toBe(true);
  });

  it('returns only published content_inventory records for member library reads', async () => {
    const response = await fanclubLibraryGet({
      request: memberRequest('/api/fanclub/library?page=1'),
      env: {
        DB: makeEditorialDb({
          inventory: [
            {
              id: 5,
              title: 'Published archive story',
              text: 'A published archive story for members.',
              summary: 'Published archive summary.',
              credit_line: 'LGFC Archive',
              event_date: '1939-07-04',
              event_year: 1939,
              updated_at: '2026-06-02T12:00:00Z',
            },
          ],
        }).db,
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      items: [
        {
          title: 'Published archive story',
          author: 'LGFC Archive',
          year: 1939,
          description: 'Published archive summary.',
        },
      ],
    });
  });

  it('falls back to legacy library_entries when no eligible inventory rows exist', async () => {
    const response = await fanclubLibraryGet({
      request: memberRequest('/api/fanclub/library?page=1'),
      env: {
        DB: makeEditorialDb({
          library: [
            {
              id: 12,
              title: 'Legacy library story',
              content: 'Legacy library content remains available.',
              created_at: '2020-01-02T00:00:00Z',
            },
          ],
        }).db,
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      total: 1,
      items: [
        {
          title: 'Legacy library story',
          content: 'Legacy library content remains available.',
          year: 2020,
        },
      ],
    });
  });

  it('does not fall back to library_entries for an empty inventory search when inventory is eligible', async () => {
    const response = await fanclubLibraryGet({
      request: memberRequest('/api/fanclub/library?q=nomatch&page=1'),
      env: {
        DB: makeEditorialDb({
          inventory: [
            {
              id: 5,
              title: 'Published archive story',
              text: 'A published archive story for members.',
              credit_line: 'LGFC Archive',
              status: 'published',
              allowed_sections: '["library"]',
              updated_at: '2026-06-02T12:00:00Z',
            },
          ],
          library: [
            {
              id: 12,
              title: 'Legacy library story',
              content: 'Legacy library content remains available.',
              created_at: '2020-01-02T00:00:00Z',
            },
          ],
        }).db,
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      total: 0,
      items: [],
    });
  });
});
