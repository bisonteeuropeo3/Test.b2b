import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, getSupabaseAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
    // 1. Verify authentication
    const user = await getAuthenticatedUser(request)
    if (!user) {
        return NextResponse.json(
            { error: 'Non autenticato. Effettua il login.' },
            { status: 401 }
        )
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
        return NextResponse.json({
            logs: [],
            stats: {
                totalSpent: 0,
                totalTokens: 0,
                totalRequests: 0,
                costSaved: 0,
                cachedRequests: 0
            }
        })
    }

    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '7', 10)

    try {
        // Calculate the date range
        const since = new Date()
        since.setDate(since.getDate() - days)

        // 2. Filter logs by the authenticated user's ID
        const { data: logs, error } = await supabase
            .from('api_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('created_at', since.toISOString())
            .order('created_at', { ascending: false })
            .limit(200)

        if (error) {
            console.error('Error fetching logs:', error)
            return NextResponse.json({
                logs: [],
                stats: {
                    totalSpent: 0,
                    totalTokens: 0,
                    totalRequests: 0,
                    costSaved: 0,
                    cachedRequests: 0
                }
            })
        }

        // Calculate stats
        const totalSpent = logs?.reduce((sum: number, log: Record<string, number | boolean>) => sum + ((log.cost_usd as number) || 0), 0) || 0
        const totalTokens = logs?.reduce((sum: number, log: Record<string, number | boolean>) => sum + ((log.total_tokens as number) || 0), 0) || 0
        const totalRequests = logs?.length || 0
        const cachedRequests = logs?.filter((log: Record<string, boolean>) => log.cached).length || 0
        const costSaved = logs
            ?.filter((log: Record<string, boolean>) => log.cached)
            .reduce((sum: number, log: Record<string, number>) => {
                const estimatedCost = ((log.total_tokens as number) || 0) * 0.00002
                return sum + estimatedCost
            }, 0) || 0

        return NextResponse.json({
            logs: logs || [],
            stats: {
                totalSpent: Math.round(totalSpent * 10000) / 10000,
                totalTokens,
                totalRequests,
                costSaved: Math.round(costSaved * 100) / 100,
                cachedRequests
            }
        })
    } catch (error) {
        console.error('Error in logs API:', error)
        return NextResponse.json({
            logs: [],
            stats: {
                totalSpent: 0,
                totalTokens: 0,
                totalRequests: 0,
                costSaved: 0,
                cachedRequests: 0
            }
        })
    }
}
