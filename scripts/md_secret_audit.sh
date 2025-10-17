#!/usr/bin/env bash
set -euo pipefail

# md_secret_audit.sh
# Scans ONLY changed Markdown files in a PR for likely secrets.
# Exits non-zero with GitHub-compatible error annotations if findings are detected.
#
# CI usage:
#   bash scripts/md_secret_audit.sh
# Local (optional):
#   BASE=origin/main HEAD=HEAD bash scripts/md_secret_audit.sh

BASE_SHA="${BASE:-}"
HEAD_SHA="${HEAD:-}"

# Prefer base/head refs in GitHub Actions
if [[ -z "${BASE_SHA}" || -z "${HEAD_SHA}" ]]; then
  if [[ -n "${GITHUB_BASE_REF:-}" && -n "${GITHUB_SHA:-}" ]]; then
    git fetch --no-tags --depth=1 origin "${GITHUB_BASE_REF}"
    BASE_SHA="origin/${GITHUB_BASE_REF}"
    HEAD_SHA="${GITHUB_SHA}"
  else
    BASE_SHA="${BASE_SHA:-origin/main}"
    HEAD_SHA="${HEAD_SHA:-HEAD}"
    git fetch --no-tags --depth=1 origin main || true
  fi
fi

# Collect changed markdown files
mapfile -t MD_FILES < <(git diff --name-only "${BASE_SHA}" "${HEAD_SHA}" -- '*.md' ':!docs/archive/*' ':!.github/*')

if [[ "${#MD_FILES[@]}" -eq 0 ]]; then
  echo "No markdown changes detected; skipping audit."
  exit 0
fi

# High-signal patterns (keep tight to reduce noise)
JWT_RGX='eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'
GHP_RGX='ghp_[A-Za-z0-9]{36}'
URL_TOKEN_RGX='[?&](access|auth|token|sig|signature)=[^&[:space:]]+'
KEYWORDS_RGX='(?i)(supabase|service[_-]?role|anon[_-]?key|api[_-]?key|secret|password|b2_(key|app|secret)|cloudflare_(api|token)|vercel_(token|api)|aws_(access|secret)_key|google_(api|client)_secret|client_secret)'

# Ignore placeholders/examples
IGNORE_HINTS_RGX='(?i)(REDACTED|PLACEHOLDER|EXAMPLE|DUMMY|CHANGEME|YOUR_|<.+>|xxxx|example\.com)'

fail=0
report=""

annotate() {
  local file="$1"
  local line_no="$2"
  local msg="$3"
  echo "::error file=${file},line=${line_no}::${msg}"
}

scan_file() {
  local file="$1"
  local lineno=0
  while IFS= read -r line; do
    lineno=$((lineno+1))
    [[ "$line" =~ ^\> ]] && continue
    [[ "$line" =~ ^\`\`\` ]] && continue
    if echo "$line" | grep -Eq "${IGNORE_HINTS_RGX}"; then
      continue
    fi
    if echo "$line" | grep -Eq "${JWT_RGX}" \
       || echo "$line" | grep -Eq "${GHP_RGX}" \
       || echo "$line" | grep -Eq "${URL_TOKEN_RGX}" \
       || echo "$line" | grep -Eq "${KEYWORDS_RGX}"; then
      annotate "$file" "$lineno" "Potential secret or sensitive token detected"
      report+="${file}:${lineno}: ${line}\n"
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
