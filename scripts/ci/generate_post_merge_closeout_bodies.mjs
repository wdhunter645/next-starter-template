#!/usr/bin/env node

import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

import {
	discoverBacklogCandidates,
	generateBacklogCloseoutBodies,
} from './post_merge_closeout_body_generate.mjs';

function parseArgs(argv = process.argv.slice(2)) {
	const options = {
		prs: [],
		limit: 25,
		dryRun: false,
		validate: true,
		manifestPath: '',
		reportPath: '',
		listOnly: false,
		description: 'OPS #1923 batch-generated closeout bodies',
	};
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === '--from-backlog') continue;
		if (arg === '--dry-run') {
			options.dryRun = true;
			continue;
		}
		if (arg === '--no-validate') {
			options.validate = false;
			continue;
		}
		if (arg === '--validate') {
			options.validate = true;
			continue;
		}
		if (arg === '--list-only') {
			options.listOnly = true;
			continue;
		}
		if (arg === '--prs' && argv[index + 1]) {
			options.prs = argv[index + 1].split(',').map((value) => Number(value.trim())).filter(Boolean);
			index += 1;
			continue;
		}
		if (arg === '--limit' && argv[index + 1]) {
			options.limit = Number(argv[index + 1]);
			index += 1;
			continue;
		}
		if (arg === '--manifest' && argv[index + 1]) {
			options.manifestPath = argv[index + 1];
			index += 1;
			continue;
		}
		if (arg === '--report' && argv[index + 1]) {
			options.reportPath = argv[index + 1];
			index += 1;
			continue;
		}
		if (arg === '--description' && argv[index + 1]) {
			options.description = argv[index + 1];
			index += 1;
		}
	}
	return options;
}

export async function main(argv = process.argv.slice(2)) {
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	const repository = process.env.GITHUB_REPOSITORY;
	const options = parseArgs(argv);

	if (!token || !repository) {
		throw new Error('GITHUB_TOKEN/GH_TOKEN and GITHUB_REPOSITORY are required.');
	}

	if (options.listOnly) {
		const candidates = await discoverBacklogCandidates({ token, repository });
		const report = {
			total: candidates.length,
			eligible: candidates.filter((entry) => entry.skip_reasons.length === 0).length,
			skipped: candidates.filter((entry) => entry.skip_reasons.length > 0),
			eligible_prs: candidates.filter((entry) => entry.skip_reasons.length === 0).map((entry) => entry.pr),
		};
		const serialized = `${JSON.stringify(report, null, 2)}\n`;
		if (options.reportPath) fs.writeFileSync(options.reportPath, serialized);
		else process.stdout.write(serialized);
		return report;
	}

	const report = await generateBacklogCloseoutBodies({
		token,
		repository,
		prNumbers: options.prs,
		limit: options.limit,
		dryRun: options.dryRun,
		validate: options.validate,
		manifestPath: options.manifestPath,
		description: options.description,
	});

	const serialized = `${JSON.stringify(report, null, 2)}\n`;
	if (options.reportPath) fs.writeFileSync(options.reportPath, serialized);
	else process.stdout.write(serialized);

	if (report.failed > 0) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((error) => {
		console.error(error);
		process.exit(1);
	});
}
