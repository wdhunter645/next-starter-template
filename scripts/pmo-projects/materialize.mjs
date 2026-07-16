#!/usr/bin/env node
import path from 'node:path';

import {
	applyMaterialization,
	createGhIssueClient,
	formatPlanReport,
	indexIssues,
	planMaterialization,
} from './lib/materialize-issues.mjs';
import { loadManifestFile, validateProjectManifest } from './lib/validate-manifest.mjs';

function usage() {
	return `Usage: node scripts/pmo-projects/materialize.mjs [--dry-run|--apply] [--repo owner/name] <manifest-path>

Modes:
  --dry-run   Validate and report create/update/no-change actions without mutation (default)
  --apply     Apply create/update actions after validation (requires trusted authorization)

Environment:
  GITHUB_REPOSITORY   owner/name fallback when --repo is omitted
`;
}

function parseArgs(argv) {
	let mode = 'dry-run';
	let repository = process.env.GITHUB_REPOSITORY || '';
	const positionals = [];

	for (let i = 0; i < argv.length; i += 1) {
		const arg = argv[i];
		if (arg === '--dry-run') {
			mode = 'dry-run';
			continue;
		}
		if (arg === '--apply') {
			mode = 'apply';
			continue;
		}
		if (arg === '--repo') {
			repository = argv[i + 1] || '';
			i += 1;
			continue;
		}
		if (arg === '--help' || arg === '-h') {
			return { help: true };
		}
		if (arg.startsWith('-')) {
			throw new Error(`Unknown argument: ${arg}`);
		}
		positionals.push(arg);
	}

	return {
		help: false,
		mode,
		repository,
		manifestPath: positionals[0] || '',
	};
}

async function main(argv = process.argv.slice(2)) {
	let parsed;
	try {
		parsed = parseArgs(argv);
	} catch (error) {
		process.stderr.write(`${error.message}\n`);
		process.stderr.write(usage());
		process.exit(2);
	}

	if (parsed.help || !parsed.manifestPath) {
		process.stdout.write(usage());
		process.exit(parsed.help ? 0 : 1);
	}

	const { path: resolved, manifest } = loadManifestFile(parsed.manifestPath);
	const validation = validateProjectManifest(manifest);
	if (!validation.ok) {
		process.stderr.write('Manifest validation failed (fail-closed).\n');
		for (const error of validation.errors) {
			process.stderr.write(`  ERROR ${error}\n`);
		}
		process.exit(1);
	}

	if (!parsed.repository) {
		process.stderr.write(
			'Repository is required via --repo owner/name or GITHUB_REPOSITORY.\n',
		);
		process.exit(2);
	}

	const client = createGhIssueClient({ repository: parsed.repository });
	const issues = await client.listOpenIssues();

	// Ensure declared issueNumbers are visible even if closed/filtered.
	for (const task of manifest.tasks) {
		if (!task.issueNumber) continue;
		if (issues.some((issue) => issue.number === task.issueNumber)) continue;
		try {
			const issue = await client.getIssue(task.issueNumber);
			issues.push(issue);
		} catch {
			// planMaterialization will report blocked/missing
		}
	}

	const issueIndex = indexIssues(issues);
	const plan = planMaterialization(manifest, issueIndex);

	process.stdout.write(
		`${formatPlanReport(plan, { mode: parsed.mode })}\nmanifest: ${path.relative(process.cwd(), resolved) || resolved}\n`,
	);

	if (!plan.validation.ok || plan.blocked) {
		process.exit(1);
	}

	if (parsed.mode === 'dry-run') {
		process.exit(0);
	}

	const applyAuth = process.env.PMO_MATERIALIZE_APPLY_AUTHORIZED;
	if (applyAuth !== 'true' && applyAuth !== '1') {
		process.stderr.write(
			'Refusing apply: set PMO_MATERIALIZE_APPLY_AUTHORIZED=true to authorize issue mutation.\n',
		);
		process.exit(2);
	}

	const results = await applyMaterialization(plan, client, { dryRun: false });
	process.stdout.write(
		JSON.stringify(
			{
				ok: true,
				mode: 'apply',
				results: results.map((row) => ({
					taskId: row.taskId,
					action: row.action,
					issueNumber: row.issueNumber,
					applied: row.applied,
					url: row.url || null,
				})),
			},
			null,
			2,
		) + '\n',
	);
	process.exit(0);
}

const invokedDirectly = process.argv[1] && import.meta.url.endsWith(
	process.argv[1].replace(/\\/g, '/'),
);

if (invokedDirectly || process.argv[1]?.endsWith('materialize.mjs')) {
	main().catch((error) => {
		process.stderr.write(`${error.stack || error.message}\n`);
		process.exit(1);
	});
}

export { main, parseArgs };
