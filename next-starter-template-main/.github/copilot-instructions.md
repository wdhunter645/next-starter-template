# Copilot / Agent Instructions (Authoritative for this repo)

You are operating on the LGFC repository. Follow these rules exactly.

## Absolute musts
1) **ZIP cleanup first**: If there is any uploaded ZIP in repo root (e.g., `*.zip`), delete it before any other change. It must not be committed.
2) **Repo docs are authoritative**: Prefer `/docs/*` over conversation memory.
3) **One-window PR drafts**: When drafting PR instructions, output a single continuous Markdown block in one triple-backtick fence.
4) **No drift**: Do not invent new pages, navigation labels, or feature scope that are not explicitly specified in repo docs.
5) **No secrets**: Never add credentials, tokens, keys, or sensitive identifiers into code or docs.

## Required reads before changes
- `/docs/PR-DRAFT-TEMPLATE.md`
- `/docs/NAVIGATION-INVARIANTS.md`
- `/docs/website.md`
- `/docs/website-process.md`

## Change discipline
- Keep diffs minimal and directly tied to stated acceptance criteria.
- Prefer deterministic edits over rewrites.
- If a file is missing, add it; do not change unrelated files to “clean up.”
