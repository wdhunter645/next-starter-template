#!/usr/bin/env node
/**
 * Local Bridge watchdog — checks health and restarts the Bridge when needed.
 * Healthy intervals stay local and quiet. Persistent failures may post one GitHub ops fault.
 * Package drift / rebuild classification is owned by bridge-watch.mjs (#2814), not this watchdog.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { loadConfig, bridgeHome, ensureDirs } from './lib/paths.mjs';
import { readHeartbeat, heartbeatAgeSeconds } from './lib/heartbeat.mjs';
import { readClaim, isClaimActive } from './lib/claim.mjs';
import { cliAuthPreflight, resolveWorkspace } from './lib/launch.mjs';
import { appendAlert, appendBridgeLog, notifyLocal, postIssueComment } from './lib/notify.mjs';
import { freeDiskMb, atomicWriteJson } from './lib/atomic-write.mjs';
import { collectStatus } from './lib/status.mjs';
import { runPreflight } from './lib/preflight.mjs';

function statePath(config) {
  return path.join(bridgeHome(), config.watchdog?.statePath || 'watchdog-state.json');
}

function defaultState() {
  return { restarts: [], lastGithubFaultAt: null, lastLocalAlertAt: null };
}

function normalizeState(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
  return {
    restarts: Array.isArray(raw.restarts)
      ? raw.restarts.filter((ts) => typeof ts === 'string' && Number.isFinite(new Date(ts).getTime()))
      : [],
    lastGithubFaultAt:
      typeof raw.lastGithubFaultAt === 'string' && Number.isFinite(new Date(raw.lastGithubFaultAt).getTime())
        ? raw.lastGithubFaultAt
        : null,
    lastLocalAlertAt:
      typeof raw.lastLocalAlertAt === 'string' && Number.isFinite(new Date(raw.lastLocalAlertAt).getTime())
        ? raw.lastLocalAlertAt
        : null,
  };
}

function readState(config) {
  const p = statePath(config);
  if (!fs.existsSync(p)) return defaultState();
  try {
    return normalizeState(JSON.parse(fs.readFileSync(p, 'utf8')));
  } catch {
    return defaultState();
  }
}

function writeState(config, state) {
  atomicWriteJson(statePath(config), state, 0o600);
}

function unitActive(unit) {
  const r = spawnSync('systemctl', ['--user', 'is-active', unit], { encoding: 'utf8' });
  return (r.stdout || '').trim() === 'active';
}

function restartUnit(unit) {
  const r = spawnSync('systemctl', ['--user', 'restart', unit], { encoding: 'utf8' });
  return {
    ok: r.status === 0,
    detail: `${r.stdout || ''}${r.stderr || ''}`.trim().slice(0, 300),
  };
}

function ghAuthOk() {
  const r = spawnSync('gh', ['auth', 'status'], { encoding: 'utf8' });
  return r.status === 0 && /Logged in to/i.test(`${r.stdout || ''}${r.stderr || ''}`);
}

/**
 * Evaluate health checks. Pure-ish for tests when deps are injected.
 */
function evaluateHealth(config, ctx) {
  const failures = [];
  const wd = config.watchdog || {};
  const staleSec = wd.heartbeatStaleSeconds ?? 90;
  const minDisk = wd.minDiskMb ?? 256;
  const bridgeUnit = wd.bridgeUnit || 'lgfc-cursor-bridge.service';

  if (ctx.checkService !== false) {
    if (!ctx.serviceActive) failures.push(`service_inactive:${bridgeUnit}`);
  }

  if (!ctx.heartbeat) {
    failures.push('heartbeat_missing');
  } else {
    const age = heartbeatAgeSeconds(ctx.heartbeat);
    if (age > staleSec) failures.push(`heartbeat_stale:${Math.round(age)}s`);
  }

  if (!ctx.queueReadableWritable) failures.push('queue_not_rw');
  if (!ctx.workspacePresent) failures.push('workspace_missing');
  if (!ctx.ghAuthOk) failures.push('gh_auth_unavailable');
  if (ctx.cursorAuthOk === false) failures.push('cursor_cli_auth_unobservable_or_failed');

  const ttl = config.claimTtlSeconds || 7200;
  if (ctx.claim && isClaimActive(ctx.claim, ttl) === false && ctx.claim.acquiredAt) {
    // Stale claim file present beyond TTL is informational; Bridge clears on next acquire.
    // Watchdog reports it but does not clear claims (existing TTL/claim-recovery contract).
    failures.push('claim_stale_beyond_ttl');
  }

  if (ctx.diskMb != null && ctx.diskMb < minDisk) {
    failures.push(`disk_low:${ctx.diskMb}mb`);
  }

  // Restart-worthy vs alert-only
  const restartCodes = failures.filter((f) =>
    /service_inactive|heartbeat_missing|heartbeat_stale/.test(f),
  );
  const alertOnly = failures.filter((f) => !restartCodes.includes(f));

  return {
    healthy: failures.length === 0,
    failures,
    restartNeeded: restartCodes.length > 0,
    restartCodes,
    alertOnly,
  };
}

function pruneRestarts(restarts, windowSeconds) {
  const cutoff = Date.now() - windowSeconds * 1000;
  return (restarts || []).filter((ts) => new Date(ts).getTime() >= cutoff);
}

function maybeGithubFault(config, message) {
  const wd = config.watchdog || {};
  if (wd.githubFaultEnabled === false) return { posted: false, reason: 'disabled' };
  const issueNumber = wd.opsFaultIssueNumber;
  if (!issueNumber) return { posted: false, reason: 'no_ops_fault_issue_configured' };
  const debounce = wd.githubFaultDebounceSeconds ?? 3600;
  const state = readState(config);
  if (
    state.lastGithubFaultAt &&
    Date.now() - new Date(state.lastGithubFaultAt).getTime() < debounce * 1000
  ) {
    return { posted: false, reason: 'debounced' };
  }
  try {
    postIssueComment(
      issueNumber,
      `CURSOR BRIDGE OPS FAULT\nHost watchdog detected persistent Bridge failure.\n\n${message}\n\nHealthy intervals remain local-only; this comment is for actionable recovery.`,
    );
    state.lastGithubFaultAt = new Date().toISOString();
    writeState(config, state);
    return { posted: true, reason: 'commented' };
  } catch (err) {
    appendBridgeLog(config, `watchdog github fault failed: ${err.message}`);
    return { posted: false, reason: `post_failed:${err.message}` };
  }
}

function main() {
  const config = loadConfig();
  const dirs = ensureDirs(config);
  const wd = config.watchdog || {};
  const bridgeUnit = wd.bridgeUnit || 'lgfc-cursor-bridge.service';
  const mode = process.argv[2] || 'check';

  if (mode === 'status') {
    console.log(JSON.stringify(collectStatus(config), null, 2));
    return;
  }

  const periodic = runPreflight(config, { reason: 'periodic', notify: true });
  appendBridgeLog(
    config,
    `watchdog preflight: ${periodic.result} ready=${periodic.ready} dedupe=${!!periodic.alert?.deduplicated}`,
  );

  const heartbeat = readHeartbeat(config);
  const claim = readClaim(config);
  const workspace = resolveWorkspace(config);
  const cursor = cliAuthPreflight(config);

  let queueRw = false;
  try {
    fs.accessSync(dirs.queue, fs.constants.R_OK | fs.constants.W_OK);
    queueRw = true;
  } catch {
    queueRw = false;
  }

  const health = evaluateHealth(config, {
    serviceActive: unitActive(bridgeUnit),
    heartbeat,
    queueReadableWritable: queueRw,
    workspacePresent: fs.existsSync(workspace),
    ghAuthOk: ghAuthOk(),
    cursorAuthOk: cursor.ok,
    claim,
    diskMb: freeDiskMb(dirs.home),
  });

  if (health.healthy) {
    // Quiet on healthy intervals — no GitHub traffic.
    process.exitCode = 0;
    if (process.env.LGFC_WATCHDOG_VERBOSE === '1') {
      console.log(JSON.stringify({ ok: true, health }, null, 2));
    }
    return;
  }

  appendBridgeLog(config, `watchdog unhealthy: ${health.failures.join(',')}`);
  appendAlert(config, `watchdog: ${health.failures.join(',')}`);

  let restarted = false;
  let restartDetail = null;
  if (health.restartNeeded) {
    const windowSec = wd.restartWindowSeconds ?? 1800;
    const maxAttempts = wd.maxRestartAttempts ?? 3;
    const state = readState(config);
    state.restarts = pruneRestarts(state.restarts, windowSec);
    if (state.restarts.length >= maxAttempts) {
      const msg = `Bridge restart budget exceeded (${state.restarts.length}/${maxAttempts} in ${windowSec}s): ${health.failures.join(', ')}`;
      notifyLocal(config, 'LGFC Cursor Bridge watchdog', msg);
      const gh = maybeGithubFault(config, msg);
      console.error(JSON.stringify({ ok: false, health, restarted: false, githubFault: gh }, null, 2));
      process.exitCode = 2;
      return;
    }
    const result = restartUnit(bridgeUnit);
    restarted = result.ok;
    restartDetail = result.detail;
    state.restarts.push(new Date().toISOString());
    writeState(config, state);
    notifyLocal(
      config,
      'LGFC Cursor Bridge watchdog',
      `Restart ${restarted ? 'ok' : 'failed'}: ${health.restartCodes.join(', ')}`,
    );
    if (!restarted) {
      maybeGithubFault(config, `systemctl restart failed: ${restartDetail}; failures=${health.failures.join(',')}`);
    }
  } else if (health.alertOnly.length) {
    // Non-restart failures: local alert only unless repeating beyond threshold in state.
    const state = readState(config);
    const debounce = wd.localAlertDebounceSeconds ?? 900;
    const due =
      !state.lastLocalAlertAt ||
      Date.now() - new Date(state.lastLocalAlertAt).getTime() >= debounce * 1000;
    if (due) {
      notifyLocal(config, 'LGFC Cursor Bridge watchdog', health.alertOnly.join(', '));
      state.lastLocalAlertAt = new Date().toISOString();
      writeState(config, state);
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: false,
        health,
        restarted,
        restartDetail,
      },
      null,
      2,
    ),
  );
  process.exitCode = health.restartNeeded && !restarted ? 1 : 0;
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (invokedDirectly) {
  try {
    main();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

export { evaluateHealth, pruneRestarts, normalizeState };
