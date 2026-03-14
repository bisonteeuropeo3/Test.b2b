/**
 * Agentic Prompt Compressor
 *
 * Intercetta prompt molto lunghi (tipici di scenari RAG)
 * e li comprime usando un modello economico prima di
 * inviarli al modello principale costoso.
 *
 * Questo riduce drasticamente i token di input (i più costosi
 * nelle applicazioni RAG) mantenendo le informazioni pertinenti.
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | null
}

export interface CompressionResult {
  messages: ChatMessage[]
  compressed: boolean
  originalTokens: number
  compressedTokens: number
  tokensSaved: number
}

/**
 * Stima approssimativa dei token per un testo
 * (~3.5 caratteri per token in testo multilingua)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5)
}

/**
 * Stima i token totali di un array di messaggi
 */
function estimateMessagesTokens(messages: ChatMessage[]): number {
  return messages.reduce((sum, msg) => {
    return sum + estimateTokens(msg.content || '') + 4 // +4 overhead per messaggio
  }, 0)
}

/**
 * Identifica i messaggi candidati alla compressione.
 * Un messaggio è candidato se:
 * - È un messaggio user o system con molto testo (>500 token stimati)
 * - NON è l'ultimo messaggio user (quello lo preserviamo intatto)
 */
function findCompressibleMessages(
  messages: ChatMessage[]
): { index: number; tokens: number }[] {
  const lastUserIdx = messages.length - 1 - [...messages].reverse()
    .findIndex((m) => m.role === 'user')

  const candidates: { index: number; tokens: number }[] = []

  messages.forEach((msg, idx) => {
    if (idx === lastUserIdx) return // preserva l'ultimo messaggio user
    const tokens = estimateTokens(msg.content || '')
    if (tokens > 500) {
      candidates.push({ index: idx, tokens })
    }
  })

  return candidates
}

/**
 * Comprime un singolo messaggio lungo usando il modello economico.
 * Mantiene solo le informazioni pertinenti alla domanda dell'utente.
 */
async function compressMessage(
  messageContent: string,
  userQuestion: string,
  compressorModel: string,
  openaiApiKey: string
): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: compressorModel,
        messages: [
          {
            role: 'system',
            content: `You are a context compression agent. Your job is to compress the following text, keeping ONLY the information that is relevant to answer the user's question. Remove all irrelevant details, redundant explanations, and filler text. Be extremely concise but preserve all facts, numbers, names, and technical details that are pertinent.

User's question: "${userQuestion}"

Output the compressed version directly, without any preamble.`,
          },
          {
            role: 'user',
            content: messageContent,
          },
        ],
        max_tokens: Math.min(Math.ceil(estimateTokens(messageContent) * 0.4), 2000),
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      console.error('Compression API error:', response.statusText)
      return messageContent // fallback: ritorna originale
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || messageContent
  } catch (error) {
    console.error('Compression failed:', error)
    return messageContent // fallback: ritorna originale
  }
}

/**
 * Funzione principale di compressione.
 * Analizza i messaggi, identifica quelli troppo lunghi e li comprime.
 *
 * @param messages - Array di messaggi della chat
 * @param compressorModel - Modello da usare per la compressione (es. gpt-4o-mini)
 * @param threshold - Soglia token totali oltre la quale attivare la compressione
 * @param openaiApiKey - API key OpenAI
 */
export async function compressPrompt(
  messages: ChatMessage[],
  compressorModel: string,
  threshold: number,
  openaiApiKey: string
): Promise<CompressionResult> {
  const originalTokens = estimateMessagesTokens(messages)

  // Non comprimere se sotto la soglia
  if (originalTokens <= threshold) {
    return {
      messages,
      compressed: false,
      originalTokens,
      compressedTokens: originalTokens,
      tokensSaved: 0,
    }
  }

  // Trova l'ultimo messaggio user (la domanda corrente)
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
  const userQuestion = lastUserMessage?.content?.slice(0, 300) || ''

  if (!userQuestion) {
    return {
      messages,
      compressed: false,
      originalTokens,
      compressedTokens: originalTokens,
      tokensSaved: 0,
    }
  }

  // Identifica messaggi da comprimere
  const candidates = findCompressibleMessages(messages)

  if (candidates.length === 0) {
    return {
      messages,
      compressed: false,
      originalTokens,
      compressedTokens: originalTokens,
      tokensSaved: 0,
    }
  }

  // Comprimi i candidati in parallelo
  const compressedMessages = [...messages]
  const compressionPromises = candidates.map(async (candidate) => {
    const original = messages[candidate.index].content || ''
    const compressed = await compressMessage(
      original,
      userQuestion,
      compressorModel,
      openaiApiKey
    )
    return { index: candidate.index, compressed }
  })

  const results = await Promise.all(compressionPromises)

  for (const result of results) {
    compressedMessages[result.index] = {
      ...compressedMessages[result.index],
      content: `[Compressed] ${result.compressed}`,
    }
  }

  const compressedTokens = estimateMessagesTokens(compressedMessages)
  const tokensSaved = Math.max(0, originalTokens - compressedTokens)

  return {
    messages: compressedMessages,
    compressed: tokensSaved > 0,
    originalTokens,
    compressedTokens,
    tokensSaved,
  }
}
