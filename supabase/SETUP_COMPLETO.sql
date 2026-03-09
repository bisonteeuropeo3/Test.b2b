-- ============================================================
--  TOKENGUARD - SETUP COMPLETO (v2)
-- ============================================================
--  Esegui questo in Supabase SQL Editor.
--  Questo script è IDEMPOTENTE (puoi eseguirlo più volte).
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Estensioni necessarie
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 2. TABELLA profiles
--    id = auth.users.id (FK verso auth.users)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  company_name TEXT,
  api_key     TEXT UNIQUE,
  plan        TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  monthly_budget DECIMAL(10, 2) DEFAULT 100,
  alert_threshold INTEGER DEFAULT 80,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_api_key ON public.profiles(api_key);
CREATE INDEX IF NOT EXISTS idx_profiles_email    ON public.profiles(email);

-- ────────────────────────────────────────────────────────────
-- 3. TABELLA api_keys
--    Aggiunta colonna user_id → FK verso profiles.id
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.api_keys (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  api_key     TEXT UNIQUE NOT NULL,
  label       TEXT DEFAULT 'Default',
  email       TEXT,
  plan        TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  monthly_budget DECIMAL(10, 2) DEFAULT 100,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  last_used_at TIMESTAMP WITH TIME ZONE,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_api_keys_api_key   ON public.api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active  ON public.api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id    ON public.api_keys(user_id);

-- Se la tabella esiste già senza user_id, aggiungila:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'api_keys'
      AND column_name  = 'user_id'
  ) THEN
    ALTER TABLE public.api_keys
      ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 4. TABELLA api_logs
--    user_id → FK verso profiles.id (= auth.users.id)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.api_logs (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider          TEXT NOT NULL DEFAULT 'openai',
  model             TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
  prompt_tokens     INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens      INTEGER NOT NULL DEFAULT 0,
  cost_usd          DECIMAL(10, 6) NOT NULL DEFAULT 0,
  endpoint          TEXT,
  cached            BOOLEAN DEFAULT FALSE,
  prompt_hash       TEXT,
  latency_ms        INTEGER,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_api_logs_user_id     ON public.api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at  ON public.api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_logs_provider    ON public.api_logs(provider);
CREATE INDEX IF NOT EXISTS idx_api_logs_prompt_hash ON public.api_logs(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_api_logs_cached      ON public.api_logs(cached);

-- ────────────────────────────────────────────────────────────
-- 5. TABELLA budget_alerts
--    user_id → FK verso profiles.id
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.budget_alerts (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL DEFAULT 'threshold' CHECK (alert_type IN ('threshold', 'exceeded', 'duplicate_spike')),
  message    TEXT NOT NULL,
  sent       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_budget_alerts_user_id ON public.budget_alerts(user_id);

-- ────────────────────────────────────────────────────────────
-- 6. TRIGGER auto-creazione profilo su signup
--    Quando Supabase crea un utente in auth.users,
--    crea automaticamente il profilo in public.profiles
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_api_key TEXT;
BEGIN
  -- Genera una API key univoca
  new_api_key := 'tg_live_' || lower(replace(gen_random_uuid()::TEXT, '-', '')) || lower(replace(gen_random_uuid()::TEXT, '-', ''));
  new_api_key := left(new_api_key, 56); -- tg_live_ (8) + 48 chars

  INSERT INTO public.profiles (id, email, api_key, plan, monthly_budget, alert_threshold)
  VALUES (
    NEW.id,
    NEW.email,
    new_api_key,
    'free',
    100,
    80
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Collega il trigger a auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 7. TRIGGER updated_at automatico
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
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_keys_updated_at ON public.api_keys;
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 8. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_alerts ENABLE ROW LEVEL SECURITY;

-- Rimuovi tutte le vecchie policy
DROP POLICY IF EXISTS "Allow all on profiles"      ON public.profiles;
DROP POLICY IF EXISTS "Allow all on api_keys"      ON public.api_keys;
DROP POLICY IF EXISTS "Allow all on api_logs"      ON public.api_logs;
DROP POLICY IF EXISTS "Allow all on budget_alerts" ON public.budget_alerts;
DROP POLICY IF EXISTS "Users can view own profile"    ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"  ON public.profiles;
DROP POLICY IF EXISTS "Allow API key lookup"           ON public.profiles;
DROP POLICY IF EXISTS "Service role full access"       ON public.api_keys;
DROP POLICY IF EXISTS "Users can view own logs"        ON public.api_logs;
DROP POLICY IF EXISTS "Users can insert own logs"      ON public.api_logs;

-- PROFILES: ogni utente vede/modifica solo il proprio profilo
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_service" ON public.profiles
  FOR INSERT WITH CHECK (true);  -- Il service_role bypassa comunque

-- API_KEYS: ogni utente vede solo le proprie chiavi
CREATE POLICY "api_keys_select_own" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "api_keys_insert_service" ON public.api_keys
  FOR ALL WITH CHECK (true);

-- API_LOGS: ogni utente vede solo i propri log
CREATE POLICY "api_logs_select_own" ON public.api_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "api_logs_insert_service" ON public.api_logs
  FOR INSERT WITH CHECK (true);

-- BUDGET_ALERTS: ogni utente vede solo i propri alert
CREATE POLICY "budget_alerts_select_own" ON public.budget_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "budget_alerts_insert_service" ON public.budget_alerts
  FOR INSERT WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- 9. GRANT permissions
-- ────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES    IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- ────────────────────────────────────────────────────────────
-- ✅ SCHEMA COMPLETO
-- ────────────────────────────────────────────────────────────
-- Struttura relazionale:
--
--   auth.users  ──(1:1)──►  profiles
--                                │
--                    ┌───────────┴───────────┐
--                    │                       │
--              api_keys (1:N)         api_logs (1:N)
--
--   profiles ──(1:N)──► budget_alerts
--
-- Trigger: on_auth_user_created → crea profilo automaticamente
-- RLS: ogni utente vede solo i propri dati
-- Service Role: bypassa RLS per le operazioni server-side
-- ────────────────────────────────────────────────────────────
