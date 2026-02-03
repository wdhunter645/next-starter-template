### PR Template (REVISED — DESIGN COMPLIANCE GATES ARE MANDATORY)

## ZIP SAFETY PREFLIGHT (MANDATORY)
If this PR uses a ZIP as an input artifact (download/extract overlay workflow), validate the ZIP BEFORE unzipping.

Agent MUST run these commands and paste the PASS/FAIL output into the PR.

### 1) Nested ZIP check (ZIP-in-ZIP)
ZIP="<zipfile>"
if unzip -Z1 "$ZIP" | grep -Eiq '\.zip$'; then
  echo "FAIL: nested ZIP (ZIP contains another .zip)"
else
  echo "PASS: no nested ZIP"
fi

### 2) Wrapper-folder check (GitHub Download ZIP wrapper)
# Wrapper ZIP = every entry lives under a single top-level folder (e.g., next-starter-template-main/...)
ZIP="<zipfile>"
TOPCOUNT="$(unzip -Z1 "$ZIP" | awk -F/ 'NF{print $1}' | sort -u | wc -l | tr -d ' ')"
if [ "$TOPCOUNT" -eq 1 ]; then
  echo "FAIL: wrapper ZIP (single top-level folder)"
else
  echo "PASS: not a wrapper ZIP"
fi

If either check FAILS:
- Post the status in the PR immediately.
- STOP. Do not unzip. Do not proceed.
- Close/cancel the PR and obtain a correct ZIP.

#### Reference
Refer to `/docs/website.md` for required structure and change conventions.

#### Change Summary
(Describe what this PR changes.)

#### Governance Reference
Follow operational, rollback, and testing standards in `/docs/website-process.md`.
