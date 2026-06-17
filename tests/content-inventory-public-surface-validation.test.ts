import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  LIBRARY_SECTION,
  RELATED_CONTENT_SECTION,
  SEARCH_SECTION,
  publishedInventoryWhere,
} from '../functions/_lib/content-inventory-public';
import {
  flattenPilotRecords,
  PILOT_CONTENT_PACK,
  verifyPilotPublicReads,
} from '../functions/_lib/content-inventory-seed';

/** Admin-declared allowed_sections keys (#1256 content inventory model). */
export const CONTENT_INVENTORY_ALLOWED_SECTIONS = [
  'homepage_spotlight',
  'homepage_discussions',
  'homepage_milestones',
  'library',
  'search',
  'archive',
  'related_content',
] as const;

/** Public/member surfaces in Task 006 acceptance criteria scope. */
export const CONTENT_INVENTORY_WIRED_SURFACES = [
  {
    surface: 'search',
    route: '/search',
    pageFile: 'src/app/search/page.tsx',
    apiRoute: '/api/search',
    apiFile: 'functions/api/search.ts',
    section: SEARCH_SECTION,
    auth: 'public',
  },
  {
    surface: 'library',
    route: '/fanclub/library',
    pageFile: 'src/app/fanclub/library/page.tsx',
    apiRoute: '/api/fanclub/library',
    apiFile: 'functions/api/fanclub/library.ts',
    section: LIBRARY_SECTION,
    auth: 'member',
  },
] as const;

/** Member inventory-adjacent surface outside Task 006 AC list. */
export const CONTENT_INVENTORY_RELATED_SURFACE = {
  surface: 'related_content',
  apiRoute: '/api/content-inventory/related',
  apiFile: 'functions/api/content-inventory/related.ts',
  memorabiliaApiFile: 'functions/api/fanclub/memorabilia.ts',
  section: RELATED_CONTENT_SECTION,
} as const;

/** Surfaces named in Task 006 AC that do not yet render content_inventory. */
export const CONTENT_INVENTORY_DEFERRED_SURFACES = [
  {
    surface: 'homepage',
    route: '/',
    pageFile: 'src/app/page.tsx',
    reason: 'Homepage uses CMS spotlight and legacy D1 tables; homepage_* inventory sections reserved',
  },
  {
    surface: 'milestones',
    route: '/#milestones',
    pageFile: 'src/components/MilestonesSection.tsx',
    reason: 'Milestones section reads milestones table via /api/milestones/list',
  },
] as const;

function readSource(path: string): string {
  expect(existsSync(path), `Missing file: ${path}`).toBe(true);
  return readFileSync(path, 'utf8');
}

describe('content inventory public surface contract (#1259 Task 006)', () => {
  it('ships admin-declared allowed_sections keys on disk', () => {
    const source = readSource('src/app/admin/editorial/page.tsx');
    for (const key of CONTENT_INVENTORY_ALLOWED_SECTIONS) {
      expect(source, `Missing allowed_sections key: ${key}`).toContain(`'${key}'`);
    }
  });

  it('maps wired inventory surfaces to page files and API handlers', () => {
    for (const entry of CONTENT_INVENTORY_WIRED_SURFACES) {
      expect(existsSync(entry.pageFile), `Missing page: ${entry.pageFile}`).toBe(true);
      expect(existsSync(entry.apiFile), `Missing API: ${entry.apiFile}`).toBe(true);

      const pageSource = readSource(entry.pageFile);
      expect(pageSource, `${entry.pageFile} should call ${entry.apiRoute}`).toContain(entry.apiRoute);

      const apiSource = readSource(entry.apiFile);
      expect(apiSource, `${entry.apiFile} should filter section ${entry.section}`).toContain(entry.section);
    }
  });

  it('documents deferred homepage and milestones inventory surfaces', () => {
    for (const entry of CONTENT_INVENTORY_DEFERRED_SURFACES) {
      expect(existsSync(entry.pageFile), `Missing file: ${entry.pageFile}`).toBe(true);
      const source = readSource(entry.pageFile);
      expect(source.includes('content_inventory'), `${entry.surface} should not read content_inventory yet`).toBe(
        false,
      );
    }

    const milestones = readSource('src/components/MilestonesSection.tsx');
    expect(milestones).toContain('/api/milestones/list');

    const homepage = readSource('src/app/page.tsx');
    expect(homepage.includes('content_inventory')).toBe(false);
  });

  it('uses publishedInventoryWhere section gating in public inventory APIs', () => {
    const libraryWhere = publishedInventoryWhere(LIBRARY_SECTION);
    expect(libraryWhere).toContain("status = 'published'");
    expect(libraryWhere).toContain(LIBRARY_SECTION);

    const searchApi = readSource('functions/api/search.ts');
    expect(searchApi).toContain(SEARCH_SECTION);
    expect(searchApi).toContain(LIBRARY_SECTION);

    const relatedLib = readSource('functions/_lib/content-inventory-public.ts');
    expect(relatedLib).toContain(RELATED_CONTENT_SECTION);
    expect(relatedLib).toContain('resolveRelatedStories');

    const relatedApi = readSource(CONTENT_INVENTORY_RELATED_SURFACE.apiFile);
    expect(relatedApi).toContain('resolveRelatedStories');
  });

  it('wires related_content through member memorabilia and related APIs', () => {
    const memorabiliaApi = readSource(CONTENT_INVENTORY_RELATED_SURFACE.memorabiliaApiFile);
    expect(memorabiliaApi).toContain('resolveRelatedStories');
  });

  it('ships baseline content-inventory test coverage from Program #1256', () => {
    const expected = [
      'tests/content-inventory-public.test.ts',
      'tests/content-inventory-search.test.ts',
      'tests/content-inventory-rotation.test.ts',
      'tests/content-inventory-seed.test.ts',
    ];
    const missing = expected.filter((file) => !existsSync(file));
    expect(missing, `Missing baseline tests: ${missing.join(', ')}`).toEqual([]);
  });

  it('passes pilot-pack public read spot-checks for search and library sections', async () => {
    const inventory = flattenPilotRecords(PILOT_CONTENT_PACK.inventory);
    const media = flattenPilotRecords(PILOT_CONTENT_PACK.media_associations);
    const photos = flattenPilotRecords(PILOT_CONTENT_PACK.photos);

    const result = await verifyPilotPublicReads(inventory, media, photos);
    expect(result.ok).toBe(true);

    const checkNames = result.checks.map((check) => check.name);
    expect(checkNames).toContain('public:search-event-year');
    expect(checkNames).toContain('public:search-media-associated');
    expect(checkNames).toContain('public:library-count');
    expect(checkNames).toContain('public:draft-excluded');
  });

  it('keeps search page on the public-core route catalog', () => {
    const searchPage = join('src', 'app', 'search', 'page.tsx');
    expect(existsSync(searchPage)).toBe(true);
    const source = readSource(searchPage);
    expect(source).toContain("type SearchResult");
    expect(source).toContain('/api/search');
  });
});
