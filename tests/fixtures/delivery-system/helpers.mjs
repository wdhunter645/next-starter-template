export function prBody(overrides = {}) {
  const values = {
    issue: '#2501',
    intentLabel: 'intent:ci',
    prClass: 'ci',
    size: 'small',
    deliveryModel: 'A',
    changeMode: 'project',
    targetEnvironment: 'production',
    approvalProfile: 'chat-bill-production',
    gateProfile: 'production-candidate',
    rollbackProfile: 'one-step',
    componentBranch: 'not-applicable',
    componentMaster: 'not-applicable',
    extra: '',
    ...overrides,
  };

  return `# PR Summary

- **Issue:** ${values.issue}
- Intent label: ${values.intentLabel}
- PR class: ${values.prClass}
- Size: ${values.size}
- Delivery model: ${values.deliveryModel}
- Change mode: ${values.changeMode}
- Target environment: ${values.targetEnvironment}
- Approval profile: ${values.approvalProfile}
- Gate profile: ${values.gateProfile}
- Rollback profile: ${values.rollbackProfile}
- Component branch: ${values.componentBranch}
- Component master: ${values.componentMaster}

## Change Summary

Delivery System v1 pilot fixture.

${values.extra}
`;
}

export const LEGACY_HEADER = `---
Doc Type: Governance
Audience: Human + AI
Authority Level: Controlled
Owns: fixture
Does Not Own: production
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Last Reviewed: 2026-07-13
---

# Legacy Document
`;

export const FIXTURE_DISPOSITION_MAP = `---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: fixture disposition map
Does Not Own: production policy
Canonical Reference: /docs/governance/REPOSITORY-AUTHORITY.md
Last Reviewed: 2026-07-13
---

# Fixture Disposition Map

| Current path | Current owner | Target owner | Action | Replacement / notes | Reference-update scope |
| --- | --- | --- | --- | --- | --- |
| \`docs/governance/legacy-header-only.md\` | Governance | Documentation and Knowledge | retain | Header-only failure fixture | \`Agent.md\` |
| \`docs/governance/legacy-emergency-source.md\` | Governance | Documentation and Knowledge | migrate | Move to \`docs/reference/diataxis/emergency-target.md\` | \`Agent.md\` |
`;

export const ONE_STEP_ROLLBACK_FIELDS = [
  'rollback_target_type',
  'rollback_target_ref',
  'smoke_tests',
  'verification_owner',
];

export const MULTI_STEP_ROLLBACK_FIELDS = [
  'release_unit',
  'rollback_trigger',
  'disablement_steps',
  'external_write_stops',
  'config_restoration',
  'data_restoration',
  'deployment_restoration',
  'dependency_order',
  'verification_checklist',
  'reconciliation',
  'package_owner',
  'package_finalized_before_promotion',
];

export const PROMOTION_PACKAGE_FIELDS = [
  ...MULTI_STEP_ROLLBACK_FIELDS,
  'integrated_children_complete',
  'pilot_evidence_path',
  'authority_disposition_complete',
];

export function parseEvidenceBlock(text = '') {
  const fields = {};
  for (const line of String(text).split(/\r?\n/)) {
    const match = line.match(/^([a-z_]+):\s*(.+)\s*$/i);
    if (match) {
      fields[match[1]] = match[2].trim();
    }
  }
  return fields;
}

export function missingEvidenceFields(fields, required) {
  return required.filter((field) => {
    const value = fields[field];
    return !value || value === 'no' || value === 'missing' || value === 'tbd';
  });
}
