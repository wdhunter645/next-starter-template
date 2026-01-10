#!/usr/bin/env node
/**
 * Converts enriched B2 inventory JSON to D1 seed SQL for the photos table.
 * 
 * Reads: data/b2/inventory_enriched.json
 * Writes: .tmp/seed_photos.sql
 * 
 * Strategy: DELETE all existing photos + INSERT from inventory (deterministic seeding)
 * 
 * Handles key variations:
 *   - URL: url OR publicUrl OR public_url
 *   - Description: description OR title OR name
 *   - Memorabilia: is_memorabilia OR derive from type/tags
 * 
 * Usage: node scripts/b2_inventory_to_d1_seed.mjs [input.json] [output.sql]
 */

import fs from "node:fs";
import path from "node:path";

// Default paths
const DEFAULT_INPUT = "data/b2/inventory_enriched.json";
const DEFAULT_OUTPUT = ".tmp/seed_photos.sql";

const inputFile = process.argv[2] || DEFAULT_INPUT;
const outputFile = process.argv[3] || DEFAULT_OUTPUT;

// Ensure .tmp directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Validate input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`ERROR: Input file not found: ${inputFile}`);
  process.exit(2);
}

// Read and parse input
let data;
try {
  const raw = fs.readFileSync(inputFile, "utf8");
  data = JSON.parse(raw);
} catch (err) {
  console.error(`ERROR: Failed to read/parse ${inputFile}: ${err.message}`);
  process.exit(2);
}

const objects = data.objects || [];
if (!Array.isArray(objects)) {
  console.error(`ERROR: Expected 'objects' array in ${inputFile}`);
  process.exit(2);
}

console.log(`Read ${objects.length} objects from ${inputFile}`);

// Helper: SQL escape single quotes
function esc(str) {
  if (str === null || str === undefined) return "";
  return String(str).replace(/'/g, "''");
}

// Helper: Extract URL from various fields
function extractUrl(obj) {
  return obj.url || obj.publicUrl || obj.public_url || null;
}

// Helper: Extract description from various fields
function extractDescription(obj) {
  return obj.description || obj.title || obj.name || "";
}

// Helper: Determine if memorabilia
function extractIsMemorabilia(obj) {
  // Direct field
  if (obj.is_memorabilia !== undefined && obj.is_memorabilia !== null) {
    return obj.is_memorabilia ? 1 : 0;
  }
  
  // Derive from type field
  if (obj.type === "memorabilia") {
    return 1;
  }
  
  // Derive from tags (if tags contain "memorabilia")
  if (obj.tags && typeof obj.tags === "string") {
    if (/memorabilia/i.test(obj.tags)) {
      return 1;
    }
  }
  
  // Derive from key path
  const key = obj.key || "";
  if (/memorabilia/i.test(key)) {
    return 1;
  }
  
  return 0;
}

// Build SQL statements
const sqlLines = [];

// Header
sqlLines.push("-- B2 Inventory → D1 Photos Seed");
sqlLines.push(`-- Generated: ${new Date().toISOString()}`);
sqlLines.push(`-- Source: ${inputFile}`);
sqlLines.push("");
sqlLines.push("BEGIN TRANSACTION;");
sqlLines.push("");

// Delete existing photos (deterministic seeding)
sqlLines.push("-- Clear existing photos for deterministic seeding");
sqlLines.push("DELETE FROM photos;");
sqlLines.push("");

// Insert photos
let insertCount = 0;
for (const obj of objects) {
  const url = extractUrl(obj);
  
  // Skip objects without a URL
  if (!url) {
    continue;
  }
  
  const description = extractDescription(obj);
  const isMemorabilia = extractIsMemorabilia(obj);
  
  sqlLines.push(
    `INSERT INTO photos (url, description, is_memorabilia) VALUES ('${esc(url)}', '${esc(description)}', ${isMemorabilia});`
  );
  insertCount++;
}

sqlLines.push("");
sqlLines.push("COMMIT;");
sqlLines.push("");
sqlLines.push(`-- Inserted ${insertCount} photos`);

// Write output
fs.writeFileSync(outputFile, sqlLines.join("\n"), "utf8");
console.log(`✓ Generated SQL with ${insertCount} INSERT statements → ${outputFile}`);

// Exit with error if no photos were inserted
if (insertCount === 0) {
  console.error("WARNING: No photos with URLs found in inventory");
  process.exit(1);
}
