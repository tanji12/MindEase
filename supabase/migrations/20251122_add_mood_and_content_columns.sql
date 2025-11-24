-- Add content_type, mood and body columns to admin_content
-- Create app_mood enum and alter admin_content to support new content types

CREATE TYPE IF NOT EXISTS public.app_mood AS ENUM ('relax', 'sad', 'happy', 'stressed', 'motivated');

-- Add content_type column and allow more flexible file_url
ALTER TABLE public.admin_content
  ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'music',
  ADD COLUMN IF NOT EXISTS mood public.app_mood,
  ADD COLUMN IF NOT EXISTS body text;

-- Make file_url nullable to allow storing text-only content
ALTER TABLE public.admin_content
  ALTER COLUMN file_url DROP NOT NULL;

-- Populate content_type from existing file_type values where possible
UPDATE public.admin_content
SET content_type = CASE
  WHEN file_type = 'audio' THEN 'music'
  WHEN file_type = 'pdf' THEN 'book'
  ELSE file_type
END
WHERE content_type IS NULL OR content_type = '';

-- Add a check constraint to ensure content_type is one of the supported values
ALTER TABLE public.admin_content
  ADD CONSTRAINT admin_content_content_type_check
  CHECK (content_type IN ('music','book','quote','tilawat','ayat'));

-- Note: If you use migrations tooling that requires a down script, add one accordingly.
