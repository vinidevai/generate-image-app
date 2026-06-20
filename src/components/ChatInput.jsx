import { useRef, useState } from 'react'
import {
  Paperclip,
  SendHorizontal,
  X,
  Loader2,
  LayoutGrid,
  Image as ImageIcon,
  Type,
  MessageSquareText,
} from 'lucide-react'

// Converte um File de imagem para Base64 (data URL).
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// O que o n8n deve gerar (vai no campo "target" do payload).
const TARGETS = [
  { id: 'all', label: 'Imagem + Copy', icon: LayoutGrid },
  { id: 'image_only', label: 'Só Imagem', icon: ImageIcon },
  { id: 'copy_only', label: 'Só Copy', icon: Type },
]

// Input principal: alvo + legenda opcional + texto + anexo.
export default function ChatInput({ onSend, disabled, busy }) {
  const [text, setText] = useState('')
  const [target, setTarget] = useState('all')
  const [providedCopy, setProvidedCopy] = useState('')
  const [showCopy, setShowCopy] = useState(false)
  const [attachment, setAttachment] = useState(null) // { name, base64 }
  const fileRef = useRef(null)
  const taRef = useRef(null)

  const copyOnly = target === 'copy_only'

  function autoGrow(el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Selecione um arquivo de imagem.')
      return
    }
    const base64 = await fileToBase64(file)
    setAttachment({ name: file.name, base64 })
    e.target.value = ''
  }

  function submit() {
    const prompt = text.trim()
    if (!prompt || disabled) return
    onSend({
      prompt,
      target,
      provided_copy: providedCopy.trim(),
      // Em "Só Copy" o anexo de imagem não faz sentido.
      reference_image_base64: copyOnly ? null : attachment?.base64 || null,
    })
    setText('')
    setAttachment(null)
    if (taRef.current) taRef.current.style.height = 'auto'
  }

  return (
    <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      {/* Controles: o que gerar + legenda pronta */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
          {TARGETS.map((t) => {
            const Icon = t.icon
            const active = target === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTarget(t.id)}
                disabled={disabled}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={13} />
                {t.label}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setShowCopy((v) => !v)}
          disabled={disabled}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-40 ${
            showCopy || providedCopy
              ? 'border-indigo-300 bg-indigo-50 text-indigo-600 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300'
              : 'border-slate-200 text-slate-500 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquareText size={13} />
          {providedCopy ? 'Legenda anexada' : 'Tenho a legenda'}
        </button>
      </div>

      {/* Campo de legenda pronta (provided_copy) */}
      {showCopy && (
        <div className="animate-fade-in mb-2">
          <textarea
            rows={2}
            value={providedCopy}
            onChange={(e) => setProvidedCopy(e.target.value)}
            placeholder="Cole aqui sua legenda/copy. Se deixar vazio, a IA gera para você."
            className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      )}

      {/* Preview do anexo */}
      {attachment && !copyOnly && (
        <div className="animate-fade-in mb-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-1 pl-1 pr-2 dark:border-slate-700 dark:bg-slate-800">
          <img src={attachment.base64} alt={attachment.name} className="h-9 w-9 rounded object-cover" />
          <span className="max-w-[160px] truncate text-xs text-slate-600 dark:text-slate-300">
            {attachment.name}
          </span>
          <button onClick={() => setAttachment(null)} className="text-slate-400 hover:text-rose-500">
            <X size={15} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-slate-50 p-2 transition focus-within:border-indigo-400 dark:border-slate-700 dark:bg-slate-800">
        {/* Anexar referência (oculto em "Só Copy") */}
        {!copyOnly && (
          <>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={disabled}
              title="Anexar imagem de referência"
              className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-indigo-600 disabled:opacity-40 dark:hover:bg-slate-700"
            >
              <Paperclip size={19} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </>
        )}

        {/* Texto expansível */}
        <textarea
          ref={taRef}
          rows={1}
          value={text}
          disabled={disabled}
          onChange={(e) => {
            setText(e.target.value)
            autoGrow(e.target)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder={
            disabled
              ? 'Selecione um cliente para começar…'
              : copyOnly
                ? 'Ex: escreva uma legenda para o combo de sexta-feira'
                : 'Ex: preciso de 3 criativos de hambúrguer para o final de semana'
          }
          className="max-h-[180px] flex-1 resize-none bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-slate-100"
        />

        {/* Enviar */}
        <button
          onClick={submit}
          disabled={disabled || busy || !text.trim()}
          title="Enviar"
          className="shrink-0 rounded-xl bg-indigo-600 p-2.5 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? <Loader2 size={19} className="animate-spin" /> : <SendHorizontal size={19} />}
        </button>
      </div>

      <p className="mt-1.5 px-1 text-[11px] text-slate-400">
        Enter envia · Shift+Enter quebra linha
      </p>
    </div>
  )
}
