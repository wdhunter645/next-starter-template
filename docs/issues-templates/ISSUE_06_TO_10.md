# Issues 6-10: Summary Templates

## Issue #6: Configure External Services
**Labels:** `configuration`, `external-services`  
**Priority:** Medium

Set Elfsight widget ID and enable Cloudflare Analytics per existing documentation.

**DoD:** Widget ID in .env.example, Analytics enabled, both verified working.

---

## Issue #7: Standardize Helper Script Management
**Labels:** `cleanup`, `scripts`  
**Priority:** Medium

Move helper scripts (.sh files) to scripts/ directory with consistent structure.

**DoD:** scripts/ directory created, all .sh files moved, README.md in scripts/, help flags added.

---

## Issue #8: Document GitHub Actions First-Run Approval
**Labels:** `docs`, `ci-cd`  
**Priority:** Low

Add section to CONTRIBUTING.md explaining workflow approval for first-time contributors.

**DoD:** CONTRIBUTING.md section added, screenshots included, approval process documented.

---

## Issue #9: Create Credential Rotation Runbook
**Labels:** `security`, `docs`, `runbook`  
**Priority:** Low

Create repeatable process for rotating credentials based on security incident learnings.

**DoD:** docs/CREDENTIAL_ROTATION.md created with step-by-step guide for each service.

---

## Issue #10: Enhance CI/CD Pipeline
**Labels:** `ci-cd`, `automation`, `docs`  
**Priority:** Low

Add documentation linting, link validation, and consistency checks to GitHub Actions.

**DoD:** Workflow validates markdown, checks links, runs on doc PRs.

---

All issues follow parent A→G acceptance template.
