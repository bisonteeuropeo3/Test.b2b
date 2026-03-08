import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for TokenGuard
type LLMProvider = 'openai' | 'anthropic' | 'cohere' | 'other'

export interface ApiLog {
  id: string
  user_id: string
  provider: LLMProvider
  model: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  cost_usd: number
  endpoint: string
  cached: boolean
  created_at: string
}

export interface UserStats {
  total_cost: number
  total_tokens: number
  total_requests: number
  cost_saved: number
  duplicate_detected: number
}

// Helper functions
export async function logApiCall(log: Omit<ApiLog, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('api_logs')
    .insert([log])
    .select()
  
  if (error) throw error
  return data
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const { data, error } = await supabase
    .from('api_logs')
    .select('*')
    .eq('user_id', userId)
  
  if (error) throw error
  
  return data.reduce((acc: UserStats, log: ApiLog) => ({
    total_cost: acc.total_cost + log.cost_usd,
    total_tokens: acc.total_tokens + log.total_tokens,
    total_requests: acc.total_requests + 1,
    cost_saved: acc.cost_saved + (log.cached ? log.cost_usd * 0.5 : 0),
    duplicate_detected: acc.duplicate_detected + (log.cached ? 1 : 0)
  }), {
    total_cost: 0,
    total_tokens: 0,
    total_requests: 0,
    cost_saved: 0,
    duplicate_detected: 0
  })
}
