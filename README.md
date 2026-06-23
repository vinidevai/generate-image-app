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

### 1. POST de geração (`WEBHOOK_URL`)

Payload estruturado — **todos os campos sempre presentes** para o n8n não precisar adivinhar.
Aqui "copy" = o **texto de gancho impresso na arte** (não legenda de post).

```json
{
  "request_id": "5f3e...uuid",       // UUID único por envio (trace + dedup)
  "client_id": "86b8bfyg0",
  "mode": "all",                    // "all" | "image_only" | "copy_only" | "alteration"
  "main_prompt": "Hambúrguer duplo artesanal para o fim de semana",
  "custom_copy": "Sabor em dobro nesta sexta!",  // null = a IA cria o gancho
  "attachments": ["data:image/png;base64,..."],  // referências; [] se nenhuma
  "target_image_url": null          // URL do criativo a iterar; só em mode="alteration"
}
```

| Campo | Quando preenche |
|---|---|
| `mode` | aba ativa (`all`/`image_only`/`copy_only`) ou `alteration` no botão "Pedir alteração" |
| `main_prompt` | sempre — texto da caixa principal |
| `custom_copy` | copy pronta do usuário, ou `null` p/ a IA gerar |
| `attachments` | data URLs base64 das referências; `[]` se nenhuma (vazio em `copy_only`) |
| `target_image_url` | só em `alteration` (a imagem que será iterada); `null` no resto |

**Resposta — dois modos aceitos:**
- **Assíncrono (recomendado):** responde na hora com `{ "job_id": "abc-123" }`. O app faz polling.
- **Síncrono:** responde direto com `{ "images": [...], "copy": "..." }`.

### 2. GET de status (`STATUS_ENDPOINT`) — polling do modo assíncrono

`GET STATUS_ENDPOINT?job_id=abc-123`, consultado a cada 15s:

```json
{ "status": "processing", "progress": "2/3" }
{ "status": "done", "images": [{ "url": "...", "format": "feed" }], "copy": "..." }
{ "status": "error", "error": "mensagem" }
```

`format`: `"feed"` (1080x1350) ou `"story"` (1080x1920). A normalização também aceita array cru de URLs.

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
