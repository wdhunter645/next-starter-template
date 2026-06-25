export class GitHubRateLimitError extends Error {
	constructor(method, path, status, body = '') {
		super(`${method} ${path} failed: ${status} ${body}`.trim());
		this.name = 'GitHubRateLimitError';
		this.method = method;
		this.path = path;
		this.status = status;
		this.body = body;
	}
}

export function isGitHubRateLimitResponse(status, body = '') {
	const text = String(body || '');
	if (status === 429) return true;
	if (status === 403 && /rate limit|secondary rate limit/i.test(text)) return true;
	return false;
}

export function isGitHubRateLimitError(error) {
	return error instanceof GitHubRateLimitError;
}

export function computeBackoffDelayMs(attempt, initialBackoffMs = 1000, maxBackoffMs = 30000) {
	return Math.min(initialBackoffMs * 2 ** Math.max(attempt - 1, 0), maxBackoffMs);
}

export async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function githubRepoRequest({
	token,
	repository,
	path,
	method = 'GET',
	body,
	userAgent = 'lgfc-ci-github-issue-api',
	maxRetries = 3,
	initialBackoffMs = 1000,
	sleepFn = sleep,
	fetchFn = fetch,
} = {}) {
	let attempt = 0;

	while (true) {
		const response = await fetchFn(`https://api.github.com/repos/${repository}${path}`, {
			method,
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28',
				'User-Agent': userAgent,
				...(body ? { 'Content-Type': 'application/json' } : {}),
			},
			...(body ? { body: JSON.stringify(body) } : {}),
		});

		if (response.ok) {
			return response.status === 204 ? null : response.json();
		}

		const responseText = await response.text();
		if (isGitHubRateLimitResponse(response.status, responseText) && attempt < maxRetries) {
			attempt += 1;
			await sleepFn(computeBackoffDelayMs(attempt, initialBackoffMs));
			continue;
		}

		if (isGitHubRateLimitResponse(response.status, responseText)) {
			throw new GitHubRateLimitError(method, path, response.status, responseText);
		}

		throw new Error(`${method} ${path} failed: ${response.status} ${responseText}`);
	}
}
