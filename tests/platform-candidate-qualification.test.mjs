import { describe, expect, it } from 'vitest';
import {
  isToolingDisabled,
  PROTECTED_UNRESOLVED_ITEMS,
  REQUIRED_EVIDENCE_REPORTS,
  REQUIRED_HANDOFF_DOCS,
  REQUIRED_TOOLING,
  runPlatformCandidateQualification,
} from '../scripts/ci/platform-candidate-qualification.mjs';

describe('platform-candidate-qualification helpers', () => {
  it('recognizes disable env values', () => {
    expect(isToolingDisabled({ LGFC_PLATFORM_VALIDATION_DISABLED: '1' })).toBe(true);
    expect(isToolingDisabled({ LGFC_PLATFORM_VALIDATION_DISABLED: 'true' })).toBe(true);
    expect(isToolingDisabled({ LGFC_PLATFORM_VALIDATION_DISABLED: 'yes' })).toBe(true);
    expect(isToolingDisabled({ LGFC_PLATFORM_VALIDATION_DISABLED: '0' })).toBe(false);
    expect(isToolingDisabled({})).toBe(false);
  });

  it('lists prior evidence, tooling, handoff docs, and protected follow-ups', () => {
    expect(REQUIRED_EVIDENCE_REPORTS).toHaveLength(3);
    expect(REQUIRED_TOOLING).toHaveLength(4);
    expect(REQUIRED_HANDOFF_DOCS).toHaveLength(3);
    expect(PROTECTED_UNRESOLVED_ITEMS.length).toBeGreaterThanOrEqual(5);
    expect(PROTECTED_UNRESOLVED_ITEMS.map((i) => i.id)).toEqual(
      expect.arrayContaining(['production_go', 'migration_prefix_collisions', 'live_b2_list_read']),
    );
  });
});

describe('platform-candidate-qualification runner', () => {
  it('disables tooling without Production mutation or child runs', async () => {
    const result = await runPlatformCandidateQualification({
      env: { LGFC_PLATFORM_VALIDATION_DISABLED: '1' },
      actorRole: 'test-runner',
    });
    expect(result.ok).toBe(true);
    expect(result.disabled).toBe(true);
    expect(result.productionMutation).toBe(false);
    expect(result.writeAttempts).toBe(0);
    expect(result.childResults).toBeNull();
    expect(result.summary.recommendation).toBe('DISABLED');
    expect(result.summary.productionPromotion).toBe('not_authorized');
    expect(result.checks.some((c) => c.name === 'tooling_disabled' && c.ok)).toBe(true);
  });

  it('qualifies clean-or-allowed worktree with skip-http child validators', async () => {
    const prior = {
      CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
      CF_API_TOKEN: process.env.CF_API_TOKEN,
      CF_ACCOUNT_ID: process.env.CF_ACCOUNT_ID,
      B2_KEY_ID: process.env.B2_KEY_ID,
      B2_APP_KEY: process.env.B2_APP_KEY,
      B2_ENDPOINT: process.env.B2_ENDPOINT,
      B2_BUCKET: process.env.B2_BUCKET,
      LGFC_PLATFORM_VALIDATION_DISABLED: process.env.LGFC_PLATFORM_VALIDATION_DISABLED,
    };
    for (const key of Object.keys(prior)) {
      delete process.env[key];
    }
    try {
      const result = await runPlatformCandidateQualification({
        allowDirtyWorktree: true,
        actorRole: 'test-runner',
        env: process.env,
      });
      expect(result.disabled).toBe(false);
      expect(result.productionMutation).toBe(false);
      expect(result.writeAttempts).toBe(0);
      expect(result.sourceIssue).toBe('#2893');
      expect(result.parentProject).toBe('#2778');
      expect(result.componentBranch).toBe('component/platform-production-validation');
      expect(result.summary.productionPromotion).toBe('not_authorized');
      expect(result.ok).toBe(true);
      expect(result.summary.recommendation).toBe(
        'PROMOTION_CANDIDATE_READY_FOR_INDEPENDENT_REVIEW',
      );
      expect(result.childResults?.cfD1.ok).toBe(true);
      expect(result.childResults?.b2Runtime.ok).toBe(true);
      expect(result.protectedUnresolved.length).toBe(PROTECTED_UNRESOLVED_ITEMS.length);
      for (const rel of REQUIRED_EVIDENCE_REPORTS) {
        expect(result.checks.find((c) => c.name === `evidence_present:${rel}`)?.ok).toBe(true);
      }
      for (const rel of REQUIRED_HANDOFF_DOCS) {
        expect(result.checks.find((c) => c.name === `handoff_doc_present:${rel}`)?.ok).toBe(true);
      }
    } finally {
      for (const [key, value] of Object.entries(prior)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });
});
