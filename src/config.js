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

  // POST do n8n que recebe o pedido estruturado (ver services/api.js -> buildPayload).
  // Modo assíncrono (recomendado): responde na hora com { job_id }.
  // Modo síncrono: responde direto com { images, copy } — o app aceita os dois.
  WEBHOOK_URL: 'https://webhooks.axlemarketingroup.online/webhook/app/image-generation/request',

  // GET de status para o polling: STATUS_ENDPOINT?job_id=xxx
  // Deve devolver { status: "processing" | "done" | "error", images?, copy?, progress? }.
  STATUS_ENDPOINT: 'https://webhooks.axlemarketingroup.online/webhook/app/image-generation/status',

  // Cadência do polling.
  POLL_INTERVAL_MS: 15000, // consulta a cada 15s
  POLL_TIMEOUT_MS: 600000, // desiste após 10 min

  // Master switch: quando true, ignora os endpoints acima e simula TUDO localmente.
  // Com false, cada chamada usa o endpoint real se ele estiver preenchido;
  // caso contrário (ex.: WEBHOOK_URL vazio), continua simulando só aquela parte.
  USE_MOCK: false,
}
