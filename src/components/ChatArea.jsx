import { useEffect, useRef } from 'react'
import { Sparkles, User, Wand2, ImagePlus } from 'lucide-react'
import CreativeCard from './CreativeCard'
import LoadingMessage from './LoadingMessage'

// Bolha do usuário (pedido enviado).
function UserMessage({ message }) {
  return (
    <div className="animate-fade-in flex items-start justify-end gap-3">
      <div className="flex max-w-[80%] flex-col items-end gap-2">
        {message.isAlteration && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
            <Wand2 size={11} /> Pedido de alteração
          </span>
        )}
        <div className="rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-2.5 text-sm text-white shadow-sm">
          {message.text}
        </div>
        {message.attachment && (
          <img
            src={message.attachment}
            alt="Referência enviada"
            className="max-h-40 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
          />
        )}
      </div>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
        <User size={16} />
      </div>
    </div>
  )
}

// Bolha do assistente (criativos gerados).
function AssistantMessage({ message, showSafeZones, onRequestAlteration, busy }) {
  return (
    <div className="animate-fade-in flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
        <Sparkles size={16} />
      </div>
      <div className="flex flex-col gap-3 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Prontinho! Gerei {message.images.length}{' '}
          {message.images.length === 1 ? 'criativo' : 'criativos'} para você 👇
        </p>
        <div className="flex flex-wrap gap-4">
          {message.images.map((img, i) => (
            <CreativeCard
              key={i}
              image={img}
              showSafeZones={showSafeZones}
              busy={busy}
              onRequestAlteration={(data) => onRequestAlteration(data)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Tela vazia inicial.
function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg">
        <ImagePlus size={30} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Vamos criar algo incrível
        </h2>
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Selecione um cliente, descreva o criativo que precisa e, se quiser, anexe uma
          imagem de referência. A IA cuida do resto.
        </p>
      </div>
    </div>
  )
}

export default function ChatArea({
  messages,
  loading,
  showSafeZones,
  onRequestAlteration,
  hasClient,
}) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const empty = messages.length === 0 && !loading

  return (
    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
      {empty ? (
        <EmptyState />
      ) : (
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {messages.map((msg) =>
            msg.role === 'user' ? (
              <UserMessage key={msg.id} message={msg} />
            ) : (
              <AssistantMessage
                key={msg.id}
                message={msg}
                showSafeZones={showSafeZones}
                onRequestAlteration={onRequestAlteration}
                busy={loading}
              />
            ),
          )}
          {loading && <LoadingMessage />}
          <div ref={endRef} />
        </div>
      )}
    </div>
  )
}
