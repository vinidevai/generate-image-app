import { Building2, ChevronDown, Image as ImageIcon, Layers, Loader2, ScanEye } from 'lucide-react'

// Extrai iniciais do nome ignorando emojis/símbolos (ex.: "🚨  Iza Florentino" -> "IF").
function getInitials(name = '') {
  const parts = name
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
}

// Sidebar esquerda: configurações do cliente + controles globais.
export default function Sidebar({
  clients,
  loadingClients,
  selectedClient,
  onSelectClient,
  showSafeZones,
  onToggleSafeZones,
}) {
  return (
    <aside className="flex w-72 shrink-0 flex-col gap-5 overflow-y-auto border-r border-slate-200 bg-white p-5 scrollbar-thin dark:border-slate-800 dark:bg-slate-900">
      {/* Logo do app */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
          <Layers size={18} />
        </div>
        <div className="leading-tight">
          <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100">Creative Studio</h1>
          <p className="text-[11px] text-slate-400">IA · Tráfego Pago</p>
        </div>
      </div>

      {/* Seleção de cliente */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <Building2 size={13} />
          Cliente
        </label>

        <div className="relative">
          <select
            value={selectedClient?.id || ''}
            onChange={(e) => onSelectClient(e.target.value)}
            disabled={loadingClients}
            className="w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 pr-9 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-400 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {loadingClients && <option>Carregando…</option>}
            {!loadingClients && !clients.length && <option>Nenhum cliente</option>}
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {loadingClients ? <Loader2 size={15} className="animate-spin" /> : <ChevronDown size={15} />}
          </span>
        </div>
      </div>

      {/* Logo + identidade do cliente selecionado */}
      {selectedClient && (
        <div className="animate-fade-in flex flex-col gap-4">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            {selectedClient.logo ? (
              <img
                src={selectedClient.logo}
                alt={selectedClient.name}
                className="h-20 w-20 rounded-full border-2 border-white object-cover shadow dark:border-slate-700"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-2xl font-bold text-white shadow dark:border-slate-700">
                {getInitials(selectedClient.name)}
              </div>
            )}
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {selectedClient.name}
              </p>
              <p className="text-[11px] text-slate-400">{selectedClient.id}</p>
            </div>

            {/* Paleta da marca, se vier do GET */}
            {selectedClient.palette?.length > 0 && (
              <div className="flex gap-1.5">
                {selectedClient.palette.map((color) => (
                  <span
                    key={color}
                    className="h-5 w-5 rounded-full border border-white/50 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Referências visuais do cliente */}
          {selectedClient.references?.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <ImageIcon size={13} />
                Referências
              </span>
              <div className="grid grid-cols-3 gap-2">
                {selectedClient.references.map((ref, i) => (
                  <img
                    key={i}
                    src={ref}
                    alt={`Referência ${i + 1}`}
                    className="aspect-[4/5] w-full rounded-lg border border-slate-200 object-cover transition hover:scale-105 dark:border-slate-700"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Controle global de Safe Zones */}
      <div className="mt-auto flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex items-center gap-2">
          <ScanEye size={16} className="text-indigo-500" />
          <div className="leading-tight">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Safe Zones</p>
            <p className="text-[10px] text-slate-400">Simular UI do Instagram</p>
          </div>
        </div>
        <button
          onClick={onToggleSafeZones}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            showSafeZones ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <span
            className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
              showSafeZones ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </aside>
  )
}
