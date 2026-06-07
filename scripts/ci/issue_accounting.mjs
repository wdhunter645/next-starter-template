/**
 * Shared parsers for accepted repository source-issue accounting formats.
 */

export function repositoryParts(repository = '') {
	const repoStr = repository === null ? '' : repository || process.env.GITHUB_REPOSITORY || '';
	const [owner = '', repo = ''] = String(repoStr).split('/');
	return { owner, repo };
}

export function normalizeIssueReferenceLine(line = '') {
	return String(line || '')
		.trim()
		.replace(/^[>\s]*[-*+]\s+/, '')
		.replace(/[`*_]+/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

export function issueRefTokens(value = '') {
	const tokenPattern = /#\d+|https:\/\/github\.com\/[^\s)]+\/[^\s)]+\/issues\/\d+\/?/gi;
	return String(value || '').match(tokenPattern) || [];
}

export function issueReferenceFromToken(token = '', { repository = '' } = {}) {
	const value = String(token || '').trim().replace(/[).,;]+$/g, '');
	const local = value.match(/^#(\d+)$/);
	if (local) {
		return { issueNumber: local[1], ref: value, sameRepository: true, external: false };
	}

	try {
		const { owner, repo } = repositoryParts(repository);
		const url = new URL(value);
		const parts = url.pathname.split('/').filter(Boolean);
		const issueNumber = parts.length === 4 && parts[2] === 'issues' && /^\d+$/.test(parts[3])
			? parts[3]
			: '';
		const sameRepository = Boolean(
			issueNumber &&
			url.hostname.toLowerCase() === 'github.com' &&
			(!owner || !repo || (parts[0].toLowerCase() === owner.toLowerCase() && parts[1].toLowerCase() === repo.toLowerCase())),
		);
		return { issueNumber, ref: value, sameRepository, external: Boolean(issueNumber && !sameRepository) };
	} catch {
		return { issueNumber: '', ref: value, sameRepository: false, external: false };
	}
}

export function sourceIssueAccounting(body = '', { repository = '' } = {}) {
	const refs = [];
	const invalidRefs = [];
	const sourceIssueLines = [];

	for (const line of String(body || '').split(/\r?\n/)) {
		if (/OPS\s+Tracker/i.test(line) || /Umbrella\s+Tracker/i.test(line)) continue;

		const normalizedLine = normalizeIssueReferenceLine(line);
		const semantic = normalizedLine.match(/^issue\b(?:\s*:)?\s*(.*)$/i);
		if (!semantic) continue;

		sourceIssueLines.push(line);
		const tokens = issueRefTokens(semantic[1]);
		if (!tokens.length) {
			invalidRefs.push({
				ref: semantic[1] || normalizedLine,
				source: 'primary-body-line',
				reason: 'missing_issue_reference',
			});
			continue;
		}

		for (const token of tokens) {
			const parsed = issueReferenceFromToken(token, { repository });
			if (parsed.issueNumber && parsed.sameRepository) {
				refs.push({ issueNumber: parsed.issueNumber, ref: parsed.ref, source: 'primary-body-line' });
			} else {
				invalidRefs.push({
					ref: parsed.ref,
					source: 'primary-body-line',
					reason: parsed.external ? 'external_repository_issue' : 'invalid_issue_reference',
				});
			}
		}
	}

	const issueNumbers = [...new Set(refs.map((ref) => ref.issueNumber))];
	const sourceIssueCandidates = [
		...refs.map((ref) => `#${ref.issueNumber}`),
		...invalidRefs.map((ref) => ref.ref),
	];
	const failures = [];

	if (!refs.length && !invalidRefs.length) {
		failures.push({
			code: 'missing_source_issue',
			message: 'Merged PR body does not contain a primary source issue line.',
		});
	}
	if (invalidRefs.length) {
		failures.push({
			code: 'invalid_source_issue_reference',
			message: `Merged PR body contains invalid or external source issue reference(s): ${invalidRefs.map((ref) => ref.ref).join(', ')}`,
		});
	}
	if (sourceIssueLines.length > 1 || refs.length > 1 || issueNumbers.length > 1) {
		failures.push({
			code: 'multiple_source_issues',
			message: 'Merged PR body contains multiple source issue references; closeout requires exactly one same-repository source issue line.',
		});
	}

	return {
		refs,
		invalidRefs,
		sourceIssueLines,
		issueNumbers,
		sourceIssueCandidates,
		failures,
		issueNumber: failures.length === 0 && issueNumbers.length === 1 ? issueNumbers[0] : '',
	};
}

export function linkedIssueNumber(body = '') {
	const sourceMarker = body.match(/<!--\s*orchestrator-source-issue:\s*(\d+)\s*-->/i);
	if (sourceMarker) return sourceMarker[1];

	return sourceIssueAccounting(body, { repository: null }).issueNumber;
}
