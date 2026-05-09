# LGFC Docs Authority Skill

Use this skill for documentation creation, documentation moves, documentation edits, authority hierarchy, DIATAXIS routing, tracker updates, or documentation checks.

## Documentation structure

Use the active DIATAXIS transition structure.

Do not route new agent-governance documentation to superseded documentation paths.

## Procedure

1. Classify the document as tutorial, how-to, reference, explanation, governance, ops, or tracker material.
2. Place the file in the active DIATAXIS transition structure.
3. Add the required documentation header at the top of every active Markdown document.
4. Identify the canonical reference for the document.
5. Update trackers only when the source Issue authorizes tracker changes.
6. Preserve append-only historical records unless the source Issue explicitly authorizes correction.
7. Run applicable documentation checks before handoff.

## Required checks

Run the relevant checks for the changed documentation set.

If canonical tracked files changed intentionally, regenerate the applicable authority data using the approved repository process and include that in the PR evidence.

## Stop conditions

Stop and request correction when:

- The requested document location conflicts with the active DIATAXIS transition structure.
- Authority hierarchy is unclear.
- A superseded document conflicts with the active canonical reference.
