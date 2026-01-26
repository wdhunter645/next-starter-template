# CSP (Content Security Policy) — ZIP #5

## Status
- Implemented at the edge in **Report-Only** mode via `functions/_middleware.ts`.
- Reports accepted at: `POST /api/csp-report`.

## Why Report-Only first
Third-party embeds (notably Elfsight) are sensitive to CSP allowlists. Report-Only allows us to observe violations in staging before enforcing.

## Current Policy (Report-Only)
The middleware emits `Content-Security-Policy-Report-Only` with these key allowlists:
- `script-src`: `self`, `https://static.elfsight.com`, `https://elfsightcdn.com`
- `style-src`: `self`, `'unsafe-inline'`, `https://elfsightcdn.com`
- `connect-src`: `self`, `https://*.elfsight.com`
- `frame-src`: `https://*.elfsight.com`
- `img-src`: `self`, `data:`, `blob:`, plus Elfsight + common social CDNs used by the widget.

## Promote to Enforced
After staging confirms no unexpected violations:
1. Change header name from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`.
2. Re-deploy.
3. Verify Elfsight renders fully (tiles + images) and no console CSP errors remain.

## Troubleshooting
- If the widget loads text but not images, expand `img-src` allowlist first.
- If network calls fail, expand `connect-src` allowlist.
- Keep changes minimal and document every domain added (why it exists and what feature needs it).
