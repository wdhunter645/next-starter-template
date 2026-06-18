import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const SCRIPT = path.join(process.cwd(), 'scripts/ci/verify_cloudflare_d1_auth.mjs');

describe('verify_cloudflare_d1_auth.mjs', () => {
  it('fails fast when Cloudflare credentials are missing', () => {
    const result = spawnSync('node', [SCRIPT], {
      encoding: 'utf8',
      env: {
        ...process.env,
        CLOUDFLARE_API_TOKEN: '',
        CLOUDFLARE_ACCOUNT_ID: '',
        CF_API_TOKEN: '',
        CF_ACCOUNT_ID: '',
      },
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Missing required environment variable');
  });
});
