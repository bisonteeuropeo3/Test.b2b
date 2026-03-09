/**
 * ============================================
 *  TEST CON TOKENGUARD (proxy + caching)
 * ============================================
 * 
 * Questo script invia le STESSE 20 richieste del test diretto,
 * ma passando attraverso il proxy TokenGuard.
 * Include 3 blocchi di 3 richieste IDENTICHE per testare il caching.
 * 
 * USO:
 *   node test_with_tokenguard.mjs
 * 
 * PRIMA DI ESEGUIRE:
 *   Inserisci le chiavi e l'URL qui sotto ⬇️
 */

// ╔══════════════════════════════════════════╗
// ║  INSERISCI LE TUE CHIAVI QUI            ║
// ╚══════════════════════════════════════════╝
const OPENAI_API_KEY = ''
const TOKENGUARD_API_KEY = ''
const TOKENGUARD_URL = 'https://test-b2b-inky.vercel.app/api/v1/proxy/openi'
// Esempio: 'https://test-b2b.vercel.app/api/v1/proxy/openai'
// Per test locale: 'http://localhost:3000/api/v1/proxy/openai'

// ──────────────────────────────────────────
// Non modificare sotto questa riga
// ──────────────────────────────────────────

// Stesse identiche richieste del test diretto
const requests = [
    // --- Richieste uniche ---
    { id: 1, msg: 'Ciao, come stai?', model: 'gpt-3.5-turbo' },
    { id: 2, msg: 'Cos\'è JavaScript?', model: 'gpt-3.5-turbo' },
    { id: 3, msg: 'Spiega cos\'è una API REST in una frase.', model: 'gpt-3.5-turbo' },
    { id: 4, msg: 'Qual è la capitale della Francia?', model: 'gpt-3.5-turbo' },
    { id: 5, msg: 'Scrivi un haiku sulla programmazione.', model: 'gpt-3.5-turbo' },

    // --- 3x richiesta IDENTICA (devono andare in CACHE dalla 2a in poi) ---
    { id: 6, msg: 'Quanto fa 2+2?', model: 'gpt-3.5-turbo' },
    { id: 7, msg: 'Quanto fa 2+2?', model: 'gpt-3.5-turbo' },
    { id: 8, msg: 'Quanto fa 2+2?', model: 'gpt-3.5-turbo' },

    // --- Altre richieste uniche ---
    { id: 9, msg: 'Cos\'è Node.js?', model: 'gpt-3.5-turbo' },
    { id: 10, msg: 'Differenza tra let e const in JS?', model: 'gpt-3.5-turbo' },
    { id: 11, msg: 'Cos\'è il cloud computing?', model: 'gpt-3.5-turbo' },

    // --- 3x richiesta IDENTICA (devono andare in CACHE dalla 2a in poi) ---
    { id: 12, msg: 'Elenca 3 linguaggi di programmazione.', model: 'gpt-3.5-turbo' },
    { id: 13, msg: 'Elenca 3 linguaggi di programmazione.', model: 'gpt-3.5-turbo' },
    { id: 14, msg: 'Elenca 3 linguaggi di programmazione.', model: 'gpt-3.5-turbo' },

    // --- Altre richieste uniche ---
    { id: 15, msg: 'Cos\'è una Promise in JavaScript?', model: 'gpt-3.5-turbo' },
    { id: 16, msg: 'Cos\'è il machine learning?', model: 'gpt-3.5-turbo' },

    // --- 3x richiesta IDENTICA (devono andare in CACHE dalla 2a in poi) ---
    { id: 17, msg: 'Dimmi un fatto interessante sulla Luna.', model: 'gpt-3.5-turbo' },
    { id: 18, msg: 'Dimmi un fatto interessante sulla Luna.', model: 'gpt-3.5-turbo' },
    { id: 19, msg: 'Dimmi un fatto interessante sulla Luna.', model: 'gpt-3.5-turbo' },

    // --- Ultima richiesta ---
    { id: 20, msg: 'Grazie, è stato utile!', model: 'gpt-3.5-turbo' },
]

async function makeRequest(req) {
    const start = Date.now()

    try {
        const response = await fetch(TOKENGUARD_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'X-TokenGuard-Key': TOKENGUARD_API_KEY,
            },
            body: JSON.stringify({
                model: req.model,
                messages: [{ role: 'user', content: req.msg }],
                max_tokens: 60,
                temperature: 0, // fissiamo la temperature a 0 per coerenza
            }),
        })

        const data = await response.json()
        const latency = Date.now() - start

        if (data.error) {
            const errorMsg = typeof data.error === 'string' ? data.error : data.error.message
            return {
                id: req.id,
                success: false,
                error: errorMsg,
                latency,
            }
        }

        const promptTokens = data.usage?.prompt_tokens || 0
        const completionTokens = data.usage?.completion_tokens || 0
        const totalTokens = data.usage?.total_tokens || 0

        // Uso i dati di _tokenguard se disponibili
        const tg = data._tokenguard || {}
        const isCached = tg.cached || false
        const tgCost = tg.cost !== undefined ? tg.cost : null

        // Calcolo costo: se TokenGuard lo fornisce usiamo quello, altrimenti stimiamo
        let cost
        if (isCached) {
            cost = 0 // Le risposte dalla cache non costano
        } else if (tgCost !== null) {
            cost = tgCost
        } else {
            cost = (promptTokens * 0.0015 / 1000) + (completionTokens * 0.002 / 1000)
        }

        return {
            id: req.id,
            success: true,
            model: req.model,
            prompt: req.msg.substring(0, 40),
            reply: data.choices?.[0]?.message?.content?.substring(0, 60) || '',
            promptTokens,
            completionTokens,
            totalTokens,
            cost: cost.toFixed(6),
            latency,
            cached: isCached,
            tgLatency: tg.latency || null,
        }
    } catch (error) {
        return {
            id: req.id,
            success: false,
            error: error.message,
            latency: Date.now() - start,
        }
    }
}

async function testHealthCheck() {
    const healthUrl = TOKENGUARD_URL.replace('/proxy/openai', '/health')
    console.log(`🏥 Health Check: ${healthUrl}`)

    try {
        const response = await fetch(healthUrl, {
            headers: { 'X-TokenGuard-Key': TOKENGUARD_API_KEY }
        })
        const data = await response.json()

        if (data.status === 'ok') {
            console.log('   ✅ Servizio online')
            console.log(`   📦 Supabase: ${data.supabase ? 'Configurato' : 'Non configurato'}`)
            if (data.authenticated === true) {
                console.log(`   🔑 API Key: Valida (${data.user?.email || 'utente verificato'})`)
            } else if (data.authenticated === false) {
                console.log(`   ⚠️  API Key: ${data.keyError || 'Non valida'}`)
            }
            return true
        } else {
            console.log('   ❌ Servizio non raggiungibile')
            return false
        }
    } catch (error) {
        console.log(`   ❌ Errore: ${error.message}`)
        return false
    }
}

async function runTests() {
    console.log('')
    console.log('╔════════════════════════════════════════════════════════════╗')
    console.log('║        TEST CON TOKENGUARD (proxy + caching)             ║')
    console.log('╚════════════════════════════════════════════════════════════╝')
    console.log('')

    // Verifica chiavi
    if (OPENAI_API_KEY.includes('INSERISCI')) {
        console.error('❌ ERRORE: Inserisci la tua chiave OpenAI nello script!')
        console.error('   Apri test_with_tokenguard.mjs e modifica OPENAI_API_KEY')
        process.exit(1)
    }
    if (TOKENGUARD_API_KEY.includes('INSERISCI')) {
        console.error('❌ ERRORE: Inserisci la tua chiave TokenGuard nello script!')
        console.error('   Apri test_with_tokenguard.mjs e modifica TOKENGUARD_API_KEY')
        process.exit(1)
    }
    if (TOKENGUARD_URL.includes('INSERISCI')) {
        console.error('❌ ERRORE: Inserisci l\'URL del tuo proxy TokenGuard nello script!')
        console.error('   Apri test_with_tokenguard.mjs e modifica TOKENGUARD_URL')
        console.error('   Esempio: https://your-app.vercel.app/api/v1/proxy/openai')
        process.exit(1)
    }

    console.log(`📡 Proxy URL: ${TOKENGUARD_URL}`)
    console.log(`🔑 OpenAI Key: ${OPENAI_API_KEY.substring(0, 8)}...${OPENAI_API_KEY.slice(-4)}`)
    console.log(`🛡️  TokenGuard Key: ${TOKENGUARD_API_KEY.substring(0, 12)}...${TOKENGUARD_API_KEY.slice(-4)}`)
    console.log(`📊 Richieste totali: ${requests.length}`)
    console.log('')

    // Health check prima di iniziare
    const isHealthy = await testHealthCheck()
    if (!isHealthy) {
        console.log('')
        console.log('⚠️  Il servizio non sembra raggiungibile. Continuo comunque...')
    }

    console.log('')
    console.log('─'.repeat(95))
    console.log(
        '#'.padEnd(4) +
        'Prompt'.padEnd(35) +
        'Token'.padEnd(8) +
        'Costo($)'.padEnd(12) +
        'Latenza'.padEnd(10) +
        'Cache'.padEnd(8) +
        'Stato'
    )
    console.log('─'.repeat(95))

    const results = []
    const totalStart = Date.now()

    for (const req of requests) {
        const result = await makeRequest(req)
        results.push(result)

        if (result.success) {
            const cacheLabel = result.cached ? '✅ HIT' : '—'
            const cacheColor = result.cached ? '\x1b[33m' : '' // Giallo per cache hit
            const reset = result.cached ? '\x1b[0m' : ''

            console.log(
                `${result.id}`.padEnd(4) +
                `${result.prompt}...`.padEnd(35) +
                `${result.totalTokens}`.padEnd(8) +
                `$${result.cost}`.padEnd(12) +
                `${result.latency}ms`.padEnd(10) +
                `${cacheColor}${cacheLabel}${reset}`.padEnd(8 + (result.cached ? 9 : 0)) +
                '✅'
            )
        } else {
            console.log(
                `${result.id}`.padEnd(4) +
                `ERRORE`.padEnd(35) +
                `-`.padEnd(8) +
                `-`.padEnd(12) +
                `${result.latency}ms`.padEnd(10) +
                `-`.padEnd(8) +
                `❌ ${result.error}`
            )
        }
    }

    const totalTime = Date.now() - totalStart

    // Riepilogo
    const successful = results.filter(r => r.success)
    const cachedResults = successful.filter(r => r.cached)
    const nonCachedResults = successful.filter(r => !r.cached)
    const totalCost = successful.reduce((sum, r) => sum + parseFloat(r.cost), 0)
    const totalTokensUsed = successful.reduce((sum, r) => sum + r.totalTokens, 0)
    const avgLatency = successful.length > 0
        ? Math.round(successful.reduce((sum, r) => sum + r.latency, 0) / successful.length)
        : 0
    const avgCachedLatency = cachedResults.length > 0
        ? Math.round(cachedResults.reduce((sum, r) => sum + r.latency, 0) / cachedResults.length)
        : 0
    const avgNonCachedLatency = nonCachedResults.length > 0
        ? Math.round(nonCachedResults.reduce((sum, r) => sum + r.latency, 0) / nonCachedResults.length)
        : 0

    // Calcola il costo che sarebbe stato senza cache
    const estimatedCostWithoutCache = successful.reduce((sum, r) => {
        if (r.cached && r.totalTokens > 0) {
            // Stima il costo che avremmo pagato
            return sum + (r.totalTokens * 0.002 / 1000) // media approssimativa
        }
        return sum + parseFloat(r.cost)
    }, 0)
    const moneySaved = estimatedCostWithoutCache - totalCost

    console.log('')
    console.log('═'.repeat(95))
    console.log('')
    console.log('📊 RIEPILOGO TEST CON TOKENGUARD')
    console.log('─'.repeat(45))
    console.log(`   Richieste totali:       ${requests.length}`)
    console.log(`   Richieste OK:           ${successful.length}`)
    console.log(`   Richieste fallite:      ${results.length - successful.length}`)
    console.log(`   Token totali:           ${totalTokensUsed}`)
    console.log(`   Costo totale:           $${totalCost.toFixed(6)}`)
    console.log(`   Latenza media:          ${avgLatency}ms`)
    console.log(`   Tempo totale:           ${totalTime}ms`)
    console.log('')
    console.log('⚡ PERFORMANCE CACHE')
    console.log('─'.repeat(45))
    console.log(`   Risposte dalla cache:   ${cachedResults.length} / ${successful.length} (${successful.length > 0 ? Math.round(cachedResults.length / successful.length * 100) : 0}%)`)
    console.log(`   Latenza media (cache):  ${avgCachedLatency}ms`)
    console.log(`   Latenza media (no cache): ${avgNonCachedLatency}ms`)
    if (avgNonCachedLatency > 0 && avgCachedLatency > 0) {
        const speedup = (avgNonCachedLatency / avgCachedLatency).toFixed(1)
        console.log(`   Speedup cache:          ${speedup}x più veloce`)
    }
    console.log('')
    console.log('💰 RISPARMIO')
    console.log('─'.repeat(45))
    console.log(`   Costo effettivo:        $${totalCost.toFixed(6)}`)
    console.log(`   Costo stimato (no TG):  $${estimatedCostWithoutCache.toFixed(6)}`)
    console.log(`   Risparmiato:            $${moneySaved.toFixed(6)}`)
    if (estimatedCostWithoutCache > 0) {
        const savingsPercent = ((moneySaved / estimatedCostWithoutCache) * 100).toFixed(1)
        console.log(`   Percentuale risparmio:  ${savingsPercent}%`)
    }
    console.log('')

    if (cachedResults.length > 0) {
        console.log('✅ Il caching di TokenGuard funziona! Le richieste duplicate sono state servite dalla cache.')
    } else if (successful.length > 0) {
        console.log('⚠️  Nessuna risposta dalla cache. Verifica che il proxy sia configurato correttamente.')
    }
    console.log('')
}

runTests()
