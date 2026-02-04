# Design Authority

## Purpose

Design authority ensures that UI/UX and product behavior remain consistent over time,
even as contributors and tools change.

## Source of Truth

1. **Repository documentation is authoritative.**
2. If there is a conflict between memory/chat and repo docs, **repo docs win**.
3. If implementation conflicts with repo docs, the system is considered out of spec and must be corrected.

## What Counts as “Design”

Design authority covers:

- Navigation structure and labels
- Public vs member vs admin behavior
- Header/footer invariants
- Page layout contracts
- Route ownership and gating rules

## How Design Changes Are Made

- Design changes require:
  - explicit PR intent
  - updated authoritative docs
  - verification (screenshots or deterministic checks where applicable)
- Any new page or route must be reflected in `docs/NAVIGATION-INVARIANTS.md`.

## Cross-References

- Design and standards: `docs/LGFC-Production-Design-and-Standards.md`
- Navigation contract: `docs/NAVIGATION-INVARIANTS.md`
