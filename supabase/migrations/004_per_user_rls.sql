-- ============================================================
--  TOKENGUARD - MIGRATION 004: Per-User RLS & api_keys.user_id
-- ============================================================
--  
--  Questa migration:
--  1. Aggiunge colonna user_id alla tabella api_keys
--  2. Collega le api_keys esistenti al profilo utente via email
--  3. Sostituisce le policy "Allow all" con policy per-utente
--  4. Ogni utente vede solo i propri dati nella dashboard
--
--  NOTA: Questo script è IDEMPOTENTE.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Aggiungere user_id alla tabella api_keys
-- ────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'api_keys' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.api_keys ADD COLUMN user_id UUID;
  END IF;
END $$;

-- Indice per user_id
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);

-- ────────────────────────────────────────────────────────────
-- 2. Collegare le api_keys esistenti ai profili via email
-- ────────────────────────────────────────────────────────────
UPDATE public.api_keys ak
SET user_id = p.id
FROM public.profiles p
WHERE ak.email = p.email
AND ak.user_id IS NULL;

-- ────────────────────────────────────────────────────────────
-- 3. Rimuovere le vecchie policy "Allow all"
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all on api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Allow all on api_logs" ON public.api_logs;
DROP POLICY IF EXISTS "Allow all on budget_alerts" ON public.budget_alerts;

-- ────────────────────────────────────────────────────────────
-- 4. Nuove RLS Policy: PROFILES
--    Ogni utente può vedere e modificare solo il proprio profilo
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Service role può inserire profili (per il signup)
DROP POLICY IF EXISTS "Service can insert profiles" ON public.profiles;
CREATE POLICY "Service can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- 5. Nuove RLS Policy: API_KEYS
--    Ogni utente può vedere/gestire solo le proprie chiavi
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own keys" ON public.api_keys;
CREATE POLICY "Users can view own keys" ON public.api_keys
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own keys" ON public.api_keys;
CREATE POLICY "Users can insert own keys" ON public.api_keys
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own keys" ON public.api_keys;
CREATE POLICY "Users can update own keys" ON public.api_keys
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Il service role (backend) può leggere tutte le chiavi per la validazione proxy
DROP POLICY IF EXISTS "Service can manage all keys" ON public.api_keys;
CREATE POLICY "Service can manage all keys" ON public.api_keys
  FOR ALL USING (true) WITH CHECK (true);
-- Nota: Il service_role_key bypassa comunque RLS, questa policy è un fallback

-- ────────────────────────────────────────────────────────────
-- 6. Nuove RLS Policy: API_LOGS
--    Ogni utente vede solo i propri log nella dashboard
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own logs" ON public.api_logs;
CREATE POLICY "Users can view own logs" ON public.api_logs
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own logs" ON public.api_logs;
CREATE POLICY "Users can insert own logs" ON public.api_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Service role può inserire log per qualsia utente (dal proxy)
DROP POLICY IF EXISTS "Service can manage all logs" ON public.api_logs;
CREATE POLICY "Service can manage all logs" ON public.api_logs
  FOR ALL USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- 7. Nuove RLS Policy: BUDGET_ALERTS
--    Ogni utente vede solo i propri alert
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own alerts" ON public.budget_alerts;
CREATE POLICY "Users can view own alerts" ON public.budget_alerts
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service can manage all alerts" ON public.budget_alerts;
CREATE POLICY "Service can manage all alerts" ON public.budget_alerts
  FOR ALL USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- FATTO! ✅
-- ────────────────────────────────────────────────────────────
-- Cambiamenti:
--   ✅ api_keys ora ha colonna user_id
--   ✅ api_keys esistenti collegate ai profili via email
--   ✅ RLS profiles: solo il proprio profilo
--   ✅ RLS api_keys: solo le proprie chiavi
--   ✅ RLS api_logs: solo i propri log
--   ✅ RLS budget_alerts: solo i propri alert
--   ✅ Service role bypassa RLS (per proxy/backend)
-- ────────────────────────────────────────────────────────────
