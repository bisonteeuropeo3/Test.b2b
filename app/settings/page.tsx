'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Key, Copy, Check, RefreshCw, Trash2,
    Shield, AlertTriangle, Plus, Eye, EyeOff
} from 'lucide-react'

const GuardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M12 2L3 7v5c0 5.5 4.5 10 9 10s9-4.5 9-10V7l-9-5z" />
        <path d="M12 22V12" />
        <path d="M3 12h18" />
    </svg>
);

interface ApiKeyEntry {
    id: string
    key: string
    label: string
    created: string
    lastUsed: string | null
    isActive: boolean
}

export default function SettingsPage() {
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
    const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [newKeyLabel, setNewKeyLabel] = useState('')
    const [showNewKeyForm, setShowNewKeyForm] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const showNotification = useCallback((type: 'success' | 'error', message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 4000)
    }, [])

    // Load keys on mount
    useEffect(() => {
        loadApiKeys()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function loadApiKeys() {
        setIsLoading(true)
        try {
            const response = await fetch('/api/settings/keys')
            if (response.ok) {
                const data = await response.json()
                setApiKeys(data.keys || [])
            } else {
                // If endpoint doesn't exist yet or errors, load from localStorage as fallback
                loadFromLocalStorage()
            }
        } catch {
            loadFromLocalStorage()
        } finally {
            setIsLoading(false)
        }
    }

    function loadFromLocalStorage() {
        if (typeof window === 'undefined') return
        const stored = localStorage.getItem('tg_api_keys')
        if (stored) {
            try {
                setApiKeys(JSON.parse(stored))
            } catch {
                setApiKeys([])
            }
        } else {
            // Generate initial key
            const initialKey = generateLocalKey()
            const initial: ApiKeyEntry = {
                id: crypto.randomUUID(),
                key: initialKey,
                label: 'Chiave Principale',
                created: new Date().toISOString(),
                lastUsed: null,
                isActive: true
            }
            setApiKeys([initial])
            localStorage.setItem('tg_api_keys', JSON.stringify([initial]))
            localStorage.setItem('tg_api_key', initialKey)
        }
    }

    function saveToLocalStorage(keys: ApiKeyEntry[]) {
        if (typeof window === 'undefined') return
        localStorage.setItem('tg_api_keys', JSON.stringify(keys))
        // Keep the first active key as the primary one
        const primary = keys.find(k => k.isActive)
        if (primary) {
            localStorage.setItem('tg_api_key', primary.key)
        }
    }

    function generateLocalKey(): string {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
        let result = 'tg_live_'
        for (let i = 0; i < 48; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
    }

    async function generateNewKey() {
        if (!newKeyLabel.trim()) return
        setIsGenerating(true)

        try {
            // Try server-side generation first
            const response = await fetch('/api/settings/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ label: newKeyLabel.trim() })
            })

            if (response.ok) {
                const data = await response.json()
                const newEntry: ApiKeyEntry = {
                    id: data.id || crypto.randomUUID(),
                    key: data.apiKey,
                    label: newKeyLabel.trim(),
                    created: new Date().toISOString(),
                    lastUsed: null,
                    isActive: true
                }
                const updated = [...apiKeys, newEntry]
                setApiKeys(updated)
                saveToLocalStorage(updated)
                showNotification('success', `Chiave "${newKeyLabel.trim()}" generata con successo`)
            } else {
                // Fallback to local generation
                generateKeyLocally()
            }
        } catch {
            generateKeyLocally()
        } finally {
            setIsGenerating(false)
            setNewKeyLabel('')
            setShowNewKeyForm(false)
        }
    }

    function generateKeyLocally() {
        const newKey = generateLocalKey()
        const newEntry: ApiKeyEntry = {
            id: crypto.randomUUID(),
            key: newKey,
            label: newKeyLabel.trim() || `Chiave ${apiKeys.length + 1}`,
            created: new Date().toISOString(),
            lastUsed: null,
            isActive: true
        }
        const updated = [...apiKeys, newEntry]
        setApiKeys(updated)
        saveToLocalStorage(updated)
        showNotification('success', `Chiave "${newEntry.label}" generata con successo`)
    }

    async function revokeKey(id: string) {
        const keyToRevoke = apiKeys.find(k => k.id === id)
        if (!keyToRevoke) return

        try {
            await fetch('/api/settings/keys', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, key: keyToRevoke.key })
            })
        } catch {
            // Continue with local revocation even if server fails
        }

        const updated = apiKeys.filter(k => k.id !== id)
        setApiKeys(updated)
        saveToLocalStorage(updated)
        setDeleteConfirm(null)
        showNotification('success', `Chiave "${keyToRevoke.label}" revocata`)
    }

    function toggleKeyVisibility(id: string) {
        setVisibleKeys(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    function copyKey(key: string, id: string) {
        navigator.clipboard.writeText(key)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    function maskKey(key: string): string {
        if (key.length <= 16) return '•'.repeat(key.length)
        return key.slice(0, 8) + '•'.repeat(key.length - 16) + key.slice(-8)
    }

    function formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-[#E0E0E0] font-mono">
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-[100] px-6 py-4 border-2 font-bold text-sm uppercase tracking-widest animate-in slide-in-from-top-2 ${notification.type === 'success'
                        ? 'bg-green-500/10 border-green-500 text-green-400'
                        : 'bg-red-500/10 border-red-500 text-red-400'
                    }`}>
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <header className="border-b-2 border-[#222] sticky top-0 bg-[#0F0F0F] z-50">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#FFD700] text-black p-1">
                                <GuardIcon />
                            </div>
                            <span className="font-black tracking-tighter uppercase italic">TokenGuard</span>
                            <span className="text-[10px] font-bold text-[#777] uppercase bg-[#1A1A1A] border border-[#333] px-2 py-0.5 tracking-widest">Impostazioni</span>
                        </div>
                        <Link href="/dashboard" className="flex items-center gap-2 text-sm hover:text-[#FFD700] transition font-bold uppercase">
                            <ArrowLeft size={16} /> Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black uppercase italic mb-2">Impostazioni</h1>
                    <p className="text-[#777] font-sans">Gestisci le chiavi API e la sicurezza del tuo account</p>
                </div>

                {/* API Keys Section */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Key size={20} className="text-[#FFD700]" />
                            <h2 className="text-xl font-black uppercase italic">Chiavi API</h2>
                        </div>
                        <button
                            onClick={() => setShowNewKeyForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#FFD700] text-black font-black text-xs uppercase tracking-widest hover:bg-white transition-colors"
                        >
                            <Plus size={14} /> Nuova Chiave
                        </button>
                    </div>

                    {/* Security notice */}
                    <div className="bg-amber-500/10 border-2 border-amber-500/20 p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <Shield size={18} className="text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-amber-400 text-sm font-sans">
                                    <strong className="font-bold uppercase">Sicurezza:</strong> Le chiavi API danno accesso al tuo account proxy.
                                    Non condividerle mai pubblicamente e usa variabili d&apos;ambiente.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* New Key Form */}
                    {showNewKeyForm && (
                        <div className="border-2 border-[#FFD700]/30 bg-[#111] p-6 mb-6">
                            <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2">
                                <Plus size={16} className="text-[#FFD700]" /> Genera Nuova Chiave
                            </h3>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newKeyLabel}
                                    onChange={(e) => setNewKeyLabel(e.target.value)}
                                    placeholder="Nome chiave (es. Produzione, Staging, Test...)"
                                    className="flex-1 px-4 py-3 bg-[#0F0F0F] border-2 border-[#222] text-white focus:outline-none focus:border-[#FFD700] transition font-mono text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newKeyLabel.trim()) generateNewKey()
                                    }}
                                    autoFocus
                                />
                                <button
                                    onClick={generateNewKey}
                                    disabled={isGenerating || !newKeyLabel.trim()}
                                    className="px-6 py-3 bg-[#FFD700] text-black font-black text-xs uppercase tracking-widest hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Key size={14} />}
                                    Genera
                                </button>
                                <button
                                    onClick={() => { setShowNewKeyForm(false); setNewKeyLabel('') }}
                                    className="px-4 py-3 border-2 border-[#222] hover:bg-[#222] transition font-black text-xs uppercase"
                                >
                                    Annulla
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Keys List */}
                    {isLoading ? (
                        <div className="border-2 border-[#222] bg-[#111] p-12 flex items-center justify-center">
                            <RefreshCw className="animate-spin text-[#333]" size={32} />
                        </div>
                    ) : apiKeys.length === 0 ? (
                        <div className="border-2 border-[#222] bg-[#111] p-12 text-center">
                            <Key size={48} className="mx-auto mb-4 text-[#333]" />
                            <p className="text-[#555] mb-4">Nessuna chiave API generata</p>
                            <button
                                onClick={() => setShowNewKeyForm(true)}
                                className="px-6 py-3 bg-[#FFD700] text-black font-black text-xs uppercase tracking-widest hover:bg-white transition"
                            >
                                Genera la tua prima chiave
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {apiKeys.map((entry) => (
                                <div
                                    key={entry.id}
                                    className={`border-2 bg-[#111] p-5 transition-colors ${entry.isActive ? 'border-[#222] hover:border-[#333]' : 'border-red-500/20 opacity-60'
                                        }`}
                                >
                                    {/* Key Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${entry.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                            <span className="font-black uppercase text-sm">{entry.label}</span>
                                            {!entry.isActive && (
                                                <span className="text-[10px] font-bold uppercase text-red-400 bg-red-500/10 px-2 py-0.5">Revocata</span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-[#555] font-bold uppercase tracking-widest">
                                            {formatDate(entry.created)}
                                        </span>
                                    </div>

                                    {/* Key Display */}
                                    <div className="bg-[#0F0F0F] border border-[#222] p-1 flex items-center mb-3">
                                        <div className="flex-1 px-4 py-2 overflow-x-auto">
                                            <code className="text-[#FFD700] text-sm font-mono break-all">
                                                {visibleKeys.has(entry.id) ? entry.key : maskKey(entry.key)}
                                            </code>
                                        </div>
                                        <div className="flex shrink-0">
                                            <button
                                                onClick={() => toggleKeyVisibility(entry.id)}
                                                className="px-3 py-2 hover:bg-[#222] transition text-[#555] hover:text-white"
                                                title={visibleKeys.has(entry.id) ? 'Nascondi' : 'Mostra'}
                                            >
                                                {visibleKeys.has(entry.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                            <button
                                                onClick={() => copyKey(entry.key, entry.id)}
                                                className="px-3 py-2 hover:bg-[#222] transition text-[#555] hover:text-white"
                                                title="Copia"
                                            >
                                                {copiedId === entry.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Key Actions */}
                                    <div className="flex items-center justify-between">
                                        <div className="text-[10px] text-[#555] font-bold uppercase tracking-widest">
                                            {entry.lastUsed
                                                ? `Ultimo uso: ${formatDate(entry.lastUsed)}`
                                                : 'Mai utilizzata'}
                                        </div>

                                        {entry.isActive && (
                                            <>
                                                {deleteConfirm === entry.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-red-400 font-bold uppercase">Confermi?</span>
                                                        <button
                                                            onClick={() => revokeKey(entry.id)}
                                                            className="px-3 py-1 bg-red-500 text-white font-black text-[10px] uppercase hover:bg-red-600 transition"
                                                        >
                                                            Revoca
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="px-3 py-1 border border-[#333] text-[#777] font-black text-[10px] uppercase hover:bg-[#222] transition"
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirm(entry.id)}
                                                        className="flex items-center gap-1 px-3 py-1 text-[#555] hover:text-red-400 transition text-[10px] font-bold uppercase tracking-widest"
                                                    >
                                                        <Trash2 size={12} /> Revoca
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Account Info */}
                <section className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield size={20} className="text-[#FFD700]" />
                        <h2 className="text-xl font-black uppercase italic">Sicurezza Account</h2>
                    </div>

                    <div className="border-2 border-[#222] bg-[#111] p-6 space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-[#222]">
                            <div>
                                <div className="font-black uppercase text-sm">Proxy URL</div>
                                <div className="text-[#777] text-xs font-sans mt-1">L&apos;URL da usare come baseURL nel tuo SDK</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="text-[#FFD700] text-xs bg-[#0F0F0F] px-3 py-1 border border-[#222]">
                                    {typeof window !== 'undefined' ? `${window.location.origin}/api/v1/proxy/openai` : '/api/v1/proxy/openai'}
                                </code>
                                <button
                                    onClick={() => {
                                        const url = `${window.location.origin}/api/v1/proxy/openai`
                                        navigator.clipboard.writeText(url)
                                        showNotification('success', 'URL copiato')
                                    }}
                                    className="p-2 hover:bg-[#222] transition text-[#555] hover:text-white"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-[#222]">
                            <div>
                                <div className="font-black uppercase text-sm">Health Check</div>
                                <div className="text-[#777] text-xs font-sans mt-1">Verifica che il servizio sia operativo</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 animate-pulse rounded-full" />
                                <span className="text-green-500 text-xs font-bold uppercase">Operativo</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-[#222]">
                            <div>
                                <div className="font-black uppercase text-sm">Chiavi Attive</div>
                                <div className="text-[#777] text-xs font-sans mt-1">Numero di chiavi API attualmente attive</div>
                            </div>
                            <span className="text-[#FFD700] font-black text-lg">{apiKeys.filter(k => k.isActive).length}</span>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div>
                                <div className="font-black uppercase text-sm">Documentazione</div>
                                <div className="text-[#777] text-xs font-sans mt-1">Guide di integrazione e riferimento API</div>
                            </div>
                            <Link
                                href="/docs"
                                className="px-4 py-2 border-2 border-[#222] hover:border-[#FFD700] text-xs font-black uppercase tracking-widest transition-colors hover:text-[#FFD700]"
                            >
                                Vai ai Docs
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <AlertTriangle size={20} className="text-red-500" />
                        <h2 className="text-xl font-black uppercase italic text-red-500">Zona Pericolosa</h2>
                    </div>

                    <div className="border-2 border-red-500/20 bg-[#111] p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-black uppercase text-sm">Revoca Tutte le Chiavi</div>
                                <div className="text-[#777] text-xs font-sans mt-1">Disattiva immediatamente tutte le chiavi API. Questa azione è irreversibile.</div>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm('Sei sicuro? Tutte le chiavi API saranno revocate immediatamente.')) {
                                        setApiKeys([])
                                        saveToLocalStorage([])
                                        showNotification('success', 'Tutte le chiavi sono state revocate')
                                    }
                                }}
                                className="px-4 py-2 border-2 border-red-500 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-black transition-colors shrink-0"
                            >
                                Revoca Tutto
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
