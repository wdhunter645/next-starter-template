#!/usr/bin/env node
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
	loadManifestFile,
	validateProjectManifest,
	SCHEMA_PATH,
} from './lib/validate-manifest.mjs';

function usage() {
	return `Usage: node scripts/pmo-projects/validate.mjs <manifest-path>

Validates a PMO project-delivery manifest against the deterministic contract.
Schema reference: ${SCHEMA_PATH}
`;
}

function main(argv = process.argv.slice(2)) {
	if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
		process.stdout.write(usage());
		process.exit(argv.length === 0 ? 1 : 0);
	}

	const manifestPath = argv[0];
	const { path: resolved, manifest } = loadManifestFile(manifestPath);
	const result = validateProjectManifest(manifest);

	process.stdout.write(
		JSON.stringify(
			{
				ok: result.ok,
				manifestPath: path.relative(process.cwd(), resolved) || resolved,
				taskCount: result.taskCount,
				terminalTaskId: result.terminalTaskId,
				errors: result.errors,
				warnings: result.warnings,
			},
			null,
			2,
		) + '\n',
	);

	process.exit(result.ok ? 0 : 1);
}

const isDirect =
	process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirect) {
	main();
}

export { main };
