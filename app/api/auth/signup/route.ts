import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function generateApiKey(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = 'tg_live_'
    for (let i = 0; i < 48; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export async function POST(request: NextRequest) {
    // Check Supabase configuration
    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.json(
            { error: 'Supabase non configurato. Controlla le variabili d\'ambiente.' },
            { status: 500 }
        )
    }

    try {
        const body = await request.json()
        const { email, password, companyName, monthlyBudget } = body

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email e password sono obbligatori' },
                { status: 400 }
            )
        }

        // 1. Create user with Supabase Auth
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey)
        const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
            email,
            password,
        })

        if (authError) {
            console.error('Auth signup error:', authError)
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            )
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: 'Errore nella creazione dell\'utente' },
                { status: 500 }
            )
        }

        const userId = authData.user.id
        const apiKey = generateApiKey()

        // 2. Create profile in public.profiles using service role key (bypasses RLS)
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: userId,
                email,
                full_name: null,
                company_name: companyName || null,
                api_key: apiKey,
                plan: 'free',
                monthly_budget: parseInt(monthlyBudget) || 100,
                alert_threshold: 80,
            })
            .select()
            .single()

        if (profileError) {
            console.error('Profile creation error:', profileError)
            // Even if profile creation fails, the auth user was created
            // Return the API key anyway and log the error
            return NextResponse.json({
                success: true,
                userId,
                apiKey,
                session: authData.session,
                warning: 'Profilo creato parzialmente: ' + profileError.message
            })
        }

        // 3. Also insert into api_keys table for proxy compatibility
        const { error: apiKeyError } = await supabaseAdmin
            .from('api_keys')
            .insert({
                api_key: apiKey,
                label: companyName || 'Default',
                email,
                user_id: userId,
                plan: 'free',
                monthly_budget: parseInt(monthlyBudget) || 100,
                is_active: true,
            })

        if (apiKeyError) {
            console.error('API key table insert error:', apiKeyError)
            // Non-fatal, the key is still in profiles
        }

        return NextResponse.json({
            success: true,
            userId,
            apiKey,
            session: authData.session,
            message: 'Account creato con successo!'
        })

    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json(
            { error: 'Errore del server. Riprova più tardi.' },
            { status: 500 }
        )
    }
}
