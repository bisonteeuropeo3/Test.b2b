-- =====================================================
-- Migration 006: Context Window Pruning
-- Aggiunge colonne per il pruning delle conversazioni
-- =====================================================

-- Aggiungi colonne alla tabella profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS pruning_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pruning_intensity TEXT DEFAULT 'medium'
  CHECK (pruning_intensity IN ('low', 'medium', 'high'));

-- Aggiungi colonne alla tabella api_keys
ALTER TABLE api_keys
ADD COLUMN IF NOT EXISTS pruning_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pruning_intensity TEXT DEFAULT 'medium'
  CHECK (pruning_intensity IN ('low', 'medium', 'high'));

-- Commenti
COMMENT ON COLUMN profiles.pruning_enabled IS 'Se abilitato, il proxy comprime automaticamente la cronologia chat per risparmiare token';
COMMENT ON COLUMN profiles.pruning_intensity IS 'Livello di compressione: low (dettagliato), medium (bilanciato), high (aggressivo)';
