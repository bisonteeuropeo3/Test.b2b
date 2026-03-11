-- ============================================================
--  TOKENGUARD - SEMANTIC CACHE (v1)
-- ============================================================
--  Aggiunge supporto per semantic caching basato su pgvector.
--  Prerequisito: pgvector deve essere disponibile nel progetto Supabase.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Abilitare pgvector
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- ────────────────────────────────────────────────────────────
-- 2. Colonne semantic cache su profiles e api_keys
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS semantic_cache_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS semantic_cache_ttl_minutes INTEGER DEFAULT 60;

ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS semantic_cache_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS semantic_cache_ttl_minutes INTEGER DEFAULT 60;

-- ────────────────────────────────────────────────────────────
-- 3. Tabella semantic_cache
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.semantic_cache (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt_text    TEXT NOT NULL,
  embedding      vector(1536) NOT NULL,
  response_content JSONB NOT NULL,
  model_used     TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now(),
  last_accessed_at TIMESTAMPTZ DEFAULT now(),
  hit_count      INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_semantic_cache_embedding
  ON public.semantic_cache USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_semantic_cache_user_id
  ON public.semantic_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_semantic_cache_created_at
  ON public.semantic_cache(created_at);

-- ────────────────────────────────────────────────────────────
-- 4. RLS per semantic_cache
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.semantic_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "semantic_cache_select_own" ON public.semantic_cache
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "semantic_cache_insert_service" ON public.semantic_cache
  FOR INSERT WITH CHECK (true);

CREATE POLICY "semantic_cache_update_service" ON public.semantic_cache
  FOR UPDATE USING (true);

CREATE POLICY "semantic_cache_delete_own" ON public.semantic_cache
  FOR DELETE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 5. Funzione RPC: ricerca per similarità con filtro TTL
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION match_prompt_embeddings(
  query_embedding vector(1536),
  match_threshold FLOAT,
  match_count INT,
  p_user_id UUID,
  ttl_minutes INT DEFAULT 60
)
RETURNS TABLE (
  id UUID,
  response_content JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.id,
    sc.response_content,
    (1 - (sc.embedding <=> query_embedding))::FLOAT AS similarity
  FROM public.semantic_cache sc
  WHERE sc.user_id = p_user_id
    AND sc.created_at > now() - (ttl_minutes || ' minutes')::INTERVAL
    AND 1 - (sc.embedding <=> query_embedding) > match_threshold
  ORDER BY sc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 6. Grant permissions
-- ────────────────────────────────────────────────────────────
GRANT ALL ON public.semantic_cache TO anon, authenticated, service_role;
