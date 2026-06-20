import { useRef, useState } from 'react'
import { Paperclip, SendHorizontal, X, Loader2 } from 'lucide-react'

// Converte um File de imagem para Base64 (data URL).
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Input principal: textarea auto-expansível + anexo de referência.
export default function ChatInput({ onSend, disabled, busy }) {
  const [text, setText] = useState('')
  const [attachment, setAttachment] = useState(null) // { name, base64 }
  const fileRef = useRef(null)
  const taRef = useRef(null)

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
    e.target.value = '' // permite re-selecionar o mesmo arquivo
  }

  function submit() {
    const prompt = text.trim()
    if (!prompt || disabled) return
    onSend({ prompt, reference_image_base64: attachment?.base64 || null })
    setText('')
    setAttachment(null)
    if (taRef.current) taRef.current.style.height = 'auto'
  }

  return (
    <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      {/* Preview do anexo */}
      {attachment && (
        <div className="animate-fade-in mb-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-1 pl-1 pr-2 dark:border-slate-700 dark:bg-slate-800">
          <img
            src={attachment.base64}
            alt={attachment.name}
            className="h-9 w-9 rounded object-cover"
          />
          <span className="max-w-[160px] truncate text-xs text-slate-600 dark:text-slate-300">
            {attachment.name}
          </span>
          <button
            onClick={() => setAttachment(null)}
            className="text-slate-400 hover:text-rose-500"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-slate-50 p-2 transition focus-within:border-indigo-400 dark:border-slate-700 dark:bg-slate-800">
        {/* Anexar referência */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          title="Anexar imagem de referência"
          className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-indigo-600 disabled:opacity-40 dark:hover:bg-slate-700"
        >
          <Paperclip size={19} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />

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
