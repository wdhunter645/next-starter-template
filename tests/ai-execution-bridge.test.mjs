import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  AI_BUILD_LABEL,
  assessAiBuildIssueEvent,
  assessAllowedFiles,
  buildResultPayload,
  extractAllowedFiles,
  isUnsafeAllowedPath,
  runValidation,
} from '../scripts/ci/ai_execution_bridge_validate.mjs';
import {
  buildBranchName,
  buildPlan,
  buildPrBody,
  buildPrTitle,
  runPrepare,
  slugifyTitle,
} from '../scripts/ci/ai_execution_bridge_prepare.mjs';

const tmpFiles = [];

afterEach(() => {
  for (const filePath of tmpFiles.splice(0)) {
    fs.rmSync(filePath, { force: true });
  }
});

function writeTempJson(name, payload) {
  const filePath = path.join(os.tmpdir(), `ai-bridge-${name}-${Date.now()}-${Math.random()}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  tmpFiles.push(filePath);
  return filePath;
}

function validIssueBody(overrides = {}) {
  const sections = {
    approvedTask: 'Update controlled AI bridge documentation.',
    scope: 'Docs and CI bridge foundation only.',
    allowedFiles: '- docs/how-to/ops/controlled-ai-execution-bridge.md',
    acceptance: '- [ ] Bridge validates approved issues.',
    validation: '- `npm test -- tests/ai-execution-bridge.test.mjs`',
    ...overrides,
  };

  return [
    '## Approved Task',
    sections.approvedTask,
    '',
    '## Scope',
    sections.scope,
    '',
    '## Allowed Files',
    sections.allowedFiles,
    '',
    '## Acceptance Criteria',
    sections.acceptance,
    '',
    '## Validation',
    sections.validation,
  ].join('\n');
}

function labeledEvent({ label = AI_BUILD_LABEL, body = validIssueBody(), issueNumber = 42, title = 'Add controlled AI execution bridge' } = {}) {
  return {
    action: 'labeled',
    label: { name: label },
    issue: {
      number: issueNumber,
      title,
      body,
    },
  };
}

describe('ai execution bridge validate', () => {
  it('valid issue with ai-build passes', () => {
    const result = assessAiBuildIssueEvent(labeledEvent());

    expect(result.ok).toBe(true);
    expect(result.status).toBe('passed');
    expect(result.allowedFiles).toEqual(['docs/how-to/ops/controlled-ai-execution-bridge.md']);
  });

  it('missing required section fails', () => {
    const body = validIssueBody();
    const withoutScope = body.replace('## Scope\nDocs and CI bridge foundation only.\n\n', '');
    const result = assessAiBuildIssueEvent(labeledEvent({ body: withoutScope }));

    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('## Scope'))).toBe(true);
  });

  it('missing allowed files fails', () => {
    const body = validIssueBody({ allowedFiles: '' });
    const result = assessAiBuildIssueEvent(labeledEvent({ body }));

    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('Allowed Files'))).toBe(true);
  });

  it('unsafe wildcard path fails', () => {
    const allowed = assessAllowedFiles(validIssueBody({ allowedFiles: '- **/*' }));
    expect(allowed.errors.length).toBeGreaterThan(0);
    expect(isUnsafeAllowedPath('**/*').unsafe).toBe(true);
  });

  it('path traversal or absolute path fails', () => {
    expect(isUnsafeAllowedPath('../etc/passwd').unsafe).toBe(true);
    expect(isUnsafeAllowedPath('/absolute/path').unsafe).toBe(true);
    expect(isUnsafeAllowedPath('C:\\Windows').unsafe).toBe(true);
  });

  it('PR event masquerading as issue fails', () => {
    const event = labeledEvent();
    event.issue.pull_request = { url: 'https://github.com/example/repo/pull/1' };
    const result = assessAiBuildIssueEvent(event);

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('issue-is-pull-request');
  });

  it('non-ai-build label exits cleanly as noop', () => {
    const result = assessAiBuildIssueEvent(labeledEvent({ label: 'change-ops' }));

    expect(result.ok).toBe(true);
    expect(result.skipped).toBe(true);
    expect(result.status).toBe('noop');
    expect(result.reason).toBe('label-not-ai-build');
  });

  it('runValidation writes machine-readable JSON output', () => {
    const eventPath = writeTempJson('event', labeledEvent());
    const outputPath = writeTempJson('result-empty', {});
    fs.writeFileSync(outputPath, '', 'utf8');

    const { exitCode, payload } = runValidation({
      eventPath,
      outputPath,
      repository: 'owner/repo',
    });

    expect(exitCode).toBe(0);
    expect(payload.status).toBe('passed');
    expect(fs.existsSync(outputPath)).toBe(true);
    const written = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    expect(written.repository).toBe('owner/repo');
    expect(written.bridge).toBe('ai-execution');
  });
});

describe('ai execution bridge prepare', () => {
  it('plan generation creates deterministic branch/title/body', () => {
    const plan = buildPlan({
      repository: 'owner/repo',
      issueNumber: 99,
      issueTitle: 'Add Controlled AI Execution Bridge!!!',
      allowedFiles: ['docs/how-to/ops/controlled-ai-execution-bridge.md'],
      sections: {
        '## Approved Task': 'Ship phase-1 bridge.',
        '## Scope': 'CI only.',
        '## Acceptance Criteria': '- [ ] Tests pass.',
        '## Validation': '- npm test',
      },
    });

    expect(plan.branchName).toBe('ai-build/99-add-controlled-ai-execution-bridge');
    expect(plan.prTitle).toBe('AI build: Add Controlled AI Execution Bridge!!!');
    expect(plan.prBody).toContain('- **Issue:** #99');
    expect(plan.prBody).toContain('No ZIP file exists in the repo root');
    expect(plan.futurePhase.openAiExecution).toBe(false);

    const second = buildPlan({
      repository: 'owner/repo',
      issueNumber: 99,
      issueTitle: 'Add Controlled AI Execution Bridge!!!',
      allowedFiles: ['docs/how-to/ops/controlled-ai-execution-bridge.md'],
      sections: plan.sections,
    });

    expect(second.branchName).toBe(plan.branchName);
    expect(second.prTitle).toBe(plan.prTitle);
    expect(second.prBody).toBe(plan.prBody);
  });

  it('runPrepare writes ai-execution-bridge-plan.json from validation result', () => {
    const resultPath = writeTempJson('validation-pass', buildResultPayload({
      status: 'passed',
      ok: true,
      skipped: false,
      reason: 'validation-passed',
      issueNumber: 7,
      issueTitle: 'Docs task',
      allowedFiles: ['docs/templates/ai-build-issue-template.md'],
      sections: {
        '## Approved Task': 'Template only',
        '## Scope': 'Template',
        '## Acceptance Criteria': 'Done',
        '## Validation': 'npm test',
      },
    }, 'owner/repo'));

    const outputPath = path.join(os.tmpdir(), `ai-bridge-plan-${Date.now()}.json`);
    tmpFiles.push(outputPath);

    const { exitCode, payload } = runPrepare({
      resultPath,
      outputPath,
      repository: 'owner/repo',
    });

    expect(exitCode).toBe(0);
    expect(payload.branchName).toBe(buildBranchName(7, 'Docs task'));
    expect(fs.readFileSync(outputPath, 'utf8')).toContain('"phase": "plan-only"');
  });

  it('slugifyTitle and buildPrTitle follow deterministic conventions', () => {
    expect(slugifyTitle('Hello --- World')).toBe('hello-world');
    expect(buildPrTitle('Task')).toBe('AI build: Task');
    expect(buildPrTitle('AI build: Task')).toBe('AI build: Task');
    expect(buildPrBody({
      issueNumber: 1,
      issueTitle: 'Task',
      allowedFiles: ['docs/a.md'],
      sections: {
        '## Approved Task': 'A',
        '## Scope': 'B',
        '## Acceptance Criteria': 'C',
        '## Validation': 'D',
      },
    })).toContain('- docs/a.md');
  });

  it('extractAllowedFiles parses bullet lists and ignores checkboxes', () => {
    const files = extractAllowedFiles(validIssueBody({
      allowedFiles: '- `docs/a.md`\n- docs/b.md\n- [ ] docs/c.md',
    }));

    expect(files).toEqual(['docs/a.md', 'docs/b.md']);
  });

  it('missing or invalid issue number fails validation', () => {
    const event = labeledEvent();
    delete event.issue.number;
    const result = assessAiBuildIssueEvent(event);

    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('Issue number'))).toBe(true);
  });
});
