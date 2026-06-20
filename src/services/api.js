import { CONFIG } from '../config'

// =============================================================
//  MOCK DE CLIENTES (simula o GET fictício)
// =============================================================
const MOCK_CLIENTS = [
  {
    id: 'cli_001',
    name: 'Burger House',
    logo: 'https://placehold.co/200x200/f97316/ffffff?text=BH',
    references: [
      'https://placehold.co/400x500/1f2937/f97316?text=Burger+1',
      'https://placehold.co/400x500/111827/fb923c?text=Burger+2',
      'https://placehold.co/400x500/0f172a/fdba74?text=Combo',
    ],
    palette: ['#f97316', '#1f2937', '#fbbf24'],
  },
  {
    id: 'cli_002',
    name: 'Studio Fit',
    logo: 'https://placehold.co/200x200/22c55e/ffffff?text=SF',
    references: [
      'https://placehold.co/400x500/052e16/22c55e?text=Fit+1',
      'https://placehold.co/400x500/064e3b/4ade80?text=Fit+2',
      'https://placehold.co/400x500/065f46/86efac?text=Plano',
    ],
    palette: ['#22c55e', '#052e16', '#a3e635'],
  },
  {
    id: 'cli_003',
    name: 'Bella Estética',
    logo: 'https://placehold.co/200x200/ec4899/ffffff?text=BE',
    references: [
      'https://placehold.co/400x500/500724/ec4899?text=Beauty+1',
      'https://placehold.co/400x500/831843/f472b6?text=Beauty+2',
      'https://placehold.co/400x500/9d174d/f9a8d4?text=Promo',
    ],
    palette: ['#ec4899', '#500724', '#f9a8d4'],
  },
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// -------------------------------------------------------------
//  GET /clients  → lista de clientes para o <select>
// -------------------------------------------------------------
export async function fetchClients() {
  if (CONFIG.USE_MOCK || !CONFIG.CLIENTS_ENDPOINT) {
    await sleep(600) // simula latência de rede
    return MOCK_CLIENTS
  }

  const res = await fetch(CONFIG.CLIENTS_ENDPOINT)
  if (!res.ok) throw new Error(`Falha ao buscar clientes (${res.status})`)
  return res.json()
}

// -------------------------------------------------------------
//  POST webhook (n8n)  → criação ou alteração de criativos
//  payload: { client_id, prompt, reference_image_base64?,
//             reference_image_url?, action_type }
//  retorno esperado: { images: [{ url, format }] }
// -------------------------------------------------------------
export async function requestCreatives(payload) {
  if (CONFIG.USE_MOCK || !CONFIG.WEBHOOK_URL) {
    // Simula o n8n loopando à espera dos predicts da IA.
    await sleep(3500)
    return mockGenerate(payload)
  }

  const res = await fetch(CONFIG.WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Webhook respondeu ${res.status}`)

  const data = await res.json()
  // Normaliza: aceita { images: [...] } ou um array cru de urls.
  const images = Array.isArray(data) ? data : data.images || []
  return images.map((img) =>
    typeof img === 'string' ? { url: img, format: guessFormat(img) } : img,
  )
}

// -------------------------------------------------------------
//  Geração simulada (placeholders nos formatos reais do Instagram)
// -------------------------------------------------------------
function mockGenerate(payload) {
  const isAlteration = payload.action_type === 'alteration'
  const stamp = Date.now()

  if (isAlteration) {
    // Alteração devolve 1 nova versão.
    return [
      {
        url: `https://placehold.co/1080x1350/0f172a/38bdf8?text=Ajuste+v2%0A${stamp % 1000}`,
        format: 'feed',
      },
    ]
  }

  // Criação devolve um mix de Feed (4:5) e Stories (9:16).
  return [
    {
      url: `https://placehold.co/1080x1350/1e293b/f8fafc?text=Feed+4:5%0A${stamp % 1000}`,
      format: 'feed',
    },
    {
      url: `https://placehold.co/1080x1350/0c4a6e/e0f2fe?text=Feed+4:5%0A${(stamp + 1) % 1000}`,
      format: 'feed',
    },
    {
      url: `https://placehold.co/1080x1920/172554/dbeafe?text=Story+9:16%0A${(stamp + 2) % 1000}`,
      format: 'story',
    },
  ]
}

function guessFormat(url) {
  // 1080x1920 = story (9:16); o resto tratamos como feed (4:5).
  return /1920|9.?16/.test(url) ? 'story' : 'feed'
}
