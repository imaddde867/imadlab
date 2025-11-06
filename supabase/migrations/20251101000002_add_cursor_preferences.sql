-- Create table to persist visitor cursor preferences
CREATE TABLE IF NOT EXISTS cursor_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  cursor_name TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index to quickly filter by latest updates
CREATE INDEX IF NOT EXISTS idx_cursor_preferences_updated_at ON cursor_preferences(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE cursor_preferences ENABLE ROW LEVEL SECURITY;

-- Allow anonymous clients to upsert/delete their own record
CREATE POLICY "Allow public insert on cursor_preferences" ON cursor_preferences
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on cursor_preferences" ON cursor_preferences
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete on cursor_preferences" ON cursor_preferences
  FOR DELETE USING (true);

CREATE POLICY "Allow public select on cursor_preferences" ON cursor_preferences
  FOR SELECT USING (true);
