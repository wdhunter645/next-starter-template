import { describe, expect, it, vi } from 'vitest';

import {
  onRequestDelete,
  onRequestGet,
  onRequestPatch,
  onRequestPost,
  onRequestPut,
} from '../functions/api/_ai-review/page-snapshot';
import {
  AI_REVIEW_FANCLUB_SECTIONS,
  readAiReviewEnv,
  tokensMatch,
  validateAiReviewAccess,
} from '../src/lib/aiReviewAccess';

const REVIEW_TOKEN = 'test-review-token-value-32chars';

function createEnv(overrides: Record<string, string> = {}) {
  return {
    AI_REVIEW_ENABLED: 'true',
    AI_REVIEW_TOKEN: REVIEW_TOKEN,
    AI_REVIEW_ALLOW_ADMIN: 'false',
    ...overrides,
  };
}

function createContext(path: string, env: Record<string, string> = createEnv()) {
  return {
    env,
    request: new Request(`https://www.lougehrigfanclub.com/api/_ai-review/page-snapshot?${path}`),
    waitUntil: vi.fn(),
  };
}

describe('aiReviewAccess guard (#1973)', () => {
  it('fails closed when review mode is disabled', () => {
    const env = readAiReviewEnv({ AI_REVIEW_ENABLED: 'false', AI_REVIEW_TOKEN: REVIEW_TOKEN });
    expect(validateAiReviewAccess({ env, token: REVIEW_TOKEN, path: '/fanclub' })).toEqual({
      ok: false,
      status: 404,
    });
  });

  it('rejects missing or invalid tokens', () => {
    const env = readAiReviewEnv(createEnv());
    expect(validateAiReviewAccess({ env, token: '', path: '/fanclub' }).ok).toBe(false);
    expect(validateAiReviewAccess({ env, token: 'wrong-token', path: '/fanclub' }).ok).toBe(false);
  });

  it('accepts a valid token when enabled', () => {
    const env = readAiReviewEnv(createEnv());
    expect(validateAiReviewAccess({ env, token: REVIEW_TOKEN, path: '/fanclub' })).toEqual({
      ok: true,
      adminReview: false,
    });
  });

  it('blocks admin review unless AI_REVIEW_ALLOW_ADMIN is true', () => {
    const env = readAiReviewEnv(createEnv());
    expect(validateAiReviewAccess({ env, token: REVIEW_TOKEN, path: '/admin' })).toEqual({
      ok: false,
      status: 403,
    });

    const adminEnv = readAiReviewEnv(createEnv({ AI_REVIEW_ALLOW_ADMIN: 'true' }));
    expect(validateAiReviewAccess({ env: adminEnv, token: REVIEW_TOKEN, path: '/admin' })).toEqual({
      ok: true,
      adminReview: true,
    });
  });

  it('compares tokens in constant time', () => {
    expect(tokensMatch(REVIEW_TOKEN, REVIEW_TOKEN)).toBe(true);
    expect(tokensMatch(REVIEW_TOKEN, `${REVIEW_TOKEN}x`)).toBe(false);
  });
});

describe('AI review page-snapshot endpoint (#1973)', () => {
  it('returns 404 when review mode is disabled', async () => {
    const response = await onRequestGet(
      createContext('path=/fanclub&token=' + REVIEW_TOKEN, createEnv({ AI_REVIEW_ENABLED: 'false' })),
    );
    expect(response.status).toBe(404);
  });

  it('returns 403 for invalid token', async () => {
    const response = await onRequestGet(createContext('path=/fanclub&token=not-valid'));
    expect(response.status).toBe(403);
  });

  it('returns fanclub snapshot without echoing the token', async () => {
    const response = await onRequestGet(createContext(`path=/fanclub&token=${REVIEW_TOKEN}`));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).not.toContain(REVIEW_TOKEN);

    const payload = JSON.parse(body);
    expect(payload.reviewMode).toBe(true);
    expect(payload.path).toBe('/fanclub');
    expect(payload.sections).toEqual([...AI_REVIEW_FANCLUB_SECTIONS]);
    expect(payload.contentSources).toEqual({
      clubHome: 'static',
      fallback: 'static',
    });
  });

  it('rejects mutation methods', async () => {
    await expect(onRequestPost()).resolves.toMatchObject({ status: 405 });
    await expect(onRequestPut()).resolves.toMatchObject({ status: 405 });
    await expect(onRequestPatch()).resolves.toMatchObject({ status: 405 });
    await expect(onRequestDelete()).resolves.toMatchObject({ status: 405 });
  });

  it('blocks admin snapshot unless admin review is enabled', async () => {
    const blocked = await onRequestGet(createContext(`path=/admin&token=${REVIEW_TOKEN}`));
    expect(blocked.status).toBe(403);

    const allowed = await onRequestGet(
      createContext(`path=/admin&token=${REVIEW_TOKEN}`, createEnv({ AI_REVIEW_ALLOW_ADMIN: 'true' })),
    );
    expect(allowed.status).toBe(200);
    const payload = await allowed.json();
    expect(payload.adminReview).toBe(true);
    expect(payload.readOnly).toBe(true);
  });
});
