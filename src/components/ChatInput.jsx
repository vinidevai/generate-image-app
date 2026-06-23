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

// O que o n8n deve gerar (vai no campo "mode" do payload).
const MODES = [
  { id: 'all', label: 'Imagem + Copy', icon: LayoutGrid },
  { id: 'image_only', label: 'Só Imagem', icon: ImageIcon },
  { id: 'copy_only', label: 'Só Copy', icon: Type },
]

// Input principal: modo + copy pronta + prompt + anexos (referências).
export default function ChatInput({ onSend, disabled, busy }) {
  const [text, setText] = useState('')
  const [mode, setMode] = useState('all')
  const [customCopy, setCustomCopy] = useState('')
  const [showCopy, setShowCopy] = useState(false)
  const [attachments, setAttachments] = useState([]) // [{ name, base64 }]
  const fileRef = useRef(null)
  const taRef = useRef(null)

  const copyOnly = mode === 'copy_only'

  function autoGrow(el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'))
    const loaded = await Promise.all(
      files.map(async (f) => ({ name: f.name, base64: await fileToBase64(f) })),
    )
    setAttachments((prev) => [...prev, ...loaded])
    e.target.value = '' // permite re-selecionar o mesmo arquivo
  }

  function removeAttachment(i) {
    setAttachments((prev) => prev.filter((_, idx) => idx !== i))
  }

  function submit() {
    const prompt = text.trim()
    if (!prompt || disabled) return
    onSend({
      mode,
      main_prompt: prompt,
      custom_copy: customCopy.trim(),
      // Em "Só Copy" não faz sentido enviar referência de imagem.
      attachments: copyOnly ? [] : attachments.map((a) => a.base64),
    })
    setText('')
    setAttachments([])
    if (taRef.current) taRef.current.style.height = 'auto'
  }

  return (
    <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      {/* Controles: o que gerar + copy pronta */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
          {MODES.map((t) => {
            const Icon = t.icon
            const active = mode === t.id
            return (
              <button
                key={t.id}
                onClick={() => setMode(t.id)}
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
            showCopy || customCopy
              ? 'border-indigo-300 bg-indigo-50 text-indigo-600 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300'
              : 'border-slate-200 text-slate-500 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquareText size={13} />
          {customCopy ? 'Copy anexada' : 'Tenho a Copy'}
        </button>
      </div>

      {/* Campo de copy pronta (custom_copy = o gancho impresso na arte) */}
      {showCopy && (
        <div className="animate-fade-in mb-2">
          <textarea
            rows={2}
            value={customCopy}
            onChange={(e) => setCustomCopy(e.target.value)}
            placeholder="Cole aqui a copy — o texto de gancho que vai impresso na arte. Vazio = a IA cria."
            className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      )}

      {/* Previews dos anexos */}
      {!copyOnly && attachments.length > 0 && (
        <div className="animate-fade-in mb-2 flex flex-wrap gap-2">
          {attachments.map((a, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-1 pl-1 pr-2 dark:border-slate-700 dark:bg-slate-800"
            >
              <img src={a.base64} alt={a.name} className="h-9 w-9 rounded object-cover" />
              <span className="max-w-[140px] truncate text-xs text-slate-600 dark:text-slate-300">
                {a.name}
              </span>
              <button onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-rose-500">
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-slate-50 p-2 transition focus-within:border-indigo-400 dark:border-slate-700 dark:bg-slate-800">
        {/* Anexar referências (oculto em "Só Copy") */}
        {!copyOnly && (
          <>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={disabled}
              title="Anexar imagem(ns) de referência"
              className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-indigo-600 disabled:opacity-40 dark:hover:bg-slate-700"
            >
              <Paperclip size={19} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
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
                ? 'Ex: crie o gancho para o combo de sexta-feira'
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
