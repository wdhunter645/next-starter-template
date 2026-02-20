#!/usr/bin/env bash
# Fails if any .md under docs/ is outside approved folder buckets.

set +u

ROOT="${1:-.}"

allowed_re='^docs/(archive|as-built|explanation|governance|how-to|ops|postmortems|project|reference|reports|snapshots|templates|tutorials)(/|$)'

bad=0
while IFS= read -r f; do
  # normalize to repo-relative if possible
  rel="${f#${ROOT}/}"
  if [[ ! "$rel" =~ $allowed_re ]]; then
    echo "FAIL disallowed docs path: $rel"
    bad=1
  fi
done < <(find "$ROOT/docs" -type f -name "*.md" -print)

if [ "$bad" -ne 0 ]; then
  echo "Docs path check FAILED."
  exit 1
fi

echo "Docs path check PASSED."
