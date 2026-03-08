# TokenGuard - LLM Cost Intelligence Platform

🚀 **Monitor, optimize, and reduce your LLM API costs by up to 50%**

## What is TokenGuard?

TokenGuard helps teams track, analyze, and reduce their OpenAI, Anthropic, and other LLM API costs. Get real-time visibility into spending, detect duplicate calls, and receive actionable insights to optimize your AI budget.

## Features

- 📊 **Real-time Analytics** - Track costs per endpoint, model, and time period
- 🔄 **Duplicate Detection** - Automatically identify redundant API calls
- 🚨 **Budget Alerts** - Get notified before exceeding spending limits
- ⚡ **Zero Code Changes** - Just change your API endpoint, we handle the rest
- 💾 **Smart Caching** - Optional response caching for identical prompts
- 👥 **Team Insights** - See which features drive the most LLM usage

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account

### Local Setup

```bash
# Clone the repo
git clone https://github.com/bisonteeuropeo3/Test.b2b.git
cd Test.b2b

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations in Supabase SQL Editor
# See: supabase/migrations/001_tokenguard_schema.sql

# Start development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy from `sughifabre` branch

### Supabase Setup

1. Create new project on Supabase
2. Run SQL migrations in SQL Editor
3. Enable Email Auth in Authentication settings

## Usage

### Proxy Integration

Replace your OpenAI base URL:

```javascript
// Before
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// After
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://your-tokenguard.vercel.app/api/v1/proxy/openai',
  defaultHeaders: {
    'X-TokenGuard-Key': 'your-api-key'
  }
});
```

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | 1 user, 10k logs/month |
| **Pro** | $29/mo | Unlimited users, 100k logs, priority support |
| **Enterprise** | $99/mo | Unlimited everything, custom integrations |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Deploy:** Vercel

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](./LICENSE)

## Support

For support, email support@tokenguard.io or join our Discord community.

---

Built with ❤️ by the TokenGuard team
