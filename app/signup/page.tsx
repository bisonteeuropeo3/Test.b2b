'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, Check } from 'lucide-react'

const GuardIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
    <path d="M12 2L3 7v5c0 5.5 4.5 10 9 10s9-4.5 9-10V7l-9-5z" />
    <path d="M12 22V12" />
    <path d="M3 12h18" />
  </svg>
);

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
    monthlyBudget: '100'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = '/onboarding'
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#E0E0E0] font-mono flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFD700] text-black mb-6">
            <GuardIcon />
          </div>
          <h1 className="text-3xl font-black uppercase italic mb-2">Crea Account</h1>
          <p className="text-[#777] font-sans">Inizia a risparmiare sui costi LLM</p>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-10 h-10 flex items-center justify-center font-black text-sm ${
                s === step ? 'bg-[#FFD700] text-black' : 
                s < step ? 'bg-green-500 text-black' : 
                'bg-[#222] text-[#555]'
              }`}
            >
              {s < step ? <Check size={18} /> : s}
            </div>
          ))}
        </div>

        <div className="border-2 border-[#222] bg-[#111] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#777] mb-2 tracking-widest">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0F0F0F] border-2 border-[#222] text-white focus:outline-none focus:border-[#FFD700] transition font-mono"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-[#777] mb-2 tracking-widest">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0F0F0F] border-2 border-[#222] text-white focus:outline-none focus:border-[#FFD700] transition font-mono"
                      placeholder="Min 8 caratteri"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-[#FFD700] text-black font-black uppercase flex items-center justify-center gap-2 hover:translate-x-1 hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_0px_rgba(255,215,0,0.2)]"
                >
                  Continua <ArrowRight size={18} />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#777] mb-2 tracking-widest">
                    Nome Azienda
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0F0F0F] border-2 border-[#222] text-white focus:outline-none focus:border-[#FFD700] transition font-mono"
                    placeholder="Mia Azienda"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-[#777] mb-2 tracking-widest">
                    Budget Mensile LLM
                  </label>
                  <select
                    value={formData.monthlyBudget}
                    onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0F0F0F] border-2 border-[#222] text-white focus:outline-none focus:border-[#FFD700] transition font-mono"
                  >
                    <option value="100">$100 - $500</option>
                    <option value="500">$500 - $1,000</option>
                    <option value="1000">$1,000 - $5,000</option>
                    <option value="5000">$5,000+</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 border-2 border-[#222] font-black uppercase hover:bg-[#222] transition"
                  >
                    Indietro
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-4 bg-[#FFD700] text-black font-black uppercase flex items-center justify-center gap-2 hover:translate-x-1 hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_0px_rgba(255,215,0,0.2)]"
                  >
                    Continua <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-black uppercase italic mb-2">Pronto!</h3>
                  <p className="text-[#777] text-sm">
                    Clicca il pulsante per completare la registrazione
                  </p>
                </div>

                <div className="bg-[#0F0F0F] border-2 border-[#222] p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#777]">Email</span>
                    <span>{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#777]">Azienda</span>
                    <span>{formData.companyName || '---'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#777]">Budget</span>
                    <span>${formData.monthlyBudget}/mese</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 border-2 border-[#222] font-black uppercase hover:bg-[#222] transition"
                  >
                    Indietro
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-[#FFD700] text-black font-black uppercase flex items-center justify-center gap-2 hover:translate-x-1 hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_0px_rgba(255,215,0,0.2)]"
                  >
                    Crea Account <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 pt-6 border-t-2 border-[#222] text-center">
            <p className="text-[#777] text-sm">
              Hai già un account?{' '}
              <Link href="/login" className="text-[#FFD700] hover:underline font-bold uppercase">
                Accedi
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
