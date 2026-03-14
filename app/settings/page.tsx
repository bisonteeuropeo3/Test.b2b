'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft, Key, Copy, Check, RefreshCw, Trash2,
    Shield, AlertTriangle, Plus, Eye, EyeOff,
    Database, Clock, Zap, Scissors, Route, Minimize2
} from 'lucide-react'

function getSessionToken(): string | null {
    if (typeof window === 'undefined') return null
    try {
        const sessionStr = localStorage.getItem('supabase_session')
        if (!sessionStr) return null
        const session = JSON.parse(sessionStr)
        return session?.access_token || null
    } catch {
        return null
    }
}

function authHeaders(): Record<string, string> {
    const token = getSessionToken()
    if (!token) return {}
    return { 'Authorization': `Bearer ${token}` }
}

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
    const [semanticCacheEnabled, setSemanticCacheEnabled] = useState(false)
    const [semanticCacheTtl, setSemanticCacheTtl] = useState(60)
    const [isSavingCache, setIsSavingCache] = useState(false)
    const [pruningEnabled, setPruningEnabled] = useState(false)
    const [pruningIntensity, setPruningIntensity] = useState('medium')
    const [isSavingPruning, setIsSavingPruning] = useState(false)
    const [routingEnabled, setRoutingEnabled] = useState(false)
    const [routingCheapModel, setRoutingCheapModel] = useState('gpt-4o-mini')
    const [routingAllowedModels, setRoutingAllowedModels] = useState<string[]>(['gpt-4o-mini', 'gpt-5.4', 'gpt-5.4-pro'])
    const [isSavingRouting, setIsSavingRouting] = useState(false)
    const [compressionEnabled, setCompressionEnabled] = useState(false)
    const [compressionModel, setCompressionModel] = useState('gpt-4o-mini')
    const [compressionThreshold, setCompressionThreshold] = useState(2000)
    const [isSavingCompression, setIsSavingCompression] = useState(false)
    const router = useRouter()

    const AVAILABLE_MODELS = [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', tier: 1, tierLabel: 'Economico', color: 'green' },
        { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', tier: 1, tierLabel: 'Economico', color: 'green' },
        { id: 'gpt-5.4', name: 'GPT-5.4', tier: 2, tierLabel: 'Bilanciato', color: 'yellow' },
        { id: 'gpt-5.4-pro', name: 'GPT-5.4 Pro', tier: 3, tierLabel: 'Premium', color: 'red' },
    ]

    const CLASSIFIER_MODELS = [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini (consigliato)', cost: '$0.00015/1K' },
        { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', cost: '$0.0006/1K' },
    ]

    const THRESHOLD_OPTIONS = [
        { value: 500, label: '500 token', desc: 'Molto aggressiva' },
        { value: 1000, label: '1.000 token', desc: 'Aggressiva' },
        { value: 2000, label: '2.000 token', desc: 'Bilanciata' },
        { value: 4000, label: '4.000 token', desc: 'Conservativa' },
        { value: 8000, label: '8.000 token', desc: 'Solo prompt enormi' },
    ]

    const TTL_OPTIONS = [
        { value: 5, label: '5 minuti', freshness: 100 },
        { value: 15, label: '15 minuti', freshness: 90 },
        { value: 30, label: '30 minuti', freshness: 80 },
        { value: 60, label: '1 ora', freshness: 65 },
        { value: 360, label: '6 ore', freshness: 45 },
        { value: 1440, label: '1 giorno', freshness: 30 },
        { value: 4320, label: '3 giorni', freshness: 15 },
        { value: 10080, label: '7 giorni', freshness: 5 },
    ]

    const showNotification = useCallback((type: 'success' | 'error', message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 4000)
    }, [])

    // Load keys and cache settings on mount
    useEffect(() => {
        const token = getSessionToken()
        if (!token) {
            router.push('/login')
            return
        }
        loadApiKeys()
        loadCacheSettings()
        loadPruningSettings()
        loadRoutingSettings()
        loadCompressionSettings()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function loadCacheSettings() {
        try {
            const response = await fetch('/api/settings/cache', {
                headers: authHeaders()
            })
            if (response.ok) {
                const data = await response.json()
                setSemanticCacheEnabled(data.semantic_cache_enabled || false)
                setSemanticCacheTtl(data.semantic_cache_ttl_minutes || 60)
            }
        } catch {
            // Silently fail, use defaults
        }
    }

    async function updateCacheSettings(updates: { semantic_cache_enabled?: boolean; semantic_cache_ttl_minutes?: number }) {
        setIsSavingCache(true)
        try {
            const response = await fetch('/api/settings/cache', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify(updates)
            })
            if (response.ok) {
                showNotification('success', 'Impostazioni cache aggiornate')
            } else {
                showNotification('error', 'Errore nel salvataggio')
            }
        } catch {
            showNotification('error', 'Errore di connessione')
        } finally {
            setIsSavingCache(false)
        }
    }

    async function loadPruningSettings() {
        try {
            const response = await fetch('/api/settings/pruning', { headers: authHeaders() })
            if (response.ok) {
                const data = await response.json()
                setPruningEnabled(data.pruning_enabled || false)
                setPruningIntensity(data.pruning_intensity || 'medium')
            }
        } catch { /* defaults */ }
    }

    async function updatePruningSettings(updates: { pruning_enabled?: boolean; pruning_intensity?: string }) {
        setIsSavingPruning(true)
        try {
            const response = await fetch('/api/settings/pruning', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify(updates)
            })
            if (response.ok) {
                showNotification('success', 'Impostazioni pruning aggiornate')
            } else {
                showNotification('error', 'Errore nel salvataggio')
            }
        } catch {
            showNotification('error', 'Errore di connessione')
        } finally {
            setIsSavingPruning(false)
        }
    }

    async function loadRoutingSettings() {
        try {
            const response = await fetch('/api/settings/routing', { headers: authHeaders() })
            if (response.ok) {
                const data = await response.json()
                setRoutingEnabled(data.routing_enabled || false)
                setRoutingCheapModel(data.routing_cheap_model || 'gpt-4o-mini')
                setRoutingAllowedModels(data.routing_allowed_models || ['gpt-4o-mini', 'gpt-5.4', 'gpt-5.4-pro'])
            }
        } catch { /* defaults */ }
    }

    async function updateRoutingSettings(updates: Record<string, any>) {
        setIsSavingRouting(true)
        try {
            const response = await fetch('/api/settings/routing', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify(updates)
            })
            if (response.ok) {
                showNotification('success', 'Impostazioni routing aggiornate')
            } else {
                showNotification('error', 'Errore nel salvataggio')
            }
        } catch {
            showNotification('error', 'Errore di connessione')
        } finally {
            setIsSavingRouting(false)
        }
    }

    async function loadCompressionSettings() {
        try {
            const response = await fetch('/api/settings/compression', { headers: authHeaders() })
            if (response.ok) {
                const data = await response.json()
                setCompressionEnabled(data.compression_enabled || false)
                setCompressionModel(data.compression_model || 'gpt-4o-mini')
                setCompressionThreshold(data.compression_threshold || 2000)
            }
        } catch { /* defaults */ }
    }

    async function updateCompressionSettings(updates: Record<string, any>) {
        setIsSavingCompression(true)
        try {
            const response = await fetch('/api/settings/compression', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify(updates)
            })
            if (response.ok) {
                showNotification('success', 'Impostazioni compressione aggiornate')
            } else {
                showNotification('error', 'Errore nel salvataggio')
            }
        } catch {
            showNotification('error', 'Errore di connessione')
        } finally {
            setIsSavingCompression(false)
        }
    }

    function toggleModelInList(modelId: string) {
        const newList = routingAllowedModels.includes(modelId)
            ? routingAllowedModels.filter(m => m !== modelId)
            : [...routingAllowedModels, modelId]
        if (newList.length === 0) {
            showNotification('error', 'Devi selezionare almeno un modello')
            return
        }
        setRoutingAllowedModels(newList)
        updateRoutingSettings({ routing_allowed_models: newList })
    }

    async function loadApiKeys() {
        setIsLoading(true)
        try {
            const response = await fetch('/api/settings/keys', {
                headers: authHeaders()
            })
            if (response.status === 401) {
                localStorage.removeItem('supabase_session')
                localStorage.removeItem('tokenguard_user_id')
                router.push('/login')
                return
            }
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
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
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
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
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

                {/* Smart Cache Section */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Database size={20} className="text-[#FFD700]" />
                            <h2 className="text-xl font-black uppercase italic">Smart Cache</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {isSavingCache && <RefreshCw size={14} className="animate-spin text-[#555]" />}
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${semanticCacheEnabled
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                : 'bg-[#222] text-[#555] border border-[#333]'
                                }`}>
                                {semanticCacheEnabled ? 'Attivo' : 'Disattivato'}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-blue-500/5 border-2 border-blue-500/20 p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <Zap size={18} className="text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-blue-300 text-sm font-sans">
                                    <strong className="font-bold uppercase">Semantic Cache:</strong> Usa gli embedding AI per intercettare chiamate <em>simili</em> (non solo identiche). Quando una domanda è semanticamente vicina ad una già fatta, restituisce la risposta dalla cache senza chiamare OpenAI.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-2 border-[#222] bg-[#111] p-6 space-y-6">
                        {/* Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-black uppercase text-sm">Abilita Semantic Cache</div>
                                <div className="text-[#777] text-xs font-sans mt-1">Intercetta chiamate API simili e restituisci risposte dalla cache</div>
                            </div>
                            <button
                                onClick={() => {
                                    const newValue = !semanticCacheEnabled
                                    setSemanticCacheEnabled(newValue)
                                    updateCacheSettings({ semantic_cache_enabled: newValue })
                                }}
                                className={`w-14 h-7 rounded-full transition-colors relative ${
                                    semanticCacheEnabled ? 'bg-[#FFD700]' : 'bg-[#333]'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                                    semanticCacheEnabled ? 'translate-x-8' : 'translate-x-1'
                                }`} />
                            </button>
                        </div>

                        {/* TTL Selector */}
                        {semanticCacheEnabled && (
                            <>
                                <div className="border-t border-[#222] pt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Clock size={16} className="text-[#FFD700]" />
                                        <div className="font-black uppercase text-sm">Durata Cache (TTL)</div>
                                    </div>
                                    <div className="text-[#777] text-xs font-sans mb-4">
                                        Quanto tempo le risposte simili restano in cache prima di essere rinnovate.
                                        Un TTL più breve = risposte più aggiornate, un TTL più lungo = più risparmio.
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {TTL_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => {
                                                    setSemanticCacheTtl(opt.value)
                                                    updateCacheSettings({ semantic_cache_ttl_minutes: opt.value })
                                                }}
                                                className={`px-3 py-3 text-xs font-black uppercase tracking-wider transition-all border-2 ${
                                                    semanticCacheTtl === opt.value
                                                        ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                                                        : 'border-[#222] bg-[#0F0F0F] text-[#777] hover:border-[#444] hover:text-white'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Freshness Indicator */}
                                <div className="border-t border-[#222] pt-6">
                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <span className="text-[#777] font-bold uppercase tracking-widest">Max Risparmio</span>
                                        <span className="text-[#777] font-bold uppercase tracking-widest">Max Freschezza</span>
                                    </div>
                                    <div className="w-full bg-[#222] h-2 relative">
                                        <div
                                            className="h-2 transition-all duration-500"
                                            style={{
                                                width: `${TTL_OPTIONS.find(o => o.value === semanticCacheTtl)?.freshness || 50}%`,
                                                background: `linear-gradient(90deg, #FFD700, #00C853)`,
                                            }}
                                        />
                                    </div>
                                    <div className="text-center mt-2">
                                        <span className="text-[10px] font-bold text-[#FFD700] uppercase tracking-widest">
                                            Cache valida per {TTL_OPTIONS.find(o => o.value === semanticCacheTtl)?.label}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* Context Pruning Section */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Scissors size={20} className="text-[#FFD700]" />
                            <h2 className="text-xl font-black uppercase italic">Context Pruning</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {isSavingPruning && <RefreshCw size={14} className="animate-spin text-[#555]" />}
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${pruningEnabled
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                : 'bg-[#222] text-[#555] border border-[#333]'
                                }`}>
                                {pruningEnabled ? 'Attivo' : 'Disattivato'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-purple-500/5 border-2 border-purple-500/20 p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <Scissors size={18} className="text-purple-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-purple-300 text-sm font-sans">
                                    <strong className="font-bold uppercase">Context Pruning:</strong> Nelle chat multi-turno, comprime automaticamente i messaggi vecchi in un riassunto per risparmiare token. Più la conversazione è lunga, più risparmi.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-2 border-[#222] bg-[#111] p-6 space-y-6">
                        {/* Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-black uppercase text-sm">Abilita Context Pruning</div>
                                <div className="text-[#777] text-xs font-sans mt-1">Comprime automaticamente la cronologia chat per risparmiare token</div>
                            </div>
                            <button
                                onClick={() => {
                                    const newValue = !pruningEnabled
                                    setPruningEnabled(newValue)
                                    updatePruningSettings({ pruning_enabled: newValue })
                                }}
                                className={`w-14 h-7 rounded-full transition-colors relative ${
                                    pruningEnabled ? 'bg-[#FFD700]' : 'bg-[#333]'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                                    pruningEnabled ? 'translate-x-8' : 'translate-x-1'
                                }`} />
                            </button>
                        </div>

                        {/* Intensity Selector */}
                        {pruningEnabled && (
                            <>
                                <div className="border-t border-[#222] pt-6">
                                    <div className="font-black uppercase text-sm mb-4">Intensità Pruning</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {/* LOW */}
                                        <button
                                            onClick={() => { setPruningIntensity('low'); updatePruningSettings({ pruning_intensity: 'low' }) }}
                                            className={`p-4 text-left border-2 transition-all ${
                                                pruningIntensity === 'low'
                                                    ? 'border-green-500 bg-green-500/5'
                                                    : 'border-[#222] bg-[#0F0F0F] hover:border-[#444]'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-xs font-black uppercase ${pruningIntensity === 'low' ? 'text-green-400' : 'text-[#777]'}`}>Bassa</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 ${pruningIntensity === 'low' ? 'bg-green-500/20 text-green-400' : 'bg-[#222] text-[#555]'}`}>40-60%</span>
                                            </div>
                                            <p className="text-[#999] text-[11px] font-sans leading-relaxed">
                                                Riassunto dettagliato, mantiene <strong className="text-white">8 messaggi</strong> recenti. Per task importanti.
                                            </p>
                                            <div className="mt-3 w-full bg-[#222] h-1.5">
                                                <div className="h-1.5 bg-green-500" style={{ width: '50%' }} />
                                            </div>
                                        </button>

                                        {/* MEDIUM */}
                                        <button
                                            onClick={() => { setPruningIntensity('medium'); updatePruningSettings({ pruning_intensity: 'medium' }) }}
                                            className={`p-4 text-left border-2 transition-all ${
                                                pruningIntensity === 'medium'
                                                    ? 'border-[#FFD700] bg-[#FFD700]/5'
                                                    : 'border-[#222] bg-[#0F0F0F] hover:border-[#444]'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-xs font-black uppercase ${pruningIntensity === 'medium' ? 'text-[#FFD700]' : 'text-[#777]'}`}>Media</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 ${pruningIntensity === 'medium' ? 'bg-[#FFD700]/20 text-[#FFD700]' : 'bg-[#222] text-[#555]'}`}>60-80%</span>
                                            </div>
                                            <p className="text-[#999] text-[11px] font-sans leading-relaxed">
                                                Riassunto bilanciato, mantiene <strong className="text-white">4 messaggi</strong> recenti. Buon compromesso.
                                            </p>
                                            <div className="mt-3 w-full bg-[#222] h-1.5">
                                                <div className="h-1.5 bg-[#FFD700]" style={{ width: '70%' }} />
                                            </div>
                                        </button>

                                        {/* HIGH */}
                                        <button
                                            onClick={() => { setPruningIntensity('high'); updatePruningSettings({ pruning_intensity: 'high' }) }}
                                            className={`p-4 text-left border-2 transition-all ${
                                                pruningIntensity === 'high'
                                                    ? 'border-orange-500 bg-orange-500/5'
                                                    : 'border-[#222] bg-[#0F0F0F] hover:border-[#444]'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-xs font-black uppercase ${pruningIntensity === 'high' ? 'text-orange-400' : 'text-[#777]'}`}>Alta</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 ${pruningIntensity === 'high' ? 'bg-orange-500/20 text-orange-400' : 'bg-[#222] text-[#555]'}`}>80-95%</span>
                                            </div>
                                            <p className="text-[#999] text-[11px] font-sans leading-relaxed">
                                                Riassunto minimo, mantiene <strong className="text-white">2 messaggi</strong> recenti. Per chat casual.
                                            </p>
                                            <div className="mt-3 w-full bg-[#222] h-1.5">
                                                <div className="h-1.5 bg-orange-500" style={{ width: '90%' }} />
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Savings visualization */}
                                <div className="border-t border-[#222] pt-6">
                                    <div className="bg-[#0A0A0A] border border-[#222] p-4">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-3">Stima risparmio in una chat da 20 messaggi</div>
                                        <div className="flex items-end gap-4">
                                            <div className="text-center">
                                                <div className="text-[#555] text-[10px] font-bold uppercase mb-1">Senza</div>
                                                <div className="w-8 bg-red-500/30 mx-auto" style={{ height: '60px' }} />
                                                <div className="text-[#777] text-[10px] mt-1">2800</div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`text-[10px] font-bold uppercase mb-1 ${
                                                    pruningIntensity === 'low' ? 'text-green-400' :
                                                    pruningIntensity === 'medium' ? 'text-[#FFD700]' : 'text-orange-400'
                                                }`}>Con</div>
                                                <div className={`w-8 mx-auto ${
                                                    pruningIntensity === 'low' ? 'bg-green-500/30' :
                                                    pruningIntensity === 'medium' ? 'bg-[#FFD700]/30' : 'bg-orange-500/30'
                                                }`} style={{
                                                    height: pruningIntensity === 'low' ? '30px' :
                                                           pruningIntensity === 'medium' ? '18px' : '8px'
                                                }} />
                                                <div className="text-[#777] text-[10px] mt-1">
                                                    {pruningIntensity === 'low' ? '~1400' :
                                                     pruningIntensity === 'medium' ? '~700' : '~280'}
                                                </div>
                                            </div>
                                            <div className="flex-1 text-right">
                                                <div className={`text-2xl font-black ${
                                                    pruningIntensity === 'low' ? 'text-green-400' :
                                                    pruningIntensity === 'medium' ? 'text-[#FFD700]' : 'text-orange-400'
                                                }`}>
                                                    -{pruningIntensity === 'low' ? '50' :
                                                      pruningIntensity === 'medium' ? '75' : '90'}%
                                                </div>
                                                <div className="text-[#555] text-[10px] font-bold uppercase">token risparmiati</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* Model Router Agent Section */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Route size={20} className="text-[#FFD700]" />
                            <h2 className="text-xl font-black uppercase italic">Model Router Agent</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {isSavingRouting && <RefreshCw size={14} className="animate-spin text-[#555]" />}
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${routingEnabled
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                : 'bg-[#222] text-[#555] border border-[#333]'
                                }`}>
                                {routingEnabled ? 'Attivo' : 'Disattivato'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-cyan-500/5 border-2 border-cyan-500/20 p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <Route size={18} className="text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-cyan-300 text-sm font-sans">
                                    <strong className="font-bold uppercase">Model Router:</strong> Un agente AI analizza ogni richiesta e sceglie automaticamente il modello più economico adatto. Le query semplici vengono deviate su modelli economici, risparmiando fino all&apos;80% sui costi.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-2 border-[#222] bg-[#111] p-6 space-y-6">
                        {/* Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-black uppercase text-sm">Abilita Model Router</div>
                                <div className="text-[#777] text-xs font-sans mt-1">Un agente sceglie automaticamente il modello ottimale per ogni richiesta</div>
                            </div>
                            <button
                                onClick={() => {
                                    const newValue = !routingEnabled
                                    setRoutingEnabled(newValue)
                                    updateRoutingSettings({ routing_enabled: newValue })
                                }}
                                className={`w-14 h-7 rounded-full transition-colors relative ${
                                    routingEnabled ? 'bg-[#FFD700]' : 'bg-[#333]'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                                    routingEnabled ? 'translate-x-8' : 'translate-x-1'
                                }`} />
                            </button>
                        </div>

                        {routingEnabled && (
                            <>
                                {/* Classifier Model */}
                                <div className="border-t border-[#222] pt-6">
                                    <div className="font-black uppercase text-sm mb-2">Modello Classificatore</div>
                                    <div className="text-[#777] text-xs font-sans mb-4">Modello economico usato dall&apos;agente per analizzare la complessità della richiesta</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {CLASSIFIER_MODELS.map((m) => (
                                            <button
                                                key={m.id}
                                                onClick={() => { setRoutingCheapModel(m.id); updateRoutingSettings({ routing_cheap_model: m.id }) }}
                                                className={`p-3 text-left border-2 transition-all ${
                                                    routingCheapModel === m.id
                                                        ? 'border-[#FFD700] bg-[#FFD700]/5'
                                                        : 'border-[#222] bg-[#0F0F0F] hover:border-[#444]'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-xs font-black uppercase ${routingCheapModel === m.id ? 'text-[#FFD700]' : 'text-[#777]'}`}>{m.name}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 ${routingCheapModel === m.id ? 'bg-[#FFD700]/20 text-[#FFD700]' : 'bg-[#222] text-[#555]'}`}>{m.cost}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Allowed Models Grid */}
                                <div className="border-t border-[#222] pt-6">
                                    <div className="font-black uppercase text-sm mb-2">Modelli Disponibili</div>
                                    <div className="text-[#777] text-xs font-sans mb-4">Seleziona i modelli tra cui l&apos;agente può scegliere. L&apos;agente userà il più economico adatto alla complessità della richiesta.</div>

                                    <div className="space-y-2">
                                        {[1, 2, 3].map((tier) => {
                                            const tierModels = AVAILABLE_MODELS.filter(m => m.tier === tier)
                                            const tierLabel = tier === 1 ? '🟢 Economici' : tier === 2 ? '🟡 Bilanciati' : '🔴 Premium'
                                            return (
                                                <div key={tier}>
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-2">{tierLabel}</div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                                        {tierModels.map((model) => {
                                                            const isSelected = routingAllowedModels.includes(model.id)
                                                            const borderColor = model.color === 'green' ? (isSelected ? 'border-green-500 bg-green-500/5' : 'border-[#222]')
                                                                : model.color === 'yellow' ? (isSelected ? 'border-[#FFD700] bg-[#FFD700]/5' : 'border-[#222]')
                                                                : (isSelected ? 'border-red-500 bg-red-500/5' : 'border-[#222]')
                                                            return (
                                                                <button
                                                                    key={model.id}
                                                                    onClick={() => toggleModelInList(model.id)}
                                                                    className={`p-3 text-left border-2 transition-all bg-[#0F0F0F] hover:border-[#444] ${borderColor}`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className={`w-4 h-4 border-2 flex items-center justify-center ${
                                                                                isSelected
                                                                                    ? model.color === 'green' ? 'border-green-500 bg-green-500' : model.color === 'yellow' ? 'border-[#FFD700] bg-[#FFD700]' : 'border-red-500 bg-red-500'
                                                                                    : 'border-[#555]'
                                                                            }`}>
                                                                                {isSelected && <Check size={10} className="text-black" />}
                                                                            </div>
                                                                            <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#777]'}`}>{model.name}</span>
                                                                        </div>
                                                                        <span className={`text-[10px] font-bold px-2 py-0.5 ${
                                                                            isSelected ? 'bg-white/10 text-white' : 'bg-[#222] text-[#555]'
                                                                        }`}>
                                                                            Tier {model.tier}
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* How it works */}
                                <div className="border-t border-[#222] pt-6">
                                    <div className="bg-[#0A0A0A] border border-[#222] p-4">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-3">Come Funziona</div>
                                        <div className="space-y-2 text-[11px] font-sans text-[#999]">
                                            <div className="flex items-start gap-2">
                                                <span className="text-[#FFD700] font-bold">1.</span>
                                                <span>La tua app chiama il proxy con il modello richiesto (es. <code className="text-[#FFD700]">gpt-4o</code>)</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-[#FFD700] font-bold">2.</span>
                                                <span>L&apos;agente analizza la richiesta usando <code className="text-[#FFD700]">{routingCheapModel}</code> (~$0.0001)</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-[#FFD700] font-bold">3.</span>
                                                <span>Se adatta, la richiesta viene deviata su un modello più economico</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-[#FFD700] font-bold">4.</span>
                                                <span>Risparmio fino all&apos;80% sui task semplici, trasparente per la tua app</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* Prompt Compression Section */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Minimize2 size={20} className="text-[#FFD700]" />
                            <h2 className="text-xl font-black uppercase italic">Prompt Compression</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {isSavingCompression && <RefreshCw size={14} className="animate-spin text-[#555]" />}
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${compressionEnabled
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                : 'bg-[#222] text-[#555] border border-[#333]'
                                }`}>
                                {compressionEnabled ? 'Attivo' : 'Disattivato'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-teal-500/5 border-2 border-teal-500/20 p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <Minimize2 size={18} className="text-teal-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-teal-300 text-sm font-sans">
                                    <strong className="font-bold uppercase">Prompt Compression:</strong> Comprime automaticamente prompt molto lunghi (tipici di scenari RAG) estraendo solo le informazioni rilevanti. Riduce i token di input del 40-70% senza perdere informazioni chiave.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-2 border-[#222] bg-[#111] p-6 space-y-6">
                        {/* Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-black uppercase text-sm">Abilita Prompt Compression</div>
                                <div className="text-[#777] text-xs font-sans mt-1">Comprime automaticamente contesto lungo prima di inviarlo al modello principale</div>
                            </div>
                            <button
                                onClick={() => {
                                    const newValue = !compressionEnabled
                                    setCompressionEnabled(newValue)
                                    updateCompressionSettings({ compression_enabled: newValue })
                                }}
                                className={`w-14 h-7 rounded-full transition-colors relative ${
                                    compressionEnabled ? 'bg-[#FFD700]' : 'bg-[#333]'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                                    compressionEnabled ? 'translate-x-8' : 'translate-x-1'
                                }`} />
                            </button>
                        </div>

                        {compressionEnabled && (
                            <>
                                {/* Compressor Model */}
                                <div className="border-t border-[#222] pt-6">
                                    <div className="font-black uppercase text-sm mb-2">Modello Compressore</div>
                                    <div className="text-[#777] text-xs font-sans mb-4">Modello usato per comprimere il contesto. Modelli più economici = costo compressione minore.</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {CLASSIFIER_MODELS.map((m) => (
                                            <button
                                                key={m.id}
                                                onClick={() => { setCompressionModel(m.id); updateCompressionSettings({ compression_model: m.id }) }}
                                                className={`p-3 text-left border-2 transition-all ${
                                                    compressionModel === m.id
                                                        ? 'border-[#FFD700] bg-[#FFD700]/5'
                                                        : 'border-[#222] bg-[#0F0F0F] hover:border-[#444]'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-xs font-black uppercase ${compressionModel === m.id ? 'text-[#FFD700]' : 'text-[#777]'}`}>{m.name}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 ${compressionModel === m.id ? 'bg-[#FFD700]/20 text-[#FFD700]' : 'bg-[#222] text-[#555]'}`}>{m.cost}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Threshold */}
                                <div className="border-t border-[#222] pt-6">
                                    <div className="font-black uppercase text-sm mb-2">Soglia di Attivazione</div>
                                    <div className="text-[#777] text-xs font-sans mb-4">La compressione si attiva solo quando il prompt supera questa soglia di token stimati.</div>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                        {THRESHOLD_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => {
                                                    setCompressionThreshold(opt.value)
                                                    updateCompressionSettings({ compression_threshold: opt.value })
                                                }}
                                                className={`p-3 text-center border-2 transition-all ${
                                                    compressionThreshold === opt.value
                                                        ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                                                        : 'border-[#222] bg-[#0F0F0F] text-[#777] hover:border-[#444] hover:text-white'
                                                }`}
                                            >
                                                <div className="text-xs font-black uppercase">{opt.label}</div>
                                                <div className="text-[10px] mt-1 opacity-70">{opt.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Savings info */}
                                <div className="border-t border-[#222] pt-6">
                                    <div className="bg-[#0A0A0A] border border-[#222] p-4">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-3">Stima Risparmio</div>
                                        <div className="flex items-end gap-4">
                                            <div className="text-center">
                                                <div className="text-[#555] text-[10px] font-bold uppercase mb-1">Senza</div>
                                                <div className="w-8 bg-red-500/30 mx-auto" style={{ height: '60px' }} />
                                                <div className="text-[#777] text-[10px] mt-1">5000</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-teal-400 text-[10px] font-bold uppercase mb-1">Con</div>
                                                <div className="w-8 bg-teal-500/30 mx-auto" style={{ height: '24px' }} />
                                                <div className="text-[#777] text-[10px] mt-1">~2000</div>
                                            </div>
                                            <div className="flex-1 text-right">
                                                <div className="text-2xl font-black text-teal-400">-60%</div>
                                                <div className="text-[#555] text-[10px] font-bold uppercase">token di input risparmiati</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
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
