#!/usr/bin/env node
/**
 * Deterministic handoff controller — observe-only foundation (#2677-001 / #2770).
 *
 * Recognizes canonical handoff/review events, resolves exactly one open source
 * Issue + related PR/head, re-reads expected state, and emits a normalized
 * evidence packet. This task performs no Issue, PR, branch, label, closeout,
 * resume, or integration mutation.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assertEventAuthority,
  findLatestHandoffEvent,
} from './lib/event-contract.mjs';
import {
  assertCurrentHeadSha,
  buildEvidencePacket,
  extractPrimarySourceIssueRefs,
  resolveExactOpenSourceIssue,
} from './lib/evidence-collector.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const DEFAULT_CONFIG_PATH = path.join(ROOT, 'config/agent-routing/controller.json');

export function loadControllerConfig(configPath = DEFAULT_CONFIG_PATH) {
  const raw = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(raw);
  if (config.mode !== 'observe-only') {
    throw new Error('controller_mode_must_be_observe_only');
  }
  if (config.mutationAllowed !== false) {
    throw new Error('controller_mutation_must_be_disabled');
  }
  return config;
}

/**
 * Pure observe entry used by tests and the workflow.
 * @param {object} input fixture or live snapshot
 * @param {object} [config]
 */
export function runObserveController(input = {}, config = loadControllerConfig()) {
  if (config.mutationAllowed) {
    return failClosed('mutation_forbidden', 'Controller mutation is disabled for this task.');
  }

  const authority = assertEventAuthority({
    labels: input.sourceIssue?.labels || [],
    comment: input.triggerComment || input.eventComment || null,
  });

  let event = null;
  if (authority.ok) {
    const comment = input.triggerComment || input.eventComment;
    event = {
      ...authority.event,
      comment,
      commentId: String(comment.id || comment.databaseId || ''),
      createdAt: comment.createdAt || comment.created_at || null,
    };
  } else if (input.issueComments?.length) {
    const latest = findLatestHandoffEvent(input.issueComments, {
      markers: [...(config.canonicalEventMarkers || []), ...(config.legacyAdapterMarkers || [])],
    });
    if (!latest) {
      return failClosed(authority.code, authority.message, { labelsAreAuthority: false });
    }
    event = latest;
  } else {
    return failClosed(authority.code, authority.message, { labelsAreAuthority: false });
  }

  const issueCandidates = deriveSourceIssueCandidates(input);
  const issueResolution = resolveExactOpenSourceIssue(issueCandidates);
  if (!issueResolution.ok) return issueResolution;

  const sourceIssue = issueResolution.issue;
  const pullRequest = input.pullRequest || null;
  if (!pullRequest) {
    return failClosed('missing_pull_request', 'Related PR evidence is required for a current-head packet.');
  }

  const primaryRefs = extractPrimarySourceIssueRefs(pullRequest.body || '');
  if (primaryRefs.length === 0) {
    return failClosed('missing_pr_source_issue', 'PR body does not declare exactly one primary source Issue.');
  }
  if (primaryRefs.length > 1) {
    return failClosed('ambiguous_pr_source_issue', 'PR body declares multiple primary source Issues.', {
      issueNumbers: primaryRefs,
    });
  }
  if (primaryRefs[0] !== issueResolution.issueNumber) {
    return failClosed('source_issue_pr_mismatch', 'PR primary Issue does not match the resolved source Issue.', {
      sourceIssueNumber: issueResolution.issueNumber,
      prIssueNumber: primaryRefs[0],
    });
  }

  // Re-read contract: prefer explicit reread snapshots when provided.
  const rereadIssue = input.reread?.sourceIssue || sourceIssue;
  const rereadPr = input.reread?.pullRequest || pullRequest;
  const rereadAt = input.reread?.at || new Date().toISOString();

  const rereadIssueResolution = resolveExactOpenSourceIssue([rereadIssue]);
  if (!rereadIssueResolution.ok) return rereadIssueResolution;

  const headCheck = assertCurrentHeadSha({
    expectedHeadSha:
      rereadPr.headRefOid || rereadPr.headSha || rereadPr.head?.sha || '',
    observedHeadSha:
      input.observedHeadSha ||
      rereadPr.headRefOid ||
      rereadPr.headSha ||
      rereadPr.head?.sha ||
      '',
  });
  if (!headCheck.ok) return headCheck;

  return buildEvidencePacket({
    sourceIssue: rereadIssue,
    pullRequest: rereadPr,
    event,
    checks: input.checks || [],
    changedFiles: input.changedFiles || input.files || [],
    reviewThreads: input.reviewThreads || [],
    reviewSubmissions: input.reviewSubmissions || input.reviews || [],
    issueComments: input.issueComments || [],
    observedHeadSha: headCheck.headSha,
    rereadAt,
    deliveryProfile: input.deliveryProfile || null,
  });
}

function deriveSourceIssueCandidates(input = {}) {
  if (Array.isArray(input.sourceIssues)) return input.sourceIssues;
  if (input.sourceIssue) return [input.sourceIssue];
  return [];
}

function failClosed(code, message, details = {}) {
  return { ok: false, code, message, ...details };
}

function parseArgs(argv) {
  const out = { configPath: DEFAULT_CONFIG_PATH, inputPath: null, outputPath: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--config') out.configPath = argv[++i];
    else if (arg === '--input') out.inputPath = argv[++i];
    else if (arg === '--output') out.outputPath = argv[++i];
    else if (arg === '--help' || arg === '-h') out.help = true;
  }
  return out;
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    process.stdout.write(
      'Usage: node scripts/agent-routing/controller.mjs --input <fixture.json> [--output <packet.json>] [--config <config.json>]\n',
    );
    return 0;
  }
  if (!args.inputPath) {
    process.stderr.write('error: --input fixture/snapshot path is required in observe-only mode\n');
    return 2;
  }

  const config = loadControllerConfig(args.configPath);
  const input = JSON.parse(fs.readFileSync(args.inputPath, 'utf8'));
  const result = runObserveController(input, config);

  const payload = `${JSON.stringify(result, null, 2)}\n`;
  if (args.outputPath) {
    fs.mkdirSync(path.dirname(args.outputPath), { recursive: true });
    fs.writeFileSync(args.outputPath, payload, 'utf8');
  } else {
    process.stdout.write(payload);
  }

  return result.ok ? 0 : 1;
}

const isDirect =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirect) {
  process.exitCode = main();
}
