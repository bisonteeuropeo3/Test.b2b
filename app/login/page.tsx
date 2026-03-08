'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'

const GuardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
    <path d="M12 2L3 7v5c0 5.5 4.5 10 9 10s9-4.5 9-10V7l-9-5z" />
    <path d="M12 22V12" />
    <path d="M3 12h18" />
  </svg>
);

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = '/dashboard'
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#E0E0E0] font-mono selection:bg-[#FFD700] selection:text-black flex flex-col relative overflow-hidden">

      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Subtle Scanner Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#FFD700]/20 blur-sm shadow-[0_0_20px_#FFD700] animate-[scan_4s_ease-in-out_infinite]" />

      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 w-full">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10 flex flex-col items-center text-center">
            <Link href="/" className="inline-block bg-[#FFD700] text-black p-3 mb-6 hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_rgba(255,215,0,0.2)]">
              <GuardIcon />
            </Link>
            <div className="inline-block bg-[#1A1A1A] border border-[#333] px-3 py-1 text-[10px] font-bold text-[#FFD700] mb-4 uppercase tracking-widest">
              [ Accesso Autorizzato Richiesto ]
            </div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">Console<br />Operativa</h1>
          </div>

          {/* Form Box */}
          <div className="bg-[#111] border-2 border-[#222] p-8 relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#FFD700]" />
            <div className="absolute top-0 right-0 w-[2px] h-8 bg-[#FFD700]" />
            <div className="absolute top-0 left-0 w-8 h-[2px] bg-[#FFD700]" />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#888] mb-2 flex justify-between">
                  <span>Identificativo</span>
                  <span className="text-[#333]">#ID_REQ</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFD700] font-bold">{'>'}</span>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 bg-[#0F0F0F] border border-[#333] text-white focus:outline-none focus:border-[#FFD700] transition-colors placeholder-[#444] text-xs font-mono uppercase"
                    placeholder="ADMIN_EMAIL@DOMINIO"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#888] mb-2 flex justify-between">
                  <span>Chiave_Sicurezza</span>
                  <span className="text-[#333]">#KEY_REQ</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFD700] font-bold">{'>'}</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-8 pr-12 py-3 bg-[#0F0F0F] border border-[#333] text-white focus:outline-none focus:border-[#FFD700] transition-colors placeholder-[#444] text-xs font-mono tracking-widest"
                    placeholder="••••••••"
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

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4 h-4 bg-[#0F0F0F] border border-[#333] relative group-hover:border-[#FFD700] transition-colors flex items-center justify-center">
                    <input type="checkbox" className="opacity-0 absolute inset-0 cursor-pointer peer" />
                    <div className="w-2 h-2 bg-[#FFD700] opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#888] group-hover:text-white transition-colors">Sessione_Persistente</span>
                </label>
                <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-[#FFD700] hover:text-white transition-colors border-b border-[#FFD700]/30 hover:border-[#FFD700]">
                  Reset_Chiave
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-8 bg-[#FFD700] text-black font-black text-sm uppercase tracking-widest hover:bg-white hover:translate-x-1 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(255,215,0,0.2)]"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Autenticazione...
                  </>
                ) : (
                  <>
                    Inizializza_Accesso <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#222] text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#888]">
                Nessuna Credenziale?{' '}
                <Link href="/signup" className="text-[#FFD700] hover:text-white transition-colors ml-2 border-b border-[#FFD700]/30 hover:border-[#FFD700]">
                  Crea_Istanza <span className="ml-1">↗</span>
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-[9px] font-mono text-[#444] leading-relaxed">
            CONNESSIONE_CRIPTATA // IP_LOGGATO: 192.168.1.1 // TLS_1.3<br />
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
