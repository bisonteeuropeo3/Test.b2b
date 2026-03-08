-- Migration: Add standalone api_keys table
-- This table stores API keys independently of auth.users
-- so that keys generated from the Settings page work with the proxy

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  api_key TEXT UNIQUE NOT NULL,
  label TEXT DEFAULT 'Default',
  email TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  monthly_budget DECIMAL(10, 2) DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Index for fast API key lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON public.api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_profile_id ON public.api_keys(profile_id);

-- Allow service role full access (no RLS restrictions for server-side)
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: allow all operations via service role key (used by our API routes)
CREATE POLICY "Service role full access" ON public.api_keys
  USING (true)
  WITH CHECK (true);
