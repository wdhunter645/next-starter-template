---
Doc Type: Operations
Audience: Human + AI
Authority Level: Controlled
Owns: T23 FAQ CMS moderation task scope
Does Not Own: Events page (T23-E)
Canonical Reference: /docs/reference/architecture/faq-system.md
Last Reviewed: 2026-05-20
---

# T23 — FAQ CMS moderation

Objective: operational admin layer for ask inbox triage and FAQ publishing.

Scope:
- `/admin/faq` moderation UI
- `POST/GET` admin FAQ and ask inbox APIs
- D1 `ask_inbox` + `faq_entries` moderation workflows

Exit:
- admins can approve/reject/archive ask submissions
- admins can create/edit/publish/pin/delete FAQs
- public `/faq` and homepage FAQ remain stable

Delivery: PR #1072 (`website/t23-faq-moderation-cms`)
