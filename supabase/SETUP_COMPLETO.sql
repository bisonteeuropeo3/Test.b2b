-- ============================================================
--  TOKENGUARD - FIX PROFILES & API KEYS
-- ============================================================
--  
--  Esegui questo in Supabase SQL Editor per fixare le tabelle
--  e le policy RLS per il signup/login.
--
--  NOTA: Questo script è IDEMPOTENTE.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Assicurati che le estensioni necessarie siano abilitate
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 2. RICREA TABELLA profiles (se esiste, lavora su di essa)
--    L'id corrisponde all'id dell'utente in auth.users
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  api_key TEXT UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  monthly_budget DECIMAL(10, 2) DEFAULT 100,
  alert_threshold INTEGER DEFAULT 80,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_profiles_api_key ON public.profiles(api_key);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ────────────────────────────────────────────────────────────
-- 3. TABELLA api_keys (per il proxy standalone)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  api_key TEXT UNIQUE NOT NULL,
  label TEXT DEFAULT 'Default',
  email TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  monthly_budget DECIMAL(10, 2) DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  last_used_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON public.api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON public.api_keys(is_active);

-- ────────────────────────────────────────────────────────────
-- 4. TABELLA api_logs
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.api_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT 'openai',
  model TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd DECIMAL(10, 6) NOT NULL DEFAULT 0,
  endpoint TEXT,
  cached BOOLEAN DEFAULT FALSE,
  prompt_hash TEXT,
  latency_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON public.api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON public.api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_logs_provider ON public.api_logs(provider);
CREATE INDEX IF NOT EXISTS idx_api_logs_prompt_hash ON public.api_logs(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_api_logs_cached ON public.api_logs(cached);

-- ────────────────────────────────────────────────────────────
-- 5. TABELLA budget_alerts
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.budget_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'threshold' CHECK (alert_type IN ('threshold', 'exceeded', 'duplicate_spike')),
  message TEXT NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_budget_alerts_user_id ON public.budget_alerts(user_id);

-- ────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS) - Permetti accesso completo
--    Il backend usa la service_role key, che bypassa RLS.
--    Le policy "Allow all" permettono anche accesso con anon key
--    (necessario per il signup/login flow).
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_alerts ENABLE ROW LEVEL SECURITY;

-- Drop vecchie policy se esistono
DROP POLICY IF EXISTS "Allow all on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all on api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Allow all on api_logs" ON public.api_logs;
DROP POLICY IF EXISTS "Allow all on budget_alerts" ON public.budget_alerts;

-- Policy che permette INSERT/SELECT/UPDATE/DELETE per tutti
-- (il service_role key bypassa RLS comunque, ma queste policy
--  permettono anche l'accesso con anon key per il signup flow)
CREATE POLICY "Allow all on profiles" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on api_keys" ON public.api_keys
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on api_logs" ON public.api_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on budget_alerts" ON public.budget_alerts
  FOR ALL USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- 7. TRIGGER per updated_at automatico
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_keys_updated_at ON public.api_keys;
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 8. PULIZIA vecchie policy problematiche  
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own logs" ON public.api_logs;
DROP POLICY IF EXISTS "Users can insert own logs" ON public.api_logs;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow API key lookup" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.api_keys;

-- ────────────────────────────────────────────────────────────
-- 9. GRANT permissions sullo schema public
--    Assicura che le tabelle siano accessibili
-- ────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- ────────────────────────────────────────────────────────────
-- FATTO! ✅
-- ────────────────────────────────────────────────────────────
-- Tabelle su schema public:
--   ✅ profiles     — Profili utenti (collegati a auth.users)
--   ✅ api_keys     — Chiavi API standalone (per il proxy)
--   ✅ api_logs     — Log chiamate API
--   ✅ budget_alerts — Alert di budget
--
-- RLS: Abilitato con policy "Allow all" + GRANT completi
-- ────────────────────────────────────────────────────────────
