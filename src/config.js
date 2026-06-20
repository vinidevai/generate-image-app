// =============================================================
//  CONFIGURAÇÃO DOS WEBHOOKS / ENDPOINTS
// =============================================================
//  Troque os valores abaixo pelos seus webhooks reais do n8n.
//  O frontend NÃO fala com nenhuma IA diretamente — apenas com
//  estes endpoints, que fazem toda a orquestração.
// =============================================================

export const CONFIG = {
  // GET que retorna a lista de clientes. Resposta: [{ id, name }, ...].
  // Se ficar vazio, o app cai no MOCK em services/api.js.
  CLIENTS_ENDPOINT: 'https://webhooks.axlemarketingroup.online/webhook/br/clients',

  // POST do n8n que recebe o pedido estruturado (ver services/api.js -> buildPayload)
  // e devolve { images: [{ url, format }], copy }. Enquanto vazio, os criativos são simulados.
  WEBHOOK_URL: 'https://webhooks.axlemarketingroup.online/webhook/app/image-generation/request',

  // Master switch: quando true, ignora os endpoints acima e simula TUDO localmente.
  // Com false, cada chamada usa o endpoint real se ele estiver preenchido;
  // caso contrário (ex.: WEBHOOK_URL vazio), continua simulando só aquela parte.
  USE_MOCK: false,
}
