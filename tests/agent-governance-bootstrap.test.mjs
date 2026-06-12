import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  BOOTSTRAP_RULE_FILES,
  MAX_BOOTSTRAP_RULE_LINES,
  runAgentGovernanceCheck,
  validateBootstrap,
} from '../.agents/checks/agent-governance-check.mjs';

const tempDirs = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function makeTempRepo(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-bootstrap-'));
  tempDirs.push(dir);

  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
  }

  return dir;
}

function minimalRuleBody(extra = '') {
  return `---
description: test rule
alwaysApply: true
---

# Bootstrap

Read Agent.md, docs/ops/ai/SHARED-AGENT-RULES.md, docs/ops/ai/CORE-RULES.md,
docs/ops/ai/CURSOR-RULES.md, .agents/skills/lgfc-pr-governance/SKILL.md,
.github/pull_request_template.md.
${extra}
`;
}

function minimalAgentsMd() {
  return `# AGENTS.md

Read Agent.md, docs/ops/ai/SHARED-AGENT-RULES.md, docs/ops/ai/CORE-RULES.md,
docs/ops/ai/CURSOR-RULES.md, .agents/skills/lgfc-pr-governance/SKILL.md,
.github/pull_request_template.md.
`;
}

function minimalCanonicalFiles() {
  return {
    'Agent.md': '# Agent\n\n.cursor/rules/\n\nAGENTS.md\n',
    'docs/ops/ai/SHARED-AGENT-RULES.md': '# shared\n',
    'docs/ops/ai/CORE-RULES.md': '# core\n',
    'docs/ops/ai/CURSOR-RULES.md': '# cursor\n',
    '.agents/skills/lgfc-pr-governance/SKILL.md': '# pr governance\n',
    '.github/pull_request_template.md': '# template\n',
  };
}

function minimalBootstrapFixture(overrides = {}) {
  const ruleFiles = Object.fromEntries(
    BOOTSTRAP_RULE_FILES.map((file) => [file, minimalRuleBody()]),
  );

  return {
    ...minimalCanonicalFiles(),
    ...ruleFiles,
    'AGENTS.md': minimalAgentsMd(),
    ...overrides,
  };
}

describe('agent governance bootstrap validation', () => {
  it('passes on the live repository', () => {
    expect(runAgentGovernanceCheck(process.cwd())).toEqual([]);
  });

  it('reports missing bootstrap files', () => {
    const root = makeTempRepo(minimalCanonicalFiles());
    const failures = validateBootstrap(root);

    expect(failures.some((failure) => failure.includes('missing bootstrap file'))).toBe(true);
  });

  it('reports missing alwaysApply: true', () => {
    const root = makeTempRepo(minimalBootstrapFixture({
      [BOOTSTRAP_RULE_FILES[0]]: `---
description: test
alwaysApply: false
---

# Bootstrap

Read Agent.md, docs/ops/ai/SHARED-AGENT-RULES.md, docs/ops/ai/CORE-RULES.md,
docs/ops/ai/CURSOR-RULES.md, .agents/skills/lgfc-pr-governance/SKILL.md,
.github/pull_request_template.md.
`,
    }));

    const failures = validateBootstrap(root);
    expect(failures.some((failure) => failure.includes('alwaysApply: true'))).toBe(true);
  });

  it('reports missing canonical path references', () => {
    const root = makeTempRepo(minimalBootstrapFixture({
      'AGENTS.md': '# AGENTS.md\n\nRead Agent.md only.\n',
      [BOOTSTRAP_RULE_FILES[0]]: `---
description: test
alwaysApply: true
---

# Bootstrap

Read Agent.md only.
`,
      [BOOTSTRAP_RULE_FILES[1]]: `---
description: test
alwaysApply: true
---

# Bootstrap

Read Agent.md only.
`,
      [BOOTSTRAP_RULE_FILES[2]]: `---
description: test
alwaysApply: true
---

# Bootstrap

Read Agent.md only.
`,
    }));

    const failures = validateBootstrap(root);
    expect(failures.some((failure) => failure.includes('canonical path'))).toBe(true);
  });

  it('reports line-budget violations', () => {
    const padding = '\n'.repeat(MAX_BOOTSTRAP_RULE_LINES);
    const root = makeTempRepo(minimalBootstrapFixture({
      [BOOTSTRAP_RULE_FILES[0]]: `${minimalRuleBody()}${padding}`,
    }));

    const failures = validateBootstrap(root);
    expect(failures.some((failure) => failure.includes('exceeds'))).toBe(true);
  });

  it('reports forbidden MCP config paths', () => {
    const root = makeTempRepo({
      ...minimalBootstrapFixture(),
      'mcp.json': '{}\n',
    });

    const failures = validateBootstrap(root);
    expect(failures.some((failure) => failure.includes('forbidden MCP config path'))).toBe(true);
  });

  it('passes a minimal valid bootstrap fixture', () => {
    const root = makeTempRepo(minimalBootstrapFixture());
    expect(validateBootstrap(root)).toEqual([]);
  });
});
