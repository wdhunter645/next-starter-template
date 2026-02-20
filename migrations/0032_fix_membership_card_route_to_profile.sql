-- Correct legacy Membership Card route references.
-- The membercard page was removed; content now lives under /fanclub/myprofile.
-- Idempotent update.

UPDATE membership_card_content
SET body_md = REPLACE(body_md, '/member/card', '/fanclub/myprofile'),
    updated_at = datetime('now')
WHERE body_md LIKE '%/member/card%';

UPDATE membership_card_content
SET body_md = REPLACE(body_md, '/fanclub/membercard', '/fanclub/myprofile'),
    updated_at = datetime('now')
WHERE body_md LIKE '%/fanclub/membercard%';
