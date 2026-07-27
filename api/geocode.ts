import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const q = req.query?.q as string;
  if (!q) return res.status(400).json({ error: 'Parámetro "q" requerido.' });

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`;
    const response = await fetch(url, { headers: { 'User-Agent': 'AstraNovousApp/1.0' } });
    const data: any[] = await response.json();
    return res.status(200).json(data.map((item) => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    })));
  } catch (err: any) {
    return res.status(500).json({ error: 'Geocode error.', details: err?.message });
  }
}
