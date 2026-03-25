# LGFC — DOCUMENTATION REMEDIATION PROJECT (CRITICAL)

## 1. Objective
Stabilize documentation to match actual production architecture + implementation.

- Eliminate legacy Vercel/Supabase references  
- Enforce single canonical design authority  
- Close all missing specs blocking implementation  
- Restore trust in docs as source of truth  

## 2. Severity Assessment
Status: BLOCKER (launch impact)

- Architecture contradictions → high risk of wrong builds  
- Missing specs → blocking implementation  
- Auth inconsistency → breaks gating logic  
- Homepage gaps → directly tied to failures  

## 3. Root Cause
1. Legacy architecture not fully purged  
2. Multiple “truths” allowed  
3. No canonical enforcement  
4. Incomplete specs  

## 4. Execution Model
- Copilot = Documentation remediation  
- Cursor/Codex = Website implementation  
- No overlap  

## 5. Workstreams

### A — Architecture Purge
- Archive cms.md, dashboard.md  
- Move to /docs/archive/legacy-architecture/  
- Add banner: ARCHIVED  

### B — Canonical Authority Lock
- LGFC-Production-Design-and-Standards.md = source of truth  
- Add canonical header to all docs  

### C — Auth Model (LOCKED)
- Use localStorage (lgfc_member_email)  
- Remove Supabase + magic link references  

### D — Routing Fix
- Redirect target = /  
- Document auth flow clearly  

### E — Data Alignment
- /ask uses ask_inbox only  
- Remove faq_entries references  

### F — Homepage Order (LOCKED)
Hero → Spotlight → Weekly → Join → About → Social → Discussions → Friends → Milestones → Calendar → FAQ → Footer  

### G — Missing Specs
Create:
- fanclub-home.md  
- weeklyvote-results.md  
- health.md  
- home-friends.md  
- home-milestones.md  
- home-calendar.md  
- home-discussions.md  
- error-404.md  

### H — Component Mapping
Map all homepage sections to components  

### I — Route Cleanup
Remove orphan routes unless canonical  

### J — Governance Hardening
- No doc defines architecture  
- No contradictions allowed  

## 6. PR Strategy
- One PR per workstream  
- Sequential execution  

## 7. Acceptance Criteria
- No Vercel/Supabase references  
- Single auth model  
- All routes + sections documented  
- No contradictions  

## 8. Start Order
A → B → C → D  

## Bottom Line
Cleanup incomplete. This fixes it fully and removes ambiguity.
