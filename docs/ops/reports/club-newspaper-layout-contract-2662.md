---
Doc Type: Operations
Audience: Bill, ChatGPT / Atlas, Cursor, Claude Code, LGFC maintainers, and reviewers
Authority Level: Controlled
Owns: Task #2662 evidence trail and rationale backing the zone/responsive/accessibility contract added to fanclub-home.md
Does Not Own: The zone contract itself (canonical in `docs/reference/design/fanclub-home.md`), rotation/media-pairing/edition contracts (#2663), editorial-operations technical verification (#2664)
Canonical Reference: /docs/reference/design/fanclub-home.md
Related Issues: #2461, #2661, #2662, #2663, #2664
Last Reviewed: 2026-08-05
---

# Club Newspaper Zone/Responsive/Accessibility Contract — Evidence and Rationale (#2662)

## Purpose

Record the evidence trail and rationale behind the zone contracts, responsive-behavior definition, and accessibility requirements added to `docs/reference/design/fanclub-home.md` for #2662. Per WORK's instruction not to create parallel canonical design authority, the durable contract itself lives in `fanclub-home.md`; this report is supporting evidence, not a competing authority.

## Scope

In scope: why each zone was assigned its stable ID, priority/visibility, and #2461 category; why 768px/920px were chosen as breakpoints in the absence of a sitewide breakpoints reference; the live-component evidence backing every accessibility claim; and the one open design note (side-rail placement for `recognition`/`submission-cta`) left for Product rather than resolved here.

Out of scope: implementing any of this contract in runtime CSS/components (Phase 1, not authorized here), #2663/#2664's own charters.

## Current known truth

- All twelve live Club Home components (`ClubHomeMasthead`, `ClubHomeStaticStory`, `ClubHomeStoryRail`, `ArchivesTiles`, `ClubHomeMediaFeature`, `ClubHomeMemberPrompt`, `ClubHomeArchiveSpotlight`, three `ClubHomeDeferredModule` instances, `ClubHomeSubmissionCta`, `AdminLink`) and `clubHomeStyles.ts` were read in full before this contract was written.
- No breakpoint-based responsive layout exists in Club Home today — `clubHomePageStack` is `flexDirection: column` with no `@media` queries anywhere under `src/components/fanclub/` or `src/app/fanclub/`. Only `story-rail` and `feature-links` use CSS Grid `auto-fit`/`minmax`, which is intrinsic card-reflow within a zone, not a distinct desktop/tablet/mobile composition.
- No sitewide breakpoints reference document exists; `docs/reference/design/style-guide.md` states only generic desktop/mobile padding values (`20px`/`16px`), not pixel breakpoints. The 768px/920px pair adopted in `fanclub-home.md` matches `src/components/Header.module.css`'s existing breakpoints exactly — the closest analogous shared-shell component — rather than inventing new values.
- Heading hierarchy is already correct: one `<h1>` (masthead), one `<h2>` per section (flat siblings, ~10 of them), `<h3>` only for story headlines within `lead-story` and `story-rail` items. No level is skipped.
- `media-feature`'s single `<img>` always supplies alt text (`media.title` or the literal fallback `'Featured club photo'`) — confirmed by reading `ClubHomeMediaFeature.tsx` directly; no path renders an image without alt text.
- No custom `:focus` override exists in any reviewed component; all interactive elements use the browser's native focus indicator.
- No CSS transition, animation, or `prefers-reduced-motion` handling exists anywhere in Club Home today.
- `clubHomeMutedText` renders body text at `rgba(0,0,0,0.75)` (≈ `#404040`) on `clubHomeSectionCard`'s white background, which comfortably exceeds WCAG AA's 4.5:1 contrast minimum for normal text.

## Intended final state

- `fanclub-home.md`'s zone contract, responsive-behavior, and accessibility sections become the single source #2663 and #2664 read against, without re-deriving zone identity or breakpoint values from scratch.
- A future Phase 1 implementation task (out of #2662's scope) builds the tablet/desktop two-column CSS this contract specifies; mobile requires no change since the current single-column order already satisfies #2461.
- The open design note on `recognition`/`submission-cta` side-rail placement is either affirmed (current below-the-fold placement kept) or revisited by Product before any Phase 1 CSS work assigns final column positions — this report and the contract do not pre-decide it.

## Zone-ID and #2461-category rationale

Each zone ID in `fanclub-home.md`'s contract table is a short, stable slug derived from its existing `aria-label` (e.g., `aria-label="Photo and memorabilia feature"` → `media-feature`), not from the component's current name, so a future component rename does not break #2663/#2664's references — directly satisfying #2461's "stable zone ID and human label" requirement.

The above-the-fold / side-rail / below-the-fold mapping in `fanclub-home.md` traces directly to #2461's own "Newspaper layout zones" section, which names several candidate side-rail departments explicitly: "Today in Gehrig History," "Fan Club Partners," "Featured Photo," "Join the Conversation," "Share with the Club," "Featured Memorabilia." Three of those names match current zones almost verbatim (`media-feature` ≈ "Featured Photo"/"Featured Memorabilia"; `member-prompt` = "Join the Conversation"). Two do not match current placement: "Fan Club Partners" and "Share with the Club" are #2461 side-rail *candidates*, but the current implementation places their closest matches (`recognition`, `submission-cta`) below the fold instead. #2461 used "candidate" language for that list, not a strict requirement, and #2661 already established the current implementation as accepted canonical state — so this contract preserves the current below-the-fold placement rather than silently moving either zone, and records the discrepancy as an open design note in `fanclub-home.md` for Product to revisit if desired, not as a defect.

## Validation

- `bash scripts/ci/docs_check_headers.sh .` — run against this file and the two other changed docs (see PR evidence).
- `node scripts/ci/diataxis_folder_audit.mjs` — passes for the same reason recorded on #2661's report: `docs/ops/` is outside the audited DIATAXIS folder set. This is expected, not a validation of this file's structure.
- `git diff --check` — run (see PR evidence).
- Every claim above was verified by reading the cited component/style file directly, not assumed from prior documentation.

## Rollback

This is a documentation-only change across three files (`fanclub-home.md`, `fanclub.md`, this report). Revert the bounded PR to remove it; no runtime, schema, or public-copy change is made by this task.
