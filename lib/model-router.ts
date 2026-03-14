/**
 * Dynamic Model Routing Agent
 *
 * Classifica automaticamente la complessità di una richiesta
 * e sceglie il modello più economico adatto tra quelli
 * abilitati dall'utente.
 *
 * L'agente usa un modello economico (es. gpt-4o-mini) per valutare
 * se la richiesta è semplice, media o complessa, e poi seleziona
 * il modello dal tier corrispondente.
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | null
}

/** Tier di modelli, dal più economico al più costoso */
const MODEL_TIERS: Record<string, number> = {
  // Tier 1 — Economici
  'gpt-4o-mini': 1,
  'gpt-4.1-nano': 1,
  'gpt-4.1-mini': 1,
  'gpt-5-nano': 1,
  // Tier 2 — Bilanciati
  'gpt-4o': 2,
  'gpt-4.1': 2,
  'gpt-5-mini': 2,
  // Tier 3 — Premium
  'gpt-5': 3,
  'gpt-5.4': 3,
  'gpt-5.4-pro': 3,
}

/** Costo approssimativo per 1K token di input per modello ($/1K input) */
const MODEL_INPUT_COST: Record<string, number> = {
  'gpt-4o-mini': 0.00015,
  'gpt-4.1-nano': 0.00010,
  'gpt-4.1-mini': 0.00040,
  'gpt-5-nano': 0.00015,
  'gpt-4o': 0.0025,
  'gpt-4.1': 0.0020,
  'gpt-5-mini': 0.00125,
  'gpt-5': 0.0050,
  'gpt-5.4': 0.0025,
  'gpt-5.4-pro': 0.0100,
}

/** Tutti i modelli disponibili con metadata per il frontend */
export const AVAILABLE_MODELS = [
  // Tier 1 — Economici
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', tier: 1, tierLabel: 'Economico', color: 'green' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', tier: 1, tierLabel: 'Economico', color: 'green' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', tier: 1, tierLabel: 'Economico', color: 'green' },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', tier: 1, tierLabel: 'Economico', color: 'green' },
  // Tier 2 — Bilanciati
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', tier: 2, tierLabel: 'Bilanciato', color: 'yellow' },
  { id: 'gpt-4.1', name: 'GPT-4.1', tier: 2, tierLabel: 'Bilanciato', color: 'yellow' },
  { id: 'gpt-4o', name: 'GPT-4o', tier: 2, tierLabel: 'Bilanciato', color: 'yellow' },
  // Tier 3 — Premium
  { id: 'gpt-5', name: 'GPT-5', tier: 3, tierLabel: 'Premium', color: 'red' },
  { id: 'gpt-5.4', name: 'GPT-5.4', tier: 3, tierLabel: 'Premium', color: 'red' },
  { id: 'gpt-5.4-pro', name: 'GPT-5.4 Pro', tier: 3, tierLabel: 'Premium', color: 'red' },
]

export interface RoutingResult {
  originalModel: string
  selectedModel: string
  wasRouted: boolean
  reason: string
  estimatedSavings: number
  classifierTokensUsed: number
}

/**
 * Classifica la complessità della richiesta e sceglie il modello ottimale.
 *
 * @param messages - I messaggi della richiesta
 * @param requestedModel - Il modello originale richiesto dall'utente
 * @param allowedModels - Lista modelli consentiti dall'utente
 * @param classifierModel - Modello usato per la classificazione (economico)
 * @param openaiApiKey - API key OpenAI
 */
export async function routeToOptimalModel(
  messages: ChatMessage[],
  requestedModel: string,
  allowedModels: string[],
  classifierModel: string,
  openaiApiKey: string
): Promise<RoutingResult> {
  // Se il modello richiesto non è nella lista dei permessi, non fare routing
  if (!allowedModels.includes(requestedModel)) {
    return {
      originalModel: requestedModel,
      selectedModel: requestedModel,
      wasRouted: false,
      reason: 'Modello richiesto non nella lista dei modelli abilitati al routing',
      estimatedSavings: 0,
      classifierTokensUsed: 0,
    }
  }

  // Se il modello richiesto è già tier 1, non serve downgrading
  const requestedTier = MODEL_TIERS[requestedModel] || 2
  if (requestedTier <= 1) {
    return {
      originalModel: requestedModel,
      selectedModel: requestedModel,
      wasRouted: false,
      reason: 'Il modello richiesto è già il più economico disponibile',
      estimatedSavings: 0,
      classifierTokensUsed: 0,
    }
  }

  // Estrai il contenuto dell'ultimo messaggio utente per l'analisi
  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === 'user')
  const queryPreview = lastUserMessage?.content?.slice(0, 500) || ''

  if (!queryPreview) {
    return {
      originalModel: requestedModel,
      selectedModel: requestedModel,
      wasRouted: false,
      reason: 'Nessun messaggio utente trovato per la classificazione',
      estimatedSavings: 0,
      classifierTokensUsed: 0,
    }
  }

  // Ordina i modelli disponibili per tier (dal più economico)
  const sortedAllowed = [...allowedModels].sort(
    (a, b) => (MODEL_TIERS[a] || 2) - (MODEL_TIERS[b] || 2)
  )

  // Se c'è un solo modello nella lista, non serve classificare
  if (sortedAllowed.length <= 1) {
    return {
      originalModel: requestedModel,
      selectedModel: sortedAllowed[0] || requestedModel,
      wasRouted: sortedAllowed[0] !== requestedModel,
      reason: 'Un solo modello disponibile nella lista',
      estimatedSavings: 0,
      classifierTokensUsed: 0,
    }
  }

  // Costruisci il prompt di classificazione per l'agente
  const modelListStr = sortedAllowed
    .map((m) => {
      const tier = MODEL_TIERS[m] || 2
      const label = tier === 1 ? 'CHEAP' : tier === 2 ? 'BALANCED' : 'PREMIUM'
      return `- ${m} (${label})`
    })
    .join('\n')

  try {
    const classifierResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: classifierModel,
        messages: [
          {
            role: 'system',
            content: `You are a request complexity classifier for an AI routing system.
Analyze the user's request and decide which model is the BEST FIT based on complexity.

Available models (from cheapest to most expensive):
${modelListStr}

Rules:
- Simple tasks (formatting, translation, basic Q&A, greetings, factual recall) → use the CHEAPEST model
- Medium tasks (summarization, moderate analysis, standard coding) → use a BALANCED model
- Complex tasks (multi-step reasoning, creative writing, advanced code, math proofs, system design) → use a PREMIUM model
- When in doubt, prefer the cheaper option

Reply with ONLY the model name, nothing else.`,
          },
          {
            role: 'user',
            content: queryPreview,
          },
        ],
        max_tokens: 20,
        temperature: 0,
      }),
    })

    if (!classifierResponse.ok) {
      console.error('Model router classifier error:', classifierResponse.statusText)
      return {
        originalModel: requestedModel,
        selectedModel: requestedModel,
        wasRouted: false,
        reason: 'Errore del classificatore, uso modello originale',
        estimatedSavings: 0,
        classifierTokensUsed: 0,
      }
    }

    const classifierData = await classifierResponse.json()
    const suggestedModel = classifierData.choices?.[0]?.message?.content?.trim() || ''
    const classifierTokens =
      (classifierData.usage?.prompt_tokens || 0) +
      (classifierData.usage?.completion_tokens || 0)

    // Verifica che il modello suggerito sia nella lista dei permessi
    const finalModel = sortedAllowed.includes(suggestedModel)
      ? suggestedModel
      : requestedModel

    // Calcola il risparmio stimato
    const originalCost = MODEL_INPUT_COST[requestedModel] || 0.005
    const selectedCost = MODEL_INPUT_COST[finalModel] || originalCost
    const savingsPercent =
      originalCost > 0
        ? Math.round(((originalCost - selectedCost) / originalCost) * 100)
        : 0

    return {
      originalModel: requestedModel,
      selectedModel: finalModel,
      wasRouted: finalModel !== requestedModel,
      reason: finalModel !== requestedModel
        ? `Richiesta classificata come adatta a ${finalModel} (risparmio ~${savingsPercent}%)`
        : 'Richiesta richiede il modello originale (complessità elevata)',
      estimatedSavings: savingsPercent,
      classifierTokensUsed: classifierTokens,
    }
  } catch (error) {
    console.error('Model router error:', error)
    return {
      originalModel: requestedModel,
      selectedModel: requestedModel,
      wasRouted: false,
      reason: 'Errore nel routing, uso modello originale',
      estimatedSavings: 0,
      classifierTokensUsed: 0,
    }
  }
}
