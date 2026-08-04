import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const WORKFLOW_PATH = resolve(
  process.cwd(),
  '.github/workflows/ops-agent-routing-controller.yml',
);

function readWorkflowSource() {
  return readFileSync(WORKFLOW_PATH, 'utf8');
}

function admitEnvironmentPrJobSource(source) {
  const jobStart = source.indexOf('\n  admit-environment-pr:');
  if (jobStart === -1) {
    throw new Error('admit-environment-pr job not found in workflow');
  }
  return source.slice(jobStart);
}

function parseSteps(jobSource) {
  const stepStarts = [...jobSource.matchAll(/^      - name: (.+)$/gm)];
  const steps = [];
  for (let i = 0; i < stepStarts.length; i += 1) {
    const start = stepStarts[i].index;
    const end = i + 1 < stepStarts.length ? stepStarts[i + 1].index : jobSource.length;
    const block = jobSource.slice(start, end);
    const name = stepStarts[i][1].trim();
    const idMatch = block.match(/^ {8}id: (.+)$/m);
    const ifMatch = block.match(/^ {8}if: (.+)$/m);
    const runMatch = block.match(/^ {8}run: (.+)$/m);
    steps.push({
      name,
      id: idMatch ? idMatch[1].trim() : null,
      if: ifMatch ? ifMatch[1].trim() : null,
      run: runMatch ? runMatch[1].trim() : null,
    });
  }
  return steps;
}

// #2622 Development quality parity: the pre-merge inline gate profile and the
// direct post-merge verification must evaluate the same set of quality
// subchecks with the same commands, so post-merge verification cannot
// silently omit a subcheck that could have blocked admission.
const QUALITY_SUBCHECKS = [
  { preMergeId: 'quality-structure', postMergeId: 'verify-quality-structure' },
  { preMergeId: 'quality-backend-guard', postMergeId: 'verify-quality-backend-guard' },
  { preMergeId: 'quality-no-zips', postMergeId: 'verify-quality-no-zips' },
  { preMergeId: 'quality-zip-history', postMergeId: 'verify-quality-zip-history' },
  { preMergeId: 'quality-typecheck', postMergeId: 'verify-quality-typecheck' },
  { preMergeId: 'quality-lint', postMergeId: 'verify-quality-lint' },
  { preMergeId: 'quality-test', postMergeId: 'verify-quality-test' },
  { preMergeId: 'quality-build', postMergeId: 'verify-quality-build' },
];

describe('admit-environment-pr Development quality parity (#2622)', () => {
  const steps = parseSteps(admitEnvironmentPrJobSource(readWorkflowSource()));
  const byId = new Map(steps.filter((s) => s.id).map((s) => [s.id, s]));

  it.each(QUALITY_SUBCHECKS)(
    'post-merge $postMergeId runs the exact same command as pre-merge $preMergeId',
    ({ preMergeId, postMergeId }) => {
      const preMerge = byId.get(preMergeId);
      const postMerge = byId.get(postMergeId);

      expect(preMerge, `pre-merge step id "${preMergeId}" must exist`).toBeTruthy();
      expect(postMerge, `post-merge step id "${postMergeId}" must exist`).toBeTruthy();
      expect(postMerge.run, `post-merge step "${postMergeId}" must have a run command`).toBe(
        preMerge.run,
      );
    },
  );

  it('conditions every conditional quality subcheck on the same quality_plan classification pre- and post-merge', () => {
    const conditional = QUALITY_SUBCHECKS.filter((pair) =>
      pair.preMergeId.match(/typecheck|lint|test|build/),
    );
    for (const { preMergeId, postMergeId } of conditional) {
      const preMerge = byId.get(preMergeId);
      const postMerge = byId.get(postMergeId);
      expect(preMerge.if).toContain('steps.quality_plan.outputs');
      expect(postMerge.if).toContain('steps.quality_plan.outputs');
      const preFlag = preMerge.if.match(/steps\.quality_plan\.outputs\.(run_\w+)/)[1];
      const postFlag = postMerge.if.match(/steps\.quality_plan\.outputs\.(run_\w+)/)[1];
      expect(postFlag, `${postMergeId} must gate on the same quality_plan flag as ${preMergeId}`).toBe(
        preFlag,
      );
    }
  });

  it('does not maintain a divergent duplicate delivery-profile or quality-plan classification post-merge', () => {
    // Classification is a pure function of the PR body/base/head/changed-files
    // facts already computed pre-merge; post-merge verification must reuse
    // steps.quality_plan's decision rather than re-invoking the classifier
    // against the merged tree, which would risk silent drift between what was
    // approved and what was verified.
    expect(byId.has('verify-quality-classify-delivery-profile')).toBe(false);
    expect(byId.has('verify-quality-plan')).toBe(false);
  });

  it('aggregates post-merge quality outcome deterministically, independent of secret-scan outcome', () => {
    const aggregate = byId.get('post_merge_gate_outcome');
    expect(aggregate).toBeTruthy();
    expect(aggregate.if).toBe("steps.merge.outputs.merged == 'true'");

    const runBlockMatch = admitEnvironmentPrJobSource(readWorkflowSource()).match(
      /- name: Determine post-merge gate outcome[\s\S]*?run: \|([\s\S]*?)\n {6}- name:/,
    );
    expect(runBlockMatch).toBeTruthy();
    const runBlock = runBlockMatch[1];

    expect(runBlock).toContain('quality_passed=false');
    expect(runBlock).toContain('quality_passed=true');
    expect(runBlock).toContain('all_passed=false');
    expect(runBlock).toContain('all_passed=true');

    for (const { postMergeId } of QUALITY_SUBCHECKS) {
      expect(runBlock).toContain(`steps.${postMergeId}.outcome`);
    }
  });

  it('records the aggregated post-merge quality outcome, not a single narrow step, on the source Issue', () => {
    const source = readWorkflowSource();
    expect(source).toContain('steps.post_merge_gate_outcome.outputs.quality_passed');
    expect(source).not.toContain('steps.verify-quality.outcome');
  });
});

describe('admit-environment-pr inline gate fail-closed contract (#2622)', () => {
  const jobSource = admitEnvironmentPrJobSource(readWorkflowSource());
  const steps = parseSteps(jobSource);
  const byId = new Map(steps.filter((s) => s.id).map((s) => [s.id, s]));

  it('merges only when create succeeded and the inline gate_outcome passed — never on PR-event checks', () => {
    const merge = byId.get('merge');
    expect(merge).toBeTruthy();
    expect(merge.if).toBe(
      "steps.create.outputs.ok == 'true' && steps.gate_outcome.outputs.all_passed == 'true'",
    );
    // Comments may mention action_required as the avoided failure mode; no
    // step condition or API call may wait on those PR-event runs.
    for (const step of steps) {
      if (step.if) {
        expect(step.if).not.toMatch(/action_required|check-runs|check_runs|workflow_run/i);
      }
    }
    expect(jobSource).not.toMatch(/listWorkflowRuns|checks\.listForRef|wait-for-check/i);
  });

  it('sandbox secret-scan gate is unconditional for create.ok; quality is gated on requiredGates', () => {
    const secret = byId.get('secret-scan');
    const qualityStructure = byId.get('quality-structure');
    expect(secret.if).toBe("steps.create.outputs.ok == 'true'");
    expect(secret.if).not.toContain('quality');
    expect(qualityStructure.if).toContain("contains(steps.create.outputs.requiredGates, 'quality')");
  });

  it('fails closed when the required secret scan is not success (skipped/cancelled/failure block merge)', () => {
    const runBlockMatch = jobSource.match(
      /- name: Determine gate outcome[\s\S]*?run: \|([\s\S]*?)\n {6}- name:/,
    );
    expect(runBlockMatch).toBeTruthy();
    const runBlock = runBlockMatch[1];
    expect(runBlock).toContain('steps.secret-scan.outcome');
    expect(runBlock).toContain('!= "success"');
    expect(runBlock).not.toMatch(/secret-scan\.outcome }"\] = "failure"/);
  });

  it('records APPROVED FOR <ENVIRONMENT> ADMISSION only after required inline gates pass', () => {
    expect(jobSource).toContain('output.admissionApproval');
    expect(jobSource).toContain('gatesPassed && output.admissionApproval');
    expect(jobSource).toContain('formatAdmitMergeEvidenceLine');
  });

  it('wires merge disposition classification into admit merge + Issue evidence (#3043)', () => {
    expect(jobSource).toContain('classifyPullsMergeResult');
    expect(jobSource).toContain('mergeDisposition');
    expect(jobSource).toContain('MERGE REFUSED');
    expect(jobSource).toContain('MERGE API FAILURE');
    expect(jobSource).toContain('formatAdmitMergeEvidenceLine');
    expect(jobSource).toContain('admit-merge-disposition.mjs');
  });

  it('writes post-merge verification evidence onto the source Issue after merge', () => {
    const record = steps.find((s) => s.name === 'Record admission evidence on source Issue');
    expect(record).toBeTruthy();
    expect(record.if).toContain("steps.refresh.outputs.hasMutation == 'true'");
    expect(jobSource).toContain('Post-merge verification:');
    expect(jobSource).toContain('issues.createComment');
    expect(jobSource).toContain('issues.updateComment');
  });
});
