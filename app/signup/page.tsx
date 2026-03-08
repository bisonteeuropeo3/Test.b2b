'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'

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
    { id: 1, title: 'Account' },
    { id: 2, title: 'Company' },
    { id: 3, title: 'Review' }
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-900/20 via-[#0a0a0f] to-blue-900/20" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 mb-6">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Create account</h1>
          <p className="text-white/50">Start saving on your LLM costs</p>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                s.id === step
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50'
                  : s.id < step
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-white/5 text-white/40'
              }`}
            >
              {s.id < step ? <CheckCircle2 className="w-4 h-4" /> : s.id}
              <span className="hidden sm:inline">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-8 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Work email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition"
                      placeholder="Min 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Company name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition"
                    placeholder="Acme Inc"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Monthly LLM budget
                  </label>
                  <select
                    value={formData.monthlyBudget}
                    onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500 transition"
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
                    className="flex-1 py-3 rounded-xl border border-white/10 font-semibold hover:bg-white/5 transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ready to go!</h3>
                  <p className="text-white/50 text-sm">
                    By creating an account, you agree to our Terms and Privacy Policy
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">Email</span>
                    <span>{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Company</span>
                    <span>{formData.companyName || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Budget</span>
                    <span>${formData.monthlyBudget}/mo</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 rounded-xl border border-white/10 font-semibold hover:bg-white/5 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create account'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/50">
              Already have an account?{' '}
              <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
