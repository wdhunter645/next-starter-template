#!/usr/bin/env bash
set -euo pipefail

# ---------- setup ----------
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

begin() {
  log "LGFC v6 Lock Verification"
  log "Timestamp: ${TS}"
  log "Repo: $(basename "${ROOT_DIR}")"
  hr
}

mark_pass() { pass_count=$((pass_count+1)); log "✅ PASS | $*"; }
mark_fail() { fail_count=$((fail_count+1)); fail_list+=("$*"); log "❌ FAIL | $*"; }

# Grep helpers (quiet). All grep are repo-root relative.
gq() { grep -R -I -n -E -- "$1" "$2" >/dev/null 2>&1; }   # pattern, path
gqs() { printf "%s" "$1" | grep -E -- "$2" >/dev/null 2>&1; }

# ---------- start ----------
begin

# 0) Anchor files exist
hr
log "0) Checking anchor docs exist (process/governance/v6 HTML)"
anchors_ok=true
for f in "docs/website-PR-process.md" "docs/website-PR-governance.md" "docs/lgfc-homepage-legacy-v6.html"; do
  if [[ -f "${f}" ]]; then
    mark_pass "Anchor present: ${f}"
  else
    anchors_ok=false
    mark_fail "Missing anchor: ${f}"
  fi
done
$anchors_ok || { hr; log "Aborting: required anchors missing."; exit 2; }

# 1) globals.css tokens & utilities
hr
log "1) globals.css contains tokens/utilities: --lgfc-blue, .section-gap, .title-lgfc, .joinBanner, .topWhitespace"
CSS="src/app/globals.css"
[[ -f "${CSS}" ]] || { mark_fail "File missing: ${CSS}"; hr; goto_end=true; }

if [[ -z "${goto_end:-}" ]]; then
  gq "--lgfc-blue" "${CSS}" && mark_pass "--lgfc-blue present" || mark_fail "--lgfc-blue missing"
  gq "\.section-gap" "${CSS}" && mark_pass ".section-gap present" || mark_fail ".section-gap missing"
  gq "\.title-lgfc" "${CSS}" && mark_pass ".title-lgfc present" || mark_fail ".title-lgfc missing"
  gq "\.joinBanner" "${CSS}" && mark_pass ".joinBanner present" || mark_fail ".joinBanner missing"
  gq "\.topWhitespace" "${CSS}" && mark_pass ".topWhitespace present" || mark_fail ".topWhitespace missing"
fi

# 2) Header non-sticky; logo & hamburger aligned; topWhitespace inserted under header
hr
log "2) Header non-sticky and aligned; topWhitespace present under header"
HDR_CANDIDATES=("src/components/Header.tsx" "src/app/components/Header.tsx")
HDR_FILE=""
for f in "${HDR_CANDIDATES[@]}"; do [[ -f "$f" ]] && HDR_FILE="$f" && break; done
if [[ -z "${HDR_FILE}" ]]; then
  mark_fail "Header component not found (looked in ${HDR_CANDIDATES[*]})"
else
  # No sticky usage
  if gq "sticky|position:\s*['\"]?sticky" "${HDR_FILE}" ; then
    mark_fail "Header uses sticky positioning (remove sticky) in ${HDR_FILE}"
  else
    mark_pass "Header is non-sticky (${HDR_FILE})"
  fi
  # Expect absolute top alignment hints for logo/hamburger (top: and left:/right:)
  if gq "position:\s*['\"]?absolute" "${HDR_FILE}" && gq "top:\s*1?2(px)?" "${HDR_FILE}"; then
    mark_pass "Header has absolutely positioned elements with aligned top (≈12px)"
  else
    mark_fail "Header missing absolute-aligned top positioning for logo/hamburger"
  fi
fi

# topWhitespace div appears near header usage (allow either in layout or page)
PAGE_MAIN="src/app/page.tsx"
LAYOUT_MAIN="src/app/layout.tsx"
if gq "className=.*topWhitespace" "${PAGE_MAIN}" || gq "className=.*topWhitespace" "${LAYOUT_MAIN}"; then
  mark_pass "topWhitespace rendered under header (page/layout)"
else
  mark_fail "No .topWhitespace div found beneath header (page/layout)"
fi

# 3) WeeklyMatchup title exact text + centered blue via title-lgfc
hr
log "3) WeeklyMatchup title exact text + 'title-lgfc' class"
WM="src/components/WeeklyMatchup.tsx"
REQ_TITLE="Weekly Photo Matchup\. Vote for your favorite!"
if [[ -f "${WM}" ]]; then
  if gq "${REQ_TITLE}" "${WM}"; then
    mark_pass "Weekly title exact text present"
  else
    mark_fail "Weekly title text mismatch: expected \"Weekly Photo Matchup. Vote for your favorite!\""
  fi
  if gq "className=.*title-lgfc" "${WM}"; then
    mark_pass "Weekly title uses class 'title-lgfc' (centered + blue)"
  else
    mark_fail "Weekly title missing 'title-lgfc' class"
  fi
else
  mark_fail "WeeklyMatchup component missing: ${WM}"
fi

# 4) page.tsx wraps sections with .section-gap; Join banner text exact + blue background via .joinBanner
hr
log "4) page.tsx section spacing + Join banner exact copy"
REQ_JOIN_COPY="Become a member\. Get access to the Gehrig library, media archive, memorabilia archive, group discussions, and more\."
if [[ -f "${PAGE_MAIN}" ]]; then
  # Count occurrences of .section-gap wrappers
  GAP_COUNT="$(grep -R -I -n -E "className=.*section-gap" "${PAGE_MAIN}" | wc -l | tr -d ' ')"
  if [[ "${GAP_COUNT}" -ge 5 ]]; then
    mark_pass ".section-gap applied to ≥5 sections (Weekly, Join, Social, FAQ, Milestones)"
  else
    mark_fail ".section-gap count too low in ${PAGE_MAIN} (found ${GAP_COUNT}, need ≥5)"
  fi
  # Join banner class + exact copy
  if gq "className=.*joinBanner" "${PAGE_MAIN}"; then
    mark_pass "Join banner styled with .joinBanner (blue background)"
  else
    mark_fail "Join banner missing .joinBanner class"
  fi
  if gq "${REQ_JOIN_COPY}" "${PAGE_MAIN}"; then
    mark_pass "Join banner uses exact v6 copy"
  else
    mark_fail "Join banner text does not match exact v6 copy"
  fi
else
  mark_fail "Home page file missing: ${PAGE_MAIN}"
fi

# 5) Social Wall placeholder intact (elfsight div)
hr
log "5) Social Wall placeholder present"
if gq "elfsight-app-[0-9A-Fa-f-]{36}" "${PAGE_MAIN}" ; then
  mark_pass "Elfsight placeholder present in page.tsx"
else
  # Also allow a TODO placeholder near a SocialWall component
  if gq "Social Wall placeholder|Elfsight" "${PAGE_MAIN}"; then
    mark_pass "Social Wall placeholder note present"
  else
    mark_fail "Social Wall placeholder missing in page.tsx"
  fi
fi

# ---------- summary ----------
hr
log "Summary: ${pass_count} passed, ${fail_count} failed."
if [[ "${fail_count}" -gt 0 ]]; then
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

# End of script
