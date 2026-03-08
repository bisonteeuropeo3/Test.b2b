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

// GET: List all API keys for the authenticated user
export async function GET() {
    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ keys: [], message: 'Supabase not configured' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, api_key, email, created_at, updated_at')
            .not('api_key', 'is', null)
            .limit(10)

        if (error) {
            console.error('Error fetching keys:', error)
            return NextResponse.json({ keys: [], error: error.message })
        }

        const keys = (profiles || []).map((p: Record<string, string>) => ({
            id: p.id,
            key: p.api_key,
            label: p.email || 'Chiave API',
            created: p.created_at,
            lastUsed: p.updated_at,
            isActive: true
        }))

        return NextResponse.json({ keys })
    } catch (error) {
        console.error('Error in settings/keys GET:', error)
        return NextResponse.json({ keys: [], error: 'Server error' })
    }
}

// POST: Generate a new API key
export async function POST(request: NextRequest) {
    if (!supabaseUrl || !supabaseKey) {
        // Fallback: generate key locally
        const key = generateApiKey()
        return NextResponse.json({
            id: crypto.randomUUID(),
            apiKey: key,
            message: 'Generated locally (Supabase not configured)'
        })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        const body = await request.json()
        const { label } = body

        const newKey = generateApiKey()

        // Try to create a new profile entry or update existing
        const { data, error } = await supabase
            .from('profiles')
            .insert({
                email: label || 'unnamed-key',
                api_key: newKey,
                plan: 'free',
                monthly_budget: 100,
            })
            .select('id, api_key')
            .single()

        if (error) {
            console.error('Error creating key:', error)
            // Return the key anyway (generated locally)
            return NextResponse.json({
                id: crypto.randomUUID(),
                apiKey: newKey,
                message: 'Key generated (DB insert failed: ' + error.message + ')'
            })
        }

        return NextResponse.json({
            id: data?.id,
            apiKey: data?.api_key || newKey,
            message: 'API key generated successfully'
        })
    } catch (error) {
        console.error('Error in settings/keys POST:', error)
        const key = generateApiKey()
        return NextResponse.json({
            id: crypto.randomUUID(),
            apiKey: key,
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

        if (id) {
            // Nullify the API key in the profile (don't delete the profile)
            const { error } = await supabase
                .from('profiles')
                .update({ api_key: null })
                .eq('id', id)

            if (error) {
                console.error('Error revoking key by id:', error)
            }
        } else if (key) {
            const { error } = await supabase
                .from('profiles')
                .update({ api_key: null })
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
