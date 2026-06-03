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

	it('flags pending verification evidence', () => {
		const pendingBody = body.replace('- Result summary:\n  - PASS', '- Result summary:\n  - PENDING');
		expect(verificationEvidenceFailures(pendingBody)).toEqual([
			expect.objectContaining({ code: 'verification_not_pass' }),
		]);
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
