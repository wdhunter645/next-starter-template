---
Doc Type: Reference
Audience: Human + AI
Authority Level: Supporting
Owns: Current LGFC vendor inventory for architecture and workflow documentation
Does Not Own: Vendor contracts, credentials, runtime configuration, implementation code, or diagram assets
Canonical Reference: /docs/reference/architecture/vendor-inventory.md
Last Reviewed: 2026-05-30
---

# LGFC Vendor Inventory

## Purpose

This document records the current LGFC vendor inventory for architecture discussions, workflow documentation, and future diagram accuracy.

It gives maintainers and AI agents a single reference for which vendors are active, which vendor roles are current, and which available vendors remain future or inactive.

## Scope

This reference covers LGFC vendors and vendor-adjacent services currently used or explicitly available for future use.

It does not define vendor contracts, credentials, implementation code, runtime configuration, procurement decisions, or any diagram asset file.

## Current known truth

The LGFC ecosystem currently uses vendors across design, development, repository operations, PR review, repository analysis, hosting, storage, email, website integrations, fundraising, merchandise, and social platforms.

Zapier is available but not currently active. It must be shown as future or inactive in architecture diagrams unless later activated.

## Intended final state

This document should remain the current vendor source for LGFC architecture and workflow documentation.

If a vendor is added, removed, activated, retired, or reclassified, this document should be updated before dependent architecture diagrams or workflow docs are updated.

## Design, Development, and Repository Operations

- OpenAI
- Codex ChatBot
- Cursor
- GitHub
- GitHub Copilot

## PR Reviewers

- Cubic
- GitHub Copilot
- Gemini
- Codex ChatBot

## Gate Checks and Repository Analysis

- Semgrep
- Deepwiki

## Repository Wiki

- Cubic

## Hosting, Storage, Email, Website Integrations, and Social Platforms

- Cloudflare
- Backblaze B2
- Apple iCloud Mail
- MailChannels
- Elfsight
- Givebutter
- Bonfire
- Facebook
- Instagram
- Pinterest
- X (Twitter)

## Future / Available Vendors

- Zapier — available, but not currently in use.

## Notes

- This document lists LGFC vendors in use and one available future automation vendor.
- Bonfire is the LGFC store vendor.
- Apple iCloud Mail is used for the custom email domain mailbox layer.
- MailChannels is used for outbound transactional email delivery.
- Zapier must be shown as future or inactive in architecture diagrams unless later activated.
