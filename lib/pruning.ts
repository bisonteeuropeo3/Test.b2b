/**
 * Context Window Pruning Module
 * 
 * Comprime automaticamente la cronologia delle chat multi-turno
 * per risparmiare token. Tre livelli di intensità:
 * 
 * - LOW:    Mantiene ultimi 8 messaggi, riassunto dettagliato (~40-60% risparmio)
 * - MEDIUM: Mantiene ultimi 4 messaggi, riassunto bilanciato (~60-80% risparmio)
 * - HIGH:   Mantiene ultimi 2 messaggi, riassunto minimo (~80-95% risparmio)
 */

export type PruningIntensity = 'low' | 'medium' | 'high'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | null
}

interface PruningConfig {
  keepLastMessages: number
  summaryMaxTokens: number
  summaryInstruction: string
}

interface PruningResult {
  messages: ChatMessage[]
  pruned: boolean
  originalCount: number
  prunedCount: number
  estimatedTokensSaved: number
  intensity: PruningIntensity
}

// Configuration per intensity level
const INTENSITY_CONFIGS: Record<PruningIntensity, PruningConfig> = {
  low: {
    keepLastMessages: 8,
    summaryMaxTokens: 200,
    summaryInstruction:
      'Riassumi in modo DETTAGLIATO la conversazione precedente, mantenendo tutti i punti chiave, le decisioni prese, i dati importanti e il contesto tecnico. Il riassunto deve permettere di continuare la conversazione senza perdita di informazioni critiche.',
  },
  medium: {
    keepLastMessages: 4,
    summaryMaxTokens: 100,
    summaryInstruction:
      'Riassumi la conversazione precedente in modo conciso, mantenendo i punti principali e il contesto necessario per continuare la discussione.',
  },
  high: {
    keepLastMessages: 2,
    summaryMaxTokens: 50,
    summaryInstruction:
      'Riassumi in UNA o DUE frasi brevi la conversazione precedente, solo l\'argomento principale.',
  },
}

// Minimum messages before pruning kicks in (no point pruning short chats)
const MIN_MESSAGES_TO_PRUNE: Record<PruningIntensity, number> = {
  low: 12,
  medium: 8,
  high: 5,
}

/**
 * Estimates token count for a string (rough: ~4 chars per token for multilingual)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5)
}

/**
 * Estimates total tokens for a message array
 */
function estimateMessagesTokens(messages: ChatMessage[]): number {
  return messages.reduce((sum, msg) => {
    return sum + estimateTokens(msg.content || '') + 4 // +4 per message overhead
  }, 0)
}

/**
 * Generates a summary of old messages using the OpenAI API.
 * Uses gpt-3.5-turbo for cost efficiency (~$0.00005 per summary).
 */
async function generateSummary(
  messages: ChatMessage[],
  config: PruningConfig,
  openaiApiKey: string
): Promise<string> {
  // Build conversation text for summarization
  const conversationText = messages
    .map((msg) => `${msg.role}: ${msg.content || ''}`)
    .join('\n')

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: config.summaryInstruction,
          },
          {
            role: 'user',
            content: `Ecco la conversazione da riassumere:\n\n${conversationText}`,
          },
        ],
        max_tokens: config.summaryMaxTokens,
        temperature: 0.3, // Low temp for factual summary
      }),
    })

    if (!response.ok) {
      console.error('Pruning summary API error:', response.statusText)
      return fallbackSummary(messages)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || fallbackSummary(messages)
  } catch (error) {
    console.error('Pruning summary failed:', error)
    return fallbackSummary(messages)
  }
}

/**
 * Fallback: simple extraction if API summary fails
 */
function fallbackSummary(messages: ChatMessage[]): string {
  const userMessages = messages
    .filter((m) => m.role === 'user' && m.content)
    .map((m) => m.content!.slice(0, 80))
    .slice(-5)

  return `Argomenti discussi: ${userMessages.join('; ')}`
}

/**
 * Main pruning function.
 * Takes the full message array and returns a pruned version.
 */
export async function pruneMessages(
  messages: ChatMessage[],
  intensity: PruningIntensity,
  openaiApiKey: string
): Promise<PruningResult> {
  const config = INTENSITY_CONFIGS[intensity]
  const minMessages = MIN_MESSAGES_TO_PRUNE[intensity]

  // Don't prune if chat is too short
  if (messages.length <= minMessages) {
    return {
      messages,
      pruned: false,
      originalCount: messages.length,
      prunedCount: messages.length,
      estimatedTokensSaved: 0,
      intensity,
    }
  }

  const originalTokens = estimateMessagesTokens(messages)

  // Separate system messages
  const systemMessages = messages.filter((m) => m.role === 'system')
  const chatMessages = messages.filter((m) => m.role !== 'system')

  // Split: old messages to summarize vs recent to keep
  const keepCount = config.keepLastMessages
  const messagesToSummarize = chatMessages.slice(0, -keepCount)
  const messagesToKeep = chatMessages.slice(-keepCount)

  // Generate summary of old messages
  const summary = await generateSummary(messagesToSummarize, config, openaiApiKey)

  // Build pruned message array
  const prunedMessages: ChatMessage[] = [
    // Original system messages
    ...systemMessages,
    // Summary as a system message
    {
      role: 'system' as const,
      content: `[Riassunto conversazione precedente (${messagesToSummarize.length} messaggi compressi)]\n${summary}`,
    },
    // Recent messages
    ...messagesToKeep,
  ]

  const prunedTokens = estimateMessagesTokens(prunedMessages)
  const tokensSaved = Math.max(0, originalTokens - prunedTokens)

  return {
    messages: prunedMessages,
    pruned: true,
    originalCount: messages.length,
    prunedCount: prunedMessages.length,
    estimatedTokensSaved: tokensSaved,
    intensity,
  }
}

/**
 * Returns estimated savings range for each intensity level
 */
export function getPruningSavingsEstimate(intensity: PruningIntensity): {
  minPercent: number
  maxPercent: number
  label: string
  description: string
} {
  switch (intensity) {
    case 'low':
      return {
        minPercent: 40,
        maxPercent: 60,
        label: 'Bassa',
        description: 'Riassunto dettagliato, mantiene 8 messaggi recenti. Ideale per task importanti.',
      }
    case 'medium':
      return {
        minPercent: 60,
        maxPercent: 80,
        label: 'Media',
        description: 'Riassunto bilanciato, mantiene 4 messaggi recenti. Buon compromesso.',
      }
    case 'high':
      return {
        minPercent: 80,
        maxPercent: 95,
        label: 'Alta',
        description: 'Riassunto minimo, mantiene 2 messaggi recenti. Per chat casual.',
      }
  }
}
