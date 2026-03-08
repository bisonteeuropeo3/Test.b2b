'use client'

import Link from 'next/link'
import { 
  Shield, 
  Zap, 
  BarChart3, 
  Wallet, 
  ArrowRight,
  CheckCircle2,
  TrendingDown,
  Clock,
  Globe,
  Sparkles
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-900/20 via-[#0a0a0f] to-blue-900/20 pointer-events-none" />
      
      {/* Animated Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                TokenGuard
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="#features" className="text-sm text-white/60 hover:text-white transition">
                Features
              </Link>
              <Link href="#pricing" className="text-sm text-white/60 hover:text-white transition">
                Pricing
              </Link>
              <Link href="/login" className="text-sm text-white/60 hover:text-white transition">
                Login
              </Link>
              <Link 
                href="/signup" 
                className="px-5 py-2.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-white/90 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-white/70">Now with AI-powered insights</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Cut LLM Costs by{' '}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                50%
              </span>
            </h1>
            
            <p className="text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
              Monitor, optimize, and reduce your OpenAI & Anthropic API spending. 
              Real-time analytics, smart caching, and automatic duplicate detection.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/signup" 
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold text-lg hover:opacity-90 transition flex items-center gap-2"
              >
                Start Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link 
                href="/dashboard" 
                className="px-8 py-4 rounded-xl border border-white/20 font-semibold text-lg hover:bg-white/5 transition"
              >
                View Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 pt-12 border-t border-white/10">
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  $2.4M+
                </div>
                <div className="text-white/40 mt-2">Saved for customers</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  500+
                </div>
                <div className="text-white/40 mt-2">Active teams</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  30%
                </div>
                <div className="text-white/40 mt-2">Avg. reduction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-32 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-white/50 text-lg">Powerful features to control your AI spending</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6" />}
              title="Real-time Analytics"
              description="Track costs per endpoint, model, and time period. Understand exactly where your money goes."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard 
              icon={<TrendingDown className="w-6 h-6" />}
              title="Smart Caching"
              description="Automatically cache identical prompts and save up to 40% on duplicate requests."
              gradient="from-violet-500 to-purple-500"
            />
            <FeatureCard 
              icon={<Wallet className="w-6 h-6" />}
              title="Budget Alerts"
              description="Set spending limits and get notified via email or Slack before you exceed your budget."
              gradient="from-fuchsia-500 to-pink-500"
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Zero Code Changes"
              description="Just change your API endpoint. We handle the rest with our smart proxy."
              gradient="from-amber-500 to-orange-500"
            />
            <FeatureCard 
              icon={<Clock className="w-6 h-6" />}
              title="Latency Monitoring"
              description="Track API response times and identify slow endpoints affecting your users."
              gradient="from-emerald-500 to-teal-500"
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6" />}
              title="Multi-provider"
              description="Support for OpenAI, Anthropic, Cohere, and more. All in one dashboard."
              gradient="from-rose-500 to-red-500"
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 py-32 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-white/50 text-lg">Get started in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StepCard 
              number="01"
              title="Connect"
              description="Change your OpenAI base URL to our proxy endpoint. One line of code."
            />
            <StepCard 
              number="02"
              title="Monitor"
              description="Watch real-time analytics as your API calls flow through our dashboard."
            />
            <StepCard 
              number="03"
              title="Save"
              description="Automatic duplicate detection and caching start saving you money immediately."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 py-32 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Simple pricing</h2>
            <p className="text-white/50 text-lg">Start free, scale as you grow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard 
              name="Free"
              price="$0"
              description="Perfect for side projects"
              features={[
                '1 team member',
                '10k requests/month',
                'Basic analytics',
                'Email support',
              ]}
            />
            <PricingCard 
              name="Pro"
              price="$29"
              description="For growing teams"
              features={[
                'Unlimited team members',
                '100k requests/month',
                'Advanced analytics',
                'Priority support',
                'Slack alerts',
                'Custom dashboards',
              ]}
              popular
            />
            <PricingCard 
              name="Enterprise"
              price="$99"
              description="For large organizations"
              features={[
                'Everything in Pro',
                'Unlimited requests',
                'SSO & SAML',
                'Dedicated support',
                'Custom integrations',
                'SLA guarantee',
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-32 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to save money?</h2>
          <p className="text-xl text-white/50 mb-10">
            Join 500+ teams already reducing their AI bills
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-semibold text-lg hover:bg-white/90 transition"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">TokenGuard</span>
            </div>
            <p className="text-white/40 text-sm">
              © 2025 TokenGuard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, gradient }: { 
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}) {
  return (
    <div className="group p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-white/50 leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: { 
  number: string
  title: string
  description: string
}) {
  return (
    <div className="relative">
      <div className="text-6xl font-bold text-white/5 mb-4">{number}</div>
      <h3 className="text-2xl font-semibold mb-3">{title}</h3>
      <p className="text-white/50 leading-relaxed">{description}</p>
    </div>
  )
}

function PricingCard({ name, price, description, features, popular }: { 
  name: string
  price: string
  description: string
  features: string[]
  popular?: boolean
}) {
  return (
    <div className={`relative p-8 rounded-2xl ${popular ? 'bg-gradient-to-b from-violet-500/20 to-transparent border-2 border-violet-500/50' : 'bg-white/[0.02] border border-white/10'}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-violet-500 text-sm font-medium">
          Most Popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-white/50 text-sm">{description}</p>
      </div>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-white/50">/mo</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0" />
            <span className="text-white/70">{feature}</span>
          </li>
        ))}
      </ul>
      <Link 
        href="/signup" 
        className={`block text-center py-3 rounded-lg font-medium transition ${
          popular 
            ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-90' 
            : 'bg-white/10 hover:bg-white/20'
        }`}
      >
        Get Started
      </Link>
    </div>
  )
}
