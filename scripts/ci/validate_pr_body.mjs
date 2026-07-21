#!/usr/bin/env node

/**
 * CI-001 procedural preclearance validator.
 * Pre-open only. Does not approve, merge, or mutate GitHub state.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  findUnlistedChangedFiles,
  hasRequiredIssueLine,
  hasVerificationEvidence,
  missingTemplateSections,
  parseAllowedFiles,
  hasRequiredIntentLabel,
  hasRequiredPrClass,
  findCanonicalIssueLine,
  hasSection,
  extractMarkdownSection,
} from './pr_hygiene_audit.mjs';

export const PROHIBITED_PLACEHOLDER_PATTERNS = [
  { id: 'hash_issue_placeholder', pattern: /#\[issue\]/i },
  { id: 'hash_program_placeholder', pattern: /#\[program\]/i },
  { id: 'package_id_placeholder', pattern: /\[package-id\]/i },
  { id: 'path_placeholder', pattern: /\[path\]/i },
  { id: 'command_placeholder', pattern: /\[command\]/i },
  { id: 'tbd_token', pattern: /(^|[^A-Za-z])TBD([^A-Za-z]|$)/ },
  { id: 'blank_issue', pattern: /#____/ },
  { id: 'path_to_placeholder', pattern: /path\/to\//i },
];

export const FAILURE_CODES = Object.freeze({
  MISSING_SOURCE_ISSUE: 'missing_source_issue',
  MULTIPLE_SOURCE_ISSUES: 'multiple_source_issues',
  MISSING_PACKAGE_PATH: 'missing_package_path',
  PLACEHOLDER_TOKEN: 'placeholder_token',
  OFF_ALLOWLIST_FILE: 'off_allowlist_file',
  MISSING_VALIDATION: 'missing_validation',
  MISSING_DESIGN_COMPLIANCE: 'missing_design_compliance',
  MISSING_2286_INHERITANCE: 'missing_2286_inheritance',
  MISSING_TEMPLATE_SECTION: 'missing_template_section',
  MISSING_INTENT_OR_CLASS: 'missing_intent_or_class',
  MERGE_AUTHORITY_LANGUAGE: 'merge_authority_language',
});

function hasAffirmativeMergeAuthorityClaim(text = '') {
  // Negated disclosures such as "No pre-approved merge language" are allowed.
  // Affirmative auto-approve / auto-merge / pre-approved-merge claims are not.
  if (/\b(is|are|was|were|will be|shall be)\s+pre-approved(?:\s+for)?\s+merge\b/i.test(text)) {
    return true;
  }
  if (/\b(?:will|shall|must|should|can|may)\s+auto-?(?:approve|merge)\b/i.test(text)) {
    return true;
  }
  if (/\benables?\s+auto-?(?:approve|merge)\b/i.test(text)) {
    return true;
  }
  if (/\bauto-?(?:approve|merge)(?:s|d)?\s+(?:this|the)\s+(?:PR|pull request)\b/i.test(text)) {
    return true;
  }
  return false;
}

export function findProhibitedPlaceholders(body = '') {
  const text = String(body || '');
  const hits = [];
  for (const entry of PROHIBITED_PLACEHOLDER_PATTERNS) {
    if (entry.pattern.test(text)) {
      hits.push(entry.id);
    }
  }
  return hits;
}

export function countCanonicalIssueLines(body = '') {
  const lines = String(body || '').split(/\r?\n/);
  return lines.filter((line) => /^\s*-\s*\*\*Issue:\*\*\s+#\d+\s*$/.test(line.trim())).length;
}

export function hasPackagePathEvidence(body = '', { packageScoped = true } = {}) {
  if (!packageScoped) return true;
  const packageSection = extractMarkdownSection(body, 'Package Compliance') || body;
  return /Package path:\s*`[^`\s]+`/i.test(packageSection)
    || /docs\/ops\/implementation-plans\/content-collection\/packages\/[a-z0-9-]+\.md/i.test(packageSection);
}

export function hasDesignComplianceEvidence(body = '') {
  const section = extractMarkdownSection(body, 'Design Compliance');
  return section.length > 0 && !/not-applicable/i.test(section.split(/\r?\n/)[0] || '');
}

export function has2286InheritanceEvidence(body = '') {
  const section = extractMarkdownSection(body, '#2286 Inheritance')
    || extractMarkdownSection(body, '2286 Inheritance');
  if (!section) return false;
  return /#2286/i.test(section) && /inherit|preserved|statement|compliance/i.test(section);
}

export function hasProhibitedMergeAuthorityLanguage(body = '') {
  return hasAffirmativeMergeAuthorityClaim(String(body || ''));
}

/**
 * @param {object} options
 * @param {string} options.body
 * @param {string[]} [options.changedFiles]
 * @param {boolean} [options.packageScoped]
 * @param {boolean} [options.requiresDesignCompliance]
 * @param {boolean} [options.requires2286Inheritance]
 * @param {boolean} [options.mixedScopeApproved]
 */
export function validatePrBody({
  body = '',
  changedFiles = [],
  packageScoped = true,
  requiresDesignCompliance = false,
  requires2286Inheritance = false,
  mixedScopeApproved = false,
} = {}) {
  const failures = [];
  const warnings = [];

  const allowedFiles = parseAllowedFiles(body);
  const unlistedChangedFiles = findUnlistedChangedFiles(changedFiles, allowedFiles);
  const placeholders = findProhibitedPlaceholders(body);
  const missingSections = missingTemplateSections(body);
  const issueLineCount = countCanonicalIssueLines(body);

  if (!hasRequiredIssueLine(body) || issueLineCount === 0) {
    failures.push({
      code: FAILURE_CODES.MISSING_SOURCE_ISSUE,
      message: 'Missing canonical source issue line: `- **Issue:** #NNN`.',
    });
  } else if (issueLineCount > 1 && !mixedScopeApproved) {
    failures.push({
      code: FAILURE_CODES.MULTIPLE_SOURCE_ISSUES,
      message: `Found ${issueLineCount} canonical source issue lines; exactly one is required unless mixed scope is approved.`,
    });
  }

  if (!hasRequiredIntentLabel(body) || !hasRequiredPrClass(body)) {
    failures.push({
      code: FAILURE_CODES.MISSING_INTENT_OR_CLASS,
      message: 'Missing stable Intent label and/or PR class in PR Summary.',
    });
  }

  for (const section of missingSections) {
    failures.push({
      code: FAILURE_CODES.MISSING_TEMPLATE_SECTION,
      message: `Missing required template section: ${section}.`,
      section,
    });
  }

  if (packageScoped && !hasPackagePathEvidence(body, { packageScoped })) {
    failures.push({
      code: FAILURE_CODES.MISSING_PACKAGE_PATH,
      message: 'Missing package path evidence for package-scoped Content Collection work.',
    });
  }

  if (placeholders.length > 0) {
    failures.push({
      code: FAILURE_CODES.PLACEHOLDER_TOKEN,
      message: `Prohibited placeholder token(s) remain: ${placeholders.join(', ')}.`,
      placeholders,
    });
  }

  if (unlistedChangedFiles.length > 0) {
    failures.push({
      code: FAILURE_CODES.OFF_ALLOWLIST_FILE,
      message: 'Changed files are outside Allowed paths.',
      files: unlistedChangedFiles,
    });
  }

  if (!hasVerificationEvidence(body)) {
    failures.push({
      code: FAILURE_CODES.MISSING_VALIDATION,
      message: 'Missing validation evidence under Verification (local command Result: PASS|FAIL|NOT RUN).',
    });
  }

  if (requiresDesignCompliance && !hasDesignComplianceEvidence(body)) {
    failures.push({
      code: FAILURE_CODES.MISSING_DESIGN_COMPLIANCE,
      message: 'UI task requires a Design Compliance section with substantive evidence.',
    });
  }

  if (requires2286Inheritance && !has2286InheritanceEvidence(body)) {
    failures.push({
      code: FAILURE_CODES.MISSING_2286_INHERITANCE,
      message: 'Pipeline/runtime task requires a #2286 Inheritance statement.',
    });
  }

  if (hasProhibitedMergeAuthorityLanguage(body)) {
    failures.push({
      code: FAILURE_CODES.MERGE_AUTHORITY_LANGUAGE,
      message: 'PR body must not introduce auto-approve, auto-merge, or pre-approved merge language.',
    });
  }

  if (!hasSection(body, 'As-Built Documentation')) {
    warnings.push({
      code: 'missing_as_built_section',
      message: 'As-Built Documentation section is optional but recommended for Content Collection tasks.',
    });
  }

  return {
    ok: failures.length === 0,
    failures,
    warnings,
    canonicalIssueLine: findCanonicalIssueLine(body),
    allowedFiles,
    unlistedChangedFiles,
    placeholders,
    missingSections,
    mergeAuthorityUnchanged: !hasProhibitedMergeAuthorityLanguage(body),
  };
}

export function renderValidationReport(report) {
  const lines = ['## PR Body Preclearance', ''];
  if (report.ok) {
    lines.push('PASS — procedural preclearance only; merge authority unchanged.');
  } else {
    lines.push('FAIL — procedural defects must be corrected before PR creation.');
    for (const failure of report.failures) {
      lines.push(`- [${failure.code}] ${failure.message}`);
      if (Array.isArray(failure.files)) {
        for (const file of failure.files) {
          lines.push(`  - \`${file}\``);
        }
      }
    }
  }

  if (report.warnings.length > 0) {
    lines.push('', 'Warnings:');
    for (const warning of report.warnings) {
      lines.push(`- [${warning.code}] ${warning.message}`);
    }
  }

  lines.push('', 'Merge authority: Bill / ChatGPT unchanged.');
  return lines.join('\n');
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    fixture: '',
    bodyFile: '',
    changedFiles: [],
    packageScoped: true,
    requiresDesignCompliance: false,
    requires2286Inheritance: false,
    mixedScopeApproved: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--fixture') args.fixture = argv[++i] || '';
    else if (arg === '--body-file') args.bodyFile = argv[++i] || '';
    else if (arg === '--changed-file') args.changedFiles.push(argv[++i] || '');
    else if (arg === '--no-package-scoped') args.packageScoped = false;
    else if (arg === '--requires-design-compliance') args.requiresDesignCompliance = true;
    else if (arg === '--requires-2286-inheritance') args.requires2286Inheritance = true;
    else if (arg === '--mixed-scope-approved') args.mixedScopeApproved = true;
  }

  return args;
}

export function loadFixture(fixturePath) {
  const absolute = path.resolve(fixturePath);
  const raw = fs.readFileSync(absolute, 'utf8');
  return JSON.parse(raw);
}

export function runValidateCli(argv = process.argv.slice(2), { stdout = console.log, stderr = console.error } = {}) {
  const args = parseArgs(argv);
  let body = '';
  let options = {
    packageScoped: args.packageScoped,
    requiresDesignCompliance: args.requiresDesignCompliance,
    requires2286Inheritance: args.requires2286Inheritance,
    mixedScopeApproved: args.mixedScopeApproved,
    changedFiles: args.changedFiles,
  };

  if (args.fixture) {
    const fixture = loadFixture(args.fixture);
    body = fixture.body || '';
    options = {
      packageScoped: fixture.packageScoped ?? options.packageScoped,
      requiresDesignCompliance: fixture.requiresDesignCompliance ?? options.requiresDesignCompliance,
      requires2286Inheritance: fixture.requires2286Inheritance ?? options.requires2286Inheritance,
      mixedScopeApproved: fixture.mixedScopeApproved ?? options.mixedScopeApproved,
      changedFiles: fixture.changedFiles || options.changedFiles,
    };
  } else if (args.bodyFile) {
    body = fs.readFileSync(path.resolve(args.bodyFile), 'utf8');
  } else {
    stderr('Usage: node scripts/ci/validate_pr_body.mjs --fixture <path> | --body-file <path>');
    return 2;
  }

  const report = validatePrBody({ body, ...options });
  stdout(renderValidationReport(report));
  return report.ok ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = runValidateCli();
}
