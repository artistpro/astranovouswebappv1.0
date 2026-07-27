import type { VercelRequest, VercelResponse } from '@vercel/node';
import { calculateNatalChart } from '../src/astrology/calculator';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const payload = req.body;
    if (!payload?.dateStr || !payload?.timeStr) {
      return res.status(400).json({ error: 'Faltan parámetros: dateStr y timeStr' });
    }
    const result = calculateNatalChart(payload);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[/api/calculate] error:', err);
    return res.status(500).json({
      error: 'Error en cálculo natal.',
      details: err?.message || String(err),
      stack: err?.stack?.split('\n').slice(0, 5),
    });
  }
}
