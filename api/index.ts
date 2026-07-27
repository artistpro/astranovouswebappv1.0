import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─────────────────────────────────────────────
// Minimal Vercel Serverless handler for all /api/* routes
// Only pure-math astronomy endpoints are included here.
// AI/knowledge services are NOT imported to avoid startup crashes.
// ─────────────────────────────────────────────

let calculateNatalChart: any = null;
let calculateTransits: any = null;
let calculateSolarReturn: any = null;
let loadError: string | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const calc = require('../src/astrology/calculator');
  calculateNatalChart = calc.calculateNatalChart;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const transits = require('../src/astrology/transits');
  calculateTransits = transits.calculateTransits;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sr = require('../src/astrology/solarReturn');
  calculateSolarReturn = sr.calculateSolarReturn;
} catch (err: any) {
  loadError = err?.message || String(err);
  console.error('[api/index] FATAL module load error:', err);
}

function setJsonHeaders(res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  setJsonHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';

  // Strip query string for route matching
  const pathname = url.split('?')[0];

  // ── Health check ──────────────────────────────
  if (pathname === '/api/health' || pathname === '/api') {
    return res.status(200).json({
      status: loadError ? 'error' : 'ok',
      engine: 'AstraNovous v1.0 – Astronomy Engine + VSOP87',
      loadError: loadError || undefined,
    });
  }

  // ── Module load guard ─────────────────────────
  if (loadError) {
    return res.status(500).json({
      error: 'El motor astrológico no pudo iniciarse.',
      details: loadError,
    });
  }

  // ── POST /api/calculate ───────────────────────
  if (pathname === '/api/calculate' && req.method === 'POST') {
    try {
      const payload = req.body;
      if (!payload?.dateStr || !payload?.timeStr) {
        return res.status(400).json({ error: 'Faltan parámetros: dateStr y timeStr' });
      }
      const result = calculateNatalChart(payload);
      return res.status(200).json(result);
    } catch (err: any) {
      console.error('[/api/calculate] error:', err);
      return res.status(500).json({ error: 'Error en cálculo natal.', details: err?.message || String(err) });
    }
  }

  // ── POST /api/transits ────────────────────────
  if (pathname === '/api/transits' && req.method === 'POST') {
    try {
      const payload = req.body;
      if (!payload?.natalRequest) {
        return res.status(400).json({ error: 'Falta natalRequest' });
      }
      const result = calculateTransits(payload);
      return res.status(200).json(result);
    } catch (err: any) {
      console.error('[/api/transits] error:', err);
      return res.status(500).json({ error: 'Error en tránsitos.', details: err?.message || String(err) });
    }
  }

  // ── POST /api/solar-return ────────────────────
  if (pathname === '/api/solar-return' && req.method === 'POST') {
    try {
      const payload = req.body;
      if (!payload?.natalRequest || !payload?.targetYear) {
        return res.status(400).json({ error: 'Faltan natalRequest y targetYear' });
      }
      const result = calculateSolarReturn(payload);
      return res.status(200).json(result);
    } catch (err: any) {
      console.error('[/api/solar-return] error:', err);
      return res.status(500).json({ error: 'Error en Revolución Solar.', details: err?.message || String(err) });
    }
  }

  // ── GET /api/geocode ──────────────────────────
  if (pathname === '/api/geocode' && req.method === 'GET') {
    const q = (req.query?.q as string) || '';
    if (!q) return res.status(400).json({ error: 'Parámetro "q" requerido.' });

    const fetchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`;
    return fetch(fetchUrl, { headers: { 'User-Agent': 'AstraNovousApp/1.0' } })
      .then((r) => r.json())
      .then((data: any[]) =>
        res.status(200).json(data.map((item) => ({
          name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        })))
      )
      .catch((err: any) => res.status(500).json({ error: 'Geocode error.', details: err?.message }));
  }

  // ── AI / Knowledge routes: stub (no GEMINI_API_KEY = skip) ──────────
  if (pathname.startsWith('/api/interpretations') || pathname.startsWith('/api/full-profile') || pathname.startsWith('/api/knowledge')) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY no configurada en Vercel Environment Variables.' });
    }
    // Lazy-load AI services only when API key is available
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { interpretationService } = require('../src/server/services/interpretationService');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { fullProfileService } = require('../src/server/services/fullProfileService');

      if (pathname === '/api/interpretations/analyze' && req.method === 'POST') {
        return interpretationService.analyze(req.body).then((r: any) => res.status(200).json(r));
      }
      if (pathname === '/api/full-profile' && req.method === 'POST') {
        return fullProfileService.generateProfile(req.body).then((r: any) => res.status(200).json(r));
      }
    } catch (err: any) {
      return res.status(500).json({ error: 'Error cargando servicios de IA.', details: err?.message });
    }
  }

  // ── Fallback ──────────────────────────────────
  return res.status(404).json({ error: `Ruta no encontrada: ${pathname}` });
}
