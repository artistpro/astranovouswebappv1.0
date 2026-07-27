import type { VercelRequest, VercelResponse } from '@vercel/node';
import { calculateTransits } from '../src/astrology/transits.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const payload = req.body;
    if (!payload?.natalRequest) {
      return res.status(400).json({ error: 'Falta natalRequest' });
    }

    const result = calculateTransits(payload);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[/api/transits] error:', err);
    return res.status(500).json({
      error: 'Error en tránsitos.',
      details: err?.message || String(err),
    });
  }
}
