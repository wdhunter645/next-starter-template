#!/usr/bin/env node
/**
 * Scheduled reconciliation safety net for the deterministic handoff controller (#2774).
 *
 * Event-driven routing remains primary. Reconciliation detects missed or stale
 * eligible transactions, reuses the same controller evaluation + identity
 * markers, and never duplicates a completed controller action. Mutations stay
 * disabled on this path; operators retain write jobs for authorized execution.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  loadControllerConfig,
  resolveMutationSwitches,
  runController,
} from './controller.mjs';
import { collectLiveGitHubEvidence, assertValidPrNumber } from './lib/evidence-collector.mjs';
import {
  buildReconciliationIdentity,
  commentContainsIdentity,
  identityMarker,
} from './lib/idempotency.mjs';
import {
  attachObservability,
  createObservabilityRecorder,
  recordControllerTransitions,
} from './lib/observability.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const DEFAULT_CONFIG_PATH = path.join(ROOT, 'config/agent-routing/controller.json');

/**
 * Evaluate one reconciliation candidate without mutation.
 *
 * @param {{
 *   live?: object,
 *   issueNumber?: number,
 *   prNumber?: number,
 *   repository?: string,
 *   token?: string,
 *   fetchFn?: Function,
 *   now?: string|Date,
 *   runId?: string,
 * }} input
 * @param {object} [config]
 */
export async function reconcileCandidate(input = {}, config = loadControllerConfig()) {
  const mutationSwitches = resolveMutationSwitches(config);
  const recorder = createObservabilityRecorder({
    runId: input.runId || null,
    source: 'reconciliation',
    enabled: config.observability?.enabled !== false,
  });

  if (config.reconciliation?.enabled !== true) {
    const disabled = {
      ok: true,
      path: 'reconciliation',
      suppressed: true,
      code: 'reconciliation_disabled',
      mutations: 0,
      mutationSwitches,
      diagnosticsOnly: true,
      candidates: [],
    };
    recorder.emit('reconciliation_scan', 'disabled', { code: 'reconciliation_disabled' });
    return attachObservability(disabled, recorder);
  }

  if (config.reconciliation.mutationAllowed !== false || mutationSwitches.reconciliationMutations) {
    const forbidden = {
      ok: false,
      code: 'reconciliation_mutation_forbidden',
      message: 'Reconciliation must remain a non-mutating safety net.',
      mutations: 0,
      mutationSwitches,
    };
    recorder.emit('blocker', 'reconciliation_mutation_forbidden', { path: 'reconciliation' });
    return attachObservability(forbidden, recorder);
  }

  let live = input.live || null;
  if (!live) {
    const prCheck = assertValidPrNumber(input.prNumber);
    if (!prCheck.ok) {
      recorder.emit('blocker', prCheck.code, { path: 'reconciliation' });
      return attachObservability({ ...prCheck, mutations: 0, mutationSwitches }, recorder);
    }
    const collected = await collectLiveGitHubEvidence({
      repository: input.repository || config.repository,
      issueNumber: input.issueNumber,
      prNumber: prCheck.prNumber,
      token: input.token,
      fetchFn: input.fetchFn,
    });
    if (!collected.ok) {
      recorder.emit('blocker', collected.code, { path: 'reconciliation' });
      return attachObservability({ ...collected, mutations: 0, mutationSwitches }, recorder);
    }
    live = collected.live;
  }

  const controllerResult = runController(
    {
      ...input,
      live,
      observabilitySource: 'reconciliation',
      runId: input.runId || null,
    },
    config,
  );

  const headSha =
    controllerResult.packet?.pullRequest?.headSha ||
    live.pullRequest?.headSha ||
    live.headSha ||
    '';
  const sourceIssueNumber =
    controllerResult.packet?.sourceIssue?.number || live.sourceIssue?.number || null;
  const prNumber = controllerResult.packet?.pullRequest?.number || live.pullRequest?.number || null;
  const actionIdentity =
    controllerResult.packet?.idempotency?.actionIdentity ||
    controllerResult.integration?.identity ||
    'scan';

  let reconciliationIdentity = null;
  try {
    reconciliationIdentity = buildReconciliationIdentity({
      sourceIssueNumber,
      prNumber,
      headSha,
      actionIdentity,
    });
  } catch (error) {
    const failed = {
      ok: false,
      code: 'reconciliation_identity_unavailable',
      message: error instanceof Error ? error.message : String(error),
      mutations: 0,
      mutationSwitches,
      controller: controllerResult,
    };
    recorder.emit('blocker', failed.code, { path: 'reconciliation' });
    return attachObservability(failed, recorder);
  }

  const comments = live.issueComments || [];
  const alreadyRecorded = commentContainsIdentity(comments, 'reconciliation', reconciliationIdentity);
  const duplicateControllerAction = detectDuplicateControllerAction(controllerResult, comments);

  const stale = assessStaleEligible({
    live,
    config,
    now: input.now || new Date(),
    controllerResult,
  });

  const missed =
    Boolean(config.reconciliation.detectMissedEligible) &&
    controllerResult.ok &&
    Boolean(controllerResult.integration?.eligible) &&
    !duplicateControllerAction.duplicate;

  recorder.emit('reconciliation_scan', alreadyRecorded || duplicateControllerAction.duplicate ? 'suppressed' : 'evaluated', {
    reconciliationIdentity,
    missed,
    stale: Boolean(stale.stale),
    duplicate: Boolean(duplicateControllerAction.duplicate || alreadyRecorded),
  });

  if (alreadyRecorded || duplicateControllerAction.duplicate) {
    recorder.emit('duplicate_suppression', 'reconciliation', {
      reconciliationIdentity,
      reason: alreadyRecorded ? 'reconciliation_identity_present' : duplicateControllerAction.reason,
      controllerIdentity: duplicateControllerAction.identity || null,
    });
    recordControllerTransitions(
      { ...controllerResult, mutationDisabled: true },
      recorder,
      { path: 'reconciliation' },
    );
    return attachObservability(
      {
        ok: true,
        path: 'reconciliation',
        suppressed: true,
        code: 'reconciliation_duplicate_suppressed',
        mutations: 0,
        mutationSwitches,
        diagnosticsOnly: true,
        reconciliationIdentity,
        marker: identityMarker('reconciliation', reconciliationIdentity),
        duplicate: true,
        missed: false,
        stale: stale.stale,
        controller: controllerResult,
        candidate: {
          sourceIssueNumber,
          prNumber,
          headSha,
          eligible: Boolean(controllerResult.integration?.eligible),
        },
      },
      recorder,
    );
  }

  recordControllerTransitions(
    { ...controllerResult, mutationDisabled: true },
    recorder,
    { path: 'reconciliation' },
  );

  return attachObservability(
    {
      ok: true,
      path: 'reconciliation',
      suppressed: false,
      code: missed || stale.stale ? 'reconciliation_candidate_detected' : 'reconciliation_no_action',
      mutations: 0,
      mutationSwitches,
      diagnosticsOnly: true,
      reconciliationIdentity,
      marker: identityMarker('reconciliation', reconciliationIdentity),
      duplicate: false,
      missed,
      stale: stale.stale,
      staleReason: stale.reason || null,
      controller: controllerResult,
      candidate: {
        sourceIssueNumber,
        prNumber,
        headSha,
        eligible: Boolean(controllerResult.integration?.eligible),
        classification:
          controllerResult.remediation?.classification?.classification || null,
      },
      // Instruction-only: operators may replay through the event-driven write jobs.
      recommendedPath: 'event-driven',
    },
    recorder,
  );
}

/**
 * Reconcile at most one candidate per run (config-enforced).
 */
export async function runReconciliation(input = {}, config = loadControllerConfig()) {
  const max = Number(config.reconciliation?.maxCandidatesPerRun || 1);
  if (max !== 1) {
    return {
      ok: false,
      code: 'reconciliation_max_candidates_must_be_one',
      message: 'Reconciliation may evaluate at most one candidate per run.',
      mutations: 0,
    };
  }

  const candidates = Array.isArray(input.candidates) && input.candidates.length > 0
    ? input.candidates.slice(0, 1)
    : [
        {
          live: input.live,
          issueNumber: input.issueNumber,
          prNumber: input.prNumber,
          repository: input.repository,
          token: input.token,
          fetchFn: input.fetchFn,
          now: input.now,
          runId: input.runId,
        },
      ];

  const result = await reconcileCandidate(candidates[0], config);
  return {
    ...result,
    scanned: 1,
    maxCandidatesPerRun: 1,
  };
}

function detectDuplicateControllerAction(controllerResult, comments) {
  const integrationIdentity =
    controllerResult.integration?.identity ||
    controllerResult.integration?.integrationIdentity ||
    null;
  if (
    integrationIdentity &&
    commentContainsIdentity(comments, 'integration', integrationIdentity)
  ) {
    return {
      duplicate: true,
      reason: 'integration_identity_present',
      identity: integrationIdentity,
    };
  }
  if (
    controllerResult.integration?.suppressed &&
    String(controllerResult.integration?.code || '').includes('already')
  ) {
    return {
      duplicate: true,
      reason: controllerResult.integration.code,
      identity: integrationIdentity,
    };
  }
  const verificationIdentity =
    controllerResult.verification?.identity ||
    controllerResult.verification?.verificationIdentity ||
    null;
  if (
    verificationIdentity &&
    commentContainsIdentity(comments, 'verification', verificationIdentity)
  ) {
    return {
      duplicate: true,
      reason: 'verification_identity_present',
      identity: verificationIdentity,
    };
  }
  if (
    controllerResult.verification?.suppressed &&
    String(controllerResult.verification?.code || '').includes('already')
  ) {
    return {
      duplicate: true,
      reason: controllerResult.verification.code,
      identity: verificationIdentity,
    };
  }
  const closeoutIdentity =
    controllerResult.closeout?.identity || controllerResult.closeout?.closeoutIdentity || null;
  if (closeoutIdentity && commentContainsIdentity(comments, 'closeout', closeoutIdentity)) {
    return {
      duplicate: true,
      reason: 'closeout_identity_present',
      identity: closeoutIdentity,
    };
  }
  const successorIdentity =
    controllerResult.successor?.identity ||
    controllerResult.closeout?.successor?.identity ||
    null;
  if (successorIdentity && commentContainsIdentity(comments, 'successor', successorIdentity)) {
    return {
      duplicate: true,
      reason: 'successor_identity_present',
      identity: successorIdentity,
    };
  }
  for (const action of controllerResult.remediation?.actions || []) {
    const identity = action.identity || action.resumeIdentity || action.responseIdentity || null;
    const kind = String(action.type || '').includes('resume')
      ? 'resume'
      : String(action.type || '').includes('escalation')
        ? 'escalation'
        : String(action.type || '').includes('response')
          ? 'response'
          : null;
    if (identity && kind && commentContainsIdentity(comments, kind, identity)) {
      return { duplicate: true, reason: `${kind}_identity_present`, identity };
    }
    if (action.suppressed || action.duplicate) {
      return {
        duplicate: true,
        reason: action.code || 'remediation_action_suppressed',
        identity,
      };
    }
  }
  return { duplicate: false };
}

function assessStaleEligible({ live, config, now, controllerResult }) {
  if (!config.reconciliation?.detectStaleEligible) {
    return { stale: false };
  }
  if (!controllerResult.ok || !controllerResult.integration?.eligible) {
    return { stale: false };
  }
  const minutes = Number(config.reconciliation.staleEligibleAfterMinutes || 45);
  const collectedAt = Date.parse(live.collectedAt || '');
  const nowMs = now instanceof Date ? now.getTime() : Date.parse(String(now));
  if (Number.isNaN(collectedAt) || Number.isNaN(nowMs)) {
    return { stale: false };
  }
  const ageMinutes = (nowMs - collectedAt) / 60000;
  if (ageMinutes < minutes) return { stale: false };
  return {
    stale: true,
    reason: `eligible_without_integration_for_${Math.floor(ageMinutes)}_minutes`,
  };
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
      'Usage: node scripts/agent-routing/reconcile.mjs --issue <n> --pr <n> [--output <result.json>]\n',
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

  const hasIssue = args.issueNumber != null && String(args.issueNumber).trim() !== '';
  const hasPr = args.prNumber != null && String(args.prNumber).trim() !== '';
  if (!hasIssue || !hasPr) {
    process.stderr.write('error: reconciliation requires both --issue and --pr\n');
    return 2;
  }

  const result = await runReconciliation(
    {
      ...hints,
      issueNumber: Number(args.issueNumber),
      prNumber: args.prNumber,
      repository: args.repository || hints.repository,
      token: args.token,
      fetchFn,
    },
    config,
  );
  const payload = `${JSON.stringify(result, null, 2)}\n`;
  if (args.outputPath) {
    fs.mkdirSync(path.dirname(args.outputPath), { recursive: true });
    fs.writeFileSync(args.outputPath, payload, 'utf8');
  } else {
    process.stdout.write(payload);
  }
  return result.ok ? 0 : 1;
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
if (isDirect) main();
