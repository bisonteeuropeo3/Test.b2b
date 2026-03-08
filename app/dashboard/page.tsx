'use client'

import { useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Activity,
  Zap,
  ChevronDown,
  Filter,
  Download,
  RefreshCw,
  Terminal
} from 'lucide-react'
import Link from 'next/link'

const GuardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
    <path d="M12 2L3 7v5c0 5.5 4.5 10 9 10s9-4.5 9-10V7l-9-5z" />
    <path d="M12 22V12" />
    <path d="M3 12h18" />
  </svg>
);

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(false)

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#E0E0E0] font-mono selection:bg-[#FFD700] selection:text-black">

      {/* Griglia di sfondo */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Header */}
      <nav className="border-b-2 border-[#222] flex items-center justify-between px-6 py-4 sticky top-0 bg-[#0F0F0F] z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="bg-[#FFD700] text-black p-1">
              <GuardIcon />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">TokenGuard</span>
            <span className="text-[#888] text-[10px] font-bold tracking-widest uppercase ml-2 bg-[#1A1A1A] border border-[#333] px-2 py-0.5">
              [ Console ]
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={refreshData}
            className={`text-[#FFD700] hover:text-white transition-colors ${isLoading ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={18} />
          </button>
          <div className="h-6 w-[2px] bg-[#222]" />
          <button className="flex items-center gap-2 px-3 py-1 bg-[#1A1A1A] border border-[#333] hover:border-[#FFD700] transition-colors">
            <div className="w-6 h-6 bg-[#FFD700]" />
            <span className="text-xs font-bold uppercase">Admin</span>
            <ChevronDown size={14} className="text-[#888]" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Page Header */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-8 pb-4 border-b-2 border-[#222]">
          <div>
            <h1 className="text-4xl font-black mb-1 uppercase italic tracking-tighter text-white">Telemetria_Globale</h1>
            <p className="text-[#888] font-sans text-sm">Monitoraggio in tempo reale del consumo LLM</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-[#111] border-2 border-[#222] text-xs font-bold uppercase focus:outline-none focus:border-[#FFD700] text-[#E0E0E0] appearance-none"
            >
              <option value="24h">Ultimi_24H</option>
              <option value="7d">Ultimi_7_GIORNI</option>
              <option value="30d">Ultimi_30_GIORNI</option>
              <option value="90d">Ultimi_90_GIORNI</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#111] border-2 border-[#222] hover:border-[#FFD700] transition-colors text-xs font-bold uppercase text-[#E0E0E0]">
              <Filter size={14} />
              Filtra
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#FFD700] text-black border-2 border-[#FFD700] hover:bg-transparent hover:text-[#FFD700] transition-colors text-xs font-bold uppercase">
              <Download size={14} />
              Esporta_Log
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Spesa_Totale"
            value="$1,247.50"
            change="+12%"
            changeType="negative"
            icon={<DollarSign size={20} />}
          />
          <StatCard
            title="Token_Processati"
            value="2.4M"
            change="+8%"
            changeType="neutral"
            icon={<Activity size={20} />}
          />
          <StatCard
            title="Risparmio_Generato"
            value="$312.00"
            change="+23%"
            changeType="positive"
            icon={<TrendingUp size={20} />}
          />
          <StatCard
            title="Richieste_Intercettate"
            value="15,234"
            change="-5%"
            changeType="positive"
            icon={<Zap size={20} />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-[#111] border-2 border-[#222] p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8 border-b-2 border-[#222] pb-4">
              <h3 className="font-black text-xl uppercase italic tracking-tighter">Traffico_API</h3>
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#888]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#FFD700]" />
                  <span>Effettivo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#333]" />
                  <span>Proiettato</span>
                </div>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-1 md:gap-3">
              {[65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50, 80].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 relative group/bar">
                  <div className="w-full flex gap-1 items-end relative z-10">
                    <div
                      className="flex-1 bg-[#FFD700] transition-all duration-300 hover:opacity-80 border border-[#FFD700]/50"
                      style={{ height: `${height}%` }}
                    />
                    <div
                      className="flex-1 bg-[#333] transition-all duration-300"
                      style={{ height: `${height * 0.7}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#555] font-bold">
                    {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'][i]}
                  </span>

                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover/bar:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#0F0F0F] border-2 border-[#FFD700] p-2 text-[10px] pointer-events-none transition-opacity z-20 whitespace-nowrap shadow-[4px_4px_0px_0px_rgba(255,215,0,0.2)]">
                    EFFET: {height * 12}K<br />
                    PROIE: {Math.floor(height * 0.7 * 12)}K
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Alerts */}
            <div className="bg-[#111] border-2 border-[#222] p-6 relative">
              <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-[#222]">
                <h3 className="font-black uppercase italic tracking-tighter flex items-center gap-2">
                  <AlertCircle size={16} className="text-[#FFD700]" />
                  Log_Eventi
                </h3>
                <span className="text-[10px] font-bold bg-[#FFD700] text-black px-2 py-0.5 uppercase">3 Nuovi</span>
              </div>
              <div className="space-y-3">
                <AlertItem
                  type="warning"
                  title="Soglia_Budget"
                  message="Raggiunto l'80% del budget allocato"
                  time="-02:00:00"
                />
                <AlertItem
                  type="info"
                  title="Duplicati_Rilevati"
                  message="23 richieste neutralizzate"
                  time="-05:00:00"
                />
                <AlertItem
                  type="success"
                  title="Risparmio_Generato"
                  message="$45 conservati via cache"
                  time="-24:00:00"
                />
              </div>
            </div>

            {/* Top Models */}
            <div className="bg-[#111] border-2 border-[#222] p-6">
              <h3 className="font-black uppercase italic tracking-tighter mb-6 pb-2 border-b-2 border-[#222] flex items-center gap-2">
                <Terminal size={16} className="text-[#FFD700]" />
                Carico_Modelli
              </h3>
              <div className="space-y-4">
                <ModelRow name="GPT-4_TURBO" cost="$892" percent={75} />
                <ModelRow name="GPT-3.5_TURBO" cost="$245" percent={20} />
                <ModelRow name="CLAUDE_3_OPUS" cost="$110" percent={5} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#111] border-2 border-[#222] p-6 relative">
          {/* Scanner highlight line */}
          <div className="absolute top-0 left-0 w-[2px] h-full bg-[#FFD700] shadow-[0_0_15px_#FFD700]" />

          <div className="flex flex-wrap gap-4 items-center justify-between mb-8 border-b-2 border-[#222] pb-4 pl-4">
            <h3 className="font-black text-xl uppercase italic tracking-tighter flex items-center gap-2">
              {`< النشاط >`} Stream_Richieste
            </h3>
            <Link href="#" className="text-xs font-bold uppercase tracking-widest text-[#FFD700] hover:text-white transition-colors border-b border-transparent hover:border-white">
              Vedi_Analisi_Completa
            </Link>
          </div>

          <div className="overflow-x-auto pl-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#333]">
                  <th className="py-3 px-4 text-[10px] font-black tracking-widest uppercase text-[#888]">Timestamp</th>
                  <th className="py-3 px-4 text-[10px] font-black tracking-widest uppercase text-[#888]">Modello_Target</th>
                  <th className="py-3 px-4 text-[10px] font-black tracking-widest uppercase text-[#888]">Payload_Tkn</th>
                  <th className="py-3 px-4 text-[10px] font-black tracking-widest uppercase text-[#888]">Costo_Est.</th>
                  <th className="py-3 px-4 text-[10px] font-black tracking-widest uppercase text-[#888]">Stato_Route</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <TableRow
                  time="T-00:02"
                  model="gpt-4-turbo"
                  tokens="1,245"
                  cost="$0.037"
                  status="success"
                />
                <TableRow
                  time="T-00:05"
                  model="gpt-3.5-turbo"
                  tokens="892"
                  cost="$0.001"
                  status="success"
                />
                <TableRow
                  time="T-00:12"
                  model="gpt-4-turbo"
                  tokens="2,104"
                  cost="$0.063"
                  status="cached"
                />
                <TableRow
                  time="T-00:15"
                  model="claude-3-opus"
                  tokens="567"
                  cost="$0.008"
                  status="success"
                />
                <TableRow
                  time="T-00:18"
                  model="gpt-3.5-turbo"
                  tokens="1,432"
                  cost="$0.002"
                  status="error"
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
    positive: 'text-[#00FF41]', // Cyber green
    negative: 'text-[#FF3333]', // Alert red
    neutral: 'text-[#888]'
  }

  const changeSymbols = {
    positive: '▲',
    negative: '▼',
    neutral: '■'
  }

  return (
    <div className="bg-[#111] border-2 border-[#222] p-6 hover:border-[#FFD700] transition-colors group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-8 h-8 bg-[#222] -rotate-45 translate-x-4 -translate-y-4 group-hover:bg-[#FFD700] transition-colors" />

      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="bg-[#1A1A1A] p-2 border border-[#333] text-[#FFD700] group-hover:bg-[#FFD700] group-hover:text-black transition-colors">
          {icon}
        </div>
        <div className={`text-[10px] font-bold flex items-center gap-1 bg-[#1A1A1A] px-2 py-1 border border-[#333] ${changeColors[changeType]}`}>
          {changeSymbols[changeType]} {change}
        </div>
      </div>
      <div className="text-3xl font-black mb-1 italic tracking-tighter text-white">{value}</div>
      <div className="text-[10px] uppercase font-bold tracking-widest text-[#888]">{title}</div>
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
    warning: 'border-[#FF3333] text-[#FF3333]',
    info: 'border-[#3399FF] text-[#3399FF]',
    success: 'border-[#00FF41] text-[#00FF41]'
  }

  return (
    <div className={`p-3 bg-[#1A1A1A] border-l-4 ${colors[type]} group hover:bg-[#222] transition-colors cursor-pointer`}>
      <div className="flex justify-between items-start mb-1 gap-2">
        <p className="font-bold text-[10px] uppercase tracking-wider">{title}</p>
        <span className="text-[9px] font-mono text-[#555] whitespace-nowrap">{time}</span>
      </div>
      <p className="text-xs text-[#AAA] font-sans">{message}</p>
    </div>
  )
}

function ModelRow({ name, cost, percent }: {
  name: string
  cost: string
  percent: number
}) {
  return (
    <div className="group">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
        <span className="text-[#E0E0E0] group-hover:text-[#FFD700] transition-colors">{name}</span>
        <span className="text-[#888]">{cost}</span>
      </div>
      <div className="w-full h-1 bg-[#222]">
        <div
          className="bg-[#FFD700] h-full group-hover:bg-white transition-colors"
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
  const statusStyles = {
    success: 'text-[#00FF41] before:bg-[#00FF41]',
    cached: 'text-[#FFD700] before:bg-[#FFD700]',
    error: 'text-[#FF3333] before:bg-[#FF3333]'
  }

  const statusLabels = {
    success: 'OK_200',
    cached: 'CACHE_HIT',
    error: 'ERR_500'
  }

  return (
    <tr className="border-b border-[#222] hover:bg-[#1A1A1A] transition-colors group">
      <td className="py-4 px-4 text-[#888]">{time}</td>
      <td className="py-4 px-4 text-white group-hover:text-[#FFD700] transition-colors">
        {model}
      </td>
      <td className="py-4 px-4 text-[#888]">{tokens}</td>
      <td className="py-4 px-4 text-[#E0E0E0]">{cost}</td>
      <td className="py-4 px-4">
        <span className={`relative pl-3 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 text-[10px] font-bold tracking-widest ${statusStyles[status]}`}>
          {statusLabels[status]}
        </span>
      </td>
    </tr>
  )
}
