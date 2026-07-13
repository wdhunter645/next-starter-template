#!/usr/bin/env node

import fs from 'node:fs';
import { classifyDeliveryProfile } from './delivery_profile.mjs';

export const HOLD_LABELS = ['component-integration-hold', 'hold:component-integration'];
export const COMPONENT_STATES = ['green', 'red', 'hold'];

const CHECK_FAILURE = new Set(['failure', 'cancelled', 'timed_out', 'action_required']);
const CHECK_PENDING = new Set(['queued', 'in_progress', 'pending', 'waiting']);

function integrationError(code, message, details = {}) {
  return { code, message, ...details };
}

function normalizeCheckStatus(status = '') {
  return String(status || '').trim().toLowerCase();
}

function isComponentRef(ref = '') {
  return /^component\/[^/].*/.test(String(ref || ''));
}

function labelNames(labels = []) {
  return labels.map((label) => {
    if (typeof label === 'string') return label;
    return label?.name || '';
  }).filter(Boolean);
}

function hasHoldLabel(labels = []) {
  const names = new Set(labelNames(labels).map((name) => name.toLowerCase()));
  return HOLD_LABELS.some((label) => names.has(label.toLowerCase()));
}

function assessChecks(checks = []) {
  const failed = [];
  const pending = [];

  for (const check of checks) {
    const status = normalizeCheckStatus(check.conclusion || check.status);
    const name = check.name || check.context || 'unknown-check';
    if (CHECK_FAILURE.has(status)) {
      failed.push(integrationError('failed_check', `Required check failed: ${name}.`, { check: name, status }));
    } else if (CHECK_PENDING.has(status)) {
      pending.push(integrationError('pending_check', `Required check pending: ${name}.`, { check: name, status }));
    }
  }

  return { failed, pending };
}

function assessReviews(reviews = []) {
  const blockers = [];
  for (const review of reviews) {
    const state = String(review.state || '').toUpperCase();
    if (state === 'CHANGES_REQUESTED') {
      blockers.push(integrationError(
        'changes_requested',
        'A reviewer requested changes on the current head.',
        { author: review.author?.login || review.user?.login || 'unknown' },
      ));
    }
  }
  return blockers;
}

export function evaluateComponentIntegration({
  profile = {},
  checks = [],
  reviews = [],
  componentState = 'green',
  labels = [],
  changedFiles = [],
} = {}) {
  const blockedReasons = [];
  let requiresChatReview = false;

  const normalizedProfile = {
    ...profile,
    changedFiles: Array.isArray(changedFiles) ? changedFiles : profile.changedFiles,
  };

  if (!normalizedProfile.baseRef && normalizedProfile.componentBranch) {
    normalizedProfile.baseRef = normalizedProfile.componentBranch;
  }

  const classified = normalizedProfile.errors
    ? normalizedProfile
    : classifyDeliveryProfile({
      baseRef: normalizedProfile.baseRef || '',
      headRef: normalizedProfile.headRef || '',
      body: normalizedProfile.body || '',
      changedFiles: normalizedProfile.changedFiles ?? changedFiles,
    });

  const deliveryModel = classified.deliveryModel || normalizedProfile.deliveryModel || '';
  const gateProfile = classified.gateProfile || normalizedProfile.gateProfile || '';
  const approvalProfile = classified.approvalProfile || normalizedProfile.approvalProfile || '';
  const componentBranch = classified.componentBranch || normalizedProfile.componentBranch || '';
  const componentMaster = classified.componentMaster || normalizedProfile.componentMaster || '';
  const protectedChange = classified.protectedChange ?? normalizedProfile.protectedChange ?? false;
  const baseRef = normalizedProfile.baseRef || '';
  const baseBehindComponentHead = Number(normalizedProfile.baseBehindComponentHead || 0);
  const profileErrors = classified.errors || normalizedProfile.errors || [];

  if (deliveryModel !== 'B-child') {
    blockedReasons.push(integrationError(
      'invalid_delivery_model',
      'Component auto-integration applies only to Model B child PRs.',
      { deliveryModel },
    ));
  }

  if (gateProfile !== 'component-child') {
    blockedReasons.push(integrationError(
      'invalid_gate_profile',
      'Component auto-integration requires gate profile component-child.',
      { gateProfile },
    ));
  }

  if (!isComponentRef(baseRef)) {
    blockedReasons.push(integrationError(
      'non_component_base',
      'Model B child PRs must target a component/** base branch.',
      { baseRef },
    ));
  }

  if (!componentBranch) {
    blockedReasons.push(integrationError(
      'missing_component_branch',
      'Component branch metadata is required for Model B child integration.',
    ));
  } else if (componentBranch !== baseRef) {
    blockedReasons.push(integrationError(
      'branch_mismatch',
      'Component branch metadata must match the PR base ref.',
      { expected: baseRef, value: componentBranch },
    ));
  }

  if (!componentMaster) {
    blockedReasons.push(integrationError(
      'missing_component_master',
      'Component master issue reference is required for Model B child integration.',
    ));
  }

  for (const error of profileErrors) {
    blockedReasons.push(integrationError(
      error.code || 'profile_error',
      error.message || 'Delivery profile classification failed.',
      error,
    ));
  }

  if (protectedChange || approvalProfile === 'protected-change-review') {
    requiresChatReview = true;
    blockedReasons.push(integrationError(
      'protected_change',
      'Protected paths changed; Chat review is required before component integration.',
    ));
  }

  if (componentState === 'red') {
    blockedReasons.push(integrationError(
      'component_red_state',
      'Component branch integration state is red; auto-integration is blocked.',
    ));
  }

  if (componentState === 'hold' || hasHoldLabel(labels)) {
    blockedReasons.push(integrationError(
      'component_hold',
      'Component integration is on hold; auto-integration is blocked.',
    ));
  }

  if (baseBehindComponentHead > 0) {
    blockedReasons.push(integrationError(
      'stale_base',
      'PR base is behind the component branch head; sync the latest component branch before integration.',
      { commitsBehind: baseBehindComponentHead },
    ));
  }

  const { failed, pending } = assessChecks(checks);
  blockedReasons.push(...failed, ...pending);
  blockedReasons.push(...assessReviews(reviews));

  const eligible = blockedReasons.length === 0;

  return {
    eligible,
    blockedReasons,
    requiresChatReview,
    componentState: componentState || 'green',
    deliveryModel,
    gateProfile,
    approvalProfile,
    componentBranch,
    componentMaster,
    protectedChange,
  };
}

export function renderIntegrationReport(result) {
  const lines = [
    `Component integration eligibility: ${result.eligible ? 'eligible' : 'blocked'}`,
    `- Delivery model: ${result.deliveryModel || 'unknown'}`,
    `- Gate profile: ${result.gateProfile || 'unknown'}`,
    `- Component branch: ${result.componentBranch || 'unknown'}`,
    `- Component master: ${result.componentMaster || 'unknown'}`,
    `- Protected change: ${result.protectedChange ? 'yes' : 'no'}`,
    `- Component state: ${result.componentState}`,
    `- Requires Chat review: ${result.requiresChatReview ? 'yes' : 'no'}`,
  ];

  if (result.blockedReasons.length) {
    lines.push('', '## Blocked reasons');
    for (const reason of result.blockedReasons) {
      lines.push(`- ${reason.code}: ${reason.message}`);
    }
  }

  return lines.join('\n');
}

function readJsonFile(path, fallback) {
  if (!path || !fs.existsSync(path)) return fallback;
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function readListFile(path) {
  if (!path || !fs.existsSync(path)) return [];
  return fs.readFileSync(path, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export function runCli(env = process.env) {
  const profile = readJsonFile(env.COMPONENT_INTEGRATION_PROFILE_JSON, {});
  const checks = readJsonFile(env.COMPONENT_INTEGRATION_CHECKS_JSON, []);
  const reviews = readJsonFile(env.COMPONENT_INTEGRATION_REVIEWS_JSON, []);
  const labels = readJsonFile(env.COMPONENT_INTEGRATION_LABELS_JSON, []);
  const changedFiles = readListFile(env.COMPONENT_INTEGRATION_CHANGED_FILES_FILE || env.CHANGED_FILES_FILE);

  if (env.PR_BODY_FILE && fs.existsSync(env.PR_BODY_FILE)) {
    profile.body = fs.readFileSync(env.PR_BODY_FILE, 'utf8');
  }
  if (env.PR_BASE_REF) profile.baseRef = env.PR_BASE_REF;
  if (env.PR_HEAD_REF) profile.headRef = env.PR_HEAD_REF;
  if (env.COMPONENT_INTEGRATION_STATE) {
    profile.componentState = env.COMPONENT_INTEGRATION_STATE;
  }
  if (env.COMPONENT_INTEGRATION_BASE_BEHIND) {
    profile.baseBehindComponentHead = Number(env.COMPONENT_INTEGRATION_BASE_BEHIND || 0);
  }

  const result = evaluateComponentIntegration({
    profile,
    checks,
    reviews,
    componentState: env.COMPONENT_INTEGRATION_STATE || profile.componentState || 'green',
    labels,
    changedFiles,
  });

  const report = renderIntegrationReport(result);
  console.log(report);

  const jsonPath = env.COMPONENT_INTEGRATION_RESULT_JSON;
  if (jsonPath) {
    fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
  }

  if (env.GITHUB_OUTPUT) {
    fs.appendFileSync(env.GITHUB_OUTPUT, `eligible=${result.eligible}\n`);
    fs.appendFileSync(env.GITHUB_OUTPUT, `requires_chat_review=${result.requiresChatReview}\n`);
    fs.appendFileSync(env.GITHUB_OUTPUT, `blocked_reason_count=${result.blockedReasons.length}\n`);
    fs.appendFileSync(env.GITHUB_OUTPUT, `component_state=${result.componentState}\n`);
  }

  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = runCli();
}
