
-- Add CSS and JavaScript columns to sub_pages table if they don't exist
ALTER TABLE public.sub_pages 
ADD COLUMN IF NOT EXISTS css TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS javascript TEXT DEFAULT '';
