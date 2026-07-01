<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #2046

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `src/lib/publicSiteMetadata.ts`
- `src/app/layout.tsx`
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/app/about/layout.tsx`
- `src/app/faq/layout.tsx`
- `src/app/ask/layout.tsx`
- `src/app/events/layout.tsx`
- `src/app/search/layout.tsx`
- `src/app/contact/layout.tsx`
- `tests/public-seo-artifacts.test.ts`
- `docs/ops/reports/website-public-launch-seo-analytics-readiness.md`
- `docs/ops/pmo/website-public-launch-relaunch-readiness.md`

## CHANGE SUMMARY
- Add metadataBase, Open Graph, and Twitter defaults in root layout.
- Add server layout metadata for core public client routes.
- Export static `sitemap.xml` and `robots.txt` for launch readiness.
- Add SEO/analytics readiness evidence report and artifact tests.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npm run build` — PASS (exports `/sitemap.xml`, `/robots.txt`)
  - `npm test -- tests/public-seo-artifacts.test.ts` — PASS
- Gate verification:
  - Commit-level workflow runs inspected: YES (merged PR #2112)
  - PR-level governance/accounting workflows inspected: YES
  - Required gates rerun or re-evaluated after fixes: YES
- Result summary: PASS

## ACCEPTANCE CRITERIA
- [x] SEO and metadata launch gaps resolved or escalated.
- [x] Analytics integration path documented without hardcoded secrets.
- [x] Sitemap/search-index behavior verified via static export artifacts.
- [x] Social-card preview behavior documented via OG/Twitter defaults.
- [x] All required CI gates green on latest head (verified at merge SHA `2f5b6ec718c931a053e524fac378453eec6c42bb`).
- [x] Post-merge closeout remediation body generated for merged PR #2112

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments, bot comments, and review threads.
- none on merged PR #2112

## PR GATE READINESS CHECKLIST
- [x] Live PR check panel inspected
- [x] Commit-level workflow runs inspected
- [x] PR-level pull_request_target workflows inspected
- [x] Latest head workflow runs inspected
- [x] All review threads and comments inspected
- [x] Required gates rerun or re-evaluated after fixes

## POST-MERGE CLOSEOUT CHECKLIST
- [x] PR merged state verified
- [x] Merge commit recorded: `2f5b6ec718c931a053e524fac378453eec6c42bb`
- [x] Source issue #2046 state inspected after merge
- [x] Remediation follow-up for exception #2113 recorded in this post-merge closeout body

## PROGRESS + READINESS (MANDATORY)
- Status: MERGED

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line
- [x] Allowed files section matches final diff exactly
- [x] All reviewer feedback has explicit disposition where required
<!-- CURSOR_AGENT_PR_BODY_END -->
