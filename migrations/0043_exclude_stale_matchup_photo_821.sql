-- 0043_exclude_stale_matchup_photo_821.sql
-- Production remediation for #2519:
-- Photo B (D1 id 821 / IMG_9657.png) was deleted from B2 while the D1 row remained
-- matchup-eligible. Exclude it from selection and mark the row purge-eligible for later cleanup.
-- photos has no purge_eligible column; rights_notes carries the purge marker.

UPDATE photos
SET
  is_matchup_eligible = -1,
  rights_notes = CASE
    WHEN rights_notes IS NULL OR TRIM(rights_notes) = ''
      THEN 'PURGE_ELIGIBLE: B2 object missing after manual delete; OK to remove (#2519, 2026-07-15)'
    ELSE rights_notes || ' | PURGE_ELIGIBLE: B2 object missing after manual delete; OK to remove (#2519, 2026-07-15)'
  END
WHERE id = 821
  AND url LIKE '%IMG_9657.png%';
