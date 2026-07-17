import { describe, expect, it } from 'vitest';

import {
	assertManifestPathSafe,
	assertProjectManifestPathSafe,
	isTrustedRepositoryContext,
	isZeroCommitSha,
	normalizeMode,
	resolveMaterializerAuthorization,
	resolveWorkflowManifestSelection,
} from '../../scripts/pmo-projects/lib/workflow-policy.mjs';

const manifestA =
	'docs/ops/implementation-plans/pmo-project-autonomous-delivery/project-manifest.json';
const manifestB =
	'docs/ops/implementation-plans/agent-issue-polling-handoff-routing/project-manifest.json';

describe('PMO materializer workflow policy', () => {
	it('normalizes supported modes and rejects unknowns', () => {
		expect(normalizeMode('dry-run')).toBe('dry-run');
		expect(normalizeMode('APPLY')).toBe('apply');
		expect(normalizeMode('mutate')).toBeNull();
	});

	it('treats workflow_dispatch and same-repo push as trusted', () => {
		expect(
			isTrustedRepositoryContext({
				eventName: 'workflow_dispatch',
				repository: 'wdhunter645/next-starter-template',
			}),
		).toBe(true);
		expect(
			isTrustedRepositoryContext({
				eventName: 'push',
				repository: 'wdhunter645/next-starter-template',
			}),
		).toBe(true);
	});

	it('rejects fork pull requests as untrusted', () => {
		expect(
			isTrustedRepositoryContext({
				eventName: 'pull_request',
				repository: 'wdhunter645/next-starter-template',
				headRepository: 'attacker/next-starter-template',
				pullRequest: { head: { repo: { fork: true } } },
			}),
		).toBe(false);
	});

	it('allows dry-run without mutation permissions', () => {
		const decision = resolveMaterializerAuthorization({
			eventName: 'pull_request',
			mode: 'dry-run',
			repository: 'wdhunter645/next-starter-template',
			headRepository: 'wdhunter645/next-starter-template',
		});
		expect(decision).toMatchObject({
			allowed: true,
			effectiveMode: 'dry-run',
			permissions: { contents: 'read', issues: 'read' },
		});
	});

	it('never allows apply on pull_request events', () => {
		const decision = resolveMaterializerAuthorization({
			eventName: 'pull_request',
			mode: 'apply',
			repository: 'wdhunter645/next-starter-template',
			headRepository: 'wdhunter645/next-starter-template',
			explicitApplyAuthorized: true,
		});
		expect(decision.allowed).toBe(false);
		expect(decision.effectiveMode).toBe('dry-run');
		expect(decision.reason).toBe('apply_forbidden_on_pull_request');
	});

	it('requires workflow_dispatch plus explicit authorize flag for apply', () => {
		expect(
			resolveMaterializerAuthorization({
				eventName: 'workflow_dispatch',
				mode: 'apply',
				explicitApplyAuthorized: false,
			}).reason,
		).toBe('apply_not_explicitly_authorized');

		expect(
			resolveMaterializerAuthorization({
				eventName: 'push',
				mode: 'apply',
				explicitApplyAuthorized: true,
			}).reason,
		).toBe('apply_requires_workflow_dispatch');

		expect(
			resolveMaterializerAuthorization({
				eventName: 'workflow_dispatch',
				mode: 'apply',
				explicitApplyAuthorized: true,
			}),
		).toMatchObject({
			allowed: true,
			effectiveMode: 'apply',
			permissions: { contents: 'read', issues: 'write' },
			reason: 'workflow_dispatch_apply_authorized',
		});
	});

	it('fails closed on unsafe and noncanonical manifest paths', () => {
		expect(assertManifestPathSafe('')).toMatchObject({ ok: false });
		expect(assertManifestPathSafe('../secrets.json')).toMatchObject({ ok: false });
		expect(assertManifestPathSafe('/etc/passwd')).toMatchObject({ ok: false });
		expect(assertManifestPathSafe(manifestA)).toMatchObject({ ok: true });
		expect(assertProjectManifestPathSafe('package.json')).toMatchObject({
			ok: false,
			reason: 'manifest_path_not_canonical',
		});
		expect(assertProjectManifestPathSafe(manifestA)).toMatchObject({ ok: true });
	});

	it('recognizes GitHub zero SHA for new branch creation', () => {
		expect(isZeroCommitSha('0'.repeat(40))).toBe(true);
		expect(isZeroCommitSha('1'.repeat(40))).toBe(false);
	});

	it('skips a new component branch push instead of selecting an inherited manifest', () => {
		expect(
			resolveWorkflowManifestSelection({
				eventName: 'push',
				beforeSha: '0'.repeat(40),
				changedFiles: [{ status: 'A', path: manifestA }],
			}),
		).toEqual({
			ok: true,
			skip: true,
			reason: 'new_branch_no_manifest_delta',
			paths: [],
			deletedPaths: [],
		});
	});

	it('selects only the manifests actually changed by an automatic event', () => {
		expect(
			resolveWorkflowManifestSelection({
				eventName: 'pull_request',
				changedFiles: [
					{ status: 'M', path: 'scripts/pmo-projects/materialize.mjs' },
					{ status: 'A', path: manifestB },
					{ status: 'M', path: manifestA },
					{ status: 'M', path: manifestB },
				],
			}),
		).toEqual({
			ok: true,
			skip: false,
			reason: 'changed_manifests',
			paths: [manifestB, manifestA].sort(),
			deletedPaths: [],
		});
	});

	it('skips script-only changes without falling back to another project manifest', () => {
		expect(
			resolveWorkflowManifestSelection({
				eventName: 'pull_request',
				changedFiles: [
					{ status: 'M', path: 'scripts/pmo-projects/lib/workflow-policy.mjs' },
					{ status: 'M', path: '.github/workflows/pmo-project-task-materializer.yml' },
				],
			}),
		).toMatchObject({
			ok: true,
			skip: true,
			reason: 'no_changed_manifest',
			paths: [],
		});
	});

	it('fails closed when an automatic event deletes a project manifest', () => {
		expect(
			resolveWorkflowManifestSelection({
				eventName: 'pull_request',
				changedFiles: [{ status: 'D', path: manifestA }],
			}),
		).toEqual({
			ok: false,
			skip: false,
			reason: 'manifest_deleted',
			paths: [],
			deletedPaths: [manifestA],
		});
	});

	it('requires an explicit canonical manifest for workflow_dispatch', () => {
		expect(
			resolveWorkflowManifestSelection({
				eventName: 'workflow_dispatch',
				explicitManifestPath: manifestB,
			}),
		).toEqual({
			ok: true,
			skip: false,
			reason: 'explicit_manifest',
			paths: [manifestB],
			deletedPaths: [],
		});
		expect(
			resolveWorkflowManifestSelection({
				eventName: 'workflow_dispatch',
				explicitManifestPath: 'package.json',
			}),
		).toMatchObject({
			ok: false,
			reason: 'manifest_path_not_canonical',
		});
	});
});
