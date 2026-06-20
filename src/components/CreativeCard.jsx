import { useState } from 'react'
import { Wand2, Download, Send, X, Loader2 } from 'lucide-react'
import SafeZoneOverlay from './SafeZoneOverlay'

// Card de um único criativo gerado.
// Recebe a imagem, o estado global do toggle de safe zones e o
// callback para disparar um pedido de alteração atrelado a ELA.
export default function CreativeCard({ image, showSafeZones, onRequestAlteration, busy }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')

  const isStory = image.format === 'story'

  function submitAlteration() {
    const prompt = text.trim()
    if (!prompt) return
    onRequestAlteration({ prompt, reference_image_url: image.url })
    setText('')
    setEditing(false)
  }

  return (
    <div className="flex w-full max-w-[260px] flex-col gap-2">
      {/* Imagem + overlay */}
      <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <img
          src={image.url}
          alt="Criativo gerado por IA"
          loading="lazy"
          className="block w-full object-cover"
        />

        {showSafeZones && <SafeZoneOverlay format={image.format} />}

        {/* Badge do formato */}
        <span className="absolute left-2 top-2 z-20 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          {isStory ? 'Stories · 9:16' : 'Feed · 4:5'}
        </span>

        {/* Download rápido */}
        <a
          href={image.url}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="absolute right-2 top-2 z-20 rounded-md bg-black/60 p-1.5 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-black/80"
          title="Abrir / baixar"
        >
          <Download size={14} />
        </a>
      </div>

      {/* Ação: pedir alteração */}
      {!editing ? (
        <button
          onClick={() => setEditing(true)}
          disabled={busy}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
        >
          <Wand2 size={13} />
          Pedir alteração
        </button>
      ) : (
        <div className="animate-fade-in flex flex-col gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50/60 p-2 dark:border-indigo-500/40 dark:bg-indigo-500/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
              Ajuste neste criativo
            </span>
            <button
              onClick={() => setEditing(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          </div>
          <textarea
            autoFocus
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submitAlteration()
              }
            }}
            placeholder="Ex: deixe o fundo mais escuro e aumente o logo"
            className="resize-none rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            onClick={submitAlteration}
            disabled={busy || !text.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Enviar ajuste
          </button>
        </div>
      )}
    </div>
  )
}
