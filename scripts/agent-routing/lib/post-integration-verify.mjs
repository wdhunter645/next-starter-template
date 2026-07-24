const FORBIDDEN_TARGETS = new Set(['main', 'master', 'production', 'prod']);

export function assertSafeComponentTarget(targetBranch, config = {}) {
  const target = normalizeRef(targetBranch);
  if (!target) return failClosed('missing_target_branch', 'Target branch is required.');
  const forbidden = new Set([
    ...FORBIDDEN_TARGETS,
    ...(config.forbiddenTargets || []).map(normalizeRef),
  ]);
  if (forbidden.has(target) || /(^|\/)(?:main|master|prod(?:uction)?)(?:\/|$)/i.test(target)) {
    return failClosed('forbidden_target_branch', `Target branch ${target} is protected.`);
  }
  const exact = (config.allowedTargets || []).map(normalizeRef).filter(Boolean);
  const prefixes = (config.allowedTargetPrefixes || []).map(normalizeRef).filter(Boolean);
  if (!exact.includes(target) && !prefixes.some((prefix) => target.startsWith(prefix))) {
    return failClosed('unauthorized_target_branch', `Target branch ${target} is not authorized.`);
  }
  return { ok: true, targetBranch: target };
}

export function verifyPostIntegrationEvidence({
  targetBranch,
  targetHeadSha,
  mergeSha,
  compareStatus = null,
  sourceIssueState = null,
  config = {},
} = {}) {
  const targetCheck = assertSafeComponentTarget(targetBranch, config);
  if (!targetCheck.ok) return targetCheck;
  const targetHead = normalizeSha(targetHeadSha);
  const merge = normalizeSha(mergeSha);
  if (!merge) return failClosed('invalid_merge_sha', 'Merge SHA is missing or invalid.');
  if (!targetHead) return failClosed('invalid_target_head_sha', 'Target head SHA is missing or invalid.');
  const containsMerge = targetHead === merge || ['ahead', 'identical'].includes(String(compareStatus));
  if (!containsMerge) {
    return failClosed('merge_not_on_target', 'Target branch does not contain the integration SHA.', {
      targetHeadSha: targetHead,
      mergeSha: merge,
      compareStatus,
    });
  }
  if (sourceIssueState && String(sourceIssueState).toUpperCase() !== 'OPEN') {
    return failClosed('source_issue_closed_during_integration', 'Source Issue must remain open after integration.');
  }
  return {
    ok: true,
    targetBranch: targetCheck.targetBranch,
    targetHeadSha: targetHead,
    mergeSha: merge,
    containsMerge: true,
    sourceIssueState: sourceIssueState ? String(sourceIssueState).toUpperCase() : null,
  };
}

export async function verifyPostIntegration({
  repository,
  targetBranch,
  mergeSha,
  sourceIssueNumber,
  token,
  config = {},
  fetchFn = globalThis.fetch,
} = {}) {
  if (!repository || !token) {
    return failClosed('verification_unavailable', 'Repository and token are required for verification.');
  }
  const targetCheck = assertSafeComponentTarget(targetBranch, config);
  if (!targetCheck.ok) return targetCheck;
  const merge = normalizeSha(mergeSha);
  if (!merge) return failClosed('invalid_merge_sha', 'Merge SHA is missing or invalid.');
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'lgfc-component-integration-verifier',
  };
  async function get(path) {
    const response = await fetchFn(`https://api.github.com/repos/${repository}${path}`, {
      method: 'GET',
      headers,
    });
    if (!response?.ok) {
      const text = typeof response?.text === 'function' ? await response.text() : '';
      throw new Error(`GET ${path} failed: ${response?.status ?? 'unknown'} ${text}`);
    }
    return response.json();
  }

  try {
    const encodedTarget = targetCheck.targetBranch.split('/').map(encodeURIComponent).join('/');
    const targetRef = await get(`/git/ref/heads/${encodedTarget}`);
    const targetHeadSha = normalizeSha(targetRef?.object?.sha || '');
    let compareStatus = targetHeadSha === merge ? 'identical' : null;
    if (!compareStatus) {
      const comparison = await get(`/compare/${merge}...${encodedTarget}`);
      compareStatus = comparison?.status || null;
    }
    const issue = await get(`/issues/${Number(sourceIssueNumber)}`);
    return verifyPostIntegrationEvidence({
      targetBranch: targetCheck.targetBranch,
      targetHeadSha,
      mergeSha: merge,
      compareStatus,
      sourceIssueState: issue?.state,
      config,
    });
  } catch (error) {
    return failClosed(
      'verification_unavailable',
      `Post-integration verification failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function normalizeRef(value = '') {
  return String(value || '').replace(/^refs\/heads\//, '').trim();
}

function normalizeSha(value = '') {
  const sha = String(value || '').trim().toLowerCase();
  return /^[0-9a-f]{7,40}$/.test(sha) ? sha : '';
}

function failClosed(code, message, details = {}) {
  return { ok: false, code, message, ...details };
}
