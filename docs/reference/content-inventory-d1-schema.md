# D1 Content Inventory Schema

Table: content_inventory

Columns:
- id (pk)
- tag
- title
- text
- media (json)
- story_type (primary|secondary|brief)
- allowed_sections (json array)
- priority
- search_text
- canonical (boolean)
- source_name
- source_url
- credit_line
- event_date
- rotation_group
- last_featured
- feature_weight

Rule: D1 is source of truth for all content and layout logic.
