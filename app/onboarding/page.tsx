'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, CheckCircle2, Copy, Key, Code, ArrowRight, Terminal } from 'lucide-react'

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
    { id: 1, title: 'API Key', desc: 'Get your credentials' },
    { id: 2, title: 'Integrate', desc: 'Update your code' },
    { id: 3, title: 'Done', desc: 'Start saving' }
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-900/20 via-[#0a0a0f] to-blue-900/20" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 mb-6">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to TokenGuard!</h1>
          <p className="text-white/50">Let&apos;s get you set up in 3 simple steps</p>
        </div>

        {/* Progress */}
        <div className="flex justify-between mb-12">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold mb-2 transition ${
                  step > s.id 
                    ? 'bg-emerald-500 text-white' 
                    : step === s.id 
                    ? 'bg-violet-500 text-white' 
                    : 'bg-white/5 text-white/40 border border-white/10'
                }`}>
                  {step > s.id ? <CheckCircle2 className="w-6 h-6" /> : s.id}
                </div>
                <div className="text-center hidden sm:block">
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="text-xs text-white/40">{s.desc}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded-full transition ${
                  step > s.id ? 'bg-emerald-500' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-8 backdrop-blur-xl">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-violet-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Your API Key</h2>
                <p className="text-white/50">Copy this key and keep it safe. You&apos;ll need it to authenticate your requests.</p>
              </div>

              <div className="bg-black/50 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between gap-4">
                  <code className="text-violet-400 text-sm break-all font-mono">{apiKey}</code>
                  <button
                    onClick={() => copyToClipboard(apiKey)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition shrink-0"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <p className="text-amber-400 text-sm">
                  <strong>Security tip:</strong> Store this key in your environment variables, never commit it to git.
                </p>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Update Your Code</h2>
                <p className="text-white/50">Replace your OpenAI base URL with our proxy endpoint.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/40 mb-2">Before:</p>
                  <div className="bg-black/50 rounded-xl p-4 border border-white/10 overflow-x-auto">
                    <pre className="text-sm text-white/60 font-mono">
                      <code>{`const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});`}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-violet-400 mb-2">After:</p>
                  <div className="bg-black/50 rounded-xl p-4 border border-violet-500/30 overflow-x-auto">
                    <pre className="text-sm text-white/80 font-mono">
                      <code>{`const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://your-domain.vercel.app/api/v1/proxy/openai',
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
                  className="flex-1 py-3 rounded-xl border border-white/10 font-semibold hover:bg-white/5 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">You&apos;re All Set!</h2>
                <p className="text-white/50">Start making API calls and watch your savings grow.</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                  <div className="text-2xl font-bold text-violet-400 mb-1">30%</div>
                  <div className="text-xs text-white/40">Avg. savings</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                  <div className="text-2xl font-bold text-violet-400 mb-1">Real-time</div>
                  <div className="text-xs text-white/40">Analytics</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                  <div className="text-2xl font-bold text-violet-400 mb-1">24/7</div>
                  <div className="text-xs text-white/40">Monitoring</div>
                </div>
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <Terminal className="w-5 h-5" />
                Go to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Help */}
        <p className="text-center text-white/40 text-sm mt-8">
          Need help? Check our{' '}
          <a href="#" className="text-violet-400 hover:text-violet-300">documentation</a>
          {' '}or{' '}
          <a href="#" className="text-violet-400 hover:text-violet-300">contact support</a>
        </p>
      </div>
    </div>
  )
}
