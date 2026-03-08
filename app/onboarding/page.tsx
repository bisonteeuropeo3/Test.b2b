'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Copy, Check, Key, Code, Terminal } from 'lucide-react'

const GuardIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
    <path d="M12 2L3 7v5c0 5.5 4.5 10 9 10s9-4.5 9-10V7l-9-5z" />
    <path d="M12 22V12" />
    <path d="M3 12h18" />
  </svg>
);

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [copied, setCopied] = useState(false)
  const [apiKey] = useState('tg_live_' + Math.random().toString(36).substring(2, 30))

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const steps = [
    { id: 1, title: 'API Key' },
    { id: 2, title: 'Integra' },
    { id: 3, title: 'Fatto' }
  ]

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#E0E0E0] font-mono py-12 px-4">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFD700] text-black mb-6">
            <GuardIcon />
          </div>
          <h1 className="text-3xl font-black uppercase italic mb-2">Benvenuto in TokenGuard!</h1>
          <p className="text-[#777] font-sans">Configurazione in 3 passaggi</p>
        </div>

        {/* Progress */}
        <div className="flex justify-between mb-12">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 flex items-center justify-center font-black text-lg ${
                  step > s.id ? 'bg-green-500 text-black' : 
                  step === s.id ? 'bg-[#FFD700] text-black' : 
                  'bg-[#222] text-[#555]'
                }`}>
                  {step > s.id ? <Check size={20} /> : s.id}
                </div>
                <span className="text-[10px] font-black uppercase mt-2 text-[#777]">{s.title}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 ${step > s.id ? 'bg-green-500' : 'bg-[#222]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="border-2 border-[#222] bg-[#111] p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FFD700]/20 flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-[#FFD700]" />
                </div>
                <h2 className="text-2xl font-black uppercase italic mb-2">La tua API Key</h2>
                <p className="text-[#777] font-sans">Copia questa chiave e conservala in sicurezza</p>
              </div>

              <div className="bg-[#0F0F0F] border-2 border-[#222] p-4">
                <div className="flex items-center justify-between gap-4">
                  <code className="text-[#FFD700] text-sm break-all font-mono">{apiKey}</code>
                  <button
                    onClick={() => copyToClipboard(apiKey)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] transition shrink-0 text-sm font-bold uppercase"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    {copied ? 'Copiato' : 'Copia'}
                  </button>
                </div>
              </div>

              <div className="bg-amber-500/10 border-2 border-amber-500/20 p-4">
                <p className="text-amber-400 text-sm font-sans">
                  <strong className="font-bold uppercase">Sicurezza:</strong> Salva questa chiave nelle variabili d&apos;ambiente, non committarla mai.
                </p>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-[#FFD700] text-black font-black uppercase flex items-center justify-center gap-2 hover:translate-x-1 hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_0px_rgba(255,215,0,0.2)]"
              >
                Continua <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FFD700]/20 flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-[#FFD700]" />
                </div>
                <h2 className="text-2xl font-black uppercase italic mb-2">Aggiorna il Codice</h2>
                <p className="text-[#777] font-sans">Cambia l&apos;URL base del tuo SDK OpenAI</p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-[#777] mb-2">Prima:</p>
                  <div className="bg-[#0F0F0F] border-2 border-[#222] p-4 overflow-x-auto">
                    <pre className="text-sm text-[#555] font-mono">
                      <code>{`const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});`}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase text-[#FFD700] mb-2">Dopo:</p>
                  <div className="bg-[#0F0F0F] border-2 border-[#FFD700]/30 p-4 overflow-x-auto">
                    <pre className="text-sm text-[#E0E0E0] font-mono">
                      <code>{`const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://tuo-sito.vercel.app/api/v1/proxy/openai',
  defaultHeaders: {
    'X-TokenGuard-Key': process.env.TOKENGUARD_API_KEY,
  },
});`}</code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border-2 border-[#222] font-black uppercase hover:bg-[#222] transition"
                >
                  Indietro
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 bg-[#FFD700] text-black font-black uppercase flex items-center justify-center gap-2 hover:translate-x-1 hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_0px_rgba(255,215,0,0.2)]"
                >
                  Continua <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-black uppercase italic mb-2">Tutto Pronto!</h2>
                <p className="text-[#777] font-sans">Inizia a fare chiamate API e guarda i risparmi crescere</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#0F0F0F] border-2 border-[#222] p-4 text-center">
                  <div className="text-2xl font-black text-[#FFD700] mb-1">30%</div>
                  <div className="text-[10px] text-[#777] uppercase font-bold">Risparmio Medio</div>
                </div>
                <div className="bg-[#0F0F0F] border-2 border-[#222] p-4 text-center">
                  <div className="text-2xl font-black text-[#FFD700] mb-1">Real-time</div>
                  <div className="text-[10px] text-[#777] uppercase font-bold">Analytics</div>
                </div>
                <div className="bg-[#0F0F0F] border-2 border-[#222] p-4 text-center">
                  <div className="text-2xl font-black text-[#FFD700] mb-1">24/7</div>
                  <div className="text-[10px] text-[#777] uppercase font-bold">Monitoraggio</div>
                </div>
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-4 bg-[#FFD700] text-black font-black uppercase flex items-center justify-center gap-2 hover:translate-x-1 hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_0px_rgba(255,215,0,0.2)]"
              >
                <Terminal size={18} />
                Vai alla Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
