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

### MVP (Settimana 1-2) ✅ COMPLETATO
- [x] Setup progetto e repo
- [x] Landing page con value proposition
- [x] Dashboard base con metriche
- [x] Integrazione OpenAI proxy/logging
- [x] Database schema (Supabase)
- [ ] Auth utenti (next)

### v1.0 (Settimana 3)
- [ ] Detection duplicate calls completo
- [ ] Alert budget via email
- [ ] Export report CSV/PDF
- [ ] Onboarding wizard
- [ ] Supporto Anthropic

### v1.1 (Future)
- [ ] AI suggestions per ottimizzazione prompt
- [ ] Team collaboration
- [ ] Caching layer
- [ ] Mobile app

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
✅ MVP COMPLETATO - Pronto per deploy su Vercel

### Commit Recent:
- `f2c2f0f` feat: TokenGuard MVP implementation
- `551b7a3` docs: add PROJECT_LOG with research and product decision
- `33f9e4a` docs: update README with Supabase config

### Branch Status:
- `main` ✅ aggiornato
- `dev` ✅ aggiornato  
- `sughifabre` ✅ aggiornato (deploy branch)

## Prossimi Passi
1. Deploy su Vercel dalla branch `sughifabre`
2. Configurare environment variables su Vercel
3. Eseguire migration SQL su Supabase
4. Test proxy endpoint
5. Aggiungere auth utenti
