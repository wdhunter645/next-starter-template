#!/usr/bin/env bash
# Fails if any ACTIVE docs markdown file is missing the required YAML-like header keys.

set +u

ROOT="${1:-.}"
TEMPLATE_FILE="${DOCS_HEADER_TEMPLATE_FILE:-$ROOT/docs/templates/markdown-header-template.md}"
FILE_LIST_PATH="${DOCS_HEADER_FILE_LIST:-}"
MISSING_FILE_LIST_OUTPUT="${DOCS_HEADER_MISSING_FILE:-}"

resolve_required_keys() {
  local template="$1"

  if [ -f "$template" ]; then
    awk '
      BEGIN { fence=0 }
      /^---$/ { fence++; next }
      fence == 1 && /^[A-Za-z][A-Za-z ]*:/ {
        sub(/:.*/, ":")
        print
      }
      fence >= 2 { exit }
    ' "$template"
    return
  fi

  # Backward-compatible fallback if no canonical template file exists.
  cat <<'KEYS'
Doc Type:
Audience:
Authority Level:
Owns:
Does Not Own:
Canonical Reference:
Last Reviewed:
KEYS
}

mapfile -t REQUIRED_KEYS < <(resolve_required_keys "$TEMPLATE_FILE")

if [ "${#REQUIRED_KEYS[@]}" -eq 0 ]; then
  echo "FAIL no required documentation header keys were resolved."
  exit 1
fi

if [ -n "$FILE_LIST_PATH" ] && [ -f "$FILE_LIST_PATH" ]; then
  mapfile -t FILES < "$FILE_LIST_PATH"
else
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
fi

missing=0
missing_files=()
for f in "${FILES[@]}"; do
  [ -z "$f" ] && continue
  [ -f "$f" ] || continue

  if ! grep -q '^---$' "$f"; then
    echo "FAIL header fence missing: $f"
    missing=1
    missing_files+=("$f")
    continue
  fi

  file_missing=0
  for key in "${REQUIRED_KEYS[@]}"; do
    if ! grep -q "^${key}" "$f"; then
      echo "FAIL header key missing (${key}): $f"
      missing=1
      file_missing=1
    fi
  done

  if [ "$file_missing" -eq 1 ]; then
    missing_files+=("$f")
  fi
done

if [ -n "$MISSING_FILE_LIST_OUTPUT" ]; then
  printf '%s\n' "${missing_files[@]}" | awk 'NF' | sort -u > "$MISSING_FILE_LIST_OUTPUT"
fi

if [ "$missing" -ne 0 ]; then
  echo "Docs header check FAILED."
  exit 1
fi

echo "Docs header check PASSED."
