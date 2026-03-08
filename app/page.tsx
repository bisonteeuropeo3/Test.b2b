import Link from 'next/link'
import { BarChart3, Shield, Zap, DollarSign, TrendingDown } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero */}
      <div className="container mx-auto px-6 py-20">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-emerald-400" />
            <span className="text-2xl font-bold">TokenGuard</span>
          </div>
          <div className="flex gap-6">
            <Link href="/login" className="text-slate-300 hover:text-white transition">Login</Link>
            <Link href="/dashboard" className="bg-emerald-500 hover:bg-emerald-600 px-6 py-2 rounded-lg font-semibold transition">
              Get Started
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Cut Your LLM Costs by{' '}
            <span className="text-emerald-400">50%</span>
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Monitor, optimize, and reduce your OpenAI & Anthropic API spending. 
            Detect duplicate calls, track usage patterns, and get actionable insights.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard" className="bg-emerald-500 hover:bg-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg transition flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Start Free
            </Link>
            <Link href="#features" className="border border-slate-600 hover:border-slate-400 px-8 py-4 rounded-xl font-semibold text-lg transition">
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-slate-800/50 border-y border-slate-700">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">$2.4M+</div>
              <div className="text-slate-400">Costs Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">500+</div>
              <div className="text-slate-400">Teams Protected</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">30%</div>
              <div className="text-slate-400">Avg. Cost Reduction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="container mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-16">Everything You Need to Control LLM Costs</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<BarChart3 className="w-8 h-8 text-blue-400" />}
            title="Real-time Analytics"
            description="Track costs per endpoint, model, and time period. Understand exactly where your money goes."
          />
          <FeatureCard 
            icon={<TrendingDown className="w-8 h-8 text-red-400" />}
            title="Duplicate Detection"
            description="Automatically identify and flag redundant API calls that are wasting your budget."
          />
          <FeatureCard 
            icon={<DollarSign className="w-8 h-8 text-green-400" />}
            title="Budget Alerts"
            description="Set spending limits and get notified before you exceed your budget."
          />
          <FeatureCard 
            icon={<Shield className="w-8 h-8 text-purple-400" />}
            title="Zero Code Changes"
            description="Just change your API endpoint. We handle the rest with our smart proxy."
          />
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-yellow-400" />}
            title="Smart Caching"
            description="Optional response caching for identical prompts to reduce API calls."
          />
          <FeatureCard 
            icon={<BarChart3 className="w-8 h-8 text-cyan-400" />}
            title="Team Insights"
            description="See which features and team members drive the most LLM usage."
          />
        </div>
      </div>

      {/* CTA */}
      <div className="bg-emerald-600">
        <div className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Save on LLM Costs?</h2>
          <p className="text-xl mb-8 text-emerald-100">Join 500+ teams already reducing their AI bills</p>
          <Link href="/dashboard" className="bg-white text-emerald-600 hover:bg-slate-100 px-8 py-4 rounded-xl font-bold text-lg transition inline-block">
            Get Started for Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 py-12">
        <div className="container mx-auto px-6 text-center text-slate-500">
          <p>&copy; 2025 TokenGuard. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:border-slate-600 transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  )
}
