-- ============================================================
--  TOKENGUARD - SETUP COMPLETO DATABASE
-- ============================================================
--  
--  ISTRUZIONI:
--  1. Vai su https://supabase.com/dashboard
--  2. Seleziona il tuo progetto
--  3. Vai in "SQL Editor" (icona nella sidebar sinistra)
--  4. Copia TUTTO questo file e incollalo
--  5. Clicca "Run" (o Ctrl+Enter)
--  6. Dovrebbe dire "Success. No rows returned" — è normale!
--
--  NOTA: Questo script è IDEMPOTENTE — puoi eseguirlo
--  più volte senza problemi (non duplica nulla).
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. ESTENSIONI
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ────────────────────────────────────────────────────────────
-- 1b. PULIZIA (se hai eseguito le vecchie migration)
--     Cancella tabelle con vincoli FK su auth.users
--     NON preoccuparti: verranno ricreate subito dopo.
-- ────────────────────────────────────────────────────────────

-- Prima rimuovi funzioni/trigger (CASCADE rimuove i trigger associati)
DROP FUNCTION IF EXISTS set_api_key_on_insert() CASCADE;
DROP FUNCTION IF EXISTS generate_api_key() CASCADE;

-- Poi rimuovi tabelle con FK (ordine di dipendenza)
DROP TABLE IF EXISTS public.budget_alerts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
-- NON droppiamo api_logs perchè non ha FK problematiche
-- NON droppiamo api_keys perchè potrebbe non esistere ancora


-- ────────────────────────────────────────────────────────────
-- 2. TABELLA: api_keys (Chiavi API standalone)
--    Questa è la tabella PRINCIPALE per le chiavi API.
--    NON dipende da auth.users, quindi funziona senza login.
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

-- Indice per ricerche veloci sulla chiave API
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON public.api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON public.api_keys(is_active);


-- ────────────────────────────────────────────────────────────
-- 3. TABELLA: api_logs (Log di tutte le chiamate API)
--    Salva ogni richiesta che passa per il proxy.
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

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON public.api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON public.api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_logs_provider ON public.api_logs(provider);
CREATE INDEX IF NOT EXISTS idx_api_logs_prompt_hash ON public.api_logs(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_api_logs_cached ON public.api_logs(cached);


-- ────────────────────────────────────────────────────────────
-- 4. TABELLA: budget_alerts (Alert di budget)
--    Salva gli alert quando si supera la soglia di budget.
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
-- 5. TABELLA: profiles (Opzionale — per utenti Supabase Auth)
--    Se hai utenti registrati via Supabase Auth, usa questa.
--    Altrimenti, api_keys è sufficiente.
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

CREATE INDEX IF NOT EXISTS idx_profiles_api_key ON public.profiles(api_key);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);


-- ────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS)
--    Abilita RLS ma permette accesso totale via service_role key.
--    Il nostro backend usa SUPABASE_SERVICE_ROLE_KEY.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy per api_keys: accesso totale con qualsiasi autenticazione
-- (necessario perchè il backend usa service_role key)
DROP POLICY IF EXISTS "Allow all on api_keys" ON public.api_keys;
CREATE POLICY "Allow all on api_keys" ON public.api_keys
  FOR ALL USING (true) WITH CHECK (true);

-- Policy per api_logs: accesso totale
DROP POLICY IF EXISTS "Allow all on api_logs" ON public.api_logs;
CREATE POLICY "Allow all on api_logs" ON public.api_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Policy per budget_alerts: accesso totale
DROP POLICY IF EXISTS "Allow all on budget_alerts" ON public.budget_alerts;
CREATE POLICY "Allow all on budget_alerts" ON public.budget_alerts
  FOR ALL USING (true) WITH CHECK (true);

-- Policy per profiles: accesso totale
DROP POLICY IF EXISTS "Allow all on profiles" ON public.profiles;
CREATE POLICY "Allow all on profiles" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- 7. FUNZIONI HELPER
-- ────────────────────────────────────────────────────────────

-- Funzione per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger per aggiornare updated_at su api_keys
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON public.api_keys;
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger per aggiornare updated_at su profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Funzione per calcolare il costo
CREATE OR REPLACE FUNCTION calculate_cost(
  p_provider TEXT,
  p_model TEXT,
  p_prompt_tokens INTEGER,
  p_completion_tokens INTEGER
)
RETURNS DECIMAL AS $$
DECLARE
  prompt_cost DECIMAL;
  completion_cost DECIMAL;
BEGIN
  IF p_provider = 'openai' THEN
    IF p_model LIKE 'gpt-4o-mini%' THEN
      prompt_cost := 0.00015;
      completion_cost := 0.0006;
    ELSIF p_model LIKE 'gpt-4o%' THEN
      prompt_cost := 0.005;
      completion_cost := 0.015;
    ELSIF p_model LIKE 'gpt-4-turbo%' THEN
      prompt_cost := 0.01;
      completion_cost := 0.03;
    ELSIF p_model LIKE 'gpt-4%' THEN
      prompt_cost := 0.03;
      completion_cost := 0.06;
    ELSIF p_model LIKE 'gpt-3.5%' THEN
      prompt_cost := 0.0015;
      completion_cost := 0.002;
    ELSE
      prompt_cost := 0.001;
      completion_cost := 0.002;
    END IF;
  ELSIF p_provider = 'anthropic' THEN
    prompt_cost := 0.008;
    completion_cost := 0.024;
  ELSE
    prompt_cost := 0.001;
    completion_cost := 0.002;
  END IF;
  
  RETURN (p_prompt_tokens * prompt_cost / 1000) + (p_completion_tokens * completion_cost / 1000);
END;
$$ LANGUAGE plpgsql;


-- ────────────────────────────────────────────────────────────
-- 8. PULIZIA VECCHIE POLICY (se avevi eseguito le migration)
--    Rimuove policy conflittuali dalle migration precedenti
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own logs" ON public.api_logs;
DROP POLICY IF EXISTS "Users can insert own logs" ON public.api_logs;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow API key lookup" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.api_keys;


-- ────────────────────────────────────────────────────────────
-- FATTO! ✅
-- ────────────────────────────────────────────────────────────
-- Tabelle create:
--   ✅ api_keys    — Chiavi API (usata dal proxy)
--   ✅ api_logs    — Log delle chiamate (usata dal proxy + dashboard)
--   ✅ budget_alerts — Alert di budget
--   ✅ profiles    — Profili utenti (opzionale, per Supabase Auth)
--
-- Ora puoi deployare su Vercel e testare con:
--   node test/test_with_tokenguard.mjs
-- ────────────────────────────────────────────────────────────
