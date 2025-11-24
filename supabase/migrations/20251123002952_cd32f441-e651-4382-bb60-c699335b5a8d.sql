-- Add missing columns to admin_content table
ALTER TABLE public.admin_content
ADD COLUMN IF NOT EXISTS content_type TEXT,
ADD COLUMN IF NOT EXISTS mood TEXT,
ADD COLUMN IF NOT EXISTS body TEXT;

-- Make file_url nullable since text-only content won't have files
ALTER TABLE public.admin_content
ALTER COLUMN file_url DROP NOT NULL;

-- Make file_name nullable since text-only content won't have files
ALTER TABLE public.admin_content
ALTER COLUMN file_name DROP NOT NULL;