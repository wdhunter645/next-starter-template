#!/usr/bin/env node
/**
 * Static generator for the workflow-health data products, following the
 * repository-hosted PMO dashboard pattern: write one JSON data payload plus
 * a client-side static renderer into an output directory, at zero added
 * service cost. Read-only with respect to GitHub — events come from a JSON
 * file (adapter output or fixture); live collection/scheduling is #2889
 * reconciliation-lane work. Work unit #2888 (2680-003) / parent #2680.
 *
 * Usage:
 *   node scripts/workflow-health/build-views.mjs [events.json]
 *
 * Environment:
 *   WORKFLOW_HEALTH_EVENTS_FILE  input envelope JSON array (overridden by argv)
 *   WORKFLOW_HEALTH_OUT_DIR      output directory (default site/workflow-health)
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildHealthViews } from './views.mjs';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUT_DIR = 'site/workflow-health';

export function loadEvents(eventsPath) {
  if (!eventsPath) {
    return { events: [], eventSource: 'none' };
  }
  const raw = readFileSync(eventsPath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`events_file_not_an_array:${eventsPath}`);
  }
  return { events: parsed, eventSource: eventsPath };
}

/**
 * @param {{ eventsPath?: string|null, outDir?: string, now?: string }} params
 * @returns {{ outDir: string, dataPath: string, views: object }}
 */
export function buildStaticViews({
  eventsPath = null,
  outDir = DEFAULT_OUT_DIR,
  now = new Date().toISOString(),
} = {}) {
  const { events, eventSource } = loadEvents(eventsPath);
  const views = {
    ...buildHealthViews({ events, now }),
    eventSource,
  };

  const resolvedOut = resolve(outDir);
  mkdirSync(resolvedOut, { recursive: true });

  const dataPath = join(resolvedOut, 'health-data.json');
  writeFileSync(dataPath, `${JSON.stringify(views, null, 2)}\n`);

  const staticIndex = join(SCRIPT_DIR, 'static', 'index.html');
  if (existsSync(staticIndex)) {
    copyFileSync(staticIndex, join(resolvedOut, 'index.html'));
  }

  return { outDir: resolvedOut, dataPath, views };
}

function main(argv) {
  const eventsPath = argv[2] || process.env.WORKFLOW_HEALTH_EVENTS_FILE || null;
  const outDir = process.env.WORKFLOW_HEALTH_OUT_DIR || DEFAULT_OUT_DIR;
  const { dataPath, views } = buildStaticViews({ eventsPath, outDir });
  console.log(
    JSON.stringify(
      {
        ok: true,
        dataPath,
        dataState: views.dataState,
        eventCount: views.eventCount,
        transactions: views.liveFlow.transactionCount,
        exceptions: views.exceptions.exceptionCount,
      },
      null,
      2,
    ),
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main(process.argv);
}
