export async function githubRepoRequest({
	token,
	repository,
	path,
	method = 'GET',
	body,
	userAgent = 'lgfc-ci-github-issue-api',
}) {
	const response = await fetch(`https://api.github.com/repos/${repository}${path}`, {
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

	if (!response.ok) {
		throw new Error(`${method} ${path} failed: ${response.status} ${await response.text()}`);
	}

	return response.status === 204 ? null : response.json();
}
