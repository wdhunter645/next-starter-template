#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();

const requiredFiles = [
  'AGENTS.md',
  '.agents/skills/lgfc-pr-governance/SKILL.md',
  '.agents/skills/lgfc-design-compliance/SKILL.md',
  '.agents/skills/lgfc-docs-authority/SKILL.md',
  '.agents/skills/lgfc-cloudflare-static-export/SKILL.md',
  '.agents/skills/lgfc-verification-closeout/SKILL.md',
  'governance/ai/AGENT-GOVERNANCE.md',
  'ops/ai/CROSS-AGENT-OPERATING-RULES.md',
];

const requiredSkillDirs = [
  '.agents/skills/lgfc-pr-governance',
  '.agents/skills/lgfc-design-compliance',
  '.agents/skills/lgfc-docs-authority',
  '.agents/skills/lgfc-cloudflare-static-export',
  '.agents/skills/lgfc-verification-closeout',
];

const requiredAgentText = [
  '.agents/skills/lgfc-pr-governance/SKILL.md',
  '.agents/skills/lgfc-design-compliance/SKILL.md',
  '.agents/skills/lgfc-docs-authority/SKILL.md',
  '.agents/skills/lgfc-cloudflare-static-export/SKILL.md',
  '.agents/skills/lgfc-verification-closeout/SKILL.md',
  'governance/ai/AGENT-GOVERNANCE.md',
  'ops/ai/CROSS-AGENT-OPERATING-RULES.md',
  '.agents/checks/agent-governance-check.mjs',
];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const failures = [];

for (const file of requiredFiles) {
  if (!exists(file)) {
    failures.push(`missing required file: ${file}`);
  }
}

for (const dir of requiredSkillDirs) {
  const skillFile = path.join(dir, 'SKILL.md');
  if (!exists(skillFile)) {
    failures.push(`missing skill manifest: ${skillFile}`);
  }
}

if (exists('AGENTS.md')) {
  const agents = read('AGENTS.md');
  for (const required of requiredAgentText) {
    if (!agents.includes(required)) {
      failures.push(`AGENTS.md does not reference required path: ${required}`);
    }
  }
}

for (const markdownFile of [
  'governance/ai/AGENT-GOVERNANCE.md',
  'ops/ai/CROSS-AGENT-OPERATING-RULES.md',
]) {
  if (exists(markdownFile)) {
    const content = read(markdownFile);
    if (!content.startsWith('---\n')) {
      failures.push(`${markdownFile} is missing required docs header fence`);
    }
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
