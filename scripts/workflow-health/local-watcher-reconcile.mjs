#!/usr/bin/env node
/**
 * Local watcher-interval reconciler for workflow-health observability.
 * Invoked by the Cursor 5-minute wake / 12-minute check-in loops so idle and
 * pickup SLO visibility stay inside one watcher interval without burning
 * GitHub Actions minutes on a 5-minute cron. Work unit #2889 / parent #2680.
 *
 * Usage:
 *   node scripts/workflow-health/local-watcher-reconcile.mjs [events.json]
 *
 * Environment mirrors reconcile.mjs (WORKFLOW_HEALTH_STORE_FILE,
 * WORKFLOW_HEALTH_OUT_DIR, WORKFLOW_HEALTH_DISABLED, WORKFLOW_HEALTH_EVENTS_FILE).
 */

import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const RECONCILE = join(SCRIPT_DIR, 'reconcile.mjs');

const result = spawnSync(process.execPath, [RECONCILE, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status == null ? 1 : result.status);
