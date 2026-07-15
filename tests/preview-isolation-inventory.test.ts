import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

import manifest from '../scripts/ci/preview-isolation-manifest.json';

const CLASSIFICATIONS = new Set(manifest.classifications);
const MUTATION_EXPORTS = [
  'onRequestPost',
  'onRequestPut',
  'onRequestPatch',
  'onRequestDelete',
] as const;

function collectApiHandlers(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectApiHandlers(fullPath, acc);
      continue;
    }
    if (entry.endsWith('.ts')) {
      acc.push(relative(process.cwd(), fullPath));
    }
  }
  return acc;
}

function readHandlerSource(filePath: string): string {
  return readFileSync(filePath, 'utf8');
}

function handlerHasMutationExport(filePath: string): boolean {
  const source = readHandlerSource(filePath);
  return MUTATION_EXPORTS.some((name) => new RegExp(`export\\s+(?:async\\s+)?(?:const|function)\\s+${name}\\b`).test(source));
}

describe('preview isolation inventory', () => {
  it('keeps the canonical reference document present', () => {
    expect(existsSync(manifest.canonicalReference)).toBe(true);
  });

  it('keeps the audit report present', () => {
    expect(existsSync('docs/ops/reports/delivery-system-preview-isolation-audit.md')).toBe(true);
  });

  it('assigns exactly one allowed classification to every resource', () => {
    for (const resource of manifest.resources) {
      expect(CLASSIFICATIONS.has(resource.classification), resource.id).toBe(true);
    }
  });

  it('requires blocking rules for production-shared platform resources', () => {
    const productionShared = manifest.resources.filter((resource) => resource.classification === 'production-shared');
    expect(productionShared.length).toBeGreaterThan(0);
    for (const resource of productionShared) {
      expect(resource.blockingRule, resource.id).toBeTruthy();
    }
  });

  it('documents every mutating Pages Function handler in the manifest', () => {
    const handlers = collectApiHandlers('functions/api').filter((filePath) => {
      if (filePath.includes('/_ai-review/')) {
        return false;
      }
      return handlerHasMutationExport(filePath);
    });

    const manifestHandlers = new Set(
      manifest.mutatingRoutes.flatMap((route) => {
        if (route.handler.endsWith('/**')) {
          const prefix = route.handler.slice(0, -3);
          return handlers.filter((path) => path.startsWith(prefix));
        }
        return [route.handler];
      }),
    );

    const missing = handlers.filter((handler) => !manifestHandlers.has(handler));
    expect(missing, `Add missing mutating handlers: ${missing.join(', ')}`).toEqual([]);
  });

  it('flags documented side-effect GET routes', () => {
    for (const route of manifest.sideEffectGetRoutes) {
      expect(existsSync(route.handler)).toBe(true);
      const listed = manifest.mutatingRoutes.find((entry) => entry.handler === route.handler);
      expect(listed?.sideEffect).toBe(true);
    }
  });

  it('keeps wrangler.toml bound to the audited production D1 id', () => {
    const wrangler = readFileSync('wrangler.toml', 'utf8');
    const d1Resource = manifest.resources.find((resource) => resource.id === 'd1-lgfc-lite');
    expect(d1Resource?.databaseId).toBeTruthy();
    expect(wrangler).toContain(`database_id = "${d1Resource?.databaseId}"`);
    expect(wrangler).not.toMatch(/\[\[env\.[^\]]+\.d1_databases\]\]/);
  });

  it('keeps preview-safe defaults in .env.example', () => {
    const envExample = readFileSync('.env.example', 'utf8');
    expect(envExample).toContain(`MAILCHANNELS_ENABLED=${manifest.safeDefaults.MAILCHANNELS_ENABLED}`);
    expect(envExample).toMatch(/NEXT_PUBLIC_GA_ID=\s*$/m);
  });
});
