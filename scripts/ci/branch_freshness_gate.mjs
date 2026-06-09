#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const REMEDIATION = [
  'Branch is behind the required base branch.',
  'Sync the latest base branch before claiming gate readiness:',
  '  git fetch origin main',
  '  git merge origin/main',
  'Re-run required gates after syncing.',
].join('\n');

function runGit(args, options = {}) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

export function isAncestor(ancestorSha, descendantSha, { run = runGit } = {}) {
  if (!ancestorSha || !descendantSha) {
    return false;
  }

  if (ancestorSha === descendantSha) {
    return true;
  }

  try {
    run(['merge-base', '--is-ancestor', ancestorSha, descendantSha]);
    return true;
  } catch {
    return false;
  }
}

export function countCommitsBehind(baseSha, headSha, { run = runGit } = {}) {
  if (!baseSha || !headSha) {
    return 0;
  }

  if (baseSha === headSha) {
    return 0;
  }

  const output = run(['rev-list', '--count', `${headSha}..${baseSha}`], { run });
  const count = Number.parseInt(output, 10);
  return Number.isFinite(count) ? count : 0;
}

export function assessBranchFreshness({
  eventName = 'pull_request',
  ref = '',
  baseSha = '',
  headSha = '',
  mainRef = 'origin/main',
  isAncestorFn = isAncestor,
  countBehindFn = countCommitsBehind,
} = {}) {
  if (eventName === 'push' && (ref === 'refs/heads/main' || ref === 'main')) {
    return {
      ok: true,
      skipped: true,
      reason: 'main-push',
      summary: 'Branch freshness gate skipped for main push.',
    };
  }

  const requiredBaseSha = eventName === 'pull_request' ? baseSha : mainRef;
  const evaluatedHeadSha = headSha;

  if (!evaluatedHeadSha) {
    return {
      ok: false,
      skipped: false,
      reason: 'missing-head-sha',
      summary: 'Branch freshness gate could not resolve HEAD SHA.',
      remediation: REMEDIATION,
    };
  }

  if (!requiredBaseSha) {
    return {
      ok: false,
      skipped: false,
      reason: 'missing-base-sha',
      summary: 'Branch freshness gate could not resolve base SHA.',
      remediation: REMEDIATION,
    };
  }

  const upToDate = isAncestorFn(requiredBaseSha, evaluatedHeadSha);
  const behindCount = upToDate ? 0 : countBehindFn(requiredBaseSha, evaluatedHeadSha);

  if (upToDate) {
    return {
      ok: true,
      skipped: false,
      reason: 'fresh',
      behindCount: 0,
      baseSha: requiredBaseSha,
      headSha: evaluatedHeadSha,
      summary: 'Branch contains all required base commits.',
    };
  }

  return {
    ok: false,
    skipped: false,
    reason: 'behind-base',
    behindCount,
    baseSha: requiredBaseSha,
    headSha: evaluatedHeadSha,
    summary: `Branch is ${behindCount} commit(s) behind the required base.`,
    remediation: REMEDIATION,
  };
}

export function resolveGateInputsFromEnv(env = process.env, { run = runGit } = {}) {
  const eventName = env.GITHUB_EVENT_NAME || 'workflow_dispatch';
  const ref = env.GITHUB_REF || '';
  const headSha = env.GITHUB_HEAD_SHA || env.GITHUB_SHA || '';
  const baseSha = env.GITHUB_BASE_SHA || '';

  if (eventName === 'push' && ref !== 'refs/heads/main') {
    try {
      run(['fetch', 'origin', 'main', '--depth=1']);
    } catch {
      // fetch may fail in local/test contexts; assessBranchFreshness will report missing base.
    }
  }

  return assessBranchFreshness({
    eventName,
    ref,
    baseSha: eventName === 'pull_request' ? baseSha : 'origin/main',
    headSha,
    isAncestorFn: (ancestor, descendant) => isAncestor(ancestor, descendant, { run }),
    countBehindFn: (base, head) => countCommitsBehind(base, head, { run }),
  });
}

export function formatGateReport(result) {
  const lines = [
    'Branch freshness gate assessment',
    `Result: ${result.ok ? 'PASS' : 'FAIL'}`,
    `Reason: ${result.reason}`,
    result.summary,
  ];

  if (result.behindCount != null && result.behindCount > 0) {
    lines.push(`Commits behind base: ${result.behindCount}`);
  }

  if (result.baseSha && result.headSha) {
    lines.push(`Base: ${result.baseSha}`);
    lines.push(`Head: ${result.headSha}`);
  }

  if (!result.ok && result.remediation) {
    lines.push('', result.remediation);
  }

  return lines.join('\n');
}

function main() {
  const result = resolveGateInputsFromEnv();
  const report = formatGateReport(result);
  console.log(report);

  if (!result.ok && !result.skipped) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
