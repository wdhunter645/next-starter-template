import { describe, expect, it } from 'vitest';
import {
	duplicateCloseComment,
	groupRemediationIssues,
	parseRemediationIssue,
	planDuplicateClosures,
} from '../scripts/ci/close_duplicate_remediation_issues.mjs';

function remediationIssue({ number, createdAt, pr = '1188', mergeSha = 'abc123def456', sourceIssue = '1122' }) {
	return {
		number,
		html_url: `https://github.test/repo/issues/${number}`,
		created_at: createdAt,
		title: `Post-merge remediation required for PR #${pr}`,
		body: [
			'Post-merge validation detected follow-up work.',
			'',
			`- PR: #${pr}`,
			`- Merge SHA: ${mergeSha}`,
			`- Source issue: #${sourceIssue}`,
			'- Validator status: fail',
			'- Remediation required: yes',
		].join('\n'),
	};
}

describe('close duplicate remediation issues', () => {
	it('parses PR, merge SHA, and source issue from remediation bodies', () => {
		const parsed = parseRemediationIssue(remediationIssue({ number: 1228, createdAt: '2026-06-01T10:00:00Z' }));

		expect(parsed).toMatchObject({
			number: 1228,
			pr: '1188',
			merge_sha: 'abc123def456',
			source_issue: 1122,
			group_key: '1188|abc123def456',
		});
	});

	it('keeps the oldest issue canonical and plans newer duplicates for closure', () => {
		const issues = [
			remediationIssue({ number: 1228, createdAt: '2026-06-01T10:00:00Z' }),
			remediationIssue({ number: 1230, createdAt: '2026-06-01T12:00:00Z' }),
			remediationIssue({ number: 1229, createdAt: '2026-06-01T11:00:00Z' }),
		];
		const actions = planDuplicateClosures(groupRemediationIssues(issues));

		expect(actions).toHaveLength(2);
		expect(actions.map((action) => action.canonical.number)).toEqual([1228, 1228]);
		expect(actions.map((action) => action.duplicate.number).sort((a, b) => a - b)).toEqual([1229, 1230]);
	});

	it('does not close the linked source issue when it appears in the duplicate set', () => {
		const issues = [
			remediationIssue({ number: 1228, createdAt: '2026-06-01T10:00:00Z', sourceIssue: '1122' }),
			{
				...remediationIssue({ number: 1122, createdAt: '2026-06-01T11:00:00Z', sourceIssue: '1122' }),
				title: 'Post-merge remediation required for PR #1188',
			},
		];
		const actions = planDuplicateClosures(groupRemediationIssues(issues));

		expect(actions).toEqual([]);
	});

	it('does not group issues with different merge SHAs', () => {
		const issues = [
			remediationIssue({ number: 1228, createdAt: '2026-06-01T10:00:00Z', mergeSha: 'aaa111' }),
			remediationIssue({ number: 1229, createdAt: '2026-06-01T11:00:00Z', mergeSha: 'bbb222' }),
		];
		const actions = planDuplicateClosures(groupRemediationIssues(issues));

		expect(actions).toEqual([]);
	});

	it('does not group issues with unknown merge SHAs', () => {
		const issues = [
			remediationIssue({ number: 1228, createdAt: '2026-06-01T10:00:00Z', mergeSha: 'unknown' }),
			remediationIssue({ number: 1229, createdAt: '2026-06-01T11:00:00Z', mergeSha: 'unknown' }),
		];
		const actions = planDuplicateClosures(groupRemediationIssues(issues));

		expect(actions).toEqual([]);
	});

	it('renders a duplicate close comment referencing the canonical issue', () => {
		const canonical = remediationIssue({ number: 1228, createdAt: '2026-06-01T10:00:00Z' });
		const duplicate = remediationIssue({ number: 1229, createdAt: '2026-06-01T11:00:00Z' });
		const comment = duplicateCloseComment({
			canonical: { ...canonical, parsed: parseRemediationIssue(canonical) },
			duplicate: { ...duplicate, parsed: parseRemediationIssue(duplicate) },
		});

		expect(comment).toContain('Canonical remediation issue: #1228');
		expect(comment).toContain('PR #1188');
		expect(comment).toContain('`abc123def456`');
	});
});
