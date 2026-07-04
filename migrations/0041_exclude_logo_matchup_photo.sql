-- 0041_exclude_logo_matchup_photo.sql
-- Exclude the LGFC logo image from weekly matchup rotation (homepage crop clips the logo).

UPDATE photos
SET is_matchup_eligible = -1
WHERE url LIKE '%IMG_4026.jpeg%';
