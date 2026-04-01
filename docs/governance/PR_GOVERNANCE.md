---
Doc Type: Governance
Audience: Human + AI
Authority Level: Canonical
Owns: Governance rules, PR process, enforcement, AI guardrails
Does Not Own: Design/architecture/platform specifications; step-by-step ops procedures
Canonical Reference: /docs/governance/standards/document-authority-hierarchy_MASTER.md
Last Reviewed: 2026-03-27
---

# Website Pull Request Governance

## Required PR framing
1. Reference `/docs/governance/PR_PROCESS.md`.
2. Summarize exact edits with file paths (and line-level context when relevant).
3. Link back to this governance file and the canonical design authority.

## Canonical references for UI/layout work
- `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- `/docs/reference/design/home.md`
- `/docs/reference/design/fanclub.md`

Do not use archived `.html` snapshots as active source-of-truth references.

---

## Runtime & Platform Policy
- Cloudflare Pages + Next.js deployment model is the active platform baseline.
- Do not perform framework/runtime migrations in unrelated PRs.
- Keep CSS/layout approach aligned to current repository standards.

---

## Drift Control
- Structural edits must align with canonical MD specifications under `docs/reference/design/**`.
- If required canonical documentation is missing/outdated, open or update the relevant spec first.
- Archived materials under `docs/archive/**` are historical context only.

---

## As-Built Documentation Requirement
Any PR that changes Cloudflare-rendered page behavior must update `/docs/as-built/cloudflare-frontend.md` in the same PR.

---

## Footer Design Enforcement
Footer behavior must remain aligned with `/docs/reference/design/LGFC-Production-Design-and-Standards.md` and `/docs/reference/design/home.md`.

Required invariants:
- Left: rotating quote + dynamic-year copyright.
- Center: logo used as scroll-to-top affordance.
- Right links: Privacy (`/privacy`), Terms (`/terms`), Contact (`/contact`).
- No extra footer nav links and no footer admin shortcut.

---

## Social Wall Change Control
For Social Wall changes:
1. Validate against active design docs.
2. Update implementation docs when behavior changes.
3. Verify rendered behavior in preview/production.
4. Record verification in PR notes.

---

## Documentation Header Compliance (Required)
For any PR touching active docs (`docs/reference`, `docs/governance`, `docs/how-to`, `docs/explanation`, `docs/ops`, `docs/templates`):
- Each touched markdown file must include the canonical header from `/docs/templates/markdown-header-template.md`.
- Run `./scripts/ci/docs_check_headers.sh .` locally before opening/updating the PR.
- If the guardrail fails, use the file-specific remediation output and apply the exact template fields.
