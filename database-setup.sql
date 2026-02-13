# Database Setup Script for Supabase

Run this SQL script in your Supabase SQL Editor to set up the database.

```sql
-- ============================================
-- RETURN GIFT - DATABASE SCHEMA
-- ============================================
-- This script creates all necessary tables, 
-- indexes, and Row Level Security policies
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  mood TEXT CHECK (mood IN ('romantic', 'playful', 'nostalgic', 'adventurous')),
  layout_style TEXT CHECK (layout_style IN ('collage', 'timeline', 'polaroid', 'journal', 'grid')),
  color_theme TEXT,
  ai_caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  public_id TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  ai_generated_caption TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES (for performance)
-- ============================================

-- Index on user_id for faster event queries
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);

-- Index on event_id for faster photo queries
CREATE INDEX IF NOT EXISTS idx_photos_event_id ON public.photos(event_id);

-- Index on date for sorting
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own events" ON public.events;
DROP POLICY IF EXISTS "Users can create their own events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;

DROP POLICY IF EXISTS "Users can view photos of their events" ON public.photos;
DROP POLICY IF EXISTS "Users can create photos for their events" ON public.photos;
DROP POLICY IF EXISTS "Users can update photos of their events" ON public.photos;
DROP POLICY IF EXISTS "Users can delete photos of their events" ON public.photos;

-- Events policies
CREATE POLICY "Users can view their own events"
  ON public.events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON public.events FOR DELETE
  USING (auth.uid() = user_id);

-- Photos policies
CREATE POLICY "Users can view photos of their events"
  ON public.photos FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM public.events WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create photos for their events"
  ON public.photos FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM public.events WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update photos of their events"
  ON public.photos FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM public.events WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos of their events"
  ON public.photos FOR DELETE
  USING (
    event_id IN (
      SELECT id FROM public.events WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to insert sample data
/*
-- Get your user ID first by running: SELECT id FROM auth.users LIMIT 1;
-- Replace 'YOUR_USER_ID' below

INSERT INTO public.events (user_id, title, date, notes, mood, ai_caption)
VALUES 
  ('YOUR_USER_ID', 'Beach Sunset', '2024-07-15', 'Perfect evening', 'romantic', 'The way we watched the waves...'),
  ('YOUR_USER_ID', 'Coffee Date', '2024-08-20', 'Our favorite spot', 'nostalgic', 'We talked for hours...'),
  ('YOUR_USER_ID', 'Mountain Hike', '2024-09-10', 'Amazing views', 'adventurous', 'Every trail we conquered...');
*/

-- ============================================
-- GRANTS (ensure API can access tables)
-- ============================================

GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.photos TO authenticated;

-- ============================================
-- CLEANUP FUNCTIONS (Optional)
-- ============================================

-- Function to delete old events (run manually or via cron)
CREATE OR REPLACE FUNCTION public.cleanup_old_events(days_old INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.events
  WHERE created_at < NOW() - INTERVAL '1 day' * days_old;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify setup:

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('events', 'photos');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('events', 'photos');

-- Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('events', 'photos');

-- ============================================
-- COMPLETE! 🎉
-- ============================================
```

## Post-Setup Checklist

After running the script:

1. ✅ Verify tables were created
2. ✅ Check RLS is enabled
3. ✅ Test inserting a sample event
4. ✅ Copy your Supabase URL and keys to `.env.local`

## Testing Queries

```sql
-- Test insert (replace YOUR_USER_ID)
INSERT INTO events (user_id, title, date)
VALUES ('YOUR_USER_ID', 'Test Event', NOW());

-- Test select
SELECT * FROM events;

-- Test RLS (should only show your events)
SELECT * FROM events WHERE user_id = auth.uid();

-- Clean up test
DELETE FROM events WHERE title = 'Test Event';
```

## Need Help?

- Supabase Docs: https://supabase.com/docs/guides/database
- RLS Guide: https://supabase.com/docs/guides/auth/row-level-security
