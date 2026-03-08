'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Copy,
  Check,
  TrendingDown,
  Wallet,
  BarChart3,
  Zap
} from 'lucide-react';

const GuardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
    <path d="M12 2L3 7v5c0 5.5 4.5 10 9 10s9-4.5 9-10V7l-9-5z" />
    <path d="M12 22V12" />
    <path d="M3 12h18" />
  </svg>
);

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [scanPos, setScanPos] = useState(0);
  const [stats, setStats] = useState({
    totalSaved: 0,
    activeUsers: 0,
    avgReduction: 0,
    totalCalls: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanPos(prev => (prev > 100 ? 0 : prev + 0.5));
    }, 20);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch stats from API endpoint instead of direct Supabase
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const copyCode = () => {
    const code = `const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://your-domain.vercel.app/api/v1/proxy/openai',
  defaultHeaders: {
    'X-TokenGuard-Key': process.env.TOKENGUARD_API_KEY,
  },
});`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#E0E0E0] font-mono selection:bg-[#FFD700] selection:text-black">

      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <nav className="border-b-2 border-[#222] flex items-center justify-between px-6 py-4 sticky top-0 bg-[#0F0F0F] z-50">
        <div className="flex items-center gap-4">
          <div className="bg-[#FFD700] text-black p-1">
            <GuardIcon />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">TokenGuard</span>
        </div>
        <div className="hidden lg:flex gap-10 text-[11px] font-bold tracking-widest uppercase">
          <Link href="#features" className="hover:text-[#FFD700] border-b border-transparent hover:border-[#FFD700] transition-all">Features</Link>
          <Link href="#how-it-works" className="hover:text-[#FFD700] border-b border-transparent hover:border-[#FFD700] transition-all">How_It_Works</Link>
          <Link href="/dashboard" className="hover:text-[#FFD700] border-b border-transparent hover:border-[#FFD700] transition-all">Dashboard</Link>
        </div>
        <Link href="/login" className="border-2 border-[#FFD700] text-[#FFD700] px-4 py-1 flex items-center justify-center text-xs font-bold hover:bg-[#FFD700] hover:text-black transition-all uppercase">
          Accedi
        </Link>
      </nav>

      <main>
        <section className="px-6 pt-24 pb-16 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <div className="inline-block bg-[#1A1A1A] border border-[#333] px-3 py-1 text-[10px] font-bold text-[#888] mb-6 uppercase tracking-widest">
              [ LLM Cost Monitor ]
            </div>
            <h1 className="text-6xl md:text-7xl font-black leading-[0.9] tracking-tighter mb-8 uppercase italic">
              Riduci i costi <br /> <span className="text-[#FFD700]">LLM del 30-50%</span>
            </h1>
            <p className="font-sans text-lg text-[#AAA] max-w-md mb-10 leading-snug">
              TokenGuard si posiziona tra la tua app e OpenAI/Anthropic. Logga ogni chiamata,
              cache le duplicate e ti mostra esattamente dove vai a spendere.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="bg-[#FFD700] text-black font-black px-8 py-4 text-sm uppercase flex items-center gap-3 hover:translate-x-1 hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_0px_rgba(255,215,0,0.2)]">
                Inizia Gratis <ArrowRight size={18} />
              </Link>
              <div className="flex-grow max-w-sm bg-[#1A1A1A] border-2 border-[#222] p-4 relative overflow-hidden group">
                <div className="flex justify-between items-center relative z-10">
                  <code className="text-[#FFD700] text-xs truncate">npm i @tokenguard/core</code>
                  <button onClick={copyCode} className="text-[#444] hover:text-white shrink-0 ml-2">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="absolute top-0 left-0 w-full h-[1px] bg-[#FFD700]/30 transition-all duration-100"
                  style={{ transform: `translateY(${scanPos * 0.4}px)` }} />
              </div>
            </div>
          </div>

          <div className="relative h-[500px] bg-[#111] border-2 border-[#222] flex items-center justify-center overflow-hidden">
            <div className="absolute w-[600px] h-[600px] border border-[#222] rounded-full" />
            <div className="absolute w-[400px] h-[400px] border border-[#222] rounded-full" />
            <div className="absolute w-[200px] h-[200px] border border-[#333] rounded-full" />

            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#FFD700]/5 to-transparent h-20 w-full rotate-45 animate-pulse"
              style={{ top: `${scanPos}%` }} />

            <div className="relative z-10 text-center">
              <div className="text-[120px] font-black text-white/5 absolute -top-20 left-1/2 -translate-x-1/2 select-none">API</div>
              <div className="bg-[#0F0F0F] border-2 border-[#FFD700] p-8 inline-block shadow-[20px_20px_60px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-4 mb-4 text-[#FFD700]">
                  <Wallet size={24} />
                  <span className="text-xs font-bold tracking-[0.3em] uppercase">Cost_Monitor</span>
                </div>
                <div className="space-y-2 text-left font-mono text-[10px]">
                  <div className="text-green-500">POST /v1/chat/completions - $0.0024</div>
                  <div className="text-green-500">POST /v1/chat/completions - $0.0012</div>
                  <div className="text-[#FFD700] animate-pulse font-bold">CACHED /v1/chat/completions - $0.00 [SAVED]</div>
                  <div className="text-[#555]">GET /v1/models - $0.00 [FROM_CACHE]</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-y-2 border-[#222] bg-[#111]">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#222]">
            {[
              {
                title: "SMART_CACHING",
                desc: "Identifica prompt identici e restituisci risposte cache. Risparmia fino al 40% su chiamate duplicate.",
                tag: "01",
                icon: <TrendingDown />
              },
              {
                title: "COST_TRACKING",
                desc: "Monitora costi real-time per modello e endpoint. Analytics granulari su ogni singola chiamata API.",
                tag: "02",
                icon: <BarChart3 />
              },
              {
                title: "ZERO_CONFIG",
                desc: "Una sola riga di codice. Cambia solo l'URL base. Nessuna modifica alla logica esistente.",
                tag: "03",
                icon: <Zap />
              }
            ].map((f, i) => (
              <div key={i} className="p-12 hover:bg-[#151515] transition-colors group">
                <div className="flex justify-between items-start mb-8">
                  <div className="text-[#FFD700] bg-[#FFD700]/10 p-3">
                    {f.icon}
                  </div>
                  <span className="text-[#333] font-black text-4xl group-hover:text-[#FFD700]/20 transition-colors tracking-tighter">{f.tag}</span>
                </div>
                <h3 className="text-xl font-black mb-4 italic uppercase">{f.title}</h3>
                <p className="font-sans text-[#777] leading-relaxed text-sm">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="px-6 py-24 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black uppercase italic mb-4">Come Funziona</h2>
            <p className="text-[#777] font-sans">Tre semplici passaggi per ridurre i costi</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "PROXY", desc: "Cambia l'URL base del tuo SDK OpenAI per puntare a TokenGuard" },
              { step: "02", title: "LOG & CACHE", desc: "Ogni richiesta viene loggata con costo. Le duplicate vanno in cache automaticamente" },
              { step: "03", title: "SAVE", desc: "Vedi analytics real-time e risparmia su ogni chiamata duplicata" }
            ].map((item, i) => (
              <div key={i} className="border-2 border-[#222] p-8 hover:border-[#FFD700]/50 transition-colors">
                <div className="text-[#FFD700] font-black text-5xl mb-4">{item.step}</div>
                <h3 className="text-xl font-black uppercase italic mb-3">{item.title}</h3>
                <p className="text-[#777] font-sans text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#FFD700] py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-8">
            {loading ? (
              <>
                <div className="text-black">
                  <div className="text-[10px] font-black uppercase tracking-widest mb-1">Loading...</div>
                  <div className="text-5xl font-black tracking-tighter italic leading-none">---</div>
                </div>
              </>
            ) : (
              <>
                <div className="text-black">
                  <div className="text-[10px] font-black uppercase tracking-widest mb-1">Risparmio_Totale</div>
                  <div className="text-5xl font-black tracking-tighter italic leading-none">${stats.totalSaved.toFixed(2)}</div>
                </div>
                <div className="text-black">
                  <div className="text-[10px] font-black uppercase tracking-widest mb-1">Utenti_Attivi</div>
                  <div className="text-5xl font-black tracking-tighter italic leading-none">{stats.activeUsers}</div>
                </div>
                <div className="text-black">
                  <div className="text-[10px] font-black uppercase tracking-widest mb-1">Riduzione_Media</div>
                  <div className="text-5xl font-black tracking-tighter italic leading-none">{stats.avgReduction}%</div>
                </div>
                <div className="text-black">
                  <div className="text-[10px] font-black uppercase tracking-widest mb-1">Chiamate_Loggate</div>
                  <div className="text-5xl font-black tracking-tighter italic leading-none">{stats.totalCalls.toLocaleString()}</div>
                </div>
              </>
            )}
          </div>
        </section>

        <footer className="px-6 py-20 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 border-t-2 border-[#222] pt-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6 text-[#FFD700]">
                <GuardIcon />
                <span className="text-xl font-black italic uppercase tracking-tighter">TokenGuard</span>
              </div>
              <p className="text-[#555] text-xs font-sans max-w-sm mb-6">
                Monitora e riduci i costi delle tue API LLM.
                Caching intelligente, analytics real-time, zero configurazione.
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[#1A1A1A] border border-[#333] hover:border-[#FFD700] cursor-pointer" />
                <div className="w-8 h-8 bg-[#1A1A1A] border border-[#333] hover:border-[#FFD700] cursor-pointer" />
                <div className="w-8 h-8 bg-[#1A1A1A] border border-[#333] hover:border-[#FFD700] cursor-pointer" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-[#FFD700] tracking-widest">[ Risorse ]</h4>
              <ul className="text-[#777] text-xs space-y-2 uppercase font-bold">
                <li><Link href="#" className="hover:text-white transition-colors">Documentazione</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API_Reference</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Integrazione</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-[#FFD700] tracking-widest">[ Stato ]</h4>
              <div className="flex items-center gap-2 text-xs text-green-500 font-bold">
                <div className="w-2 h-2 bg-green-500 animate-pulse rounded-full" />
                OPERATIVO
              </div>
              <div className="text-[#333] text-[9px] font-mono leading-tight">
                VERSIONE: TG_V1.0<br />
                SUPABASE: CONNESSO
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
