/**
 * Shared Cursor Local Bridge preflight engine (#2681).
 * Fail-closed, secret-safe, dependency-injectable probes for CI.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { bridgeHome, ensureDirs } from './paths.mjs';
import { atomicWriteJson, hostnameSafe } from './atomic-write.mjs';
import { readClaim, isClaimActive } from './claim.mjs';
import { cliAuthPreflight, resolveWorkspace } from './launch.mjs';
import { appendAlert, appendBridgeLog, notifyLocal } from './notify.mjs';

export const PREFLIGHT_SCHEMA_VERSION = 1;
export const PREFLIGHT_CHECK_VERSION = 1;

export const TOP_LEVEL_RESULTS = Object.freeze([
  'ready',
  'runner_unavailable',
  'bridge_unavailable',
  'github_not_authenticated',
  'cursor_not_authenticated',
  'cursor_capacity_unavailable',
  'workspace_unavailable',
  'queue_unavailable',
  'stale_claim',
  'configuration_invalid',
  'unknown_failure',
]);

export const FAILURE_PRIORITY = Object.freeze([
  'configuration_invalid',
  'runner_unavailable',
  'bridge_unavailable',
  'github_not_authenticated',
  'cursor_not_authenticated',
  'cursor_capacity_unavailable',
  'workspace_unavailable',
  'queue_unavailable',
  'stale_claim',
  'unknown_failure',
]);

export const INVOCATION_REASONS = Object.freeze([
  'startup',
  'periodic',
  'preclaim',
  'postfailure',
  'recovery',
  'manual',
]);

const SECRET_PATTERNS = [
  [/CURSOR_API_KEY=\S+/gi, 'CURSOR_API_KEY=[redacted]'],
  [/Token:\s*\S+/gi, 'Token: [redacted]'],
  [/ghp_[A-Za-z0-9_]+/g, 'ghp_[redacted]'],
  [/gho_[A-Za-z0-9_]+/g, 'gho_[redacted]'],
  [/github_pat_[A-Za-z0-9_]+/g, 'github_pat_[redacted]'],
  [/Bearer\s+\S+/gi, 'Bearer [redacted]'],
  [/api[_-]?key["']?\s*[:=]\s*["']?[^"'\s]+/gi, 'api_key=[redacted]'],
];

export function redactSecrets(value) {
  if (value == null) return value;
  if (typeof value === 'string') {
    let out = value;
    for (const [re, repl] of SECRET_PATTERNS) out = out.replace(re, repl);
    return out.slice(0, 400);
  }
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (/token|secret|password|apikey|api_key|credential/i.test(k) && typeof v === 'string') {
        out[k] = '[redacted]';
      } else {
        out[k] = redactSecrets(v);
      }
    }
    return out;
  }
  return value;
}

export function preflightResultPath(config) {
  return path.join(bridgeHome(), config.preflight?.resultPath || 'preflight-result.json');
}

export function preflightAlertStatePath(config) {
  return path.join(bridgeHome(), config.preflight?.alertStatePath || 'preflight-alert-state.json');
}

export function readLastPreflight(config) {
  const p = preflightResultPath(config);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function readAlertState(config) {
  const p = preflightAlertStatePath(config);
  if (!fs.existsSync(p)) return { activeFailure: null, lastAlertAt: null, lastAlertResult: null };
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return { activeFailure: null, lastAlertAt: null, lastAlertResult: null };
  }
}

function writeAlertState(config, state) {
  atomicWriteJson(preflightAlertStatePath(config), state, 0o600);
}

function systemdIsActive(unit) {
  if (!unit) return { ok: false, state: 'unconfigured', detail: 'unit not configured' };
  const r = spawnSync('systemctl', ['--user', 'is-active', unit], { encoding: 'utf8' });
  const state = (r.stdout || '').trim() || 'unknown';
  return {
    ok: state === 'active' || state === 'activating',
    state,
    detail: redactSecrets(`${r.stdout || ''}${r.stderr || ''}`.trim().slice(0, 200)),
  };
}

function observeRunnerUnit(config) {
  const configured = config.watchdog?.runnerUnit;
  if (configured) return { unit: configured, ...systemdIsActive(configured) };
  const r = spawnSync('systemctl', ['--user', 'list-units', '--type=service', '--all', '--no-legend'], {
    encoding: 'utf8',
  });
  if (r.status !== 0) return { unit: null, ok: false, state: 'unknown', detail: 'systemctl list failed' };
  const line = (r.stdout || '')
    .split('\n')
    .map((l) => l.trim())
    .find((l) => /actions\.runner/i.test(l));
  if (!line) return { unit: null, ok: false, state: 'not_observed', detail: 'no actions.runner unit observed' };
  const unit = line.split(/\s+/)[0];
  return { unit, ...systemdIsActive(unit) };
}

function ghAuthProbe() {
  const r = spawnSync('gh', ['auth', 'status'], { encoding: 'utf8' });
  const out = `${r.stdout || ''}${r.stderr || ''}`.trim();
  return {
    ok: r.status === 0 && /Logged in to/i.test(out),
    detail: redactSecrets(out.slice(0, 240)),
  };
}

export function createDefaultProbes(config, { reason } = {}) {
  return {
    configuration() {
      try {
        if (!config || typeof config !== 'object') return { ok: false, detail: 'config missing' };
        if (!Array.isArray(config.requiredLabels) || config.requiredLabels.length === 0) {
          return { ok: false, detail: 'requiredLabels missing' };
        }
        if (!config.repository) return { ok: false, detail: 'repository missing' };
        ensureDirs(config);
        return { ok: true, detail: 'config and bridge home ok' };
      } catch (err) {
        return { ok: false, detail: redactSecrets(String(err.message || err)) };
      }
    },
    runner() {
      return observeRunnerUnit(config);
    },
    bridge() {
      const skipUnit = reason === 'startup' || config.preflight?.skipBridgeUnitOnStartup === true;
      const home = bridgeHome();
      try {
        fs.accessSync(home, fs.constants.R_OK | fs.constants.W_OK);
      } catch {
        return { ok: false, state: 'home_not_writable', detail: 'bridge home not writable' };
      }
      if (skipUnit) {
        return { ok: true, state: 'startup_self', detail: 'bridge process running; unit check skipped on startup' };
      }
      const unit = config.watchdog?.bridgeUnit || 'lgfc-cursor-bridge.service';
      return { unit, ...systemdIsActive(unit) };
    },
    githubAuth: ghAuthProbe,
    cursorAuth() {
      const auth = cliAuthPreflight(config);
      return {
        ok: !!auth.ok,
        reason: auth.reason || null,
        detail: redactSecrets(String(auth.detail || '').slice(0, 200)),
      };
    },
    cursorCapacity() {
      const explicit = config.preflight?.cursorCapacitySignal;
      if (explicit == null || explicit === 'unknown') {
        return { ok: true, status: 'unknown', detail: 'no non-consuming capacity API configured' };
      }
      if (explicit === 'unavailable' || explicit === false) {
        return { ok: false, status: 'unavailable', detail: 'explicit capacity unavailable signal' };
      }
      return { ok: true, status: 'available', detail: 'explicit capacity available signal' };
    },
    workspace() {
      const workspace = resolveWorkspace(config);
      const present = fs.existsSync(workspace);
      return { ok: present, path: workspace, detail: present ? 'workspace present' : 'workspace missing' };
    },
    queue() {
      const dirs = ensureDirs(config);
      try {
        fs.accessSync(dirs.queue, fs.constants.R_OK | fs.constants.W_OK);
        return { ok: true, detail: 'queue readable/writable' };
      } catch {
        return { ok: false, detail: 'queue not readable/writable' };
      }
    },
    claim() {
      const claim = readClaim(config);
      const ttl = config.claimTtlSeconds || 7200;
      if (!claim) return { ok: true, status: 'none', detail: 'no claim file' };
      if (isClaimActive(claim, ttl)) {
        return { ok: true, status: 'active', detail: `active claim issue=#${claim.issueNumber}` };
      }
      return { ok: false, status: 'stale', detail: `stale claim beyond ttl issue=#${claim.issueNumber}` };
    },
  };
}

function checkEntry(name, probeResult, failResult) {
  const ok = !!probeResult?.ok;
  return {
    name,
    ok,
    failResult,
    status: ok ? 'pass' : 'fail',
    detail: redactSecrets(probeResult?.detail || probeResult?.state || ''),
    meta: redactSecrets({
      state: probeResult?.state,
      unit: probeResult?.unit,
      path: probeResult?.path,
      reason: probeResult?.reason,
      status: probeResult?.status,
    }),
  };
}

function remediationClass(result) {
  const map = {
    ready: 'none',
    configuration_invalid: 'fix_config',
    runner_unavailable: 'restore_runner',
    bridge_unavailable: 'restore_bridge',
    github_not_authenticated: 'reauth_github',
    cursor_not_authenticated: 'reauth_cursor',
    cursor_capacity_unavailable: 'wait_capacity',
    workspace_unavailable: 'restore_workspace',
    queue_unavailable: 'repair_queue_permissions',
    stale_claim: 'clear_or_wait_claim_ttl',
  };
  return map[result] || 'investigate';
}

export function runPreflight(config, options = {}) {
  const reason = INVOCATION_REASONS.includes(options.reason) ? options.reason : 'manual';
  const now = options.now != null ? options.now : Date.now();
  const persist = options.persist !== false;
  const notify = options.notify !== false;
  const enforce = config.preflight?.enforce !== false;
  const probes = options.probes || createDefaultProbes(config, { reason });
  const retrySeconds = config.preflight?.retrySeconds ?? 60;

  let checks;
  try {
    checks = [
      checkEntry('configuration', probes.configuration(), 'configuration_invalid'),
      checkEntry('runner', probes.runner(), 'runner_unavailable'),
      checkEntry('bridge', probes.bridge(), 'bridge_unavailable'),
      checkEntry('githubAuth', probes.githubAuth(), 'github_not_authenticated'),
      checkEntry('cursorAuth', probes.cursorAuth(), 'cursor_not_authenticated'),
      checkEntry('cursorCapacity', probes.cursorCapacity(), 'cursor_capacity_unavailable'),
      checkEntry('workspace', probes.workspace(), 'workspace_unavailable'),
      checkEntry('queue', probes.queue(), 'queue_unavailable'),
      checkEntry('claim', probes.claim(), 'stale_claim'),
    ];
  } catch (err) {
    checks = [
      {
        name: 'engine',
        ok: false,
        failResult: 'unknown_failure',
        status: 'fail',
        detail: redactSecrets(String(err.message || err)),
        meta: {},
      },
    ];
  }

  let result = 'ready';
  for (const code of FAILURE_PRIORITY) {
    if (checks.find((c) => !c.ok && c.failResult === code)) {
      result = code;
      break;
    }
  }
  if (result === 'ready' && checks.some((c) => !c.ok)) result = 'unknown_failure';

  const alertState = readAlertState(config);
  let alert = {
    active: false,
    deduplicated: false,
    posted: false,
    failureClass: result === 'ready' ? null : result,
  };

  if (result === 'ready') {
    if (alertState.activeFailure) {
      writeAlertState(config, {
        activeFailure: null,
        lastAlertAt: alertState.lastAlertAt,
        lastAlertResult: null,
        clearedAt: new Date(now).toISOString(),
      });
    }
  } else if (notify) {
    if (alertState.activeFailure === result) {
      alert = { active: true, deduplicated: true, posted: false, failureClass: result };
    } else {
      const msg = `preflight ${reason}: ${result}`;
      appendAlert(config, msg);
      appendBridgeLog(config, msg);
      notifyLocal(config, 'LGFC Cursor Bridge preflight', msg);
      writeAlertState(config, {
        activeFailure: result,
        lastAlertAt: new Date(now).toISOString(),
        lastAlertResult: result,
      });
      alert = { active: true, deduplicated: false, posted: true, failureClass: result };
    }
  }

  const record = redactSecrets({
    schemaVersion: PREFLIGHT_SCHEMA_VERSION,
    checkVersion: PREFLIGHT_CHECK_VERSION,
    result,
    ready: result === 'ready',
    enforce,
    enforcementDisabled: !enforce,
    allowClaim: enforce ? result === 'ready' : true,
    timestamp: new Date(now).toISOString(),
    invocationReason: reason,
    host: hostnameSafe(),
    checks,
    remediationClass: remediationClass(result),
    nextRetryAt: result === 'ready' ? null : new Date(now + retrySeconds * 1000).toISOString(),
    alert,
  });

  if (persist) atomicWriteJson(preflightResultPath(config), record, 0o600);
  return record;
}

export function isPreflightAllowingClaim(result) {
  if (!result) return false;
  if (result.enforcementDisabled || result.enforce === false) return true;
  return result.result === 'ready' && result.allowClaim !== false;
}

export function clearPreflightFailureState(config) {
  writeAlertState(config, {
    activeFailure: null,
    lastAlertAt: null,
    lastAlertResult: null,
    clearedAt: new Date().toISOString(),
  });
  return readAlertState(config);
}
