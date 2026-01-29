#!/usr/bin/env bash
set -euo pipefail

#
# D1 Seeding Wrapper - End-to-end bootstrap
#
# Usage:
#   ./scripts/d1-seed-all.sh [local|production]
#
# This script:
# 1. Applies all migrations
# 2. Seeds all tables with 15+ rows
# 3. Prints final row counts
#

ENV="${1:-local}"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  D1 End-to-End Bootstrap                                       ║"
echo "║  Environment: ${ENV}                                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Apply migrations
echo "📦 Step 1/3: Applying migrations..."
if [ "$ENV" = "local" ]; then
  npx wrangler d1 migrations apply lgfc_lite --local
else
  npx wrangler d1 migrations apply lgfc_lite --env "$ENV"
fi
echo "✅ Migrations applied"
echo ""

# Step 2: Seed data
echo "🌱 Step 2/3: Seeding data..."
if [ "$ENV" = "local" ]; then
  node scripts/d1-seed-all.mjs
else
  node scripts/d1-seed-all.mjs --env "$ENV"
fi
echo ""

# Step 3: Report
echo "📊 Step 3/3: Generating row count report..."
./scripts/d1-report.sh "$ENV"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ Bootstrap complete!                                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
