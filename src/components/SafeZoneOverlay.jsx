// =============================================================
//  SAFE ZONE OVERLAY
//  Simula a UI do Instagram por cima do criativo, escurecendo
//  as áreas onde a interface do app cobre a imagem.
//
//  - story (9:16): topo (perfil/status), rodapé (responder/likes)
//    e a coluna direita (botões de ação) ficam escurecidos.
//  - feed  (4:5):  topo (header) e base (legenda) levemente
//    escurecidos.
//
//  O centro permanece 100% visível = zona segura para o conteúdo.
// =============================================================

function ZoneLabel({ children, className = '' }) {
  return (
    <span
      className={`pointer-events-none select-none text-[10px] font-semibold uppercase tracking-wider text-white/85 drop-shadow ${className}`}
    >
      {children}
    </span>
  )
}

export default function SafeZoneOverlay({ format }) {
  if (format === 'story') {
    return (
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* Topo: barra do celular + perfil */}
        <div className="absolute inset-x-0 top-0 flex h-[14%] items-center justify-center bg-black/65 backdrop-blur-[1px]">
          <ZoneLabel>Topo · Status / Perfil</ZoneLabel>
        </div>

        {/* Rodapé: campo "Enviar mensagem" + curtidas */}
        <div className="absolute inset-x-0 bottom-0 flex h-[20%] items-end justify-center bg-black/65 pb-2 backdrop-blur-[1px]">
          <ZoneLabel>Rodapé · Responder / Likes</ZoneLabel>
        </div>

        {/* Coluna direita: botões de ação (curtir, compartilhar) */}
        <div className="absolute bottom-[20%] right-0 top-[14%] flex w-[16%] items-center justify-center bg-black/50">
          <ZoneLabel className="[writing-mode:vertical-rl] rotate-180">
            Ações
          </ZoneLabel>
        </div>

        {/* Contorno da zona segura */}
        <div className="absolute bottom-[20%] left-0 right-[16%] top-[14%] border border-dashed border-emerald-300/70" />
      </div>
    )
  }

  // Formato Feed (4:5)
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Topo: header do post (avatar + @usuario) */}
      <div className="absolute inset-x-0 top-0 flex h-[12%] items-center justify-center bg-black/45 backdrop-blur-[1px]">
        <ZoneLabel>Header do post</ZoneLabel>
      </div>

      {/* Base: ações + legenda */}
      <div className="absolute inset-x-0 bottom-0 flex h-[16%] items-end justify-center bg-black/50 pb-1.5 backdrop-blur-[1px]">
        <ZoneLabel>Ações / Legenda</ZoneLabel>
      </div>

      {/* Contorno da zona segura */}
      <div className="absolute inset-x-0 bottom-[16%] top-[12%] border border-dashed border-emerald-300/60" />
    </div>
  )
}
