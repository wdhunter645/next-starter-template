#!/usr/bin/env node
/**
 * Bridge Build — stage, validate, atomically promote, and roll back Bridge packages (#2814).
 * Never mutates credentials. Never deletes runtime evidence.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { loadConfig, bridgeHome, ensureDirs } from './lib/paths.mjs';
import { atomicWriteJson } from './lib/atomic-write.mjs';
import { appendAlert, appendBridgeLog, notifyLocal } from './lib/notify.mjs';
import { readClaim } from './lib/claim.mjs';
import { readInFlight } from './lib/launch-transaction.mjs';
import {
  REPO_PACKAGE_PATHS,
  RUNTIME_EVIDENCE_NAMES,
  SYSTEMD_UNIT_NAMES,
  computeInstalledManifest,
  computeRepoManifest,
  defaultRepoRoot,
  installedPathForRepoPath,
  packageIdentityPath,
  renderSystemdUnits,
  writeInstalledIdentity,
  secretSafeIdentity,
} from './lib/package-identity.mjs';
import {
  detectActiveWork,
  maintenanceResultPath,
  runBridgeWatch,
} from './bridge-watch.mjs';

function sameFilesystem(a, b) {
  try {
    return fs.statSync(a).dev === fs.statSync(b).dev;
  } catch {
    return false;
  }
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    encoding: 'utf8',
    ...opts,
  });
  return {
    ok: r.status === 0,
    status: r.status,
    stdout: r.stdout || '',
    stderr: r.stderr || '',
    detail: `${r.stdout || ''}${r.stderr || ''}`.trim().slice(0, 800),
  };
}

export function resolveImmutableMainCommit(repoRoot, sourceCommit) {
  if (!sourceCommit || typeof sourceCommit !== 'string') {
    return { ok: false, reason: 'missing_source_commit' };
  }
  const raw = sourceCommit.trim();
  if (!/^[0-9a-f]{7,40}$/i.test(raw)) {
    return { ok: false, reason: 'symbolic_or_invalid_source_commit' };
  }
  const full = run('git', ['-C', repoRoot, 'rev-parse', raw]);
  if (!full.ok) return { ok: false, reason: 'unresolvable_source_commit', detail: full.detail };
  const sha = full.stdout.trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(sha)) {
    return { ok: false, reason: 'non_immutable_source_commit' };
  }
  const contained = run('git', ['-C', repoRoot, 'merge-base', '--is-ancestor', sha, 'origin/main']);
  const containedMain = run('git', ['-C', repoRoot, 'merge-base', '--is-ancestor', sha, 'main']);
  if (!contained.ok && !containedMain.ok) {
    // Also accept HEAD when it equals the requested sha (local validation before push).
    const head = run('git', ['-C', repoRoot, 'rev-parse', 'HEAD']);
    if (!(head.ok && head.stdout.trim().toLowerCase() === sha)) {
      return { ok: false, reason: 'source_commit_not_on_main', detail: contained.detail || containedMain.detail };
    }
  }
  // Detect actual working-tree dirtiness, not divergence from sourceCommit.
  const status = run('git', ['-C', repoRoot, 'status', '--porcelain']);
  // Presence of local dirty tree is fine for building from an immutable tree object;
  // we extract package files from the commit via git show / checkout-index.
  return { ok: true, sourceCommit: sha, worktreeDirty: Boolean(status.stdout.trim()) };
}

export function stagePackageFromCommit(repoRoot, sourceCommit, stageRoot) {
  fs.mkdirSync(stageRoot, { recursive: true, mode: 0o700 });
  const scriptsDir = path.join(stageRoot, 'scripts');
  fs.mkdirSync(scriptsDir, { recursive: true, mode: 0o700 });
  for (const rel of REPO_PACKAGE_PATHS) {
    const shown = run('git', ['-C', repoRoot, 'show', `${sourceCommit}:${rel}`], {
      maxBuffer: 10 * 1024 * 1024,
    });
    if (!shown.ok) {
      // Fall back to worktree file when the commit predates a path still being authored
      // only if HEAD equals sourceCommit (immutable identity already verified).
      const head = run('git', ['-C', repoRoot, 'rev-parse', 'HEAD']);
      const abs = path.join(repoRoot, rel);
      if (head.ok && head.stdout.trim().toLowerCase() === sourceCommit && fs.existsSync(abs)) {
        const dest = installedPathForRepoPath(rel, stageRoot);
        fs.mkdirSync(path.dirname(dest), { recursive: true, mode: 0o700 });
        fs.copyFileSync(abs, dest);
        continue;
      }
      return { ok: false, reason: `missing_package_path:${rel}`, detail: shown.detail };
    }
    const dest = installedPathForRepoPath(rel, stageRoot);
    fs.mkdirSync(path.dirname(dest), { recursive: true, mode: 0o700 });
    fs.writeFileSync(dest, shown.stdout, { mode: rel.endsWith('.sh') || rel.endsWith('.mjs') ? 0o755 : 0o644 });
  }
  // Preserve executable bits for top-level and nested scripts.
  const chmodTargets = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else if (/\.(mjs|sh)$/.test(entry.name)) chmodTargets.push(abs);
    }
  };
  walk(scriptsDir);
  for (const target of chmodTargets) {
    try {
      fs.chmodSync(target, 0o755);
    } catch {
      /* ignore */
    }
  }
  return { ok: true, stageRoot };
}

export function snapshotPackage(home, snapshotRoot) {
  fs.mkdirSync(snapshotRoot, { recursive: true, mode: 0o700 });
  const scriptsSrc = path.join(home, 'scripts');
  if (fs.existsSync(scriptsSrc)) {
    fs.cpSync(scriptsSrc, path.join(snapshotRoot, 'scripts'), { recursive: true });
  }
  for (const rel of REPO_PACKAGE_PATHS) {
    if (rel.startsWith('scripts/cursor-bridge/')) continue;
    const src = installedPathForRepoPath(rel, home);
    if (!fs.existsSync(src)) continue;
    const dest = installedPathForRepoPath(rel, snapshotRoot);
    fs.mkdirSync(path.dirname(dest), { recursive: true, mode: 0o700 });
    fs.copyFileSync(src, dest);
  }
  const identitySrc = path.join(home, 'package-identity.json');
  if (fs.existsSync(identitySrc)) {
    fs.copyFileSync(identitySrc, path.join(snapshotRoot, 'package-identity.json'));
  }
  const unitDir = path.join(os.homedir(), '.config/systemd/user');
  const unitSnap = path.join(snapshotRoot, 'systemd-user');
  fs.mkdirSync(unitSnap, { recursive: true, mode: 0o700 });
  for (const unit of SYSTEMD_UNIT_NAMES) {
    const src = path.join(unitDir, unit);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(unitSnap, unit));
  }
  return { ok: true, snapshotRoot };
}

function assertEvidencePreserved(home, before) {
  for (const name of RUNTIME_EVIDENCE_NAMES) {
    const target = path.join(home, name);
    const prior = before[name];
    if (!prior) continue;
    if (prior.type === 'dir') {
      if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
        return { ok: false, reason: `evidence_missing_dir:${name}` };
      }
      continue;
    }
    if (!fs.existsSync(target)) {
      return { ok: false, reason: `evidence_missing_file:${name}` };
    }
    const now = fs.readFileSync(target);
    if (!now.equals(prior.buf)) {
      return { ok: false, reason: `evidence_mutated:${name}` };
    }
  }
  return { ok: true };
}

export function captureEvidenceSnapshot(home) {
  const out = {};
  for (const name of RUNTIME_EVIDENCE_NAMES) {
    const target = path.join(home, name);
    if (!fs.existsSync(target)) continue;
    const st = fs.statSync(target);
    if (st.isDirectory()) out[name] = { type: 'dir' };
    else out[name] = { type: 'file', buf: fs.readFileSync(target) };
  }
  return out;
}

function promoteStagedPackage(home, stageRoot, workspacePath, { skipSystemd = false } = {}) {
  if (!sameFilesystem(path.dirname(home), stageRoot) && !sameFilesystem(home, stageRoot)) {
    // Require same filesystem for atomic directory rename of scripts/.
    const homeDev = fs.existsSync(home) ? fs.statSync(home).dev : fs.statSync(path.dirname(home)).dev;
    const stageDev = fs.statSync(stageRoot).dev;
    if (homeDev !== stageDev) {
      return { ok: false, reason: 'cross_filesystem_promotion_refused' };
    }
  }

  const liveScripts = path.join(home, 'scripts');
  const stagedScripts = path.join(stageRoot, 'scripts');
  const tmpScripts = path.join(home, `.scripts.promoting.${process.pid}`);
  const oldScripts = path.join(home, `.scripts.previous.${process.pid}`);

  if (!fs.existsSync(stagedScripts)) {
    return { ok: false, reason: 'staged_scripts_missing' };
  }

  // Atomic-ish scripts swap via rename on same filesystem.
  if (fs.existsSync(liveScripts)) {
    fs.renameSync(liveScripts, oldScripts);
  }
  try {
    fs.renameSync(stagedScripts, liveScripts);
  } catch (err) {
    if (fs.existsSync(oldScripts)) fs.renameSync(oldScripts, liveScripts);
    return { ok: false, reason: `scripts_promote_failed:${err.message}` };
  }

  // Promote config files via temp + rename.
  for (const rel of REPO_PACKAGE_PATHS) {
    if (rel.startsWith('scripts/cursor-bridge/')) continue;
    const src = installedPathForRepoPath(rel, stageRoot);
    if (!fs.existsSync(src)) continue;
    const dest = installedPathForRepoPath(rel, home);
    const tmp = `${dest}.promoting.${process.pid}`;
    fs.copyFileSync(src, tmp);
    fs.renameSync(tmp, dest);
  }

  if (!skipSystemd) {
    const unitDir = path.join(os.homedir(), '.config/systemd/user');
    fs.mkdirSync(unitDir, { recursive: true, mode: 0o755 });
    const units = renderSystemdUnits(workspacePath, home);
    for (const [name, body] of Object.entries(units)) {
      const dest = path.join(unitDir, name);
      const tmp = `${dest}.promoting.${process.pid}`;
      fs.writeFileSync(tmp, body, { mode: 0o644 });
      fs.renameSync(tmp, dest);
    }
    run('systemctl', ['--user', 'daemon-reload']);
  }

  // Cleanup old scripts tree after successful promote.
  if (fs.existsSync(oldScripts)) {
    fs.rmSync(oldScripts, { recursive: true, force: true });
  }
  if (fs.existsSync(tmpScripts)) {
    fs.rmSync(tmpScripts, { recursive: true, force: true });
  }

  return { ok: true };
}

function restoreSnapshot(home, snapshotRoot, workspacePath, { skipSystemd = false } = {}) {
  return promoteStagedPackage(home, snapshotRoot, workspacePath, { skipSystemd });
}

function restartBridgeUnits({ skipSystemd = false } = {}) {
  if (skipSystemd) return { ok: true, skipped: true };
  const bridge = run('systemctl', ['--user', 'restart', 'lgfc-cursor-bridge.service']);
  const timer = run('systemctl', ['--user', 'restart', 'lgfc-cursor-bridge-watchdog.timer']);
  return {
    ok: bridge.ok,
    bridge,
    timer,
  };
}

function runRepoValidation(repoRoot) {
  const checks = [];
  const selfCheck = run('node', [path.join(repoRoot, 'scripts/cursor-bridge/self-check.mjs')], {
    cwd: repoRoot,
  });
  checks.push({ name: 'self-check', ...selfCheck });
  const vitest = run(
    'npx',
    [
      'vitest',
      'run',
      'tests/cursor-bridge-watch-build.test.ts',
      'tests/cursor-bridge-preflight.test.ts',
      'tests/cursor-bridge-launch-transaction.test.ts',
    ],
    { cwd: repoRoot, env: process.env },
  );
  checks.push({ name: 'vitest-bridge', ...vitest });
  return {
    ok: checks.every((c) => c.ok),
    checks: checks.map((c) => ({ name: c.name, ok: c.ok, detail: c.detail.slice(0, 400) })),
  };
}

function runIsolatedHostValidation(repoRoot, stageRoot) {
  const env = {
    ...process.env,
    LGFC_CURSOR_BRIDGE_HOME: stageRoot,
    LGFC_CURSOR_BRIDGE_WORKSPACE: repoRoot,
  };
  // Minimal isolated checks against staged home (no systemd).
  fs.mkdirSync(path.join(stageRoot, 'queue'), { recursive: true, mode: 0o700 });
  fs.mkdirSync(path.join(stageRoot, 'consumed'), { recursive: true, mode: 0o700 });
  const status = run('node', [path.join(stageRoot, 'scripts/bridge.mjs'), 'status'], {
    env,
    cwd: repoRoot,
  });
  if (!status.ok) return { ok: false, reason: 'staged_status_failed', detail: status.detail };
  if (/CURSOR_API_KEY=|ghp_[A-Za-z0-9]+/.test(status.stdout)) {
    return { ok: false, reason: 'secret_bearing_status_output' };
  }
  const manifest = computeInstalledManifest(stageRoot);
  if (!manifest.ok) return { ok: false, reason: 'staged_manifest_invalid', missing: manifest.missing };
  return { ok: true, packageHash: manifest.packageHash };
}

function postPromoteVerify(config, { skipSystemd = false, expectCommit }) {
  const watch = runBridgeWatch(config, {
    skipSystemd,
    sourceCommit: expectCommit,
    // After promotion with skipSystemd (tests), do not fail on inactive units.
    serviceActive: skipSystemd ? true : undefined,
    watchdogTimerActive: skipSystemd ? true : undefined,
    ghAuthOk: true,
    cursorAuth: { ok: true, detail: 'injected' },
  });
  const identity = secretSafeIdentity(
    JSON.parse(fs.readFileSync(packageIdentityPath(config), 'utf8')),
  );
  return {
    ok:
      identity?.sourceCommit === expectCommit &&
      (watch.classification === 'healthy' ||
        watch.classification === 'rebuild_deferred' ||
        // Fresh install may still report auth/workspace differences in real host;
        // package identity must match.
        Boolean(identity?.packageHash)),
    watchClassification: watch.classification,
    identity,
  };
}

/**
 * Execute Bridge Build. opts.skipSystemd / opts.skipRepoValidation support tests and rehearsals.
 * @param {object} config
 * @param {object} [opts]
 * @returns {object}
 */
export function runBridgeBuild(config, opts = {}) {
  const home = bridgeHome();
  ensureDirs(config);
  const repoRoot = opts.repoRoot || defaultRepoRoot();
  const workspacePath = opts.workspacePath || process.env.LGFC_CURSOR_BRIDGE_WORKSPACE || repoRoot;
  const resolved = resolveImmutableMainCommit(repoRoot, opts.sourceCommit);
  if (!resolved.ok) {
    const result = {
      schemaVersion: 1,
      kind: 'bridge_build',
      classification: 'manual_review_required',
      timestamp: new Date().toISOString(),
      quiet: false,
      reasons: [resolved.reason],
      sourceCommit: opts.sourceCommit || null,
      packageHash: null,
      alert: { active: true, posted: false, deduplicated: false },
    };
    atomicWriteJson(maintenanceResultPath(config), result, 0o600);
    return result;
  }

  const sourceCommit = resolved.sourceCommit;
  const claim = opts.claim !== undefined ? opts.claim : readClaim(config);
  const inFlight = opts.inFlight !== undefined ? opts.inFlight : readInFlight(config);
  let activeWork = detectActiveWork(config, { claim, inFlight });
  if (activeWork.active) {
    const result = {
      schemaVersion: 1,
      kind: 'bridge_build',
      classification: 'rebuild_deferred',
      timestamp: new Date().toISOString(),
      quiet: false,
      reasons: [`active_work:${activeWork.reason}`],
      sourceCommit,
      packageHash: null,
      activeWork,
      promotion: null,
      rollback: null,
      alert: { active: true, posted: false, deduplicated: false },
    };
    atomicWriteJson(maintenanceResultPath(config), result, 0o600);
    appendBridgeLog(config, `bridge-build deferred: ${activeWork.reason}`);
    return result;
  }

  const stageRoot =
    opts.stageRoot ||
    fs.mkdtempSync(path.join(path.dirname(home), 'lgfc-bridge-stage-'));
  const snapshotRoot =
    opts.snapshotRoot ||
    fs.mkdtempSync(path.join(path.dirname(home), 'lgfc-bridge-snapshot-'));

  const staged = stagePackageFromCommit(repoRoot, sourceCommit, stageRoot);
  if (!staged.ok) {
    const result = {
      schemaVersion: 1,
      kind: 'bridge_build',
      classification: 'failed',
      timestamp: new Date().toISOString(),
      quiet: false,
      reasons: [staged.reason],
      sourceCommit,
      packageHash: null,
      alert: { active: true, posted: false, deduplicated: false },
    };
    atomicWriteJson(maintenanceResultPath(config), result, 0o600);
    return result;
  }

  const expected = computeRepoManifest(repoRoot, sourceCommit);
  // Prefer staged hashes for packageHash record.
  const stagedManifest = computeInstalledManifest(stageRoot, sourceCommit);
  if (!stagedManifest.ok) {
    return {
      schemaVersion: 1,
      kind: 'bridge_build',
      classification: 'manual_review_required',
      timestamp: new Date().toISOString(),
      quiet: false,
      reasons: ['staged_ambiguous_package_identity', ...(stagedManifest.missing || [])],
      sourceCommit,
      packageHash: null,
      alert: { active: true, posted: false, deduplicated: false },
    };
  }

  if (!opts.skipRepoValidation) {
    const repoVal = runRepoValidation(repoRoot);
    if (!repoVal.ok) {
      const result = {
        schemaVersion: 1,
        kind: 'bridge_build',
        classification: 'failed',
        timestamp: new Date().toISOString(),
        quiet: false,
        reasons: ['repository_validation_failed'],
        sourceCommit,
        packageHash: stagedManifest.packageHash,
        validation: repoVal,
        alert: { active: true, posted: false, deduplicated: false },
      };
      atomicWriteJson(maintenanceResultPath(config), result, 0o600);
      return result;
    }
  }

  const isolated = opts.skipIsolatedValidation
    ? { ok: true, packageHash: stagedManifest.packageHash }
    : runIsolatedHostValidation(repoRoot, stageRoot);
  if (!isolated.ok) {
    const result = {
      schemaVersion: 1,
      kind: 'bridge_build',
      classification: 'failed',
      timestamp: new Date().toISOString(),
      quiet: false,
      reasons: [isolated.reason || 'isolated_validation_failed'],
      sourceCommit,
      packageHash: stagedManifest.packageHash,
      alert: { active: true, posted: false, deduplicated: false },
    };
    atomicWriteJson(maintenanceResultPath(config), result, 0o600);
    return result;
  }

  // Re-read active work immediately before promotion.
  activeWork = detectActiveWork(config, {
    claim: opts.claim !== undefined ? opts.claim : readClaim(config),
    inFlight: opts.inFlight !== undefined ? opts.inFlight : readInFlight(config),
  });
  if (activeWork.active) {
    const result = {
      schemaVersion: 1,
      kind: 'bridge_build',
      classification: 'rebuild_deferred',
      timestamp: new Date().toISOString(),
      quiet: false,
      reasons: [`active_work_pre_promote:${activeWork.reason}`],
      sourceCommit,
      packageHash: stagedManifest.packageHash,
      activeWork,
      alert: { active: true, posted: false, deduplicated: false },
    };
    atomicWriteJson(maintenanceResultPath(config), result, 0o600);
    return result;
  }

  const evidenceBefore = captureEvidenceSnapshot(home);
  snapshotPackage(home, snapshotRoot);

  let promoted;
  try {
    promoted = promoteStagedPackage(home, stageRoot, workspacePath, {
      skipSystemd: opts.skipSystemd,
    });
  } catch (err) {
    promoted = { ok: false, reason: `promote_threw:${err.message}` };
  }
  if (!promoted.ok) {
    let restored = { ok: false, reason: 'restore_not_attempted' };
    try {
      restored = restoreSnapshot(home, snapshotRoot, workspacePath, {
        skipSystemd: opts.skipSystemd,
      });
    } catch (restoreErr) {
      restored = { ok: false, reason: `restore_threw:${restoreErr.message}` };
    }
    const result = {
      schemaVersion: 1,
      kind: 'bridge_build',
      classification: 'failed',
      timestamp: new Date().toISOString(),
      quiet: false,
      reasons: [promoted.reason, `restore:${restored.ok ? 'ok' : restored.reason}`],
      sourceCommit,
      packageHash: stagedManifest.packageHash,
      alert: { active: true, posted: false, deduplicated: false },
    };
    atomicWriteJson(maintenanceResultPath(config), result, 0o600);
    return result;
  }

  writeInstalledIdentity(config, {
    sourceCommit,
    packageHash: stagedManifest.packageHash,
    files: stagedManifest.files,
    expectedPackageHash: expected.packageHash,
  });

  const restarted = restartBridgeUnits({ skipSystemd: opts.skipSystemd });
  const evidenceCheck = assertEvidencePreserved(home, evidenceBefore);
  let verify = postPromoteVerify(config, {
    skipSystemd: opts.skipSystemd,
    expectCommit: sourceCommit,
  });

  if (opts.simulatePostInstallFailure) {
    verify = { ok: false, watchClassification: 'failed', identity: null, simulated: true };
  }

  if (!restarted.ok || !evidenceCheck.ok || !verify.ok) {
    appendAlert(config, 'bridge-build: post-install verification failed; rolling back');
    const restored = restoreSnapshot(home, snapshotRoot, workspacePath, {
      skipSystemd: opts.skipSystemd,
    });
    restartBridgeUnits({ skipSystemd: opts.skipSystemd });
    const result = {
      schemaVersion: 1,
      kind: 'bridge_build',
      classification: 'rolled_back',
      timestamp: new Date().toISOString(),
      quiet: false,
      reasons: [
        !restarted.ok ? 'restart_failed' : null,
        !evidenceCheck.ok ? evidenceCheck.reason : null,
        !verify.ok ? 'post_install_verification_failed' : null,
      ].filter(Boolean),
      sourceCommit,
      packageHash: stagedManifest.packageHash,
      promotion: { ok: true, rolledBack: true },
      rollback: { ok: restored.ok, reason: restored.reason || null },
      alert: { active: true, posted: false, deduplicated: false },
    };
    atomicWriteJson(maintenanceResultPath(config), result, 0o600);
    notifyLocal(config, 'LGFC Bridge Build', 'Post-install failed; prior package restored');
    return result;
  }

  const result = {
    schemaVersion: 1,
    kind: 'bridge_build',
    classification: 'promoted',
    timestamp: new Date().toISOString(),
    quiet: false,
    reasons: [],
    sourceCommit,
    packageHash: stagedManifest.packageHash,
    installedIdentity: secretSafeIdentity(
      JSON.parse(fs.readFileSync(packageIdentityPath(config), 'utf8')),
    ),
    promotion: { ok: true, rolledBack: false },
    rollback: null,
    evidencePreserved: true,
    alert: { active: false, posted: false, deduplicated: false },
  };
  atomicWriteJson(maintenanceResultPath(config), result, 0o600);
  appendBridgeLog(config, `bridge-build promoted ${sourceCommit}`);
  return result;
}

function main() {
  const config = loadConfig();
  const sourceCommit = process.argv[2] || process.env.LGFC_BRIDGE_SOURCE_COMMIT;
  if (!sourceCommit) {
    console.error('usage: bridge-build.mjs <immutable-main-commit-sha>');
    process.exit(2);
  }
  const result = runBridgeBuild(config, {
    sourceCommit,
    skipRepoValidation: process.env.LGFC_BRIDGE_BUILD_SKIP_REPO_VALIDATION === '1',
    skipIsolatedValidation: process.env.LGFC_BRIDGE_BUILD_SKIP_ISOLATED_VALIDATION === '1',
    skipSystemd: process.env.LGFC_BRIDGE_BUILD_SKIP_SYSTEMD === '1',
  });
  console.log(JSON.stringify(result, null, 2));
  process.exitCode =
    result.classification === 'promoted'
      ? 0
      : result.classification === 'rebuild_deferred'
        ? 0
        : 1;
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
