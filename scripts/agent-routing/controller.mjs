import fs from 'node:fs';
import { resolveRepositoryState } from './state-resolver.mjs';
import { planAction } from './action-planner.mjs';
import { buildDraftPrPlan } from './github-actions.mjs';
import { normalizeIssuePrContractEvidence } from './evidence-adapters/issue-pr-contract.mjs';

const SUPPORTED_EVENTS = new Set([
  'issues',
  'issue_comment',
  'pull_request',
  'pull_request_review',
  'pull_request_review_comment',
  'workflow_run',
  'workflow_dispatch',
  'schedule',
]);

export function evaluateControllerEvent({ eventName, trusted, input, policy = {} }) {
  const snapshot = resolveRepositoryState(input, policy);
  if (!SUPPORTED_EVENTS.has(eventName)) {
    return {
      ok: false,
      apply: false,
      snapshot,
      plan: { class: 'halt', reason: 'unsupported_event', mutations: [], expectedRevision: snapshot.revision },
    };
  }
  if (!trusted) {
    return {
      ok: false,
      apply: false,
      snapshot,
      plan: { class: 'halt', reason: 'untrusted_event', mutations: [], expectedRevision: snapshot.revision },
    };
  }
  const plan = planAction(snapshot, policy);
  const apply = !['disabled', 'observe'].includes(policy.mode || 'observe') && plan.mutations.length > 0;
  return { ok: plan.class !== 'halt', apply, snapshot, plan };
}

function readJsonFile(filePath, fallback) {
  if (!filePath || !fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * CLI entrypoint (#2621): plans the CREATE_DRAFT_PR action from a #2620
 * advisory-validation result plus minimal identity/mode inputs. Read-only —
 * never calls the GitHub API. Mirrors issue_pr_contract_validate.mjs's
 * runCli env-var-file-in/JSON-out shape so the calling workflow step stays
 * a thin `node` invocation between github-script API-calling steps.
 */
export function runCreateDraftPrPlanCli(env = process.env) {
  const issue = readJsonFile(env.AGENT_ROUTING_ISSUE_JSON, null);
  if (!issue) {
    console.error('AGENT_ROUTING_ISSUE_JSON is required and must point to an existing file.');
    return 2;
  }
  const validationResult = readJsonFile(env.ISSUE_PR_CONTRACT_RESULT_JSON, null);
  const existingPr = readJsonFile(env.AGENT_ROUTING_EXISTING_PR_JSON, null);
  const pullRequests = existingPr ? [existingPr] : [];
  const mode = env.AGENT_ROUTING_MODE || 'advance';

  const input = {
    project: { issueNumber: issue.projectIssue ?? null, lifecycle: 'active', projectBranch: issue.projectBranch ?? null },
    task: { issueNumber: issue.number, id: issue.taskId ?? null, state: issue.state === 'open' ? 'active' : 'complete' },
    labels: issue.labels || [],
    events: [],
    pullRequests,
    checks: [],
    reviews: [],
    claims: [],
    consumedEventIds: [],
    issuePrContract: normalizeIssuePrContractEvidence(validationResult, existingPr),
  };

  const result = evaluateControllerEvent({ eventName: 'workflow_dispatch', trusted: true, input, policy: { mode } });

  const outputPath = env.AGENT_ROUTING_PLAN_OUTPUT_JSON;
  if (outputPath) {
    fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  }
  // Bare `plan` alone, matching the shape runCreateDraftPrMutationCli reads
  // via AGENT_ROUTING_PLAN_JSON, so the calling workflow can pass this
  // step's output straight into that one without reshaping it inline.
  const planOnlyPath = env.AGENT_ROUTING_PLAN_ONLY_OUTPUT_JSON;
  if (planOnlyPath) {
    fs.writeFileSync(planOnlyPath, `${JSON.stringify(result.plan, null, 2)}\n`);
  }
  console.log(JSON.stringify(result, null, 2));
  return 0;
}

/**
 * CLI entrypoint (#2621): re-validates a previously computed create_draft_pr
 * mutation against freshly re-read live state and builds the exact draft-PR
 * request, or a fail-closed reason. Never calls the GitHub API itself.
 */
export function runCreateDraftPrMutationCli(env = process.env) {
  const plan = readJsonFile(env.AGENT_ROUTING_PLAN_JSON, null);
  if (!plan) {
    console.error('AGENT_ROUTING_PLAN_JSON is required and must point to an existing file.');
    return 2;
  }
  const freshState = readJsonFile(env.AGENT_ROUTING_FRESH_STATE_JSON, {});
  const mutation = (plan.mutations || []).find((item) => item.type === 'create_draft_pr') || null;

  const result = buildDraftPrPlan(mutation, freshState);

  const outputPath = env.AGENT_ROUTING_DRAFT_PR_OUTPUT_JSON;
  if (outputPath) {
    fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  }
  console.log(JSON.stringify(result, null, 2));
  return 0;
}

const CLI_MODE_HANDLERS = {
  plan: runCreateDraftPrPlanCli,
  mutate: runCreateDraftPrMutationCli,
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const handler = CLI_MODE_HANDLERS[process.env.AGENT_ROUTING_CLI_MODE] || runCreateDraftPrPlanCli;
  process.exitCode = handler();
}
