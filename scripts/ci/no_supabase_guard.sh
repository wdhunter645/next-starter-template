#!/usr/bin/env bash
set -euo pipefail

needle="supa""base"
self_exclude="no_${needle}_guard.sh"

if grep -Rin \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=out \
  --exclude="$self_exclude" \
  -- "$needle" .; then
  echo "ERROR: forbidden backend reference detected"
  exit 1
fi

echo "PASS: no ${needle} references"
