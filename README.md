# Creative Studio · Dashboard de Criativos com IA

Dashboard interno para agência de tráfego: **solicitar, visualizar e pedir alterações** de criativos gerados por IA para o Instagram (Feed 4:5 e Stories 9:16).

> O frontend **não** conversa com nenhuma IA diretamente. Ele fala exclusivamente com os **Webhooks do n8n**, que orquestram o fluxo pesado (Gemini → Replicate → retorno).

🔗 **Demo (GitHub Pages):** https://vinidevai.github.io/generate-image-app/

## ✨ Funcionalidades

- **Interface estilo chat/feed de IA** com sidebar de configuração à esquerda.
- **Seleção de cliente** via `GET` (mock incluso) que popula logo, paleta e referências visuais.
- **Input expansível** com **anexo de imagem** convertido para **Base64** no estado do React.
- **Estado de carregamento elegante** com mensagens rotativas (o n8n pode demorar minutos).
- **Toggle "Safe Zones"**: aplica overlay simulando a UI do Instagram.
  - **Stories (9:16):** escurece topo, rodapé e coluna de ações — centro 100% livre.
  - **Feed (4:5):** escurece header e legenda.
- **Fluxo de iteração:** botão "Pedir alteração" abaixo de cada criativo, atrelado àquela imagem.
- **Dark / Light mode** com switch.
- Ícones com **lucide-react**, estilização com **Tailwind CSS**.

## 🔌 Contratos dos Webhooks

**Criação** (`action_type: "new"`):
```json
{ "client_id": "cli_001", "prompt": "3 criativos de hambúrguer", "reference_image_base64": "data:image/...", "action_type": "new" }
```

**Alteração** (`action_type: "alteration"`):
```json
{ "client_id": "cli_001", "prompt": "fundo mais escuro", "reference_image_url": "https://.../img.png", "action_type": "alteration" }
```

**Retorno esperado:** `{ "images": [{ "url": "...", "format": "feed" | "story" }] }` (também aceita um array cru de URLs).

## ⚙️ Configuração

Edite [`src/config.js`](src/config.js):

```js
export const CONFIG = {
  CLIENTS_ENDPOINT: 'https://seu-n8n/webhook/clients', // GET de clientes
  WEBHOOK_URL: 'https://seu-n8n/webhook/criativos',     // POST de criação/alteração
  USE_MOCK: false, // true = simula tudo localmente, sem n8n
}
```

Enquanto `USE_MOCK` for `true` (ou os endpoints estiverem vazios), o app roda 100% com dados simulados.

## 🚀 Rodar localmente

```bash
npm install
npm run dev      # ambiente de desenvolvimento
npm run build    # build de produção (pasta dist/)
```

## 📦 Stack

React 18 · Vite · Tailwind CSS · lucide-react · Deploy automático via GitHub Actions → GitHub Pages.
