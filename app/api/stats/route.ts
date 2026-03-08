import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET() {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      totalSaved: 0,
      activeUsers: 0,
      avgReduction: 0,
      totalCalls: 0
    })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Prendi tutti i log
    const { data: logs } = await supabase
      .from('api_logs')
      .select('cost_usd, cached, total_tokens')

    // Conta utenti dalla tabella api_keys (NON profiles)
    const { count: userCount } = await supabase
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    const totalLogs = logs || []
    const cachedCalls = totalLogs.filter((log: Record<string, boolean>) => log.cached).length
    const totalCost = totalLogs.reduce((sum: number, log: Record<string, number>) => sum + ((log.cost_usd as number) || 0), 0)

    // Cost saved = stima dei costi evitati per le risposte dalla cache
    const savedCost = totalLogs
      .filter((log: Record<string, boolean>) => log.cached)
      .reduce((sum: number, log: Record<string, number>) => {
        return sum + ((log.total_tokens as number) || 0) * 0.00002 // media approssimativa per token
      }, 0)

    return NextResponse.json({
      totalSaved: Math.round(savedCost * 100) / 100,
      totalCost: Math.round(totalCost * 10000) / 10000,
      activeUsers: userCount || 0,
      avgReduction: totalLogs.length > 0 ? Math.round((cachedCalls / totalLogs.length) * 100) : 0,
      totalCalls: totalLogs.length,
      cachedCalls,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({
      totalSaved: 0,
      totalCost: 0,
      activeUsers: 0,
      avgReduction: 0,
      totalCalls: 0,
      cachedCalls: 0,
    })
  }
}
