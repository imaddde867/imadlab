-- Clear all existing analytics data to start fresh with enhanced tracking
-- This removes old entries that have 'unknown' values

DELETE FROM page_views;
DELETE FROM visitor_sessions;
-- Reset sequences if needed
-- Note: IDs will continue from current sequence, but all data is fresh;
