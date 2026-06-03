import { afterEach, describe, expect, it, vi } from 'vitest';
import { githubRepoRequest } from '../scripts/ci/github_issue_api.mjs';

describe('githubRepoRequest', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('sends authenticated JSON requests with the configured user agent', async () => {
		const fetchMock = vi.fn(async () => ({
			ok: true,
			status: 200,
			json: async () => [{ number: 1 }],
		}));
		vi.stubGlobal('fetch', fetchMock);

		const result = await githubRepoRequest({
			token: 'test-token',
			repository: 'owner/repo',
			path: '/issues?state=open',
			userAgent: 'lgfc-test-agent',
		});

		expect(result).toEqual([{ number: 1 }]);
		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.github.com/repos/owner/repo/issues?state=open',
			expect.objectContaining({
				method: 'GET',
				headers: expect.objectContaining({
					Authorization: 'Bearer test-token',
					Accept: 'application/vnd.github+json',
					'X-GitHub-Api-Version': '2022-11-28',
					'User-Agent': 'lgfc-test-agent',
				}),
			}),
		);
	});

	it('returns null for 204 responses', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({
				ok: true,
				status: 204,
			})),
		);

		await expect(
			githubRepoRequest({
				token: 'test-token',
				repository: 'owner/repo',
				path: '/issues/1',
				method: 'PATCH',
				body: { state: 'closed' },
			}),
		).resolves.toBeNull();
	});

	it('throws detailed errors for non-OK responses', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({
				ok: false,
				status: 403,
				text: async () => 'forbidden',
			})),
		);

		await expect(
			githubRepoRequest({
				token: 'test-token',
				repository: 'owner/repo',
				path: '/issues',
				method: 'POST',
				body: { title: 'test' },
			}),
		).rejects.toThrow('POST /issues failed: 403 forbidden');
	});
});
