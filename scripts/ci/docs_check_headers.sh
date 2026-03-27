#!/usr/bin/env bash
# Fails if any ACTIVE docs markdown file is missing the required YAML-like header keys.
# Emits actionable, file-specific remediation guidance using the canonical header template.

set +u

ROOT="${1:-.}"
TEMPLATE_FILE="${DOCS_HEADER_TEMPLATE_FILE:-$ROOT/docs/templates/markdown-header-template.md}"
FILE_LIST_PATH="${DOCS_HEADER_FILE_LIST:-}"
MISSING_FILE_LIST_OUTPUT="${DOCS_HEADER_MISSING_FILE:-}"
MISSING_DETAILS_OUTPUT="${DOCS_HEADER_MISSING_DETAILS_FILE:-}"

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

render_template_block() {
  if [ -f "$TEMPLATE_FILE" ]; then
    cat "$TEMPLATE_FILE"
  else
    cat <<'TPL'
---
Doc Type: <document type>
Audience: <intended audience>
Authority Level: <authority level>
Owns: <what this document owns>
Does Not Own: <what this document does not own>
Canonical Reference: <canonical doc path>
Last Reviewed: YYYY-MM-DD
---
TPL
  fi
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
missing_details=()

for f in "${FILES[@]}"; do
  [ -z "$f" ] && continue
  [ -f "$f" ] || continue

  first_line="$(head -n 1 "$f")"
  if [ "$first_line" != "---" ]; then
    echo "FAIL docs header fence missing at top of file: $f"
    echo "  remediation: insert canonical template from $TEMPLATE_FILE as the first block in the file"
    missing=1
    missing_files+=("$f")
    missing_details+=("$f|HEADER_FENCE_MISSING|(entire header block)")
    continue
  fi

  header_block="$(awk '
    BEGIN { fence=0 }
    /^---$/ { fence++; print; if (fence==2) exit; next }
    fence==1 { print }
  ' "$f")"

  file_missing=0
  file_missing_keys=()
  for key in "${REQUIRED_KEYS[@]}"; do
    if ! printf '%s\n' "$header_block" | grep -q "^${key}"; then
      file_missing=1
      file_missing_keys+=("$key")
    fi
  done

  if [ "$file_missing" -eq 1 ]; then
    missing=1
    missing_files+=("$f")
    keys_csv="$(IFS=,; echo "${file_missing_keys[*]}")"
    missing_details+=("$f|HEADER_KEYS_MISSING|$keys_csv")

    echo "FAIL docs header keys missing: $f"
    echo "  missing keys: ${file_missing_keys[*]}"
    echo "  remediation: copy template from $TEMPLATE_FILE and populate all fields for this file"
  fi
done

if [ -n "$MISSING_FILE_LIST_OUTPUT" ]; then
  printf '%s\n' "${missing_files[@]}" | awk 'NF' | sort -u > "$MISSING_FILE_LIST_OUTPUT"
fi

if [ -n "$MISSING_DETAILS_OUTPUT" ]; then
  {
    echo "# format: file|issue|details"
    printf '%s\n' "${missing_details[@]}" | awk 'NF' | sort -u
  } > "$MISSING_DETAILS_OUTPUT"
fi

if [ "$missing" -ne 0 ]; then
  echo
  echo "Required docs header template ($TEMPLATE_FILE):"
  echo "---"
  render_template_block
  echo "---"
  echo "Docs header check FAILED."
  exit 1
fi

echo "Docs header check PASSED."
