# 🧪 Test TokenGuard - Istruzioni

## Prerequisiti

- **Node.js 18+** installato
- Una **chiave API OpenAI** valida (`sk-...`)
- Una **chiave API TokenGuard** valida (`tg_live_...`)
- L'URL del tuo deployment TokenGuard su Vercel

## Come Usare

### 1. Test DIRETTO (senza TokenGuard)

Questo script invia 20 richieste direttamente a OpenAI per misurare costi e tempi baseline.

1. Apri `test_direct_openai.mjs`
2. Inserisci la tua chiave OpenAI:
   ```js
   const OPENAI_API_KEY = 'sk-la-tua-chiave-openai'
   ```
3. Esegui:
   ```bash
   node test/test_direct_openai.mjs
   ```

### 2. Test CON TOKENGUARD (proxy + caching)

Questo script invia le **stesse identiche** 20 richieste, ma attraverso il proxy TokenGuard.

1. Apri `test_with_tokenguard.mjs`
2. Inserisci le tue chiavi e l'URL:
   ```js
   const OPENAI_API_KEY     = 'sk-la-tua-chiave-openai'
   const TOKENGUARD_API_KEY = 'tg_live_la-tua-chiave-tokenguard'
   const TOKENGUARD_URL     = 'https://tuo-sito.vercel.app/api/v1/proxy/openai'
   ```
3. Esegui:
   ```bash
   node test/test_with_tokenguard.mjs
   ```

## Cosa Viene Testato

Le 20 richieste includono:

| # | Tipo | Descrizione |
|---|------|-------------|
| 1-5 | Uniche | 5 domande diverse |
| 6-8 | **IDENTICHE** | "Quanto fa 2+2?" × 3 |
| 9-11 | Uniche | 3 domande diverse |
| 12-14 | **IDENTICHE** | "Elenca 3 linguaggi" × 3 |
| 15-16 | Uniche | 2 domande diverse |
| 17-19 | **IDENTICHE** | "Fatto sulla Luna" × 3 |
| 20 | Unica | 1 domanda finale |

### Risultato Atteso

**Test Diretto**: Tutte le 20 richieste vanno a OpenAI → 20 chiamate API pagate

**Test TokenGuard**: Solo 14 richieste uniche vanno a OpenAI. Le 6 richieste duplicate vengono servite dalla cache → **30% risparmio**

## Confronto Risultati

Dopo aver eseguito entrambi i test, confronta:

- **Costo totale**: il test con TokenGuard dovrebbe costare ~30% in meno
- **Latenza cache**: le risposte dalla cache dovrebbero essere 2-10x più veloci
- **Cache HIT**: dovresti vedere 6 cache hit nel test con TokenGuard

## Dove Trovare le Chiavi

- **Chiave OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Chiave TokenGuard**: Dashboard → ⚙️ Impostazioni → Chiavi API
- **URL Proxy**: Dashboard → ⚙️ Impostazioni → Proxy URL
