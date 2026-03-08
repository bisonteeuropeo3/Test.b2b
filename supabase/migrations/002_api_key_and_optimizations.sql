-- Update schema with API key support

-- Add API key to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS api_key TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS alert_threshold INTEGER DEFAULT 80;

-- Create index for API key lookups
CREATE INDEX IF NOT EXISTS idx_profiles_api_key ON public.profiles(api_key);

-- Add latency tracking to api_logs
ALTER TABLE public.api_logs 
ADD COLUMN IF NOT EXISTS latency_ms INTEGER,
ADD COLUMN IF NOT EXISTS prompt_hash TEXT;

-- Create index for prompt hash (duplicate detection)
CREATE INDEX IF NOT EXISTS idx_api_logs_prompt_hash ON public.api_logs(prompt_hash);

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
DECLARE
  key TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    key := 'tg_live_' || encode(gen_random_bytes(24), 'hex');
    
    SELECT EXISTS(
      SELECT 1 FROM public.profiles WHERE api_key = key
    ) INTO exists_check;
    
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN key;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate API key on profile creation
CREATE OR REPLACE FUNCTION set_api_key_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.api_key IS NULL THEN
    NEW.api_key := generate_api_key();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_set_api_key ON public.profiles;

-- Create trigger
CREATE TRIGGER trigger_set_api_key
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_api_key_on_insert();

-- Update RLS to allow API key lookups
CREATE POLICY "Allow API key lookup" ON public.profiles
  FOR SELECT USING (true);
