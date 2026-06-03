/**
 * Shared parsers for accepted repository source-issue accounting formats.
 */

export function linkedIssueNumber(body = '') {
	const sourceMarker = body.match(/<!--\s*orchestrator-source-issue:\s*(\d+)\s*-->/i);
	if (sourceMarker) return sourceMarker[1];

	const match = body.match(/(?:\*\*Issue:\*\*|Issue:)\s*(?:https?:\/\/github\.com\/[^/\s]+\/[^/\s]+\/issues\/|#)(\d+)/i);
	return match ? match[1] : '';
}
