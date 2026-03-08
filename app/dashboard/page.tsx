'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  RefreshCw,
  Wallet,
  Activity,
  TrendingDown,
  Zap,
  LogOut,
  BarChart3,
  BookOpen,
  Settings
} from 'lucide-react'

interface ApiLog {
  id: string
  provider: string
  model: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  cost_usd: number
  endpoint: string
  cached: boolean
  created_at: string
  latency_ms: number
}

interface DashboardStats {
  totalSpent: number
  totalTokens: number
  totalRequests: number
  costSaved: number
  cachedRequests: number
}

const GuardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
    <path d="M12 2L3 7v5c0 5.5 4.5 10 9 10s9-4.5 9-10V7l-9-5z" />
    <path d="M12 22V12" />
    <path d="M3 12h18" />
  </svg>
);

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('7')
  const [isLoading, setIsLoading] = useState(true)
  const [logs, setLogs] = useState<ApiLog[]>([])
  const [stats, setStats] = useState<DashboardStats>(({
    totalSpent: 0,
    totalTokens: 0,
    totalRequests: 0,
    costSaved: 0,
    cachedRequests: 0
  }))

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      fetchDashboardData()
    } else {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange])

  async function fetchDashboardData() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/logs?days=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
        setStats(data.stats || {
          totalSpent: 0,
          totalTokens: 0,
          totalRequests: 0,
          costSaved: 0,
          cachedRequests: 0
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const modelStats = logs.reduce((acc, log) => {
    acc[log.model] = (acc[log.model] || 0) + log.cost_usd
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#E0E0E0] font-mono">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Header */}
      <header className="border-b-2 border-[#222] sticky top-0 bg-[#0F0F0F] z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-[#FFD700] text-black p-1">
                <GuardIcon />
              </div>
              <span className="font-black tracking-tighter uppercase italic">TokenGuard</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={fetchDashboardData}
                disabled={isLoading}
                className={`p-2 hover:text-[#FFD700] transition ${isLoading ? 'animate-spin' : ''}`}
              >
                <RefreshCw size={18} />
              </button>
              <div className="h-6 w-px bg-[#222]" />
              <Link href="/docs" className="p-2 hover:text-[#FFD700] transition" title="Documentazione & Integrazione">
                <BookOpen size={18} />
              </Link>
              <Link href="/settings" className="p-2 hover:text-[#FFD700] transition" title="Impostazioni">
                <Settings size={18} />
              </Link>
              <div className="h-6 w-px bg-[#222]" />
              <Link href="/" className="p-2 hover:text-[#FFD700] transition" title="Logout">
                <LogOut size={18} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase italic mb-1">Dashboard</h1>
            <p className="text-[#777] font-sans text-sm">Monitora i tuoi costi LLM in tempo reale</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-[#1A1A1A] border-2 border-[#222] text-sm focus:outline-none focus:border-[#FFD700] uppercase text-[10px] font-bold"
            >
              <option value="1">Ultime 24 Ore</option>
              <option value="7">Ultimi 7 Giorni</option>
              <option value="30">Ultimi 30 Giorni</option>
              <option value="90">Ultimi 90 Giorni</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="TOTALE SPESO"
            value={isLoading ? '---' : `$${stats.totalSpent.toFixed(2)}`}
            icon={<Wallet size={20} />}
          />
          <StatCard
            title="TOKEN USATI"
            value={isLoading ? '---' : stats.totalTokens.toLocaleString()}
            icon={<Activity size={20} />}
          />
          <StatCard
            title="RISPARMIATO"
            value={isLoading ? '---' : `$${stats.costSaved.toFixed(2)}`}
            icon={<TrendingDown size={20} />}
            highlight
          />
          <StatCard
            title="CHIAMATE API"
            value={isLoading ? '---' : stats.totalRequests.toLocaleString()}
            subvalue={stats.cachedRequests > 0 ? `${stats.cachedRequests} in cache` : ''}
            icon={<Zap size={20} />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 border-2 border-[#222] bg-[#111] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black uppercase italic text-lg">Costi per Modello</h3>
            </div>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <RefreshCw className="animate-spin text-[#333]" size={32} />
              </div>
            ) : Object.keys(modelStats).length === 0 ? (
              <div className="h-64 flex items-center justify-center text-[#555] text-center">
                <div>
                  <BarChart3 size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Nessun dato disponibile.</p>
                  <p className="text-sm mt-2">Inizia a usare il proxy per vedere le analytics.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(modelStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([model, cost]) => (
                    <div key={model}>
                      <div className="flex justify-between text-sm mb-2 font-bold uppercase">
                        <span>{model}</span>
                        <span className="text-[#FFD700]">${cost.toFixed(4)}</span>
                      </div>
                      <div className="w-full bg-[#222] h-2">
                        <div
                          className="bg-[#FFD700] h-2 transition-all"
                          style={{ width: `${Math.min((cost / (stats.totalSpent || 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Status */}
            <div className="border-2 border-[#222] bg-[#111] p-6">
              <h3 className="font-black uppercase italic mb-4">Stato Sistema</h3>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 animate-pulse" />
                <span className="text-green-500 font-bold uppercase text-sm">Operativo</span>
              </div>
              <p className="text-[#555] text-xs mt-2">Tutti i sistemi funzionano normalmente</p>
            </div>

            {/* Quick Stats */}
            <div className="border-2 border-[#222] bg-[#111] p-6">
              <h3 className="font-black uppercase italic mb-4">Statistiche</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#777]">Cache Hit Rate</span>
                  <span className="font-bold">
                    {stats.totalRequests > 0
                      ? Math.round((stats.cachedRequests / stats.totalRequests) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777]">Costo Medio/Call</span>
                  <span className="font-bold">
                    ${stats.totalRequests > 0
                      ? (stats.totalSpent / stats.totalRequests).toFixed(4)
                      : '0.0000'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777]">Totale Risparmiato</span>
                  <span className="font-bold text-[#FFD700]">${stats.costSaved.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="border-2 border-[#222] bg-[#111] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black uppercase italic text-lg">Chiamate Recenti</h3>
            <span className="text-[10px] font-bold uppercase text-[#777]">
              {logs.length} chiamate nel periodo
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 flex items-center justify-center">
              <RefreshCw className="animate-spin text-[#333]" size={32} />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-[#555]">
              <Activity size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nessuna chiamata API ancora.</p>
              <p className="text-sm mt-2">Inizia a usare il proxy per vedere i dati qui.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#222]">
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-[#777]">Orario</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-[#777]">Modello</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-[#777]">Token</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-[#777]">Costo</th>
                    <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-[#777]">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 10).map((log) => (
                    <tr key={log.id} className="border-b border-[#222] hover:bg-[#1A1A1A] transition">
                      <td className="py-4 px-4 text-sm text-[#777]">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-bold uppercase bg-[#222] px-2 py-1">
                          {log.model}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-[#777]">
                        {log.total_tokens.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-sm font-bold">
                        ${log.cost_usd.toFixed(4)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 ${log.cached
                          ? 'bg-[#FFD700]/20 text-[#FFD700]'
                          : 'bg-green-500/20 text-green-500'
                          }`}>
                          {log.cached ? 'CACHED' : 'OK'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, subvalue, icon, highlight }: {
  title: string
  value: string
  subvalue?: string
  icon: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className={`border-2 p-6 transition ${highlight ? 'border-[#FFD700] bg-[#FFD700]/5' : 'border-[#222] bg-[#111]'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 ${highlight ? 'text-[#FFD700]' : 'text-[#777]'}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black mb-1">{value}</div>
      {subvalue && (
        <div className="text-xs text-[#777] uppercase font-bold">{subvalue}</div>
      )}
      <div className="text-[10px] text-[#777] uppercase font-black mt-2 tracking-widest">{title}</div>
    </div>
  )
}
