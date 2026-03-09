import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, getSupabaseAdmin } from '@/lib/auth'

function generateApiKey(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = 'tg_live_'
    for (let i = 0; i < 48; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

// GET: List API keys for the authenticated user
export async function GET(request: NextRequest) {
    const user = await getAuthenticatedUser(request)
    if (!user) {
        return NextResponse.json(
            { error: 'Non autenticato. Effettua il login.' },
            { status: 401 }
        )
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
        return NextResponse.json({ keys: [], message: 'Supabase not configured' })
    }

    try {
        // Get user's email from their profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('email, api_key')
            .eq('id', user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ keys: [] })
        }

        // Fetch api_keys that belong to this user (matched by email or user_id)
        const { data: keys, error } = await supabase
            .from('api_keys')
            .select('id, api_key, label, email, plan, is_active, created_at, last_used_at, user_id')
            .or(`email.eq.${profile.email},user_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            console.error('Error fetching keys:', error)
            return NextResponse.json({ keys: [], error: error.message })
        }

        const formattedKeys = (keys || []).map((k: Record<string, string | boolean | null>) => ({
            id: k.id,
            key: k.api_key,
            label: k.label || 'Chiave API',
            created: k.created_at,
            lastUsed: k.last_used_at,
            isActive: k.is_active !== false
        }))

        return NextResponse.json({ keys: formattedKeys })
    } catch (error) {
        console.error('Error in settings/keys GET:', error)
        return NextResponse.json({ keys: [], error: 'Server error' })
    }
}

// POST: Generate a new API key for the authenticated user
export async function POST(request: NextRequest) {
    const user = await getAuthenticatedUser(request)
    if (!user) {
        return NextResponse.json(
            { error: 'Non autenticato. Effettua il login.' },
            { status: 401 }
        )
    }

    const newKey = generateApiKey()

    const supabase = getSupabaseAdmin()
    if (!supabase) {
        return NextResponse.json({
            id: crypto.randomUUID(),
            apiKey: newKey,
            message: 'Generated locally (Supabase not configured)'
        })
    }

    try {
        const body = await request.json()
        const { label } = body

        // Get user's email
        const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', user.id)
            .single()

        // Insert with user_id and email
        const { data, error } = await supabase
            .from('api_keys')
            .insert({
                api_key: newKey,
                label: label || 'Nuova Chiave',
                email: profile?.email || user.email,
                user_id: user.id,
                plan: 'free',
                monthly_budget: 100,
                is_active: true,
            })
            .select('id, api_key')
            .single()

        if (error) {
            console.error('Error creating key in DB:', error)
            return NextResponse.json({
                id: crypto.randomUUID(),
                apiKey: newKey,
                message: 'Key generated but DB insert failed: ' + error.message
            })
        }

        return NextResponse.json({
            id: data?.id,
            apiKey: data?.api_key || newKey,
            message: 'API key generated and saved to database'
        })
    } catch (error) {
        console.error('Error in settings/keys POST:', error)
        return NextResponse.json({
            id: crypto.randomUUID(),
            apiKey: newKey,
            message: 'Generated locally due to error'
        })
    }
}

// DELETE: Revoke an API key (only if it belongs to the authenticated user)
export async function DELETE(request: NextRequest) {
    const user = await getAuthenticatedUser(request)
    if (!user) {
        return NextResponse.json(
            { error: 'Non autenticato. Effettua il login.' },
            { status: 401 }
        )
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
        return NextResponse.json({ success: true, message: 'Key revoked locally' })
    }

    try {
        const body = await request.json()
        const { id, key } = body

        // Get user's email for ownership verification
        const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', user.id)
            .single()

        if (id) {
            // Revoke only if key belongs to this user
            const { error } = await supabase
                .from('api_keys')
                .update({ is_active: false })
                .eq('id', id)
                .or(`email.eq.${profile?.email},user_id.eq.${user.id}`)

            if (error) {
                console.error('Error revoking key by id:', error)
            }
        } else if (key) {
            const { error } = await supabase
                .from('api_keys')
                .update({ is_active: false })
                .eq('api_key', key)
                .or(`email.eq.${profile?.email},user_id.eq.${user.id}`)

            if (error) {
                console.error('Error revoking key by value:', error)
            }
        }

        return NextResponse.json({ success: true, message: 'Key revoked successfully' })
    } catch (error) {
        console.error('Error in settings/keys DELETE:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}
