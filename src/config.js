// =============================================================
//  CONFIGURAÇÃO DOS WEBHOOKS / ENDPOINTS
// =============================================================
//  Troque os valores abaixo pelos seus webhooks reais do n8n.
//  O frontend NÃO fala com nenhuma IA diretamente — apenas com
//  estes endpoints, que fazem toda a orquestração.
// =============================================================

export const CONFIG = {
  // GET fictício que retorna a lista de clientes (id, nome, logo, referências).
  // Enquanto estiver vazio ou indisponível, o app usa o MOCK em services/api.js.
  CLIENTS_ENDPOINT: '',

  // POST do n8n que recebe { client_id, prompt, reference_image_base64, action_type }
  // e devolve { images: [{ url, format }] }.
  WEBHOOK_URL: '',

  // Quando true, ignora os endpoints acima e simula tudo localmente
  // (útil para testar o layout sem o n8n no ar).
  USE_MOCK: true,
}
