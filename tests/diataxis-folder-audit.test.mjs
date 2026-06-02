import { describe, expect, it } from 'vitest';
import {
  auditDiataxisFile,
  renderDiataxisReport,
  ruleForFile,
} from '../scripts/ci/diataxis_folder_audit.mjs';

const referenceDoc = `---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: reference facts
Does Not Own: procedures
Canonical Reference: docs/reference/example.md
Last Reviewed: 2026-06-02
---

# Reference Doc

## Purpose

Defines facts.
`;

describe('DIATAXIS folder hygiene audit', () => {
  it('maps files to folder intent rules', () => {
    expect(ruleForFile('docs/reference/example.md')?.expectedDocType).toBe('Reference');
    expect(ruleForFile('docs/how-to/example.md')?.expectedDocType).toBe('How-To');
    expect(ruleForFile('README.md')).toBe(null);
  });

  it('accepts a reference document that matches folder intent', () => {
    expect(auditDiataxisFile('docs/reference/example.md', referenceDoc)).toEqual([]);
  });

  it('reports doc type mismatches and forbidden reference procedures', () => {
    const findings = auditDiataxisFile('docs/reference/example.md', `${referenceDoc}\n## Steps\n\n\`\`\`bash\nnpm test\n\`\`\`\n`.replace('Doc Type: Reference', 'Doc Type: How-To'));

    expect(findings.map((finding) => finding.code)).toContain('DOC_TYPE_FOLDER_MISMATCH');
    expect(findings.map((finding) => finding.code)).toContain('FORBIDDEN_STRUCTURE_PRESENT');
  });

  it('reports missing how-to execution structure', () => {
    const findings = auditDiataxisFile('docs/how-to/example.md', referenceDoc.replace('Doc Type: Reference', 'Doc Type: How-To'));
    expect(findings.map((finding) => finding.code)).toContain('REQUIRED_STRUCTURE_MISSING');
  });

  it('renders actionable advisory text', () => {
    const report = renderDiataxisReport([
      {
        file: 'docs/reference/example.md',
        code: 'DOC_TYPE_FOLDER_MISMATCH',
        message: 'Doc Type must match folder intent: Reference',
        correction: 'Set Doc Type to Reference.',
      },
    ]);

    expect(report).toContain('DIATAXIS Folder Hygiene Advisory');
    expect(report).toContain('Set Doc Type to Reference.');
  });
});
