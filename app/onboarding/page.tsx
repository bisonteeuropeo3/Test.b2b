'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, CheckCircle, Copy, Key, Code, ArrowRight } from 'lucide-react'

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
    { id: 1, title: 'Get your API key', description: 'Copy your unique API key' },
    { id: 2, title: 'Update your code', description: 'Change your OpenAI base URL' },
    { id: 3, title: 'Start saving', description: 'View your analytics dashboard' },
  ]

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to TokenGuard!</h1>
          <p className="text-slate-400">Let&apos;s get you set up in 3 simple steps</p>
        </div>

        {/* Progress */}
        <div className="mb-12">
          <div className="flex justify-between">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  step >= s.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}>
                  {step > s.id ? <CheckCircle className="w-5 h-5" /> : s.id}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-24 md:w-48 h-1 mx-2 ${
                    step > s.id ? 'bg-emerald-500' : 'bg-slate-800'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((s) => (
              <div key={s.id} className="text-center w-10">
                <p className="text-xs text-slate-500 hidden md:block">{s.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Key className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Your API Key</h2>
                <p className="text-slate-400">Copy this key and keep it safe. You&apos;ll need it to authenticate your requests.</p>
              </div>

              <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <code className="text-emerald-400 text-sm break-all">{apiKey}</code>
                  <button
                    onClick={() => copyToClipboard(apiKey)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition shrink-0"
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <p className="text-emerald-400 text-sm">
                  <strong>Security tip:</strong> Store this key in your environment variables, never commit it to git.
                </p>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Code className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Update Your Code</h2>
                <p className="text-slate-400">Replace your OpenAI base URL with our proxy endpoint.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400 mb-2">Before:</p>
                  <div className="bg-slate-900 rounded-lg p-4 border border-slate-600 overflow-x-auto">
                    <pre className="text-sm text-slate-300">
                      <code>{`const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});`}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-emerald-400 mb-2">After:</p>
                  <div className="bg-slate-900 rounded-lg p-4 border border-emerald-500/30 overflow-x-auto">
                    <pre className="text-sm text-slate-300">
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
                  className="flex-1 border border-slate-600 hover:border-slate-500 text-slate-300 font-semibold py-3 rounded-lg transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
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
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">You&apos;re All Set!</h2>
                <p className="text-slate-400">Start making API calls and watch your savings grow.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-600 text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-1">30%</div>
                  <div className="text-sm text-slate-400">Avg. savings</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-600 text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-1">Real-time</div>
                  <div className="text-sm text-slate-400">Analytics</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-600 text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-1">24/7</div>
                  <div className="text-sm text-slate-400">Monitoring</div>
                </div>
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Help */}
        <p className="text-center text-slate-500 text-sm mt-8">
          Need help? Check our{' '}
          <a href="#" className="text-emerald-400 hover:text-emerald-300">documentation</a>
          {' '}or{' '}
          <a href="#" className="text-emerald-400 hover:text-emerald-300">contact support</a>
        </p>
      </div>
    </div>
  )
}
