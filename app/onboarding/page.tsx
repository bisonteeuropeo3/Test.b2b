'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Copy, Key, Code, ArrowRight, Terminal, Zap } from 'lucide-react'

const GuardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
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
    { id: 1, title: 'Chiave_API', desc: 'Recupero credenziali' },
    { id: 2, title: 'Integrazione', desc: 'Aggiornamento script' },
    { id: 3, title: 'Verifica', desc: 'Connettività stabilita' }
  ]

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#E0E0E0] font-mono selection:bg-[#FFD700] selection:text-black py-12 px-4 relative overflow-hidden flex flex-col items-center">

      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Subtle Scanner Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-[#FFD700]/20 shadow-[0_0_15px_#FFD700] animate-[scan_6s_linear_infinite]" />

      <div className="relative z-10 w-full max-w-3xl flex-1 flex flex-col justify-center py-12">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="inline-block bg-[#00FF41] text-black p-4 mb-6 relative hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_rgba(0,255,65,0.2)]">
            <GuardIcon />
            <div className="absolute top-0 right-0 w-2 h-2 bg-black animate-pulse" />
          </div>
          <div className="inline-block bg-[#1A1A1A] border border-[#333] px-3 py-1 text-[10px] font-bold text-[#00FF41] mb-4 uppercase tracking-widest">
            [ Inizializzazione Completata ]
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter text-white">Setup_Operativo</h1>
          <p className="mt-2 text-[#888] font-bold tracking-widest uppercase text-xs">Esegui l'onboarding per attivare la telemetria.</p>
        </div>

        {/* Progress Tracker */}
        <div className="flex flex-col sm:flex-row justify-between mb-12 relative animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="absolute top-6 left-0 w-full h-[2px] bg-[#222] hidden sm:block -z-10" />

          {steps.map((s, i) => (
            <div key={s.id} className="flex flex-col items-center relative z-10 mb-6 sm:mb-0">
              <div className={`w-14 h-14 border-2 flex items-center justify-center font-black text-lg mb-4 transition-all ${step > s.id
                  ? 'bg-[#00FF41]/10 border-[#00FF41] text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.2)]'
                  : step === s.id
                    ? 'bg-[#FFD700] border-[#FFD700] text-black shadow-[4px_4px_0px_0px_rgba(255,215,0,0.2)]'
                    : 'bg-[#111] border-[#333] text-[#555]'
                }`}>
                {step > s.id ? <CheckCircle2 size={24} /> : `0${s.id}`}
              </div>
              <div className="text-center bg-[#0F0F0F] px-4 py-1 border border-[#222]">
                <p className={`text-[10px] font-bold tracking-widest uppercase ${step >= s.id ? 'text-white' : 'text-[#555]'}`}>{s.title}</p>
                <p className="text-[9px] text-[#555] tracking-widest font-sans uppercase hidden sm:block mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Content Box */}
        <div className="bg-[#111] border-2 border-[#222] p-6 sm:p-10 relative">
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FFD700]" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FFD700]" />

          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-b-2 border-[#222] pb-6">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3 mb-2">
                  <Key className="text-[#FFD700]" size={28} /> Generazione_Chiave
                </h2>
                <p className="text-[#888] text-xs font-sans uppercase tracking-widest leading-relaxed">
                  Copia questa chiave di sicurezza. È richiesta per autenticare le richieste API del nodo verso il cluster centrale.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#888] flex justify-between">
                  <span>API_KEY_PRIMARIA</span>
                  <span className="text-[#FFD700] text-[9px] border border-[#FFD700] px-1">Segreto</span>
                </label>
                <div className="bg-[#0F0F0F] border border-[#333] p-1 flex">
                  <div className="flex-1 px-4 py-3 flex items-center overflow-x-auto relative">
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFD700]" />
                    <code className="text-[#00FF41] text-sm break-all font-mono tracking-wider ml-2">{apiKey}</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(apiKey)}
                    className={`shrink-0 px-6 font-black text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2 border-l border-[#333] ${copied ? 'bg-[#00FF41] text-black' : 'hover:bg-[#FFD700] hover:text-black text-[#888]'}`}
                  >
                    {copied ? <><CheckCircle2 size={16} /> COPIATO</> : <><Copy size={16} /> COPIA</>}
                  </button>
                </div>
              </div>

              <div className="bg-[#FFD700]/5 border border-[#FFD700]/30 p-4 border-l-4 border-l-[#FFD700]">
                <p className="text-[#FFD700] text-[10px] font-bold tracking-widest uppercase">
                  <span className="text-white mr-2">AVVERTENZA_SICUREZZA:</span>
                  Memorizza questa chiave nelle variabili d'ambiente. Non effettuarne il commit in repository pubblici.
                </p>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-5 bg-[#FFD700] text-black font-black text-sm uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(255,215,0,0.2)] group"
              >
                Procedi_Integrazione <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-b-2 border-[#222] pb-6">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3 mb-2">
                  <Code className="text-[#FFD700]" size={28} /> Routing_Proxy
                </h2>
                <p className="text-[#888] text-xs font-sans uppercase tracking-widest leading-relaxed">
                  Aggiorna i puntamenti del layer applicativo per instradare il traffico attraverso il nodo reverse-proxy.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#555] mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Configurazione_Obsoleta (Legacy)
                  </label>
                  <div className="bg-[#0F0F0F] border border-[#333] p-4 font-mono text-xs overflow-x-auto relative">
                    <pre className="text-[#888]">
                      <code>{`const openai = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY,
 });`}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#FFD700] mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse" />
                    Routing_Configurato (Nuovo)
                  </label>
                  <div className="bg-[#050505] border border-[#00FF41]/30 p-4 font-mono text-xs overflow-x-auto relative shadow-[intset_0_0_10px_rgba(0,255,65,0.05)]">
                    <pre className="text-[#E0E0E0]">
                      <code>{`const openai = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY,
 `}<span className="text-[#FFD700]">  baseURL: 'https://gateway.tokenguard.io/v1',</span>{`
 `}<span className="text-[#FFD700]">  defaultHeaders: {</span>{`
 `}<span className="text-[#FFD700]">    'X-TokenGuard-Key': process.env.TOKENGUARD_API_KEY,</span>{`
 `}<span className="text-[#FFD700]">  },</span>{`
 });`}</code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="sm:w-1/3 py-4 bg-[#1A1A1A] border border-[#333] text-[#888] font-black text-[10px] uppercase tracking-widest hover:border-[#FFD700] hover:text-[#FFD700] transition-colors"
                >
                  Indietro
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 bg-[#FFD700] text-black font-black text-sm uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(255,215,0,0.2)] group"
                >
                  Conferma_Rotta <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center py-8 border-b-2 border-[#222]">
                <div className="w-20 h-20 bg-[#00FF41]/10 border-2 border-[#00FF41] flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(0,255,65,0.3)] relative">
                  <CheckCircle2 size={40} className="text-[#00FF41]" />
                  <div className="absolute -right-2 -top-2 w-4 h-4 bg-[#0F0F0F] border border-[#00FF41]" />
                </div>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">Connessione_Stabilita</h3>
                <p className="text-[10px] text-[#888] font-bold uppercase tracking-widest">
                  Il nodo è pronto a processare le pipeline d'inferenza.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0F0F0F] border border-[#333] p-4 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#FFD700]/0 to-[#FFD700]/5 group-hover:to-[#FFD700]/10 transition-colors" />
                  <div className="text-3xl font-black text-[#FFD700] mb-1 italic">30%</div>
                  <div className="text-[9px] text-[#555] font-bold uppercase tracking-widest border-t border-[#222] pt-2 mt-2">Rate_Risparmio_Est.</div>
                </div>
                <div className="bg-[#0F0F0F] border border-[#333] p-4 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#00FF41]/0 to-[#00FF41]/5 group-hover:to-[#00FF41]/10 transition-colors" />
                  <div className="text-3xl font-black text-[#00FF41] mb-1 italic flex justify-center"><Zap size={32} /></div>
                  <div className="text-[9px] text-[#555] font-bold uppercase tracking-widest border-t border-[#222] pt-2 mt-2">Latenza_Ottimizzata</div>
                </div>
                <div className="bg-[#0F0F0F] border border-[#333] p-4 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#E0E0E0]/0 to-[#E0E0E0]/5 group-hover:to-[#E0E0E0]/10 transition-colors" />
                  <div className="text-3xl font-black text-[#E0E0E0] mb-1 italic">24/7</div>
                  <div className="text-[9px] text-[#555] font-bold uppercase tracking-widest border-t border-[#222] pt-2 mt-2">Uptime_Garantito</div>
                </div>
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-5 bg-[#00FF41] text-black font-black text-sm uppercase tracking-widest hover:bg-white hover:translate-x-1 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,255,65,0.2)] group"
              >
                <Terminal size={20} /> Entra_In_Console <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-[#555] flex justify-center gap-6">
          <a href="#" className="hover:text-[#FFD700] transition-colors border-b border-transparent hover:border-[#FFD700]">Doc_Tecnica</a>
          <span>//</span>
          <a href="#" className="hover:text-[#FFD700] transition-colors border-b border-transparent hover:border-[#FFD700]">Supporto_Linea_1</a>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
