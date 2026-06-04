#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();

const requiredFiles = [
  'Agent.md',
  '.agents/checks/agent-governance-check.mjs',
  '.agents/skills/lgfc-pr-governance/SKILL.md',
  '.agents/skills/lgfc-design-compliance/SKILL.md',
  '.agents/skills/lgfc-docs-authority/SKILL.md',
  '.agents/skills/lgfc-cloudflare-static-export/SKILL.md',
  '.agents/skills/lgfc-verification-closeout/SKILL.md',
  '.github/workflows/agent-governance.yml',
  'governance/ai/AGENT-GOVERNANCE.md',
  'ops/ai/CROSS-AGENT-OPERATING-RULES.md',
  'docs/ops/ai/SHARED-AGENT-RULES.md',
  'docs/ops/ai/CODEX-RULES.md',
];

const requiredAgentText = [
  '.agents/skills/lgfc-pr-governance/SKILL.md',
  '.agents/skills/lgfc-design-compliance/SKILL.md',
  '.agents/skills/lgfc-docs-authority/SKILL.md',
  '.agents/skills/lgfc-cloudflare-static-export/SKILL.md',
  '.agents/skills/lgfc-verification-closeout/SKILL.md',
  'governance/ai/AGENT-GOVERNANCE.md',
  'ops/ai/CROSS-AGENT-OPERATING-RULES.md',
  'docs/ops/ai/SHARED-AGENT-RULES.md',
  'docs/ops/ai/CODEX-RULES.md',
  '.agents/checks/agent-governance-check.mjs',
  '.github/workflows/agent-governance.yml',
];

function filePath(relativePath) {
  return path.join(root, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(filePath(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(filePath(relativePath), 'utf8');
}

const failures = [];

for (const file of requiredFiles) {
  if (!exists(file)) {
    failures.push(`missing required file: ${file}`);
  }
}

if (exists('Agent.md')) {
  const agent = read('Agent.md');
  for (const required of requiredAgentText) {
    if (!agent.includes(required)) {
      failures.push(`Agent.md does not reference required path: ${required}`);
    }
  }
}

for (const markdownFile of [
  'governance/ai/AGENT-GOVERNANCE.md',
  'ops/ai/CROSS-AGENT-OPERATING-RULES.md',
]) {
  if (!exists(markdownFile)) {
    continue;
  }

  const content = read(markdownFile);
  if (!/^---\r?\n/.test(content)) {
    failures.push(`${markdownFile} is missing required docs header fence`);
  }
}

if (failures.length > 0) {
  console.error('Agent governance check FAILED.');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Agent governance check PASSED.');
