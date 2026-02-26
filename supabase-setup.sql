-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lhnorkjfldywnrqqunqn/sql/new

-- Designs table — stores rendered images per user/budget/space
CREATE TABLE IF NOT EXISTS vatika_designs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  budget integer NOT NULL,
  space_type text NOT NULL DEFAULT 'balcony',
  render_url text NOT NULL,
  prompt text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, budget, space_type)
);

-- Enable Row Level Security
ALTER TABLE vatika_designs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own designs
CREATE POLICY "Users can read own designs"
  ON vatika_designs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own designs"
  ON vatika_designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own designs"
  ON vatika_designs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own designs"
  ON vatika_designs FOR DELETE
  USING (auth.uid() = user_id);
