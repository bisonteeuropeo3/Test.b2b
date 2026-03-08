'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2, ChevronRight, Terminal } from 'lucide-react'

const GuardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
    <path d="M12 2L3 7v5c0 5.5 4.5 10 9 10s9-4.5 9-10V7l-9-5z" />
    <path d="M12 22V12" />
    <path d="M3 12h18" />
  </svg>
);

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
    monthlyBudget: '100'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = '/onboarding'
    }, 1000)
  }

  const steps = [
    { id: 1, title: 'Identità' },
    { id: 2, title: 'Network' },
    { id: 3, title: 'Deploy' }
  ]

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#E0E0E0] font-mono selection:bg-[#FFD700] selection:text-black flex flex-col relative overflow-hidden">

      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Subtle Scanner Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-[#FFD700]/20 shadow-[0_0_15px_#FFD700] animate-[scan_6s_linear_infinite]" />

      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 w-full py-12">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="mb-10 flex flex-col items-center text-center">
            <Link href="/" className="inline-block bg-[#FFD700] text-black p-3 mb-6 hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_rgba(255,215,0,0.2)]">
              <GuardIcon />
            </Link>
            <div className="inline-block bg-[#1A1A1A] border border-[#333] px-3 py-1 text-[10px] font-bold text-[#FFD700] mb-4 uppercase tracking-widest">
              [ Setup Nuova Istanza ]
            </div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">Inizializza<br />Sistema</h1>
          </div>

          {/* Progress */}
          <div className="flex justify-center gap-4 mb-8">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center gap-4">
                <div
                  className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${s.id === step
                    ? 'bg-[#1A1A1A] text-[#FFD700] border border-[#FFD700]'
                    : s.id < step
                      ? 'bg-[#111] text-[#00FF41] border border-[#00FF41]/30'
                      : 'bg-[#0F0F0F] text-[#444] border border-[#222]'
                    }`}
                >
                  {s.id < step ? <CheckCircle2 size={14} /> : `[0${s.id}]`}
                  <span className="hidden sm:inline">{s.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-[1px] w-8 ${s.id < step ? 'bg-[#00FF41]/30' : 'bg-[#222]'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Form Box */}
          <div className="bg-[#111] border-2 border-[#222] p-8 relative">
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FFD700]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FFD700]" />

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="border-b-2 border-[#222] pb-6 mb-6">
                    <h2 className="text-lg font-black uppercase italic tracking-tighter text-white flex items-center gap-2 mb-2">
                      <Terminal size={18} className="text-[#FFD700]" />
                      Parametri_Identità
                    </h2>
                    <p className="text-[#888] text-xs font-sans">Configura le credenziali di accesso base per il nuovo nodo amministrativo.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#888] mb-2 flex justify-between">
                      <span>Email_Operativa</span>
                      <span className="text-[#333]">/REQ</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFD700] font-bold">{'>'}</span>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-8 pr-4 py-3 bg-[#0F0F0F] border border-[#333] text-white focus:outline-none focus:border-[#FFD700] transition-colors placeholder-[#444] text-xs font-mono uppercase"
                        placeholder="NOME@DOMINIO.COM"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#888] mb-2 flex justify-between">
                      <span>Chiave_Generata</span>
                      <span className="text-[#333]">/SECURE</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFD700] font-bold">{'>'}</span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-8 pr-12 py-3 bg-[#0F0F0F] border border-[#333] text-white focus:outline-none focus:border-[#FFD700] transition-colors placeholder-[#444] text-xs font-mono tracking-widest"
                        placeholder="MIN 8 CARATTERI"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#FFD700] transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (formData.email && formData.password.length >= 8) setStep(2)
                    }}
                    className={`w-full py-4 mt-8 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${formData.email && formData.password.length >= 8 ? 'bg-[#FFD700] text-black hover:bg-white shadow-[4px_4px_0px_0px_rgba(255,215,0,0.2)]' : 'bg-[#1A1A1A] text-[#555] cursor-not-allowed border border-[#333]'}`}
                  >
                    Procedi_Fase_2 <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="border-b-2 border-[#222] pb-6 mb-6">
                    <h2 className="text-lg font-black uppercase italic tracking-tighter text-white flex items-center gap-2 mb-2">
                      <Terminal size={18} className="text-[#FFD700]" />
                      Topologia_Network
                    </h2>
                    <p className="text-[#888] text-xs font-sans">Definisci l&apos;entità aziendale e i parametri di telemetria previsti.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#888] mb-2 flex justify-between">
                      <span>Nome_Organizzazione</span>
                      <span className="text-[#333]">/REQ</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFD700] font-bold">{'>'}</span>
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full pl-8 pr-4 py-3 bg-[#0F0F0F] border border-[#333] text-white focus:outline-none focus:border-[#FFD700] transition-colors placeholder-[#444] text-xs font-mono uppercase"
                        placeholder="NOME_AZIENDA_SRL"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#888] mb-2 flex justify-between">
                      <span>Volume_Traffico_EstIMATO (Mensile)</span>
                      <span className="text-[#333]">/OPT</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFD700] font-bold">{'>'}</span>
                      <select
                        value={formData.monthlyBudget}
                        onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                        className="w-full pl-8 pr-4 py-3 bg-[#0F0F0F] border border-[#333] text-white focus:outline-none focus:border-[#FFD700] transition-colors appearance-none text-xs font-mono uppercase"
                      >
                        <option value="100">LIV_1: $100 - $500</option>
                        <option value="500">LIV_2: $500 - $1,000</option>
                        <option value="1000">LIV_3: $1,000 - $5,000</option>
                        <option value="5000">LIV_4: $5,000+ (ENTERPRISE)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#555]">
                        ▼
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 py-4 bg-[#1A1A1A] border border-[#333] text-[#888] font-black text-[10px] uppercase tracking-widest hover:border-[#FFD700] hover:text-[#FFD700] transition-colors"
                    >
                      Indietro
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.companyName) setStep(3)
                      }}
                      className={`flex-1 py-4 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${formData.companyName ? 'bg-[#FFD700] text-black hover:bg-white shadow-[4px_4px_0px_0px_rgba(255,215,0,0.2)]' : 'bg-[#1A1A1A] text-[#555] cursor-not-allowed border border-[#333]'}`}
                    >
                      Procedi_Fase_3 <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center py-6 border-b-2 border-[#222]">
                    <div className="w-16 h-16 bg-[#00FF41]/10 border border-[#00FF41] flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(0,255,65,0.2)]">
                      <CheckCircle2 size={32} className="text-[#00FF41]" />
                    </div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">Parametri_Accettati</h3>
                    <p className="text-[10px] text-[#888] font-bold uppercase tracking-widest leading-relaxed">
                      L&apos;apertura del nodo implica l&apos;accettazione<br />del protocollo di servizio EULA_v2.4
                    </p>
                  </div>

                  <div className="bg-[#0F0F0F] border border-[#333] p-4 space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-[#222] pb-2">
                      <span className="text-[#555] font-bold uppercase tracking-widest text-[10px]">Target_Email</span>
                      <span className="text-[#E0E0E0]">{formData.email}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-[#222] pb-2">
                      <span className="text-[#555] font-bold uppercase tracking-widest text-[10px]">Org_Entity</span>
                      <span className="text-[#FFD700]">{formData.companyName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#555] font-bold uppercase tracking-widest text-[10px]">Tier_Allocato</span>
                      <span className="text-[#E0E0E0]">LIV_C/${formData.monthlyBudget}</span>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-1/3 py-4 bg-[#1A1A1A] border border-[#333] text-[#888] font-black text-[10px] uppercase tracking-widest hover:border-[#FFD700] hover:text-[#FFD700] transition-colors"
                    >
                      Modifica
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-4 bg-[#00FF41] text-black font-black text-sm uppercase tracking-widest hover:bg-white hover:translate-x-1 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,255,65,0.2)]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Generazione...
                        </>
                      ) : (
                        <>
                          Avvia_Istanza <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-8 pt-6 border-t border-[#222] text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#888]">
                Nodo Già Autenticato?{' '}
                <Link href="/login" className="text-[#FFD700] hover:text-white transition-colors ml-2 border-b border-[#FFD700]/30 hover:border-[#FFD700]">
                  Esegui_Log <span className="ml-1">↗</span>
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-[9px] font-mono text-[#444] leading-relaxed">
            SETUP SICURO ISO-27001 // NODO CLUSTER: EU_WEST_1<br />
            SISTEMA GESTITO DA TOKENGUARD CORE DEPLOY
          </div>
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
