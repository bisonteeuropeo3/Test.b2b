# TokenGuard - PROJECT_LOG

## Overview
**TokenGuard** è una piattaforma B2B per monitorare, ottimizzare e ridurre i costi delle API LLM (OpenAI, Anthropic, etc.)

## Problema Identificato
Da ricerca su Hacker News e community dev:
- Team spendono migliaia di dollari in chiamate LLM duplicate
- Nessuna visibilità su quali feature consumano di più
- Difficile identificare waste e ottimizzare prompt

## Soluzione
Dashboard che mostra:
- Costi real-time per endpoint/feature
- Detection chiamate duplicate
- Suggerimenti ottimizzazione prompt
- Alert budget

## Stack Tecnico
- **Frontend:** Next.js 14 + Tailwind + shadcn/ui
- **Backend:** Next.js API Routes + Edge Functions
- **Database:** Supabase (PostgreSQL)
- **Deploy:** Vercel (branch `sughifabre`)
- **Integrazioni:** OpenAI, Anthropic APIs

## Roadmap

### MVP (Settimana 1-2)
- [ ] Setup progetto e repo
- [ ] Dashboard base con metriche
- [ ] Integrazione OpenAI proxy/logging
- [ ] Auth utenti

### v1.0 (Settimana 3)
- [ ] Detection duplicate calls
- [ ] Alert budget
- [ ] Export report
- [ ] Onboarding wizard

### v1.1 (Future)
- [ ] Supporto multi-provider (Anthropic, Cohere)
- [ ] AI suggestions per ottimizzazione
- [ ] Team collaboration

## Costi Stimati
| Piano | Utenti | Costo/mese |
|-------|--------|------------|
| Free | 1 user, 10k logs | €0 |
| Pro | Team, 100k logs | €29 |
| Enterprise | Unlimited | €99 |

## Decisioni Tecniche
- **Perché Next.js:** SSR per SEO, API routes integrati, deploy facile su Vercel
- **Perché Supabase:** Auth integrato, PostgreSQL managed, free tier generoso
- **Pattern proxy:** Intercettiamo chiamate OpenAI per logging senza modificare codice client

## Rischio/Assunzioni
- Assumiamo che utenti siano disposti a modificare endpoint API (proxy pattern)
- Compliance: GDPR-ready, dati logs anonimizzati

## Stato Attuale
🔄 Inizializzazione progetto...
