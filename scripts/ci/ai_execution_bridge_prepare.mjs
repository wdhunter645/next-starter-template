#!/usr/bin/env node

import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export const PLAN_VERSION = 1;
export const FUTURE_PHASE_NOTE =
  'OpenAI API execution and autonomous code generation are intentionally disabled in phase 1.';

export function slugifyTitle(title = '') {
  return String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/g, '') || 'task';
}

export function buildBranchName(issueNumber, issueTitle) {
  const slug = slugifyTitle(issueTitle);
  return `ai-build/${issueNumber}-${slug}`;
}

export function buildPrTitle(issueTitle) {
  const trimmed = String(issueTitle || 'Approved AI build task').trim();
  return trimmed.startsWith('AI build:') ? trimmed : `AI build: ${trimmed}`;
}

export function buildPrBody({
  issueNumber,
  issueTitle,
  allowedFiles = [],
  sections = {},
}) {
  const allowlist = allowedFiles.map((file) => `- ${file}`).join('\n');
  const approvedTask = sections['## Approved Task'] || '_From source issue._';
  const scope = sections['## Scope'] || '_From source issue._';
  const acceptance = sections['## Acceptance Criteria'] || '_From source issue._';
  const validation = sections['## Validation'] || '_From source issue._';

  return `### PR Template

#### Reference
Refer to \`/.github/pull_request_template.md\` for required structure and change conventions.

- **Issue:** #${issueNumber}

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root

## PROGRESS + READINESS (MANDATORY)
- Phase: AI execution bridge (phase 1 — plan only)
- Task: ${issueTitle}
- Status: DRAFT
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: OpenAI execution disabled until a future approved phase
- Notes: ${FUTURE_PHASE_NOTE}

## DOCUMENTATION SOURCE (MANDATORY)
- [x] DIATAXIS_ROUTED
- [ ] DIATAXIS_FULL
- [ ] LEGACY_FALLBACK

Source Files Used:
- docs/how-to/ops/controlled-ai-execution-bridge.md
- docs/templates/ai-build-issue-template.md

## LABEL
- Intent label for this PR: change-ops

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: \`/docs/governance/PR_PROCESS.md\`
- Canonical governance reference: \`/docs/governance/PR_GOVERNANCE.md\`
- Canonical troubleshooting reference: \`/docs/reference/governance/troubleshooting-data-surface-requirements.md\`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
${allowlist}

All other files are out of scope

## CHANGE SUMMARY
- Implements the approved task from issue #${issueNumber}.
- ${approvedTask.replace(/\r?\n/g, ' ').trim()}

## BUILD / TEST / VERIFICATION
- Commands run:
  - Planned from source issue validation section.
- Result summary:
  - PENDING — execution bridge phase 1 creates the plan only.

## ACCEPTANCE CRITERIA
${acceptance}

## SOURCE ISSUE CONTEXT
### Approved Task
${approvedTask}

### Scope
${scope}

### Validation
${validation}
`;
}

export function buildPlan({
  repository = '',
  issueNumber,
  issueTitle,
  allowedFiles = [],
  sections = {},
  baseBranch = 'main',
}) {
  const branchName = buildBranchName(issueNumber, issueTitle);
  const prTitle = buildPrTitle(issueTitle);
  const prBody = buildPrBody({ issueNumber, issueTitle, allowedFiles, sections });

  return {
    bridge: 'ai-execution',
    version: PLAN_VERSION,
    repository,
    generatedAt: new Date().toISOString(),
    phase: 'plan-only',
    futurePhase: {
      openAiExecution: false,
      note: FUTURE_PHASE_NOTE,
    },
    issueNumber,
    issueTitle,
    baseBranch,
    branchName,
    prTitle,
    prBody,
    allowedFiles,
    sections,
  };
}

export function readValidationResult(resultPath) {
  const raw = fs.readFileSync(resultPath, 'utf8');
  return JSON.parse(raw);
}

export function writeJsonOutput(filePath, payload) {
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

export function runPrepare({
  resultPath = process.env.AI_EXECUTION_BRIDGE_RESULT_PATH || 'ai-execution-bridge-result.json',
  outputPath = process.env.AI_EXECUTION_BRIDGE_PLAN_PATH || 'ai-execution-bridge-plan.json',
  repository = process.env.GITHUB_REPOSITORY || '',
  baseBranch = process.env.AI_EXECUTION_BRIDGE_BASE_BRANCH || 'main',
} = {}) {
  const validation = readValidationResult(resultPath);

  if (validation.skipped) {
    const payload = {
      bridge: 'ai-execution',
      version: PLAN_VERSION,
      repository,
      generatedAt: new Date().toISOString(),
      phase: 'skipped',
      reason: validation.reason,
    };
    writeJsonOutput(outputPath, payload);
    return { exitCode: 0, payload };
  }

  if (!validation.ok || validation.status !== 'passed') {
    throw new Error('Cannot prepare plan for a failed validation result');
  }

  const payload = buildPlan({
    repository,
    issueNumber: validation.issueNumber,
    issueTitle: validation.issueTitle,
    allowedFiles: validation.allowedFiles,
    sections: validation.sections,
    baseBranch,
  });

  writeJsonOutput(outputPath, payload);
  return { exitCode: 0, payload };
}

export function main() {
  try {
    const { exitCode } = runPrepare();
    process.exit(exitCode);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
