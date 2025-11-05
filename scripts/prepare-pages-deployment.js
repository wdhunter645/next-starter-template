#!/usr/bin/env node
/**
 * Prepare OpenNext build output for Cloudflare Pages deployment
 * 
 * This script creates a Pages-compatible deployment structure from OpenNext output:
 * - Copies static assets from .open-next/assets to .open-next/worker
 * - Copies worker.js to .open-next/worker/_worker.js for Pages Functions
 * - Copies supporting directories needed by the worker
 * 
 * Compatible with @opennextjs/cloudflare@1.11.0
 * 
 * If this script fails after upgrading @opennextjs/cloudflare, check:
 * 1. The output directory structure in .open-next/
 * 2. The list of support directories (lines 45-53)
 * 3. The OpenNext Cloudflare changelog for breaking changes
 */

const fs = require('fs');
const path = require('path');

const sourceAssetsDir = path.join(__dirname, '../.open-next/assets');
const sourceWorkerFile = path.join(__dirname, '../.open-next/worker.js');
const targetDir = path.join(__dirname, '../.open-next/worker');

// Verify required source files exist
if (!fs.existsSync(sourceAssetsDir)) {
  console.error('❌ Error: .open-next/assets directory not found');
  console.error('Please run "npx opennextjs-cloudflare build" first');
  process.exit(1);
}

if (!fs.existsSync(sourceWorkerFile)) {
  console.error('❌ Error: .open-next/worker.js file not found');
  console.error('Please run "npx opennextjs-cloudflare build" first');
  process.exit(1);
}

// Ensure target directory exists and is clean
if (fs.existsSync(targetDir)) {
  console.log('🧹 Cleaning previous build...');
  fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir, { recursive: true });

// Copy static assets
console.log('📦 Copying static assets...');
fs.cpSync(sourceAssetsDir, targetDir, { recursive: true });

// Copy worker.js as _worker.js
console.log('⚙️ Copying worker...');
fs.copyFileSync(sourceWorkerFile, path.join(targetDir, '_worker.js'));

// Copy supporting directories needed by the worker
// Based on @opennextjs/cloudflare@1.11.0 output structure
// These directories contain runtime dependencies for the Cloudflare Worker
const supportDirs = [
  'cloudflare',           // Compiled Cloudflare runtime utilities (JS only)
  'cloudflare-templates', // Template files and TypeScript definitions
  'middleware',           // Next.js middleware handlers
  'server-functions',     // Server-side rendering functions
  '.build',              // Build-time generated files
  'cache',               // Cache handling utilities
  'dynamodb-provider'    // DynamoDB-compatible cache provider
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
