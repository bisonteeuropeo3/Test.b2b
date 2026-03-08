'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'

const GuardIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
    <path d="M12 2L3 7v5c0 5.5 4.5 10 9 10s9-4.5 9-10V7l-9-5z" />
    <path d="M12 22V12" />
    <path d="M3 12h18" />
  </svg>
);

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = '/dashboard'
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
          <h1 className="text-3xl font-black uppercase italic mb-2">Accedi</h1>
          <p className="text-[#777] font-sans">Entra nella console TokenGuard</p>
        </div>

        <div className="border-2 border-[#222] bg-[#111] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0F0F0F] border-2 border-[#222] text-white focus:outline-none focus:border-[#FFD700] transition font-mono"
                  placeholder="••••••••"
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
              type="submit"
              className="w-full py-4 bg-[#FFD700] text-black font-black uppercase flex items-center justify-center gap-2 hover:translate-x-1 hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_0px_rgba(255,215,0,0.2)]"
            >
              Accedi <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-[#222] text-center">
            <p className="text-[#777] text-sm">
              Non hai un account?{' '}
              <Link href="/signup" className="text-[#FFD700] hover:underline font-bold uppercase">
                Registrati
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
