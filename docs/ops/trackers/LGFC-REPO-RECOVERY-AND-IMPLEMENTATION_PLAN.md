# LGFC Repository Recovery & Implementation Plan
Repository: wdhunter645/next-starter-template  
Primary Objective: Restore repository stability, complete website implementation, and finalize long-term documentation architecture.  
Website Target Launch: April 1  
Operational Target Completion: March 25 (buffer for delays)  
Documentation Architecture Completion: May 1

---

# PROJECT PHASES

Phase 1 — Repository Documentation Stabilization  
Phase 2 — Website Implementation Sprint  
Phase 3 — Post-Launch Documentation Architecture Migration  
Phase 4 — Governance & CI Finalization

---

# PHASE 1 — DOCUMENTATION STABILIZATION
Goal: Establish a single authoritative design layer so implementation can proceed safely.

Target completion: **March 18**

## Phase 1 Tasks

### 1. Fix internal contradictions in design authority
File:  
docs/reference/design/LGFC-Production-Design-and-Standards.md

Actions:

- Logged-in public header = 4 button model  
  Club Home → /fanclub  
  Search → /search  
  Store → external Bonfire  
  Logout → /logout  

- Footer order =  
  Privacy  
  Terms  
  Contact  
  Contact (mailto)  
  Admin (admin only)

- Store link placement = mobile hamburger only

- Insert canonical route list inline.

### 2. Update homepage design authority
File:  
docs/reference/design/home.md

Canonical homepage order:

1 Hero Banner  
2 Weekly Photo Matchup  
3 Join CTA  
4 About Lou Gehrig  
5 Social Wall  
6 Recent Discussions  
7 Friends of the Fan Club  
8 Milestones  
9 Calendar  
10 FAQ  

Add component mapping:

About Lou Gehrig → src/components/AboutLouGehrig

Remove obsolete notes.

### 3. Archive superseded design documents
Create directory:

docs/archive/superseded/

Move:

docs/reference/design/master_design.md  
docs/reference/design/NAVIGATION-INVARIANTS.md  
docs/reference/design/visitor-header.md  

Before archiving:

Extract D1 schema content from master_design.md into  
LGFC-Production-Design-and-Standards.md.

### 4. Move reconciliation notes to history
Move:

docs/reference/design/RECONCILIATION-NOTES.md

to:

docs/as-built/RECONCILIATION-NOTES_2026-02.md

### 5. Remove orphan artifacts

Delete:

docs/reference/design/master_design_index.md  
docs/as-built/DEPLOYMENT_GUIDE.md.bak.*  
docs/as-built/member-vs-fanclub-audit.txt

### 6. Fix stale paths

Update references in:

README.md  
Agent.md  
context.md  
design-authority_MASTER.md  
operations-documentation-map_MASTER.md

Ensure they reference:

docs/reference/design/LGFC-Production-Design-and-Standards.md

### 7. Merge duplicate deployment docs

Merge:

docs/as-built/DEPLOYMENT_GUIDE.md  
docs/as-built/CLOUDFLARE_PAGES_SETUP.md

---

## Phase 1 Completion Criteria

Repository must satisfy:

- Single authoritative design source
- No duplicated route definitions
- No phantom file references
- Homepage order defined once
- Header/footer definitions defined once
- All root docs reference correct design authority

At this point implementation may resume.

---

# PHASE 2 — WEBSITE IMPLEMENTATION SPRINT
Goal: Complete all production functionality.

Implementation assumption: **0% trusted implementation**  
All features must be verified, repaired, and tested.

Target completion: **March 25**

Implementation method:

- Cursor performs implementation
- ChatGPT acts as design authority + review
- Work executed from IMPLEMENTATION-WORKLIST and THREAD-LOG

---

# IMPLEMENTATION TASK LIST

## Task Group 1 — Homepage System
Target completion: March 21

Verify and repair all homepage sections:

Hero Banner  
Weekly Photo Matchup  
Join CTA  
About Lou Gehrig  
Social Wall  
Recent Discussions  
Friends of the Fan Club  
Milestones  
Calendar  
FAQ / Ask

Verification requirements:

- Section rendering
- component wiring
- data loading
- responsive layout
- navigation integrity

---

## Task Group 2 — Fundraiser Pilot Section
Target completion: March 21

Build:

ALS Fundraiser Campaign Spotlight

Features:

campaign snapshot ingestion  
donor leaderboard  
donor totals  
call-to-action links

Deployment workflow:

Admin dashboard staging → publish to homepage

Verify:

campaign section does not break homepage layout  
campaign section renders correctly on mobile and desktop.

---

## Task Group 3 — Weekly Photo Matchup
Target completion: March 22

Verify and repair:

photo loading  
matchup selection  
vote submission  
vote storage  
results reveal logic  
duplicate vote prevention

---

## Task Group 4 — Calendar System
Target completion: March 22

Verify:

calendar event loading  
event display  
event linking

---

## Task Group 5 — FAQ + Ask System
Target completion: March 23

Verify:

FAQ display  
Ask submission form  
moderation workflow  
admin approval pipeline

---

## Task Group 6 — FanClub Area
Target completion: March 24

Implement and verify:

FanClub homepage

Subpages:

/fanclub/myprofile  
/fanclub/photo  
/fanclub/library  
/fanclub/memorabilia

Verify:

auth gating  
page rendering  
content loading

---

## Task Group 7 — Authentication System
Target completion: March 24

Verify and repair:

/join  
/login  
/logout  
/auth

Verify session behavior and route gating.

---

## Task Group 8 — Admin Dashboard
Target completion: March 25

Admin dashboard must support:

content publishing  
fundraiser management  
FAQ moderation  
matchup management  
basic monitoring tools

Admin must be production-safe.

---

## Phase 2 Completion Criteria

Website must support:

public homepage  
FanClub area  
fundraiser campaign  
weekly matchup voting  
calendar  
FAQ system  
admin operations

---

# PHASE 3 — DOCUMENTATION ARCHITECTURE MIGRATION
Goal: Implement permanent documentation structure.

Target completion: **May 1**

Migration will be incremental.

---

## Target Documentation Structure

docs/

architecture/  
design/  
implementation/  
operations/  
history/

---

## Architecture Layer

docs/architecture/

navigation.md  
authentication.md  
data-model.md  
cms.md

---

## Design Layer

docs/design/

site.md  
homepage.md  
fanclub.md  
style-guide.md

Page-level specs:

docs/design/pages/

homepage.md  
fanclub.md  
login.md  
join.md  
search.md  
faq.md

---

## Implementation Layer

docs/implementation/

component-map.md  
api-contracts.md

---

## Operations Layer

docs/operations/

deployment.md  
incident-response.md  
monitoring.md  
workflows.md

---

## History Layer

docs/history/

postmortems  
snapshots  
archives

---

# PHASE 4 — GOVERNANCE & CI FINALIZATION

Target completion: **May 1**

Restore full repository governance.

### Restore normal GitHub workflow

Use:

Pull Requests  
branch protections  
CI checks  
workflow monitoring

### Integrate tooling

DeepWiki — documentation audit  
Semgrep — rule enforcement

Example enforcement rules:

- prevent duplicate design authority
- prevent route definitions outside design spec
- enforce design-to-code mapping

---

# FINAL SUCCESS CRITERIA

The project is considered complete when:

- website operational before April 1  
- fundraiser campaign functioning  
- FanClub operational  
- admin dashboard production ready  
- repository documentation stabilized  
- permanent documentation architecture implemented  
- CI governance operational
