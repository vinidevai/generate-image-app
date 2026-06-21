import { CONFIG } from '../config'

// =============================================================
//  MOCK DE CLIENTES (fallback quando não há endpoint)
// =============================================================
const MOCK_CLIENTS = [
  { id: 'cli_001', name: 'Burger House' },
  { id: 'cli_002', name: 'Studio Fit' },
  { id: 'cli_003', name: 'Bella Estética' },
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// -------------------------------------------------------------
//  GET /clients  → lista de clientes para o <select>
//  Resposta esperada: [{ id, name, logo?, references?, palette? }]
// -------------------------------------------------------------
export async function fetchClients() {
  if (CONFIG.USE_MOCK || !CONFIG.CLIENTS_ENDPOINT) {
    await sleep(500)
    return MOCK_CLIENTS
  }

  const res = await fetch(CONFIG.CLIENTS_ENDPOINT)
  if (!res.ok) throw new Error(`Falha ao buscar clientes (${res.status})`)
  const data = await res.json()
  return Array.isArray(data) ? data : data.clients || []
}

// =============================================================
//  PAYLOAD ESTRUTURADO
//  Todos os campos vão SEMPRE presentes para o n8n não precisar
//  adivinhar nada (sinalizadores claros).
//
//  request_type: "new" | "alteration"
//  target:       "all" | "image_only" | "copy_only" | "specific_image"
//  provided_copy: legenda fornecida pelo usuário ("" = n8n gera)
//  target_image_url: só preenchido em "specific_image" (alteração)
//  reference_image_base64: anexo de referência ("new"), null se não houver
// =============================================================
export function buildPayload({
  clientId,
  prompt,
  target = 'all',
  providedCopy = '',
  referenceImageBase64 = null,
  targetImageUrl = '',
}) {
  const isAlteration = !!targetImageUrl
  return {
    client_id: clientId,
    request_type: isAlteration ? 'alteration' : 'new',
    target: isAlteration ? 'specific_image' : target,
    prompt,
    provided_copy: providedCopy || '',
    target_image_url: targetImageUrl || '',
    reference_image_base64: referenceImageBase64 || null,
  }
}

// -------------------------------------------------------------
//  POST webhook (n8n)  → criação / alteração de criativos
//  Aceita 2 modos de resposta:
//   - assíncrono: { job_id } → o app faz polling no STATUS_ENDPOINT
//   - síncrono:   { images, copy } direto na resposta do POST
//  Retorno normalizado: { images: [{ url, format }], copy }
//  onProgress(texto) é opcional e atualiza a mensagem de loading.
// -------------------------------------------------------------
export async function requestCreatives(payload, onProgress) {
  if (CONFIG.USE_MOCK || !CONFIG.WEBHOOK_URL) {
    await sleep(3200) // simula o n8n loopando à espera dos predicts
    return mockGenerate(payload)
  }

  const res = await fetch(CONFIG.WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Webhook respondeu ${res.status}`)

  const start = await parseJson(res)

  // Modo síncrono: o POST já trouxe o resultado completo.
  const immediate = normalizeResponse(start)
  if (immediate.images.length || immediate.copy) return immediate

  // Modo assíncrono: precisa de job_id para consultar o status.
  const jobId = start.job_id || start.jobId || start.id || start.executionId
  if (!jobId) {
    throw new Error(
      'O webhook não retornou job_id nem imagens. Configure a resposta imediata para devolver { "job_id": "..." }.',
    )
  }
  if (!CONFIG.STATUS_ENDPOINT) {
    throw new Error('STATUS_ENDPOINT não configurado para o polling.')
  }
  return pollStatus(jobId, onProgress)
}

// Consulta o STATUS_ENDPOINT a cada POLL_INTERVAL_MS até concluir/falhar.
async function pollStatus(jobId, onProgress) {
  const started = Date.now()
  const sep = CONFIG.STATUS_ENDPOINT.includes('?') ? '&' : '?'
  const url = `${CONFIG.STATUS_ENDPOINT}${sep}job_id=${encodeURIComponent(jobId)}`

  const DONE = ['done', 'completed', 'succeeded', 'success', 'ready']
  const FAIL = ['error', 'failed', 'canceled', 'cancelled']

  while (Date.now() - started < CONFIG.POLL_TIMEOUT_MS) {
    await sleep(CONFIG.POLL_INTERVAL_MS)

    let data
    try {
      const res = await fetch(url)
      // 404 = job ainda não registrado; 5xx = falha transitória → tenta de novo.
      if (res.status === 404 || res.status >= 500) continue
      if (!res.ok) throw new Error(`Status respondeu ${res.status}`)
      data = await parseJson(res)
    } catch {
      continue // tolera quedas de rede pontuais durante o loop
    }

    const status = String(data.status || '').toLowerCase()
    if (DONE.includes(status)) return normalizeResponse(data)
    if (FAIL.includes(status)) {
      throw new Error(data.error || data.message || 'A geração falhou no n8n.')
    }
    onProgress?.(data.progress || data.message || 'Processando os criativos…')
  }
  throw new Error('Tempo esgotado aguardando o resultado da geração (10 min).')
}

// Lê a resposta como JSON; se vier texto puro, embrulha como { copy }.
async function parseJson(res) {
  const raw = await res.text()
  try {
    return raw ? JSON.parse(raw) : {}
  } catch {
    return { copy: raw }
  }
}

// Normaliza qualquer formato de resposta para { images, copy }.
function normalizeResponse(data) {
  // n8n às vezes embrulha em [{...}] ou { data: {...} }
  if (Array.isArray(data)) {
    // Pode ser array de urls OU array com um objeto de resposta.
    if (data.length && typeof data[0] === 'object' && !data[0].url) {
      return normalizeResponse(data[0])
    }
    return { images: data.map(toImage).filter(Boolean), copy: '' }
  }
  if (data?.data) return normalizeResponse(data.data)

  // Aceita "output" do Replicate (string única ou array de URLs),
  // além de "images"/"urls". Assim o Respond do n8n vira quase passthrough.
  let rawImages = data.images || data.urls || data.output || []
  if (typeof rawImages === 'string') rawImages = [rawImages]
  if (!Array.isArray(rawImages)) rawImages = []

  return {
    images: rawImages.map(toImage).filter(Boolean),
    copy: data.copy || data.caption || data.text || '',
  }
}

function toImage(img) {
  if (!img) return null
  if (typeof img === 'string') return { url: img, format: guessFormat(img) }
  const url = img.url || img.image_url || img.src
  if (!url) return null
  return { url, format: img.format || guessFormat(url) }
}

function guessFormat(url = '') {
  return /1920|9.?16|story|stories/i.test(url) ? 'story' : 'feed'
}

// -------------------------------------------------------------
//  Geração simulada — respeita o target escolhido.
// -------------------------------------------------------------
function mockGenerate(payload) {
  const stamp = Date.now() % 1000
  const copy = `Sabor em dobro nesta sexta! 🍔🔥 #${payload.client_id}`

  if (payload.target === 'copy_only') {
    return { images: [], copy: payload.provided_copy || copy }
  }
  if (payload.target === 'specific_image') {
    return {
      images: [
        { url: `https://placehold.co/1080x1350/0f172a/38bdf8?text=Ajuste+v2%0A${stamp}`, format: 'feed' },
      ],
      copy: '',
    }
  }

  const images = [
    { url: `https://placehold.co/1080x1350/1e293b/f8fafc?text=Feed+4:5%0A${stamp}`, format: 'feed' },
    { url: `https://placehold.co/1080x1350/0c4a6e/e0f2fe?text=Feed+4:5%0A${stamp + 1}`, format: 'feed' },
    { url: `https://placehold.co/1080x1920/172554/dbeafe?text=Story+9:16%0A${stamp + 2}`, format: 'story' },
  ]

  if (payload.target === 'image_only') return { images, copy: '' }
  return { images, copy: payload.provided_copy || copy } // "all"
}
