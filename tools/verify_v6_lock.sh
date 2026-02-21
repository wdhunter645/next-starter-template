#!/usr/bin/env bash
# LGFC v6 Lock Verification (repo governance check)
#
# IMPORTANT:
# - No `set -euo pipefail` (Codespaces stability rule).
# - This verifier should reflect APPROVED reality, not aspirational drift.
# - It creates an audit report under ./audits and exits non-zero on failures.

ROOT_DIR="$(pwd)"
REPORT_DIR="${ROOT_DIR}/audits"
TS="$(date +"%Y%m%d_%H%M%S")"
REPORT_FILE="${REPORT_DIR}/verify_v6_lock_${TS}.txt"

mkdir -p "${REPORT_DIR}"

pass_count=0
fail_count=0
fail_list=()

log() { printf "%s\n" "$*" | tee -a "${REPORT_FILE}"; }
hr() { log "------------------------------------------------------------------"; }

mark_pass() { pass_count=$((pass_count+1)); log "✅ PASS | $*"; }
mark_fail() { fail_count=$((fail_count+1)); fail_list+=("$*"); log "❌ FAIL | $*"; }

# Grep helpers (quiet). Patterns are ERE.
gq() { grep -R -I -n -E -- "$1" "$2" >/dev/null 2>&1; }   # pattern, path

# Find an anchor file anywhere (prefer docs/)
find_anchor_any() {
  # args: list of filenames (space-separated)
  for name in "$@"; do
    hit="$(find docs -type f -name "$name" 2>/dev/null | head -n 1 || true)"
    if [ -n "$hit" ]; then echo "$hit"; return 0; fi
    hit="$(find . -type f -name "$name" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | head -n 1 || true)"
    if [ -n "$hit" ]; then echo "$hit"; return 0; fi
  done
  echo ""
  return 1
}

begin() {
  log "LGFC v6 Lock Verification"
  log "Timestamp: ${TS}"
  log "Repo: $(basename "${ROOT_DIR}")"
  hr
}

begin

# ------------------------------------------------------------------
# 0) Anchor docs exist
# ------------------------------------------------------------------
hr
log "0) Checking anchor docs exist (process/governance/v6 HTML)"

anchors_ok=true
ANCHOR_PROCESS="$(find_anchor_any "PR_PROCESS.md" "website-PR-process.md" "PR-process.md")"
ANCHOR_GOV="$(find_anchor_any "PR_GOVERNANCE.md" "website-PR-governance.md" "PR-governance.md")"
ANCHOR_V6_HTML="$(find_anchor_any "lgfc-homepage-legacy-v6.html")"

if [ -n "${ANCHOR_PROCESS}" ] && [ -f "${ANCHOR_PROCESS}" ]; then
  mark_pass "Anchor present: ${ANCHOR_PROCESS}"
else
  anchors_ok=false
  mark_fail "Missing anchor (expected one of: PR_PROCESS.md, website-PR-process.md): ${ANCHOR_PROCESS}"
fi

if [ -n "${ANCHOR_GOV}" ] && [ -f "${ANCHOR_GOV}" ]; then
  mark_pass "Anchor present: ${ANCHOR_GOV}"
else
  anchors_ok=false
  mark_fail "Missing anchor (expected one of: PR_GOVERNANCE.md, website-PR-governance.md): ${ANCHOR_GOV}"
fi

if [ -n "${ANCHOR_V6_HTML}" ] && [ -f "${ANCHOR_V6_HTML}" ]; then
  mark_pass "Anchor present: ${ANCHOR_V6_HTML}"
else
  anchors_ok=false
  mark_fail "Missing anchor: ${ANCHOR_V6_HTML}"
fi

if [ "${anchors_ok}" != "true" ]; then
  hr
  log "Aborting: required anchors missing."
  log "Report saved to: ${REPORT_FILE}"
  exit 2
fi

# ------------------------------------------------------------------
# 1) globals.css tokens & utilities
# ------------------------------------------------------------------
hr
log "1) globals.css contains tokens/utilities: --lgfc-blue, .section-gap, .title-lgfc, .joinBanner, .topWhitespace"

CSS="src/app/globals.css"
if [ ! -f "${CSS}" ]; then
  mark_fail "File missing: ${CSS}"
else
  gq "--lgfc-blue" "${CSS}" && mark_pass "--lgfc-blue present" || mark_fail "--lgfc-blue missing"
  gq "\.section-gap" "${CSS}" && mark_pass ".section-gap present" || mark_fail ".section-gap missing"
  gq "\.title-lgfc" "${CSS}" && mark_pass ".title-lgfc present" || mark_fail ".title-lgfc missing"
  gq "\.joinBanner" "${CSS}" && mark_pass ".joinBanner present" || mark_fail ".joinBanner missing"
  gq "\.topWhitespace" "${CSS}" && mark_pass ".topWhitespace present" || mark_fail ".topWhitespace missing"
fi

# ------------------------------------------------------------------
# 2) Header: non-sticky + approved structure (NOT absolute-position requirements)
# ------------------------------------------------------------------
hr
log "2) Header non-sticky and approved structure; topWhitespace present under header"

HDR_CANDIDATES=("src/components/Header.tsx" "src/app/components/Header.tsx")
HDR_FILE=""
for f in "${HDR_CANDIDATES[@]}"; do
  if [ -f "$f" ]; then HDR_FILE="$f"; break; fi
done

if [ -z "${HDR_FILE}" ]; then
  mark_fail "Header component not found (looked in ${HDR_CANDIDATES[*]})"
else
  # No sticky usage in component code
  if gq "sticky|position:\s*['\"]?sticky" "${HDR_FILE}"; then
    mark_fail "Header uses sticky positioning (remove sticky) in ${HDR_FILE}"
  else
    mark_pass "Header is non-sticky (${HDR_FILE})"
  fi

  # Approved structural invariants (current implementation)
  if gq "className=\{styles\.left\}" "${HDR_FILE}" && gq "<nav className=\{styles\.center\}" "${HDR_FILE}" && gq "className=\{styles\.right\}" "${HDR_FILE}"; then
    mark_pass "Header structure present (left + center + right wrappers)"
  else
    mark_fail "Header structure missing (expected className={styles.left}, nav className={styles.center}, className={styles.right})"
  fi

  # Hamburger aria-controls id invariant
  if gq "aria-controls=\"hamburger-menu\"" "${HDR_FILE}"; then
    mark_pass "Header hamburger aria-controls targets hamburger-menu"
  else
    mark_fail "Header hamburger aria-controls should target 'hamburger-menu' (drift risk)"
  fi
fi

# topWhitespace div appears near header usage (allow either in layout or page)
PAGE_MAIN="src/app/page.tsx"
LAYOUT_MAIN="src/app/layout.tsx"
if [ -f "${PAGE_MAIN}" ] && gq "className=.*topWhitespace" "${PAGE_MAIN}" ; then
  mark_pass "topWhitespace rendered under header (page.tsx)"
elif [ -f "${LAYOUT_MAIN}" ] && gq "className=.*topWhitespace" "${LAYOUT_MAIN}" ; then
  mark_pass "topWhitespace rendered under header (layout.tsx)"
else
  mark_fail "No .topWhitespace div found beneath header (page.tsx or layout.tsx)"
fi

# ------------------------------------------------------------------
# 3) WeeklyMatchup title exact text + title-lgfc class (in component, not necessarily homepage)
# ------------------------------------------------------------------
hr
log "3) WeeklyMatchup title exact text + 'title-lgfc' class"

WM="src/components/WeeklyMatchup.tsx"
REQ_TITLE="Weekly Photo Matchup\. Vote for your favorite!"
if [ -f "${WM}" ]; then
  if gq "${REQ_TITLE}" "${WM}"; then
    mark_pass "Weekly title exact text present"
  else
    mark_fail "Weekly title text mismatch: expected \"Weekly Photo Matchup. Vote for your favorite!\""
  fi
  if gq "className=.*title-lgfc" "${WM}"; then
    mark_pass "Weekly title uses class 'title-lgfc'"
  else
    mark_fail "Weekly title missing 'title-lgfc' class"
  fi
else
  mark_fail "WeeklyMatchup component missing: ${WM}"
fi

# ------------------------------------------------------------------
# 4) Homepage section spacing + Join banner copy/class (validated from JoinCTA component)
# ------------------------------------------------------------------
hr
log "4) Homepage section spacing + Join banner wrapper/copy (JoinCTA component)"

if [ -f "${PAGE_MAIN}" ]; then
  GAP_COUNT="$(grep -R -I -n -E "className=.*section-gap" "${PAGE_MAIN}" | wc -l | tr -d ' ')"
  if [ "${GAP_COUNT}" -ge 5 ]; then
    mark_pass ".section-gap applied to ≥5 sections on homepage"
  else
    mark_fail ".section-gap count too low in ${PAGE_MAIN} (found ${GAP_COUNT}, need ≥5)"
  fi

  # SocialWall presence (component call)
  if gq "<SocialWall\s*/>" "${PAGE_MAIN}" || gq "<SocialWall>" "${PAGE_MAIN}"; then
    mark_pass "SocialWall component rendered in page.tsx"
  else
    mark_fail "SocialWall component not rendered in page.tsx"
  fi
else
  mark_fail "Home page file missing: ${PAGE_MAIN}"
fi

JOIN="src/components/JoinCTA.tsx"
REQ_JOIN_COPY="Become a member\. Get access to the Gehrig library, media archive, memorabilia archive, group discussions, and more\."
if [ -f "${JOIN}" ]; then
  if gq "className=\"joinBanner" "${JOIN}" || gq "className=\{\"joinBanner" "${JOIN}" || gq "className=.*joinBanner" "${JOIN}"; then
    mark_pass "JoinCTA uses .joinBanner wrapper"
  else
    mark_fail "JoinCTA missing .joinBanner wrapper class (wrapper drift risk)"
  fi

  if gq "${REQ_JOIN_COPY}" "${JOIN}"; then
    mark_pass "JoinCTA uses approved copy"
  else
    mark_fail "JoinCTA text does not match approved copy"
  fi

  # Guardrail: legacy wrapper name should not be reintroduced
  if gq "join-banner([^_]|$)" "${JOIN}"; then
    mark_fail "JoinCTA contains legacy 'join-banner' wrapper name (should remain retired for wrapper)"
  else
    mark_pass "JoinCTA does not contain legacy 'join-banner' wrapper name (wrapper stays retired)"
  fi
else
  mark_fail "JoinCTA component missing: ${JOIN}"
fi

# ------------------------------------------------------------------
# 5) Social Wall: elfsight embed exists in SocialWall component; no legacy install remnants
# ------------------------------------------------------------------
hr
log "5) Social Wall embed present + install remnants removed"

SOCIAL="src/components/SocialWall.tsx"
if [ -f "${SOCIAL}" ]; then
  # Elfsight app div should exist somewhere (UUID-like)
  if gq "elfsight-app-[0-9A-Fa-f-]{36}" "${SOCIAL}"; then
    mark_pass "Elfsight app div present in SocialWall.tsx"
  else
    mark_fail "Elfsight app div missing in SocialWall.tsx"
  fi

  # Legacy install remnants (common failure modes)
  # - multiple platform.js script tags
  platform_count="$(grep -R -I -n -E "apps\.elfsight\.com/p/platform\.js" "${SOCIAL}" 2>/dev/null | wc -l | tr -d ' ')"
  if [ "${platform_count}" -le 1 ]; then
    mark_pass "Elfsight platform.js not duplicated in SocialWall.tsx (count=${platform_count})"
  else
    mark_fail "Elfsight platform.js duplicated in SocialWall.tsx (count=${platform_count})"
  fi

  # Spacing guardrail: prefer wrapper class hooks for controlled spacing (not inline huge margins)
  if gq "marginTop:\s*['\"]?([3-9][0-9]|[1-9][0-9]{2,})" "${SOCIAL}" || gq "marginBottom:\s*['\"]?([3-9][0-9]|[1-9][0-9]{2,})" "${SOCIAL}"; then
    mark_fail "SocialWall.tsx contains large inline margins (spacing should be CSS-controlled to avoid drift)"
  else
    mark_pass "SocialWall.tsx avoids large inline margin overrides (spacing drift reduced)"
  fi
else
  # Fallback: allow embed directly in homepage (older pattern)
  if [ -f "${PAGE_MAIN}" ] && gq "elfsight-app-[0-9A-Fa-f-]{36}" "${PAGE_MAIN}"; then
    mark_pass "Elfsight app div present in page.tsx (no SocialWall.tsx found)"
  else
    mark_fail "SocialWall.tsx missing and no elfsight app div found in page.tsx"
  fi
fi

# ------------------------------------------------------------------
# Summary
# ------------------------------------------------------------------
hr
log "Summary: ${pass_count} passed, ${fail_count} failed."
if [ "${fail_count}" -gt 0 ]; then
  log "Failures:"
  for f in "${fail_list[@]}"; do log " - ${f}"; done
  hr
  log "Report saved to: ${REPORT_FILE}"
  exit 1
else
  log "All checks passed."
  hr
  log "Report saved to: ${REPORT_FILE}"
  exit 0
fi
