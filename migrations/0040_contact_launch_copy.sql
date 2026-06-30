-- 0040_contact_launch_copy.sql
-- Purpose: Align seeded /contact CMS copy with Task #2042 launch reconciliation.
-- Idempotent: updates only when legacy seed copy is still present.

UPDATE page_content
SET content = '<p>The Lou Gehrig Fan Club is fan-run. Email is the fastest way to reach us for questions, source corrections, contributions, or partnerships.</p><p>Use Support for general help. Use Admin for operational or governance questions. If you are unsure, email Support and we will route your note.</p>'
WHERE slug = '/contact'
  AND section = 'lead_html'
  AND content LIKE '%LouGehrigFanClub@gmail.com%';

UPDATE page_content
SET content = '<h2>Good reasons to email</h2><ul><li>You found an error and can provide a source to correct it.</li><li>You want to contribute photos, clippings, memorabilia, or a sourced story for club review.</li><li>You are coordinating ALS awareness or Lou Gehrig Day community activity. This is not a live LGFC website fundraiser campaign.</li><li>You want to suggest a charity, event, or community partner.</li></ul><h2>What to include</h2><ul><li>A short subject line (e.g., “Photo submission”, “Correction”, “Partnership”).</li><li>Links to sources or attachments (if you have them).</li><li>Any usage notes (credit line, rights, or how we should attribute the item).</li></ul>'
WHERE slug = '/contact'
  AND section = 'body_html'
  AND content LIKE '%LouGehrigFanClub@gmail.com%';
