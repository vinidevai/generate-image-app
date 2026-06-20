import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import ChatInput from './components/ChatInput'
import ThemeToggle from './components/ThemeToggle'
import { fetchClients, requestCreatives, buildPayload } from './services/api'

let idSeq = 0
const nextId = () => `m_${Date.now()}_${idSeq++}`

export default function App() {
  // -------- Tema --------
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'dark',
  )
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  // -------- Clientes --------
  const [clients, setClients] = useState([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [selectedClient, setSelectedClient] = useState(null)

  useEffect(() => {
    fetchClients()
      .then((list) => {
        setClients(list)
        setSelectedClient(list[0] || null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingClients(false))
  }, [])

  // -------- Chat --------
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [showSafeZones, setShowSafeZones] = useState(false)
  const [error, setError] = useState(null)

  // Núcleo: monta o payload estruturado, dispara o POST e injeta a resposta.
  async function send({
    prompt,
    target = 'all',
    provided_copy = '',
    reference_image_base64 = null,
    reference_image_url = null, // preenchido só em alteração de um criativo específico
  }) {
    if (!selectedClient || loading) return
    setError(null)

    const payload = buildPayload({
      clientId: selectedClient.id,
      prompt,
      target,
      providedCopy: provided_copy,
      referenceImageBase64: reference_image_base64,
      targetImageUrl: reference_image_url,
    })

    // Eco do pedido do usuário no histórico (mostra os sinalizadores).
    setMessages((m) => [
      ...m,
      {
        id: nextId(),
        role: 'user',
        text: prompt,
        attachment: reference_image_base64 || reference_image_url,
        target: payload.target,
        providedCopy: payload.provided_copy,
        isAlteration: payload.request_type === 'alteration',
      },
    ])

    setLoading(true)
    setProgress('')
    try {
      const { images, copy } = await requestCreatives(payload, setProgress)
      setMessages((m) => [...m, { id: nextId(), role: 'assistant', images, copy }])
    } catch (err) {
      setError(err.message || 'Falha ao falar com o webhook.')
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        clients={clients}
        loadingClients={loadingClients}
        selectedClient={selectedClient}
        onSelectClient={(id) => setSelectedClient(clients.find((c) => c.id === id) || null)}
        showSafeZones={showSafeZones}
        onToggleSafeZones={() => setShowSafeZones((v) => !v)}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {selectedClient ? selectedClient.name : 'Criativos com IA'}
            </h2>
            <p className="text-[11px] text-slate-400">
              {showSafeZones ? 'Safe Zones ativas' : 'Solicite, visualize e itere'}
            </p>
          </div>
          <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
        </header>

        {/* Aviso de erro */}
        {error && (
          <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50 px-6 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertTriangle size={15} />
            {error}
          </div>
        )}

        <ChatArea
          messages={messages}
          loading={loading}
          loadingStatus={progress}
          showSafeZones={showSafeZones}
          onRequestAlteration={send}
        />

        <ChatInput onSend={send} disabled={!selectedClient || loadingClients} busy={loading} />
      </main>
    </div>
  )
}
