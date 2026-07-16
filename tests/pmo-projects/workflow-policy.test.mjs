import { describe, expect, it } from 'vitest';

import {
	assertManifestPathSafe,
	isTrustedRepositoryContext,
	normalizeMode,
	resolveMaterializerAuthorization,
} from '../../scripts/pmo-projects/lib/workflow-policy.mjs';

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

	it('fails closed on unsafe manifest paths', () => {
		expect(assertManifestPathSafe('')).toMatchObject({ ok: false });
		expect(assertManifestPathSafe('../secrets.json')).toMatchObject({ ok: false });
		expect(assertManifestPathSafe('/etc/passwd')).toMatchObject({ ok: false });
		expect(
			assertManifestPathSafe(
				'docs/ops/implementation-plans/pmo-project-autonomous-delivery/project-manifest.json',
			),
		).toMatchObject({ ok: true });
	});
});
