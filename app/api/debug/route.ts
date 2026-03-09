import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, getSupabaseAdmin } from '@/lib/auth'

/**
 * GET /api/debug
 * Diagnostic endpoint: shows auth status, profile, and log count for the current user.
 * Remove or protect this endpoint before going to production!
 */
export async function GET(request: NextRequest) {
    const supabase = getSupabaseAdmin()

    // 1. Check auth header
    const authHeader = request.headers.get('Authorization')
    const hasAuthHeader = !!authHeader && authHeader.startsWith('Bearer ')

    // 2. Try to authenticate
    const user = await getAuthenticatedUser(request)

    if (!user) {
        return NextResponse.json({
            status: 'NOT_AUTHENTICATED',
            hasAuthHeader,
            authHeader: authHeader ? authHeader.substring(0, 20) + '...' : null,
            message: 'No valid session token. Make sure you are logged in and the token is stored in localStorage as "supabase_session".',
        }, { status: 401 })
    }

    if (!supabase) {
        return NextResponse.json({
            status: 'SUPABASE_NOT_CONFIGURED',
            userId: user.id,
            email: user.email,
            message: 'Supabase env vars missing on this server.',
        }, { status: 500 })
    }

    // 3. Check profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, company_name, api_key, plan, monthly_budget, created_at')
        .eq('id', user.id)
        .single()

    // 4. Count logs for this user (total)
    const { count: totalLogs, error: logsError } = await supabase
        .from('api_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    // 5. Get the 3 most recent logs
    const { data: recentLogs } = await supabase
        .from('api_logs')
        .select('id, model, cost_usd, cached, created_at, user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

    // 6. Count ALL logs in table (to see if there ARE logs but for wrong user)
    const { count: allLogsCount } = await supabase
        .from('api_logs')
        .select('*', { count: 'exact', head: true })

    // 7. Check api_keys linked to this user
    const { data: apiKeys } = await supabase
        .from('api_keys')
        .select('id, api_key, user_id, label, is_active, created_at')
        .eq('user_id', user.id)

    // 8. Check api_keys that match the profile's api_key but have NO user_id
    const profileApiKey = profile?.api_key
    const { data: orphanedKey } = profileApiKey ? await supabase
        .from('api_keys')
        .select('id, api_key, user_id, label')
        .eq('api_key', profileApiKey)
        .is('user_id', null)
        .single() : { data: null }

    return NextResponse.json({
        status: 'OK',
        auth: {
            userId: user.id,
            email: user.email,
            emailConfirmed: user.email_confirmed_at != null,
        },
        profile: profile ? {
            found: true,
            id: profile.id,
            email: profile.email,
            company: profile.company_name,
            plan: profile.plan,
            apiKey: profile.api_key ? profile.api_key.substring(0, 16) + '...' : null,
            monthlyBudget: profile.monthly_budget,
            createdAt: profile.created_at,
        } : {
            found: false,
            error: profileError?.message,
            message: '⚠️ Profile not found! Your signup may have failed to create the profile row.',
        },
        logs: {
            yourLogs: totalLogs ?? 0,
            allLogsInTable: allLogsCount ?? 0,
            recentLogs: recentLogs || [],
            logsError: logsError?.message || null,
            diagnosis: (allLogsCount ?? 0) > 0 && (totalLogs ?? 0) === 0
                ? '⚠️ There ARE logs in the table but NONE match your user_id! Your api_key may be linked to a different userId (auto-registered anonymous key).'
                : totalLogs === 0
                    ? 'No logs yet — use the proxy to generate some API calls first.'
                    : `✅ Found ${totalLogs} logs for your account.`,
        },
        apiKeys: {
            linked: apiKeys || [],
            orphanedKeyInTable: orphanedKey ? {
                found: true,
                id: orphanedKey.id,
                label: orphanedKey.label,
                message: '⚠️ Your profile api_key exists in api_keys table but has no user_id! Logs may be saved under this row ID instead of your auth ID.',
            } : { found: false },
        },
    })
}
