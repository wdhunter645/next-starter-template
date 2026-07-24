#!/usr/bin/env node
/**
 * Deterministic handoff controller — observe-only foundation (#2677-001 / #2770).
 *
 * Direct execution always performs GitHub-native reads. Injected `input.live`
 * evidence is accepted only by the pure `runObserveController` test boundary.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  PROTECTED_DECISION_CLASSES,
  CANONICAL_EVENT_MARKERS,
  LEGACY_ADAPTER_MARKERS,
} from './lib/event-contract.mjs';
import {
  assertDeliveryProfileHintMatchesLive,
  assertHintsMatchLive,
  assertValidPrNumber,
  buildEvidencePacket,
  collectLiveGitHubEvidence,
  extractDeliveryProfile,
  extractPrimarySourceIssueRefs,
  resolveCanonicalEventFromLiveComments,
  resolveExactOpenSourceIssue,
} from './lib/evidence-collector.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const DEFAULT_CONFIG_PATH = path.join(ROOT, 'config/agent-routing/controller.json');

const REQUIRED_WORKFLOW_CAPABILITIES = Object.freeze([
  'merge',
  'close',
  'relabel',
  'resume',
  'activateSuccessor',
  'mutateMain',
]);

const REQUIRED_IDEMPOTENCY_FIELDS = Object.freeze([
  'sourceIssueNumber',
  'eventType',
  'eventCommentId',
  'prNumber',
  'headSha',
  'actionIdentity',
]);

export function loadControllerConfig(configPath = DEFAULT_CONFIG_PATH) {
  const raw = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(raw);
  assertObserveOnlyConfigInvariants(config);
  return config;
}

export function assertObserveOnlyConfigInvariants(config = {}) {
  if (config.mode !== 'observe-only') {
    throw new Error('controller_mode_must_be_observe_only');
  }
  if (config.mutationAllowed !== false) {
    throw new Error('controller_mutation_must_be_disabled');
  }
  if (config.labelsAreAuthority !== false) {
    throw new Error('controller_labels_must_not_be_authority');
  }
  if (config.requireOpenSourceIssue !== true) {
    throw new Error('controller_must_require_open_source_issue');
  }
  if (config.requireExactSourceIssueCount !== 1) {
    throw new Error('controller_must_require_exact_one_source_issue');
  }
  if (config.rereadBeforePacket !== true) {
    throw new Error('controller_must_reread_before_packet');
  }
  if (config.rejectStaleHeadSha !== true) {
    throw new Error('controller_must_reject_stale_head_sha');
  }

  const protectedClasses = [...(config.protectedDecisionClasses || [])].sort();
  const expectedProtected = [...PROTECTED_DECISION_CLASSES].sort();
  if (JSON.stringify(protectedClasses) !== JSON.stringify(expectedProtected)) {
    throw new Error('controller_protected_decision_classes_drift');
  }

  for (const marker of CANONICAL_EVENT_MARKERS) {
    if (!(config.canonicalEventMarkers || []).includes(marker)) {
      throw new Error(`controller_missing_canonical_marker:${marker}`);
    }
  }
  for (const marker of LEGACY_ADAPTER_MARKERS) {
    if (!(config.legacyAdapterMarkers || []).includes(marker)) {
      throw new Error(`controller_missing_legacy_marker:${marker}`);
    }
  }

  const caps = config.workflowCapabilities || {};
  for (const key of REQUIRED_WORKFLOW_CAPABILITIES) {
    if (caps[key] !== false) {
      throw new Error(`controller_capability_must_be_false:${key}`);
    }
  }

  const keyFields = config.idempotency?.keyFields || [];
  for (const field of REQUIRED_IDEMPOTENCY_FIELDS) {
    if (!keyFields.includes(field)) {
      throw new Error(`controller_idempotency_missing_field:${field}`);
    }
  }

  return true;
}

/**
 * Pure observe entry for deterministic tests and already-collected live evidence.
 * Operational callers must use `mainAsync`, which always collects live evidence.
 */
export function runObserveController(input = {}, config = loadControllerConfig()) {
  if (config.mutationAllowed) {
    return failClosed('mutation_forbidden', 'Controller mutation is disabled for this task.');
  }

  try {
    assertObserveOnlyConfigInvariants(config);
  } catch (error) {
    return failClosed('controller_config_drift', error instanceof Error ? error.message : String(error));
  }

  const live = input.live || null;
  if (!live) {
    return failClosed(
      'live_evidence_unavailable',
      'GitHub-native live evidence is required; caller-supplied snapshot/reread cannot substitute.',
    );
  }

  const hintCheck = assertHintsMatchLive({ hints: input, live });
  if (!hintCheck.ok) return hintCheck;

  const eventResolution = resolveCanonicalEventFromLiveComments({
    liveComments: live.issueComments || [],
    triggerHint: input.triggerComment || input.eventComment || null,
    markers: [...(config.canonicalEventMarkers || []), ...(config.legacyAdapterMarkers || [])],
  });
  if (!eventResolution.ok) return eventResolution;
  const event = eventResolution.event;

  const sourceIssue = live.sourceIssue;
  const issueResolution = resolveExactOpenSourceIssue([sourceIssue]);
  if (!issueResolution.ok) return issueResolution;

  const pullRequest = live.pullRequest || null;
  if (!pullRequest) {
    return failClosed('missing_pull_request', 'Related PR evidence is required for a current-head packet.');
  }
  const prNumberCheck = assertValidPrNumber(pullRequest.number);
  if (!prNumberCheck.ok) return prNumberCheck;

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

  const liveProfile = extractDeliveryProfile(pullRequest.body || '');
  const profileHintCheck = assertDeliveryProfileHintMatchesLive({
    hint: input.deliveryProfile || null,
    liveProfile,
  });
  if (!profileHintCheck.ok) return profileHintCheck;

  const liveHeadSha =
    hintCheck.liveHeadSha ||
    pullRequest.headRefOid ||
    pullRequest.headSha ||
    pullRequest.head?.sha ||
    live.headSha ||
    '';

  return buildEvidencePacket({
    sourceIssue,
    pullRequest,
    event,
    checks: live.checks || [],
    changedFiles: live.changedFiles || live.files || [],
    reviewThreads: live.reviewThreads || [],
    reviewSubmissions: live.reviewSubmissions || live.reviews || [],
    issueComments: live.issueComments || [],
    observedHeadSha: liveHeadSha,
    rereadAt: live.collectedAt || new Date().toISOString(),
    deliveryProfile: liveProfile,
  });
}

function failClosed(code, message, details = {}) {
  return { ok: false, code, message, ...details };
}

function parseArgs(argv) {
  const out = {
    configPath: DEFAULT_CONFIG_PATH,
    inputPath: null,
    outputPath: null,
    issueNumber: null,
    prNumber: null,
    repository: process.env.GITHUB_REPOSITORY || null,
    token: process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--config') out.configPath = argv[++i];
    else if (arg === '--input') out.inputPath = argv[++i];
    else if (arg === '--output') out.outputPath = argv[++i];
    else if (arg === '--issue') out.issueNumber = argv[++i];
    else if (arg === '--pr') out.prNumber = argv[++i];
    else if (arg === '--repository') out.repository = argv[++i];
    else if (arg === '--help' || arg === '-h') out.help = true;
  }
  return out;
}

export async function mainAsync(argv = process.argv.slice(2), { fetchFn = globalThis.fetch } = {}) {
  const args = parseArgs(argv);
  if (args.help) {
    process.stdout.write(
      [
        'Usage:',
        '  node scripts/agent-routing/controller.mjs --issue <n> --pr <n> [--input <hints.json>] [--output <packet.json>]',
        '',
        'Direct execution always performs GitHub-native live collection.',
        'Presence of either --issue or --pr is operational intent; partial identity fails closed.',
        'Caller-supplied --input fields are hints only; an embedded `live` object is ignored.',
        'Fixture-only unit tests may call runObserveController() directly with injected live evidence.',
      ].join('\n') + '\n',
    );
    return 0;
  }

  const config = loadControllerConfig(args.configPath);
  let hints = {};
  if (args.inputPath) {
    const supplied = JSON.parse(fs.readFileSync(args.inputPath, 'utf8'));
    const { live: _discardedLive, ...safeHints } = supplied || {};
    hints = safeHints;
  }

  const hasIssueFlag = args.issueNumber != null && String(args.issueNumber).trim() !== '';
  const hasPrFlag = args.prNumber != null && String(args.prNumber).trim() !== '';
  if (!hasIssueFlag || !hasPrFlag) {
    const partial = hasIssueFlag || hasPrFlag;
    process.stderr.write(
      partial
        ? 'error: operational execution requires both --issue and --pr; partial CLI identity is not accepted and cannot use embedded input.live\n'
        : 'error: live collection requires --issue and --pr\n',
    );
    return 2;
  }

  const prCheck = assertValidPrNumber(args.prNumber);
  if (!prCheck.ok) {
    writeResult(prCheck, args.outputPath);
    return 1;
  }

  const collected = await collectLiveGitHubEvidence({
    repository: args.repository || hints.repository,
    issueNumber: Number(args.issueNumber),
    prNumber: prCheck.prNumber,
    token: args.token,
    fetchFn,
  });
  if (!collected.ok) {
    writeResult(collected, args.outputPath);
    return 1;
  }

  const result = runObserveController({ ...hints, live: collected.live }, config);
  writeResult(result, args.outputPath);
  return result.ok ? 0 : 1;
}

function writeResult(result, outputPath) {
  const payload = `${JSON.stringify(result, null, 2)}\n`;
  if (outputPath) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, payload, 'utf8');
  } else {
    process.stdout.write(payload);
  }
}

export function main(argv = process.argv.slice(2)) {
  return mainAsync(argv).then(
    (code) => {
      process.exitCode = code;
      return code;
    },
    (error) => {
      process.stderr.write(`error: ${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
      return 1;
    },
  );
}

const isDirect =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirect) {
  main();
}
