import { describe, expect, it, vi } from 'vitest';

import { onRequestGet as libraryGet } from '../functions/api/fanclub/library';

// Verifies the real dual-read application path (functions/api/fanclub/library.ts +
// functions/_lib/content-inventory-public.ts + content-inventory-rotation.ts) against
// mixed legacy/canonical states, per #2912's requirement — not a re-test of #2911's
// migration tooling, which is read-only evidence for this task.

function memberRequest(path: string): Request {
  return new Request(`https://www.lougehrigfanclub.com${path}`, {
    headers: { Cookie: 'lgfc_session=session-1' },
  });
}

type InventoryRow = Record<string, unknown>;
type LegacyRow = Record<string, unknown>;

function makeLibraryDb(options?: {
  inventory?: InventoryRow[];
  library?: LegacyRow[];
  libraryTableExists?: boolean;
  sessionEmail?: string;
}) {
  const inventory = options?.inventory ?? [];
  const library = options?.library ?? [];
  const libraryTableExists = options?.libraryTableExists ?? true;
  const sessionEmail = options?.sessionEmail ?? 'member@example.com';
  const knownTables = ['content_inventory', 'member_sessions', ...(libraryTableExists ? ['library_entries'] : [])];

  function matchesPublishedInventoryWhere(sql: string, row: InventoryRow): boolean {
    if (sql.includes("status = 'published'") && row.status !== 'published') return false;
    if (sql.includes("LIKE '%library%'") && !String(row.allowed_sections || '').toLowerCase().includes('library')) return false;
    if (sql.includes("COALESCE(TRIM(source_name), '') != ''") && !String(row.source_name || '').trim()) return false;
    if (sql.includes("COALESCE(TRIM(credit_line), '') != ''") && !String(row.credit_line || '').trim()) return false;
    return true;
  }

  function filterInventory(sql: string, args: unknown[]): InventoryRow[] {
    let filtered = inventory.filter((row) => matchesPublishedInventoryWhere(sql, row));
    if (sql.includes('LIKE ?') && args.length) {
      const needle = String(args[0] || '').replace(/%/g, '').toLowerCase();
      if (needle) {
        filtered = filtered.filter((row) =>
          ['title', 'text', 'summary', 'search_text', 'credit_line', 'source_name', 'perspective_label']
            .some((field) => String(row[field] || '').toLowerCase().includes(needle)),
        );
      }
    }
    return filtered;
  }

  function filterLegacy(sql: string, args: unknown[]): LegacyRow[] {
    let filtered = [...library];
    if (sql.includes('title,\'\')) LIKE') && args.length) {
      const needle = String(args[0] || '').replace(/%/g, '').toLowerCase();
      if (needle) {
        filtered = filtered.filter(
          (row) => String(row.title || '').toLowerCase().includes(needle) || String(row.content || '').toLowerCase().includes(needle),
        );
      }
    }
    return filtered;
  }

  const db = {
    prepare: vi.fn((sql: string) => {
      const firstFn = async (args: unknown[] = []) => {
        if (sql.includes('sqlite_master')) {
          const table = String(args[0] || '');
          return knownTables.includes(table) ? { name: table } : null;
        }
        if (sql.includes('FROM member_sessions')) return { email: sessionEmail };
        if (sql.includes('COUNT(1)') && sql.includes('FROM content_inventory')) {
          return { n: filterInventory(sql, args).length };
        }
        if (sql.includes('COUNT(1)') && sql.includes('FROM library_entries')) {
          return { n: filterLegacy(sql, args).length };
        }
        return null;
      };
      const allFn = async (args: unknown[] = []) => {
        if (sql.includes('sqlite_master')) {
          const requested = args.length ? knownTables.filter((name) => args.includes(name)) : knownTables;
          return { results: requested.map((name) => ({ name })) };
        }
        if (sql.includes('FROM content_inventory')) return { results: filterInventory(sql, args) };
        if (sql.includes('FROM library_entries')) return { results: filterLegacy(sql, args) };
        return { results: [] };
      };
      return {
        all: () => allFn(),
        first: () => firstFn(),
        bind: (...args: unknown[]) => ({ all: () => allFn(args), first: () => firstFn(args) }),
      };
    }),
  };

  return { db };
}

async function callLibrary(db: unknown, path = '/api/fanclub/library') {
  const response = await libraryGet({ env: { DB: db }, request: memberRequest(path) } as never);
  const body = (await response.json()) as { ok: boolean; items: Array<Record<string, unknown>>; total: number };
  return { status: response.status, body };
}

const PUBLISHED_INVENTORY_ROW: InventoryRow = {
  id: 101,
  tag: 'legacy-library-1',
  title: 'Migrated Story',
  text: 'Migrated body text.',
  summary: 'Migrated summary',
  credit_line: 'Jane Fan',
  source_name: 'LGFC Fan Club Library (legacy submission)',
  status: 'published',
  allowed_sections: '["library"]',
  canonical: 1,
  priority: 0,
  feature_weight: 1,
  event_year: null,
};

describe('library dual-read — mixed legacy/canonical states (#2912)', () => {
  it('empty state: no inventory, no legacy rows -> empty result, no crash', async () => {
    const { db } = makeLibraryDb({ inventory: [], library: [] });
    const { status, body } = await callLibrary(db);
    expect(status).toBe(200);
    expect(body).toMatchObject({ ok: true, items: [], total: 0 });
  });

  it('empty state: library_entries table does not exist at all -> empty result, no crash', async () => {
    const { db } = makeLibraryDb({ inventory: [], library: [], libraryTableExists: false });
    const { status, body } = await callLibrary(db);
    expect(status).toBe(200);
    expect(body).toMatchObject({ ok: true, items: [], total: 0 });
  });

  it('legacy-only state: serves library_entries when no published inventory exists', async () => {
    const { db } = makeLibraryDb({
      inventory: [],
      library: [{ id: 1, title: 'Legacy Story', content: 'Legacy body content.', created_at: '2020-01-01T00:00:00Z' }],
    });
    const { body } = await callLibrary(db);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({ title: 'Legacy Story', year: 2020, author: null, url: null });
  });

  it('malformed legacy row: null/blank title and content do not crash the endpoint', async () => {
    const { db } = makeLibraryDb({
      inventory: [],
      library: [{ id: 2, title: null, content: '', created_at: null }],
    });
    const { status, body } = await callLibrary(db);
    expect(status).toBe(200);
    expect(body.items[0]).toMatchObject({ title: null, description: null, year: null });
  });

  it('canonical-only state: serves content_inventory when published rows exist and legacy is empty', async () => {
    const { db } = makeLibraryDb({ inventory: [PUBLISHED_INVENTORY_ROW], library: [] });
    const { body } = await callLibrary(db);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({ title: 'Migrated Story', author: 'Jane Fan' });
  });

  it('mixed/partial state: ANY published inventory row hides ALL not-yet-migrated legacy rows (section-level cutover, not per-row)', async () => {
    // This is the key #2910/#2911 "preserved fallback contract" behavior: cutover happens
    // per-section as soon as one row is eligible, not per already-migrated legacy id.
    // Documented explicitly here so #2913's batch planning accounts for it.
    const { db } = makeLibraryDb({
      inventory: [PUBLISHED_INVENTORY_ROW], // only legacy id 1 has been migrated+published
      library: [
        { id: 1, title: 'Now migrated', content: 'Now in inventory.', created_at: '2020-01-01T00:00:00Z' },
        { id: 2, title: 'Not yet migrated', content: 'Still legacy-only.', created_at: '2021-01-01T00:00:00Z' },
        { id: 3, title: 'Also not yet migrated', content: 'Still legacy-only too.', created_at: '2022-01-01T00:00:00Z' },
      ],
    });
    const { body } = await callLibrary(db);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].title).toBe('Migrated Story');
    // Confirms items 2 and 3 (unmigrated) are NOT visible during this partial state.
    expect(body.items.some((item) => item.title === 'Not yet migrated')).toBe(false);
  });

  it('draft-status legacy-tagged inventory row does not trigger cutover (duplicate-in-progress state)', async () => {
    // A row can exist in content_inventory with a legacy-library-* tag while still 'draft'
    // (e.g. mid-migration, not yet approved for publish). It must not count as "eligible"
    // and must not hide the still-authoritative legacy fallback.
    const draftRow = { ...PUBLISHED_INVENTORY_ROW, status: 'draft' };
    const { db } = makeLibraryDb({
      inventory: [draftRow],
      library: [{ id: 1, title: 'Still legacy', content: 'Still served from legacy.', created_at: '2020-01-01T00:00:00Z' }],
    });
    const { body } = await callLibrary(db);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].title).toBe('Still legacy');
  });

  it('query filtering works identically across both the inventory and legacy paths', async () => {
    const { db: inventoryDb } = makeLibraryDb({ inventory: [PUBLISHED_INVENTORY_ROW], library: [] });
    const inventoryMatch = await callLibrary(inventoryDb, '/api/fanclub/library?q=Migrated');
    expect(inventoryMatch.body.items).toHaveLength(1);
    const inventoryMiss = await callLibrary(inventoryDb, '/api/fanclub/library?q=NoSuchTerm');
    expect(inventoryMiss.body.items).toHaveLength(0);

    const { db: legacyDb } = makeLibraryDb({
      inventory: [],
      library: [{ id: 1, title: 'Findable Legacy Title', content: 'body', created_at: '2020-01-01T00:00:00Z' }],
    });
    const legacyMatch = await callLibrary(legacyDb, '/api/fanclub/library?q=Findable');
    expect(legacyMatch.body.items).toHaveLength(1);
    const legacyMiss = await callLibrary(legacyDb, '/api/fanclub/library?q=NoSuchTerm');
    expect(legacyMiss.body.items).toHaveLength(0);
  });

  it('repeated (retried) reads of an unchanged state are stable and side-effect-free', async () => {
    const { db } = makeLibraryDb({ inventory: [PUBLISHED_INVENTORY_ROW], library: [] });
    const first = await callLibrary(db);
    const second = await callLibrary(db);
    expect(second.body).toEqual(first.body);
  });
});
