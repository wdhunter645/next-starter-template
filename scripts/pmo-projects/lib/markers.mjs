export const GENERATED_BLOCK_BEGIN = '<!-- BEGIN LGFC GENERATED PROJECT TASK -->';
export const GENERATED_BLOCK_END = '<!-- END LGFC GENERATED PROJECT TASK -->';

export function projectMarker(slug, schemaVersion = 1) {
	return `<!-- lgfc-project-manifest:${slug}:v${schemaVersion} -->`;
}

export function taskMarker(slug, taskId) {
	return `<!-- lgfc-project-task:${slug}:${taskId} -->`;
}

export function extractTaskMarker(body = '') {
	const match = String(body).match(
		/<!--\s*lgfc-project-task:([a-z0-9-]+):([A-Za-z0-9._-]+)\s*-->/,
	);
	if (!match) return null;
	return { slug: match[1], taskId: match[2], marker: match[0] };
}

export function extractGeneratedBlock(body = '') {
	const text = String(body);
	const begin = text.indexOf(GENERATED_BLOCK_BEGIN);
	const end = text.indexOf(GENERATED_BLOCK_END);
	if (begin === -1 || end === -1 || end < begin) return null;
	return text.slice(begin, end + GENERATED_BLOCK_END.length);
}

/**
 * Replace or insert the materializer-owned generated block while preserving
 * human-authored content outside the delimited region.
 */
export function upsertGeneratedBlock(body, marker, generatedBlock) {
	const text = String(body || '');
	const existing = extractGeneratedBlock(text);
	if (existing) {
		return text.replace(existing, generatedBlock);
	}

	if (text.includes(marker)) {
		return text.replace(marker, `${marker}\n\n${generatedBlock}`);
	}

	const trimmed = text.trim();
	if (!trimmed) {
		return `${marker}\n\n${generatedBlock}\n`;
	}
	return `${marker}\n\n${generatedBlock}\n\n${trimmed}\n`;
}
