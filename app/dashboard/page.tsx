'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Activity,
  Zap,
  Settings
} from 'lucide-react'

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('7d')

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">TokenGuard</span>
            </div>
            <div className="flex items-center gap-4">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="24h">Last 24h</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
              <button className="p-2 hover:bg-slate-100 rounded-lg">
                <Settings className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Spent"
            value="$1,247.50"
            change="+12%"
            changeType="negative"
            icon={<DollarSign className="w-5 h-5" />}
          />
          <StatCard 
            title="Tokens Used"
            value="2.4M"
            change="+8%"
            changeType="neutral"
            icon={<Activity className="w-5 h-5" />}
          />
          <StatCard 
            title="Cost Saved"
            value="$312.00"
            change="+23%"
            changeType="positive"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatCard 
            title="API Calls"
            value="15,234"
            change="-5%"
            changeType="positive"
            icon={<Zap className="w-5 h-5" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Cost Over Time</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-emerald-500 rounded-t-lg transition-all hover:bg-emerald-600"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-slate-500">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Alerts */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-slate-900">Alerts</h3>
              </div>
              <div className="space-y-3">
                <AlertItem 
                  type="warning"
                  message="Budget 80% reached"
                  time="2h ago"
                />
                <AlertItem 
                  type="info"
                  message="23 duplicate calls detected"
                  time="5h ago"
                />
                <AlertItem 
                  type="success"
                  message="Saved $45 this week"
                  time="1d ago"
                />
              </div>
            </div>

            {/* Top Models */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Top Models</h3>
              <div className="space-y-3">
                <ModelRow name="GPT-4" cost="$892" percent={75} />
                <ModelRow name="GPT-3.5" cost="$245" percent={20} />
                <ModelRow name="Claude" cost="$110" percent={5} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent API Calls</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Timestamp</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Model</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Tokens</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Cost</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
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
                  model="claude-3"
                  tokens="567"
                  cost="$0.008"
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

function StatCard({ title, value, change, changeType, icon }: { 
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
}) {
  const changeColors = {
    positive: 'text-emerald-600 bg-emerald-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-slate-600 bg-slate-50'
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-500 text-sm">{title}</span>
        <div className="text-slate-400">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${changeColors[changeType]}`}>
          {change}
        </span>
      </div>
    </div>
  )
}

function AlertItem({ type, message, time }: { type: 'warning' | 'info' | 'success', message: string, time: string }) {
  const colors = {
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800'
  }

  return (
    <div className={`p-3 rounded-lg border text-sm ${colors[type]}`}>
      <p className="font-medium">{message}</p>
      <p className="text-xs opacity-70 mt-1">{time}</p>
    </div>
  )
}

function ModelRow({ name, cost, percent }: { name: string, cost: string, percent: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700">{name}</span>
        <span className="text-slate-500">{cost}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div 
          className="bg-emerald-500 h-2 rounded-full transition-all"
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
    success: 'bg-emerald-100 text-emerald-700',
    cached: 'bg-blue-100 text-blue-700',
    error: 'bg-red-100 text-red-700'
  }

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="py-3 px-4 text-sm text-slate-600">{time}</td>
      <td className="py-3 px-4 text-sm font-medium text-slate-900">{model}</td>
      <td className="py-3 px-4 text-sm text-slate-600">{tokens}</td>
      <td className="py-3 px-4 text-sm font-medium text-slate-900">{cost}</td>
      <td className="py-3 px-4">
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status]}`}>
          {status}
        </span>
      </td>
    </tr>
  )
}
