import { describe, expect, it, vi } from 'vitest';
import {
  githubApiRequestWithRetry,
} from '../scripts/ci/github_api_retry.mjs';

describe('github api transient retry helper', () => {
  it('retries transient 5xx responses and returns success data', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => 'service unavailable',
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ ok: true }),
      });
    const sleepFn = vi.fn(async () => {});

    const result = await githubApiRequestWithRetry({
      url: 'https://api.github.com/repos/owner/repo/pulls/1',
      fetchFn,
      sleepFn,
      initialBackoffMs: 10,
    });

    expect(result.data).toEqual({ ok: true });
    expect(result.attemptLog).toEqual([
      {
        attempt: 1,
        status: 503,
        outcome: 'retrying',
        classification: 'infrastructure-transient',
        delayMs: 10,
      },
      {
        attempt: 2,
        status: 200,
        outcome: 'success',
      },
    ]);
    expect(sleepFn).toHaveBeenCalledWith(10);
  });

  it('throws infrastructure classification after retry exhaustion', async () => {
    const fetchFn = vi.fn(async () => ({
      ok: false,
      status: 502,
      text: async () => 'bad gateway',
    }));

    await expect(
      githubApiRequestWithRetry({
        url: 'https://api.github.com/repos/owner/repo/pulls/1',
        fetchFn,
        sleepFn: async () => {},
        maxAttempts: 2,
        initialBackoffMs: 5,
      }),
    ).rejects.toEqual(expect.objectContaining({
      name: 'GitHubApiTransientError',
      classification: 'infrastructure-transient',
      attempts: 2,
      attemptLog: [
        {
          attempt: 1,
          status: 502,
          outcome: 'retrying',
          classification: 'infrastructure-transient',
          delayMs: 5,
        },
        {
          attempt: 2,
          status: 502,
          outcome: 'exhausted',
          classification: 'infrastructure-transient',
        },
      ],
    }));
  });

  it('fails immediately on deterministic non-retryable responses', async () => {
    const fetchFn = vi.fn(async () => ({
      ok: false,
      status: 404,
      text: async () => 'not found',
    }));

    await expect(
      githubApiRequestWithRetry({
        url: 'https://api.github.com/repos/owner/repo/pulls/1',
        fetchFn,
      }),
    ).rejects.toThrow('GET https://api.github.com/repos/owner/repo/pulls/1 failed: 404 not found');

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
