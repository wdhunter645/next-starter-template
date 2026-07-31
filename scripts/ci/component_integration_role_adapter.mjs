#!/usr/bin/env node

import fs from 'node:fs';
import {
  evaluateComponentIntegration,
  renderIntegrationReport,
} from './component_integration_eligibility.mjs';
import { parseImplementationActor } from './reviewer_lifecycle_gate.mjs';
import { DEFAULT_AUTHORIZED_APPROVAL_ACCOUNTS, evaluateRoleApprovalGuard } from './role_approval_guard.mjs';

function readJson(path, fallback) {
  if (!path || !fs.existsSync(path)) return fallback;
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function readLines(path) {
  if (!path || !fs.existsSync(path)) return [];
  return fs.readFileSync(path, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function uniqueReasons(reasons = []) {
  const seen = new Set();
  return reasons.filter((reason) => {
    const key = `${reason.code || ''}:${reason.message || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function applyRoleApprovalToIntegrationResult(result, roleApproval) {
  if (!roleApproval?.required) {
    return { ...result, roleApproval };
  }

  let blockedReasons = [...(result.blockedReasons || [])];
  if (roleApproval.approved) {
    blockedReasons = blockedReasons.filter((reason) => reason.code !== 'protected_change');
  } else {
    blockedReasons.push(...(roleApproval.blockedReasons || []));
  }
  blockedReasons = uniqueReasons(blockedReasons);

  return {
    ...result,
    eligible: blockedReasons.length === 0,
    blockedReasons,
    requiresChatReview: !roleApproval.approved,
    roleApproval,
  };
}

export function evaluateComponentIntegrationWithRoleApproval({
  profile = {},
  checks = [],
  reviews = [],
  componentState = 'green',
  labels = [],
  changedFiles = [],
  headSha = '',
  prNumber = 0,
  sourceIssueComments = [],
  implementationActor = '',
  authorizedApprovalAccounts = DEFAULT_AUTHORIZED_APPROVAL_ACCOUNTS,
} = {}) {
  const resolvedImplementationActor = implementationActor || parseImplementationActor(profile.body || '');
  const integration = evaluateComponentIntegration({
    profile,
    checks,
    reviews,
    componentState,
    labels,
    changedFiles,
    headSha,
    implementationActor: resolvedImplementationActor,
  });

  const roleApproval = evaluateRoleApprovalGuard({
    prBody: profile.body || '',
    changedFiles,
    comments: sourceIssueComments,
    prNumber,
    headSha,
    implementationActor: resolvedImplementationActor,
    authorizedAccounts: authorizedApprovalAccounts,
  });

  return applyRoleApprovalToIntegrationResult(integration, roleApproval);
}

function setOutput(name, value, outputPath = process.env.GITHUB_OUTPUT) {
  if (!outputPath) return;
  fs.appendFileSync(outputPath, `${name}=${String(value)}\n`);
}

export function runCli(env = process.env) {
  const profile = readJson(env.COMPONENT_INTEGRATION_PROFILE_JSON, {});
  const checks = readJson(env.COMPONENT_INTEGRATION_CHECKS_JSON, []);
  const reviews = readJson(env.COMPONENT_INTEGRATION_REVIEWS_JSON, []);
  const labels = readJson(env.COMPONENT_INTEGRATION_LABELS_JSON, []);
  const sourceIssueComments = readJson(env.COMPONENT_INTEGRATION_SOURCE_ISSUE_COMMENTS_JSON, []);
  const changedFiles = readLines(env.COMPONENT_INTEGRATION_CHANGED_FILES_FILE || env.CHANGED_FILES_FILE);
  const authorizedApprovalAccounts = readJson(
    env.COMPONENT_INTEGRATION_ROLE_APPROVAL_AUTHORIZED_ACCOUNTS_JSON,
    [...DEFAULT_AUTHORIZED_APPROVAL_ACCOUNTS],
  );

  if (env.PR_BODY_FILE && fs.existsSync(env.PR_BODY_FILE)) {
    profile.body = fs.readFileSync(env.PR_BODY_FILE, 'utf8');
  }
  if (env.PR_BASE_REF) profile.baseRef = env.PR_BASE_REF;
  if (env.PR_HEAD_REF) profile.headRef = env.PR_HEAD_REF;
  if (env.COMPONENT_INTEGRATION_STATE) profile.componentState = env.COMPONENT_INTEGRATION_STATE;
  if (env.COMPONENT_INTEGRATION_BASE_BEHIND) {
    profile.baseBehindComponentHead = Number(env.COMPONENT_INTEGRATION_BASE_BEHIND || 0);
  }

  const result = evaluateComponentIntegrationWithRoleApproval({
    profile,
    checks,
    reviews,
    componentState: env.COMPONENT_INTEGRATION_STATE || profile.componentState || 'green',
    labels,
    changedFiles,
    headSha: env.COMPONENT_INTEGRATION_HEAD_SHA || profile.headSha || '',
    prNumber: Number(env.COMPONENT_INTEGRATION_PR_NUMBER || 0),
    sourceIssueComments,
    implementationActor: env.COMPONENT_INTEGRATION_IMPLEMENTATION_ACTOR
      || profile.implementationActor
      || parseImplementationActor(profile.body || ''),
    authorizedApprovalAccounts,
  });

  const roleLine = result.roleApproval?.required
    ? `\n- Exact-head role approval evidence: ${
      result.roleApproval.approved
        ? `present (account: ${result.roleApproval.acceptedLogin || 'unknown'})`
        : 'missing'
    }\n- Note: this is exact-head structured approval evidence, not authenticated reviewer identity — the shared repository-owner account does not distinguish ChatGPT or Claude Code (both hold PR Approver / Engineering) from other automation.`
    : '\n- Exact-head role approval evidence: not required';
  console.log(`${renderIntegrationReport(result)}${roleLine}`);

  if (env.COMPONENT_INTEGRATION_RESULT_JSON) {
    fs.writeFileSync(env.COMPONENT_INTEGRATION_RESULT_JSON, `${JSON.stringify(result, null, 2)}\n`);
  }

  setOutput('eligible', result.eligible, env.GITHUB_OUTPUT);
  setOutput('requires_chat_review', result.requiresChatReview, env.GITHUB_OUTPUT);
  setOutput('blocked_reason_count', result.blockedReasons.length, env.GITHUB_OUTPUT);
  setOutput('component_state', result.componentState, env.GITHUB_OUTPUT);
  setOutput('role_approval_required', result.roleApproval?.required || false, env.GITHUB_OUTPUT);
  setOutput('role_approval_present', result.roleApproval?.approved || false, env.GITHUB_OUTPUT);
  setOutput('role_approval_accepted_login', result.roleApproval?.acceptedLogin || '', env.GITHUB_OUTPUT);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = runCli();
}
