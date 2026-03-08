'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Activity,
  Zap,
  ChevronDown,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(false)

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">TokenGuard</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={refreshData}
                className={`p-2 rounded-lg hover:bg-white/5 transition ${isLoading ? 'animate-spin' : ''}`}
              >
                <RefreshCw className="w-5 h-5 text-white/60" />
              </button>
              <div className="h-6 w-px bg-white/10" />
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                <ChevronDown className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
            <p className="text-white/50">Monitor your LLM usage and costs</p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-violet-500"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Spent"
            value="$1,247.50"
            change="+12%"
            changeType="negative"
            icon={<DollarSign className="w-5 h-5" />}
            gradient="from-violet-500 to-purple-500"
          />
          <StatCard 
            title="Tokens Used"
            value="2.4M"
            change="+8%"
            changeType="neutral"
            icon={<Activity className="w-5 h-5" />}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard 
            title="Cost Saved"
            value="$312.00"
            change="+23%"
            changeType="positive"
            icon={<TrendingUp className="w-5 h-5" />}
            gradient="from-emerald-500 to-teal-500"
          />
          <StatCard 
            title="API Calls"
            value="15,234"
            change="-5%"
            changeType="positive"
            icon={<Zap className="w-5 h-5" />}
            gradient="from-amber-500 to-orange-500"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 rounded-2xl bg-white/[0.02] border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Cost Overview</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500" />
                  <span className="text-white/50">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <span className="text-white/50">Projected</span>
                </div>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-3">
              {[65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50, 80].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 items-end">
                    <div 
                      className="flex-1 bg-gradient-to-t from-violet-500 to-violet-400 rounded-t transition-all hover:opacity-80"
                      style={{ height: `${height}%` }}
                    />
                    <div 
                      className="flex-1 bg-white/10 rounded-t"
                      style={{ height: `${height * 0.7}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/30">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Alerts */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Alerts</h3>
                <span className="text-xs text-white/50">3 new</span>
              </div>
              <div className="space-y-3">
                <AlertItem 
                  type="warning"
                  title="Budget threshold"
                  message="You've reached 80% of your monthly budget"
                  time="2h ago"
                />
                <AlertItem 
                  type="info"
                  title="Duplicates detected"
                  message="23 duplicate calls prevented"
                  time="5h ago"
                />
                <AlertItem 
                  type="success"
                  title="Cost saved"
                  message="$45 saved this week via caching"
                  time="1d ago"
                />
              </div>
            </div>

            {/* Top Models */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
              <h3 className="font-semibold mb-4">Top Models</h3>
              <div className="space-y-4">
                <ModelRow name="GPT-4" cost="$892" percent={75} color="bg-violet-500" />
                <ModelRow name="GPT-3.5" cost="$245" percent={20} color="bg-blue-500" />
                <ModelRow name="Claude 3" cost="$110" percent={5} color="bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Recent API Calls</h3>
            <Link href="#" className="text-sm text-violet-400 hover:text-violet-300">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Time</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Model</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Tokens</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Cost</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                <TableRow 
                  time="2 min ago"
                  model="gpt-4"
                  tokens="1,245"
                  cost="$0.037"
                  status="success"
                />
                <TableRow 
                  time="5 min ago"
                  model="gpt-3.5-turbo"
                  tokens="892"
                  cost="$0.001"
                  status="success"
                />
                <TableRow 
                  time="12 min ago"
                  model="gpt-4"
                  tokens="2,104"
                  cost="$0.063"
                  status="cached"
                />
                <TableRow 
                  time="15 min ago"
                  model="claude-3-opus"
                  tokens="567"
                  cost="$0.008"
                  status="success"
                />
                <TableRow 
                  time="18 min ago"
                  model="gpt-3.5-turbo"
                  tokens="1,432"
                  cost="$0.002"
                  status="success"
                />
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, change, changeType, icon, gradient }: { 
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  gradient: string
}) {
  const changeColors = {
    positive: 'text-emerald-400',
    negative: 'text-red-400',
    neutral: 'text-white/60'
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 hover:bg-white/[0.04] transition">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          {icon}
        </div>
        <span className={`text-sm ${changeColors[changeType]}`}>
          {change}
        </span>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-white/50">{title}</div>
    </div>
  )
}

function AlertItem({ type, title, message, time }: { 
  type: 'warning' | 'info' | 'success'
  title: string
  message: string
  time: string
}) {
  const colors = {
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
  }

  const icons = {
    warning: AlertCircle,
    info: Activity,
    success: TrendingUp
  }

  const Icon = icons[type]

  return (
    <div className={`p-4 rounded-xl border ${colors[type]}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-sm mb-1">{title}</p>
          <p className="text-sm opacity-80">{message}</p>
          <p className="text-xs opacity-60 mt-2">{time}</p>
        </div>
      </div>
    </div>
  )
}

function ModelRow({ name, cost, percent, color }: { 
  name: string
  cost: string
  percent: number
  color: string
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium">{name}</span>
        <span className="text-white/50">{cost}</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function TableRow({ time, model, tokens, cost, status }: { 
  time: string
  model: string
  tokens: string
  cost: string
  status: 'success' | 'cached' | 'error'
}) {
  const statusColors = {
    success: 'bg-emerald-500/10 text-emerald-400',
    cached: 'bg-violet-500/10 text-violet-400',
    error: 'bg-red-500/10 text-red-400'
  }

  const statusLabels = {
    success: 'Success',
    cached: 'Cached',
    error: 'Error'
  }

  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition">
      <td className="py-4 px-4 text-sm text-white/60">{time}</td>
      <td className="py-4 px-4">
        <span className="text-sm font-medium px-3 py-1 rounded-full bg-white/5">
          {model}
        </span>
      </td>
      <td className="py-4 px-4 text-sm text-white/60">{tokens}</td>
      <td className="py-4 px-4 text-sm font-medium">{cost}</td>
      <td className="py-4 px-4">
        <span className={`text-xs px-3 py-1 rounded-full ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </td>
    </tr>
  )
}
