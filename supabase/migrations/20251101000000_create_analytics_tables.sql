-- Create visitor_sessions table
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  country TEXT,
  region TEXT,
  city TEXT
);

-- Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  referrer TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_created_at ON visitor_sessions(created_at);

-- Enable Row Level Security
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for tracking)
CREATE POLICY "Allow public insert on visitor_sessions" ON visitor_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on page_views" ON page_views
  FOR INSERT WITH CHECK (true);

-- Allow public selects (needed for UPSERT operations)
-- Analytics data is not sensitive, dashboard access is controlled by app-level auth
CREATE POLICY "Allow public select on visitor_sessions" ON visitor_sessions
  FOR SELECT USING (true);

CREATE POLICY "Allow public select on page_views" ON page_views
  FOR SELECT USING (true);

-- Allow public updates (for session activity and page duration)
CREATE POLICY "Allow public update on visitor_sessions" ON visitor_sessions
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public update on page_views" ON page_views
  FOR UPDATE USING (true) WITH CHECK (true);
