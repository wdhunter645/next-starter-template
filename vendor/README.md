# Historical content code collection

Authority: LGFC Issue #2878

Branch: `component/historical-code-collection`

This directory contains isolated third-party source and bounded adaptations collected for evaluation against LGFC historical-content, digital-library, archival-media, gallery, search, attribution, and rights requirements.

## Collected upstream projects

| Directory | Upstream | License | Collected capability | Integration state |
|---|---|---|---|---|
| `collectionbuilder/` | `CollectionBuilder/collectionbuilder-csv` | MIT | Search, advanced metadata search, item-page composition, metadata rendering, citations, rights display | Upstream Liquid/Bootstrap source preserved; not connected to production |
| `openseadragon/` | `openseadragon/openseadragon` | BSD-3-Clause | Archival/deep-zoom image geometry foundation | Bounded source adaptation preserved; not connected to production |
| `photoswipe/` | `dimsemenov/PhotoSwipe` | MIT | Responsive gallery viewport and pan-area sizing | Bounded source adaptation preserved; not connected to production |

## Rules

- Every directory must retain its upstream license and source attribution.
- GPL code is excluded from this branch.
- Collected code remains isolated from application routes until architecture, security, accessibility, dependency, and licensing review passes.
- Any adaptation must identify the upstream file and preserve applicable notices.
- Final LGFC implementation should prefer maintained package dependencies where practical rather than indefinitely carrying vendored copies.

## Current purpose

The collection is intended to accelerate the LGFC design and implementation work by providing immediately inspectable, reusable code for:

- metadata-driven historical item pages;
- library search and field filtering;
- attribution and rights presentation;
- high-resolution archival media;
- responsive photo and artifact galleries.
