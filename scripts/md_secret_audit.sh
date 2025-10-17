#!/usr/bin/env bash
set -euo pipefail

# md_secret_audit.sh
# Scans ONLY changed Markdown files in a PR for likely secrets.
# Exits non-zero with GitHub-compatible error annotations if findings are detected.
# DEBUG=1 prints the changed files and first 200 chars of flagged lines.

BASE_SHA="${BASE:-}"
HEAD_SHA="${HEAD:-}"
DEBUG="${DEBUG:-0}"

# Prefer explicit SHAs passed in (from workflow). Fallbacks kept for local use.
if [[ -z "${BASE_SHA}" || -z "${HEAD_SHA}" ]]; then
  if [[ -n "${GITHUB_EVENT_NAME:-}" && "${GITHUB_EVENT_NAME}" == "pull_request" && -n "${GITHUB_BASE_REF:-}" && -n "${GITHUB_SHA:-}" ]]; then
    git fetch --no-tags --depth=1 origin "${GITHUB_BASE_REF}" || true
    BASE_SHA="origin/${GITHUB_BASE_REF}"
    HEAD_SHA="${GITHUB_SHA}"
  else
    BASE_SHA="${BASE_SHA:-origin/main}"
    HEAD_SHA="${HEAD_SHA:-HEAD}"
    git fetch --no-tags --depth=1 origin main || true
  fi
fi

# Collect changed markdown files in PR diff
mapfile -t MD_FILES < <(git diff --name-only "${BASE_SHA}" "${HEAD_SHA}" -- '*.md' ':!docs/archive/*')

if [[ "${#MD_FILES[@]}" -eq 0 ]]; then
  echo "No markdown changes detected; skipping audit."
  exit 0
fi

# Debug print file list
if [[ "$DEBUG" == "1" ]]; then
  echo "Changed markdown files:"
  printf ' - %s\n' "${MD_FILES[@]}"
fi

# High-signal patterns (keep tight to reduce noise)
JWT_RGX='eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'
GHP_RGX='ghp_[A-Za-z0-9]{36}'
URL_TOKEN_RGX='[?&](access|auth|token|sig|signature)=[^&[:space:]]+'
KEYWORDS_RGX='(?i)(supabase|service[_-]?role|anon[_-]?key|api[_-]?key|secret|password|b2_(key|app|secret)|cloudflare_(api|token)|vercel_(token|api)|aws_(access|secret)_key|google_(api|client)_secret|client_secret)'

# Ignore placeholders/examples and obvious docs
IGNORE_HINTS_RGX='(?i)(REDACTED|PLACEHOLDER|EXAMPLE|DUMMY|CHANGEME|YOUR_|<.+>|xxxx|example\.com|lorem ipsum)'

fail=0
report=""

annotate() {
  local file="$1"
  local line_no="$2"
  local msg="$3"
  echo "::error file=${file},line=${line_no}::${msg}"
}

# Track code-fence state to avoid scanning code blocks verbatim
in_fence=0
fence_delim=""

scan_file() {
  local file="$1"
  local lineno=0
  while IFS= read -r line; do
    lineno=$((lineno+1))
    # Toggle code fence state
    if [[ "$line" =~ ^\`\`\` ]]; then
      if [[ $in_fence -eq 0 ]]; then in_fence=1; fence_delim="${line}"; else in_fence=0; fence_delim=""; fi
      continue
    fi
    # Skip quoted blocks for signal reduction
    [[ "$line" =~ ^\> ]] && continue
    # Skip lines inside code fences
    [[ $in_fence -eq 1 ]] && continue
    if echo "$line" | grep -Pq "${IGNORE_HINTS_RGX}"; then
      continue
    fi
    if echo "$line" | grep -Eq "${JWT_RGX}" \
       || echo "$line" | grep -Eq "${GHP_RGX}" \
       || echo "$line" | grep -Eq "${URL_TOKEN_RGX}" \
       || echo "$line" | grep -Pq "${KEYWORDS_RGX}"; then
      annotate "$file" "$lineno" "Potential secret or sensitive token detected"
      if [[ "$DEBUG" == "1" ]]; then
        report+="${file}:${lineno}: ${line:0:200}\n"
      else
        report+="${file}:${lineno}\n"
      fi
      fail=1
    fi
  done < "$file"
}

for f in "${MD_FILES[@]}"; do
  [[ -f "$f" ]] && scan_file "$f"
done

if [[ $fail -ne 0 ]]; then
  echo -e "\n==== Secret Audit Findings ===="
  echo -e "$report"
  echo "One or more suspicious lines detected. Review and redact or confirm false positives."
  exit 1
fi

echo "Markdown secret audit passed."
exit 0
