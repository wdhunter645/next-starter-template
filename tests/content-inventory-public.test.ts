import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  countPublishedInventoryForSection,
  fetchRelatedInventoryStories,
  mapPublicInventoryStory,
  parseInventoryYear,
  publishedInventoryWhere,
  RELATED_CONTENT_SECTION,
  resolveRelatedStories,
  toLegacyRelatedLibraryEntries,
} from '../functions/_lib/content-inventory-public';
import { onRequestGet as relatedGet } from '../functions/api/content-inventory/related';
import { onRequestGet as memorabiliaGet } from '../functions/api/fanclub/memorabilia';

function memberRequest(path: string): Request {
  return new Request(`https://www.lougehrigfanclub.com${path}`, {
    headers: { Cookie: 'lgfc_session=session-1' },
  });
}

function makePublicInventoryDb(options?: {
  inventory?: Array<Record<string, unknown>>;
  library?: Array<Record<string, unknown>>;
  photos?: Array<Record<string, unknown>>;
  sessionEmail?: string;
}) {
  const inventory = options?.inventory ?? [];
  const library = options?.library ?? [];
  const photos = options?.photos ?? [];
  const sessionEmail = options?.sessionEmail ?? 'member@example.com';
  const tableNames = ['content_inventory', 'library_entries', 'photos', 'member_sessions', 'members'];

  function matchesInventoryWhere(sql: string, row: Record<string, unknown>): boolean {
    if (sql.includes("status = 'published'") && row.status !== 'published') return false;
    if (sql.includes("LIKE '%library%'") && !String(row.allowed_sections || '').includes('library')) return false;
    if (sql.includes("LIKE '%related_content%'") && !String(row.allowed_sections || '').includes('related_content')) return false;
    if (sql.includes("COALESCE(TRIM(source_name), '') != ''") && !String(row.source_name || '').trim()) return false;
    if (sql.includes("COALESCE(TRIM(credit_line), '') != ''") && !String(row.credit_line || '').trim()) return false;
    if (sql.includes('id != ?')) return true;
    if (sql.includes('event_year = ?')) return true;
    if (sql.includes('lower(COALESCE(tag')) return true;
    if (sql.includes('lower(COALESCE(rotation_group')) return true;

    const likeNeedle = sql.match(/LIKE \?/g);
    if (likeNeedle) {
      // Text search handled by bind args in integration paths; keep permissive for simple mocks.
      return true;
    }

    return true;
  }

  function filterInventory(sql: string, rows: Array<Record<string, unknown>>, args: unknown[] = []) {
    let filtered = rows.filter((row) => matchesInventoryWhere(sql, row));

    if (sql.includes('lower(COALESCE(tag,\'\')) = ?')) {
      const tagArg = args.find((arg) => typeof arg === 'string' && !String(arg).includes('%'));
      if (typeof tagArg === 'string') {
        filtered = filtered.filter((row) => String(row.tag || '').toLowerCase() === tagArg.toLowerCase());
      }
    }

    if (sql.includes('event_year = ?')) {
      const yearArg = args.find((arg) => typeof arg === 'number');
      if (typeof yearArg === 'number') {
        filtered = filtered.filter((row) => Number(row.event_year) === yearArg);
      }
    }

    if (sql.includes('id != ?')) {
      const excludeId = args.find((arg) => typeof arg === 'number');
      if (typeof excludeId === 'number') {
        filtered = filtered.filter((row) => Number(row.id) !== excludeId);
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
        if (sql.includes('FROM content_inventory')) {
          let results = filterInventory(sql, inventory, args);
          if (sql.includes('ORDER BY canonical DESC')) {
            results = [...results].sort((a, b) => {
              const canonicalDelta = Number(b.canonical ?? 0) - Number(a.canonical ?? 0);
              if (canonicalDelta !== 0) return canonicalDelta;
              const priorityDelta = Number(b.priority ?? 0) - Number(a.priority ?? 0);
              if (priorityDelta !== 0) return priorityDelta;
              return Number(a.id ?? 0) - Number(b.id ?? 0);
            });
          }
          return { results };
        }
        if (sql.includes('FROM library_entries')) return { results: library };
        if (sql.includes('FROM photos')) return { results: photos };
        return { results: [] };
      };

      const firstFn = async (args: unknown[] = []) => {
        if (sql.includes('sqlite_master')) {
          const table = String(args[0] || '');
          return tableNames.includes(table) ? { name: table } : null;
        }
        if (sql.includes('FROM member_sessions')) return { email: sessionEmail };
        if (sql.includes('COUNT(1)') && sql.includes('FROM content_inventory')) {
          return { n: filterInventory(sql, inventory, args).length };
        }
        return null;
      };

      return {
        all: () => allFn(),
        first: () => firstFn(),
        bind: (...args: unknown[]) => ({
          all: () => allFn(args),
          first: () => firstFn(args),
        }),
      };
    }),
  };

  return { db };
}

describe('content-inventory-public helpers', () => {
  it('parses inventory year from event_year or event_date', () => {
    expect(parseInventoryYear(1939, '1939-07-04')).toBe(1939);
    expect(parseInventoryYear('   ', '1939-07-04')).toBe(1939);
    expect(parseInventoryYear(null, null)).toBeNull();
  });

  it('maps published inventory rows with attribution and excerpt', () => {
    const mapped = mapPublicInventoryStory({
      id: 3,
      title: 'Luckiest Man',
      text: 'Today I consider myself the luckiest man on the face of the earth.',
      summary: 'Farewell summary',
      credit_line: 'Lou Gehrig',
      source_name: 'Yankee Stadium',
      event_year: 1939,
      tag: 'luckiest-man',
      perspective_label: null,
      canonical: 1,
    });

    expect(mapped).toMatchObject({
      id: 3,
      title: 'Luckiest Man',
      excerpt: 'Farewell summary',
      author: 'Lou Gehrig',
      year: 1939,
      canonical: true,
    });
  });

  it('requires publication attribution in published inventory where clause', () => {
    expect(publishedInventoryWhere(RELATED_CONTENT_SECTION)).toContain("status = 'published'");
    expect(publishedInventoryWhere(RELATED_CONTENT_SECTION)).toContain('related_content');
    expect(publishedInventoryWhere(RELATED_CONTENT_SECTION)).toContain('source_name');
    expect(publishedInventoryWhere(RELATED_CONTENT_SECTION)).toContain('credit_line');
  });
});

describe('related inventory resolution', () => {
  it('returns inventory related stories when eligible published rows exist', async () => {
    const { db } = makePublicInventoryDb({
      inventory: [
        {
          id: 1,
          tag: 'farewell',
          title: 'Farewell address',
          text: 'Luckiest man speech body',
          summary: 'Farewell summary',
          status: 'published',
          allowed_sections: '["related_content"]',
          source_name: 'Yankee Stadium',
          credit_line: 'Lou Gehrig',
          event_year: 1939,
          canonical: 1,
          priority: 5,
          updated_at: '2026-06-01T00:00:00Z',
        },
        {
          id: 2,
          tag: 'draft-only',
          title: 'Draft story',
          text: 'Hidden',
          status: 'draft',
          allowed_sections: '["related_content"]',
          source_name: 'Hidden',
          credit_line: 'Hidden',
          canonical: 1,
          priority: 1,
          updated_at: '2026-06-01T00:00:00Z',
        },
      ],
    });

    const resolved = await resolveRelatedStories(db, { limit: 5 });
    expect(resolved.source).toBe('content_inventory');
    expect(resolved.items).toHaveLength(1);
    expect(resolved.items[0]?.title).toBe('Farewell address');
  });

  it('falls back to library_entries when no eligible inventory related rows exist', async () => {
    const { db } = makePublicInventoryDb({
      inventory: [],
      library: [
        {
          id: 9,
          title: 'Legacy related story',
          content: 'Legacy body text for related snippet.',
          created_at: '2020-01-01T00:00:00Z',
        },
      ],
    });

    const resolved = await resolveRelatedStories(db, { limit: 5 });
    expect(resolved.source).toBe('library_entries');
    expect(resolved.items[0]?.title).toBe('Legacy related story');
  });

  it('prefers canonical inventory ordering in related fetches', async () => {
    const { db } = makePublicInventoryDb({
      inventory: [
        {
          id: 1,
          tag: 'shared-tag',
          title: 'Alternate view',
          text: 'Alternate body',
          status: 'published',
          allowed_sections: '["related_content"]',
          source_name: 'Archive',
          credit_line: 'Contributor',
          canonical: 0,
          priority: 10,
          updated_at: '2026-06-02T00:00:00Z',
        },
        {
          id: 2,
          tag: 'shared-tag',
          title: 'Canonical view',
          text: 'Canonical body',
          status: 'published',
          allowed_sections: '["related_content"]',
          source_name: 'Archive',
          credit_line: 'Contributor',
          canonical: 1,
          priority: 1,
          updated_at: '2026-06-01T00:00:00Z',
        },
      ],
    });

    const items = await fetchRelatedInventoryStories(db, { tag: 'shared-tag', limit: 5 });
    expect(items[0]?.title).toBe('Canonical view');
  });

  it('maps legacy related entries for memorabilia compatibility', () => {
    const legacy = toLegacyRelatedLibraryEntries([
      {
        id: 4,
        title: 'Story',
        excerpt: 'Excerpt text',
        summary: 'Excerpt text',
        author: 'Credit',
        year: 1939,
        tag: 'tag',
        perspective_label: null,
        canonical: true,
      },
    ]);

    expect(legacy).toEqual([{ id: 4, title: 'Story', excerpt: 'Excerpt text' }]);
  });
});

describe('content-inventory related API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects unauthenticated related reads', async () => {
    const response = await relatedGet({
      env: { DB: makePublicInventoryDb().db },
      request: new Request('https://www.lougehrigfanclub.com/api/content-inventory/related'),
    });

    expect(response.status).toBe(401);
  });

  it('returns inventory related stories for authenticated members', async () => {
    const { db } = makePublicInventoryDb({
      inventory: [
        {
          id: 7,
          tag: 'iron-horse',
          title: 'Iron Horse feature',
          text: 'Story body',
          summary: 'Summary',
          status: 'published',
          allowed_sections: '["related_content"]',
          source_name: 'LGFC',
          credit_line: 'Editorial team',
          canonical: 1,
          priority: 3,
          updated_at: '2026-06-03T00:00:00Z',
        },
      ],
    });

    const response = await relatedGet({
      env: { DB: db },
      request: memberRequest('/api/content-inventory/related?limit=5'),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      source: 'content_inventory',
      items: [{ title: 'Iron Horse feature', author: 'Editorial team' }],
    });
  });
});

describe('memorabilia related content integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('uses inventory related stories when eligible and exposes related_source', async () => {
    const { db } = makePublicInventoryDb({
      inventory: [
        {
          id: 11,
          tag: 'memorabilia-tag',
          title: 'Related inventory story',
          text: 'Related body',
          summary: 'Related summary',
          status: 'published',
          allowed_sections: '["related_content"]',
          source_name: 'LGFC Archive',
          credit_line: 'Archive team',
          canonical: 1,
          priority: 2,
          updated_at: '2026-06-04T00:00:00Z',
        },
      ],
      photos: [
        {
          id: 3,
          photo_id: 'photo-1',
          url: 'https://cdn.example.com/mem.jpg',
          title: 'Memorabilia item',
          description: 'Signed ball',
          tags: 'signed',
          is_memorabilia: 1,
        },
      ],
    });

    const response = await memorabiliaGet({
      env: { DB: db, PUBLIC_B2_BASE_URL: 'https://cdn.example.com' },
      request: memberRequest('/api/fanclub/memorabilia?page=1'),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      related_source: 'content_inventory',
      related_library_entries: [{ title: 'Related inventory story', excerpt: 'Related summary' }],
    });
  });

  it('falls back to library_entries related snippets when inventory is ineligible', async () => {
    const { db } = makePublicInventoryDb({
      inventory: [],
      library: [
        {
          id: 15,
          title: 'Legacy memorabilia story',
          content: 'Legacy related snippet body.',
          created_at: '2019-05-01T00:00:00Z',
        },
      ],
      photos: [
        {
          id: 1,
          photo_id: 'photo-2',
          url: 'https://cdn.example.com/mem2.jpg',
          title: 'Another item',
          description: 'Ticket stub',
          tags: 'ticket',
          is_memorabilia: 1,
        },
      ],
    });

    const response = await memorabiliaGet({
      env: { DB: db, PUBLIC_B2_BASE_URL: 'https://cdn.example.com' },
      request: memberRequest('/api/fanclub/memorabilia?page=1'),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      related_source: 'library_entries',
      related_library_entries: [{ title: 'Legacy memorabilia story' }],
    });
  });
});

describe('published inventory section counts', () => {
  it('excludes draft and unattributed rows from section eligibility counts', async () => {
    const { db } = makePublicInventoryDb({
      inventory: [
        {
          id: 1,
          status: 'published',
          allowed_sections: '["related_content"]',
          source_name: 'LGFC',
          credit_line: 'Editorial',
        },
        {
          id: 2,
          status: 'draft',
          allowed_sections: '["related_content"]',
          source_name: 'LGFC',
          credit_line: 'Editorial',
        },
        {
          id: 3,
          status: 'published',
          allowed_sections: '["related_content"]',
          source_name: '',
          credit_line: '',
        },
      ],
    });

    const count = await countPublishedInventoryForSection(db, RELATED_CONTENT_SECTION);
    expect(count).toBe(1);
  });
});
