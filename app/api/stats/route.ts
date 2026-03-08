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
    const { data: logs } = await supabase
      .from('api_logs')
      .select('cost_usd, cached')
    
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const cachedCalls = logs?.filter(log => log.cached).length || 0
    const savedCost = cachedCalls * 0.015

    return NextResponse.json({
      totalSaved: Math.round(savedCost * 100) / 100,
      activeUsers: userCount || 0,
      avgReduction: logs && logs.length > 0 ? Math.round((cachedCalls / logs.length) * 100) : 0,
      totalCalls: logs?.length || 0
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({
      totalSaved: 0,
      activeUsers: 0,
      avgReduction: 0,
      totalCalls: 0
    })
  }
}
