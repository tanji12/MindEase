-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- RLS policy: Only admins can insert roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS policy: Only admins can delete roles
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage buckets for admin content
INSERT INTO storage.buckets (id, name, public) 
VALUES ('admin-audio', 'admin-audio', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('admin-pdfs', 'admin-pdfs', true);

-- Storage policies for audio bucket
CREATE POLICY "Admins can upload audio"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'admin-audio' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Everyone can view audio"
ON storage.objects
FOR SELECT
USING (bucket_id = 'admin-audio');

CREATE POLICY "Admins can delete audio"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'admin-audio'
  AND public.has_role(auth.uid(), 'admin')
);

-- Storage policies for PDFs bucket
CREATE POLICY "Admins can upload PDFs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'admin-pdfs'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Everyone can view PDFs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'admin-pdfs');

CREATE POLICY "Admins can delete PDFs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'admin-pdfs'
  AND public.has_role(auth.uid(), 'admin')
);

-- Create admin_content table to track uploaded files
CREATE TABLE public.admin_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_type TEXT NOT NULL CHECK (file_type IN ('audio', 'pdf')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_content
ALTER TABLE public.admin_content ENABLE ROW LEVEL SECURITY;

-- Everyone can view content
CREATE POLICY "Everyone can view content"
ON public.admin_content
FOR SELECT
USING (true);

-- Only admins can insert content
CREATE POLICY "Admins can insert content"
ON public.admin_content
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update content
CREATE POLICY "Admins can update content"
ON public.admin_content
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete content
CREATE POLICY "Admins can delete content"
ON public.admin_content
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at
CREATE TRIGGER update_admin_content_updated_at
BEFORE UPDATE ON public.admin_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed admin role for the intended admin email
-- Ensure this matches the admin user created below (or the user you want to grant admin)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'emamul25662@gmail.com';

-- Ensure the admin auth user exists. This inserts into `auth.users` only if the
-- email does not already exist. It uses pgcrypto to hash the password.
-- WARNING: Directly inserting into `auth.users` depends on your Supabase
-- version/schema. Test on a development database first.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'emamul25662@gmail.com') THEN
    INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at)
    VALUES (
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'emamul25662@gmail.com',
      crypt('Admin11', gen_salt('bf')),
      NOW(),
      NOW()
    );
  END IF;
END
$$;