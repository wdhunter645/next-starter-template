/**
 * Bridge package identity and hash comparison (#2814).
 * Package files only — runtime evidence is excluded from drift decisions.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bridgeHome } from './paths.mjs';
import { atomicWriteJson } from './atomic-write.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Canonical package paths relative to repository root. */
export const REPO_PACKAGE_PATHS = Object.freeze([
  'config/cursor-bridge/bridge.json',
  'config/cursor-bridge/bridge.schema.json',
  'config/cursor-bridge/bridge-maintenance-result.schema.json',
  'config/cursor-bridge/preflight-result.schema.json',
  'scripts/cursor-bridge/bridge.mjs',
  'scripts/cursor-bridge/bridge-build.mjs',
  'scripts/cursor-bridge/bridge-watch.mjs',
  'scripts/cursor-bridge/install.sh',
  'scripts/cursor-bridge/self-check.mjs',
  'scripts/cursor-bridge/validate-host-isolated.sh',
  'scripts/cursor-bridge/watchdog.mjs',
  'scripts/cursor-bridge/write-wake-packet.sh',
  'scripts/cursor-bridge/lib/atomic-write.mjs',
  'scripts/cursor-bridge/lib/claim.mjs',
  'scripts/cursor-bridge/lib/eligibility.mjs',
  'scripts/cursor-bridge/lib/heartbeat.mjs',
  'scripts/cursor-bridge/lib/launch.mjs',
  'scripts/cursor-bridge/lib/launch-transaction.d.mts',
  'scripts/cursor-bridge/lib/launch-transaction.mjs',
  'scripts/cursor-bridge/lib/notify.mjs',
  'scripts/cursor-bridge/lib/package-identity.mjs',
  'scripts/cursor-bridge/lib/paths.mjs',
  'scripts/cursor-bridge/lib/preflight.mjs',
  'scripts/cursor-bridge/lib/reconcile.mjs',
  'scripts/cursor-bridge/lib/status.mjs',
]);

/** Runtime evidence — never hashed for package drift and never deleted by rebuild. */
export const RUNTIME_EVIDENCE_NAMES = Object.freeze([
  'queue',
  'consumed',
  'claim.json',
  'in-flight.json',
  'heartbeat.json',
  'runtime-meta.json',
  'alerts.log',
  'bridge.log',
  'preflight-result.json',
  'preflight-alert-state.json',
  'watchdog-state.json',
  'maintenance-result.json',
  'maintenance-alert-state.json',
]);

export const SYSTEMD_UNIT_NAMES = Object.freeze([
  'lgfc-cursor-bridge.service',
  'lgfc-cursor-bridge-watchdog.service',
  'lgfc-cursor-bridge-watchdog.timer',
]);

export function defaultRepoRoot() {
  return path.resolve(__dirname, '../../..');
}

export function packageIdentityPath(config) {
  return path.join(bridgeHome(), config.maintenance?.identityPath || 'package-identity.json');
}

export function hashBuffer(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export function hashFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return hashBuffer(fs.readFileSync(filePath));
}

/**
 * Map a repository package path to its installed location under bridge home.
 */
export function installedPathForRepoPath(repoRelative, home = bridgeHome()) {
  if (repoRelative.startsWith('scripts/cursor-bridge/')) {
    return path.join(home, 'scripts', repoRelative.slice('scripts/cursor-bridge/'.length));
  }
  if (repoRelative.startsWith('config/cursor-bridge/')) {
    return path.join(home, path.basename(repoRelative));
  }
  throw new Error(`unsupported_package_path:${repoRelative}`);
}

export function listRepoPackagePaths(repoRoot = defaultRepoRoot()) {
  const present = [];
  const missing = [];
  for (const rel of REPO_PACKAGE_PATHS) {
    const abs = path.join(repoRoot, rel);
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) present.push(rel);
    else missing.push(rel);
  }
  return { present, missing };
}

/**
 * @param {string} [repoRoot]
 * @param {string | null} [sourceCommit]
 */
export function computeRepoManifest(repoRoot = defaultRepoRoot(), sourceCommit = null) {
  const { present, missing } = listRepoPackagePaths(repoRoot);
  if (missing.length) {
    return {
      ok: false,
      reason: 'ambiguous_package_identity',
      missing,
      sourceCommit,
      files: {},
      packageHash: null,
    };
  }
  const files = {};
  for (const rel of present) {
    files[rel] = hashFile(path.join(repoRoot, rel));
  }
  const packageHash = hashBuffer(Buffer.from(stableSerialize(files), 'utf8'));
  return {
    ok: true,
    reason: null,
    missing: [],
    sourceCommit,
    files,
    packageHash,
    schemaVersion: 1,
  };
}

/**
 * @param {string} [home]
 * @param {string | null} [sourceCommit]
 */
export function computeInstalledManifest(home = bridgeHome(), sourceCommit = null) {
  const files = {};
  const missing = [];
  for (const rel of REPO_PACKAGE_PATHS) {
    const installed = installedPathForRepoPath(rel, home);
    const digest = hashFile(installed);
    if (!digest) missing.push(rel);
    else files[rel] = digest;
  }
  if (missing.length) {
    return {
      ok: false,
      reason: missing.length === REPO_PACKAGE_PATHS.length ? 'package_missing' : 'ambiguous_package_identity',
      missing,
      sourceCommit,
      files,
      packageHash: null,
    };
  }
  const packageHash = hashBuffer(Buffer.from(stableSerialize(files), 'utf8'));
  return {
    ok: true,
    reason: null,
    missing: [],
    sourceCommit,
    files,
    packageHash,
    schemaVersion: 1,
  };
}

export function comparePackageManifests(expected, actual) {
  if (!expected?.ok || !actual?.ok) {
    return {
      match: false,
      classification: 'manual_review_required',
      drifted: [],
      expectedMissing: expected?.missing || [],
      actualMissing: actual?.missing || [],
      reason: expected?.reason || actual?.reason || 'ambiguous_package_identity',
    };
  }
  const drifted = [];
  const keys = new Set([...Object.keys(expected.files), ...Object.keys(actual.files)]);
  for (const key of keys) {
    if (expected.files[key] !== actual.files[key]) drifted.push(key);
  }
  if (drifted.length === 0 && expected.packageHash === actual.packageHash) {
    return {
      match: true,
      classification: 'healthy',
      drifted: [],
      expectedMissing: [],
      actualMissing: [],
      reason: null,
    };
  }
  return {
    match: false,
    classification: 'rebuild_required',
    drifted,
    expectedMissing: [],
    actualMissing: [],
    reason: 'repository_to_host_drift',
  };
}

export function readInstalledIdentity(config) {
  const p = packageIdentityPath(config);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

export function writeInstalledIdentity(config, identity) {
  const record = {
    schemaVersion: 1,
    ...identity,
    recordedAt: new Date().toISOString(),
  };
  atomicWriteJson(packageIdentityPath(config), record, 0o600);
  return record;
}

export function secretSafeIdentity(identity) {
  if (!identity) return null;
  return {
    schemaVersion: identity.schemaVersion || 1,
    sourceCommit: identity.sourceCommit || null,
    packageHash: identity.packageHash || null,
    recordedAt: identity.recordedAt || null,
    fileCount: identity.files ? Object.keys(identity.files).length : null,
  };
}

export function renderSystemdUnits(workspacePath, bridgeHomePath = '%h/lgfc-cursor-bridge') {
  const homeToken = bridgeHomePath;
  const workspace = workspacePath || '%h/next-starter-template';
  return {
    'lgfc-cursor-bridge.service': `[Unit]
Description=LGFC Cursor Local Bridge (wake packet consumer)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
Environment=LGFC_CURSOR_BRIDGE_HOME=${homeToken}
Environment=LGFC_CURSOR_BRIDGE_WORKSPACE=${workspace}
Environment=PATH=%h/.local/bin:/usr/local/bin:/usr/bin:/bin
WorkingDirectory=${homeToken}
ExecStart=/usr/bin/node ${homeToken}/scripts/bridge.mjs watch
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
`,
    'lgfc-cursor-bridge-watchdog.service': `[Unit]
Description=LGFC Cursor Local Bridge watchdog (local health check)
After=lgfc-cursor-bridge.service

[Service]
Type=oneshot
Environment=LGFC_CURSOR_BRIDGE_HOME=${homeToken}
Environment=LGFC_CURSOR_BRIDGE_WORKSPACE=${workspace}
Environment=PATH=%h/.local/bin:/usr/local/bin:/usr/bin:/bin
WorkingDirectory=${homeToken}
ExecStart=/usr/bin/node ${homeToken}/scripts/watchdog.mjs check
`,
    'lgfc-cursor-bridge-watchdog.timer': `[Unit]
Description=Run LGFC Cursor Local Bridge watchdog every minute

[Timer]
OnBootSec=1min
OnUnitActiveSec=1min
AccuracySec=15s
Unit=lgfc-cursor-bridge-watchdog.service

[Install]
WantedBy=timers.target
`,
  };
}

function stableSerialize(files) {
  return JSON.stringify(
    Object.keys(files)
      .sort()
      .reduce((acc, key) => {
        acc[key] = files[key];
        return acc;
      }, {}),
  );
}
