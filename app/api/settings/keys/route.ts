import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function generateApiKey(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = 'tg_live_'
    for (let i = 0; i < 48; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

// GET: List all API keys
export async function GET() {
    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ keys: [], message: 'Supabase not configured' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        // Leggi dalla tabella api_keys (NON profiles)
        const { data: keys, error } = await supabase
            .from('api_keys')
            .select('id, api_key, label, email, plan, is_active, created_at, last_used_at')
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

// POST: Generate a new API key
export async function POST(request: NextRequest) {
    const newKey = generateApiKey()

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({
            id: crypto.randomUUID(),
            apiKey: newKey,
            message: 'Generated locally (Supabase not configured)'
        })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        const body = await request.json()
        const { label } = body

        // Inserisce nella tabella api_keys (NON profiles)
        const { data, error } = await supabase
            .from('api_keys')
            .insert({
                api_key: newKey,
                label: label || 'Nuova Chiave',
                plan: 'free',
                monthly_budget: 100,
                is_active: true,
            })
            .select('id, api_key')
            .single()

        if (error) {
            console.error('Error creating key in DB:', error)
            // Restituisci la chiave anche se il DB fallisce
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

// DELETE: Revoke an API key
export async function DELETE(request: NextRequest) {
    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ success: true, message: 'Key revoked locally' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        const body = await request.json()
        const { id, key } = body

        // Disattiva nella tabella api_keys (NON profiles)
        if (id) {
            const { error } = await supabase
                .from('api_keys')
                .update({ is_active: false })
                .eq('id', id)

            if (error) {
                console.error('Error revoking key by id:', error)
            }
        } else if (key) {
            const { error } = await supabase
                .from('api_keys')
                .update({ is_active: false })
                .eq('api_key', key)

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
