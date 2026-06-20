import { describe, expect, it } from 'vitest';

import {
	buildEscalationIssueBody,
	ESCALATION_MARKER,
	escalationDedupeKey,
	escalationTitle,
	escalationUpdateComment,
	filterEscalationFindings,
	indexExistingEscalationIssues,
	planEscalationActions,
} from '../scripts/ci/post_merge_self_heal_escalate.mjs';
import {
	FINDING_TYPES,
	SAFETY_CATEGORIES,
} from '../scripts/ci/post_merge_self_heal_classify.mjs';

function reviewerFinding() {
	return {
		kind: FINDING_TYPES.MISSING_REVIEWER_DISPOSITION,
		classification: SAFETY_CATEGORIES.CURSOR_REMEDIATION_REQUIRED,
		pr_number: 1860,
		source_issue: 1848,
		message: 'Trusted reviewer comment lacks PR-body disposition.',
		metadata: { code: 'missing_reviewer_disposition' },
		evidence: [{ type: 'reviewer', comment_id: 220011 }],
	};
}

function operatorFinding() {
	return {
		kind: FINDING_TYPES.AUTH_TOKEN_SECRET_FAILURE,
		classification: SAFETY_CATEGORIES.OPERATOR_AUTHORIZATION_REQUIRED,
		pr_number: 1860,
		source_issue: 1848,
		message: 'Required workflow failed with auth/secret classification.',
		metadata: { code: 'auth_token_secret_failure' },
	};
}

describe('post-merge self-healing escalation planner', () => {
	it('filters cursor and operator escalation findings only', () => {
		const findings = filterEscalationFindings([
			reviewerFinding(),
			operatorFinding(),
			{ kind: FINDING_TYPES.CLEAN_STATE, classification: SAFETY_CATEGORIES.NO_ACTION },
		]);

		expect(findings).toHaveLength(2);
	});

	it('builds stable dedupe keys from PR, source issue, and failure class', () => {
		expect(escalationDedupeKey({
			pr_number: 1860,
			source_issue: 1848,
			failure_class: 'missing_reviewer_disposition',
		})).toBe('1860|1848|missing_reviewer_disposition');
	});

	it('plans create_issue for a new unsafe finding', () => {
		const actions = planEscalationActions([reviewerFinding()]);

		expect(actions).toHaveLength(1);
		expect(actions[0].action).toBe('create_issue');
		expect(actions[0].title).toContain('PR #1860');
	});

	it('plans update_issue when an open escalation already matches', () => {
		const existingBody = buildEscalationIssueBody(reviewerFinding(), {
			workflow_run_url: 'https://github.test/actions/1',
		});
		const actions = planEscalationActions([reviewerFinding()], {
			existingIssues: [{
				number: 1901,
				body: existingBody,
			}],
		});

		expect(actions).toHaveLength(1);
		expect(actions[0].action).toBe('update_issue');
		expect(actions[0].existing_issue_number).toBe(1901);
	});

	it('does not plan duplicate create actions for repeated findings', () => {
		const existingBody = buildEscalationIssueBody(reviewerFinding());
		const index = indexExistingEscalationIssues([{ number: 1901, body: existingBody }]);
		const key = escalationDedupeKey({
			pr_number: 1860,
			source_issue: 1848,
			failure_class: 'missing_reviewer_disposition',
		});

		expect(index.get(key)?.number).toBe(1901);
	});
});

describe('post-merge self-healing escalation body generator', () => {
	it('includes required escalation sections and marker', () => {
		const body = buildEscalationIssueBody(reviewerFinding(), {
			workflow_run_id: '12345',
			workflow_run_url: 'https://github.test/actions/12345',
			reviewer_comment_ids: ['220011'],
			affected_files: ['.github/pull_request_template.md'],
		});

		expect(body).toContain(ESCALATION_MARKER);
		expect(body).toContain('## Failure reason');
		expect(body).toContain('## Cursor implementation constraints');
		expect(body).toContain('review-comment:220011');
		expect(body).toContain('Bill/Atlas authorization required: no');
	});

	it('marks operator authorization when required', () => {
		const body = buildEscalationIssueBody(operatorFinding());
		expect(body).toContain('Bill/Atlas authorization required: yes');
	});

	it('renders update comments with latest evidence', () => {
		const comment = escalationUpdateComment(reviewerFinding(), {
			timestamp: '2026-06-20T12:00:00.000Z',
		});

		expect(comment).toContain('Updated post-merge self-healing escalation evidence');
		expect(comment).toContain('missing_reviewer_disposition');
	});

	it('creates deterministic escalation titles', () => {
		expect(escalationTitle(reviewerFinding())).toContain('Post-merge self-healing escalation for PR #1860');
	});
});

describe('post-merge self-healing escalation dry-run execution', () => {
	it('returns planned actions without GitHub mutations', async () => {
		const { escalateFromDetectionReport } = await import('../scripts/ci/post_merge_self_heal_escalate.mjs');
		const outcome = await escalateFromDetectionReport({
			findings: [reviewerFinding(), operatorFinding()],
		}, { dryRun: true });

		expect(outcome.status).toBe('dry_run');
		expect(outcome.summary.planned).toBe(2);
		expect(outcome.summary.created).toBe(0);
		expect(outcome.summary.updated).toBe(0);
	});
});
