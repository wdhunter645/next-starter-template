#!/usr/bin/env node
/**
 * Import seed/fixture candidate registry JSON into D1 content pipeline tables.
 *
 * Usage:
 *   node --experimental-strip-types scripts/content-pipeline/import-seed-candidates.mjs \
 *     --file data/research/lou-gehrig-content-candidates.json \
 *     [--database lgfc_lite] [--local|--remote] [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  buildCandidateImportPlan,
  validateCandidateRegistry,
} from '../../functions/_lib/content-pipeline-candidate-import.ts';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');

function printUsage() {
  console.log(`Usage: node --experimental-strip-types ${path.relative(process.cwd(), fileURLToPath(import.meta.url))} \\
  --file <registry.json> [--database lgfc_lite] [--local|--remote] [--dry-run]`);
}

function parseArgs(argv) {
  const options = {
    file: 'data/research/lou-gehrig-content-candidates.json',
    database: 'lgfc_lite',
    target: 'local',
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--file') {
      options.file = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === '--database') {
      options.database = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === '--local') {
      options.target = 'local';
      continue;
    }
    if (arg === '--remote') {
      options.target = 'remote';
      continue;
    }
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function loadRegistry(filePath) {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(repoRoot, filePath);
  const raw = fs.readFileSync(absolutePath, 'utf8');
  return JSON.parse(raw);
}

function executeSql(database, target, sql) {
  const args = ['wrangler', 'd1', 'execute', database];
  if (target === 'local') {
    args.push('--local');
  } else {
    args.push('--remote');
  }
  args.push('--command', sql);

  execFileSync('npx', args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
  });
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const registry = loadRegistry(options.file);
  const validation = validateCandidateRegistry(registry);

  if (!validation.ok) {
    console.error('Registry validation failed:');
    for (const error of validation.errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  const plan = buildCandidateImportPlan(registry);
  console.log(
    `Validated ${plan.candidateCount} candidate(s); prepared ${plan.statements.length} SQL statement(s).`,
  );

  if (options.dryRun) {
    console.log('Dry run — no SQL executed.');
    for (const statement of plan.statements.slice(0, 5)) {
      console.log(`-- ${statement.description}`);
      console.log(`${statement.sql}\n`);
    }
    if (plan.statements.length > 5) {
      console.log(`... ${plan.statements.length - 5} additional statement(s) omitted in dry-run preview.`);
    }
    return;
  }

  for (const statement of plan.statements) {
    executeSql(options.database, options.target, statement.sql);
  }

  console.log('Import complete.');
}

main();
