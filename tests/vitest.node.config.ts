import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: path.resolve(rootDir, 'vitest.setup.ts'),
  },
});
