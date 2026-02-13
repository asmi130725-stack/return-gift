-- Add photo positioning columns to photos table (PIXEL-BASED SYSTEM)
-- Run this in Supabase SQL Editor

ALTER TABLE public.photos
ADD COLUMN IF NOT EXISTS position_x INTEGER,
ADD COLUMN IF NOT EXISTS position_y INTEGER,
ADD COLUMN IF NOT EXISTS width INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS scale DECIMAL(5,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS rotation DECIMAL(6,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS crop_data JSONB;

-- Add helpful comments
COMMENT ON COLUMN public.photos.position_x IS 'X position in pixels relative to 1200px canvas';
COMMENT ON COLUMN public.photos.position_y IS 'Y position in pixels relative to 800px canvas';
COMMENT ON COLUMN public.photos.width IS 'Width in pixels on canvas';
COMMENT ON COLUMN public.photos.height IS 'Height in pixels on canvas';
COMMENT ON COLUMN public.photos.scale IS 'Scale factor (0.3 to 3.0)';
COMMENT ON COLUMN public.photos.rotation IS 'Rotation in degrees (-360 to 360)';
COMMENT ON COLUMN public.photos.crop_data IS 'Crop data as JSON: {x, y, width, height} in pixels relative to natural image size';
