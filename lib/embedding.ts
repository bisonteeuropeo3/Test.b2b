import { createClient } from '@supabase/supabase-js'

// Supabase admin client (service role)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Default similarity threshold (overridable via env)
const DEFAULT_THRESHOLD = parseFloat(process.env.SEMANTIC_CACHE_THRESHOLD || '0.95')

/**
 * Extracts a unified text string from the OpenAI chat completion body.
 * Concatenates all messages in "role: content" format.
 */
export function extractPromptText(body: {
  messages?: Array<{ role: string; content: string | null }>
  model?: string
}): string {
  if (!body.messages || !Array.isArray(body.messages)) {
    return ''
  }

  const messagesText = body.messages
    .map((msg) => `${msg.role}: ${msg.content || ''}`)
    .join('\n')

  // Include model in the text to differentiate cache per model
  return `[model:${body.model || 'unknown'}]\n${messagesText}`
}

/**
 * Calls OpenAI Embeddings API to compute a vector for the given text.
 * Uses text-embedding-3-small (1536 dimensions).
 */
export async function getEmbedding(
  text: string,
  openaiApiKey: string
): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Embedding API error: ${error.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

/**
 * Searches for semantically similar prompts in the cache.
 * Returns the best match if similarity exceeds threshold and entry is within TTL.
 */
export async function searchSemanticCache(
  embedding: number[],
  userId: string,
  ttlMinutes: number = 60,
  threshold: number = DEFAULT_THRESHOLD
): Promise<{ id: string; response_content: any; similarity: number } | null> {
  if (!supabaseAdmin) {
    console.error('Supabase not configured, skipping semantic cache search')
    return null
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('match_prompt_embeddings', {
      query_embedding: JSON.stringify(embedding),
      match_threshold: threshold,
      match_count: 1,
      p_user_id: userId,
      ttl_minutes: ttlMinutes,
    })

    if (error) {
      console.error('Semantic cache search error:', error.message)
      return null
    }

    if (data && data.length > 0) {
      return data[0]
    }

    return null
  } catch (error) {
    console.error('Semantic cache search failed:', error)
    return null
  }
}

/**
 * Saves a new entry to the semantic cache.
 * Runs asynchronously — caller should not await this in the critical path.
 */
export async function saveToSemanticCache(params: {
  userId: string
  promptText: string
  embedding: number[]
  responseContent: any
  modelUsed: string
}): Promise<void> {
  if (!supabaseAdmin) {
    console.error('Supabase not configured, skipping semantic cache save')
    return
  }

  try {
    const { error } = await supabaseAdmin.from('semantic_cache').insert({
      user_id: params.userId,
      prompt_text: params.promptText,
      embedding: JSON.stringify(params.embedding),
      response_content: params.responseContent,
      model_used: params.modelUsed,
    })

    if (error) {
      console.error('Failed to save to semantic cache:', error.message)
    }
  } catch (error) {
    console.error('Semantic cache save failed:', error)
  }
}

/**
 * Updates hit_count and last_accessed_at for a cache entry.
 * Fire-and-forget — no need to await.
 */
export async function updateCacheHit(cacheId: string): Promise<void> {
  if (!supabaseAdmin) return

  try {
    // Use raw SQL via rpc or direct update
    await supabaseAdmin
      .from('semantic_cache')
      .update({
        last_accessed_at: new Date().toISOString(),
        hit_count: undefined, // We'll use a raw increment below
      })
      .eq('id', cacheId)

    // Increment hit_count separately (Supabase JS doesn't support increment directly)
    // We'll use a simpler approach: read + write
    const { data } = await supabaseAdmin
      .from('semantic_cache')
      .select('hit_count')
      .eq('id', cacheId)
      .single()

    if (data) {
      await supabaseAdmin
        .from('semantic_cache')
        .update({ hit_count: (data.hit_count || 0) + 1 })
        .eq('id', cacheId)
    }
  } catch (error) {
    console.error('Failed to update cache hit:', error)
  }
}
