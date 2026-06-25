#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('out');
const source = path.join(outDir, 'ai-review');
const target = path.join(outDir, '_ai-review');

if (!fs.existsSync(source)) {
  process.exit(0);
}

if (fs.existsSync(target)) {
  fs.rmSync(target, { recursive: true, force: true });
}

fs.renameSync(source, target);
