#!/usr/bin/env node
/**
 * Cursor Local Bridge — sole component allowed to start Cursor Local work.
 * Consumes wake packets, revalidates full eligibility, claims lane, launches CLI or falls back.
 * Also writes a local heartbeat and runs a bounded missed-handoff reconciliation sweep.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { loadConfig, ensureDirs, bridgeHome } from './lib/paths.mjs';
import { validateEligibility } from './lib/eligibility.mjs';
import {
  acquireClaim,
  releaseClaim,
  isConsumed,
  markConsumed,
  readClaim,
  isClaimActive,
} from './lib/claim.mjs';
import { appendBridgeLog, fallbackUnclaimed, postIssueComment, notifyLocal } from './lib/notify.mjs';
import { cliAuthPreflight, launchLocalAgent } from './lib/launch.mjs';
import { writeHeartbeat } from './lib/heartbeat.mjs';
import { runReconcileSweep } from './lib/reconcile.mjs';
import { collectStatus } from './lib/status.mjs';
import { atomicWriteJson } from './lib/atomic-write.mjs';

const REPO = 'wdhunter645/next-starter-template';

function ghJson(args) {
  const r = spawnSync('gh', args, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  if (r.status !== 0) {
    throw new Error(`gh ${args.join(' ')} failed: ${r.stderr || r.stdout}`);
  }
  return JSON.parse(r.stdout || 'null');
}

function fetchIssueBundle(issueNumber) {
  const issue = ghJson([
    'issue',
    'view',
    String(issueNumber),
    '--repo',
    REPO,
    '--json',
    'number,title,state,labels,url,body',
  ]);
  const comments = ghJson([
    'api',
    `repos/${REPO}/issues/${issueNumber}/comments`,
    '--paginate',
  ]);
  const normalized = (Array.isArray(comments) ? comments : []).map((c) => ({
    id: c.id,
    url: c.html_url,
    body: c.body,
    createdAt: c.created_at,
    author: c.user?.login,
  }));
  return { issue, comments: normalized };
}

function listPackets(queueDir) {
  if (!fs.existsSync(queueDir)) return [];
  return fs
    .readdirSync(queueDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(queueDir, f))
    .sort();
}

function readPacket(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function metaPath(config) {
  return path.join(bridgeHome(), config.runtimeMetaPath || 'runtime-meta.json');
}

function readMeta(config) {
  const p = metaPath(config);
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
}

function writeMeta(config, patch) {
  const next = { ...readMeta(config), ...patch, updatedAt: new Date().toISOString() };
  atomicWriteJson(metaPath(config), next, 0o600);
  return next;
}

function pulseHeartbeat(config, dirs, serviceMode, extra = {}) {
  const meta = readMeta(config);
  return writeHeartbeat(config, {
    serviceMode,
    queueDepth: listPackets(dirs.queue).length,
    lastInboundPacketAt: meta.lastInboundPacketAt || null,
    lastOutboundGithubAt: meta.lastOutboundGithubAt || null,
    ...extra,
  });
}

async function processPacket(config, dirs, packetPath) {
  const packet = readPacket(packetPath);
  const issueNumber = Number(packet.issueNumber || packet.issue);
  appendBridgeLog(config, `dequeue ${path.basename(packetPath)} issue=#${issueNumber}`);
  writeMeta(config, { lastInboundPacketAt: new Date().toISOString() });

  const processing = `${packetPath}.processing`;
  fs.renameSync(packetPath, processing);

  try {
    const { issue, comments } = fetchIssueBundle(issueNumber);
    const eligibility = validateEligibility(issue, comments, {
      requiredLabels: config.requiredLabels,
      expectedRepo: REPO,
    });

    if (!eligibility.ok) {
      fallbackUnclaimed(config, issueNumber, `validation_failed:${eligibility.errors.join(',')}`);
      writeMeta(config, { lastOutboundGithubAt: new Date().toISOString() });
      fs.renameSync(processing, path.join(dirs.consumed, path.basename(packetPath) + '.rejected'));
      return { ok: false, reason: 'validation_failed' };
    }

    const resumeId = String(eligibility.resume.id);
    if (isConsumed(config, resumeId)) {
      appendBridgeLog(config, `skip already consumed resume=${resumeId}`);
      fs.renameSync(processing, path.join(dirs.consumed, path.basename(packetPath) + '.dup'));
      return { ok: true, reason: 'already_consumed' };
    }

    const auth = cliAuthPreflight(config);
    if (!auth.ok) {
      fallbackUnclaimed(config, issueNumber, auth.reason);
      writeMeta(config, { lastOutboundGithubAt: new Date().toISOString() });
      fs.renameSync(processing, path.join(dirs.consumed, path.basename(packetPath) + '.noauth'));
      return { ok: false, reason: auth.reason };
    }

    const claim = acquireClaim(config, {
      issueNumber,
      resumeCommentId: resumeId,
      deliveryId: packet.deliveryId || path.basename(packetPath),
    });
    if (!claim.ok) {
      fallbackUnclaimed(config, issueNumber, claim.reason);
      writeMeta(config, { lastOutboundGithubAt: new Date().toISOString() });
      fs.renameSync(processing, path.join(dirs.consumed, path.basename(packetPath) + '.busy'));
      return { ok: false, reason: claim.reason };
    }

    markConsumed(config, resumeId, { issueNumber, packet: path.basename(packetPath) });

    const action = eligibility.parsed.actions[0];
    try {
      postIssueComment(
        issueNumber,
        `${config.startedCommentPrefix || 'CURSOR BRIDGE STARTED'}\nIssue: #${issueNumber}\nResume comment id: ${resumeId}\nAction: ${action}\n`,
      );
      writeMeta(config, { lastOutboundGithubAt: new Date().toISOString() });
    } catch (err) {
      appendBridgeLog(config, `started comment failed: ${err.message}`);
    }

    const launched = launchLocalAgent(config, {
      issueNumber,
      resume: eligibility.resume,
      response: eligibility.response,
      action,
    });

    if (launched.error) {
      releaseClaim(config);
      fallbackUnclaimed(config, issueNumber, launched.error);
      writeMeta(config, { lastOutboundGithubAt: new Date().toISOString() });
      fs.renameSync(processing, path.join(dirs.consumed, path.basename(packetPath) + '.launchfail'));
      return { ok: false, reason: launched.error };
    }

    const { child } = launched;
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    const exitCode = await new Promise((resolve) => {
      child.on('close', resolve);
      child.on('error', () => resolve(1));
    });

    const logSnippet = (stdout + stderr).slice(-4000);
    fs.writeFileSync(
      path.join(dirs.home, `run-${issueNumber}-${resumeId}.log`),
      logSnippet,
      { mode: 0o600 },
    );

    if (exitCode !== 0) {
      releaseClaim(config);
      const reason = /rate limit|usage|quota|payment|plan/i.test(logSnippet)
        ? 'cli_usage_or_plan_limit'
        : `cli_exit_${exitCode}`;
      fallbackUnclaimed(config, issueNumber, reason);
      writeMeta(config, { lastOutboundGithubAt: new Date().toISOString() });
      notifyLocal(config, 'LGFC Cursor Bridge', `Agent failed on #${issueNumber}: ${reason}`);
      fs.renameSync(processing, path.join(dirs.consumed, path.basename(packetPath) + '.done'));
      return { ok: false, reason };
    }

    try {
      postIssueComment(
        issueNumber,
        `${config.completedCommentPrefix || 'CURSOR BRIDGE COMPLETED'}\nIssue: #${issueNumber}\nExit: 0\nClaim released.\n`,
      );
      writeMeta(config, { lastOutboundGithubAt: new Date().toISOString() });
    } catch (err) {
      appendBridgeLog(config, `completed comment failed: ${err.message}`);
    }
    releaseClaim(config);

    fs.renameSync(processing, path.join(dirs.consumed, path.basename(packetPath) + '.done'));
    return { ok: true, reason: 'completed' };
  } catch (err) {
    appendBridgeLog(config, `process error: ${err.message}`);
    try {
      releaseClaim(config);
    } catch {
      /* ignore */
    }
    if (fs.existsSync(processing)) {
      fs.renameSync(processing, path.join(dirs.consumed, path.basename(packetPath) + '.error'));
    }
    if (issueNumber) {
      fallbackUnclaimed(config, issueNumber, `bridge_error:${err.message}`);
      writeMeta(config, { lastOutboundGithubAt: new Date().toISOString() });
    }
    return { ok: false, reason: `bridge_error:${err.message}` };
  }
}

async function drainOnce(config, dirs) {
  const files = listPackets(dirs.queue);
  const results = [];
  for (const file of files) {
    results.push(await processPacket(config, dirs, file));
  }
  return {
    at: new Date().toISOString(),
    drained: files.length,
    results,
    ok: results.every((r) => r.ok !== false || r.reason === 'already_consumed'),
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const config = loadConfig();
  const dirs = ensureDirs(config);
  appendBridgeLog(config, `bridge start home=${dirs.home} pid=${process.pid}`);

  const mode = process.argv[2] || 'watch';
  if (mode === 'once') {
    const drain = await drainOnce(config, dirs);
    pulseHeartbeat(config, dirs, 'once', { lastDrain: drain });
    return;
  }

  if (mode === 'status') {
    console.log(JSON.stringify(collectStatus(config), null, 2));
    return;
  }

  if (mode === 'reconcile') {
    const result = await runReconcileSweep(config, dirs);
    pulseHeartbeat(config, dirs, 'reconcile', { lastReconcile: result });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
    return;
  }

  let lastReconcileAt = 0;
  let lastReconcile = null;
  let lastDrain = null;
  const reconcileIntervalMs = (config.reconcileIntervalSeconds ?? 900) * 1000;

  pulseHeartbeat(config, dirs, 'watch', {});

  for (;;) {
    try {
      lastDrain = await drainOnce(config, dirs);
    } catch (err) {
      appendBridgeLog(config, `watch loop error: ${err.message}`);
      lastDrain = { at: new Date().toISOString(), ok: false, error: err.message };
    }

    const now = Date.now();
    if (config.reconcileEnabled !== false && now - lastReconcileAt >= reconcileIntervalMs) {
      try {
        lastReconcile = await runReconcileSweep(config, dirs);
        lastReconcileAt = now;
        // Drain immediately so recovered packets enter the normal path.
        if (lastReconcile.recovered?.length) {
          lastDrain = await drainOnce(config, dirs);
        }
      } catch (err) {
        lastReconcile = {
          ok: false,
          failedClosed: true,
          reason: `reconcile_exception:${err.message}`,
          recovered: [],
          at: new Date().toISOString(),
        };
        lastReconcileAt = now;
        appendBridgeLog(config, `reconcile exception: ${err.message}`);
      }
    }

    pulseHeartbeat(config, dirs, 'watch', {
      lastDrain: lastDrain
        ? {
            at: lastDrain.at,
            drained: lastDrain.drained ?? 0,
            ok: lastDrain.ok !== false,
            error: lastDrain.error || null,
          }
        : null,
      lastReconcile: lastReconcile
        ? {
            at: lastReconcile.at || new Date().toISOString(),
            ok: lastReconcile.ok,
            reason: lastReconcile.reason,
            recovered: (lastReconcile.recovered || []).length,
            failedClosed: !!lastReconcile.failedClosed,
          }
        : null,
    });

    await sleep(2000);
  }
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (invokedDirectly) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { drainOnce, processPacket, listPackets, fetchIssueBundle };
