import { Moon, Sun } from 'lucide-react'

// Switch dark/light controlado pelo App.
export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button
      onClick={onToggle}
      title={isDark ? 'Mudar para claro' : 'Mudar para escuro'}
      className="relative inline-flex h-8 w-14 items-center rounded-full border border-slate-300 bg-slate-200 px-1 transition-colors dark:border-slate-600 dark:bg-slate-700"
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-700 shadow transition-transform dark:bg-slate-900 dark:text-amber-300 ${
          isDark ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {isDark ? <Moon size={14} /> : <Sun size={14} />}
      </span>
    </button>
  )
}
