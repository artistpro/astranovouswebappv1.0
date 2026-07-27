import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    status: 'ok',
    engine: 'AstraNovous v1.0 – Astronomy Engine + VSOP87',
    timestamp: new Date().toISOString(),
  });
}
