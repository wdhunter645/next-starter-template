import { findUnlistedChangedFiles, parseAllowedFiles, extractMarkdownSection } from './pr_hygiene_audit.mjs';

export function extractSection(body = '', heading = '') {
	return extractMarkdownSection(body, heading);
}

function firstAvailableSection(body = '', headings = []) {
	for (const heading of headings) {
		const section = extractSection(body, heading);
		if (section) return section;
	}
	return '';
}

export function acceptanceCriteriaFailures(body = '') {
	const section = firstAvailableSection(body, ['Acceptance Criteria', 'ACCEPTANCE CRITERIA', 'ACCEPTANCE CRITERIA STATUS (MANDATORY)']);
	if (!section) return [];

	const failures = [];
	for (const line of section.split(/\r?\n/)) {
		if (/^\s*[-*]\s*\[\s\]\s+/.test(line)) {
			failures.push({
				code: 'unchecked_acceptance_criterion',
				message: `Acceptance criterion left unchecked at merge: ${line.trim()}`,
			});
		}
	}
	return failures;
}

export function verificationEvidenceFailures(body = '') {
	const section = firstAvailableSection(body, ['Verification', 'BUILD / TEST / VERIFICATION']);
	if (!section) return [];

	const failures = [];
	if (/\bResult\s+summary\b[\s\S]*?:\s*(?:-\s*)?PASS\s*\/\s*FAIL\s*\/\s*PENDING\b/i.test(section)) {
		failures.push({
			code: 'verification_placeholder',
			message: 'Merged PR body still contains the unchanged result-summary template placeholder.',
		});
	} else if (/\bResult\s+summary\b[^*:\n]*?(?:\*\*)?\s*:\s*(?:-\s*)?[\s\S]{0,40}\b(FAIL|PENDING)\b/i.test(section)) {
		failures.push({
			code: 'verification_not_pass',
			message: 'Merged PR body still reports FAIL or PENDING verification evidence.',
		});
	}

	if (/\bCommands\s+run\b[^*:\n]*?(?:\*\*)?\s*:\s*(?:-\s*)?[\s\S]{0,40}\b(Required:|none|TBD|TODO)\b/i.test(section)) {
		failures.push({
			code: 'missing_verification_commands',
			message: 'Merged PR body does not record executed verification commands.',
		});
	}

	if (/\bLocal verification:\b/i.test(section) && /\bResult:\s*(FAIL|PENDING)\b/i.test(section)) {
		failures.push({
			code: 'verification_not_pass',
			message: 'Merged PR body still reports FAIL or PENDING local verification evidence.',
		});
	}

	return failures;
}

export function allowlistEvidenceFailures({ body = '', files = [] } = {}) {
	const allowedFiles = parseAllowedFiles(body);
	if (!allowedFiles.length) {
		return [{
			code: 'missing_allowlist',
			message: 'Merged PR body does not declare a file-touch allowlist.',
		}];
	}

	const changedFiles = files
		.map((file) => (typeof file === 'string' ? file : file.filename || file.path))
		.filter(Boolean);
	const unlisted = findUnlistedChangedFiles(changedFiles, allowedFiles);

	return unlisted.map((file) => ({
		code: 'allowlist_violation',
		message: `Merged changed file is outside declared allowlist: ${file}`,
	}));
}

export function implementationEvidenceFailures({ body = '', files = [] } = {}) {
	return [
		...allowlistEvidenceFailures({ body, files }),
		...acceptanceCriteriaFailures(body),
		...verificationEvidenceFailures(body),
	];
}

export function summarizeImplementationEvidence(failures = []) {
	return {
		count: failures.length,
		codes: [...new Set(failures.map((failure) => failure.code))],
	};
}
