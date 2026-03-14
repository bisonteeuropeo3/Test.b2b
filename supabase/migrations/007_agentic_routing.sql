-- =====================================================
-- Migration 007: Agentic Gateway (Model Routing + Prompt Compression)
-- Aggiunge colonne per routing dinamico dei modelli
-- e compressione agentica dei prompt
-- =====================================================

-- ─── Feature A: Dynamic Model Routing Agent ───

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS routing_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS routing_cheap_model TEXT DEFAULT 'gpt-4o-mini',
ADD COLUMN IF NOT EXISTS routing_allowed_models JSONB DEFAULT '["gpt-4o-mini","gpt-4.1-mini","gpt-5.4","gpt-5.4-pro"]'::jsonb;

ALTER TABLE api_keys
ADD COLUMN IF NOT EXISTS routing_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS routing_cheap_model TEXT DEFAULT 'gpt-4o-mini',
ADD COLUMN IF NOT EXISTS routing_allowed_models JSONB DEFAULT '["gpt-4o-mini","gpt-4.1-mini","gpt-5.4","gpt-5.4-pro"]'::jsonb;

COMMENT ON COLUMN profiles.routing_enabled IS 'Se abilitato, un agente AI sceglie automaticamente il modello più economico adatto alla richiesta';
COMMENT ON COLUMN profiles.routing_cheap_model IS 'Modello economico usato dall agente per classificare la complessità della richiesta';
COMMENT ON COLUMN profiles.routing_allowed_models IS 'Lista JSON dei modelli tra cui l agente può scegliere (ordinati dal più economico al più costoso)';

-- ─── Feature B: Agentic Prompt Compression ───

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS compression_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS compression_model TEXT DEFAULT 'gpt-4o-mini',
ADD COLUMN IF NOT EXISTS compression_threshold INTEGER DEFAULT 2000;

ALTER TABLE api_keys
ADD COLUMN IF NOT EXISTS compression_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS compression_model TEXT DEFAULT 'gpt-4o-mini',
ADD COLUMN IF NOT EXISTS compression_threshold INTEGER DEFAULT 2000;

COMMENT ON COLUMN profiles.compression_enabled IS 'Se abilitato, comprime automaticamente prompt lunghi prima di inviarli al modello principale';
COMMENT ON COLUMN profiles.compression_model IS 'Modello usato per comprimere il contesto (tipicamente un modello economico)';
COMMENT ON COLUMN profiles.compression_threshold IS 'Soglia di token stimati oltre la quale scatta la compressione automatica';
