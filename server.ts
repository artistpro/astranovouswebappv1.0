import express from 'express';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { calculateNatalChart } from './src/astrology/calculator';
import { calculateTransits } from './src/astrology/transits';
import { calculateSolarReturn } from './src/astrology/solarReturn';
import { CalculationRequest, AnalysisRequest, TransitRequest, SolarReturnRequest } from './src/types';
import { interpretationService } from './src/server/services/interpretationService';
import { fullProfileService } from './src/server/services/fullProfileService';
import { fileSearchService } from './src/server/services/fileSearchService';

// Configure multer for uploading documents to knowledge_docs
const uploadDir = path.join(process.cwd(), 'knowledge_docs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

async function startServer() {

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Health check API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', engine: 'Astronomy Engine + Swiss Ephemeris House Layer' });
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

  app.post('/api/knowledge/upload', upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se adjuntó ningún archivo.' });
      }

      const title = req.body.title || req.file.originalname;
      const author = req.body.author || 'Autor no especificado';

      const docMeta = fileSearchService.addDocument({
        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title,
        author,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date().toISOString()
      });

      return res.json({ success: true, document: docMeta });
    } catch (err: any) {
      console.error('Error uploading knowledge file:', err);
      return res.status(500).json({ error: 'Error al subir el archivo a la base documental.' });
    }
  });

  app.delete('/api/knowledge/documents/:id', (req, res) => {
    try {
      const id = req.params.id;
      const deleted = fileSearchService.deleteDocument(id);
      if (deleted) {
        return res.json({ success: true, id });
      } else {
        return res.status(404).json({ error: 'Documento no encontrado.' });
      }
    } catch (err: any) {
      console.error('Error deleting knowledge doc:', err);
      return res.status(500).json({ error: 'Error al eliminar el documento.' });
    }
  });

  // 5. Vite middleware for development or static serving for production

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Astrológico activo en puerto ${PORT}`);
  });
}

startServer();
