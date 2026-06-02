---
Doc Type: Explanation
Audience: Human + AI
Authority Level: Supporting
Owns: Historical design rationale, decision context, implementation intent
Does Not Own: Canonical route behavior, final visual authority, runtime implementation, issue completion status
Canonical Reference: /docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-06-02
---

# LGFC Design Evolution and Rationale

## Purpose

This document preserves the design history behind the Lou Gehrig Fan Club website so implementation agents understand not only what the current design rules are, but why those rules exist.

The canonical design rules remain in `/docs/reference/design/LGFC-Production-Design-and-Standards.md`. This document is supporting explanation. It should be read before implementing or revising public, Fan Club, admin, homepage, or navigation work because it explains the intended end state and the decisions that led there.

## Scope

This document covers:

- the original product direction and why it changed
- the reasoning behind the public / Fan Club / admin separation
- the reasoning behind the canonical homepage order
- the reasoning behind route consolidation and retired legacy routes
- the reasoning behind external vendor boundaries such as Bonfire, Givebutter, Elfsight, Backblaze B2, and Cloudflare D1
- the intended visual and editorial feel of the site
- how agents should resolve design gaps without inventing new direction

This document does not authorize new routes, features, visual redesigns, data models, or vendor integrations. When this rationale appears to conflict with canonical design authority, the canonical design authority wins and this document should be updated by a documentation PR.

## Current Known Truth

The LGFC website is intended to be a stable, durable, public-facing fan club website with a protected member area and a protected admin operating area.

The current product direction is not a generic club template, not a social-media clone, and not a modern SaaS dashboard. It is a historically grounded, story-centric fan club site that uses simple, reliable web patterns and a long-term editorial model.

The implementation must preserve these core outcomes:

1. Public visitors immediately understand the Lou Gehrig Fan Club identity.
2. Visitors can join, search, read, support, and learn without confusion.
3. Members have a simple Fan Club home and member-specific pages.
4. Admins have operational tools without leaking admin affordances into public navigation.
5. Homepage content feels curated and newspaper-like, not randomly assembled.
6. Data-backed content can grow over time without forcing a redesign.
7. Vendor integrations remain bounded and replaceable.
8. The site remains simple enough to maintain for years.

## Intended Final State

The end goal is a visually consistent LGFC website organized around three stable operating zones:

| Zone | Purpose | Design Intent |
|---|---|---|
| Public site | Tell the story, invite participation, expose public content | classic, clear, dignified, story-first |
| Fan Club area | Give members identity, archive access, submission and discussion entry points | simple, gated, member-centered |
| Admin area | Operate content, moderation, media, members, events, fundraising, and reports | functional, protected, not public-facing |

Agents should treat implementation gaps as documentation defects first. If the canonical docs are silent, agents should not invent new product direction. They should implement the narrowest behavior consistent with this rationale and create a documentation follow-up when uncertainty remains.

---

# Design Evolution Timeline

## 1. Initial Direction: A Fan Club Website With Broad Possibility

The original project direction was expansive. The site could have become a broad fan platform with memberships, posts, galleries, voting, social features, store links, charity features, historical material, and future fan clubs for other figures.

The early design goal was not just to make a website. The goal was to create a durable fan club ecosystem that could honor Lou Gehrig, support community participation, preserve stories, and eventually support other legacy-driven fan clubs.

This broad possibility created a risk: too many features could make the first launch unstable, confusing, or hard to maintain.

## Why the direction shifted

The project shifted toward a Day 1 launch model because durability requires a stable foundation before expansion. The immediate site needed to be understandable, testable, and maintainable.

The design therefore moved from "build every possible fan club feature" to "build a stable public site, protected member area, and protected admin operating layer."

The decision was made to prioritize:

- route clarity
- header/footer stability
- homepage section order
- member gating
- admin gating
- fail-closed runtime behavior
- reliable content storage
- editorial scalability

## Implementation consequence

Agents should not add new feature surfaces because they seem useful. New features must fit the existing public / Fan Club / admin model and must be tracked as explicit tasks.

---

## 2. Route Consolidation: Reducing Drift and Dead Ends

Earlier planning included or implied several possible routes, including separate member pages, photo pages, library pages, news pages, support pages, store pages, and other aliases.

The design later consolidated those routes into fewer canonical paths.

## Why the direction shifted

Too many route aliases created navigation drift, duplicate implementation surfaces, and unclear ownership. Agents could satisfy one document while accidentally building a different version of the product.

The project therefore locked a smaller route set:

- public pages for general visitors
- `/fanclub/**` for authenticated member content
- `/admin/**` for protected operations
- external Bonfire store instead of an internal `/store` route
- contact page instead of separate support navigation

## Implementation consequence

Agents must not revive retired aliases or create convenience routes unless canonical design authority changes first.

A missing or awkward route should be treated as a design documentation question, not as permission to add a new route.

---

## 3. Public Navigation: Simple Actions, No Public Clutter

The public header evolved toward a small action set:

- Join
- Search
- Store
- Login

For logged-in users browsing public pages, Join becomes Club Home and Login becomes Logout.

## Why the direction shifted

The public site needed to stay approachable. The header should not expose the entire site architecture. It should give visitors the main actions without turning the header into a sitemap.

Admin links were intentionally removed from public navigation because admin is an operational area, not a public destination.

Support was consolidated into Contact because separate support navigation created unnecessary complexity for a small launch site.

## Implementation consequence

Agents should preserve the header as a small, stable action row on desktop/tablet and a hamburger drawer on mobile. The header must not become a dumping ground for new sections.

---

## 4. Fan Club Navigation: Member Identity Without Dashboard Bloat

The Fan Club area evolved from a possible member dashboard into a simpler member home and member navigation model.

The core Fan Club navigation became:

- Club Home
- My Profile
- Search
- Store
- Logout

## Why the direction shifted

A heavy dashboard would make the site feel like an application before the core public and content surfaces were stable. The Fan Club area should feel like a protected extension of the public fan club, not a separate SaaS product.

Membership card behavior was moved into the profile/member experience instead of becoming a sprawling separate identity system.

Memorabilia was defined as a tagged or filtered view of photos/content rather than a separate standalone data model.

## Implementation consequence

Agents should implement Fan Club features as simple, gated member experiences. Do not create heavy dashboard mechanics, unrelated analytics widgets, or separate member subsystems unless explicitly tasked.

---

## 5. Admin Area: Operational Tools, Not Public Design

The admin area evolved into a protected operations zone for member operations, moderation, content, media, events, fundraising, matchups, and reporting.

## Why the direction shifted

The public site and Fan Club site need polish and narrative clarity. Admin tools need safety, auditability, empty states, and error states. These are different design goals.

Mixing admin links or admin patterns into public UI would confuse users and create security and trust risks.

## Implementation consequence

Agents should keep admin affordances inside `/admin/**`. Admin UI can be utilitarian. Public UI should not be reshaped to accommodate admin workflows.

---

## 6. Homepage: From General Landing Page to Story-Centric Newspaper Model

The homepage evolved into a fixed editorial sequence:

1. Header
2. Banner
3. Spotlight
4. Weekly Matchup
5. Join
6. About
7. Social
8. Discussions
9. Friends
10. Milestones
11. Calendar
12. FAQ/Ask
13. Footer

## Why the direction shifted

The homepage needed to do more than welcome visitors. It needed to explain the club, show activity, expose Lou Gehrig content, invite membership, and keep the site alive over time.

A newspaper-like sequence provides editorial structure:

- hero identity first
- timely spotlight when needed
- interactive weekly feature
- membership invitation
- historical grounding
- social proof and community activity
- partner/friend visibility
- milestones and calendar context
- FAQ and visitor intake

This sequence prevents agents from moving sections based on local component convenience.

## Implementation consequence

Agents should not reorder homepage sections to solve spacing, data, or component problems. If a section has no active content, it should fail closed, show a safe empty state, or remain a hidden slot if that is the documented behavior.

---

## 7. Spotlight Slot: Temporary Priority Without Permanent Redesign

The Spotlight slot was created for time-bound campaigns such as fundraiser announcements, holidays, Lou Gehrig Day, or other high-priority club notices.

## Why the direction shifted

The site needed a way to highlight urgent or seasonal material without redesigning the homepage each time. The Spotlight slot solves that by reserving a place near the top of the page while staying hidden when inactive.

## Implementation consequence

Agents must not remove the Spotlight slot because it is currently inactive. Hidden-by-default is intentional. Spotlight should remain optional and fail-closed.

---

## 8. Store Boundary: Bonfire Is External

The LGFC Store is Bonfire. The site does not own a native store route or checkout.

## Why the direction shifted

An internal store would add payment, fulfillment, tax, inventory, and security burdens. Bonfire handles the commerce layer while the LGFC site provides clear outbound navigation.

## Implementation consequence

Agents must not create `/store` unless canonical design changes. Store links should remain external Bonfire links.

---

## 9. Fundraising Boundary: Givebutter Handles Funds

Fundraising uses Givebutter. LGFC does not handle funds directly.

## Why the direction shifted

This preserves trust, reduces compliance risk, and keeps the LGFC site focused on presentation, campaign visibility, and public context rather than payment processing.

## Implementation consequence

Agents should treat fundraiser content as campaign display and admin preview/validation work, not as native donation processing.

---

## 10. Social Wall Boundary: Elfsight Is an Embed, Not Core Infrastructure

The Social Wall uses Elfsight to surface external social activity.

## Why the direction shifted

The site needed social proof without building and maintaining multiple social platform integrations. Elfsight provides a bounded embed layer.

## Implementation consequence

Agents should keep Social Wall behavior fail-safe. If external embed behavior varies, the LGFC page should remain stable.

---

## 11. Data Direction: Cloudflare D1 and Backblaze B2

The project moved toward Cloudflare D1 for structured data and Backblaze B2 for media assets.

## Why the direction shifted

The site needed simple, durable infrastructure aligned with Cloudflare Pages. D1 supports structured operational and editorial data. B2 supports media storage without tying image inventory to the application bundle.

The design direction intentionally avoids overbuilding a complex backend before launch.

## Implementation consequence

Agents should prefer existing D1/B2 contracts and fail-closed handling. Do not introduce new storage systems or parallel tables unless an explicit data authority document exists.

---

## 12. Content Strategy: Story Tags Instead of Section-Specific Content Silos

The content model evolved toward a story-centric inventory. A story can appear in multiple contexts through tags, allowed sections, priority, date fields, and editorial metadata.

## Why the direction shifted

Lou Gehrig content is historical, recurring, and seasonal. A single story may matter as a milestone, homepage feature, archive item, search result, or anniversary item.

Per-section true/false fields or independent content stores would eventually fragment the archive and make editorial rotation harder.

## Implementation consequence

Agents should not create separate content silos for each page. Content management work should preserve a central content inventory model and use metadata to determine placement.

---

## 13. Member Submissions: Intake First, Manual Editorial Judgment Later

Member submissions evolved into an intake-and-review model rather than direct publication.

## Why the direction shifted

Member participation is valuable, but factual accuracy, relevance, media rights, spam control, and editorial quality require review.

Automation may triage objective issues, but final content judgment remains manual.

## Implementation consequence

Agents should not auto-publish member-submitted content. Submissions should enter a queue, receive objective triage, and wait for admin/editorial approval.

---

## 14. Visual Direction: Classic, Dignified, Structured, Not Trend-Driven

The visual design evolved toward a classic and restrained presentation:

- LGFC blue as the primary brand color
- white cards on a light page background
- centered section titles
- simple button rows
- clear spacing between homepage sections
- a sticky header
- a homepage/FanClub-root floating logo behavior
- small, stable footer with quote, logo, and legal/contact links

## Why the direction shifted

The site is about Lou Gehrig, baseball history, character, ALS awareness, and community. Trend-heavy layouts, excessive animations, dense dashboards, or modern SaaS styling work against that tone.

The desired feel is closer to a carefully maintained fan club newspaper/archive than a startup landing page.

## Implementation consequence

Agents should avoid visual reinterpretation when implementing functionality. If UI must be added, it should use existing card, button, section-title, spacing, and LGFC blue patterns.

---

## 15. Why Design Drift Happens

Design drift occurs when agents correctly follow a narrow written rule but miss the broader historical intent.

Examples:

- A route can be technically valid but revive a retired navigation model.
- A section can be present but visually inconsistent with the homepage rhythm.
- A card can render correctly but feel like an admin panel instead of public storytelling.
- A feature can pass tests while moving the site toward a generic app interface.
- A convenience link can solve a local issue while violating the public / Fan Club / admin separation.

## Implementation consequence

When an implementation gap appears, agents should ask:

1. Does this preserve the public / Fan Club / admin separation?
2. Does this preserve the newspaper-like homepage sequence?
3. Does this preserve a classic LGFC visual tone?
4. Does this avoid new routes or data models?
5. Does this fail closed if external services or data are unavailable?
6. Does this keep admin workflows out of public navigation?
7. Does this strengthen the long-term editorial archive rather than fragment it?

If the answer is uncertain, the correct next step is a documentation update, not an invented implementation pattern.

---

# Agent Usage Rules

Agents implementing LGFC work must use this document as rationale context with the canonical design docs.

Required reading order for design-sensitive website tasks:

1. `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
2. `/docs/reference/design/home.md` when homepage or section layout is touched
3. `/docs/reference/design/fanclub.md` and `/docs/reference/design/fanclub-home.md` when Fan Club routes are touched
4. `/docs/reference/architecture/access-model.md` when auth/admin/Fan Club access is touched
5. this document for historical rationale and end-state interpretation

Agents must not treat this document as permission to bypass canonical design authority. It exists to reduce ambiguity when the canonical rules are close but not expressive enough to explain intent.

# Design Correction Workflow

When drift is detected:

1. Identify the exact implementation surface that drifted.
2. Identify the canonical design rule that applies.
3. If the rule exists but lacks visual or historical context, update the design docs first.
4. Create a scoped implementation task that corrects only the documented drift.
5. Do not redesign adjacent surfaces.
6. Do not add new routes, vendors, workflows, or data tables as part of drift correction.

# Summary

The LGFC website end state is a durable, historically grounded, story-centric fan club site with clear public, member, and admin zones. The project has intentionally moved away from route sprawl, generic dashboards, unbounded feature growth, and agent-invented layouts.

The design target is simple but not vague: classic LGFC identity, fixed homepage editorial sequence, bounded vendor integrations, protected member/admin zones, and a content model capable of preserving Lou Gehrig stories over many years.
