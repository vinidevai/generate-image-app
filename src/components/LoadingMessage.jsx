import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

// Estado de carregamento "elegante". Como o n8n pode demorar
// minutos (loop aguardando os predicts), mostramos mensagens
// rotativas para o processo não parecer travado.
const STEPS = [
  'Enviando briefing para o n8n…',
  'Gemini está interpretando o pedido…',
  'Gerando variações no Replicate…',
  'Aguardando os predicts da IA…',
  'Renderizando os criativos…',
  'Quase lá, finalizando os detalhes…',
]

export default function LoadingMessage() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length)
    }, 2800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="animate-fade-in flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
        <Sparkles size={16} className="animate-pulse-soft" />
      </div>
      <div className="flex flex-col gap-3 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />
        </div>
        <p className="text-sm text-slate-500 transition-all dark:text-slate-400">
          {STEPS[step]}
        </p>

        {/* Skeleton dos criativos que estão chegando */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-32 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
