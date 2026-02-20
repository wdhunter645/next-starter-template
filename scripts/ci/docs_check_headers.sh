#!/usr/bin/env bash
# Fails if any ACTIVE docs markdown file is missing the required YAML-like header keys.

set +u

ROOT="${1:-.}"

# Active docs buckets only (exclude historical/archives/snapshots)
mapfile -t FILES < <(
  find "$ROOT/docs/reference" "$ROOT/docs/governance" "$ROOT/docs/how-to" "$ROOT/docs/explanation" "$ROOT/docs/ops" "$ROOT/docs/templates" \
    -type f -name "*.md" \
    ! -path "$ROOT/docs/archive/*" \
    ! -path "$ROOT/docs/as-built/*" \
    ! -path "$ROOT/docs/postmortems/*" \
    ! -path "$ROOT/docs/reports/*" \
    ! -path "$ROOT/docs/snapshots/*" \
    -print
)

missing=0
for f in "${FILES[@]}"; do
  if ! grep -q '^---$' "$f"; then
    echo "FAIL header fence missing: $f"
    missing=1
    continue
  fi

  for key in "Doc Type:" "Audience:" "Authority Level:" "Owns:" "Does Not Own:" "Canonical Reference:" "Last Reviewed:"; do
    if ! grep -q "^${key}" "$f"; then
      echo "FAIL header key missing (${key}): $f"
      missing=1
    fi
  done
done

if [ "$missing" -ne 0 ]; then
  echo "Docs header check FAILED."
  exit 1
fi

echo "Docs header check PASSED."
