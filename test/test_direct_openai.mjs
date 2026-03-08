/**
 * ============================================
 *  TEST DIRETTO OPENAI (senza TokenGuard)
 * ============================================
 * 
 * Questo script invia 20 richieste direttamente a OpenAI
 * per misurare costi e tempi SENZA il proxy TokenGuard.
 * 
 * USO:
 *   node test_direct_openai.mjs
 * 
 * PRIMA DI ESEGUIRE:
 *   Inserisci la tua chiave OpenAI qui sotto ⬇️
 */

// ╔══════════════════════════════════════════╗
// ║  INSERISCI LA TUA CHIAVE QUI            ║
// ╚══════════════════════════════════════════╝
const OPENAI_API_KEY = 'sk-INSERISCI_LA_TUA_CHIAVE_OPENAI_QUI'

// ──────────────────────────────────────────
// Non modificare sotto questa riga
// ──────────────────────────────────────────

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

// Lista di 20 richieste da fare (alcune IDENTICHE per confronto con il test cache)
const requests = [
    // --- Richieste uniche ---
    { id: 1, msg: 'Ciao, come stai?', model: 'gpt-3.5-turbo' },
    { id: 2, msg: 'Cos\'è JavaScript?', model: 'gpt-3.5-turbo' },
    { id: 3, msg: 'Spiega cos\'è una API REST in una frase.', model: 'gpt-3.5-turbo' },
    { id: 4, msg: 'Qual è la capitale della Francia?', model: 'gpt-3.5-turbo' },
    { id: 5, msg: 'Scrivi un haiku sulla programmazione.', model: 'gpt-3.5-turbo' },

    // --- 3x richiesta IDENTICA (per confronto cache) ---
    { id: 6, msg: 'Quanto fa 2+2?', model: 'gpt-3.5-turbo' },
    { id: 7, msg: 'Quanto fa 2+2?', model: 'gpt-3.5-turbo' },
    { id: 8, msg: 'Quanto fa 2+2?', model: 'gpt-3.5-turbo' },

    // --- Altre richieste uniche ---
    { id: 9, msg: 'Cos\'è Node.js?', model: 'gpt-3.5-turbo' },
    { id: 10, msg: 'Differenza tra let e const in JS?', model: 'gpt-3.5-turbo' },
    { id: 11, msg: 'Cos\'è il cloud computing?', model: 'gpt-3.5-turbo' },

    // --- 3x richiesta IDENTICA (per confronto cache) ---
    { id: 12, msg: 'Elenca 3 linguaggi di programmazione.', model: 'gpt-3.5-turbo' },
    { id: 13, msg: 'Elenca 3 linguaggi di programmazione.', model: 'gpt-3.5-turbo' },
    { id: 14, msg: 'Elenca 3 linguaggi di programmazione.', model: 'gpt-3.5-turbo' },

    // --- Altre richieste uniche ---
    { id: 15, msg: 'Cos\'è una Promise in JavaScript?', model: 'gpt-3.5-turbo' },
    { id: 16, msg: 'Cos\'è il machine learning?', model: 'gpt-3.5-turbo' },

    // --- 3x richiesta IDENTICA (per confronto cache) ---
    { id: 17, msg: 'Dimmi un fatto interessante sulla Luna.', model: 'gpt-3.5-turbo' },
    { id: 18, msg: 'Dimmi un fatto interessante sulla Luna.', model: 'gpt-3.5-turbo' },
    { id: 19, msg: 'Dimmi un fatto interessante sulla Luna.', model: 'gpt-3.5-turbo' },

    // --- Ultima richiesta ---
    { id: 20, msg: 'Grazie, è stato utile!', model: 'gpt-3.5-turbo' },
]

async function makeRequest(req) {
    const start = Date.now()

    try {
        const response = await fetch(OPENAI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
            return {
                id: req.id,
                success: false,
                error: data.error.message,
                latency,
            }
        }

        const promptTokens = data.usage?.prompt_tokens || 0
        const completionTokens = data.usage?.completion_tokens || 0
        const totalTokens = data.usage?.total_tokens || 0

        // Calcolo costo approssimativo (GPT-3.5-turbo pricing)
        const cost = (promptTokens * 0.0015 / 1000) + (completionTokens * 0.002 / 1000)

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
            cached: false,
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

async function runTests() {
    console.log('')
    console.log('╔════════════════════════════════════════════════════════════╗')
    console.log('║          TEST DIRETTO OPENAI (senza TokenGuard)          ║')
    console.log('╚════════════════════════════════════════════════════════════╝')
    console.log('')

    if (OPENAI_API_KEY.includes('INSERISCI')) {
        console.error('❌ ERRORE: Inserisci la tua chiave OpenAI nello script!')
        console.error('   Apri test_direct_openai.mjs e modifica OPENAI_API_KEY')
        process.exit(1)
    }

    console.log(`📡 Endpoint: ${OPENAI_URL}`)
    console.log(`🔑 Chiave: ${OPENAI_API_KEY.substring(0, 8)}...${OPENAI_API_KEY.slice(-4)}`)
    console.log(`📊 Richieste totali: ${requests.length}`)
    console.log('')
    console.log('─'.repeat(90))
    console.log(
        '#'.padEnd(4) +
        'Prompt'.padEnd(35) +
        'Token'.padEnd(8) +
        'Costo($)'.padEnd(12) +
        'Latenza'.padEnd(10) +
        'Cache'.padEnd(8) +
        'Stato'
    )
    console.log('─'.repeat(90))

    const results = []
    const totalStart = Date.now()

    for (const req of requests) {
        const result = await makeRequest(req)
        results.push(result)

        if (result.success) {
            console.log(
                `${result.id}`.padEnd(4) +
                `${result.prompt}...`.padEnd(35) +
                `${result.totalTokens}`.padEnd(8) +
                `$${result.cost}`.padEnd(12) +
                `${result.latency}ms`.padEnd(10) +
                `NO`.padEnd(8) +
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
    const totalCost = successful.reduce((sum, r) => sum + parseFloat(r.cost), 0)
    const totalTokensUsed = successful.reduce((sum, r) => sum + r.totalTokens, 0)
    const avgLatency = successful.length > 0
        ? Math.round(successful.reduce((sum, r) => sum + r.latency, 0) / successful.length)
        : 0

    console.log('')
    console.log('═'.repeat(90))
    console.log('')
    console.log('📊 RIEPILOGO TEST DIRETTO OPENAI')
    console.log('─'.repeat(40))
    console.log(`   Richieste totali:     ${requests.length}`)
    console.log(`   Richieste OK:         ${successful.length}`)
    console.log(`   Richieste fallite:    ${results.length - successful.length}`)
    console.log(`   Token totali:         ${totalTokensUsed}`)
    console.log(`   Costo totale:         $${totalCost.toFixed(6)}`)
    console.log(`   Latenza media:        ${avgLatency}ms`)
    console.log(`   Tempo totale:         ${totalTime}ms`)
    console.log(`   Risposte dalla cache: 0 (nessun caching senza TokenGuard)`)
    console.log('')
    console.log('💡 Esegui ora test_with_tokenguard.mjs per confrontare i risultati!')
    console.log('')
}

runTests()
