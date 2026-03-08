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
# Modifica .env.local con i tuoi valori (vedi sotto)

# Avvia in locale
npm run dev
```

## 🔐 Variabili d'Ambiente

Crea un file `.env.local` con:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://djqtrggbnomhpjfkxjoo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcXRyZ2dibm9taHBqZmt4am9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NzQzMzAsImV4cCI6MjA4ODU1MDMzMH0.gk8MwBwIB3NQ6xR1As_DZr4Xd8FShuN-Obtwat7cYPg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcXRyZ2dibm9taHBqZmt4am9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk3NDMzMCwiZXhwIjoyMDg4NTUwMzMwfQ.2C0x9CYWWqzieiibsw16MTRjQA9sEsJPoQjBG6C0Pks

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ IMPORTANTE:** Non committare mai `.env.local` o file con segreti! Il file è già nel `.gitignore`.

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
3. Salva le modifiche

### Variabili d'Ambiente su Vercel (IMPORTANTE!)

1. Vai su **Settings → Environment Variables**
2. Aggiungi queste 3 variabili:

| Nome | Valore |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://djqtrggbnomhpjfkxjoo.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcXRyZ2dibm9taHBqZmt4am9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NzQzMzAsImV4cCI6MjA4ODU1MDMzMH0.gk8MwBwIB3NQ6xR1As_DZr4Xd8FShuN-Obtwat7cYPg` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcXRyZ2dibm9taHBqZmt4am9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk3NDMzMCwiZXhwIjoyMDg4NTUwMzMwfQ.2C0x9CYWWqzieiibsw16MTRjQA9sEsJPoQjBG6C0Pks` |

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

## 🗄️ Setup Database Supabase

1. Vai su [supabase.com](https://supabase.com) → SQL Editor
2. Crea una **New Query**
3. Incolla il contenuto di `supabase/migrations/001_initial_schema.sql`
4. Clicca **Run**

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
