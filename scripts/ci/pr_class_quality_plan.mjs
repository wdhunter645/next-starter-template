#!/usr/bin/env node

import fs from 'node:fs';
import { parsePrClass, VALID_PR_CLASSES } from './pr_hygiene_audit.mjs';

export const QUALITY_PROFILES = {
  'docs-governance': {
    typecheck: true,
    lint: true,
    test: false,
    build: false,
    reason: 'governance docs do not require production build unless paired with code changes',
  },
  'docs-content': {
    typecheck: true,
    lint: true,
    test: false,
    build: false,
    reason: 'content/docs-only changes do not require production build by default',
  },
  code: {
    typecheck: true,
    lint: true,
    test: true,
    build: true,
    reason: 'code changes require full quality path',
  },
  config: {
    typecheck: true,
    lint: true,
    test: false,
    build: false,
    reason: 'configuration changes do not require production build by default',
  },
  ci: {
    typecheck: true,
    lint: true,
    test: true,
    build: false,
    reason: 'CI/governance changes use static checks and targeted tests during transition',
  },
  release: {
    typecheck: true,
    lint: true,
    test: true,
    build: true,
    reason: 'release changes require full quality path',
  },
  ops: {
    typecheck: true,
    lint: true,
    test: false,
    build: false,
    reason: 'ops-only changes do not require production build by default',
  },
  'mixed-approved': {
    typecheck: true,
    lint: true,
    test: true,
    build: true,
    reason: 'mixed approved changes require full quality path',
  },
};

export function normalizePrClass(value = '') {
  const cleaned = String(value || '').trim().replace(/<!--([\s\S]*?)-->/g, '').trim();
  return VALID_PR_CLASSES.includes(cleaned) ? cleaned : '';
}

export function determineQualityPlan({ body = '', prClass = '' } = {}) {
  const normalized = normalizePrClass(prClass || parsePrClass(body));
  const selectedClass = normalized || 'code';
  const profile = QUALITY_PROFILES[selectedClass] || QUALITY_PROFILES.code;

  return {
    prClass: selectedClass,
    explicitPrClass: Boolean(normalized),
    ...profile,
  };
}

export function renderQualityPlan(plan) {
  return [
    `PR class: ${plan.prClass}`,
    `Explicit PR class: ${plan.explicitPrClass ? 'yes' : 'no'}`,
    `Run typecheck: ${plan.typecheck ? 'yes' : 'no'}`,
    `Run lint: ${plan.lint ? 'yes' : 'no'}`,
    `Run unit tests: ${plan.test ? 'yes' : 'no'}`,
    `Run production build: ${plan.build ? 'yes' : 'no'}`,
    `Reason: ${plan.reason}`,
  ].join('\n');
}

export function runCli(env = process.env) {
  const bodyPath = env.PR_CLASS_BODY_FILE || env.PR_HYGIENE_BODY_FILE;
  const body = bodyPath && fs.existsSync(bodyPath) ? fs.readFileSync(bodyPath, 'utf8') : '';
  const plan = determineQualityPlan({ body, prClass: env.PR_CLASS || '' });
  const output = renderQualityPlan(plan);
  console.log(output);

  if (env.GITHUB_OUTPUT) {
    fs.appendFileSync(env.GITHUB_OUTPUT, `pr_class=${plan.prClass}\n`);
    fs.appendFileSync(env.GITHUB_OUTPUT, `run_typecheck=${plan.typecheck ? 'true' : 'false'}\n`);
    fs.appendFileSync(env.GITHUB_OUTPUT, `run_lint=${plan.lint ? 'true' : 'false'}\n`);
    fs.appendFileSync(env.GITHUB_OUTPUT, `run_test=${plan.test ? 'true' : 'false'}\n`);
    fs.appendFileSync(env.GITHUB_OUTPUT, `run_build=${plan.build ? 'true' : 'false'}\n`);
  }

  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = runCli();
}
