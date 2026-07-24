#!/usr/bin/env node
/**
 * Deterministic handoff controller (#2677 / #2770 / #2771 / #2772).
 *
 * Operational execution always performs GitHub-native live reads. Remediation
 * routing consumes only that normalized current-head packet and trusted
 * source-Issue decisions included in the live evidence. Component integration
 * emits at most one non-main integrate instruction plus exact post-integration
 * verification when a merge SHA is recorded.
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
import {
  collectCurrentHeadFindings,
  DISPOSITION_CLASSES,
  extractSourceIssueAuthorizations,
} from './lib/disposition.mjs';
import { findLatestDisposition } from './lib/idempotency.mjs';
import { routeRemediation } from './lib/remediation-router.mjs';
import {
  evaluateComponentIntegrationTransaction,
  executeComponentIntegration,
} from './lib/component-integration.mjs';
import { verifyPostIntegration } from './lib/post-integration-verify.mjs';

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
const REQUIRED_ROUTING_CAPABILITIES = Object.freeze([
  'response',
  'resume',
  'escalation',
]);
const REQUIRED_ROUTING_PROTECTED_CLASSES = Object.freeze([
  'product',
  'design',
  'engineering-approval',
  'recovery',
  'credential',
  'secret',
  'destructive',
  'rights-privacy-publication',
  'production',
]);
const REQUIRED_INTEGRATION_IDEMPOTENCY_FIELDS = Object.freeze([
  'targetBranch',
  'integrationDisposition',
  'mergeSha',
  'verificationIdentity',
]);
const REQUIRED_INTEGRATION_CAPABILITIES = Object.freeze({
  integrate: true,
  verify: true,
  close: false,
  activateSuccessor: false,
});

export function loadControllerConfig(configPath = DEFAULT_CONFIG_PATH) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  assertObserveOnlyConfigInvariants(config);
  return config;
}

export function assertObserveOnlyConfigInvariants(config = {}) {
  if (config.mode !== 'observe-only') throw new Error('controller_mode_must_be_observe_only');
  if (config.mutationAllowed !== false) throw new Error('controller_mutation_must_be_disabled');
  if (config.labelsAreAuthority !== false) throw new Error('controller_labels_must_not_be_authority');
  if (config.requireOpenSourceIssue !== true) throw new Error('controller_must_require_open_source_issue');
  if (config.requireExactSourceIssueCount !== 1) {
    throw new Error('controller_must_require_exact_one_source_issue');
  }
  if (config.rereadBeforePacket !== true) throw new Error('controller_must_reread_before_packet');
  if (config.rejectStaleHeadSha !== true) throw new Error('controller_must_reject_stale_head_sha');

  const configuredProtected = new Set(config.protectedDecisionClasses || []);
  for (const decisionClass of PROTECTED_DECISION_CLASSES) {
    if (!configuredProtected.has(decisionClass)) {
      throw new Error(`controller_protected_decision_class_missing:${decisionClass}`);
    }
  }
  if (config.remediationRouting?.enabled === true) {
    for (const decisionClass of REQUIRED_ROUTING_PROTECTED_CLASSES) {
      if (!configuredProtected.has(decisionClass)) {
        throw new Error(`controller_routing_protected_class_missing:${decisionClass}`);
      }
    }
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
    if (caps[key] !== false) throw new Error(`controller_capability_must_be_false:${key}`);
  }
  const keyFields = config.idempotency?.keyFields || [];
  for (const field of REQUIRED_IDEMPOTENCY_FIELDS) {
    if (!keyFields.includes(field)) throw new Error(`controller_idempotency_missing_field:${field}`);
  }

  if (config.remediationRouting?.enabled === true) {
    if (config.remediationRouting.sourceIssueOnly !== true) {
      throw new Error('remediation_routing_must_be_source_issue_only');
    }
    for (const key of REQUIRED_ROUTING_CAPABILITIES) {
      if (config.remediationRouting.capabilities?.[key] !== true) {
        throw new Error(`remediation_routing_capability_required:${key}`);
      }
    }
    assertNonEmptyStringArray(
      config.remediationRouting.requiredChecks,
      'remediation_routing_requires_nonempty_required_checks',
    );
    assertNonEmptyStringArray(
      config.remediationRouting.trustedDecisionAuthors,
      'remediation_routing_requires_trusted_decision_authors',
    );
    assertNonEmptyStringArray(
      config.remediationRouting.trustedControllerAuthors,
      'remediation_routing_requires_trusted_controller_authors',
    );
  }

  if (config.componentIntegration?.enabled === true) {
    if (config.componentIntegration.allowMain !== false) {
      throw new Error('component_integration_must_forbid_main');
    }
    if (config.componentIntegration.allowProduction !== false) {
      throw new Error('component_integration_must_forbid_production');
    }
    if (Number(config.componentIntegration.maxIntegrationsPerRun) !== 1) {
      throw new Error('component_integration_max_must_be_one');
    }
    const prefixes = config.componentIntegration.allowedTargetPrefixes || [];
    if (!prefixes.includes('component/')) {
      throw new Error('component_integration_requires_component_prefix');
    }
    assertNonEmptyStringArray(
      config.componentIntegration.requiredChecks,
      'component_integration_requires_nonempty_required_checks',
    );
    assertNonEmptyStringArray(
      config.componentIntegration.trustedIntegrationDecisionAuthors,
      'component_integration_requires_trusted_decision_authors',
    );
    assertNonEmptyStringArray(
      config.componentIntegration.trustedReviewAuthors,
      'component_integration_requires_trusted_review_authors',
    );
    const integrationCaps = config.componentIntegration.capabilities || {};
    for (const [key, expected] of Object.entries(REQUIRED_INTEGRATION_CAPABILITIES)) {
      if (integrationCaps[key] !== expected) {
        throw new Error(`component_integration_capability_invalid:${key}`);
      }
    }
    for (const field of REQUIRED_INTEGRATION_IDEMPOTENCY_FIELDS) {
      if (!keyFields.includes(field)) {
        throw new Error(`controller_idempotency_missing_field:${field}`);
      }
    }
  }
  return true;
}

export function runObserveController(input = {}, config = loadControllerConfig()) {
  if (config.mutationAllowed) return failClosed('mutation_forbidden', 'Controller mutation is disabled.');
  try {
    assertObserveOnlyConfigInvariants(config);
  } catch (error) {
    return failClosed('controller_config_drift', error instanceof Error ? error.message : String(error));
  }

  const live = input.live || null;
  if (!live) return failClosed('live_evidence_unavailable', 'GitHub-native live evidence is required.');
  const hintCheck = assertHintsMatchLive({ hints: input, live });
  if (!hintCheck.ok) return hintCheck;

  const eventResolution = resolveCanonicalEventFromLiveComments({
    liveComments: live.issueComments || [],
    triggerHint: input.triggerComment || input.eventComment || null,
    markers: [...(config.canonicalEventMarkers || []), ...(config.legacyAdapterMarkers || [])],
  });
  if (!eventResolution.ok) return eventResolution;

  const sourceIssue = live.sourceIssue;
  const issueResolution = resolveExactOpenSourceIssue([sourceIssue]);
  if (!issueResolution.ok) return issueResolution;
  const pullRequest = live.pullRequest || null;
  if (!pullRequest) return failClosed('missing_pull_request', 'Related PR evidence is required.');
  const prNumberCheck = assertValidPrNumber(pullRequest.number);
  if (!prNumberCheck.ok) return prNumberCheck;

  const primaryRefs = extractPrimarySourceIssueRefs(pullRequest.body || '');
  if (primaryRefs.length === 0) {
    return failClosed('missing_pr_source_issue', 'PR body does not declare one primary source Issue.');
  }
  if (primaryRefs.length > 1) {
    return failClosed('ambiguous_pr_source_issue', 'PR body declares multiple source Issues.', {
      issueNumbers: primaryRefs,
    });
  }
  if (primaryRefs[0] !== issueResolution.issueNumber) {
    return failClosed('source_issue_pr_mismatch', 'PR source Issue does not match live Issue.');
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
    event: eventResolution.event,
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

export function runController(input = {}, config = loadControllerConfig()) {
  const observed = runObserveController(input, config);
  if (!observed.ok || config.remediationRouting?.enabled !== true) return observed;

  const routingConfig = config.remediationRouting;
  const live = input.live || {};
  const liveComments = live.issueComments || [];
  const routingPacket = enrichRoutingPacket(observed.packet, live);
  const findings = collectCurrentHeadFindings(routingPacket);

  const trustedDecisionComments = filterCommentsByAuthor(
    liveComments,
    routingConfig.trustedDecisionAuthors,
  );
  const authorizationResult = extractSourceIssueAuthorizations({
    comments: trustedDecisionComments,
    findings,
    sourceIssueNumber: routingPacket.sourceIssue.number,
    prNumber: routingPacket.pullRequest.number,
    headSha: routingPacket.pullRequest.headSha,
    repository: config.repository,
  });
  if (!authorizationResult.ok) return authorizationResult;

  const protectedClasses = new Set(config.protectedDecisionClasses || []);
  const protectedFindingIds = new Set(
    findings
      .filter((finding) => protectedClasses.has(finding.decisionClass))
      .map((finding) => finding.identity),
  );
  const boundedAuthorizations = authorizationResult.authorizations.filter(
    (authorization) => !protectedFindingIds.has(authorization.findingIdentity),
  );
  const trustedControllerComments = filterCommentsByAuthor(
    liveComments,
    routingConfig.trustedControllerAuthors,
  );
  const latestDisposition = findLatestDisposition(trustedControllerComments, {
    sourceIssueNumber: routingPacket.sourceIssue.number,
    prNumber: routingPacket.pullRequest.number,
    trustedAuthors: routingConfig.trustedControllerAuthors,
  });

  const routed = routeRemediation({
    packet: routingPacket,
    findings,
    requiredChecks: routingConfig.requiredChecks,
    authorizations: boundedAuthorizations,
    dispositionRevision: authorizationResult.dispositionRevision,
    existingComments: liveComments,
    latestDisposition,
    branch: routingPacket.pullRequest.headRef,
    prUrl: routingPacket.pullRequest.url,
  });
  if (!routed.ok) return routed;

  const result = { ok: true, packet: routingPacket, remediation: routed };
  if (config.componentIntegration?.enabled !== true) return result;

  const classification = routed.classification?.classification || null;
  const integration = evaluateComponentIntegrationTransaction({
    packet: routingPacket,
    classification,
    existingComments: liveComments,
    reviewSubmissions:
      live.reviewSubmissions || live.reviews || routingPacket.reviewEvidence?.reviewSubmissions || [],
    requiredChecks: config.componentIntegration.requiredChecks || routingConfig.requiredChecks || [],
    componentIntegration: config.componentIntegration,
    observedTargetBranch:
      input.observedTargetBranch || routingPacket.pullRequest.baseRef || null,
    recordedMergeSha: input.recordedMergeSha || null,
  });
  result.integration = integration;

  if (integration.ok && Array.isArray(integration.actions) && integration.actions.length > 1) {
    return failClosed(
      'integration_transaction_limit_exceeded',
      'Controller may emit at most one component-integration transaction per run.',
      { actionCount: integration.actions.length },
    );
  }

  const shouldVerify =
    Boolean(input.recordedMergeSha) ||
    integration.code === 'integration_already_completed' ||
    integration.code === 'integration_already_recorded';

  if (shouldVerify && config.componentIntegration.capabilities?.verify === true) {
    const mergeSha =
      normalizeSha(input.recordedMergeSha) || normalizeSha(integration.mergeSha) || null;
    result.verification = verifyPostIntegration({
      packet: routingPacket,
      targetBranch: integration.targetBranch || routingPacket.pullRequest.baseRef,
      mergeSha,
      targetBranchContainsMergeSha: input.targetBranchContainsMergeSha,
      targetBranchHeadSha: input.targetBranchHeadSha || null,
      existingComments: liveComments,
      componentIntegration: config.componentIntegration,
    });
  } else if (
    classification === DISPOSITION_CLASSES.CLEAN &&
    integration.ok &&
    integration.eligible
  ) {
    result.verification = {
      ok: true,
      verified: false,
      suppressed: true,
      code: 'verification_deferred_until_merge_sha',
      closeout: false,
      successorActivation: false,
      actions: [],
    };
  }

  return result;
}

function normalizeSha(value) {
  const sha = String(value || '').trim().toLowerCase();
  return /^[0-9a-f]{7,40}$/.test(sha) ? sha : '';
}

function enrichRoutingPacket(packet, live) {
  const reviewEvidence = packet.reviewEvidence || {};
  return {
    ...packet,
    pullRequest: {
      ...(packet.pullRequest || {}),
      author:
        live.pullRequest?.author?.login ||
        live.pullRequest?.user?.login ||
        packet.pullRequest?.author ||
        null,
    },
    reviewEvidence: {
      ...reviewEvidence,
      unresolvedReviewThreads: mergeEvidence(
        reviewEvidence.unresolvedReviewThreads || [],
        live.reviewThreads || [],
      ),
      reviewSubmissions: mergeEvidence(
        reviewEvidence.reviewSubmissions || [],
        live.reviewSubmissions || live.reviews || [],
      ),
      lateIssueComments: mergeEvidence(
        reviewEvidence.lateIssueComments || [],
        live.issueComments || [],
      ),
    },
  };
}

function mergeEvidence(normalized, raw) {
  const rawById = new Map(
    (raw || [])
      .map((item) => [String(item?.id || item?.databaseId || item?.node_id || ''), item])
      .filter(([id]) => id),
  );
  return (normalized || []).map((item) => {
    const id = String(item?.id || item?.databaseId || item?.node_id || '');
    const merged = { ...(rawById.get(id) || {}), ...item };
    return merged.decisionClass ? merged : { ...merged, decisionClass: 'implementation' };
  });
}

function filterCommentsByAuthor(comments, allowedAuthors) {
  const allowed = new Set(
    (allowedAuthors || []).map((author) => String(author).trim().toLowerCase()).filter(Boolean),
  );
  return (comments || []).filter((comment) => allowed.has(commentAuthor(comment)));
}

function commentAuthor(comment) {
  return String(comment?.author?.login || comment?.user?.login || '').trim().toLowerCase();
}

function assertNonEmptyStringArray(value, code) {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((item) => typeof item !== 'string' || item.trim() === '')
  ) {
    throw new Error(code);
  }
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
    integrate: false,
    expectedHeadSha: null,
    targetBranch: null,
    expectedTargetHeadSha: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--config') out.configPath = argv[++i];
    else if (arg === '--input') out.inputPath = argv[++i];
    else if (arg === '--output') out.outputPath = argv[++i];
    else if (arg === '--issue') out.issueNumber = argv[++i];
    else if (arg === '--pr') out.prNumber = argv[++i];
    else if (arg === '--repository') out.repository = argv[++i];
    else if (arg === '--integrate') out.integrate = true;
    else if (arg === '--expected-head') out.expectedHeadSha = argv[++i];
    else if (arg === '--target-branch') out.targetBranch = argv[++i];
    else if (arg === '--expected-target-head') out.expectedTargetHeadSha = argv[++i];
    else if (arg === '--help' || arg === '-h') out.help = true;
  }
  return out;
}

export async function mainAsync(argv = process.argv.slice(2), { fetchFn = globalThis.fetch } = {}) {
  const args = parseArgs(argv);
  if (args.help) {
    process.stdout.write(
      'Usage: node scripts/agent-routing/controller.mjs --issue <n> --pr <n> [--input <hints.json>] [--output <packet.json>]\n' +
        '       node scripts/agent-routing/controller.mjs --integrate --issue <n> --pr <n> --expected-head <sha> --target-branch <component/ref> --expected-target-head <sha> [--output <result.json>]\n',
    );
    return 0;
  }

  const config = loadControllerConfig(args.configPath);
  let hints = {};
  if (args.inputPath) {
    const supplied = JSON.parse(fs.readFileSync(args.inputPath, 'utf8'));
    const {
      live: _discardedLive,
      findings: _discardedFindings,
      authorizations: _discardedAuthorizations,
      disposition: _discardedDisposition,
      latestDisposition: _discardedLatestDisposition,
      dispositionRevision: _discardedRevision,
      ...safeHints
    } = supplied || {};
    hints = safeHints;
  }

  const hasIssue = args.issueNumber != null && String(args.issueNumber).trim() !== '';
  const hasPr = args.prNumber != null && String(args.prNumber).trim() !== '';
  if (!hasIssue || !hasPr) {
    process.stderr.write('error: operational execution requires both --issue and --pr\n');
    return 2;
  }
  const prCheck = assertValidPrNumber(args.prNumber);
  if (!prCheck.ok) {
    writeResult(prCheck, args.outputPath);
    return 1;
  }

  if (args.integrate) {
    const result = await executeComponentIntegration({
      repository: args.repository || hints.repository,
      token: args.token,
      issueNumber: Number(args.issueNumber),
      prNumber: prCheck.prNumber,
      expectedHeadSha: args.expectedHeadSha,
      targetBranch: args.targetBranch,
      expectedTargetHeadSha: args.expectedTargetHeadSha,
      componentIntegration: config.componentIntegration,
      fetchFn,
    });
    writeResult(result, args.outputPath);
    return result.ok ? 0 : 1;
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

  const result = runController({ ...hints, live: collected.live }, config);
  writeResult(result, args.outputPath);
  return result.ok ? 0 : 1;
}

function writeResult(result, outputPath) {
  const payload = `${JSON.stringify(result, null, 2)}\n`;
  if (outputPath) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, payload, 'utf8');
  } else process.stdout.write(payload);
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
