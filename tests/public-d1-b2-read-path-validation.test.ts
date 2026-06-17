import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

import { onRequestGet as getContent } from '../functions/api/content/get';
import { onRequestGet as getEventsMonth } from '../functions/api/events/month';
import { onRequestGet as getEventsNext } from '../functions/api/events/next';
import { onRequestGet as getFaqList } from '../functions/api/faq/list';
import { onRequestGet as getFooterQuote } from '../functions/api/footer-quote';
import { onRequestGet as getFriends } from '../functions/api/friends/list';
import { onRequestGet as getHealth } from '../functions/api/health';
import { onRequestGet as getMilestones } from '../functions/api/milestones/list';
import { onRequestGet as getPhotosList } from '../functions/api/photos/list';
import { onRequestGet as getSearch } from '../functions/api/search';

/** Public read APIs inventoried in Task 001 gap analysis (#1259). */
export const PUBLIC_D1_B2_READ_PATHS = [
  { route: '/api/health', file: 'functions/api/health.ts' },
  { route: '/api/footer-quote', file: 'functions/api/footer-quote.ts' },
  { route: '/api/faq/list', file: 'functions/api/faq/list.ts' },
  { route: '/api/cms/get', file: 'functions/api/cms/get.ts' },
  { route: '/api/content/get', file: 'functions/api/content/get.ts' },
  { route: '/api/events/next', file: 'functions/api/events/next.ts' },
  { route: '/api/events/month', file: 'functions/api/events/month.ts' },
  { route: '/api/friends/list', file: 'functions/api/friends/list.ts' },
  { route: '/api/milestones/list', file: 'functions/api/milestones/list.ts' },
  { route: '/api/matchup/current', file: 'functions/api/matchup/current.ts' },
  { route: '/api/matchup/results', file: 'functions/api/matchup/results.ts' },
  { route: '/api/photos/list', file: 'functions/api/photos/list.ts' },
  { route: '/api/photos/get', file: 'functions/api/photos/get.ts' },
  { route: '/api/search', file: 'functions/api/search.ts' },
] as const;

const REQUIRE_D1_FILES = [
  'functions/api/friends/list.ts',
  'functions/api/milestones/list.ts',
  'functions/api/search.ts',
] as const;

const B2_NORMALIZE_FILES = [
  'functions/api/friends/list.ts',
  'functions/api/milestones/list.ts',
  'functions/api/photos/list.ts',
  'functions/api/photos/get.ts',
] as const;

function createRequest(path: string): Request {
  return new Request(`https://www.lougehrigfanclub.com${path}`);
}

function createContext(path: string, env: Record<string, unknown> = {}) {
  return {
    env,
    request: createRequest(path),
    waitUntil: vi.fn(),
  };
}

describe('D1/B2 public read-path contract (#1259 Task 005)', () => {
  it('ships the Task 001 public read API inventory on disk', () => {
    const missing = PUBLIC_D1_B2_READ_PATHS.filter(({ file }) => !existsSync(file));
    expect(missing.map(({ route }) => route), `Missing API files: ${missing.map(({ file }) => file).join(', ')}`).toEqual([]);
  });

  it('ships baseline D1/B2 fail-closed coverage', () => {
    expect(existsSync('tests/d1-b2-fail-closed.test.ts')).toBe(true);
    const baseline = readFileSync('tests/d1-b2-fail-closed.test.ts', 'utf8');
    expect(baseline).toContain('requireD1');
    expect(baseline).toContain('normalizePhotoUrl');
    expect(baseline).toContain('getMilestones');
    expect(baseline).toContain('getFriends');
  });

  it('uses requireD1 guards on homepage-critical list APIs', () => {
    for (const file of REQUIRE_D1_FILES) {
      const source = readFileSync(file, 'utf8');
      expect(source, `${file} should call requireD1`).toContain('requireD1(');
    }
  });

  it('normalizes B2 photo URLs on public media read paths', () => {
    for (const file of B2_NORMALIZE_FILES) {
      const source = readFileSync(file, 'utf8');
      expect(source, `${file} should normalize photo URLs`).toContain('normalizePhotoUrl');
    }
  });

  it('documents explicit 503 fail-closed handling in content/get', () => {
    const source = readFileSync('functions/api/content/get.ts', 'utf8');
    expect(source).toContain('Content temporarily unavailable');
    expect(source).toContain('status: 503');
  });
});

describe('D1/B2 public read-path fail-closed behavior (#1259 Task 005)', () => {
  it('returns 503 for milestones when D1 is unavailable', async () => {
    const response = await getMilestones(createContext('/api/milestones/list'));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'Database unavailable',
    });
  });

  it('returns 503 for friends when D1 is unavailable', async () => {
    const response = await getFriends(createContext('/api/friends/list'));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'Database unavailable',
    });
  });

  it('returns 503 for search when D1 is unavailable', async () => {
    const response = await getSearch(createContext('/api/search?q=lou'));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'Database unavailable',
    });
  });

  it('returns 503 for content/get when D1 and cache are unavailable', async () => {
    const response = await getContent(createContext('/api/content/get?slug=/'));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'Content temporarily unavailable',
    });
  });

  it('reports db_ok=false on /api/health when D1 is unavailable', async () => {
    const response = await getHealth(createContext('/api/health'));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      db_ok: false,
    });
  });

  it('does not silently succeed legacy D1 reads when the binding is missing', async () => {
    const cases = [
      { name: 'events/next', run: () => getEventsNext(createContext('/api/events/next')) },
      { name: 'events/month', run: () => getEventsMonth(createContext('/api/events/month')) },
      { name: 'faq/list', run: () => getFaqList(createContext('/api/faq/list')) },
      { name: 'photos/list', run: () => getPhotosList(createContext('/api/photos/list')) },
      { name: 'footer-quote', run: () => getFooterQuote(createContext('/api/footer-quote')) },
    ] as const;

    for (const { name, run } of cases) {
      const response = await run();
      expect(response.status, `${name} should not return 200 without D1`).toBeGreaterThanOrEqual(400);
      const body = await response.json();
      expect(body.ok, `${name} should not claim ok:true without D1`).toBe(false);
    }
  });
});
