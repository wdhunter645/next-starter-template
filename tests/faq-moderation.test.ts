import { describe, expect, it } from 'vitest';

import {
  askStatusesForFilter,
  isPublishedFaqStatus,
  normalizeFaqStatus,
  parsePinned,
  parsePositiveInt,
  validateFaqAnswer,
  validateFaqQuestion,
} from '../functions/_lib/faqModeration';

describe('faq moderation helpers', () => {
  it('parses positive integers fail-closed', () => {
    expect(parsePositiveInt(3)).toBe(3);
    expect(parsePositiveInt('4')).toBe(4);
    expect(parsePositiveInt(0)).toBeNull();
    expect(parsePositiveInt('abc')).toBeNull();
  });

  it('parses pinned values strictly', () => {
    expect(parsePinned(1)).toBe(1);
    expect(parsePinned(0)).toBe(0);
    expect(parsePinned(2)).toBeNull();
  });

  it('validates FAQ question and answer', () => {
    expect(validateFaqQuestion('  How do I join?  ')).toBeNull();
    expect(validateFaqQuestion('   ')).toMatch(/required/i);
    expect(validateFaqAnswer('Answer text', true)).toBeNull();
    expect(validateFaqAnswer('', true)).toMatch(/required/i);
    expect(validateFaqAnswer('', false)).toBeNull();
  });

  it('normalizes FAQ status values', () => {
    expect(normalizeFaqStatus('approved')).toBe('approved');
    expect(normalizeFaqStatus('PENDING')).toBe('pending');
    expect(normalizeFaqStatus('hidden')).toBeNull();
  });

  it('maps ask inbox filters to status sets', () => {
    expect(askStatusesForFilter('pending')).toEqual(['open', 'pending']);
    expect(askStatusesForFilter('approved')).toEqual(['approved']);
    expect(askStatusesForFilter('rejected')).toEqual(['rejected', 'hidden']);
    expect(askStatusesForFilter('archived')).toEqual(['archived']);
  });

  it('detects published FAQ status', () => {
    expect(isPublishedFaqStatus('approved')).toBe(true);
    expect(isPublishedFaqStatus('pending')).toBe(false);
  });
});

describe('admin auth fail-closed', () => {
  it('rejects missing or invalid admin token', async () => {
    const { requireAdmin } = await import('../functions/_lib/auth');

    const unconfigured = requireAdmin(new Request('https://example.com'), { ADMIN_TOKEN: '' });
    expect(unconfigured?.status).toBe(503);

    const unauthorized = requireAdmin(new Request('https://example.com'), { ADMIN_TOKEN: 'secret' });
    expect(unauthorized?.status).toBe(401);

    const ok = requireAdmin(
      new Request('https://example.com', { headers: { 'x-admin-token': 'secret' } }),
      { ADMIN_TOKEN: 'secret' },
    );
    expect(ok).toBeNull();
  });
});
