-- Add new columns to visitor_sessions table for enhanced analytics
ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS device_type TEXT;
ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS browser TEXT;
ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS os TEXT;
ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS screen_resolution TEXT;
ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS timezone TEXT;

-- Add new columns to page_views table for traffic source tracking
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS traffic_source TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS utm_term TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS device_type TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS browser TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS os TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS city TEXT;

-- Create indexes for new columns to improve query performance
CREATE INDEX IF NOT EXISTS idx_page_views_traffic_source ON page_views(traffic_source);
CREATE INDEX IF NOT EXISTS idx_page_views_utm_source ON page_views(utm_source);
CREATE INDEX IF NOT EXISTS idx_page_views_utm_campaign ON page_views(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_page_views_device_type ON page_views(device_type);
CREATE INDEX IF NOT EXISTS idx_page_views_browser ON page_views(browser);
CREATE INDEX IF NOT EXISTS idx_page_views_country ON page_views(country);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_device_type ON visitor_sessions(device_type);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_country ON visitor_sessions(country);

-- Create a view for aggregated analytics
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
  DATE_TRUNC('day', viewed_at) as date,
  COUNT(*) as total_views,
  COUNT(DISTINCT session_id) as unique_visitors,
  COUNT(DISTINCT CASE WHEN referrer IS NULL OR referrer = '' THEN session_id END) as direct_visitors,
  COUNT(DISTINCT CASE WHEN traffic_source = 'search' THEN session_id END) as search_visitors,
  COUNT(DISTINCT CASE WHEN traffic_source = 'social' THEN session_id END) as social_visitors,
  COUNT(DISTINCT CASE WHEN traffic_source = 'referral' THEN session_id END) as referral_visitors,
  AVG(duration) as avg_duration,
  COUNT(DISTINCT path) as unique_pages
FROM page_views
GROUP BY DATE_TRUNC('day', viewed_at)
ORDER BY date DESC;
