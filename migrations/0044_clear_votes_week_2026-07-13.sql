-- 0044_clear_votes_week_2026-07-13.sql
-- Production remediation for #2519 follow-up:
-- Mid-week pair replacement left prior weekly_votes attached to the new photos.
-- Clear votes for the current week so A/B totals restart for the replacement pair.

DELETE FROM weekly_votes
WHERE week_start = '2026-07-13';
