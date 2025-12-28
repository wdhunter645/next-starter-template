#!/usr/bin/env node
/**
 * Repo Structure Invariant Checker
 * 
 * Ensures the repository maintains a clean, single-tier structure without
 * nested wrapper folders or duplicate Next.js app roots.
 * 
 * This script prevents common repository structure regressions such as:
 * - Accidental unzipping of archives into nested folders
 * - Multiple package.json files at shallow depths
 * - Secondary Next.js app roots
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

/**
 * Find all package.json files at depth <= 2, excluding node_modules
 */
function findPackageJsonFiles(root, currentDepth = 0, maxDepth = 2) {
  const results = [];
  
  if (currentDepth > maxDepth) {
    return results;
  }

  try {
    const entries = readdirSync(root, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip node_modules and hidden directories (except .github for edge cases)
      if (entry.name === 'node_modules' || 
          (entry.name.startsWith('.') && entry.name !== '.github')) {
        continue;
      }

      const fullPath = join(root, entry.name);

      if (entry.isDirectory()) {
        // Recursively search subdirectories
        results.push(...findPackageJsonFiles(fullPath, currentDepth + 1, maxDepth));
      } else if (entry.name === 'package.json') {
        results.push({
          path: fullPath,
          relativePath: fullPath.replace(REPO_ROOT + '/', ''),
          depth: currentDepth,
        });
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error reading directory ${root}: ${error.message}${colors.reset}`);
  }

  return results;
}

/**
 * Check if a directory contains a Next.js configuration file
 */
function hasNextConfig(dirPath) {
  const nextConfigFiles = [
    'next.config.js',
    'next.config.mjs',
    'next.config.ts',
    'next.config.cjs',
  ];

  return nextConfigFiles.some(filename => existsSync(join(dirPath, filename)));
}

/**
 * Find all directories that appear to be Next.js app roots
 * (contain both package.json and next.config.*)
 */
function findNextAppRoots(packageJsonFiles) {
  return packageJsonFiles
    .filter(({ path }) => {
      const dirPath = dirname(path);
      return hasNextConfig(dirPath);
    })
    .map(({ path, relativePath, depth }) => ({
      path: dirname(path),
      relativePath: dirname(relativePath),
      depth,
    }));
}

/**
 * Check for common nested wrapper folder patterns
 */
function findNestedWrapperFolders(root) {
  const suspiciousPatterns = [
    /next-starter-template-main/i,
    /next-starter-template-.*-main/i,
    /^repo$/i,
    /^project$/i,
  ];

  const wrappers = [];

  try {
    const entries = readdirSync(root, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'node_modules' || entry.name.startsWith('.')) {
        continue;
      }

      const matches = suspiciousPatterns.some(pattern => pattern.test(entry.name));
      if (matches) {
        const fullPath = join(root, entry.name);
        // Check if this directory also contains a package.json
        if (existsSync(join(fullPath, 'package.json'))) {
          wrappers.push({
            name: entry.name,
            path: fullPath,
          });
        }
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error checking for wrapper folders: ${error.message}${colors.reset}`);
  }

  return wrappers;
}

/**
 * Main validation function
 */
function checkRepoStructure() {
  console.log(`${colors.blue}======================================${colors.reset}`);
  console.log(`${colors.blue}Repo Structure Invariant Check${colors.reset}`);
  console.log(`${colors.blue}======================================${colors.reset}\n`);

  let hasErrors = false;
  const errors = [];
  const warnings = [];

  // Check 1: package.json must exist at repo root
  console.log('✓ Checking for package.json at repo root...');
  const rootPackageJson = join(REPO_ROOT, 'package.json');
  if (!existsSync(rootPackageJson)) {
    errors.push('CRITICAL: package.json not found at repository root');
    hasErrors = true;
  } else {
    console.log(`  ${colors.green}✓ Found package.json at root${colors.reset}\n`);
  }

  // Check 2: Find all package.json files at depth <= 2
  console.log('✓ Scanning for package.json files (depth <= 2, excluding node_modules)...');
  const packageJsonFiles = findPackageJsonFiles(REPO_ROOT);
  
  console.log(`  Found ${packageJsonFiles.length} package.json file(s):\n`);
  packageJsonFiles.forEach(({ relativePath, depth }) => {
    console.log(`    - ${relativePath} (depth: ${depth})`);
  });
  console.log();

  if (packageJsonFiles.length > 1) {
    errors.push(`Found ${packageJsonFiles.length} package.json files at depth <= 2 (expected: 1)`);
    errors.push('Multiple package.json files suggest a nested or duplicate project structure');
    hasErrors = true;
  } else if (packageJsonFiles.length === 1) {
    console.log(`  ${colors.green}✓ Only one package.json found (expected)${colors.reset}\n`);
  }

  // Check 3: Find Next.js app roots
  console.log('✓ Checking for Next.js app roots (package.json + next.config.*)...');
  const nextAppRoots = findNextAppRoots(packageJsonFiles);
  
  console.log(`  Found ${nextAppRoots.length} Next.js app root(s):\n`);
  nextAppRoots.forEach(({ relativePath, depth }) => {
    console.log(`    - ${relativePath} (depth: ${depth})`);
  });
  console.log();

  if (nextAppRoots.length > 1) {
    errors.push(`Found ${nextAppRoots.length} Next.js app roots (expected: 1)`);
    errors.push('Multiple Next.js roots indicate a duplicate app structure');
    hasErrors = true;
  } else if (nextAppRoots.length === 1 && nextAppRoots[0].depth === 0) {
    console.log(`  ${colors.green}✓ Single Next.js app root at repository root${colors.reset}\n`);
  } else if (nextAppRoots.length === 0) {
    warnings.push('No Next.js app root detected (this may be expected if not a Next.js repo)');
  }

  // Check 4: Look for nested wrapper folders
  console.log('✓ Checking for nested wrapper folders...');
  const wrapperFolders = findNestedWrapperFolders(REPO_ROOT);
  
  if (wrapperFolders.length > 0) {
    console.log(`  ${colors.red}✗ Found ${wrapperFolders.length} suspicious wrapper folder(s):${colors.reset}\n`);
    wrapperFolders.forEach(({ name, path }) => {
      console.log(`    - ${name} (${path})`);
    });
    console.log();
    errors.push('Suspicious wrapper folders detected (likely from bad unzip operation)');
    hasErrors = true;
  } else {
    console.log(`  ${colors.green}✓ No nested wrapper folders detected${colors.reset}\n`);
  }

  // Summary
  console.log(`${colors.blue}======================================${colors.reset}`);
  console.log(`${colors.blue}Summary${colors.reset}`);
  console.log(`${colors.blue}======================================${colors.reset}\n`);

  if (warnings.length > 0) {
    console.log(`${colors.yellow}Warnings:${colors.reset}`);
    warnings.forEach(warning => console.log(`  ⚠ ${warning}`));
    console.log();
  }

  if (hasErrors) {
    console.log(`${colors.red}Errors:${colors.reset}`);
    errors.forEach(error => console.log(`  ✗ ${error}`));
    console.log();
    console.log(`${colors.red}❌ Repository structure check FAILED${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}✅ All repository structure checks PASSED${colors.reset}\n`);
    process.exit(0);
  }
}

// Run the check
checkRepoStructure();
