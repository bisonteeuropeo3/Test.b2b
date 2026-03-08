# TokenGuard - Documentazione Tecnica

## Cos'è TokenGuard

TokenGuard è un middleware di monitoraggio e ottimizzazione costi per API LLM (Large Language Models). Si posiziona tra l'applicazione del cliente e i provider di API AI (OpenAI, Anthropic, ecc.), intercettando tutte le chiamate per loggarle, analizzarle e ottimizzarle.

---

## Come Funziona il Servizio

### Architettura

```
┌─────────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Tua App       │────▶│ TokenGuard  │────▶│   OpenAI/       │
│   (Client)      │◀────│  (Proxy)    │◀────│   Anthropic     │
└─────────────────┘     └─────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌─────────────┐
                        │  Supabase   │
                        │  (Database) │
                        └─────────────┘
```

### Flusso di una Richiesta

1. **Intercettazione**: La tua app chiama TokenGuard invece di OpenAI direttamente
2. **Logging**: TokenGuard registra: modello usato, token consumati, costo calcolato, timestamp
3. **Caching**: Se la stessa richiesta è stata fatta recentemente, restituisce la risposta cached
4. **Inoltro**: La richiesta viene inoltrata al provider LLM (OpenAI, Anthropic, ecc.)
5. **Risposta**: La risposta torna alla tua app (identica a prima)
6. **Analytics**: I dati sono disponibili in tempo reale sulla dashboard

---

## Meccanismi di Risparmio

### 1. Smart Caching (40% risparmio)

**Problema**: Molte applicazioni fanno le stesse domande ripetutamente.

**Esempio**:
```
Utente A: "Spiegami React" → Chiama OpenAI ($0.01)
Utente B: "Spiegami React" → Chiama OpenAI ($0.01) 
Utente C: "Spiegami React" → Chiama OpenAI ($0.01)

Totale: $0.03
```

**Con TokenGuard**:
```
Utente A: "Spiegami React" → Chiama OpenAI ($0.01) → Salva in cache
Utente B: "Spiegami React" → Cache hit ($0.00)
Utente C: "Spiegami React" → Cache hit ($0.00)

Totale: $0.01 (risparmio 66%)
```

**Come funziona**:
- Hash del prompt per identificare duplicati
- Cache in-memory con TTL (Time To Live) configurabile
- Invalidazione automatica quando necessario

### 2. Duplicate Detection (20% risparmio)

**Problema**: Chiamate simultanee identiche da parte di utenti diversi.

**Soluzione**: Se 10 utenti fanno la stessa richiesta nello stesso secondo, TokenGuard fa 1 sola chiamata al provider e condivide la risposta a tutti.

### 3. Analytics e Ottimizzazione

**Visibilità**: Vedi esattamente:
- Quale modello costa di più (GPT-4 vs GPT-3.5)
- Quali endpoint consumano di più
- Pattern di utilizzo nel tempo
- Picchi anomali di spesa

**Azioni**: Basandoti sui dati puoi:
- Passare a modelli più economici dove appropriato
- Ottimizzare i prompt per ridurre i token
- Implementare caching applicativo
- Impostare alert budget

---

## Integrazione per le Aziende

### Step 1: Configurazione Iniziale (5 minuti)

**1.1 Deploy su Vercel**
```bash
# Il codice è già pronto, basta deployare su Vercel
# Branch: master
```

**1.2 Configurare Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=https://tuo-progetto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

**1.3 Database Setup**
Eseguire le migration SQL in Supabase:
- `001_tokenguard_schema.sql` - Crea tabelle api_logs, profiles, budget_alerts
- `002_api_key_and_optimizations.sql` - Aggiunge API key e indici

### Step 2: Ottenere API Key (1 minuto)

1. Registrarsi su TokenGuard
2. Completare l'onboarding
3. Copiare l'API Key generata (formato: `tg_live_xxxxxxxx`)

### Step 3: Integrazione nel Codice (2 minuti)

**Prima (OpenAI diretto)**:
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Ciao!' }],
});
```

**Dopo (con TokenGuard)**:
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://tuo-tokenguard.vercel.app/api/v1/proxy/openai',
  defaultHeaders: {
    'X-TokenGuard-Key': process.env.TOKENGUARD_API_KEY,
  },
});

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Ciao!' }],
});
// La risposta è identica a prima
```

**Cambiamenti richiesti**:
- Aggiungere `baseURL`
- Aggiungere header `X-TokenGuard-Key`
- Tutto il resto del codice rimane invariato

### Step 4: Variabili d'Ambiente

**File `.env` dell'azienda**:
```env
# Esistenti
OPENAI_API_KEY=sk-...

# Nuovi
TOKENGUARD_API_KEY=tg_live_xxxxxxxx
TOKENGUARD_BASE_URL=https://tuo-tokenguard.vercel.app/api/v1/proxy/openai
```

---

## Casi d'Uso per Aziende

### Caso 1: Startup SaaS con AI

**Situazione**: App con 1000 utenti attivi, ognuno fa 10 chiamate AI al giorno.

**Senza TokenGuard**:
- 10,000 chiamate/giorno
- Costo medio: $0.01/chiamata
- **Totale: $100/giorno = $3,000/mese**

**Con TokenGuard** (30% risparmio per caching duplicati):
- 7,000 chiamate effettive/giorno
- **Totale: $70/giorno = $2,100/mese**
- **Risparmio: $900/mese**

### Caso 2: Agenzia Marketing

**Situazione**: Generazione contenuti AI per 50 clienti. Molti richiedono contenuti simili (blog post, descrizioni prodotto).

**Vantaggio**: Cache hit rate del 50% perché i prompt sono standardizzati.

**Risparmio**: 40-50% sui costi LLM.

### Caso 3: Enterprise con Multi-team

**Situazione**: Grande azienda con 10 team diversi che usano AI.

**Problema**: Nessuna visibilità su chi spende quanto.

**Soluzione TokenGuard**:
- Dashboard con breakdown per team
- Budget alerts per team
- Report mensili di utilizzo
- Ottimizzazione basata sui dati

---

## Sicurezza e Privacy

### Dati Memorizzati

**TokenGuard salva**:
- Metadata delle chiamate (modello, token, costo, timestamp)
- Hash del prompt (per caching)
- NO contenuto delle richieste/risposte (opzionale, configurabile)

### Isolamento Clienti

- Ogni cliente ha la propria API Key
- I dati sono isolati per user_id
- RLS (Row Level Security) su Supabase

### Compliance

- GDPR ready: dati anonimizzabili
- Possibilità di self-hosting
- Nessun dato venduto a terzi

---

## Pricing per Aziende

| Piano | Prezzo | Incluso |
|-------|--------|---------|
| **Free** | $0 | 1 utente, 10k chiamate/mese |
| **Pro** | $29/mese | Unlimited utenti, 100k chiamate, Slack alerts |
| **Enterprise** | $99/mese | Unlimited tutto, SSO, supporto dedicato |

**ROI Tipico**: Le aziende recuperano il costo di TokenGuard Pro ($29/mese) con un risparmio di soli $30 sui costi LLM.

---

## Supporto e Contatti

- **Documentazione**: https://docs.tokenguard.io
- **Supporto**: support@tokenguard.io
- **Status Page**: https://status.tokenguard.io

---

## Conclusione

TokenGuard è la soluzione ideale per aziende che:
- Usano API LLM in produzione
- Vogliono ridurre i costi senza cambiare codice
- Hanno bisogno di visibilità sulle spese AI
- Cercano un sistema di caching intelligente

**Setup time**: 10 minuti
**Risparmio medio**: 30-50%
**ROI**: Tipicamente positivo dal primo mese
