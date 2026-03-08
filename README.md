# OnboardFlow B2B

Piattaforma per onboarding dipendenti e clienti con checklist, progress tracking e automazioni.

## 🚀 Stack Tecnologico

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL + Auth)
- **Deploy:** Vercel
- **CI/CD:** GitHub Actions

## 📋 Prerequisiti

- Node.js 18+
- Account GitHub
- Account Vercel
- Account Supabase (free tier)

## 🛠️ Setup Locale

```bash
# Clona la repo
git clone https://github.com/bisonteeuropeo3/Test.b2b.git
cd Test.b2b

# Installa dipendenze
npm install

# Configura variabili d'ambiente
cp .env.example .env.local
# Modifica .env.local con i tuoi valori

# Avvia in locale
npm run dev
```

## 🔐 Variabili d'Ambiente

Crea un file `.env.local` con:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ IMPORTANTE:** Non committare mai `.env.local` o file con segreti!

## 🌐 Deploy su Vercel

### Collegamento Repository

1. Vai su [vercel.com](https://vercel.com) e accedi
2. Clicca **"Add New Project"**
3. Seleziona la repository `bisonteeuropeo3/Test.b2b`
4. In **"Framework Preset"** seleziona **Next.js**
5. In **"Branch"** seleziona **`sughifabre`** (non main!)
6. Clicca **Deploy**

### Configurazione Branch Deploy

1. Nel progetto Vercel, vai su **Settings → Git**
2. In **"Production Branch"** imposta: `sughifabre`
3. In **"Deploy Hooks"** puoi creare un hook per deploy manuali
4. Salva le modifiche

### Variabili d'Ambiente su Vercel

1. Vai su **Settings → Environment Variables**
2. Aggiungi tutte le variabili da `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (usa l'URL di Vercel)
3. Clicca **Save**

### Deploy Automatico

Una volta configurato, ogni push su `sughifabre` attiverà automaticamente un deploy su Vercel.

## 🔄 Workflow Git

```
main (stabile)
  ↑
dev (sviluppo attivo)
  ↑
sughifabre (deploy/production)
```

### Branch

- **`main`**: Codice stabile, pronto per release
- **`dev`**: Sviluppo attivo, feature in corso
- **`sughifabre`**: Branch di deploy su Vercel

### Convenzioni Commit

- `feat: nuova funzionalità`
- `fix: correzione bug`
- `chore: manutenzione/deps`
- `docs: documentazione`
- `test: test`

## 🧪 CI/CD

GitHub Actions esegue automaticamente:
- Lint (ESLint)
- Type checking
- Build
- Test (se presenti)

## 📊 Costi Mensili

| Piano | Utenti | DB | Storage | Costo |
|-------|--------|-----|---------|-------|
| **Lite** | 50 | Supabase Free (500MB) | 1GB | **€0** |
| **Standard** | 500 | Supabase Free | 5GB | **€0** |
| **Enterprise** | 2000+ | Supabase Pro ($25) | 20GB | **~€25/mese** |

## 🔒 Sicurezza

- ✅ Secret scanning abilitato
- ✅ Dependabot attivo
- ✅ `.gitignore` configurato
- ✅ Nessun segreto nel codice
- ✅ Variabili d'ambiente su Vercel

## 📁 Struttura Progetto

```
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   ├── dashboard/      # Dashboard pages
│   └── page.tsx        # Homepage
├── components/         # React components
├── lib/               # Utility functions
├── types/             # TypeScript types
├── public/            # Static assets
├── .github/           # GitHub Actions
└── supabase/          # Supabase migrations
```

## 📝 Changelog

Vedi [CHANGELOG.md](./CHANGELOG.md) per lo storico modifiche.

## 📄 Licenza

MIT License - Vedi [LICENSE](./LICENSE)
