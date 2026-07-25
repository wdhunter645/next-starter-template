-- 0044_exclude_matchup_photo_390.sql
-- Product Authority exclusion for #2864:
-- Prevent D1 photo id 390 / IMG_4642.jpeg from appearing in future homepage
-- Weekly Photo Matchups. Preserve the D1 row and B2 object.

UPDATE photos
SET
  is_matchup_eligible = -1,
  rights_notes = CASE
    WHEN rights_notes IS NULL OR TRIM(rights_notes) = ''
      THEN 'MATCHUP_EXCLUDED: Product Authority; retain D1 row and B2 object (#2864, 2026-07-25)'
    ELSE rights_notes || ' | MATCHUP_EXCLUDED: Product Authority; retain D1 row and B2 object (#2864, 2026-07-25)'
  END
WHERE id = 390
  AND url LIKE '%IMG_4642.jpeg%'
  AND is_matchup_eligible >= 0;
