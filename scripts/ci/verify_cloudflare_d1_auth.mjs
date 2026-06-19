#!/usr/bin/env node
/**
 * Preflight check for Cloudflare D1 remote access used by OPS sync workflows.
 * Fails fast with actionable guidance when API token or account configuration is invalid.
 */

import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const REQUIRED_TOKEN_PERMISSIONS = [
  'Account → D1 → Edit',
  'User → User Details → Read',
];

function aliasEnv(primary, aliases) {
  if (process.env[primary]) return;
  for (const name of aliases) {
    if (process.env[name]) {
      process.env[primary] = process.env[name];
      return;
    }
  }
}

aliasEnv('CLOUDFLARE_API_TOKEN', ['CF_API_TOKEN']);
aliasEnv('CLOUDFLARE_ACCOUNT_ID', ['CF_ACCOUNT_ID']);

const missing = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'].filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`ERROR: Missing required environment variable(s): ${missing.join(', ')}`);
  console.error('Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID (or CF_* aliases) in GitHub Actions secrets.');
  process.exit(1);
}

const databaseName = process.env.D1_DATABASE_NAME || process.env.D1_DATABASE_ID || 'lgfc_lite';

function wranglerCommand(args) {
  if (existsSync('node_modules/.bin/wrangler')) {
    return ['node_modules/.bin/wrangler', ...args];
  }
  return ['npx', '--no-install', 'wrangler', ...args];
}

function runWrangler(args) {
  const command = wranglerCommand(args);
  return spawnSync(command[0], command.slice(1), {
    encoding: 'utf8',
    env: process.env,
  });
}

function failWranglerExecution(step, result) {
  console.error(`ERROR: Failed to execute wrangler for ${step}:`, result.error?.message || 'unknown execution error');
  process.exit(1);
}

function printRecoveryHints() {
  console.error('');
  console.error('Cloudflare API token must include:');
  for (const permission of REQUIRED_TOKEN_PERMISSIONS) {
    console.error(`  - ${permission}`);
  }
  console.error('');
  console.error('Verify GitHub repository secrets:');
  console.error('  - CLOUDFLARE_API_TOKEN');
  console.error('  - CLOUDFLARE_ACCOUNT_ID (or CF_ACCOUNT_ID)');
  console.error(`  - D1_DATABASE_NAME (optional; defaults to "${databaseName}")`);
}

const whoami = runWrangler(['whoami']);
if (whoami.error) {
  failWranglerExecution('whoami', whoami);
}
if (whoami.status !== 0) {
  console.error('ERROR: wrangler whoami failed. The Cloudflare API token is invalid or lacks User Details Read.');
  console.error((whoami.stderr || whoami.stdout || '').trim());
  printRecoveryHints();
  process.exit(1);
}

const probe = runWrangler(['d1', 'execute', databaseName, '--remote', '--command', 'SELECT 1 AS ok;']);
if (probe.error) {
  failWranglerExecution('D1 probe', probe);
}
if (probe.status !== 0) {
  console.error(`ERROR: Remote D1 probe failed for database "${databaseName}".`);
  console.error((probe.stderr || probe.stdout || '').trim());
  printRecoveryHints();
  process.exit(1);
}

console.log(`OK: Cloudflare D1 auth verified for database "${databaseName}".`);
