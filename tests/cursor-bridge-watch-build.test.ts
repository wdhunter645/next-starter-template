import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';
import {
  classifyWatchOutcome,
  detectActiveWork,
  fingerprintWatchResult,
  runBridgeWatch,
} from '../scripts/cursor-bridge/bridge-watch.mjs';
import {
  runBridgeBuild,
  resolveImmutableMainCommit,
  stagePackageFromCommit,
  snapshotPackage,
  captureEvidenceSnapshot,
} from '../scripts/cursor-bridge/bridge-build.mjs';
import {
  REPO_PACKAGE_PATHS,
  comparePackageManifests,
  computeInstalledManifest,
  computeRepoManifest,
  defaultRepoRoot,
  hashFile,
  writeInstalledIdentity,
  secretSafeIdentity,
} from '../scripts/cursor-bridge/lib/package-identity.mjs';
import { atomicWriteJson } from '../scripts/cursor-bridge/lib/atomic-write.mjs';

type EvidenceSnap = Record<string, { type: 'dir' } | { type: 'file'; buf: Buffer }>;

function baseConfig() {
  return {
    schemaVersion: 1,
    repository: 'wdhunter645/next-starter-template',
    queueDir: 'queue',
    consumedDir: 'consumed',
    claimPath: 'claim.json',
    inFlightPath: 'in-flight.json',
    heartbeatPath: 'heartbeat.json',
    runtimeMetaPath: 'runtime-meta.json',
    alertsLog: 'alerts.log',
    bridgeLog: 'bridge.log',
    claimTtlSeconds: 7200,
    watchdog: {
      bridgeUnit: 'lgfc-cursor-bridge.service',
      heartbeatStaleSeconds: 90,
      minDiskMb: 256,
    },
    maintenance: {
      identityPath: 'package-identity.json',
      resultPath: 'maintenance-result.json',
      alertStatePath: 'maintenance-alert-state.json',
      watchdogTimerUnit: 'lgfc-cursor-bridge-watchdog.timer',
    },
  };
}

describe('Cursor Bridge Watch / Build (#2814)', () => {
  const homes: string[] = [];
  const previousHome = process.env.LGFC_CURSOR_BRIDGE_HOME;

  afterEach(() => {
    if (previousHome === undefined) delete process.env.LGFC_CURSOR_BRIDGE_HOME;
    else process.env.LGFC_CURSOR_BRIDGE_HOME = previousHome;
    for (const home of homes.splice(0)) {
      fs.rmSync(home, { recursive: true, force: true });
    }
  });

  function withHome() {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'lgfc-wb-'));
    homes.push(home);
    process.env.LGFC_CURSOR_BRIDGE_HOME = home;
    fs.mkdirSync(path.join(home, 'queue'), { recursive: true, mode: 0o700 });
    fs.mkdirSync(path.join(home, 'consumed'), { recursive: true, mode: 0o700 });
    fs.mkdirSync(path.join(home, 'scripts'), { recursive: true, mode: 0o700 });
    return home;
  }

  function seedInstalledFromRepo(home: string, mutateRel?: string) {
    const repoRoot = defaultRepoRoot();
    for (const rel of REPO_PACKAGE_PATHS) {
      const src = path.join(repoRoot, rel);
      if (!fs.existsSync(src)) continue;
      const dest = rel.startsWith('scripts/cursor-bridge/')
        ? path.join(home, 'scripts', rel.slice('scripts/cursor-bridge/'.length))
        : path.join(home, path.basename(rel));
      fs.mkdirSync(path.dirname(dest), { recursive: true, mode: 0o700 });
      fs.copyFileSync(src, dest);
    }
    if (mutateRel) {
      const dest = mutateRel.startsWith('scripts/cursor-bridge/')
        ? path.join(home, 'scripts', mutateRel.slice('scripts/cursor-bridge/'.length))
        : path.join(home, path.basename(mutateRel));
      fs.appendFileSync(dest, '\n// drift\n');
    }
  }

  it('classifies healthy hash-matching installation as quiet', () => {
    const home = withHome();
    seedInstalledFromRepo(home);
    const config = baseConfig();
    const repoRoot = defaultRepoRoot();
    const expected = computeRepoManifest(repoRoot, 'a'.repeat(40));
    const actual = computeInstalledManifest(home, 'a'.repeat(40));
    writeInstalledIdentity(config, {
      sourceCommit: 'a'.repeat(40),
      packageHash: actual.packageHash,
      files: actual.files,
    });

    const result = runBridgeWatch(config, {
      repoRoot,
      sourceCommit: 'a'.repeat(40),
      expectedManifest: expected,
      actualManifest: actual,
      health: { healthy: true, failures: [], restartNeeded: false },
      serviceActive: true,
      watchdogTimerActive: true,
      claim: null,
      inFlight: null,
      heartbeat: { updatedAt: new Date().toISOString() },
      ghAuthOk: true,
      cursorAuth: { ok: true },
      diskMb: 2048,
      workspacePath: repoRoot,
    });

    expect(result.classification).toBe('healthy');
    expect(result.quiet).toBe(true);
    expect(result.alert.active).toBe(false);
  });

  it('returns rebuild_required on script/config drift', () => {
    const home = withHome();
    seedInstalledFromRepo(home, 'scripts/cursor-bridge/watchdog.mjs');
    const config = baseConfig();
    const repoRoot = defaultRepoRoot();
    const expected = computeRepoManifest(repoRoot, 'b'.repeat(40));
    const actual = computeInstalledManifest(home, 'b'.repeat(40));
    const drift = comparePackageManifests(expected, actual);
    expect(drift.match).toBe(false);

    const result = runBridgeWatch(config, {
      repoRoot,
      sourceCommit: 'b'.repeat(40),
      expectedManifest: expected,
      actualManifest: actual,
      drift,
      health: { healthy: true, failures: [], restartNeeded: false },
      watchdogTimerActive: true,
      claim: null,
      inFlight: null,
      ghAuthOk: true,
      cursorAuth: { ok: true },
      diskMb: 2048,
      workspacePath: repoRoot,
    });

    expect(result.classification).toBe('rebuild_required');
    expect(result.quiet).toBe(false);
    expect(result.reasons.some((r: string) => r.includes('drift') || r.includes('watchdog'))).toBe(
      true,
    );
  });

  it('defers rebuild when claim or protected in-flight is active', () => {
    expect(
      detectActiveWork(baseConfig(), {
        claim: { acquiredAt: new Date().toISOString(), issueNumber: 2814, resumeCommentId: '1' },
        inFlight: null,
      }).active,
    ).toBe(true);
    expect(
      detectActiveWork(baseConfig(), {
        claim: null,
        inFlight: { state: 'cli_spawned', issueNumber: 1 },
      }).reason,
    ).toContain('cli_spawned');
    expect(
      detectActiveWork(baseConfig(), {
        claim: null,
        inFlight: { state: 'running', issueNumber: 1 },
      }).active,
    ).toBe(true);

    const classified = classifyWatchOutcome({
      health: { healthy: true, failures: [], restartNeeded: false },
      drift: {
        match: false,
        classification: 'rebuild_required',
        drifted: ['scripts/cursor-bridge/bridge.mjs'],
        reason: 'repository_to_host_drift',
      },
      activeWork: { active: true, reason: 'active_claim' },
    });
    expect(classified.classification).toBe('rebuild_deferred');
  });

  it('returns manual_review_required for incompatible schema or ambiguous identity', () => {
    expect(
      classifyWatchOutcome({
        health: { healthy: true, failures: [], restartNeeded: false },
        drift: { match: true, classification: 'healthy', drifted: [] },
        activeWork: { active: false },
        schemaIncompatible: true,
      }).classification,
    ).toBe('manual_review_required');

    expect(
      classifyWatchOutcome({
        health: { healthy: true, failures: [], restartNeeded: false },
        drift: {
          match: false,
          classification: 'manual_review_required',
          reason: 'ambiguous_package_identity',
          drifted: [],
        },
        activeWork: { active: false },
        identityAmbiguous: true,
      }).classification,
    ).toBe('manual_review_required');
  });

  it('deduplicates repeated identical non-healthy results', () => {
    const home = withHome();
    seedInstalledFromRepo(home, 'scripts/cursor-bridge/self-check.mjs');
    const config = baseConfig();
    const repoRoot = defaultRepoRoot();
    const expected = computeRepoManifest(repoRoot, 'c'.repeat(40));
    const actual = computeInstalledManifest(home, 'c'.repeat(40));
    const drift = comparePackageManifests(expected, actual);
    const opts = {
      repoRoot,
      sourceCommit: 'c'.repeat(40),
      expectedManifest: expected,
      actualManifest: actual,
      drift,
      health: { healthy: true, failures: [], restartNeeded: false },
      watchdogTimerActive: true,
      claim: null,
      inFlight: null,
      ghAuthOk: true,
      cursorAuth: { ok: true },
      diskMb: 2048,
      workspacePath: repoRoot,
    };

    const first = runBridgeWatch(config, opts);
    expect(first.classification).toBe('rebuild_required');
    expect(first.deduplicated).toBe(false);
    const second = runBridgeWatch(config, opts);
    expect(second.classification).toBe('rebuild_required');
    expect(second.deduplicated).toBe(true);
    expect(fingerprintWatchResult(first)).toBe(fingerprintWatchResult(second));
  });

  it('stages package from requested immutable HEAD commit and preserves evidence on promote/rollback', () => {
    const home = withHome();
    seedInstalledFromRepo(home);
    const config = baseConfig();
    const repoRoot = defaultRepoRoot();
    const claimProbe = path.join(home, 'claim.json');
    const queueFile = path.join(home, 'queue', 'keep-me.json');
    const heartbeat = path.join(home, 'heartbeat.json');
    atomicWriteJson(claimProbe, { issueNumber: 9, acquiredAt: '2020-01-01T00:00:00.000Z' });
    fs.writeFileSync(queueFile, '{"ok":true}\n');
    atomicWriteJson(heartbeat, { updatedAt: new Date().toISOString(), pid: 1 });
    const before = captureEvidenceSnapshot(home) as EvidenceSnap;

    const sourceCommit = spawnSync('git', ['-C', repoRoot, 'rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).stdout.trim();
    expect(sourceCommit).toMatch(/^[0-9a-f]{40}$/);

    const stageRoot = path.join(home, 'stage');
    const staged = stagePackageFromCommit(repoRoot, sourceCommit, stageRoot);
    expect(staged.ok).toBe(true);
    const stagedManifest = computeInstalledManifest(stageRoot, sourceCommit);
    expect(stagedManifest.ok).toBe(true);

    const promoted = runBridgeBuild(config, {
      repoRoot,
      sourceCommit,
      stageRoot: path.join(home, 'stage-promote'),
      snapshotRoot: path.join(home, 'snap-promote'),
      skipRepoValidation: true,
      skipIsolatedValidation: true,
      skipSystemd: true,
      claim: null,
      inFlight: null,
    }) as Record<string, any>;
    expect(promoted.classification).toBe('promoted');
    expect(promoted.sourceCommit).toBe(sourceCommit);
    expect(promoted.packageHash).toBeTruthy();
    expect(secretSafeIdentity(promoted.installedIdentity)?.sourceCommit).toBe(sourceCommit);

    const claimBefore = before['claim.json'];
    expect(claimBefore?.type).toBe('file');
    expect(fs.readFileSync(claimProbe)).toEqual(
      claimBefore && 'buf' in claimBefore ? claimBefore.buf : Buffer.alloc(0),
    );
    expect(fs.existsSync(queueFile)).toBe(true);
    expect(fs.readFileSync(queueFile, 'utf8')).toBe('{"ok":true}\n');

    const rolled = runBridgeBuild(config, {
      repoRoot,
      sourceCommit,
      stageRoot: path.join(home, 'stage-rollback'),
      snapshotRoot: path.join(home, 'snap-rollback'),
      skipRepoValidation: true,
      skipIsolatedValidation: true,
      skipSystemd: true,
      claim: null,
      inFlight: null,
      simulatePostInstallFailure: true,
    }) as Record<string, any>;
    expect(rolled.classification).toBe('rolled_back');
    expect(rolled.rollback?.ok).toBe(true);
    expect(fs.readFileSync(queueFile, 'utf8')).toBe('{"ok":true}\n');
  });

  it('refuses build while protected active work exists and does not restart', () => {
    const home = withHome();
    seedInstalledFromRepo(home);
    const config = baseConfig();
    const repoRoot = defaultRepoRoot();
    const sourceCommit = spawnSync('git', ['-C', repoRoot, 'rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).stdout.trim();

    const deferred = runBridgeBuild(config, {
      repoRoot,
      sourceCommit,
      skipRepoValidation: true,
      skipIsolatedValidation: true,
      skipSystemd: true,
      claim: {
        issueNumber: 2814,
        resumeCommentId: '5065543735',
        acquiredAt: new Date().toISOString(),
      },
      inFlight: { state: 'running', issueNumber: 2814 },
    }) as Record<string, any>;
    expect(deferred.classification).toBe('rebuild_deferred');
    expect(deferred.promotion).toBeNull();
  });

  it('exposes secret-safe package identity fields only', () => {
    const identity = secretSafeIdentity({
      schemaVersion: 1,
      sourceCommit: 'd'.repeat(40),
      packageHash: 'e'.repeat(64),
      files: { 'scripts/cursor-bridge/bridge.mjs': 'f'.repeat(64) },
      recordedAt: '2026-07-24T00:00:00.000Z',
      token: 'secret',
    });
    expect(identity).toEqual({
      schemaVersion: 1,
      sourceCommit: 'd'.repeat(40),
      packageHash: 'e'.repeat(64),
      recordedAt: '2026-07-24T00:00:00.000Z',
      fileCount: 1,
    });
    expect(JSON.stringify(identity)).not.toContain('secret');
    expect(hashFile(__filename)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('snapshots package without copying runtime evidence directories', () => {
    const home = withHome();
    seedInstalledFromRepo(home);
    fs.writeFileSync(path.join(home, 'queue', 'x.json'), '{}');
    const snap = path.join(home, 'snap');
    snapshotPackage(home, snap);
    expect(fs.existsSync(path.join(snap, 'scripts'))).toBe(true);
    expect(fs.existsSync(path.join(snap, 'queue'))).toBe(false);
  });

  it('reports worktreeDirty from porcelain status, not sourceCommit divergence', () => {
    const repoRoot = defaultRepoRoot();
    const head = spawnSync('git', ['-C', repoRoot, 'rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).stdout.trim();
    const parent = spawnSync('git', ['-C', repoRoot, 'rev-parse', 'HEAD~1'], {
      encoding: 'utf8',
    }).stdout.trim();
    expect(parent).toMatch(/^[0-9a-f]{40}$/);

    const fromParent = resolveImmutableMainCommit(repoRoot, parent) as {
      ok: boolean;
      worktreeDirty?: boolean;
    };
    expect(fromParent.ok).toBe(true);
    // Parent != HEAD is normal on a clean tree; dirty must reflect porcelain only.
    const porcelain = spawnSync('git', ['-C', repoRoot, 'status', '--porcelain'], {
      encoding: 'utf8',
    }).stdout.trim();
    expect(fromParent.worktreeDirty).toBe(Boolean(porcelain));

    const fromHead = resolveImmutableMainCommit(repoRoot, head) as {
      ok: boolean;
      worktreeDirty?: boolean;
    };
    expect(fromHead.ok).toBe(true);
    expect(fromHead.worktreeDirty).toBe(Boolean(porcelain));
  });
});
