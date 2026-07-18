import { describe, expect, it } from 'vitest';
import {
	acceptanceCriteriaFailures,
	allowlistEvidenceFailures,
	implementationEvidenceFailures,
	verificationEvidenceFailures,
} from '../scripts/ci/post_merge_implementation_evidence.mjs';

const body = [
	'- **Issue:** #1197',
	'',
	'## FILE-TOUCH ALLOWLIST (MANDATORY)',
	'Allowed files:',
	'- scripts/ci/**',
	'- tests/**',
	'',
	'All other files are out of scope',
	'',
	'## BUILD / TEST / VERIFICATION',
	'- Commands run:',
	'  - npm test — PASS',
	'- Result summary:',
	'  - PASS',
	'',
	'## ACCEPTANCE CRITERIA',
	'- [x] Post-merge checks report implementation evidence from merged code.',
	'- [ ] Failures create actionable remediation output.',
].join('\n');

describe('post-merge implementation evidence', () => {
	it('flags unchecked acceptance criteria', () => {
		expect(acceptanceCriteriaFailures(body)).toEqual([
			expect.objectContaining({ code: 'unchecked_acceptance_criterion' }),
		]);
	});

	it('flags allowlist violations for merged files', () => {
		expect(allowlistEvidenceFailures({ body, files: ['src/app/page.tsx'] })).toEqual([
			expect.objectContaining({ code: 'allowlist_violation' }),
		]);
	});

	it('does not flag removed files as allowlist violations', () => {
		expect(allowlistEvidenceFailures({
			body,
			files: [
				{ filename: 'scripts/ci/post_merge_validator.mjs', status: 'modified' },
				{ filename: '.github/workflows/update-docs.lock.yml', status: 'removed' },
			],
		})).toEqual([]);
	});

	it('flags pending verification evidence', () => {
		const pendingBody = body.replace('- Result summary:\n  - PASS', '- Result summary:\n  - PENDING');
		expect(verificationEvidenceFailures(pendingBody)).toEqual([
			expect.objectContaining({ code: 'verification_not_pass' }),
		]);
	});

	it('flags unchanged result summary template placeholder', () => {
		const placeholderBody = body.replace('- Result summary:\n  - PASS', '- Result summary:\n  - PASS / FAIL / PENDING');
		expect(verificationEvidenceFailures(placeholderBody)).toEqual([
			expect.objectContaining({ code: 'verification_placeholder' }),
		]);
	});

	it('flags local verification Result placeholder and empty Command (#2196)', () => {
		const localBody = [
			'## Verification',
			'',
			'Local verification:',
			'- Command: ``',
			'  Result: PASS / FAIL / NOT RUN',
			'',
			'CI verification:',
			'- Required checks expected to pass: YES',
		].join('\n');

		const failures = verificationEvidenceFailures(localBody);
		expect(failures.some((failure) => failure.code === 'verification_placeholder')).toBe(true);
		expect(failures.some((failure) => failure.code === 'missing_verification_commands')).toBe(true);
	});

	it('scopes local FAIL checks to the Local verification block only (#2196)', () => {
		const localPassCiMentionsFail = [
			'## Verification',
			'',
			'Local verification:',
			'- Command: `npm test`',
			'  Result: PASS',
			'',
			'CI verification:',
			'- Known failing/advisory checks: GATE — Quality Checks Result: FAIL (advisory log paste)',
		].join('\n');

		expect(verificationEvidenceFailures(localPassCiMentionsFail)).toEqual([]);
	});

	it('aggregates implementation evidence failures', () => {
		const failures = implementationEvidenceFailures({
			body,
			files: ['scripts/ci/post_merge_validator.mjs', 'src/app/page.tsx'],
		});

		expect(failures.some((failure) => failure.code === 'allowlist_violation')).toBe(true);
		expect(failures.some((failure) => failure.code === 'unchecked_acceptance_criterion')).toBe(true);
	});
});
