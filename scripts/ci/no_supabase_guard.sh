#!/usr/bin/env bash
set -euo pipefail

needle="supa""base"
self_exclude="no_${needle}_guard.sh"

if grep -rinI \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=out \
  --exclude="$self_exclude" \
  -- "$needle" .; then
  echo "ERROR: forbidden backend reference detected" >&2
  exit 1
else
  # grep returns 1 for no-match, 2+ for errors; detect the latter
  if [ $? -ne 1 ]; then
    echo "ERROR: grep execution failed" >&2
    exit 1
  fi
fi
  exit 1
fi

echo "PASS: no ${needle} references"
