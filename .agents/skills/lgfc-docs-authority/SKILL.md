# LGFC Docs Authority Skill

Use this skill for documentation creation, documentation moves, documentation edits, authority hierarchy, Diataxis routing, tracker updates, or canonical docs checks.

## Documentation structure

Use the approved Diataxis directories:

- `docs/tutorials/`
- `docs/how-to/`
- `docs/reference/`
- `docs/explanation/`

Operational documentation may live under:

- `docs/ops/`

Do not create a folder named `DIATAXIS`.

## Procedure

1. Classify the document as tutorial, how-to, reference, explanation, governance, ops, or tracker material.
2. Place the file in the existing approved directory structure.
3. Add the required documentation header at the top of every active Markdown document.
4. Identify the canonical reference for the document.
5. Update trackers only when the source Issue authorizes tracker changes.
6. Preserve append-only historical records unless the source Issue explicitly authorizes correction.
7. Run documentation checks before handoff.

## Required checks

Run the relevant checks when documentation is changed:

- `./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`

If canonical tracked files changed intentionally, regenerate hashes using the approved repository script and include that in the PR evidence.

## Stop conditions

Stop and request correction when:

- The requested document location conflicts with the approved structure.
- The task asks for a `DIATAXIS` folder.
- Authority hierarchy is unclear.
- A legacy document conflicts with the canonical reference.
