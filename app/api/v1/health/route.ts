import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-TokenGuard-Key',
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders })
}

/**
 * Health check / connectivity test endpoint.
 * 
 * Usage:
 *   curl https://your-domain.vercel.app/api/v1/health \
 *     -H "X-TokenGuard-Key: tg_live_xxxx"
 * 
 * Returns:
 *   - status: "ok" or "error"
 *   - supabase: whether Supabase is configured
 *   - authenticated: whether the API key is valid
 *   - proxyUrl: the URL to use as baseURL in OpenAI SDK
 */
export async function GET(request: NextRequest) {
    const tokenGuardKey = request.headers.get('x-tokenguard-key')

    const result: Record<string, unknown> = {
        status: 'ok',
        service: 'TokenGuard Proxy',
        version: '1.0.0',
        supabase: !!(supabaseUrl && supabaseKey),
        proxyUrl: `${request.nextUrl.origin}/api/v1/proxy/openai`,
        timestamp: new Date().toISOString(),
    }

    // If API key provided, validate it
    if (tokenGuardKey && supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)

        try {
            // Check api_keys table first
            const { data: apiKeyData } = await supabase
                .from('api_keys')
                .select('id, label, plan, is_active')
                .eq('api_key', tokenGuardKey)
                .eq('is_active', true)
                .single()

            if (apiKeyData) {
                result.authenticated = true
                result.user = {
                    id: apiKeyData.id,
                    label: apiKeyData.label,
                    plan: apiKeyData.plan,
                }
            } else {
                // Fallback: check profiles table
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('id, email, plan')
                    .eq('api_key', tokenGuardKey)
                    .single()

                if (profileData) {
                    result.authenticated = true
                    result.user = {
                        id: profileData.id,
                        email: profileData.email,
                        plan: profileData.plan,
                    }
                } else {
                    result.authenticated = false
                    result.keyError = 'API key not found. It will be auto-registered on first proxy request.'
                }
            }
        } catch {
            result.authenticated = false
            result.keyError = 'Could not validate key'
        }
    } else if (tokenGuardKey && !supabaseUrl) {
        result.authenticated = false
        result.keyError = 'Supabase not configured on server'
    } else {
        result.authenticated = null
        result.hint = 'Pass X-TokenGuard-Key header to test authentication'
    }

    return NextResponse.json(result, { headers: corsHeaders })
}
