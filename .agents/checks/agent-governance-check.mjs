#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const BOOTSTRAP_RULE_FILES = [
  '.cursor/rules/00-mandatory-doc-chain.mdc',
  '.cursor/rules/10-pr-governance-preflight.mdc',
  '.cursor/rules/20-stop-conditions.mdc',
];

export const BOOTSTRAP_FILES = [
  ...BOOTSTRAP_RULE_FILES,
  'AGENTS.md',
];

export const BOOTSTRAP_REQUIRED_PATH_REFERENCES = [
  'Agent.md',
  'docs/ops/ai/SHARED-AGENT-RULES.md',
  'docs/ops/ai/CORE-RULES.md',
  'docs/ops/ai/CURSOR-RULES.md',
  '.agents/skills/lgfc-pr-governance/SKILL.md',
  '.github/pull_request_template.md',
];

export const BOOTSTRAP_FORBIDDEN_MCP_PATHS = [
  'mcp.json',
  '.cursor/mcp.json',
];

export const MAX_BOOTSTRAP_RULE_LINES = 80;

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

function filePath(root, relativePath) {
  return path.join(root, relativePath);
}

function exists(root, relativePath) {
  return fs.existsSync(filePath(root, relativePath));
}

function read(root, relativePath) {
  const content = fs.readFileSync(filePath(root, relativePath), 'utf8');
  return content.startsWith('\uFEFF') ? content.slice(1) : content;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return null;
  }

  const values = {};
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':');
    if (separator === -1) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    values[key] = value;
  }

  return values;
}

export function validateLegacyAgentGovernance(root) {
  const failures = [];

  for (const file of requiredFiles) {
    if (!exists(root, file)) {
      failures.push(`missing required file: ${file}`);
    }
  }

  if (exists(root, 'Agent.md')) {
    const agent = read(root, 'Agent.md');
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
    if (!exists(root, markdownFile)) {
      continue;
    }

    const content = read(root, markdownFile);
    if (!/^---\r?\n/.test(content)) {
      failures.push(`${markdownFile} is missing required docs header fence`);
    }
  }

  return failures;
}

export function validateBootstrap(root) {
  const failures = [];

  for (const file of BOOTSTRAP_FILES) {
    if (!exists(root, file)) {
      failures.push(`missing bootstrap file: ${file}`);
    }
  }

  for (const file of BOOTSTRAP_FORBIDDEN_MCP_PATHS) {
    if (exists(root, file)) {
      failures.push(`forbidden MCP config path must not exist: ${file}`);
    }
  }

  if (exists(root, 'Agent.md')) {
    const agent = read(root, 'Agent.md');
    if (!agent.includes('.cursor/rules/')) {
      failures.push('Agent.md must reference .cursor/rules/ bootstrap');
    }
    if (!agent.includes('AGENTS.md')) {
      failures.push('Agent.md must reference AGENTS.md bootstrap');
    }
  }

  const bootstrapContents = [];

  for (const ruleFile of BOOTSTRAP_RULE_FILES) {
    if (!exists(root, ruleFile)) {
      continue;
    }

    const content = read(root, ruleFile);
    bootstrapContents.push(content);
    const lineCount = content.split('\n').length;
    if (lineCount > MAX_BOOTSTRAP_RULE_LINES) {
      failures.push(`${ruleFile} exceeds ${MAX_BOOTSTRAP_RULE_LINES} lines (${lineCount})`);
    }

    const frontmatter = parseFrontmatter(content);
    if (!frontmatter) {
      failures.push(`${ruleFile} is missing YAML frontmatter`);
      continue;
    }

    if (frontmatter.alwaysApply !== 'true') {
      failures.push(`${ruleFile} must set alwaysApply: true`);
    }
  }

  if (exists(root, 'AGENTS.md')) {
    bootstrapContents.push(read(root, 'AGENTS.md'));
  }

  const combinedBootstrap = bootstrapContents.join('\n');
  for (const requiredPath of BOOTSTRAP_REQUIRED_PATH_REFERENCES) {
    if (!combinedBootstrap.includes(requiredPath)) {
      failures.push(`bootstrap files must reference canonical path: ${requiredPath}`);
    }
    if (!exists(root, requiredPath)) {
      failures.push(`bootstrap references missing canonical file: ${requiredPath}`);
    }
  }

  return failures;
}

export function runAgentGovernanceCheck(root) {
  return [
    ...validateLegacyAgentGovernance(root),
    ...validateBootstrap(root),
  ];
}

function main(root) {
  const failures = runAgentGovernanceCheck(root);

  if (failures.length > 0) {
    console.error('Agent governance check FAILED.');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('Agent governance check PASSED.');
}

const isMain = process.argv[1]
  && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  main(root);
}
