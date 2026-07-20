#!/usr/bin/env node
/**
 * Cursor Local Bridge — sole component allowed to start Cursor Local work.
 * Consumes wake packets, revalidates full eligibility, claims lane, launches CLI or falls back.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
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
  // normalize
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

async function processPacket(config, dirs, packetPath) {
  const packet = readPacket(packetPath);
  const issueNumber = Number(packet.issueNumber || packet.issue);
  appendBridgeLog(config, `dequeue ${path.basename(packetPath)} issue=#${issueNumber}`);

  // Move aside immediately to avoid double-dequeue
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
      fs.renameSync(processing, path.join(dirs.consumed, path.basename(packetPath) + '.rejected'));
      return;
    }

    const resumeId = String(eligibility.resume.id);
    if (isConsumed(config, resumeId)) {
      appendBridgeLog(config, `skip already consumed resume=${resumeId}`);
      fs.renameSync(processing, path.join(dirs.consumed, path.basename(packetPath) + '.dup'));
      return;
    }

    const auth = cliAuthPreflight(config);
    if (!auth.ok) {
      fallbackUnclaimed(config, issueNumber, auth.reason);
      fs.renameSync(processing, path.join(dirs.consumed, path.basename(packetPath) + '.noauth'));
      return;
    }

    const claim = acquireClaim(config, {
      issueNumber,
      resumeCommentId: resumeId,
      deliveryId: packet.deliveryId || path.basename(packetPath),
    });
    if (!claim.ok) {
      fallbackUnclaimed(config, issueNumber, claim.reason);
      fs.renameSync(processing, path.join(dirs.consumed, path.basename(packetPath) + '.busy'));
      return;
    }

    markConsumed(config, resumeId, { issueNumber, packet: path.basename(packetPath) });

    const action = eligibility.parsed.actions[0];
    try {
      postIssueComment(
        issueNumber,
        `${config.startedCommentPrefix || 'CURSOR BRIDGE STARTED'}\nIssue: #${issueNumber}\nResume comment id: ${resumeId}\nAction: ${action}\n`,
      );
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
      fs.renameSync(processing, path.join(dirs.consumed, path.basename(packetPath) + '.launchfail'));
      return;
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
      notifyLocal(config, 'LGFC Cursor Bridge', `Agent failed on #${issueNumber}: ${reason}`);
    } else {
      try {
        postIssueComment(
          issueNumber,
          `${config.completedCommentPrefix || 'CURSOR BRIDGE COMPLETED'}\nIssue: #${issueNumber}\nExit: 0\nClaim released.\n`,
        );
      } catch (err) {
        appendBridgeLog(config, `completed comment failed: ${err.message}`);
      }
      releaseClaim(config);
    }

    fs.renameSync(processing, path.join(dirs.consumed, path.basename(packetPath) + '.done'));
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
    }
  }
}

async function drainOnce(config, dirs) {
  const files = listPackets(dirs.queue);
  for (const file of files) {
    await processPacket(config, dirs, file);
  }
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
    await drainOnce(config, dirs);
    return;
  }

  if (mode === 'status') {
    const claim = readClaim(config);
    console.log(
      JSON.stringify(
        {
          home: bridgeHome(),
          claim: claim && isClaimActive(claim, config.claimTtlSeconds) ? claim : null,
          queue: listPackets(dirs.queue).map((f) => path.basename(f)),
          auth: cliAuthPreflight(config),
        },
        null,
        2,
      ),
    );
    return;
  }

  // watch loop: poll queue frequently; optional slow reconcile is packet-driven only here
  for (;;) {
    try {
      await drainOnce(config, dirs);
    } catch (err) {
      appendBridgeLog(config, `watch loop error: ${err.message}`);
    }
    await sleep(2000);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
