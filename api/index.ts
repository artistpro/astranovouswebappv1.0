import express from 'express';
import { calculateNatalChart } from '../src/astrology/calculator';
import { calculateTransits } from '../src/astrology/transits';
import { calculateSolarReturn } from '../src/astrology/solarReturn';
import { CalculationRequest, AnalysisRequest, TransitRequest, SolarReturnRequest } from '../src/types';
import { interpretationService } from '../src/server/services/interpretationService';
import { fullProfileService } from '../src/server/services/fullProfileService';
import { fileSearchService } from '../src/server/services/fileSearchService';

const app = express();
app.use(express.json());

// 1. Health check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', engine: 'Astronomy Engine + Swiss Ephemeris House Layer (Vercel Serverless)' });
});

// 2. Natal Chart calculation endpoint
app.post('/api/calculate', (req, res) => {
  try {
    const payload = req.body as CalculationRequest;
    if (!payload.dateStr || !payload.timeStr) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos: dateStr y timeStr' });
    }
    const result = calculateNatalChart(payload);
    return res.json(result);
  } catch (err: any) {
    console.error('API calculate error:', err);
    return res.status(500).json({
      error: 'Error interno en la ejecución del cálculo astrológico.',
      details: err?.message || String(err),
    });
  }
});

// 2.b Transits calculation endpoint
app.post('/api/transits', (req, res) => {
  try {
    const payload = req.body as TransitRequest;
    if (!payload.natalRequest) {
      return res.status(400).json({ error: 'Falta la propiedad natalRequest' });
    }
    const result = calculateTransits(payload);
    return res.json(result);
  } catch (err: any) {
    console.error('API transits error:', err);
    return res.status(500).json({
      error: 'Error interno en el cálculo de tránsitos.',
      details: err?.message || String(err),
    });
  }
});

// 2.c Solar Return calculation endpoint
app.post('/api/solar-return', (req, res) => {
  try {
    const payload = req.body as SolarReturnRequest;
    if (!payload.natalRequest || !payload.targetYear) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos: natalRequest y targetYear' });
    }
    const result = calculateSolarReturn(payload);
    return res.json(result);
  } catch (err: any) {
    console.error('API solar-return error:', err);
    return res.status(500).json({
      error: 'Error interno en el cálculo de Revolución Solar.',
      details: err?.message || String(err),
    });
  }
});

// 3. Geocoding endpoint using OpenStreetMap Nominatim
app.get('/api/geocode', async (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: 'Parámetro query "q" es requerido.' });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CalculadoraAstrologicaApp/1.0',
      },
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Error al contactar el servicio de geocodificación.' });
    }

    const data = await response.json();
    const results = data.map((item: any) => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));

    return res.json(results);
  } catch (err: any) {
    console.error('Geocode error:', err);
    return res.status(500).json({ error: 'Excepción al buscar ubicación.' });
  }
});

// 4. Documental Interpretation Analysis Endpoint
app.post('/api/interpretations/analyze', async (req, res) => {
  try {
    const payload = req.body as AnalysisRequest;
    if (!payload || !payload.selection) {
      return res.status(400).json({ error: 'Falta el objeto selection en la solicitud.' });
    }
    const result = await interpretationService.analyze(payload);
    return res.json(result);
  } catch (err: any) {
    console.error('Interpretation API error:', err);
    return res.status(500).json({
      error: 'Error al procesar la interpretación astrológica documental.',
      details: err?.message || String(err),
    });
  }
});

// 4b. Full General Natal Profile Endpoint
app.post('/api/full-profile', async (req, res) => {
  try {
    const chartData = req.body;
    if (!chartData || !chartData.planets || !chartData.normalizedData) {
      return res.status(400).json({ error: 'Faltan los datos del mapa natal (chartData) en la solicitud.' });
    }
    const profile = await fullProfileService.generateProfile(chartData);
    return res.json(profile);
  } catch (err: any) {
    console.error('Full Profile API error:', err);
    return res.status(500).json({
      error: 'Error al generar el perfil general natal.',
      details: err?.message || String(err),
    });
  }
});

// 5. Knowledge Base Document Management Endpoints
app.get('/api/knowledge/documents', (req, res) => {
  try {
    const docs = fileSearchService.getDocuments();
    return res.json({
      documents: docs,
      storeConfigured: fileSearchService.isConfigured(),
      fileSearchStoreId: fileSearchService.getFileSearchStoreId()
    });
  } catch (err: any) {
    console.error('Error fetching knowledge docs:', err);
    return res.status(500).json({ error: 'Error al obtener documentos.' });
  }
});

export default app;
