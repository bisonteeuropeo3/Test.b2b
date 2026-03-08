'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Copy, Check, ArrowLeft, Key, Code, BookOpen,
    Zap, Shield, BarChart3, RefreshCw
} from 'lucide-react'

const GuardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M12 2L3 7v5c0 5.5 4.5 10 9 10s9-4.5 9-10V7l-9-5z" />
        <path d="M12 22V12" />
        <path d="M3 12h18" />
    </svg>
);

export default function DocsPage() {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
    const [activeTab, setActiveTab] = useState<'guide' | 'keys' | 'api'>('guide')

    // In production this would come from your auth/session
    const apiKey = typeof window !== 'undefined'
        ? localStorage.getItem('tg_api_key') || 'tg_live_xxxxxxxxxxxxxxxx'
        : 'tg_live_xxxxxxxxxxxxxxxx'

    const baseUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/api/v1/proxy/openai`
        : 'https://your-domain.vercel.app/api/v1/proxy/openai'

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    const codeSnippets = {
        before: `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Ciao!' }],
});`,
        after: `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: '${baseUrl}',
  defaultHeaders: {
    'X-TokenGuard-Key': process.env.TOKENGUARD_API_KEY,
  },
});

// Il resto del codice rimane IDENTICO
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Ciao!' }],
});`,
        env: `# File .env della tua applicazione

# La tua chiave OpenAI (già esistente)
OPENAI_API_KEY=sk-...

# Aggiungi queste due righe:
TOKENGUARD_API_KEY=${apiKey}
TOKENGUARD_BASE_URL=${baseUrl}`,
        curl: `curl -X POST ${baseUrl} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_OPENAI_KEY" \\
  -H "X-TokenGuard-Key: ${apiKey}" \\
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`,
        python: `from openai import OpenAI

client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
    base_url="${baseUrl}",
    default_headers={
        "X-TokenGuard-Key": os.environ["TOKENGUARD_API_KEY"],
    },
)

response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Ciao!"}],
)`,
    }

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-[#E0E0E0] font-mono">
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Header */}
            <header className="border-b-2 border-[#222] sticky top-0 bg-[#0F0F0F] z-50">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#FFD700] text-black p-1">
                                <GuardIcon />
                            </div>
                            <span className="font-black tracking-tighter uppercase italic">TokenGuard</span>
                            <span className="text-[10px] font-bold text-[#777] uppercase bg-[#1A1A1A] border border-[#333] px-2 py-0.5 tracking-widest">Docs</span>
                        </div>
                        <Link href="/dashboard" className="flex items-center gap-2 text-sm hover:text-[#FFD700] transition font-bold uppercase">
                            <ArrowLeft size={16} /> Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black uppercase italic mb-2">Documentazione &amp; Integrazione</h1>
                    <p className="text-[#777] font-sans">Tutto il necessario per integrare TokenGuard nella tua applicazione</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-8 border-b-2 border-[#222]">
                    {[
                        { id: 'guide' as const, label: 'Guida Rapida', icon: <BookOpen size={16} /> },
                        { id: 'keys' as const, label: 'API Keys & Link', icon: <Key size={16} /> },
                        { id: 'api' as const, label: 'Riferimento API', icon: <Code size={16} /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-black uppercase transition-colors border-b-2 -mb-[2px] ${activeTab === tab.id
                                ? 'text-[#FFD700] border-[#FFD700]'
                                : 'text-[#777] border-transparent hover:text-white'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab: Guida Rapida */}
                {activeTab === 'guide' && (
                    <div className="space-y-8">
                        {/* How it works */}
                        <section className="border-2 border-[#222] bg-[#111] p-8">
                            <h2 className="text-xl font-black uppercase italic mb-6 flex items-center gap-3">
                                <RefreshCw size={20} className="text-[#FFD700]" /> Come Funziona
                            </h2>
                            <div className="font-sans text-sm text-[#AAA] leading-relaxed mb-6">
                                <p>TokenGuard si posiziona tra la tua app e i provider LLM (OpenAI, Anthropic, ecc.).
                                    Intercetta ogni chiamata per loggarla, analizzarla e cachare le risposte duplicate.</p>
                            </div>
                            <div className="bg-[#0F0F0F] border border-[#333] p-6 font-mono text-xs overflow-x-auto">
                                <pre className="text-[#888]">{`┌─────────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Tua App       │────▶│ TokenGuard  │────▶│   OpenAI/       │
│   (Client)      │◀────│  (Proxy)    │◀────│   Anthropic     │
└─────────────────┘     └─────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌─────────────┐
                        │  Supabase   │
                        │  (Database) │
                        └─────────────┘`}</pre>
                            </div>
                        </section>

                        {/* Steps */}
                        <section className="grid md:grid-cols-3 gap-4">
                            {[
                                {
                                    step: '01',
                                    icon: <Key size={24} />,
                                    title: 'Ottieni API Key',
                                    desc: 'Registrati su TokenGuard e ottieni la tua chiave API dal tab "API Keys & Link" qui sotto.'
                                },
                                {
                                    step: '02',
                                    icon: <Code size={24} />,
                                    title: 'Cambia Base URL',
                                    desc: 'Aggiungi baseURL e header X-TokenGuard-Key al tuo SDK OpenAI. Solo 2 righe di codice.'
                                },
                                {
                                    step: '03',
                                    icon: <BarChart3 size={24} />,
                                    title: 'Monitora & Risparmia',
                                    desc: 'Vedi analytics in tempo reale sulla dashboard. Le chiamate duplicate vengono cache automaticamente.'
                                },
                            ].map((item) => (
                                <div key={item.step} className="border-2 border-[#222] bg-[#111] p-6 hover:border-[#FFD700]/30 transition">
                                    <div className="text-[#FFD700] mb-4">{item.icon}</div>
                                    <div className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Step {item.step}</div>
                                    <h3 className="font-black uppercase text-lg mb-2">{item.title}</h3>
                                    <p className="text-[#777] font-sans text-sm">{item.desc}</p>
                                </div>
                            ))}
                        </section>

                        {/* Integration Code */}
                        <section className="border-2 border-[#222] bg-[#111] p-8">
                            <h2 className="text-xl font-black uppercase italic mb-6 flex items-center gap-3">
                                <Code size={20} className="text-[#FFD700]" /> Integrazione (Node.js / JavaScript)
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 bg-red-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#777]">Prima (Diretto a OpenAI)</span>
                                    </div>
                                    <CodeBlock code={codeSnippets.before} index={10} copiedIndex={copiedIndex} onCopy={copyToClipboard} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]">Dopo (Con TokenGuard)</span>
                                    </div>
                                    <CodeBlock code={codeSnippets.after} index={11} copiedIndex={copiedIndex} onCopy={copyToClipboard} />
                                </div>
                            </div>
                        </section>

                        {/* Savings explanation */}
                        <section className="border-2 border-[#222] bg-[#111] p-8">
                            <h2 className="text-xl font-black uppercase italic mb-6 flex items-center gap-3">
                                <Zap size={20} className="text-[#FFD700]" /> Come Risparmi
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-[#0F0F0F] border border-[#333] p-6">
                                    <h3 className="font-black uppercase text-sm text-red-400 mb-4">Senza TokenGuard</h3>
                                    <div className="font-mono text-xs space-y-2 text-[#888]">
                                        <div>{`Utente A: "Spiegami React" → OpenAI ($0.01)`}</div>
                                        <div>{`Utente B: "Spiegami React" → OpenAI ($0.01)`}</div>
                                        <div>{`Utente C: "Spiegami React" → OpenAI ($0.01)`}</div>
                                        <div className="border-t border-[#333] pt-2 text-white font-bold">Totale: $0.03</div>
                                    </div>
                                </div>
                                <div className="bg-[#0F0F0F] border border-[#FFD700]/30 p-6">
                                    <h3 className="font-black uppercase text-sm text-green-400 mb-4">Con TokenGuard</h3>
                                    <div className="font-mono text-xs space-y-2 text-[#888]">
                                        <div>{`Utente A: "Spiegami React" → OpenAI ($0.01) → Cache`}</div>
                                        <div className="text-[#FFD700]">{`Utente B: "Spiegami React" → Cache HIT ($0.00)`}</div>
                                        <div className="text-[#FFD700]">{`Utente C: "Spiegami React" → Cache HIT ($0.00)`}</div>
                                        <div className="border-t border-[#333] pt-2 text-green-400 font-bold">Totale: $0.01 (risparmio 66%)</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Security */}
                        <section className="border-2 border-[#222] bg-[#111] p-8">
                            <h2 className="text-xl font-black uppercase italic mb-6 flex items-center gap-3">
                                <Shield size={20} className="text-[#FFD700]" /> Sicurezza
                            </h2>
                            <div className="grid md:grid-cols-3 gap-4 font-sans text-sm">
                                <div className="bg-[#0F0F0F] border border-[#333] p-4">
                                    <h4 className="font-black uppercase text-xs text-[#FFD700] mb-2">Dati Memorizzati</h4>
                                    <p className="text-[#777]">Solo metadata (modello, token, costo). Il contenuto delle conversazioni NON viene salvato.</p>
                                </div>
                                <div className="bg-[#0F0F0F] border border-[#333] p-4">
                                    <h4 className="font-black uppercase text-xs text-[#FFD700] mb-2">Isolamento</h4>
                                    <p className="text-[#777]">Ogni utente ha la propria API Key. I dati sono isolati con Row Level Security.</p>
                                </div>
                                <div className="bg-[#0F0F0F] border border-[#333] p-4">
                                    <h4 className="font-black uppercase text-xs text-[#FFD700] mb-2">GDPR Ready</h4>
                                    <p className="text-[#777]">Dati anonimizzabili. Possibilità di self-hosting. Nessun dato venduto.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* Tab: API Keys & Links */}
                {activeTab === 'keys' && (
                    <div className="space-y-6">
                        {/* API Key */}
                        <section className="border-2 border-[#FFD700]/30 bg-[#111] p-8">
                            <h2 className="text-xl font-black uppercase italic mb-2 flex items-center gap-3">
                                <Key size={20} className="text-[#FFD700]" /> La Tua API Key
                            </h2>
                            <p className="text-[#777] font-sans text-sm mb-6">Usa questa chiave per autenticare le richieste verso TokenGuard</p>

                            <div className="bg-[#0F0F0F] border-2 border-[#222] p-1 flex items-center">
                                <div className="flex-1 px-4 py-3 overflow-x-auto">
                                    <code className="text-[#FFD700] text-sm font-mono break-all">{apiKey}</code>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(apiKey, 0)}
                                    className="shrink-0 px-6 py-3 bg-[#222] hover:bg-[#333] transition font-black text-xs uppercase tracking-widest flex items-center gap-2"
                                >
                                    {copiedIndex === 0 ? <><Check size={14} className="text-green-500" /> Copiato</> : <><Copy size={14} /> Copia</>}
                                </button>
                            </div>

                            <div className="mt-4 bg-amber-500/10 border border-amber-500/20 p-4">
                                <p className="text-amber-400 text-sm font-sans">
                                    <strong>Sicurezza:</strong> Non committare mai questa chiave nel codice. Usa variabili d&apos;ambiente.
                                </p>
                            </div>
                        </section>

                        {/* Proxy URL */}
                        <section className="border-2 border-[#222] bg-[#111] p-8">
                            <h2 className="text-xl font-black uppercase italic mb-2 flex items-center gap-3">
                                <Zap size={20} className="text-[#FFD700]" /> URL Proxy (Base URL)
                            </h2>
                            <p className="text-[#777] font-sans text-sm mb-6">Questo è l&apos;URL da usare come baseURL nel tuo SDK OpenAI</p>

                            <div className="bg-[#0F0F0F] border-2 border-[#222] p-1 flex items-center">
                                <div className="flex-1 px-4 py-3 overflow-x-auto">
                                    <code className="text-green-400 text-sm font-mono break-all">{baseUrl}</code>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(baseUrl, 1)}
                                    className="shrink-0 px-6 py-3 bg-[#222] hover:bg-[#333] transition font-black text-xs uppercase tracking-widest flex items-center gap-2"
                                >
                                    {copiedIndex === 1 ? <><Check size={14} className="text-green-500" /> Copiato</> : <><Copy size={14} /> Copia</>}
                                </button>
                            </div>
                        </section>

                        {/* Environment Variables */}
                        <section className="border-2 border-[#222] bg-[#111] p-8">
                            <h2 className="text-xl font-black uppercase italic mb-2 flex items-center gap-3">
                                <Code size={20} className="text-[#FFD700]" /> Variabili d&apos;Ambiente
                            </h2>
                            <p className="text-[#777] font-sans text-sm mb-6">Aggiungi queste al file <code className="text-[#FFD700]">.env</code> della tua applicazione</p>
                            <CodeBlock code={codeSnippets.env} index={2} copiedIndex={copiedIndex} onCopy={copyToClipboard} />
                        </section>

                        {/* Quick integration recap */}
                        <section className="border-2 border-[#222] bg-[#111] p-8">
                            <h2 className="text-xl font-black uppercase italic mb-6 flex items-center gap-3">
                                <Code size={20} className="text-[#FFD700]" /> Codice di Integrazione Completo
                            </h2>
                            <p className="text-[#777] font-sans text-sm mb-6">
                                Copia e incolla questo codice nel tuo progetto. Sostituisce le chiamate dirette a OpenAI con il proxy TokenGuard.
                            </p>
                            <CodeBlock code={codeSnippets.after} index={3} copiedIndex={copiedIndex} onCopy={copyToClipboard} />
                        </section>
                    </div>
                )}

                {/* Tab: API Reference */}
                {activeTab === 'api' && (
                    <div className="space-y-6">
                        {/* Endpoint */}
                        <section className="border-2 border-[#222] bg-[#111] p-8">
                            <h2 className="text-xl font-black uppercase italic mb-6">Endpoint Proxy</h2>

                            <div className="bg-[#0F0F0F] border border-[#333] p-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="bg-green-500 text-black text-[10px] font-black px-2 py-1 uppercase">POST</span>
                                    <code className="text-[#FFD700] text-sm">{baseUrl}</code>
                                </div>
                            </div>

                            <h3 className="font-black uppercase text-sm mb-3">Headers Richiesti</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b-2 border-[#222]">
                                            <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-[#777]">Header</th>
                                            <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-[#777]">Valore</th>
                                            <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-[#777]">Descrizione</th>
                                        </tr>
                                    </thead>
                                    <tbody className="font-mono text-xs">
                                        <tr className="border-b border-[#222]">
                                            <td className="py-3 px-4 text-[#FFD700]">Authorization</td>
                                            <td className="py-3 px-4 text-[#888]">Bearer sk-...</td>
                                            <td className="py-3 px-4 text-[#888] font-sans">La tua chiave OpenAI</td>
                                        </tr>
                                        <tr className="border-b border-[#222]">
                                            <td className="py-3 px-4 text-[#FFD700]">X-TokenGuard-Key</td>
                                            <td className="py-3 px-4 text-[#888]">tg_live_...</td>
                                            <td className="py-3 px-4 text-[#888] font-sans">La tua chiave TokenGuard</td>
                                        </tr>
                                        <tr className="border-b border-[#222]">
                                            <td className="py-3 px-4 text-[#FFD700]">Content-Type</td>
                                            <td className="py-3 px-4 text-[#888]">application/json</td>
                                            <td className="py-3 px-4 text-[#888] font-sans">Tipo di contenuto</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Health Check */}
                        <section className="border-2 border-green-500/30 bg-[#111] p-8">
                            <h2 className="text-xl font-black uppercase italic mb-4 flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 animate-pulse" /> Test Connettività
                            </h2>
                            <p className="text-[#777] font-sans text-sm mb-6">Prima di iniziare, verifica che il tuo setup sia corretto</p>
                            <CodeBlock code={`# Test senza autenticazione (verifica che il servizio sia online)
curl ${baseUrl.replace('/proxy/openai', '/health')}

# Test con la tua API key (verifica autenticazione)
curl ${baseUrl.replace('/proxy/openai', '/health')} \\
  -H "X-TokenGuard-Key: ${apiKey}"`} index={7} copiedIndex={copiedIndex} onCopy={copyToClipboard} />
                        </section>

                        {/* cURL Example */}
                        <section className="border-2 border-[#222] bg-[#111] p-8">
                            <h2 className="text-xl font-black uppercase italic mb-4">Esempio cURL</h2>
                            <p className="text-[#777] font-sans text-sm mb-6">Test rapido del proxy dalla riga di comando</p>
                            <CodeBlock code={codeSnippets.curl} index={4} copiedIndex={copiedIndex} onCopy={copyToClipboard} />
                        </section>

                        {/* Python Example */}
                        <section className="border-2 border-[#222] bg-[#111] p-8">
                            <h2 className="text-xl font-black uppercase italic mb-4">Esempio Python</h2>
                            <p className="text-[#777] font-sans text-sm mb-6">Integrazione con il SDK Python di OpenAI</p>
                            <CodeBlock code={codeSnippets.python} index={5} copiedIndex={copiedIndex} onCopy={copyToClipboard} />
                        </section>

                        {/* Response format */}
                        <section className="border-2 border-[#222] bg-[#111] p-8">
                            <h2 className="text-xl font-black uppercase italic mb-6">Formato Risposta</h2>
                            <p className="text-[#777] font-sans text-sm mb-6">
                                La risposta è <strong className="text-white">identica</strong> a quella di OpenAI, con un campo aggiuntivo <code className="text-[#FFD700]">_tokenguard</code>:
                            </p>
                            <CodeBlock
                                code={`{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "choices": [...],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 50,
    "total_tokens": 60
  },
  // Campo aggiuntivo TokenGuard:
  "_tokenguard": {
    "logged": true,
    "cost": 0.0024,
    "latency": 450,
    "cached": false
  }
}`}
                                index={6}
                                copiedIndex={copiedIndex}
                                onCopy={copyToClipboard}
                            />
                        </section>

                        {/* Pricing table */}
                        <section className="border-2 border-[#222] bg-[#111] p-8">
                            <h2 className="text-xl font-black uppercase italic mb-6">Modelli e Pricing</h2>
                            <p className="text-[#777] font-sans text-sm mb-6">Pricing per 1K token usato dal proxy per calcolare i costi</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b-2 border-[#222]">
                                            <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-[#777]">Modello</th>
                                            <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-[#777]">Input/1K</th>
                                            <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-[#777]">Output/1K</th>
                                        </tr>
                                    </thead>
                                    <tbody className="font-mono text-xs">
                                        {[
                                            { model: 'gpt-4', input: '$0.03', output: '$0.06' },
                                            { model: 'gpt-4-turbo', input: '$0.01', output: '$0.03' },
                                            { model: 'gpt-4o', input: '$0.005', output: '$0.015' },
                                            { model: 'gpt-4o-mini', input: '$0.00015', output: '$0.0006' },
                                            { model: 'gpt-3.5-turbo', input: '$0.0015', output: '$0.002' },
                                            { model: 'gpt-3.5-turbo-0125', input: '$0.0005', output: '$0.0015' },
                                        ].map((row) => (
                                            <tr key={row.model} className="border-b border-[#222] hover:bg-[#1A1A1A] transition">
                                                <td className="py-3 px-4 font-bold uppercase">{row.model}</td>
                                                <td className="py-3 px-4 text-[#888]">{row.input}</td>
                                                <td className="py-3 px-4 text-[#888]">{row.output}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    )
}

function CodeBlock({ code, index, copiedIndex, onCopy }: {
    code: string
    index: number
    copiedIndex: number | null
    onCopy: (_text: string, _index: number) => void
}) {
    return (
        <div className="relative bg-[#0F0F0F] border-2 border-[#222] group">
            <button
                onClick={() => onCopy(code, index)}
                className="absolute top-3 right-3 p-2 bg-[#222] hover:bg-[#333] transition text-xs font-bold uppercase flex items-center gap-1 opacity-0 group-hover:opacity-100"
            >
                {copiedIndex === index ? <><Check size={12} className="text-green-500" /> Copiato</> : <><Copy size={12} /> Copia</>}
            </button>
            <pre className="p-4 overflow-x-auto text-sm text-[#E0E0E0] font-mono leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    )
}
