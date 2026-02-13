-- ============================================
-- DATABASE UPDATE SCRIPT
-- Run this in Supabase SQL Editor to update constraints
-- ============================================

-- STEP 1: Drop old constraints FIRST (to allow updating data)
ALTER TABLE public.events
DROP CONSTRAINT IF EXISTS events_mood_check;

ALTER TABLE public.events
DROP CONSTRAINT IF EXISTS events_layout_style_check;

-- STEP 2: Update existing events to use new template naming
-- Map old layout styles and removed templates to remaining templates
UPDATE public.events
SET layout_style = CASE 
  WHEN layout_style = 'collage' THEN 'template1'
  WHEN layout_style = 'timeline' THEN 'template2'
  WHEN layout_style = 'polaroid' THEN 'template3'
  WHEN layout_style = 'journal' THEN 'template3'
  WHEN layout_style = 'grid' THEN 'template6'
  WHEN layout_style = 'template4' THEN 'template3'
  WHEN layout_style = 'template5' THEN 'template6'
  ELSE 'template1'
END
WHERE layout_style NOT IN ('template1', 'template2', 'template3', 'template6')
   OR layout_style IS NULL;

-- STEP 3: Add new constraints with updated values (only 4 templates)
ALTER TABLE public.events
ADD CONSTRAINT events_mood_check 
CHECK (mood IN ('romantic', 'playful', 'nostalgic', 'adventurous', 'joyful', 'peaceful'));

ALTER TABLE public.events
ADD CONSTRAINT events_layout_style_check 
CHECK (layout_style IN ('template1', 'template2', 'template3', 'template6'));
