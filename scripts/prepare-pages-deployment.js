#!/usr/bin/env node
/**
 * Prepare OpenNext build output for Cloudflare Pages deployment
 * 
 * This script creates a Pages-compatible deployment structure from OpenNext output:
 * - Copies static assets from .open-next/assets to .open-next/worker
 * - Copies worker.js to .open-next/worker/_worker.js for Pages Functions
 * - Copies supporting directories needed by the worker
 */

const fs = require('fs');
const path = require('path');

const sourceAssetsDir = path.join(__dirname, '../.open-next/assets');
const sourceWorkerFile = path.join(__dirname, '../.open-next/worker.js');
const targetDir = path.join(__dirname, '../.open-next/worker');

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy static assets
console.log('📦 Copying static assets...');
fs.cpSync(sourceAssetsDir, targetDir, { recursive: true });

// Copy worker.js as _worker.js
console.log('⚙️ Copying worker...');
fs.copyFileSync(sourceWorkerFile, path.join(targetDir, '_worker.js'));

// Copy supporting directories needed by the worker
const supportDirs = [
  'cloudflare',
  'cloudflare-templates', 
  'middleware',
  'server-functions',
  '.build',
  'cache',
  'dynamodb-provider'
];

supportDirs.forEach(dir => {
  const source = path.join(__dirname, '../.open-next', dir);
  const target = path.join(targetDir, dir);
  if (fs.existsSync(source)) {
    console.log(`📁 Copying ${dir}...`);
    fs.cpSync(source, target, { recursive: true });
  }
});

console.log('✅ Pages deployment structure ready in .open-next/worker/');
