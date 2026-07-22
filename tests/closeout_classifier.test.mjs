import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	CLOSEOUT_OUTCOMES,
	classifyCloseoutFinding,
	classifyCloseoutReport,
	runClassifierCli,
} from '../scripts/ci/closeout_classifier.mjs';
import {
	planAdminCloseoutRepairs,
	runAdminRepairCli,
	applyAdminCloseoutRepairs,
} from '../scripts/ci/admin_closeout_auto_repair.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureDir = path.join(__dirname, '../scripts/ci/fixtures/admin_closeout');

function readFixture(name) {
	return JSON.parse(fs.readFileSync(path.join(fixtureDir, name), 'utf8'));
}

describe('CI-002 closeout classifier', () => {
	const cases = [
		['stale_label_after_clean_merge.json', CLOSEOUT_OUTCOMES.SAFE_AUTO_FIX],
		['failed_required_test.json', CLOSEOUT_OUTCOMES.CURSOR_REMEDIATION_REQUIRED],
		['missing_validation_evidence.json', CLOSEOUT_OUTCOMES.CURSOR_REMEDIATION_REQUIRED],
		['duplicate_exception_issue.json', CLOSEOUT_OUTCOMES.SAFE_AUTO_FIX],
		['ambiguous_source_issue.json', CLOSEOUT_OUTCOMES.OPERATOR_AUTHORIZATION_REQUIRED],
		['admin_warning_queue.json', CLOSEOUT_OUTCOMES.QUEUE_ADMIN_CLOSEOUT],
	];

	it.each(cases)('%s → %s', (fixtureName, expected) => {
		const report = classifyCloseoutReport(readFixture(fixtureName));
		expect(report.overall_outcome).toBe(expected);
		expect(report.dry_run).toBe(true);
		expect(report.blockers_never_auto_repaired).toBe(true);
		for (const finding of report.findings) {
			if (finding.blocker) {
				expect(finding.may_auto_repair).toBe(false);
			}
		}
	});

	it('never marks failed tests as safe_auto_fix', () => {
		const result = classifyCloseoutFinding({
			type: 'failed_required_test',
			code: 'failed_required_test',
			message: 'test failed',
		});
		expect(result.outcome).toBe(CLOSEOUT_OUTCOMES.CURSOR_REMEDIATION_REQUIRED);
		expect(result.may_auto_repair).toBe(false);
		expect(result.blocker).toBe(true);
	});

	it('queues stale labels when clean-merge evidence is incomplete', () => {
		const result = classifyCloseoutFinding({
			type: 'stale_label_after_clean_merge',
			code: 'stale_label',
			evidence_complete: false,
		});
		expect(result.outcome).toBe(CLOSEOUT_OUTCOMES.QUEUE_ADMIN_CLOSEOUT);
		expect(result.may_auto_repair).toBe(false);
	});

	it('maps self-heal intentionally_deferred to queue_admin_closeout', () => {
		const result = classifyCloseoutFinding({
			type: 'intentionally_deferred',
			message: 'deferred admin backlog item',
			deferred: true,
		});
		expect(result.outcome).toBe(CLOSEOUT_OUTCOMES.QUEUE_ADMIN_CLOSEOUT);
	});

	it('dry-run CLI exits 0 for fixture and --pr local fixture', () => {
		const logs = [];
		const code = runClassifierCli(
			['--dry-run', '--fixture', path.join(fixtureDir, 'stale_label_after_clean_merge.json')],
			{
				stdout: (line) => logs.push(String(line)),
				stderr: (line) => logs.push(String(line)),
			},
		);
		expect(code).toBe(0);
		expect(logs.join('\n')).toContain('PASS');
		expect(logs.join('\n')).toContain('safe_auto_fix');

		const prLogs = [];
		const prCode = runClassifierCli(
			['--dry-run', '--pr', '2701'],
			{
				stdout: (line) => prLogs.push(String(line)),
				stderr: (line) => prLogs.push(String(line)),
			},
		);
		expect(prCode).toBe(0);
		expect(prLogs.join('\n')).toContain('PASS');
	});

	it('refuses classifier CLI without --dry-run', () => {
		const errors = [];
		const code = runClassifierCli(
			['--fixture', path.join(fixtureDir, 'failed_required_test.json')],
			{
				stdout: () => {},
				stderr: (line) => errors.push(String(line)),
			},
		);
		expect(code).toBe(2);
		expect(errors.join('\n')).toMatch(/requires --dry-run/i);
	});
});

describe('CI-002 admin closeout auto-repair dry-run', () => {
	it('plans mutations for safe findings without executing them', () => {
		const plan = planAdminCloseoutRepairs(readFixture('duplicate_exception_issue.json'));
		expect(plan.dry_run).toBe(true);
		expect(plan.apply_enabled).toBe(false);
		expect(plan.mutations_performed).toBe(0);
		expect(plan.summary.planned_mutations).toBe(1);
		expect(plan.planned[0].planned_action).toBe('close_duplicate_exception');
		expect(plan.blockers_never_auto_repaired).toBe(true);
		expect(plan.blocker_safety_statement).toMatch(/never auto-repaired/i);
	});

	it('does not plan mutations for blocker fixtures', () => {
		const plan = planAdminCloseoutRepairs(readFixture('failed_required_test.json'));
		expect(plan.summary.planned_mutations).toBe(0);
		expect(plan.planned[0].would_mutate).toBe(false);
		expect(plan.planned[0].planned_action).toBe('escalate_cursor_remediation');
	});

	it('refuses apply mode', () => {
		const refused = applyAdminCloseoutRepairs({});
		expect(refused.ok).toBe(false);
		expect(refused.error).toBe('apply_mode_disabled');
		expect(refused.mutations_performed).toBe(0);

		const errors = [];
		const code = runAdminRepairCli(
			['--apply', '--fixture', path.join(fixtureDir, 'stale_label_after_clean_merge.json')],
			{
				stdout: () => {},
				stderr: (line) => errors.push(String(line)),
			},
		);
		expect(code).toBe(2);
		expect(errors.join('\n')).toMatch(/apply mode is disabled/i);
	});

	it('dry-run repair CLI exits 0', () => {
		const logs = [];
		const code = runAdminRepairCli(
			['--dry-run', '--fixture', path.join(fixtureDir, 'admin_warning_queue.json')],
			{
				stdout: (line) => logs.push(String(line)),
				stderr: (line) => logs.push(String(line)),
			},
		);
		expect(code).toBe(0);
		expect(logs.join('\n')).toContain('queue_admin_item');
		expect(logs.join('\n')).toContain('PASS');
	});
});
